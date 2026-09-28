import { resolveMediaUrl } from '@/utils/media'
import defaultApiIcon from '@/assets/home/icons/api-default.png'
import defaultCategoryIcon from '@/assets/home/icons/category-default.png'

/** 接口默认图标（未配置 apiIcon 时） */
export { defaultApiIcon as DEFAULT_OPEN_ICON, defaultApiIcon as DEFAULT_API_ICON }
/** 分类默认图标（未配置 category.icon 时） */
export { defaultCategoryIcon as DEFAULT_CATEGORY_ICON }

/**
 * 是否为管理端上传的图片路径（与 zzj-open-ui OpenCategoryCard 判定对齐）。
 * icon 字段也可能是 RuoYi svg-icon 名称（如 edit），那种不算上传图。
 */
export function isUploadedOpenIcon(icon) {
  if (!icon) return false
  const value = String(icon).toLowerCase().trim()
  return (
    value.startsWith('/') ||
    value.startsWith('http') ||
    value.endsWith('.svg') ||
    value.endsWith('.png') ||
    value.endsWith('.jpg') ||
    value.endsWith('.jpeg') ||
    value.endsWith('.gif') ||
    value.endsWith('.bmp') ||
    value.endsWith('.webp')
  )
}

/**
 * 分类图标：优先管理端配置的上传图，否则分类默认图。
 */
export function resolveOpenIconUrl(icon, fallback = defaultCategoryIcon) {
  if (!isUploadedOpenIcon(icon)) return fallback
  return resolveMediaUrl(icon) || fallback
}

/**
 * 接口图标：优先上传路径；无配置时返回接口默认图。
 */
export function resolveApiIconUrl(apiIcon, fallback = defaultApiIcon) {
  if (!isUploadedOpenIcon(apiIcon)) return fallback
  return resolveMediaUrl(apiIcon) || fallback
}
