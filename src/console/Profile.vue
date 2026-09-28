<template>
  <div class="profile-page">
    <!-- 基本信息 -->
    <div class="card profile-card">
      <h3 class="card-title">基本信息</h3>
      <div class="profile-row">
        <span class="profile-label">头像</span>
        <div class="avatar-edit">
          <el-avatar
            :size="64"
            :src="userStore.avatarSrc || undefined"
            class="profile-avatar"
          >
            {{ userStore.avatarChar }}
          </el-avatar>
          <el-button size="small" @click="openAvatarDialog">更换头像</el-button>
        </div>
      </div>
      <div class="profile-row">
        <span class="profile-label">昵称</span>
        <div class="profile-input">
          <el-input v-model="form.nickName" placeholder="请输入昵称" maxlength="20" show-word-limit style="width: 280px" />
          <el-button type="primary" :loading="saving" @click="onSaveProfile">保存</el-button>
        </div>
      </div>
      <div class="profile-row">
        <span class="profile-label">手机号</span>
        <div class="profile-value">
          <template v-if="userStore.phone">
            {{ maskPhone(userStore.phone) }}
            <el-tag size="small" type="success" effect="light" style="margin-left: 8px;">已绑定</el-tag>
          </template>
          <template v-else>
            未绑定
            <el-tag size="small" type="info" effect="light" style="margin-left: 8px;">未绑定</el-tag>
          </template>
          <el-button size="small" text type="primary" disabled title="即将支持">换绑</el-button>
        </div>
      </div>
      <div class="profile-row">
        <span class="profile-label">账号ID</span>
        <div class="profile-value">{{ userStore.id || '-' }}</div>
      </div>
      <div class="profile-row">
        <span class="profile-label">注册时间</span>
        <div class="profile-value">{{ registerTimeText }}</div>
      </div>
      <div class="profile-row">
        <span class="profile-label">会员状态</span>
        <div class="profile-value">
          <el-tag :type="userStore.isVip ? 'warning' : 'info'" effect="light" round>
            {{ userStore.isVip ? 'VIP 会员' : '普通用户' }}
          </el-tag>
          <el-button size="small" text type="primary" @click="$router.push('/vip')">
            {{ userStore.isVip ? '续费会员' : '升级会员' }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 账号安全入口 -->
    <div class="card profile-card">
      <h3 class="card-title">账号安全</h3>
      <div class="sec-links">
        <div class="sec-link-row" @click="$router.push('/console/security')">
          <el-icon color="#3a7afe"><Lock /></el-icon>
          <div class="sec-link-info">
            <div class="sec-link-name">登录密码与安全设置</div>
            <div class="sec-link-desc">修改登录密码</div>
          </div>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
        <div class="sec-link-row" @click="$router.push('/console/login-logs')">
          <el-icon color="#f59e0b"><Monitor /></el-icon>
          <div class="sec-link-info">
            <div class="sec-link-name">登录日志</div>
            <div class="sec-link-desc">查看最近登录记录，发现异常登录</div>
          </div>
          <el-icon class="arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 更换头像弹窗 -->
    <el-dialog v-model="avatarVisible" title="更换头像" width="420px">
      <p class="avatar-tip">选择一个预设头像</p>
      <div class="avatar-grid">
        <span
          v-for="item in avatarOptions"
          :key="item.value"
          class="avatar-item"
          :class="{ active: selectedAvatar === item.value }"
          :title="item.label"
          @click="selectedAvatar = item.value"
        >
          <el-avatar :size="48" shape="square">{{ item.value }}</el-avatar>
        </span>
      </div>
      <template #footer>
        <el-button @click="avatarVisible = false">取消</el-button>
        <el-button type="primary" :loading="avatarSaving" @click="onSaveAvatar">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Lock, Monitor, ArrowRight } from '@element-plus/icons-vue'
import { updateProfile } from '@/api/user'
import { useUserStore } from '@/store/modules/user'
import { PRESET_AVATARS } from '@/utils/avatar'

