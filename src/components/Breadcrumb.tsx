interface BreadcrumbProps {
  path: string;
}

export function Breadcrumb({ path }: BreadcrumbProps) {
  const parts = path ? path.split('/') : [];

  return (
    <div id="breadcrumb">
      <span className="bc-link" onClick={() => { location.hash = ''; }}>
        根目录
      </span>
      {parts.map((part, i) => {
        const cumulative = parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={cumulative}>
            <span className="bc-sep">{' \u203A '}</span>
            {isLast ? (
              <span className="bc-current">{part}</span>
            ) : (
              <span
                className="bc-link"
                onClick={() => {
                  location.hash = cumulative.replace(/#/g, '%23');
                }}
              >
                {part}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}
