<template>
  <el-dialog
    v-model="visible"
    title=""
    width="800px"
    :show-close="true"
    :close-on-click-modal="false"
    align-center
    class="login-dialog"
    @closed="onClosed"
  >
    <div class="ld-wrap">
      <!-- 左侧：品牌宣传区 -->
      <div class="ld-left">
        <div class="ld-left-head">
          <div class="ld-left-logo">
            <span class="logo-icon">
              <el-icon :size="16"><Connection /></el-icon>
            </span>
            <span class="logo-text">三域聚合<span class="logo-accent">开放平台</span></span>
          </div>
        </div>
        <div class="ld-left-body">
          <h3 class="ld-left-title">为什么选择<br />三域聚合开放平台？</h3>
          <ul class="ld-left-features">
            <li>
              <span class="feat-emoji">🎁</span>
              <span>提供数百个免费API接口，让您快速、低成本接入 API。</span>
            </li>
            <li>
              <span class="feat-emoji">🚀</span>
              <span>API管理、测试、鉴权、日志等功能，让您无忧探索广阔的API世界~</span>
            </li>
            <li>
              <span class="feat-emoji">🔥</span>
              <span>国内外一线机构投资，让我们能够专注于为用户提供更优质的服务。</span>
            </li>
          </ul>
        </div>
        <div class="ld-left-foot">100+ 优质接口 · 1000+ 合作企业 · 99.9% 可用性</div>
      </div>

      <!-- 右侧：登录表单区 -->
      <div class="ld-right">
        <div class="ld-head">
          <div class="ld-title">欢迎回来</div>
          <div class="ld-sub">注册即送 1000 次免费调用额度</div>
        </div>

        <!-- Tab：快捷登录/注册 | 账号密码登录 -->
        <div class="ld-tabs">
          <span class="tab-item" :class="{ active: tab === 'quick' }" @click="switchTab('quick')">快捷登录/注册</span>
          <span class="tab-item" :class="{ active: tab === 'pwd' }" @click="switchTab('pwd')">账号密码登录</span>
        </div>

        <!-- 快捷登录/注册：手机号 + 验证码 -->
        <div v-if="tab === 'quick'" class="ld-body">
          <el-form
            key="quick-form"
            :model="quickForm"
            :rules="quickRules"
            ref="quickFormRef"
            size="large"
          >
            <el-form-item prop="phone">
              <el-input v-model="quickForm.phone" placeholder="请输入手机号" maxlength="11" clearable>
                <template #prefix>
                  <el-icon><Iphone /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="code">
              <div class="code-row">
                <el-input v-model="quickForm.code" placeholder="请输入验证码" maxlength="6" clearable>
                  <template #prefix>
                    <el-icon><Message /></el-icon>
                  </template>
                </el-input>
                <el-button class="code-btn" :disabled="countdown > 0" :loading="sending" @click="sendCode">
                  {{ countdown > 0 ? countdown + 's 后重发' : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
            <el-form-item prop="agree">
              <div class="agreement">
                <el-checkbox v-model="quickForm.agree">我已阅读并同意</el-checkbox>
                <a href="javascript:;" class="link" @click="openAgreement('service')">《服务协议》</a>
                <a href="javascript:;" class="link" @click="openAgreement('privacy')">《隐私政策》</a>
              </div>
            </el-form-item>
          </el-form>

          <el-button type="primary" class="submit-btn" size="large" :loading="submitting" @click="onQuickSubmit">
            登 录 / 注 册
          </el-button>

          <div class="ld-tip">未注册的手机号验证后将自动创建新账号</div>
        </div>

        <!-- 账号密码登录 -->
        <div v-else class="ld-body">
          <el-form
            key="pwd-form"
            :model="pwdForm"
            :rules="pwdRules"
            ref="pwdFormRef"
            size="large"
          >
            <el-form-item prop="account">
              <el-input
                v-model="pwdForm.account"
                placeholder="请输入手机号/账号"
                maxlength="11"
                clearable
                name="account"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="pwdForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                name="password"
                @keyup.enter="onPwdSubmit"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            <div class="pwd-extra">
              <el-checkbox v-model="rememberPwd">记住密码</el-checkbox>
              <a href="javascript:;" class="link" @click="openForget">忘记密码？</a>
            </div>
          </el-form>

          <el-button type="primary" class="submit-btn" size="large" :loading="submitting" @click="onPwdSubmit">
            登 录
          </el-button>

          <div class="ld-tip">
            还没有账号？
            <a href="javascript:;" class="link" @click="switchTab('quick')">手机号快捷注册</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 滑块验证弹窗（发短信前） -->
    <el-dialog
      v-model="captchaVisible"
      title="安全验证"
      width="343px"
      align-center
      append-to-body
      :close-on-click-modal="false"
      :show-close="false"
      class="captcha-dialog"
    >
      <SliderCaptcha @success="onCaptchaSuccess" />
    </el-dialog>

    <!-- 找回密码弹窗 -->
    <el-dialog v-model="forgetVisible" title="找回密码" width="420px" append-to-body style="margin-top: 30%;">
      <el-form :model="forgetForm" :rules="forgetRules" ref="forgetFormRef" size="large">
        <el-form-item prop="phone">
          <el-input v-model="forgetForm.phone" placeholder="请输入已注册手机号" maxlength="11" clearable autocomplete="off">
            <template #prefix><el-icon><Iphone /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code">
          <div class="code-row">
            <el-input v-model="forgetForm.code" placeholder="请输入短信验证码" maxlength="6" clearable autocomplete="off">
              <template #prefix><el-icon><Message /></el-icon></template>
            </el-input>
            <el-button class="code-btn" :disabled="forgetCountdown > 0" :loading="forgetSending" @click="sendForgetCode">
              {{ forgetCountdown > 0 ? forgetCountdown + 's 后重发' : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item prop="newPwd">
          <el-input v-model="forgetForm.newPwd" type="password" placeholder="请输入新密码（6-32位）" show-password autocomplete="new-password">
            <template #prefix><el-icon><Lock /></el-icon></template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="forgetVisible = false">取消</el-button>
        <el-button type="primary" :loading="forgetSubmitting" @click="onForgetSubmit">确认重置</el-button>
      </template>
    </el-dialog>

    <!-- 协议弹窗由全局 SiteContentDialog 统一承接 -->
  </el-dialog>
</template>

<script>
import { sendSmsCode, loginByCode, loginByPassword, getCaptchaConfig, resetPassword } from '@/api/user'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import SliderCaptcha from '@/components/SliderCaptcha.vue'
import { Connection, Iphone, Message, User, Lock } from '@element-plus/icons-vue'

export default {
  name: 'LoginDialog',
  components: { SliderCaptcha, Connection, Iphone, Message, User, Lock },
  data() {
    return {
      appStore: useAppStore(),
      userStore: useUserStore(),
      // quick=快捷登录/注册（手机验证码） pwd=账号密码登录
      tab: 'quick',
      quickForm: { phone: '', code: '', agree: false },
      quickRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { pattern: /^\d{6}$/, message: '验证码为 6 位数字', trigger: 'blur' }
        ]
      },
      pwdForm: { account: '', password: '' },
      pwdRules: {
        account: [{ required: true, message: '请输入手机号/账号', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于 6 位', trigger: 'blur' }
        ]
      },
      rememberPwd: true,
      countdown: 0,
      sending: false,
      submitting: false,
      timer: null,
      // 滑块验证
      captchaVisible: false,
      captchaEnabled: true,
      captchaTicket: '',
      captchaContext: 'quick', // quick=快捷登录发短信 forget=找回密码发短信
      // 找回密码
      forgetVisible: false,
      forgetForm: { phone: '', code: '', newPwd: '' },
      forgetRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { pattern: /^\d{6}$/, message: '验证码为 6 位数字', trigger: 'blur' }
        ],
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 32, message: '密码长度为 6-32 位', trigger: 'blur' }
        ]
      },
      forgetCountdown: 0,
      forgetSending: false,
      forgetSubmitting: false,
      forgetTimer: null
    }
  },
  computed: {
    visible: {
      get() {
        return this.appStore.loginVisible
      },
      set(val) {
        if (!val) this.appStore.closeLogin()
      }
    }
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
    if (this.forgetTimer) clearInterval(this.forgetTimer)
  },
  methods: {
    onClosed() {
      // 关闭时清空表单
      if (this.timer) clearInterval(this.timer)
      if (this.forgetTimer) clearInterval(this.forgetTimer)
      this.countdown = 0
      this.forgetCountdown = 0
      this.captchaVisible = false
      this.quickForm = { phone: '', code: '', agree: false }
      this.pwdForm = { account: '', password: '' }
    },
    switchTab(tab) {
      this.tab = tab
      if (this.timer) clearInterval(this.timer)
      this.countdown = 0
      this.$nextTick(() => {
        this.$refs.quickFormRef && this.$refs.quickFormRef.clearValidate()
        this.$refs.pwdFormRef && this.$refs.pwdFormRef.clearValidate()
      })
    },

    // ========== 发短信（带滑块前置验证） ==========
    async sendCode() {
      if (!/^1[3-9]\d{9}$/.test(this.quickForm.phone)) {
        this.$message.warning('请先输入正确的手机号')
        return
      }
      // 1. 查询是否开启滑块
      try {
        const cfg = await getCaptchaConfig()
        this.captchaEnabled = cfg.code === 200 ? cfg.data.enabled : true
      } catch (e) {
        this.captchaEnabled = true
      }
      if (this.captchaEnabled) {
        // 2. 弹出滑块验证
        this.captchaTicket = ''
        this.captchaContext = 'quick'
        this.captchaVisible = true
      } else {
        // 3. 未开启滑块，直接发送
        this.doSendSms(this.quickForm.phone, '')
      }
    },
    // 滑块验证成功回调
    onCaptchaSuccess(data) {
      if (data && data.ticket) {
        this.captchaTicket = data.ticket
        this.captchaVisible = false
        if (this.captchaContext === 'quick') {
          // 用滑块 ticket 发送短信（快捷登录）
          this.doSendSms(this.quickForm.phone, this.captchaTicket)
        } else {
          // 找回密码发短信
          this.doSendForgetSms(this.captchaTicket)
        }
      }
    },
    async doSendSms(phone, captchaTicket) {
      this.sending = true
      try {
        const res = await sendSmsCode(phone, captchaTicket)
        if (res.code === 200) {
          this.$message.success('验证码已发送，请注意查收短信')
          this.countdown = 60
          this.timer = setInterval(() => {
            this.countdown--
            if (this.countdown <= 0) clearInterval(this.timer)
          }, 1000)
        }
      } catch (e) {
      } finally {
        this.sending = false
      }
    },

    // ========== 快捷登录（短信） ==========
    async onQuickSubmit() {
      if (!this.quickForm.agree) {
        this.$message.warning('请先阅读并同意服务协议与隐私政策')
        return
      }
      this.$refs.quickFormRef.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          const res = await loginByCode(this.quickForm.phone, this.quickForm.code)
          if (res.code === 200) {
            const newly = res.data && res.data.newlyRegistered
            this.afterLogin(res.data, newly ? '注册成功，已自动登录！' : '登录成功，欢迎回来！')
          }
        } catch (e) {
          // 错误提示已由 request 拦截器处理
        } finally {
          this.submitting = false
        }
      })
    },

    // ========== 账号密码登录 ==========
    async onPwdSubmit() {
      this.$refs.pwdFormRef.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          const res = await loginByPassword(this.pwdForm.account, this.pwdForm.password)
          if (res.code === 200) {
            this.afterLogin(res.data, '登录成功，欢迎回来！')
          }
        } catch (e) {
          // 错误提示已由 request 拦截器处理
        } finally {
          this.submitting = false
        }
      })
    },

    // ========== 找回密码 ==========
    openForget() {
      this.forgetVisible = true
      this.forgetForm = { phone: '', code: '', newPwd: '' }
    },
    async sendForgetCode() {
      if (!/^1[3-9]\d{9}$/.test(this.forgetForm.phone)) {
        this.$message.warning('请先输入正确的手机号')
        return
      }
      try {
        const cfg = await getCaptchaConfig()
        this.captchaEnabled = cfg.code === 200 ? cfg.data.enabled : true
      } catch (e) {
        this.captchaEnabled = true
      }
      if (this.captchaEnabled) {
        this.captchaTicket = ''
        this.captchaContext = 'forget'
        this.captchaVisible = true
      } else {
        this.doSendForgetSms('')
      }
    },
    async doSendForgetSms(captchaTicket) {
      this.forgetSending = true
      try {
        const res = await sendSmsCode(this.forgetForm.phone, captchaTicket)
        if (res.code === 200) {
          this.$message.success('验证码已发送，请注意查收短信')
          this.forgetCountdown = 60
          this.forgetTimer = setInterval(() => {
            this.forgetCountdown--
            if (this.forgetCountdown <= 0) clearInterval(this.forgetTimer)
          }, 1000)
        }
      } catch (e) {
        // 错误已由拦截器提示
      } finally {
        this.forgetSending = false
      }
    },
    async onForgetSubmit() {
      this.$refs.forgetFormRef.validate(async valid => {
        if (!valid) return
        this.forgetSubmitting = true
        try {
          const res = await resetPassword({
            mobile: this.forgetForm.phone,
            code: this.forgetForm.code,
            newPassword: this.forgetForm.newPwd
          })
          if (res.code === 200) {
            this.$message.success('密码重置成功，请使用新密码登录')
            this.forgetVisible = false
            this.switchTab('pwd')
            this.pwdForm.account = this.forgetForm.phone
          }
        } catch (e) {
          // 错误已由拦截器提示
        } finally {
          this.forgetSubmitting = false
        }
      })
    },

    // ========== 协议弹窗 ==========
    openAgreement(type) {
      this.appStore.openSiteContent(type)
    },

    afterLogin(data, msg) {
      this.userStore.setLoginData(data)
      this.appStore.closeLogin()
      // 未设置密码：强制引导设密，不立刻刷新
      if (data && data.hasPassword === false) {
        this.$message.success(msg)
        return
      }
      this.$message.success(msg)
      setTimeout(() => {
        location.reload()
      }, 600)
    }
  }
}
</script>

