/**
 * 站点接口（站点基本信息 / 已发布内容）
 * 对应 Apifox 文档「其他」分组（站点公开接口，无需登录）
 */
import request from '@/utils/request'

// 获取站点基本信息（Logo、站点名、备案号、版权、联系方式、SEO）
export function getSiteProfile() {
  return request({
    url: '/portal/site/profile',
    method: 'get'
  })
}

// 首页轮播（仅启用且在有效期内）
export function getHomeBanners() {
  return request({
    url: '/portal/site/banners',
    method: 'get'
  })
}

// 已发布内容列表（contentHtml 恒为 null，仅摘要）
export function listSiteContents(params) {
  return request({
    url: '/portal/site/contents',
    method: 'get',
    params
  })
}

// 按类型获取已发布正文（service 服务协议 / privacy 隐私政策等）
export function getSiteContentByType(type) {
  return request({
    url: `/portal/site/content/${type}`,
    method: 'get'
  })
}
