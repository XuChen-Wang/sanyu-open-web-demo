<template>
  <div class="console-layout">
    <!-- 侧边栏 -->
    <aside class="console-side" :class="{ collapsed }">
      <div class="side-top">
        <span class="side-title" v-show="!collapsed">开发者中心</span>
        <button
          type="button"
          class="collapse-btn"
          :title="collapsed ? '展开菜单' : '收起菜单'"
          @click="toggleCollapse"
        >
          <el-icon :size="16">
            <Expand v-if="collapsed" />
            <Fold v-else />
          </el-icon>
        </button>
      </div>

      <nav class="console-nav">
        <el-menu
          ref="menuRef"
          :default-active="$route.path"
          :default-openeds="openeds"
          :collapse="collapsed"
          :collapse-transition="false"
          router
          class="console-menu"
          @open="onMenuOpen"
          @close="onMenuClose"
        >
          <el-menu-item index="/console/index">
            <el-icon><Odometer /></el-icon>
            <template #title>控制台</template>
          </el-menu-item>

          <el-sub-menu index="data">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>数据中心</span>
            </template>
            <el-menu-item index="/console/token">
              <el-icon><Key /></el-icon>
              <template #title>Token管理</template>
            </el-menu-item>
            <el-menu-item index="/console/myapi">
              <el-icon><Grid /></el-icon>
              <template #title>我的接口</template>
            </el-menu-item>
            <el-menu-item index="/console/logs">
              <el-icon><Document /></el-icon>
              <template #title>接口调用日志</template>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="security">
            <template #title>
              <el-icon><Lock /></el-icon>
              <span>安全中心</span>
            </template>
            <el-menu-item index="/console/security">
              <el-icon><Aim /></el-icon>
              <template #title>安全设置</template>
            </el-menu-item>
            <el-menu-item index="/console/login-logs">
              <el-icon><Monitor /></el-icon>
              <template #title>登录日志</template>
            </el-menu-item>
          </el-sub-menu>

          <el-sub-menu index="account">
            <template #title>
              <el-icon><User /></el-icon>
              <span>账号中心</span>
            </template>
            <el-menu-item index="/console/profile">
              <el-icon><Postcard /></el-icon>
              <template #title>基本信息</template>
            </el-menu-item>
            <!-- 第三方账号暂未开放，保留页面与路由，仅隐藏左侧入口。 -->
            <!--
            <el-menu-item index="/console/oauth">
              <el-icon><Link /></el-icon>
              <template #title>第三方账号</template>
            </el-menu-item>
            -->
            <el-menu-item index="/console/messages">
              <el-icon><Bell /></el-icon>
              <template #title>消息通知</template>
            </el-menu-item>
            <!--
            <el-menu-item index="/console/notify-config">
              <el-icon><Setting /></el-icon>
              <template #title>消息通知配置</template>
            </el-menu-item>
            -->
          </el-sub-menu>

          <el-menu-item index="/console/tickets">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>工单管理</template>
          </el-menu-item>

          <el-sub-menu index="finance">
            <template #title>
              <el-icon><Wallet /></el-icon>
              <span>费用管理</span>
            </template>
            <el-menu-item index="/console/orders">
              <el-icon><Tickets /></el-icon>
              <template #title>订单管理</template>
            </el-menu-item>
            <!-- 发票功能暂未开放，保留页面与路由，仅隐藏左侧入口。 -->
            <!--
            <el-menu-item index="/console/invoices">
              <el-icon><DocumentChecked /></el-icon>
              <template #title>发票管理</template>
            </el-menu-item>
            -->
          </el-sub-menu>
        </el-menu>
      </nav>

      <div class="console-bottom">
        <el-tooltip content="返回前台" placement="right" :disabled="!collapsed">
          <router-link to="/" class="bottom-link">
            <el-icon><Back /></el-icon>
            <span v-if="!collapsed">返回前台</span>
          </router-link>
        </el-tooltip>
        <el-tooltip content="退出登录" placement="right" :disabled="!collapsed">
          <a class="bottom-link" href="javascript:;" @click="onLogout">
            <el-icon><SwitchButton /></el-icon>
            <span v-if="!collapsed">退出登录</span>
          </a>
        </el-tooltip>
      </div>
    </aside>

    <!-- 右侧内容 -->
    <div class="console-main">
      <header class="console-header">
        <div class="header-title">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-if="currentGroup">{{ currentGroup }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tag v-if="userStore.isVip" type="warning" effect="light" round size="small">VIP 会员</el-tag>
          <div class="balance-tag">
            <el-icon color="#f59e0b"><Wallet /></el-icon>
            余额：<b>¥{{ userStore.balance.toFixed(2) }}</b>
            <el-button size="small" type="primary" link @click="$router.push('/console/orders')">充值</el-button>
          </div>
          <el-dropdown trigger="click" @command="onUserCommand">
            <span class="user-entry">
              <el-avatar :size="28" :src="userStore.avatarSrc || undefined" class="user-avatar">
                {{ userStore.avatarChar }}
              </el-avatar>
              <span class="user-name">{{ userStore.displayName }}</span>
              <el-icon :size="12"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>基本信息
                </el-dropdown-item>
                <el-dropdown-item command="token">
                  <el-icon><Key /></el-icon>Token管理
                </el-dropdown-item>
                <el-dropdown-item command="messages">
                  <el-icon><Bell /></el-icon>消息通知
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="console-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script>
import {
  Aim,
  ArrowDown,
  Back,
  Bell,
  ChatDotRound,
  DataAnalysis,
  Document,
  DocumentChecked,
  Expand,
  Fold,
  Grid,
  Key,
  Lock,
  Monitor,
  Odometer,
  Postcard,
  Setting,
  SwitchButton,
  Tickets,
  User,
  Wallet
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'

const COLLAPSE_KEY = 'console-side-collapsed'
const GROUPS_KEY = 'console-groups-expanded'

const GROUP_PATH_MAP = {
  data: ['/console/token', '/console/myapi', '/console/logs'],
  security: ['/console/security', '/console/login-logs'],
  account: ['/console/profile', '/console/messages', '/console/notify-config'],
  finance: ['/console/orders', '/console/invoices', '/console/gifts', '/console/invite']
}

function loadGroups() {
  try {
    const raw = localStorage.getItem(GROUPS_KEY)
    if (raw) {
      const list = JSON.parse(raw)
      if (Array.isArray(list)) {
        return list.filter(i => i !== 'ticket' && GROUP_PATH_MAP[i])
      }
    }
  } catch (e) { /* ignore */ }
  return Object.keys(GROUP_PATH_MAP)
}

export default {
  name: 'ConsoleLayout',
  components: {
    Aim,
    ArrowDown,
    Back,
    Bell,
    ChatDotRound,
    DataAnalysis,
    Document,
    DocumentChecked,
    Expand,
    Fold,
    Grid,
    Key,
    Lock,
    Monitor,
    Odometer,
    Postcard,
    Setting,
    SwitchButton,
    Tickets,
    User,
    Wallet
  },
  data() {
    return {
      userStore: useUserStore(),
      collapsed: localStorage.getItem(COLLAPSE_KEY) === '1',
      openeds: loadGroups()
    }
  },
  computed: {
    currentTitle() {
      const item = this.findMenu(this.$route.path)
      return item ? item.name : '控制台'
    },
    currentGroup() {
      const item = this.findMenu(this.$route.path)
      if (!item || !item.group) return ''
      return item.group
    }
  },
  watch: {
    '$route.path'() {
      this.expandCurrentGroup()
    }
  },
  methods: {
    findMenu(path) {
      const menuMap = {
        '/console/index': { name: '控制台', group: '' },
        '/console/token': { name: 'Token管理', group: '数据中心' },
        '/console/myapi': { name: '我的接口', group: '数据中心' },
        '/console/logs': { name: '接口调用日志', group: '数据中心' },
        '/console/security': { name: '安全设置', group: '安全中心' },
        '/console/login-logs': { name: '登录日志', group: '安全中心' },
        '/console/profile': { name: '基本信息', group: '账号中心' },
        '/console/oauth': { name: '第三方账号', group: '账号中心' },
        '/console/messages': { name: '消息通知', group: '账号中心' },
        '/console/notify-config': { name: '消息通知配置', group: '账号中心' },
        '/console/tickets': { name: '工单管理', group: '' },
        '/console/orders': { name: '订单管理', group: '费用管理' },
        '/console/invoices': { name: '发票管理', group: '费用管理' },
        '/console/gifts': { name: '礼品兑换', group: '费用管理' },
        '/console/invite': { name: '邀请返利', group: '费用管理' }
      }
      return menuMap[path] || null
    },
    groupIndexOf(path) {
      for (const [index, paths] of Object.entries(GROUP_PATH_MAP)) {
        if (paths.includes(path)) return index
      }
      return null
    },
    expandCurrentGroup() {
      const index = this.groupIndexOf(this.$route.path)
      if (index && !this.openeds.includes(index)) {
        this.openeds.push(index)
        this.persistGroups()
        this.$nextTick(() => {
          this.$refs.menuRef && this.$refs.menuRef.open(index)
        })
      }
    },
    onMenuOpen(index) {
      if (!this.openeds.includes(index)) {
        this.openeds.push(index)
        this.persistGroups()
      }
    },
    onMenuClose(index) {
      this.openeds = this.openeds.filter(i => i !== index)
      this.persistGroups()
    },
    persistGroups() {
      localStorage.setItem(GROUPS_KEY, JSON.stringify(this.openeds))
    },
    toggleCollapse() {
      this.collapsed = !this.collapsed
      localStorage.setItem(COLLAPSE_KEY, this.collapsed ? '1' : '0')
    },
    onUserCommand(command) {
      if (command === 'logout') {
        this.onLogout()
      } else if (command === 'profile') {
        this.$router.push('/console/profile')
      } else if (command === 'token') {
        this.$router.push('/console/token')
      } else if (command === 'messages') {
        this.$router.push('/console/messages')
      }
    },
    onLogout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '退出',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const { logout } = await import('@/api/user')
          await logout()
        } catch (e) {
          // 接口失败也清除本地登录态
        }
        this.userStore.logout()
        this.$message.success('已退出登录')
        this.$router.push('/')
      }).catch(() => {})
    }
  },
  mounted() {
    this.expandCurrentGroup()
    this.userStore.fetchUserInfo()
  }
}
</script>

