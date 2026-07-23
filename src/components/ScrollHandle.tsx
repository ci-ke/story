import { useEffect, useRef, useCallback } from 'react';

/**
 * 移动端快速滚动滑块
 * - 使用 Pointer Events 统一触摸和鼠标
 * - 点击 track 任意位置跳转
 * - ResizeObserver 响应尺寸变化
 * - requestAnimationFrame 节流
 */
export function ScrollHandle() {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafId = useRef(0);
  const handleHeight = useRef(40);
  const capturedId = useRef(-1);

  /** 计算 handle 在 track 内的 top 偏移 */
  const calcHandleTop = useCallback((progress: number) => {
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return 0;
    const maxTop = track.clientHeight - handle.clientHeight;
    return Math.max(0, Math.min(maxTop, progress * maxTop));
  }, []);

  /** 更新 handle 位置和 track 可见性 */
  const updatePosition = useCallback(() => {
    if (dragging.current) return;

    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return;

    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollTotal <= 200) {
      track.classList.remove('visible');
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = Math.min(1, Math.max(0, scrollTotal > 0 ? scrollTop / scrollTotal : 0));
    const top = calcHandleTop(progress);
    handle.style.top = top + 'px';

    handleHeight.current = handle.clientHeight;

    track.classList.add('visible');
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!dragging.current && track) {
        track.classList.remove('visible');
      }
    }, 2000);
  }, [calcHandleTop]);

  /** rAF 包装的 updatePosition */
  const scheduleUpdate = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      updatePosition();
    });
  }, [updatePosition]);

  /** 根据 clientY 同步滚动 + 视觉位置 */
  const scrubTo = useCallback((clientY: number) => {
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return;

    const rect = track.getBoundingClientRect();
    const halfH = handleHeight.current / 2;
    const maxTop = track.clientHeight - handle.clientHeight;
    const visualY = Math.max(0, Math.min(maxTop, clientY - rect.top - halfH));

    handle.style.top = visualY + 'px';

    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (maxTop <= 0 || scrollTotal <= 0) return;
    const progress = visualY / maxTop;
    window.scrollTo(0, progress * scrollTotal);
  }, []);

  // --- 指针事件 ---

  const onPointerDown = useCallback((e: PointerEvent) => {
    // 只响应 handle 上的点击，忽略 track 背景
    if (e.target !== handleRef.current) return;

    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTotal <= 0) return;

    e.preventDefault();
    e.stopPropagation();

    dragging.current = true;
    capturedId.current = e.pointerId;
    handleRef.current?.classList.add('active');
    if (hideTimer.current) clearTimeout(hideTimer.current);

    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch { /* 部分环境不支持 */ }
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    scrubTo(e.clientY);
  }, [scrubTo]);

  const onPointerUp = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    capturedId.current = -1;
    handleRef.current?.classList.remove('active');

    // 释放指针捕获
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch { /* ok */ }

    scheduleUpdate();
  }, [scheduleUpdate]);

  // --- 绑定事件 ---

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // track 上捕获 pointerdown（包括 handle 上的），非 passive 才能 preventDefault
    track.addEventListener('pointerdown', onPointerDown, { passive: false });
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    window.addEventListener('scroll', scheduleUpdate, { passive: true });

    const ro = new ResizeObserver(() => scheduleUpdate());
    ro.observe(document.body);

    scheduleUpdate();

    return () => {
      track.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('scroll', scheduleUpdate);
      ro.disconnect();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [onPointerDown, onPointerMove, onPointerUp, scheduleUpdate]);

  return (
    <div id="scroll-track" ref={trackRef}>
      <div id="scroll-handle" ref={handleRef} />
    </div>
  );
}
