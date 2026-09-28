'use strict'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

function resolve(dir) {
  return path.join(__dirname, dir)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'https://www.sanyu366.com'
  // 线上网关带 /api 前缀：不 strip。本地 web-api 直连时设 VITE_PROXY_STRIP_API=true
  const stripApi = String(env.VITE_PROXY_STRIP_API || 'false').toLowerCase() === 'true'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          additionalData(source, filename) {
            if (filename && String(filename).includes(`${path.sep}variables.scss`)) {
              return source
            }
            return `@use "@/assets/styles/variables.scss" as *;\n${source}`
          }
        }
      }
    },
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_DEV_PORT || 8081),
      open: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: true,
          ...(stripApi
            ? { rewrite: p => p.replace(/^\/api/, '') }
            : {})
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'static',
      productionSourceMap: false
    }
  }
})