export default {
  name: 'ConsoleProfile',
  components: { Lock, Monitor, ArrowRight },
  data() {
    return {
      userStore: useUserStore(),
      form: {
        nickName: ''
      },
      saving: false,
      avatarVisible: false,
      avatarSaving: false,
      selectedAvatar: '',
      avatarOptions: PRESET_AVATARS
    }
  },
  computed: {
    registerTimeText() {
      return this.userStore.registerTime || '-'
    }
  },
  methods: {
    maskPhone(phone) {
      if (!phone) return '未绑定'
      return String(phone).replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    },
    openAvatarDialog() {
      const cur = this.userStore.avatar || ''
      this.selectedAvatar = this.avatarOptions.some((a) => a.value === cur)
        ? cur
        : (this.avatarOptions[0]?.value || '')
      this.avatarVisible = true
    },
    async onSaveProfile() {
      const nickName = (this.form.nickName || '').trim()
      if (!nickName) {
        this.$message.warning('昵称不能为空')
        return
      }
      this.saving = true
      try {
        const res = await updateProfile({
          nickName,
          avatar: this.userStore.avatar || ''
        })
        if (res.code === 200 && res.data) {
          this.applyProfile(res.data)
          this.$message.success('保存成功')
        }
      } catch (e) {
        // 错误提示已由 request 拦截器处理
      } finally {
        this.saving = false
      }
    },
    async onSaveAvatar() {
      if (!this.selectedAvatar) {
        this.$message.warning('请选择一个头像')
        return
      }
      this.avatarSaving = true
      try {
        const res = await updateProfile({
          nickName: (this.form.nickName || this.userStore.nickName || '').trim() || this.userStore.displayName,
          avatar: this.selectedAvatar
        })
        if (res.code === 200 && res.data) {
          this.applyProfile(res.data)
          this.avatarVisible = false
          this.$message.success('头像已更新')
        }
      } catch (e) {
        // ignore
      } finally {
        this.avatarSaving = false
      }
    },
    applyProfile(data) {
      this.userStore.updateProfile({
        nickName: data.nickName,
        avatar: data.avatar,
        registerTime: data.registerTime
      })
      this.form.nickName = data.nickName || this.form.nickName
    }
  },
  mounted() {
    this.form.nickName = this.userStore.nickName
    this.userStore.fetchUserInfo().then((data) => {
      if (data) {
        this.form.nickName = data.nickName || this.form.nickName
      }
    })
  }
}
</script>

<style scoped lang="scss">
.profile-card {
  padding: 24px 28px;
  margin-bottom: 16px;

  .card-title {
    font-size: 16px;
    margin: 0 0 20px;
    color: $text-primary;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-light;
  }
}

.profile-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;

  .profile-label {
    width: 90px;
    font-size: 14px;
    color: $text-secondary;
    flex-shrink: 0;
  }

  .profile-input {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .profile-value {
    font-size: 14px;
    color: $text-primary;
    display: flex;
    align-items: center;
  }
}

.avatar-edit {
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-avatar {
  background: $primary-gradient;
  color: #fff;
  font-size: 28px;
}

.sec-links {
  .sec-link-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s;

    &:hover {
      background: $bg-page;

      .arrow {
        color: $primary-color;
      }
    }

    .sec-link-info {
      flex: 1;

      .sec-link-name {
        font-size: 14px;
        font-weight: 500;
        color: $text-primary;
      }

      .sec-link-desc {
        font-size: 12px;
        color: $text-placeholder;
        margin-top: 2px;
      }
    }

    .arrow {
      color: $text-placeholder;
    }
  }
}

.avatar-tip {
  margin: 0 0 12px;
  font-size: 13px;
  color: $text-secondary;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  box-sizing: border-box;

  .avatar-item {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 0;
    padding: 2px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    box-sizing: border-box;
    background: transparent;

    .el-avatar {
      background: $primary-gradient;
      color: #fff;
      font-size: 24px;
      flex-shrink: 0;
      border-radius: 10px;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    &:hover .el-avatar {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(58, 122, 254, 0.28);
    }

    &.active .el-avatar {
      transform: none;
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px $primary-color;
    }
  }
}
</style>
