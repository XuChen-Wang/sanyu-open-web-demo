/**
 * 控制台接口（用户中心数据）
 * Token / 我的接口 / 调用日志 / 登录日志 / 首页总览 / 订单管理 / 消息通知已接真实后端；其余仍为本地 Mock。
 */
import request from '@/utils/request'

function delay(data, ms = 250) {
  return new Promise(resolve => setTimeout(() => resolve(data), ms))
}

function ok(data, msg = 'success') {
  return { code: 200, msg, data }
}

function fail(msg) {
  return { code: 500, msg, data: null }
}

// ==================== 控制台总览 ====================
/** GET /console/overview — 调用量、Token、套餐、近 14 天趋势、最近调用 */
export function getOverview() {
  return request({
    url: '/console/overview',
    method: 'get'
  })
}

// ==================== Token 管理（真实接口） ====================
// GET/POST /console/tokens；PUT .../status；DELETE .../{keyId}
// 状态：0 启用 / 1 停用
export function getApiKeys() {
  return request({
    url: '/console/tokens',
    method: 'get'
  })
}

export function createApiKey(data) {
  const body = typeof data === 'string' ? { name: data } : data
  return request({
    url: '/console/tokens',
    method: 'post',
    data: body
  })
}

export function updateApiKeyStatus(keyId, status) {
  return request({
    url: `/console/tokens/${keyId}/status`,
    method: 'put',
    data: { status: String(status) }
  })
}

export function deleteApiKey(keyId) {
  return request({
    url: `/console/tokens/${keyId}`,
    method: 'delete'
  })
}

export function getTokenAllowedApis() {
  return request({
    url: '/console/tokens/allowed-apis',
    method: 'get'
  })
}

export function updateTokenApis(keyId, data) {
  return request({
    url: `/console/tokens/${keyId}/apis`,
    method: 'put',
    data
  })
}

export function updateTokenIpWhitelist(keyId, data) {
  return request({
    url: `/console/tokens/${keyId}/ip-whitelist`,
    method: 'put',
    data
  })
}

// ==================== 我的接口（真实接口） ====================
// GET /console/apis/used → AjaxResult { data: ConsoleUsedApiVo[] }
// 按调用流水聚合，未调用过的接口不会出现
export function getMyApis() {
  return request({
    url: '/console/apis/used',
    method: 'get'
  })
}

/** @deprecated 与 getMyApis 相同，保留给调用日志筛选项复用 */
export function getUsedApis() {
  return getMyApis()
}

// ==================== 接口调用日志（真实接口） ====================
// GET /console/logs → TableDataInfo { code, msg, rows, total }
export function getCallLogs({ pageSize = 10, beforeId = null, apiCode = '', status = '', dateRange = null } = {}) {
  const params = {
    pageSize
  }
  if (beforeId) params.beforeId = beforeId
  if (apiCode) params.apiCode = apiCode
  if (status) params.status = status
  if (dateRange && dateRange.length === 2) {
    params.beginDate = dateRange[0]
    params.endDate = dateRange[1]
  }
  return request({
    url: '/console/logs',
    method: 'get',
    params
  })
}

// ==================== 安全设置 ====================
export function getSecuritySettings() {
  return delay(ok({
    smsVerify: true,
    loginProtect: false
  }))
}

export function saveSecuritySettings(settings) {
  return delay(ok(settings))
}

// ==================== 登录日志（真实接口） ====================
// GET /console/login-logs → TableDataInfo { code, msg, rows, total }
// status: success | fail；不传表示全部（不要传 all）
export function getLoginLogs({ page = 1, pageSize = 10, status = 'all' } = {}) {
  const params = {
    pageNum: page,
    pageSize
  }
  if (status && status !== 'all') {
    params.status = status
  }
  return request({
    url: '/console/login-logs',
    method: 'get',
    params
  })
}

// ==================== 消息通知 ====================
export function getMessages({ page = 1, pageSize = 8, type = '' } = {}) {
  const params = { pageNum: page, pageSize }
  if (type && type !== 'all') params.type = type
  return request({ url: '/console/messages', method: 'get', params })
}

/** 查询全部及各消息类型的未读数量。 */
export function getMessageUnreadCounts() {
  return request({ url: '/console/messages/unread-counts', method: 'get' })
}

export function readMessage(id) {
  return request({ url: `/console/messages/${id}/read`, method: 'put' })
}

export function readAllMessages(type = '') {
  const params = {}
  if (type && type !== 'all') params.type = type
  return request({ url: '/console/messages/read-all', method: 'put', params })
}

// ==================== 消息通知配置 ====================
export function getNotifyConfig() {
  return delay(ok({
    config: {
      siteMsg: true,
      sms: true,
      email: false
    },
    types: [
      { name: '系统公告', desc: '平台功能更新、服务变更等重要公告', site: true, sms: true, email: true },
      { name: '订单消息', desc: '充值成功、消费扣费、余额不足提醒', site: true, sms: true, email: false },
      { name: '工单回复', desc: '工单有新的处理进度或回复', site: true, sms: false, email: false },
      { name: '接口告警', desc: '接口调用异常、成功率下降告警', site: true, sms: true, email: true }
    ]
  }))
}

export function saveNotifyConfig(data) {
  return delay(ok(data))
}

// ==================== 工单管理 ====================
export function getTickets({ page = 1, pageSize = 10, status = '', category = '' } = {}) {
  const params = { pageNum: page, pageSize }
  if (status) params.status = status
  if (category) params.category = category
  return request({ url: '/console/tickets', method: 'get', params })
}

