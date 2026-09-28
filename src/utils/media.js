/**
 * 将后台上传资源路径转为门户可访问地址。
 * 管理端存的是相对路径如 /profile/xxx.png，门户开发态需经 /api 代理到 web-api。
 * 文件名可能含空格/中文，必须按段 encode，否则 CSS url() 和部分代理会截断。
 */
export function resolveMediaUrl(url) {
  if (!url) return ''
  const u = String(url).trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u) || u.startsWith('data:') || u.startsWith('blob:')) {
    return encodeURI(u)
  }
  if (u.startsWith('/api/')) {
    return encodePathKeepSlash(u)
  }
  if (u.startsWith('/profile/') || u.startsWith('profile/')) {
    const path = u.startsWith('/') ? u : '/' + u
    return '/api' + encodePathKeepSlash(path)
  }
  if (u.startsWith('/')) {
    return '/api' + encodePathKeepSlash(u)
  }
  return encodeURI(u)
}

function encodePathKeepSlash(path) {
  return path
    .split('/')
    .map((seg) => (seg ? encodeURIComponent(seg) : ''))
    .join('/')
}
