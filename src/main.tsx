import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

// نستخدم HashRouter بدل BrowserRouter لأن الموقع يُنشر على GitHub Pages
// (استضافة ملفات ثابتة بدون إعادة توجيه من جهة الخادم)، فتبقى كل الروابط
// الداخلية (مثل /mosaic) تعمل عند تحديث الصفحة أو مشاركة رابط مباشر.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
