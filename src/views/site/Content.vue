<template>
  <div class="site-content-redirect"></div>
</template>

<script>
import { useAppStore } from '@/store/modules/app'

/** 兼容旧链接 /page/:type → 弹窗展示 */
export default {
  name: 'SiteContentPage',
  created() {
    const type = this.$route.params.type
    const appStore = useAppStore()
    if (type) {
      appStore.openSiteContent(type)
    }
    if (window.history.length > 1) {
      this.$router.back()
    } else {
      this.$router.replace('/index')
    }
  }
}
</script>
