import { createApp } from 'vue'

import Cookies from 'js-cookie'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

import '@/assets/styles/index.scss'

import App from './App.vue'
import store from './store'
import router from './router'
import { useAppStore } from '@/store/modules/app'

import { getToken } from '@/utils/auth'

// 兼容旧 hash 链接：/#/explore -> /explore
;(function redirectLegacyHash() {
  const hash = window.location.hash || ''
  if (!hash.startsWith('#/')) return
  const target = hash.slice(1) // /path?query
  window.location.replace(window.location.origin + target)
})()

const app = createApp(App)

// Element Plus 全局配置
app.use(ElementPlus, {
  locale: zhCn,
  size: Cookies.get('size') || 'default'
})

app.use(store)
// 尽早拉取站点信息，配合 localStorage 缓存减少页头 Logo/名称抖动
const appStore = useAppStore(store)
if (appStore.siteInfo && Object.keys(appStore.siteInfo).length) {
  appStore.applySiteMeta()
}
appStore.fetchSiteInfo()
app.use(router)

// 全局属性
app.config.globalProperties.$getToken = getToken

app.mount('#app')
