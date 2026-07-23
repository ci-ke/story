interface ToolbarProps {
  wrapEnabled: boolean;
  proxyEnabled: boolean;
  onWrapChange: (v: boolean) => void;
  onProxyChange: (v: boolean) => void;
}

export function Toolbar({
  wrapEnabled,
  proxyEnabled,
  onWrapChange,
  onProxyChange,
}: ToolbarProps) {
  return (
    <div id="toolbar" style={{ display: 'block' }}>
      <label>
        <input
          type="checkbox"
          id="wrapToggle"
          checked={wrapEnabled}
          onChange={(e) => onWrapChange(e.target.checked)}
        />{' '}
        自动换行
      </label>
      <label style={{ marginLeft: 16 }}>
        <input
          type="checkbox"
          id="proxyToggle"
          checked={proxyEnabled}
          onChange={(e) => onProxyChange(e.target.checked)}
        />{' '}
        国内加速
      </label>
    </div>
  );
}
