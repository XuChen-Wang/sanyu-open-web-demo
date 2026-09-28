/**
 * 开放 API 在线调试（对齐管理端逻辑，但直连 apiBaseUrl，不走前端代理）
 * 鉴权仅传 X-Api-Key，与网关一致。
 *
 * 使用 fetch + redirect:manual，避免 302 跳到外域 CDN 时浏览器 CORS 报 Network Error。
 *
 * @param {{ baseUrl: string, path: string, method?: string, params?: object, data?: object, apiKey?: string }} opts
 */
export function debugOpenApi({ baseUrl, path, method = 'GET', params, data, apiKey }) {
  const base = String(baseUrl || '').replace(/\/$/, '')
  const apiPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  if (!base) {
    return Promise.reject(new Error('未配置开放 API 根地址'))
  }
  if (!apiPath) {
    return Promise.reject(new Error('缺少接口路径'))
  }

  const headers = {}
  if (apiKey) {
    headers['X-Api-Key'] = apiKey
  }

  const upper = String(method || 'GET').toUpperCase()
  let finalUrl = `${base}${apiPath}`
  if ((upper === 'GET' || upper === 'DELETE') && params && typeof params === 'object') {
    const qs = new URLSearchParams()
    Object.keys(params).forEach((key) => {
      const val = params[key]
      if (val === undefined || val === null || val === '') return
      qs.append(key, String(val))
    })
    const q = qs.toString()
    if (q) finalUrl += (finalUrl.includes('?') ? '&' : '?') + q
  }

  let body
  if (upper !== 'GET' && upper !== 'DELETE') {
    if (data instanceof FormData) {
      body = data
    } else {
      headers['Content-Type'] = 'application/json;charset=utf-8'
      body = typeof data === 'string' ? data : JSON.stringify(data ?? {})
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 180000)

  return fetch(finalUrl, {
    method: upper,
    headers,
    body,
    redirect: 'manual',
    signal: controller.signal
  })
    .then((res) => normalizeDebugResponse(res))
    .finally(() => clearTimeout(timer))
}

async function normalizeDebugResponse(res) {
  if (res.type === 'opaqueredirect' || (res.status >= 300 && res.status < 400) || res.status === 0) {
    const location = res.headers.get('location') || ''
    return {
      code: 200,
      msg: '操作成功',
      data: {
        httpStatus: res.status || 302,
        redirect: true,
        location,
        note: location
          ? '接口返回重定向，在线调试不自动跳转；可将 location 复制到浏览器打开'
          : '接口返回重定向，但浏览器未暴露 Location（可改用 format=json 查看直链）'
      }
    }
  }

  const contentType = String(res.headers.get('content-type') || '').toLowerCase()
  const buf = await res.arrayBuffer()

  if (buf && contentType.startsWith('image/')) {
    if (res.status >= 400) {
      return Promise.reject(Object.assign(new Error(`图片响应失败 HTTP ${res.status}`), { response: res }))
    }
    const mimeType = contentType.split(';')[0].trim() || guessMimeFromBytes(buf) || 'image/jpeg'
    const base64 = arrayBufferToBase64(buf)
    return {
      code: 200,
      msg: '操作成功',
      data: {
        mimeType,
        base64,
        byteLength: buf.byteLength,
        contentType: mimeType,
        note: '原始响应为图片二进制，已转为预览'
      }
    }
  }

  const text = buf ? new TextDecoder('utf-8').decode(buf) : ''
  let payload
  try {
    payload = text ? JSON.parse(text) : {}
  } catch (e) {
    if (res.status >= 400) {
      return Promise.reject(Object.assign(new Error(text || `HTTP ${res.status}`), { response: res }))
    }
    return { code: 200, msg: '操作成功', data: text }
  }

  const code = payload?.code ?? (res.status >= 400 ? res.status : 200)
  const msg = payload?.msg || '请求失败'
  if (Number(code) !== 200) {
    return Promise.reject(Object.assign(new Error(msg), { response: { status: res.status, data: payload } }))
  }
  return payload
}

function guessMimeFromBytes(buf) {
  if (!buf || buf.byteLength < 3) return ''
  const u8 = new Uint8Array(buf)
  if (u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) return 'image/jpeg'
  if (u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) return 'image/png'
  if (u8[0] === 0x47 && u8[1] === 0x49 && u8[2] === 0x46) return 'image/gif'
  if (u8[0] === 0x52 && u8[1] === 0x49 && u8[2] === 0x46 && u8[3] === 0x46) return 'image/webp'
  return ''
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const chunk = 0x8000
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}
