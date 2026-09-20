import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base: '/96/' ضروري لأن الموقع يُنشر على GitHub Pages تحت مسار فرعي
// باسم المستودع (https://<user>.github.io/96/) وليس على جذر النطاق.
export default defineConfig({
  base: '/96/',
  plugins: [react(), tailwindcss()],
})
