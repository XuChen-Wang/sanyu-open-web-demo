<template>
  <el-dialog
    :model-value="visible"
    title="设置登录密码"
    width="420px"
    align-center
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    class="set-pwd-dialog"
  >
    <el-alert
      type="warning"
      :closable="false"
      show-icon
      title="为保障账号安全，首次登录须设置登录密码后方可继续使用"
      style="margin-bottom: 16px"
    />
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="88px"
      size="large"
      @submit.prevent
    >
      <el-form-item label="新密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          maxlength="32"
          placeholder="6-32 位密码"
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirm">
        <el-input
          v-model="form.confirm"
          type="password"
          show-password
          maxlength="32"
          placeholder="请再次输入密码"
          autocomplete="new-password"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" class="submit-btn" :loading="submitting" @click="onSubmit">
        确认设置
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { changePassword } from '@/api/user'
import { useUserStore } from '@/store/modules/user'

export default {
  name: 'SetPasswordDialog',
  data() {
    return {
      userStore: useUserStore(),
      submitting: false,
      form: {
        password: '',
        confirm: ''
      },
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 32, message: '密码长度为 6-32 位', trigger: 'blur' }
        ],
        confirm: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.form.password) {
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
    visible() {
      return this.userStore.needSetPassword
    }
  },
  watch: {
    visible(v) {
      if (v) {
        this.form = { password: '', confirm: '' }
        this.$nextTick(() => {
          this.$refs.formRef && this.$refs.formRef.clearValidate()
        })
      }
    }
  },
  methods: {
    onSubmit() {
      this.$refs.formRef.validate(async valid => {
        if (!valid) return
        this.submitting = true
        try {
          const res = await changePassword({
            newPassword: this.form.password
          })
          if (res.code === 200) {
            this.userStore.markPasswordSet()
            this.$message.success('密码设置成功')
            // 刷新用户态，避免残留缓存
            setTimeout(() => {
              location.reload()
            }, 400)
          }
        } catch (e) {
          // 拦截器已提示
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.submit-btn {
  width: 100%;
}
</style>
