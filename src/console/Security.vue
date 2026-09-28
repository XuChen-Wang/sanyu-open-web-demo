<template>
  <div class="security-page">
    <!-- 登录密码 -->
    <div class="card sec-card">
      <h3 class="card-title">
        <el-icon color="#3a7afe"><Lock /></el-icon>
        登录密码
      </h3>
      <div class="sec-row">
        <div class="sec-info">
          <div class="sec-name">账号密码</div>
          <div class="sec-desc">
            {{ hasPassword ? '登录密码用于账号密码方式登录，建议定期更换' : '尚未设置登录密码，请先设置后方可使用账号密码登录' }}
          </div>
        </div>
        <div class="sec-action">
          <span class="sec-state" :class="{ unset: !hasPassword }">{{ hasPassword ? '已设置' : '未设置' }}</span>
          <el-button round type="primary" @click="openPwdDialog">
            {{ hasPassword ? '修改密码' : '设置密码' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 修改/设置密码弹窗 -->
    <el-dialog v-model="pwdVisible" :title="hasPassword ? '修改登录密码' : '设置登录密码'" width="420px">
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="90px">
        <el-form-item v-if="hasPassword" label="原密码" prop="oldPwd">
          <el-input v-model="pwdForm.oldPwd" type="password" show-password placeholder="请输入原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPwd">
          <el-input v-model="pwdForm.newPwd" type="password" show-password placeholder="6-32 位密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPwd">
          <el-input v-model="pwdForm.confirmPwd" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary" :loading="pwdSubmitting" @click="onChangePwd">
          {{ hasPassword ? '确认修改' : '确认设置' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script>
import { Lock } from '@element-plus/icons-vue'
import { changePassword } from '@/api/user'
import { useUserStore } from '@/store/modules/user'

export default {
  name: 'ConsoleSecurity',
  components: { Lock },
  data() {
    const validateOldPwd = (rule, value, callback) => {
      if (this.hasPassword && !value) {
        callback(new Error('请输入原密码'))
      } else {
        callback()
      }
    }
    return {
      userStore: useUserStore(),
      pwdVisible: false,
      pwdSubmitting: false,
      pwdForm: {
        oldPwd: '',
        newPwd: '',
        confirmPwd: ''
      },
      pwdRules: {
        oldPwd: [{ validator: validateOldPwd, trigger: 'blur' }],
        newPwd: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 32, message: '密码长度为 6-32 位', trigger: 'blur' }
        ],
        confirmPwd: [
          { required: true, message: '请再次输入新密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.pwdForm.newPwd) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    hasPassword() {
      return this.userStore.hasPassword === true
    }
  },
  methods: {
    openPwdDialog() {
      this.pwdForm = { oldPwd: '', newPwd: '', confirmPwd: '' }
      this.pwdVisible = true
      this.$nextTick(() => {
        this.$refs.pwdFormRef && this.$refs.pwdFormRef.clearValidate()
      })
    },
    async onChangePwd() {
      this.$refs.pwdFormRef.validate(async valid => {
        if (!valid) return
        this.pwdSubmitting = true
        const isChange = this.hasPassword
        try {
          const payload = { newPassword: this.pwdForm.newPwd }
          if (isChange) {
            payload.oldPassword = this.pwdForm.oldPwd
          }
          const res = await changePassword(payload)
          if (res.code === 200) {
            this.userStore.markPasswordSet()
            this.$message.success(isChange ? '密码修改成功，请牢记新密码' : '密码设置成功')
            this.pwdVisible = false
            this.pwdForm = { oldPwd: '', newPwd: '', confirmPwd: '' }
          }
        } catch (e) {
          // 错误提示已由 request 拦截器处理
        } finally {
          this.pwdSubmitting = false
        }
      })
    }
  },
  mounted() {
    this.userStore.fetchUserInfo()
  }
}
</script>

<style scoped lang="scss">

.sec-card {
  padding: 20px 28px;
  margin-bottom: 16px;

  .card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    margin: 0 0 6px;
    color: $text-primary;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-light;
  }
}

.sec-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }

  .sec-info {
    .sec-name {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
    }

    .sec-desc {
      font-size: 13px;
      color: $text-secondary;
      margin-top: 4px;
    }
  }

  .sec-action {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;

    .sec-state {
      font-size: 13px;
      color: $color-free;

      &.unset {
        color: $color-pay;
      }
    }
  }
}
</style>
