import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);

// React 18 render() 是异步的，延迟到首次绘制之后移除 preload
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    document.getElementById('preload')?.remove();
  });
});
