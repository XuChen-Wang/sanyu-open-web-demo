import { defineStore } from 'pinia'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getCurrentUser } from '@/api/user'
import { isAvatarUrl, avatarText } from '@/utils/avatar'

const USER_INFO_KEY = 'api-user-info'

/** 从 localStorage 恢复用户信息（token 除外，token 走 cookie） */
function loadUserInfo() {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data && typeof data === 'object') return data
    }
  } catch (e) { /* ignore */ }
  return {}
}

/** 持久化用户信息到 localStorage */
function saveUserInfo(state) {
  try {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify({
      id: state.id,
      phone: state.phone,
      nickName: state.nickName,
      avatar: state.avatar,
      balance: state.balance,
      isVip: state.isVip,
      vipLevel: state.vipLevel,
      freeTimes: state.freeTimes,
      hasPassword: state.hasPassword,
      registerTime: state.registerTime,
      infoLoaded: state.infoLoaded
    }))
  } catch (e) { /* ignore */ }
}

/** 清除 localStorage 中的用户信息 */
function clearUserInfo() {
  try {
    localStorage.removeItem(USER_INFO_KEY)
  } catch (e) { /* ignore */ }
}

const saved = loadUserInfo()

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || '',
    id: saved.id || null,
    phone: saved.phone || '',
    nickName: saved.nickName || '',
    avatar: saved.avatar || '',
    balance: saved.balance ?? 0,
    isVip: saved.isVip || 0,
    vipLevel: saved.vipLevel ?? 0,
    freeTimes: saved.freeTimes ?? 1000,
    /** null=未知，需等 /me 或登录回包；false=未设置；true=已设置 */
    hasPassword: typeof saved.hasPassword === 'boolean' ? saved.hasPassword : null,
    registerTime: saved.registerTime || '',
    infoLoaded: saved.infoLoaded || false
  }),

  getters: {
    isLogin: (state) => !!state.token,
    displayName: (state) => state.nickName || state.phone || '用户',
    /** 已登录且明确未设置密码 → 强制设密 */
    needSetPassword: (state) => !!state.token && state.hasPassword === false,
    /** 可作 img 的头像 URL；预设 emoji 时为空 */
    avatarSrc: (state) => (isAvatarUrl(state.avatar) ? state.avatar : ''),
    /** 头像文字/emoji */
    avatarChar: (state) => avatarText(state.avatar, state.nickName || state.phone || '用户')
  },

  actions: {
    // 登录成功后保存信息
    setLoginData(data) {
      this.token = data.token || ''
      this.id = data.id
      this.phone = data.phone || ''
      this.nickName = data.nickName || ''
      this.avatar = data.avatar || ''
      this.balance = data.balance ?? this.balance
      this.isVip = data.isVip ?? this.isVip
      this.vipLevel = data.vipLevel ?? this.vipLevel
      this.freeTimes = data.freeTimes ?? this.freeTimes
      if (data.hasPassword !== undefined && data.hasPassword !== null) {
        this.hasPassword = !!data.hasPassword
      }
      if (data.registerTime !== undefined && data.registerTime !== null) {
        this.registerTime = data.registerTime
      }
      this.infoLoaded = true
      setToken(this.token)
      saveUserInfo(this.$state)
    },

    /** 更新用户资料（昵称/头像） */
    updateProfile(data) {
      if (data.nickName !== undefined) this.nickName = data.nickName
      if (data.avatar !== undefined) this.avatar = data.avatar
      if (data.registerTime !== undefined && data.registerTime !== null) {
        this.registerTime = data.registerTime
      }
      saveUserInfo(this.$state)
    },

    /** 更新余额/会员等信息 */
    updateAsset(data) {
      if (data.balance !== undefined) this.balance = data.balance
      if (data.isVip !== undefined) this.isVip = data.isVip
      if (data.vipLevel !== undefined) this.vipLevel = data.vipLevel
      if (data.freeTimes !== undefined) this.freeTimes = data.freeTimes
      saveUserInfo(this.$state)
    },

    markPasswordSet() {
      this.hasPassword = true
      saveUserInfo(this.$state)
    },

    /** 拉取当前登录用户信息（GET /portal/auth/me） */
    async fetchUserInfo() {
      if (!this.token) return null
      try {
        const res = await getCurrentUser()
        if (res.code === 200 && res.data) {
          const d = res.data
          this.id = d.id ?? this.id
          this.phone = d.phone ?? this.phone
          this.nickName = d.nickName ?? this.nickName
          this.avatar = d.avatar ?? this.avatar
          this.balance = d.balance ?? this.balance
          this.isVip = d.isVip ?? this.isVip
          this.freeTimes = d.freeTimes ?? this.freeTimes
          if (d.hasPassword !== undefined && d.hasPassword !== null) {
            this.hasPassword = !!d.hasPassword
          }
          if (d.registerTime !== undefined && d.registerTime !== null) {
            this.registerTime = d.registerTime
          }
          this.infoLoaded = true
          saveUserInfo(this.$state)
          return res.data
        }
        return null
      } catch (e) {
        return null
      }
    },

    // 退出登录
    logout() {
      this.token = ''
      this.id = null
      this.phone = ''
      this.nickName = ''
      this.avatar = ''
      this.balance = 0
      this.isVip = 0
      this.vipLevel = 0
      this.freeTimes = 1000
      this.hasPassword = null
      this.registerTime = ''
      this.infoLoaded = false
      removeToken()
      clearUserInfo()
    }
  }
})
