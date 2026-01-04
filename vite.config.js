import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      allow: [
        resolve(__dirname),
        resolve(__dirname, 'node_modules/@mdi/font'),
        resolve(__dirname, 'node_modules/vuetify'),  // ← これを追加
      ]
    }
  }
})
