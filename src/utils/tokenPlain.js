/** 创建 Token 时缓存明文，供同会话在线调试使用（列表接口不再返回明文） */
const STORAGE_KEY = 'portal-token-plain-map'

export function getTokenPlainMap() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const data = JSON.parse(raw)
    return data && typeof data === 'object' ? data : {}
  } catch (e) {
    return {}
  }
}

export function rememberTokenPlain(keyId, plain) {
  if (keyId == null || !plain) return
  try {
    const map = getTokenPlainMap()
    map[String(keyId)] = String(plain)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (e) {
    /* ignore */
  }
}

export function resolveTokenPlain(keyId, accessKeyFromApi) {
  if (accessKeyFromApi) return accessKeyFromApi
  if (keyId == null) return ''
  const map = getTokenPlainMap()
  return map[String(keyId)] || ''
}
