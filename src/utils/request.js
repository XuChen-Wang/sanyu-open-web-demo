import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import errorCode from '@/utils/errorCode'
import router from '@/router'
import store from '@/store'

// 是否正在处理重新登录（避免并发 401 重复弹窗）
export let isRelogin = { show: false }

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建axios实例
const service = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// request拦截器
service.interceptors.request.use(config => {
  // 是否需要设置 token
  const isToken = (config.headers || {}).isToken === false

  if (getToken() && !isToken) {
    config.headers['token'] = getToken()
  }
  return config
}, error => {
  console.log(error)
  return Promise.reject(error)
})

async function handleSessionExpired() {
  if (isRelogin.show) return
  isRelogin.show = true
  try {
    const [{ useUserStore }, { useAppStore }] = await Promise.all([
      import('@/store/modules/user'),
      import('@/store/modules/app')
    ])
    useUserStore(store).logout()
    useAppStore(store).openLogin()
    const current = router.currentRoute.value
    if (current?.meta?.requiresAuth) {
      router.replace('/')
    }
  } finally {
    setTimeout(() => {
      isRelogin.show = false
    }, 1500)
  }
}

// 响应拦截器
service.interceptors.response.use(async res => {
  const responseType = res.config?.responseType
  const isBinaryResponse = responseType === 'blob' || responseType === 'arraybuffer'
  if (isBinaryResponse) {
    const contentType = String(res.headers?.['content-type'] || '').toLowerCase()
    if (!contentType.includes('application/json')) {
      return res.data
    }

    // 下载接口发生业务异常时，JSON 会按二进制类型返回，需要先还原后再走统一错误处理。
    try {
      const text = responseType === 'blob'
        ? await res.data.text()
        : new TextDecoder('utf-8').decode(res.data)
      res.data = JSON.parse(text)
    } catch {
      const message = '文件响应格式异常'
      ElMessage({ message, type: 'error' })
      return Promise.reject(new Error(message))
    }
  }

  // 后端成功码为 0 或 200
  const code = res.data.code
  const isSuccess = code === 200 || code === 0
  const msg = res.data.msg || errorCode[code] || errorCode['default']

  if (code === 401) {
    handleSessionExpired()
    return Promise.reject('无效的会话，或者会话已过期。')
  } else if (code === 500) {
    ElMessage({ message: msg, type: 'error' })
    return Promise.reject(new Error(msg))
  } else if (!isSuccess) {
    ElMessage({ message: msg, type: 'error' })
    return Promise.reject('error')
  } else {
    return res.data
  }
}, error => {
  console.log('err' + error)
  let { message } = error
  if (message === 'Network Error') {
    message = '后端接口连接异常'
  } else if (message.includes('timeout')) {
    message = '系统接口请求超时'
  } else if (message.includes('Request failed with status code')) {
    message = '系统接口' + message.substr(message.length - 3) + '异常'
  }
  ElMessage({ message: message, type: 'error', duration: 5 * 1000 })
  return Promise.reject(error)
})

export default service
