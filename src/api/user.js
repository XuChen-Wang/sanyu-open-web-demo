/**
 * 用户接口（滑块验证/短信/登录/密码/会话）
 * 开发环境经 Vite 将 /api 代理到 VITE_PROXY_TARGET
 * 鉴权：登录后请求头 token（PortalToken）
 */
import request from '@/utils/request'

// ==================== 滑块验证码 ====================

// 查询是否开启滑块（前端据此决定发短信前是否弹滑块）
export function getCaptchaConfig() {
  return request({
    url: '/portal/auth/captcha/config',
    method: 'get'
  })
}

// 获取拼图滑块（背景图/滑块块图/缺口位置）
export function getSliderCaptcha() {
  return request({
    url: '/portal/auth/captcha/slider',
    method: 'get'
  })
}

// 校验滑块位置，成功返回一次性 ticket（用于发短信）
export function checkSliderCaptcha(data) {
  return request({
    url: '/portal/auth/captcha/slider/check',
    method: 'post',
    data
  })
}

// ==================== 短信验证码 ====================

// 发送短信验证码（开启滑块时必须传 captchaTicket）
export function sendSmsCode(mobile, captchaTicket) {
  return request({
    url: '/portal/auth/sms/send',
    method: 'post',
    data: { mobile, captchaTicket }
  })
}

// ==================== 登录 / 注册 ====================

// 短信验证码登录（未注册自动注册，newlyRegistered=true）
export function loginByCode(mobile, code) {
  return request({
    url: '/portal/auth/login/sms',
    method: 'post',
    data: { mobile, code }
  })
}

// 短信注册（与短信登录同逻辑，兼容前端 registerByCode 命名）
export function registerByCode(mobile, code) {
  return request({
    url: '/portal/auth/register',
    method: 'post',
    data: { mobile, code }
  })
}

// 账号密码登录（account 当前按手机号查询）
export function loginByPassword(account, password) {
  return request({
    url: '/portal/auth/login/password',
    method: 'post',
    data: { account, password }
  })
}

// ==================== 密码 ====================

// 找回密码（公开接口：手机号 + 短信验证码 + 新密码）
export function resetPassword(data) {
  return request({
    url: '/portal/auth/password/reset',
    method: 'post',
    data
  })
}

// 修改密码（需登录；若账号无密码可不传 oldPassword）
export function changePassword(data) {
  return request({
    url: '/portal/auth/password/change',
    method: 'post',
    data
  })
}

// ==================== 会话 ====================

// 获取当前登录用户（需登录）
export function getCurrentUser() {
  return request({
    url: '/portal/auth/me',
    method: 'get'
  })
}

// 更新基本资料（昵称 / 预设头像）
export function updateProfile(data) {
  return request({
    url: '/portal/auth/profile',
    method: 'post',
    data
  })
}

// 退出登录（需登录，使当前 token 失效）
export function logout() {
  return request({
    url: '/portal/auth/logout',
    method: 'post'
  })
}

// ==================== 申请接口（暂为本地模拟，后端未提供该接口） ====================

// 申请接口
export function applyApi(apiId) {
  return Promise.resolve({
    code: 200,
    msg: 'success',
    data: { apiId, status: 'approved', appliedAt: new Date().toLocaleString('zh-CN') }
  })
}
