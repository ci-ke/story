import { useState, useEffect, useCallback } from 'react';
import { OWNER, BRANCH, PROXY_PREFIX, REPOS } from '../config';

interface FileViewProps {
  filePath: string;
  proxyEnabled: boolean;
  wrapEnabled: boolean;
}

export function FileView({ filePath, proxyEnabled, wrapEnabled }: FileViewProps) {
  const [content, setContent] = useState('加载中...');
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback(async () => {
    setContent('加载中...');
    setError(null);

    try {
      const topLevel = filePath.split('/')[0];
      if (!REPOS[topLevel]) throw new Error('未知仓库：' + topLevel);

      const repoFilePath = filePath.split('/').slice(1).join('/');
      const rawBase = 'https://raw.githubusercontent.com';
      const baseURL = proxyEnabled ? PROXY_PREFIX + rawBase : rawBase;
      const rawURL = `${baseURL}/${OWNER}/${topLevel}/${BRANCH}/${repoFilePath}`;

      const res = await fetch(rawURL);
      if (!res.ok) throw new Error('HTTP ' + res.status);

      const text = await res.text();
      // 转义 HTML 并自动链接 URL
      const urlRegex = /https?:\/\/[^\s）)】」』\]\[）)\],，。！？]+/g;
      const html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(urlRegex, (m) => {
          return `<a href="${m}" target="_blank" rel="noreferrer noopener" style="word-break:break-all">${m}</a>`;
        });
      setContent(html);
    } catch (e) {
      setError('加载失败：' + (e as Error).message);
    }
  }, [filePath, proxyEnabled]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  return (
    <div
      id="content"
      className={wrapEnabled ? '' : 'nowrap'}
      dangerouslySetInnerHTML={error ? undefined : { __html: content }}
    >
      {error ? error : undefined}
    </div>
  );
}
