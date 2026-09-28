/**
 * Open API 网关层公共错误码（与 OpenApiAuthServiceImpl 对齐）
 * scopes: all=全部接口；payg=计次；free/vip=套餐权限类（非计次计费路径）
 */
export const PLATFORM_ERROR_CODES = [
  {
    httpStatus: 401,
    msg: 'API Key 无效或已停用',
    desc: 'Token 不存在、格式错误或已被禁用',
    action: { text: '管理 Token', path: '/console/token' },
    scopes: ['all']
  },
  {
    httpStatus: 403,
    msg: '客户账号已停用',
    desc: '账号被管理员停用',
    scopes: ['all']
  },
  {
    httpStatus: 403,
    msg: '未开通有效套餐',
    desc: '账号下无有效订阅',
    action: { text: '开通会员', path: '/vip' },
    scopes: ['all']
  },
  {
    httpStatus: 403,
    msg: '套餐已过期',
    desc: '当前订阅已过有效期',
    action: { text: '续费会员', path: '/vip' },
    scopes: ['all']
  },
  {
    httpStatus: 403,
    msg: '当前套餐未授权该接口',
    desc: '指定接口模式下，套餐未包含此 API',
    action: { text: '查看会员', path: '/vip' },
    scopes: ['free', 'vip']
  },
  {
    httpStatus: 403,
    msg: '当前套餐未包含该类型接口',
    desc: '套餐 API 范围不含当前计费类型',
    action: { text: '查看会员', path: '/vip' },
    scopes: ['free', 'vip']
  },
  {
    httpStatus: 403,
    msg: '当前 API Key 未授权该接口',
    desc: 'Key 为指定接口模式，未勾选此 API',
    action: { text: '管理 Token', path: '/console/token' },
    scopes: ['all']
  },
  {
    httpStatus: 403,
    msg: '余额不足，请先充值',
    desc: '计次接口扣费失败',
    action: { text: '去充值', path: '/console/orders' },
    scopes: ['payg']
  },
  {
    httpStatus: 429,
    msg: '请求过于频繁，已超过当前接口 QPS 限制',
    desc: '单秒请求数超过当前套餐限制',
    scopes: ['all']
  },
  {
    httpStatus: 429,
    msg: '当前接口今日调用次数已用完',
    desc: '当日调用次数已达到当前套餐上限',
    scopes: ['all']
  }
]

export function filterPlatformErrorCodes(chargeType) {
  const type = chargeType || 'free'
  return PLATFORM_ERROR_CODES.filter(
    (row) => row.scopes.includes('all') || row.scopes.includes(type)
  )
}
