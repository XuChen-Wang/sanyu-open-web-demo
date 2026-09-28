<template>
  <el-dialog
    v-model="visible"
    width="680px"
    append-to-body
    class="site-modal site-content-modal"
    @closed="onClosed"
  >
    <template #header>
      <div class="modal-title">{{ title }}</div>
    </template>

    <div class="content-shell">
      <Transition name="skeleton-reveal" mode="out-in">
        <TextBlockSkeleton v-if="loading" key="content-sk" />
        <div v-else key="content-html" class="site-content-body" v-html="html"></div>
      </Transition>
    </div>
  </el-dialog>
</template>

<script>
import { getSiteContentByType } from '@/api/site'
import TextBlockSkeleton from '@/components/skeleton/TextBlockSkeleton.vue'
import { useAppStore } from '@/store/modules/app'

const TYPE_TITLE = {
  service: '服务协议',
  privacy: '隐私政策',
  notice: '公告',
  faq: '帮助FAQ',
  other: '其他'
}

export default {
  name: 'SiteContentDialog',
  components: { TextBlockSkeleton },
  data() {
    return {
      appStore: useAppStore(),
      loading: false,
      title: '',
      html: ''
    }
  },
  computed: {
    visible: {
      get() {
        return this.appStore.siteContentVisible
      },
      set(v) {
        if (!v) this.appStore.closeSiteContent()
      }
    },
    contentType() {
      return this.appStore.siteContentType
    }
  },
  watch: {
    contentType: {
      immediate: true,
      handler(type) {
        if (type && this.visible) this.load(type)
      }
    },
    visible(v) {
      if (v && this.contentType) this.load(this.contentType)
    }
  },
  methods: {
    async load(type) {
      const t = String(type || '').toLowerCase()
      this.title = TYPE_TITLE[t] || '站点内容'
      this.html = ''
      this.loading = true
      try {
        const res = await getSiteContentByType(t)
        if (res.code === 200 && res.data) {
          this.title = res.data.title || this.title
          this.html = res.data.contentHtml || '<p class="is-muted">暂无内容</p>'
        } else {
          this.html = '<p class="is-muted">暂无内容</p>'
        }
      } catch (e) {
        this.html = '<p class="is-muted">内容加载失败</p>'
      } finally {
        this.loading = false
      }
    },
    onClosed() {
      this.html = ''
    }
  }
}
</script>

<style scoped lang="scss">

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: $text-primary;
  line-height: 1.4;
}

.content-shell {
  min-height: 140px;
}

.site-content-body {
  max-height: 56vh;
  overflow: auto;
  padding: 2px 2px 8px;
  font-size: 14px;
  line-height: 1.8;
  color: $text-regular;
  word-break: break-word;

  :deep(.is-muted) {
    color: $text-placeholder;
    text-align: center;
    padding: 36px 0;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3) {
    color: $text-primary;
    margin: 1em 0 0.5em;
    font-weight: 600;
  }

  :deep(h1) { font-size: 18px; }
  :deep(h2) { font-size: 16px; }
  :deep(h3) { font-size: 15px; }

  :deep(p) {
    margin: 0.5em 0;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 1.25em;
    margin: 0.5em 0;
  }

  :deep(a) {
    color: $primary-color;
  }

  :deep(img) {
    max-width: 100%;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 999px;
  }
}
</style>

<style lang="scss">

.site-modal.site-content-modal {
  border-radius: $radius-lg;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
  margin-top: 8vh !important;

  .el-dialog__header {
    margin: 0;
    padding: 18px 20px 0;
  }

  .el-dialog__headerbtn {
    top: 16px;
    right: 14px;
  }

  .el-dialog__body {
    padding: 14px 20px 22px;
  }
}
</style>
