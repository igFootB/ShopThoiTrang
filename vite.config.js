import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cấu hình chuẩn cho Vercel
export default defineConfig({
  plugins: [react()],
  base: '/', // Đổi lại thành '/' cho Vercel
});