import os, json
from typing import TypedDict


class FileNode(TypedDict):
    type: str
    name: str


class DirNode(TypedDict):
    type: str
    name: str
    children: list['Node']


Node = FileNode | DirNode

# 输出根目录
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'file_list')


def scan_simple(path: str) -> list[Node]:
    """简单扫描，不拆分文件"""
    result: list[Node] = []
    for name in sorted(os.listdir(path)):
        full = os.path.join(path, name)
        if os.path.isdir(full):
            children = scan_simple(full)
            result.append({'type': 'dir', 'name': name, 'children': children})
        else:
            result.append({'type': 'file', 'name': name})
    return result


def scan_with_split(path: str, output_dir: str, remaining_depth: int) -> list[Node]:
    """
    扫描目录并根据剩余深度决定是否拆分

    Args:
        path: 当前扫描的物理路径
        output_dir: 当前层级对应的输出目录
        remaining_depth: 剩余深度（1 表示当前层的子目录是拆分点）

    Returns:
        当前层级的节点列表（拆分点的目录只有 name，没有 children）
    """
    result: list[Node] = []

    for name in sorted(os.listdir(path)):
        full = os.path.join(path, name)

        if os.path.isdir(full):
            sub_output_dir = os.path.join(output_dir, name)
            if remaining_depth == 1:
                # 当前子目录是拆分点，写入独立的 file_list.json
                os.makedirs(sub_output_dir, exist_ok=True)
                children = scan_simple(full)
                with open(
                    os.path.join(sub_output_dir, 'file_list.json'),
                    'w',
                    encoding='utf-8',
                ) as f:
                    json.dump(children, f, ensure_ascii=False, indent=0)
                result.append({'type': 'dir', 'name': name})
            else:
                # 还未到拆分层，继续递归
                children = scan_with_split(full, sub_output_dir, remaining_depth - 1)
                result.append({'type': 'dir', 'name': name, 'children': children})
        else:
            result.append({'type': 'file', 'name': name})

    return result


def main(
    repos: list[dict[str, str]],
    depth: int = 2,
    repo_dir_prefixes: list[str] | None = None,
) -> None:
    """
    生成分层的文件列表

    depth 表示拆分发生在第几层目录（从仓库根目录算起，从 1 开始）：
        - 0: 所有内容在 file_list/file_list.json（不拆分）
        - 1: 在仓库层拆分，每个仓库一个 file_list.json
             file_list/ProjectSekai-story/file_list.json 包含该仓库全部内容
        - 2: 在 story_cn/story_jp 层拆分（默认）
             file_list/ProjectSekai-story/story_cn/file_list.json 包含该语言版本全部内容
        - 3: 在 area/card/event 层拆分
             file_list/ProjectSekai-story/story_cn/area/file_list.json 包含该目录全部内容

    repo_dir_prefixes: 仓库根目录下合法的子目录前缀列表
        - None: 使用默认值 ['story']
        - []: 不过滤，所有子目录都合法
        - ['story', 'other']: 只扫描以 'story' 或 'other' 开头的子目录
    """
    if repo_dir_prefixes is None:
        repo_dir_prefixes = ['story']

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    def is_valid_repo_dir(name: str) -> bool:
        if not repo_dir_prefixes:
            return True
        return any(name.startswith(p) for p in repo_dir_prefixes)

    tree = []

    for conf in repos:
        local, repo = conf['local'], conf['repo']
        repo_output_dir = os.path.join(OUTPUT_DIR, repo)

        # 只扫描合法前缀的子目录
        story_dirs = sorted(
            name
            for name in os.listdir(local)
            if is_valid_repo_dir(name) and os.path.isdir(os.path.join(local, name))
        )

        if depth == 0:
            # 不拆分，全部内容内联
            children = []
            for name in story_dirs:
                sub = scan_simple(os.path.join(local, name))
                children.append({'type': 'dir', 'name': name, 'children': sub})
            tree.append({'type': 'dir', 'name': repo, 'children': children})

        elif depth == 1:
            # 仓库层拆分：每个仓库写一个 file_list.json，顶层只有仓库名
            os.makedirs(repo_output_dir, exist_ok=True)
            children = []
            for name in story_dirs:
                sub = scan_simple(os.path.join(local, name))
                children.append({'type': 'dir', 'name': name, 'children': sub})
            with open(
                os.path.join(repo_output_dir, 'file_list.json'), 'w', encoding='utf-8'
            ) as f:
                json.dump(children, f, ensure_ascii=False, indent=0)
            tree.append({'type': 'dir', 'name': repo})

        else:
            # depth >= 2：仓库信息保留在顶层树中，在 story_cn/jp 层或更深层拆分
            repo_children = []
            for name in story_dirs:
                story_path = os.path.join(local, name)
                story_output_dir = os.path.join(repo_output_dir, name)
                if depth == 2:
                    # story_cn/jp/tw 是拆分点
                    os.makedirs(story_output_dir, exist_ok=True)
                    sub = scan_simple(story_path)
                    with open(
                        os.path.join(story_output_dir, 'file_list.json'),
                        'w',
                        encoding='utf-8',
                    ) as f:
                        json.dump(sub, f, ensure_ascii=False, indent=0)
                    repo_children.append({'type': 'dir', 'name': name})
                else:
                    # depth >= 3：继续向下拆分
                    sub = scan_with_split(story_path, story_output_dir, depth - 2)
                    repo_children.append({'type': 'dir', 'name': name, 'children': sub})
            tree.append({'type': 'dir', 'name': repo, 'children': repo_children})

    # 写入顶层 file_list.json
    output_file = os.path.join(OUTPUT_DIR, 'file_list.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(tree, f, ensure_ascii=False, indent=0)

    print(f'生成完成，深度={depth}')
    print(f'顶层输出：{output_file}')
    file_count = sum(
        1 for dirpath, _, files in os.walk(OUTPUT_DIR) if 'file_list.json' in files
    )
    print(f'共生成 {file_count} 个 file_list.json 文件')


if __name__ == '__main__':
    from config import REPOS

    main(REPOS)