<style scoped lang="scss">

.console-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

.console-side {
  width: 212px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e8eaee;
  box-shadow: 2px 0 12px rgba(15, 23, 42, 0.04);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  transition: width 0.22s ease;

  &.collapsed {
    width: 64px;

    .side-top {
      justify-content: center;
      padding: 0;
    }

    .console-bottom .bottom-link {
      justify-content: center;
      padding: 9px 0;
    }
  }
}

.side-top {
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px 0 16px;
  border-bottom: 1px solid #eef0f3;
}

.side-title {
  font-size: 15px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 0.02em;
}

.collapse-btn {
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: $text-secondary;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: $primary-color;
    background: rgba(58, 122, 254, 0.08);
  }
}

.console-nav {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 8px 12px;
}

.console-menu {
  border-right: none !important;
  background: transparent !important;
  width: 100% !important;

  &.el-menu--collapse {
    width: 48px !important;
    margin: 0 auto;
  }

  --el-menu-item-height: 40px;
  --el-menu-sub-item-height: 38px;
  --el-menu-base-level-padding: 10px;
  --el-menu-level-padding: 10px;
  --el-menu-icon-width: 18px;
  --el-menu-hover-bg-color: rgba(58, 122, 254, 0.06);
  --el-menu-active-color: #{$primary-color};
  --el-menu-text-color: #{$text-regular};
  --el-menu-bg-color: transparent;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: var(--el-menu-item-height);
    line-height: var(--el-menu-item-height);
    margin: 0 0 2px;
    border-radius: 8px;
    padding: 0 10px !important;
    color: $text-regular;
    font-size: 13.5px;
    transition: background 0.15s, color 0.15s;

    .el-icon:not(.el-sub-menu__icon-arrow) {
      width: 18px;
      margin-right: 8px;
      font-size: 16px;
      color: inherit;
    }

    &:hover {
      color: $primary-color !important;
      background: rgba(58, 122, 254, 0.06) !important;
    }
  }

  :deep(.el-sub-menu .el-menu) {
    background: transparent !important;
  }

  :deep(.el-sub-menu .el-menu-item) {
    height: var(--el-menu-sub-item-height);
    line-height: var(--el-menu-sub-item-height);
    padding-left: 36px !important;
    font-size: 13px;
    color: $text-secondary;

    .el-icon {
      font-size: 15px;
      margin-right: 7px;
    }
  }

  :deep(.el-menu-item.is-active) {
    color: $primary-color !important;
    background: rgba(58, 122, 254, 0.1) !important;
    font-weight: 600;
  }

  :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
    color: $text-primary;
  }

  :deep(.el-sub-menu__icon-arrow) {
    font-size: 12px;
    right: 10px;
    margin-top: -6px;
    color: $text-placeholder;
  }

  :deep(.el-menu--popup) {
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
    padding: 6px;
    min-width: 148px;

    .el-menu-item {
      padding-left: 12px !important;
      border-radius: 8px;
    }
  }
}

.console-bottom {
  flex-shrink: 0;
  padding: 8px;
  border-top: 1px solid #eef0f3;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bottom-link {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  font-size: 13px;
  color: $text-secondary;
  transition: all 0.15s;
  white-space: nowrap;

  .el-icon {
    font-size: 16px;
    width: 18px;
  }

  &:hover {
    color: $primary-color;
    background: rgba(58, 122, 254, 0.06);
  }
}

.console-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e8eaee;
  position: sticky;
  top: 0;
  z-index: 10;

  .header-title {
    :deep(.el-breadcrumb__inner) {
      color: $text-secondary;
      font-size: 14px;
    }

    :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
      color: $text-primary;
      font-weight: 600;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;

    .balance-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: $text-regular;
    }

    .user-entry {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      outline: none;
      padding: 4px 8px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.04);
      }

      .user-avatar {
        background: $primary-gradient;
        color: #fff;
      }

      .user-name {
        font-size: 14px;
        color: $text-primary;
      }
    }
  }
}

.console-content {
  padding: 24px;
  flex: 1;
}
</style>
