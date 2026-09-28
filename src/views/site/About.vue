<template>
  <div class="about-redirect"></div>
</template>

<script>
import { useAppStore } from '@/store/modules/app'

/** 兼容旧链接 /about → 弹窗展示 */
export default {
  name: 'AboutPage',
  created() {
    useAppStore().openAbout()
    if (window.history.length > 1) {
      this.$router.back()
    } else {
      this.$router.replace('/index')
    }
  }
}
</script>
