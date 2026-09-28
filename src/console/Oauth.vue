<template>
  <div class="oauth-page">
    <div class="card oauth-card">
      <h3 class="card-title">第三方账号</h3>
      <div class="oauth-list">
        <div v-for="item in accounts" :key="item.type" class="oauth-row">
          <span class="oauth-icon" :style="{ background: item.color + '1a', color: item.color }">
            <el-icon :size="20"><component :is="item.icon" /></el-icon>
          </span>
          <div class="oauth-info">
            <div class="oauth-name">{{ item.name }}</div>
            <div class="oauth-desc">{{ item.desc }}</div>
          </div>
          <div class="oauth-action">
            <template v-if="item.bound">
              <span class="bound-user">
                <el-icon color="#10b981"><CircleCheckFilled /></el-icon>
                {{ item.boundName || '已绑定' }}
              </span>
              <el-button size="small" text type="danger" @click="onUnbind(item)">解绑</el-button>
            </template>
            <el-button v-else size="small" type="primary" round @click="onBind(item)">绑定</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="card oauth-card">
      <h3 class="card-title">绑定说明</h3>
      <div class="oauth-tips">
        <p>1. 绑定第三方账号后，可使用第三方平台快速登录，无需输入手机号和验证码。</p>
        <p>2. 每个第三方账号只能绑定一个平台账号，解绑后可使用其他账号重新绑定。</p>
        <p>3. 为保障账号安全，解绑操作需要短信验证码确认。</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConsoleOauth',
  data() {
    return {
      accounts: [
        { type: 'wechat', name: '微信', desc: '绑定后可使用微信扫码快速登录', icon: 'ChatDotRound', color: '#07c160', bound: true, boundName: '微***信' },
        { type: 'qq', name: 'QQ', desc: '绑定后可使用 QQ 快速登录', icon: 'ChatLineSquare', color: '#12b7f5', bound: false },
        { type: 'github', name: 'GitHub', desc: '面向开发者的第三方登录方式', icon: 'Monitor', color: '#1f2328', bound: false },
        { type: 'gitee', name: 'Gitee', desc: '绑定后可使用 Gitee 快速登录', icon: 'Folder', color: '#c71d23', bound: false },
        { type: 'apple', name: 'Apple', desc: '绑定后可使用 Apple ID 快速登录', icon: 'Iphone', color: '#555', bound: false }
      ]
    }
  },
  methods: {
    onBind(item) {
      this.$message.success(`正在跳转${item.name}授权…（演示环境模拟绑定成功）`)
      setTimeout(() => {
        item.bound = true
        item.boundName = item.name + '用户'
      }, 800)
    },
    onUnbind(item) {
      this.$confirm(`确定解绑${item.name}吗？解绑后将无法使用${item.name}快速登录。`, '解绑确认', {
        confirmButtonText: '解绑',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        item.bound = false
        item.boundName = ''
        this.$message.success('已解绑')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped lang="scss">

.oauth-card {
  padding: 20px 28px;
  margin-bottom: 16px;

  .card-title {
    font-size: 16px;
    margin: 0 0 6px;
    color: $text-primary;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-light;
  }
}

.oauth-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }

  .oauth-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .oauth-info {
    flex: 1;

    .oauth-name {
      font-size: 15px;
      font-weight: 600;
      color: $text-primary;
    }

    .oauth-desc {
      font-size: 13px;
      color: $text-secondary;
      margin-top: 2px;
    }
  }

  .oauth-action {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;

    .bound-user {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: $text-regular;
    }
  }
}

.oauth-tips {
  font-size: 13px;
  color: $text-regular;
  line-height: 2;

  p {
    margin: 0;
  }
}
</style>
