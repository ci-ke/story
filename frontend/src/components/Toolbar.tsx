import { useState, useCallback, type RefObject } from 'react';

interface ToolbarProps {
  wrapEnabled: boolean;
  proxyEnabled: boolean;
  rawTextRef: RefObject<string>;
  onWrapChange: (v: boolean) => void;
  onProxyChange: (v: boolean) => void;
}

export function Toolbar({
  wrapEnabled,
  proxyEnabled,
  rawTextRef,
  onWrapChange,
  onProxyChange,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false);
  const hasText = !!rawTextRef.current;

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
  }, [rawTextRef]);

  return (
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
  );
}