<style scoped lang="scss">
:deep(.el-input__inner) {
  /* 核心：禁用自动填充背景 */
  transition: background-color 5000s ease-in-out 0s !important;
  /* 设置你想要的背景色（可以是透明）和文字颜色 */
  background-color: transparent !important; 
}

/* 针对自动填充的不同状态进行重置 */
:deep(.el-input__inner:-webkit-autofill),
:deep(.el-input__inner:-webkit-autofill:hover),
:deep(.el-input__inner:-webkit-autofill:focus),
:deep(.el-input__inner:-webkit-autofill:active) {
  transition: background-color 5000s ease-in-out 0s !important;
}

// 左右布局容器
.ld-wrap {
  display: flex;
  overflow: hidden;
  border-radius: 8px;
}

// ===== 左侧品牌区 =====
.ld-left {
  width: 330px;
  flex-shrink: 0;
  background: linear-gradient(160deg, #1e293b 0%, #2b3a55 60%, #3a4a6b 100%);
  color: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 260px;
    height: 260px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(58, 122, 254, 0.3) 0%, transparent 70%);
    top: -60px;
    right: -60px;
  }

  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.25) 0%, transparent 70%);
    bottom: -50px;
    left: -40px;
  }
}

.ld-left-head {
  position: relative;
  z-index: 2;
}

