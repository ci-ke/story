import { useState, useEffect, useCallback, useRef } from 'react';
import { OWNER, BRANCH, PROXY_PREFIX, REPOS } from '../config';

interface FileViewProps {
  filePath: string;
  proxyEnabled: boolean;
  wrapEnabled: boolean;
  onWrapChange: (v: boolean) => void;
  onProxyChange: (v: boolean) => void;
}

export function FileView({
  filePath,
  proxyEnabled,
  wrapEnabled,
  onWrapChange,
  onProxyChange,
}: FileViewProps) {
  const [content, setContent] = useState('');
  const rawTextRef = useRef('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const text = rawTextRef.current;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);

  const loadFile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setContent('');

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
      rawTextRef.current = text;
      const urlRegex = /https?:\/\/[^\s）)】」』\]\[）)\],，。！？]+/g;
      const html = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(urlRegex, (m) => {
          return `<a href="${m}" target="_blank" rel="noreferrer noopener">${m}</a>`;
        });
      setContent(html);
    } catch (e) {
      setError('加载失败：' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filePath, proxyEnabled]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  if (loading) {
    return (
      <div id="loading">
        <div className="spinner" />
        <span>加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div id="error">
        <div className="error-icon">!</div>
        <div>{error}</div>
      </div>
    );
  }

  const hasText = !!rawTextRef.current;

  return (
    <>
      <div id="toolbar">
        <label className="toggle">
          <input
            type="checkbox"
            checked={wrapEnabled}
            onChange={(e) => onWrapChange(e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-label">自动换行</span>
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={proxyEnabled}
            onChange={(e) => onProxyChange(e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-label">国内加速</span>
        </label>
        <span style={{ flex: 1 }} />
        <button className="copy-btn" onClick={handleCopy} disabled={!hasText}>
          {copied ? '已复制' : '复制全文'}
        </button>
      </div>
      <div
        id="content"
        className={wrapEnabled ? '' : 'nowrap'}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
