import { useEffect, useRef, useCallback } from 'react';

const HANDLE_HALF_HEIGHT = 35; // 滑块半高度 (70/2)

export function ScrollHandle() {
  const trackRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 更新滑块位置
  const updateHandlePosition = useCallback(() => {
    if (isDragging.current) return;

    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return;

    if (scrollTotal <= 200) {
      track.style.display = 'none';
      return;
    }

    track.style.display = 'block';
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = Math.min(1, Math.max(0, scrollTop / scrollTotal));
    const availableHeight = track.clientHeight - handle.clientHeight;
    handle.style.top = (progress * availableHeight) + 'px';

    // 1.5 秒后自动隐藏
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!isDragging.current && track) {
        track.style.display = 'none';
      }
    }, 1500);
  }, []);

  // 核心拖拽：根据 clientY 更新滑块位置和页面滚动
  const doScrub = useCallback((clientY: number) => {
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return;

    const rect = track.getBoundingClientRect();
    let visualY = clientY - rect.top - HANDLE_HALF_HEIGHT;
    const maxVisualY = rect.height - handle.clientHeight;
    visualY = Math.max(0, Math.min(visualY, maxVisualY));
    handle.style.top = visualY + 'px';

    const percent = visualY / maxVisualY;
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, percent * scrollTotal);
  }, []);

  // 拖拽开始
  const onDragStart = useCallback(() => {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollTotal <= 0) return;

    isDragging.current = true;
    handleRef.current?.classList.add('dragging');
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (trackRef.current) trackRef.current.style.display = 'block';
  }, []);

  // 拖拽移动
  const onDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    if (e.cancelable) e.preventDefault();

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    doScrub(clientY);
  }, [doScrub]);

  // 拖拽结束
  const onDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    handleRef.current?.classList.remove('dragging');
    updateHandlePosition();
  }, [updateHandlePosition]);

  // 绑定全局事件
  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    // 绑定手柄事件
    handle.addEventListener('touchstart', onDragStart, { passive: false });
    handle.addEventListener('mousedown', onDragStart);

    // 绑定窗口级移动/释放事件
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('touchcancel', onDragEnd);
    window.addEventListener('mouseup', onDragEnd);

    // 绑定页面滚动更新滑块
    window.addEventListener('scroll', updateHandlePosition, { passive: true });

    // 初始更新
    updateHandlePosition();

    return () => {
      handle.removeEventListener('touchstart', onDragStart);
      handle.removeEventListener('mousedown', onDragStart);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('touchcancel', onDragEnd);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('scroll', updateHandlePosition);
    };
  }, [onDragStart, onDragMove, onDragEnd, updateHandlePosition]);

  return (
    <div id="scroll-track" ref={trackRef}>
      <div id="scroll-handle" ref={handleRef} />
    </div>
  );
}
