import { HOME_EXTRA, PROXY_PREFIX, type HomeExtraItem } from '../config';

/* 外链图标 */
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/* 下载图标 */
function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function getIconType(text: string): 'download' | 'link' {
  if (text.includes('下载')) return 'download';
  return 'link';
}

export function HomeExtra() {
  return (
    <div id="home-extra">
      {HOME_EXTRA.map((item: HomeExtraItem, i: number) => {
        if (item.url) {
          const href = item.useProxy ? PROXY_PREFIX + item.url : item.url;
          const icon = getIconType(item.text);
          return (
            <a key={i} className="home-link" href={href} target="_blank" rel="noreferrer noopener">
              <span className={`dir-icon ${icon}`}>
                {icon === 'download' ? <DownloadIcon /> : <LinkIcon />}
              </span>
              <span className="dir-name">{item.text}</span>
            </a>
          );
        }
        return (
          <div key={i} className="extra-text">
            {item.text}
          </div>
        );
      })}
    </div>
  );
}

export { HOME_EXTRA_POSITION } from '../config';
