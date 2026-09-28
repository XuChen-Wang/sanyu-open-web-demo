import { defineStore } from 'pinia'
import { getSiteProfile } from '@/api/site'
import { resolveMediaUrl } from '@/utils/media'

const DEFAULT_SITE_NAME = '三域聚合开放平台'
const SITE_INFO_KEY = 'portal-site-profile'

function loadCachedSiteInfo() {
  try {
    const raw = localStorage.getItem(SITE_INFO_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch (e) {
    return {}
  }
}

function saveCachedSiteInfo(data) {
  if (!data || typeof data !== 'object') return
  try {
    localStorage.setItem(SITE_INFO_KEY, JSON.stringify(data))
  } catch (e) {
    /* ignore */
  }
}

function ensureMeta(name, content) {
  if (!content) return
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function ensureFavicon(url) {
  const href = resolveMediaUrl(url)
  if (!href) return
  let link = document.querySelector("link[rel='icon']")
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'icon')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export const useAppStore = defineStore('app', {
  state: () => ({
    loginVisible: false,
    siteInfo: loadCachedSiteInfo(),
    siteLoaded: false,
    siteContentVisible: false,
    siteContentType: '',
    aboutVisible: false
  }),

  getters: {
    siteName(state) {
      return (state.siteInfo && state.siteInfo.siteName) || DEFAULT_SITE_NAME
    },
    logoUrl(state) {
      return resolveMediaUrl(state.siteInfo && state.siteInfo.logoUrl)
    },
    logoDarkUrl(state) {
      const dark = resolveMediaUrl(state.siteInfo && state.siteInfo.logoDarkUrl)
      return dark || resolveMediaUrl(state.siteInfo && state.siteInfo.logoUrl)
    }
  },

  actions: {
    openLogin() {
      this.loginVisible = true
    },

    closeLogin() {
      this.loginVisible = false
    },

    openSiteContent(type) {
      const t = String(type || '').trim().toLowerCase()
      if (!t) return
      this.siteContentType = t
      this.siteContentVisible = true
    },

    closeSiteContent() {
      this.siteContentVisible = false
      this.siteContentType = ''
    },

    openAbout() {
      this.aboutVisible = true
    },

    closeAbout() {
      this.aboutVisible = false
    },

    /** 获取站点基本信息（缓存，整个会话只请求一次） */
    async fetchSiteInfo() {
      if (this.siteLoaded) return this.siteInfo
      try {
        const res = await getSiteProfile()
        if (res.code === 200 && res.data) {
          this.siteInfo = res.data
          saveCachedSiteInfo(res.data)
          this.applySiteMeta()
        }
      } catch (e) {
        // 失败时使用空对象，避免重复请求
      }
      this.siteLoaded = true
      return this.siteInfo
    },

    /** 写入 favicon / SEO meta */
    applySiteMeta() {
      const site = this.siteInfo || {}
      ensureFavicon(site.faviconUrl)
      ensureMeta('description', site.seoDescription)
      ensureMeta('keywords', site.seoKeywords)
    },

    /** 按路由拼 document.title */
    resolvePageTitle(routeTitle, isHome = false) {
      const site = this.siteInfo || {}
      const name = this.siteName
      if (isHome) {
        return site.seoTitle || name
      }
      if (!routeTitle) return name
      return String(routeTitle).replace(/兆字节API开放平台|三域聚合开放平台/g, name)
    }
  }
})