export function getTicketDetail(ticketId) {
  return request({ url: `/console/tickets/${ticketId}`, method: 'get' })
}

/** 查询当前用户已支付且尚未申请开票的订单。 */
export function getInvoiceableOrders() {
  return request({ url: '/console/tickets/invoice/orders', method: 'get' })
}

function ticketFormData(data, files = []) {
  const form = new FormData()
  form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }))
  files.forEach(file => form.append('files', file.raw || file))
  return form
}

export function createTicket(data, files = []) {
  return request({ url: '/console/tickets', method: 'post', data: ticketFormData(data, files), headers: { 'Content-Type': 'multipart/form-data' } })
}

export function replyTicket(ticketId, content, files = []) {
  return request({ url: `/console/tickets/${ticketId}/messages`, method: 'post', data: ticketFormData({ content }, files), headers: { 'Content-Type': 'multipart/form-data' } })
}

export function closeTicket(ticketId) {
  return request({ url: `/console/tickets/${ticketId}/close`, method: 'put' })
}

export function reopenTicket(ticketId) {
  return request({ url: `/console/tickets/${ticketId}/reopen`, method: 'put' })
}

export function downloadTicketAttachment(attachmentId) {
  return request({ url: `/console/tickets/attachments/${attachmentId}/download`, method: 'get', responseType: 'blob' })
}

// ==================== 订单管理 ====================
/** 查询余额、累计充值、套餐支出和累计消费。 */
export function getOrderSummary() {
  return request({ url: '/console/orders/summary', method: 'get' })
}

/** 查询余额充值与套餐购买的统一交易订单。 */
export function getOrderPage({ page = 1, pageSize = 10, orderType = '', status = '', orderNo = '', dateRange = null } = {}) {
  const params = { pageNum: page, pageSize }
  if (orderType) params.orderType = orderType
  if (status) params.status = status
  if (orderNo) params.orderNo = orderNo
  if (dateRange && dateRange.length === 2) {
    params.beginDate = dateRange[0]
    params.endDate = dateRange[1]
  }
  return request({ url: '/console/orders/page', method: 'get', params })
}

/** 查询成功接口调用产生的余额消费流水。 */
export function getConsumeRecordPage({ page = 1, pageSize = 10, dateRange = null } = {}) {
  const params = { pageNum: page, pageSize }
  if (dateRange && dateRange.length === 2) {
    params.beginDate = dateRange[0]
    params.endDate = dateRange[1]
  }
  return request({ url: '/console/orders/consume-records', method: 'get', params })
}

// ==================== 发票管理 ====================
export function getInvoices() {
  return delay(ok({
    finance: { balance: 10 },
    titles: [
      { id: 1, type: '企业', name: '某某科技有限公司', taxNo: '91440300MA5XXXXXX0', isDefault: true },
      { id: 2, type: '个人', name: '张三', taxNo: '', isDefault: false }
    ],
    records: [
      { invoiceNo: 'FV202607010001', title: '某某科技有限公司', type: '增值税普通发票', amount: 50, applyTime: '2026-07-05 10:00:00', status: '已开票' },
      { invoiceNo: 'FV202607200002', title: '某某科技有限公司', type: '增值税普通发票', amount: 50, applyTime: '2026-07-25 09:30:00', status: '已开票' }
    ]
  }))
}

export function addInvoiceTitle(data) {
  return delay(ok(data))
}

export function applyInvoice(data) {
  return delay(ok(data))
}

// ==================== 礼品兑换 ====================
export function redeemGift(code) {
  const valid = /^GIFT-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(code)
  if (!valid) {
    return delay(fail('兑换码无效或已过期'))
  }
  return delay(ok({ gift: '¥5 余额券' }))
}

export function getGifts() {
  return delay(ok([
    { id: 1, name: '¥5 余额券', desc: '充值满 ¥10 可用，有效期 30 天', icon: 'Wallet', color: '#f59e0b' },
    { id: 2, name: '1000次调用券', desc: '任意计次接口免费调用 1000 次', icon: 'Lightning', color: '#3a7afe' },
    { id: 3, name: '7天会员体验卡', desc: '开通后 7 天内会员接口免费调用', icon: 'Crown', color: '#8b5cf6' }
  ]))
}

export function getGiftRecords() {
  return delay(ok([
    { time: '2026-08-10 15:22:00', code: 'GIFT-8F2A-9C1E', gift: '¥5 余额券', status: '已使用' },
    { time: '2026-08-02 11:08:00', code: 'GIFT-3B7D-5A9F', gift: '1000次调用券', status: '已使用' }
  ]))
}

// ==================== 邀请返利 ====================
export function getInviteInfo() {
  return delay(ok({
    link: 'https://www.example.com/register?invite=AbC12345',
    stats: {
      invited: 12,
      registered: 8,
      commission: 23.5,
      withdrawable: 13.5
    },
    records: [
      { user: '用户8823', time: '2026-08-20 10:12:00', status: '已注册', recharge: 100, commission: 10 },
      { user: '用户7712', time: '2026-08-15 14:33:00', status: '已注册', recharge: 50, commission: 5 },
      { user: '用户6654', time: '2026-08-10 09:45:00', status: '已注册', recharge: 30, commission: 3 },
      { user: '用户5521', time: '2026-08-05 16:20:00', status: '已注册', recharge: 20, commission: 2 },
      { user: '用户4408', time: '2026-07-28 11:02:00', status: '已注册', recharge: 0, commission: 0 },
      { user: '用户3319', time: '2026-07-20 08:55:00', status: '已注册', recharge: 35, commission: 3.5 }
    ]
  }))
}

export function withdraw() {
  return delay(ok({}))
}
