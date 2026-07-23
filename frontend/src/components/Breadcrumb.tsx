interface BreadcrumbProps {
  path: string;
}

export function Breadcrumb({ path }: BreadcrumbProps) {
  const parts = path ? path.split('/') : [];

  return (
    <div id="breadcrumb">
      <span onClick={() => { location.hash = ''; }}>根目录</span>
      {parts.map((part, i) => {
        const cumulative = parts.slice(0, i + 1).join('/');
        const isLast = i === parts.length - 1;
        return (
          <span key={cumulative}>
            {' / '}
            {isLast ? (
              <strong>{part}</strong>
            ) : (
              <span
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
