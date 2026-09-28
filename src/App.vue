<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="shellKey" />
    </transition>
  </router-view>
  <LoginDialog />
  <SetPasswordDialog />
  <SiteContentDialog />
  <SiteAboutDialog />
  <FaqBotWidget />
</template>

<script>
import LoginDialog from '@/components/LoginDialog.vue'
import SetPasswordDialog from '@/components/SetPasswordDialog.vue'
import SiteContentDialog from '@/components/SiteContentDialog.vue'
import SiteAboutDialog from '@/components/SiteAboutDialog.vue'
import FaqBotWidget from '@/components/FaqBotWidget.vue'
import { useUserStore } from '@/store/modules/user'
import { getShellTransition, isConsolePath } from '@/utils/routeTransition'

export default {
  name: 'App',
  components: { LoginDialog, SetPasswordDialog, SiteContentDialog, SiteAboutDialog, FaqBotWidget },
  data() {
    return {
      transitionName: 'fade-quick'
    }
  },
  computed: {
    shellKey() {
      return isConsolePath(this.$route.path) ? 'console' : 'site'
    }
  },
  created() {
    const userStore = useUserStore()
    if (userStore.isLogin) {
      userStore.fetchUserInfo()
    }
    this.$router.beforeEach((to, from) => {
      this.transitionName = getShellTransition(from.path, to.path)
    })
  }
}
</script>

<style>
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* 官网 → 控制台 */
.fade-up-enter-active {
  transition: opacity 0.26s ease-out, transform 0.26s ease-out;
}
.fade-up-leave-active {
  transition: opacity 0.22s ease-in, transform 0.22s ease-in;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 控制台 → 官网（更快纯淡入淡出） */
.fade-quick-enter-active,
.fade-quick-leave-active {
  transition: opacity 0.18s ease;
}
.fade-quick-enter-from,
.fade-quick-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fade-up-enter-active,
  .fade-up-leave-active,
  .fade-quick-enter-active,
  .fade-quick-leave-active {
    transition: none;
  }
}
</style>
