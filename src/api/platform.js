/**
 * 平台接口（前台页面数据）
 * 当前使用本地 Mock 数据，后端就绪后替换为 request 请求即可。
 */
import request from '@/utils/request'
import { categories, apiList, getApiListByCategory, getApiById, searchApis } from '@/api/mock'
// 模拟网络延迟
function delay(data, ms = 200) {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

// ==================== 开放能力（真实接口，探索页使用） ====================

// 能力分类列表（仅启用）GET /portal/open/categories
export function getOpenCategories() {
  return request({
    url: '/portal/open/categories',
    method: 'get'
  })
}

// 已上线开放接口列表（分页）GET /portal/open/apis
// params: { pageNum, pageSize, categoryCode, keyword, chargeType }
// 响应：若依分页 { total, rows }
export function getOpenApis(params) {
  return request({
    url: '/portal/open/apis',
    method: 'get',
    params
  })
}

// 开放能力分类树 GET /portal/open/tree
// 响应：data: [{ categoryCode, categoryName, description, icon, apis: [...] }]
export function getOpenTree() {
  return request({
    url: '/portal/open/tree',
    method: 'get'
  })
}

// 获取对外 API 根地址 GET /portal/open/config
export function getOpenConfig() {
  return request({
    url: '/portal/open/config',
    method: 'get'
  })
}

// 开放接口详情 GET /portal/open/apis/{apiCode}
export function getOpenApiDetail(apiCode) {
  return request({
    url: `/portal/open/apis/${encodeURIComponent(apiCode)}`,
    method: 'get'
  })
}

// 会员套餐列表（管理端 open_plan，仅启用）GET /portal/plans
// 已登录时带 token 会标记 current
export function getPortalPlans() {
  return request({
    url: '/portal/plans',
    method: 'get'
  })
}

// 分类列表
export function getCategories() {
  return delay({ code: 200, msg: 'success', data: categories })
}

// 接口列表（可按分类/关键字筛选）
export function getApiList({ category, keyword, page = 1, pageSize = 12 } = {}) {
  let list = []
  if (category) {
    list = getApiListByCategory(category)
  } else if (keyword) {
    list = searchApis(keyword)
  } else {
    list = apiList
  }
  const total = list.length
  const start = (page - 1) * pageSize
  const pageList = list.slice(start, start + pageSize)
  return delay({ code: 200, msg: 'success', data: { list: pageList, total, page, pageSize } })
}

// 接口详情（兼容旧 mock 调用名）
export function getApiDetail(id) {
  // 优先走真实详情；id 即 apiCode
  if (id && typeof id === 'string' && !/^\d+$/.test(id)) {
    return getOpenApiDetail(id)
  }
  const detail = getApiById(id)
  if (!detail) {
    return delay({ code: 404, msg: '接口不存在', data: null })
  }
  return delay({ code: 200, msg: 'success', data: detail })
}

// 在线调试请使用 @/api/openDebug 的 debugOpenApi（对齐管理端）

// 首页统计（旧 mock，首页已改为树接口真实计数；保留兼容）
export function getHomeStats() {
  return delay({
    code: 200,
    msg: 'success',
    data: {
      apiCount: 0,
      categoryCount: 0
    }
  })
}

// 合作伙伴（旧 mock，首页已改为分类场景标签）
export function getPartners() {
  return delay({ code: 200, msg: 'success', data: [] })
}
