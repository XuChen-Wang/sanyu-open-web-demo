import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Layout from '@/layout/index.vue'
import ConsoleLayout from '@/console/index.vue'
import store from '@/store'
import { useAppStore } from '@/store/modules/app'
import { isConsolePath } from '@/utils/routeTransition'

NProgress.configure({ showSpinner: false, speed: 320, minimum: 0.18 })

export const constantRoutes = [
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: 'Home',
        component: () => import('@/views/index.vue'),
        meta: { title: '三域聚合开放平台 - 聚合API|免费数据接口|接口大全' }
      },
      {
        path: '/explore',
        name: 'Explore',
        component: () => import('@/views/explore.vue'),
        meta: { title: '探索聚合API - 三域聚合开放平台' }
      },
      {
        path: '/docs/:apiCode(.*)',
        name: 'ApiDetail',
        component: () => import('@/views/apiDetail.vue'),
        meta: { title: '接口文档 - 三域聚合开放平台' }
      },
      {
        path: '/vip',
        name: 'Vip',
        component: () => import('@/views/vip.vue'),
        meta: { title: '会员VIP - 三域聚合开放平台' }
      },
      {
        path: '/about',
        name: 'About',
        component: () => import('@/views/site/About.vue'),
        meta: { title: '关于我们 - 三域聚合开放平台' }
      },
      {
        path: '/page/:type',
        name: 'SiteContent',
        component: () => import('@/views/site/Content.vue'),
        meta: { title: '站点内容 - 三域聚合开放平台' }
      }
    ]
  },
  {
    path: '/console',
    component: ConsoleLayout,
    redirect: '/console/index',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/console/index',
        name: 'ConsoleOverview',
        component: () => import('@/console/Overview.vue'),
        meta: { title: '控制台 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/token',
        name: 'ConsoleToken',
        component: () => import('@/console/Token.vue'),
        meta: { title: 'Token管理 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/myapi',
        name: 'ConsoleMyApi',
        component: () => import('@/console/MyApi.vue'),
        meta: { title: '我的接口 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/logs',
        name: 'ConsoleLogs',
        component: () => import('@/console/Logs.vue'),
        meta: { title: '接口调用日志 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/security',
        name: 'ConsoleSecurity',
        component: () => import('@/console/Security.vue'),
        meta: { title: '安全设置 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/login-logs',
        name: 'ConsoleLoginLogs',
        component: () => import('@/console/LoginLogs.vue'),
        meta: { title: '登录日志 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/profile',
        name: 'ConsoleProfile',
        component: () => import('@/console/Profile.vue'),
        meta: { title: '基本信息 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/oauth',
        name: 'ConsoleOauth',
        component: () => import('@/console/Oauth.vue'),
        meta: { title: '第三方账号 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/messages',
        name: 'ConsoleMessages',
        component: () => import('@/console/Messages.vue'),
        meta: { title: '消息通知 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/notify-config',
        name: 'ConsoleNotifyConfig',
        component: () => import('@/console/NotifyConfig.vue'),
        meta: { title: '消息通知配置 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/tickets',
        name: 'ConsoleTickets',
        component: () => import('@/console/Tickets.vue'),
        meta: { title: '工单管理 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/orders',
        name: 'ConsoleOrders',
        component: () => import('@/console/Orders.vue'),
        meta: { title: '订单管理 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/invoices',
        name: 'ConsoleInvoices',
        component: () => import('@/console/Invoices.vue'),
        meta: { title: '发票管理 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/gifts',
        name: 'ConsoleGifts',
        component: () => import('@/console/Gifts.vue'),
        meta: { title: '礼品兑换 - 三域聚合开放平台', requiresAuth: true }
      },
      {
        path: '/console/invite',
        name: 'ConsoleInvite',
        component: () => import('@/console/Invite.vue'),
        meta: { title: '邀请返利 - 三域聚合开放平台', requiresAuth: true }
      }
    ]
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404 - 页面不存在' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 动态标题：优先站点 SEO / 站点名
router.afterEach(async (to) => {
  NProgress.done()
  const appStore = useAppStore(store)
  await appStore.fetchSiteInfo()
  const isHome = to.path === '/' || to.path === '/index'
  if (to.name === 'SiteContent') {
    // 内容页自行设置标题
    return
  }
  document.title = appStore.resolvePageTitle(to.meta.title, isHome)
})

// 登录守卫：需要登录的页面未登录时，打开登录弹框
router.beforeEach((to, from, next) => {
  // 仅官网壳 ↔ 控制台壳时显示进度条，避免控制台内切页噪音
  if (from.matched.length && isConsolePath(from.path) !== isConsolePath(to.path)) {
    NProgress.start()
  }
  const token = document.cookie.includes('Api-Token=')
  if (to.meta.requiresAuth && !token) {
    const appStore = useAppStore(store)
    appStore.openLogin()
    NProgress.done()
    next({ path: '/' })
  } else {
    next()
  }
})

export default router
