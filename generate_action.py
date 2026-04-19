# 配置：填写每个仓库的本地路径和 GitHub 仓库名
REPOS = [
    {'local': './ProjectSekai-story', 'repo': 'ProjectSekai-story'},
    {'local': './BangDream-story', 'repo': 'BangDream-story'},
]

import generate

generate.main(REPOS)
