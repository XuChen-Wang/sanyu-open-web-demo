/**
 * 门户预设头像（存库值为 emoji 字符串，非 URL）
 */
export const PRESET_AVATARS = [
  { value: '🦊', label: '狐狸' },
  { value: '🐱', label: '猫咪' },
  { value: '🐼', label: '熊猫' },
  { value: '🐯', label: '老虎' },
  { value: '🐰', label: '兔子' },
  { value: '🦉', label: '猫头鹰' },
  { value: '🐧', label: '企鹅' },
  { value: '🦄', label: '独角兽' },
  { value: '🌸', label: '樱花' },
  { value: '🍀', label: '四叶草' },
  { value: '⭐', label: '星星' },
  { value: '🌙', label: '月亮' }
]

/** 是否为可作 img src 的头像地址 */
export function isAvatarUrl(avatar) {
  if (!avatar || typeof avatar !== 'string') return false
  const v = avatar.trim()
  return /^https?:\/\//i.test(v) || v.startsWith('/') || v.startsWith('data:')
}

/** 头像展示文案：优先预设 emoji，否则昵称首字 */
export function avatarText(avatar, displayName = '用') {
  if (avatar && !isAvatarUrl(avatar)) return avatar
  const name = String(displayName || '用').trim()
  return name ? name.charAt(0) : '用'
}
