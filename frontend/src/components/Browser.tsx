import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFileTree } from '../hooks/useFileTree';
import { Breadcrumb } from './Breadcrumb';
import { Toolbar } from './Toolbar';
import { DirList } from './DirList';
import { FileView } from './FileView';
import { ScrollHandle } from './ScrollHandle';
import type { Node } from '../types';

export function Browser() {
  const { '*': pathParam } = useParams();
  const path = (pathParam ?? '').replace(/\/+$/, '');

  const { resolvePath } = useFileTree();

  const [wrapEnabled, setWrapEnabled] = useState(
    () => localStorage.getItem('wrapToggle') !== 'false',
  );
  const [proxyEnabled, setProxyEnabled] = useState(
    () => localStorage.getItem('proxyToggle') !== 'false',
  );

  const [node, setNode] = useState<Node | null>(null);
  const [resolvedPath, setResolvedPath] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialLoadDone = useRef(false);

  const route = useCallback(async () => {
    setLoading(true);
    setError(null);
    // 切换路径时重置滚动
    window.scrollTo(0, 0);

    try {
      const result = await resolvePath(path);
      if (!result) {
        setError('路径不存在');
        setNode(null);
      } else {
        setNode(result.node);
        setResolvedPath(result.resolvedPath);

        // 如果模糊匹配修正了路径，更新 URL（不触发重新导航）
        if (result.resolvedPath !== path) {
          history.replaceState(null, '', '#' + result.resolvedPath.replace(/#/g, '%23'));
          setResolvedPath(result.resolvedPath);
        }
      }
    } catch (e) {
      setError('加载失败：' + (e as Error).message);
      setNode(null);
    } finally {
      setLoading(false);
    }
  }, [path, resolvePath]);

  useEffect(() => {
    route();
  }, [route]);

  // 持久化设置
  useEffect(() => {
    if (initialLoadDone.current) {
      localStorage.setItem('wrapToggle', String(wrapEnabled));
    }
  }, [wrapEnabled]);

  useEffect(() => {
    if (initialLoadDone.current) {
      localStorage.setItem('proxyToggle', String(proxyEnabled));
    }
  }, [proxyEnabled]);

  useEffect(() => {
    initialLoadDone.current = true;
  }, []);

  return (
    <>
      <Breadcrumb path={resolvedPath || path} />
      {!error && (
        <Toolbar
          wrapEnabled={wrapEnabled}
          proxyEnabled={proxyEnabled}
          onWrapChange={setWrapEnabled}
          onProxyChange={setProxyEnabled}
        />
      )}
      {loading && <div id="list">加载中...</div>}
      {error && <div id="list">{error}</div>}
      {!loading && !error && node && (
        node.type === 'dir' ? (
          <DirList path={resolvedPath} children={node.children || []} />
        ) : (
          <FileView
            filePath={resolvedPath}
            proxyEnabled={proxyEnabled}
            wrapEnabled={wrapEnabled}
          />
        )
      )}
      <ScrollHandle />
    </>
  );
}
