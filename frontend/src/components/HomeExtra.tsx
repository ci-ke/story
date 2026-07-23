import { HOME_EXTRA, HOME_EXTRA_POSITION, PROXY_PREFIX, type HomeExtraItem } from '../config';

export function HomeExtra() {
  return (
    <div id="home-extra">
      {HOME_EXTRA.map((item: HomeExtraItem, i: number) => {
        if (item.url) {
          const href = item.useProxy ? PROXY_PREFIX + item.url : item.url;
          return (
            <a key={i} href={href} target="_blank" rel="noreferrer noopener">
              {'🔗 ' + item.text}
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

export { HOME_EXTRA_POSITION };
