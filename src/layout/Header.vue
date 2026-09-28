<template>
  <header class="site-header">
    <div class="header-inner page-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-mark">
          <span class="logo-fallback" :class="{ hidden: logoImageLoaded }">
            <el-icon :size="20"><Connection /></el-icon>
          </span>
          <img
            v-if="logoUrl"
            class="logo-img"
            :class="{ 'is-loaded': logoImageLoaded }"
            :src="logoUrl"
            :alt="siteName"
            @load="onLogoLoad"
            @error="onLogoError"
          />
        </span>
        <span class="logo-text">{{ siteName }}</span>
      </router-link>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <router-link to="/" class="nav-item" :class="{ active: $route.path === '/index' || $route.path === '/' }">
          首页
        </router-link>
        <router-link to="/explore" class="nav-item" :class="{ active: $route.path === '/explore' }">
          探索
        </router-link>
        <router-link to="/vip" class="nav-item">
          会员VIP
          <el-icon class="vip-icon" :size="12"><StarFilled /></el-icon>
        </router-link>
      </nav>

      <!-- 右侧：搜索 + 登录信息 -->
      <div class="header-right">
        <el-input
          v-model="searchKeyword"
          class="header-search"
          placeholder="搜索"
          clearable
          @keyup.enter="onSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <template v-if="userStore.isLogin">
          <el-dropdown trigger="click" @command="onUserCommand">
            <span class="user-entry">
              <el-avatar :size="30" :src="userStore.avatarSrc || undefined" class="user-avatar">
                {{ userStore.avatarChar }}
              </el-avatar>
              <span class="user-name">{{ userStore.displayName }}</span>
              <el-tag v-if="userStore.isVip" size="small" type="warning" effect="light" round class="vip-tag">
                <el-icon :size="10"><StarFilled /></el-icon>
                VIP
              </el-tag>
              <el-icon :size="12"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="console">
                  <el-icon><Odometer /></el-icon>控制台
                </el-dropdown-item>
                <el-dropdown-item command="token">
                  <el-icon><Key /></el-icon>Token管理
                </el-dropdown-item>
                <el-dropdown-item command="vip">
                  <el-icon><StarFilled /></el-icon>会员中心
                </el-dropdown-item>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>基本信息
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <a href="javascript:;" class="btn-login" @click="openLogin">登录</a>
          <a href="javascript:;" class="btn-register" @click="openLogin">免费注册</a>
        </template>
      </div>
    </div>
  </header>
</template>

<script>
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { logout } from '@/api/user'
import {
  Connection,
  Search,
  StarFilled,
  ArrowDown,
  Odometer,
  Key,
  User,
  SwitchButton
} from '@element-plus/icons-vue'

export default {
  name: 'SiteHeader',
  components: {
    Connection,
    Search,
    StarFilled,
    ArrowDown,
    Odometer,
    Key,
    User,
    SwitchButton
  },
  data() {
    return {
      searchKeyword: '',
      userStore: useUserStore(),
      appStore: useAppStore(),
      loggingOut: false,
      logoImageLoaded: false
    }
  },
  computed: {
    siteName() {
      return this.appStore.siteName
    },
    logoUrl() {
      return this.appStore.logoUrl
    }
  },
  watch: {
    logoUrl() {
      this.logoImageLoaded = false
      this.$nextTick(() => this.syncLogoLoadState())
    }
  },
  mounted() {
    this.$nextTick(() => this.syncLogoLoadState())
  },
  methods: {
    syncLogoLoadState() {
      if (!this.logoUrl) return
      const img = this.$el.querySelector('.logo-img')
      if (img && img.complete && img.naturalWidth > 0) {
        this.logoImageLoaded = true
      }
    },
    onLogoLoad() {
      this.logoImageLoaded = true
    },
    onLogoError() {
      this.logoImageLoaded = false
    },
    onSearch() {
      const keyword = (this.searchKeyword || '').trim()
      this.$router.push({ path: '/explore', query: keyword ? { keyword } : {} })
    },
    openLogin() {
      this.appStore.openLogin()
    },
    async onUserCommand(command) {
      if (command === 'logout') {
        if (this.loggingOut) return
        this.loggingOut = true
        try {
          // 调用真实接口：使当前 token 失效
          await logout()
        } catch (e) {
          // 即使接口失败也清除本地登录态
        } finally {
          this.loggingOut = false
        }
        this.userStore.logout()
        this.$message.success('已退出登录')
        this.$router.push('/')
        return
      }
      const paths = {
        console: '/console/index',
        token: '/console/token',
        vip: '/vip',
        profile: '/console/profile'
      }
      this.$router.push(paths[command] || '/console')
    }
  }
}
</script>

<style scoped lang="scss">

.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  border-bottom: 1px solid $border-light;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  animation: portal-header-enter 0.35s ease-out both;
}

@keyframes portal-header-enter {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-header {
    animation: none;
  }
}

.header-inner {
  display: flex;
  align-items: center;
  height: 64px;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  min-width: 180px;
}

.logo-mark {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.logo-fallback {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: $primary-gradient;
  border-radius: 10px;
  transition: opacity 0.2s ease;

  &.hidden {
    opacity: 0;
  }
}

.logo-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: 160px;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.28s ease;
  display: block;

  &.is-loaded {
    opacity: 1;
  }
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: 0.5px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;

  .nav-item {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 15px;
    color: $text-regular;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
      color: $primary-color;
      background: rgba(58, 122, 254, 0.06);
    }

    &.active {
      color: $primary-color;
      font-weight: 600;
      background: rgba(58, 122, 254, 0.08);
    }

    .vip-icon {
      color: #f59e0b;
    }
  }
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-shrink: 0;
  min-width: 200px;
}

.header-search {
  width: 148px;

  :deep(.el-input__wrapper) {
    border-radius: 18px;
  }
}

.user-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
  outline: none;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .user-avatar {
    background: $primary-gradient;
    color: #fff;
    font-size: 14px;
  }

  .user-name {
    font-size: 14px;
    color: $text-primary;
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .vip-tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0 6px;
    height: 18px;
    font-size: 11px;
  }
}

.btn-login {
  padding: 6px 18px;
  border-radius: 18px;
  border: 1px solid $primary-color;
  color: $primary-color;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: rgba(58, 122, 254, 0.06);
  }
}

.btn-register {
  padding: 6px 18px;
  border-radius: 18px;
  background: $primary-gradient;
  color: #fff;
  font-size: 14px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
}

@media (max-width: 992px) {
  .nav-menu {
    display: none;
  }
  .header-search {
    display: none;
  }
}
</style>
