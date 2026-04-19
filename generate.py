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


OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'file_list.json')


def scan(path: str) -> list[Node]:
    result: list[Node] = []
    for name in sorted(os.listdir(path)):
        full = os.path.join(path, name)
        if os.path.isdir(full):
            children = scan(full)
            result.append({'type': 'dir', 'name': name, 'children': children})
        else:
            result.append({'type': 'file', 'name': name})
    return result


def main(repos: list[dict[str, str]]) -> None:
    tree = []
    for conf in repos:
        local, repo = conf['local'], conf['repo']
        children = []
        for name in sorted(os.listdir(local)):
            if name.startswith('story') and os.path.isdir(os.path.join(local, name)):
                sub = scan(os.path.join(local, name))
                children.append({'type': 'dir', 'name': name, 'children': sub})
        tree.append({'type': 'dir', 'name': repo, 'children': children})

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(tree, f, ensure_ascii=False, indent=0)

    print(f'生成完成，输出：{OUTPUT}')
    for entry in tree:
        print(f'  {entry["name"]}: {len(entry["children"])} 个顶层文件夹')


if __name__ == '__main__':
    from config import REPOS

    main(REPOS)