.ld-left-logo {
  display: flex;
  align-items: center;
  gap: 6px;

  .logo-icon {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: $primary-gradient;
    border-radius: 8px;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 700;
  }

  .logo-accent {
    color: #6ea1ff;
  }
}

.ld-left-body {
  position: relative;
  z-index: 2;
  margin: auto 0;
  padding: 24px 0;

  .ld-left-title {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.4;
    margin: 0 0 24px;
  }

  .ld-left-features {
    li {
      display: flex;
      gap: 10px;
      font-size: 13px;
      line-height: 1.7;
      opacity: 0.92;
      margin-bottom: 16px;

      .feat-emoji {
        font-size: 18px;
        flex-shrink: 0;
        margin-top: 1px;
      }
    }
  }
}

.ld-left-foot {
  position: relative;
  z-index: 2;
  font-size: 12px;
  opacity: 0.65;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

// ===== 右侧表单区 =====
.ld-right {
  flex: 1;
  padding: 28px 32px 24px;
  min-width: 0;
}

.ld-head {
  text-align: center;
  margin-bottom: 4px;

  .ld-title {
    font-size: 20px;
    font-weight: 700;
    color: $text-primary;
  }

  .ld-sub {
    font-size: 13px;
    color: $text-secondary;
    margin-top: 6px;
  }
}

// Tab
.ld-tabs {
  display: flex;
  margin: 18px 0 16px;
  border-bottom: 1px solid $border-light;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 15px;
    font-weight: 600;
    color: $text-placeholder;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;

    &:hover {
      color: $primary-color;
    }

    &.active {
      color: $primary-color;
      border-bottom-color: $primary-color;
    }
  }
}

.ld-body {
  min-height: 220px;
}

.code-row {
  display: flex;
  gap: 10px;
  width: 100%;

  .el-input {
    flex: 1;
  }

  .code-btn {
    width: 128px;
    flex-shrink: 0;
    border-radius: 8px;
  }
}

.agreement {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: $text-secondary;
  flex-wrap: wrap;

  .link {
    color: $primary-color;
  }
}

.pwd-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -6px 0 14px;
  font-size: 13px;
}

.submit-btn {
  width: 100%;
  font-size: 15px;
  letter-spacing: 4px;
  border-radius: 8px;
  margin-top: 4px;
}

.ld-tip {
  text-align: center;
  font-size: 13px;
  color: $text-secondary;
  margin-top: 14px;

  .link {
    color: $primary-color;
  }
}

.demo-tip {
  margin-top: 14px;
}

.agreement-content {
  max-height: 60vh;
  overflow-y: auto;
  line-height: 1.8;
  font-size: 14px;
  color: $text-primary;
}
</style>
