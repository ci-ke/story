import { REPOS } from '../config';
import { HomeExtra, HOME_EXTRA_POSITION } from './HomeExtra';
import type { Node } from '../types';

interface DirListProps {
  path: string;
  children: Node[];
}

export function DirList({ path, children }: DirListProps) {
  const isHome = !path;
  const showExtra = isHome;

  // 首页只显示 REPOS 中定义的仓库，其他页面显示全部
  const filtered = isHome
    ? children.filter((item) => REPOS[item.name])
    : children;

  // 排序：首页按 REPOS 定义顺序，其他页面目录优先然后按名称
  const repoOrder = Object.keys(REPOS);
  const sorted = [...filtered].sort((a, b) => {
    if (isHome) {
      return repoOrder.indexOf(a.name) - repoOrder.indexOf(b.name);
    }
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'dir' ? -1 : 1;
  });

  return (
    <div id="list">
      {showExtra && HOME_EXTRA_POSITION === 'top' && (
        <>
          <HomeExtra />
          <hr />
        </>
      )}
      {sorted.map((item) => {
        const itemPath = path ? path + '/' + item.name : item.name;
        const displayName = isHome && REPOS[item.name] ? REPOS[item.name] : item.name;
        return (
          <a key={itemPath} href={'#' + itemPath.replace(/#/g, '%23')}>
            {item.type === 'dir' ? '📁 ' + displayName : '📄 ' + displayName}
          </a>
        );
      })}
      {showExtra && HOME_EXTRA_POSITION === 'bottom' && (
        <>
          <hr />
          <HomeExtra />
        </>
      )}
    </div>
  );
}
