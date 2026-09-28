<template>
  <el-dialog
    v-model="visible"
    width="560px"
    append-to-body
    class="site-modal site-about-modal"
  >
    <template #header>
      <div class="modal-title">关于我们</div>
    </template>

    <Transition name="skeleton-reveal" mode="out-in">
      <TextBlockSkeleton v-if="loading" key="about-sk" :rows="5" />
      <div v-else key="about-body" class="about-body">
        <p v-if="site.seoDescription || siteName" class="about-lead">
          {{ site.seoDescription || siteName }}
        </p>

        <dl v-if="infoItems.length" class="about-dl">
          <div v-for="item in infoItems" :key="item.label" class="about-row">
            <dt>{{ item.label }}</dt>
            <dd>
              <a
                v-if="item.href"
                :href="item.href"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener' : undefined"
              >{{ item.value }}</a>
              <template v-else>{{ item.value }}</template>
            </dd>
          </div>
        </dl>

        <el-empty
          v-else-if="!loading"
          description="暂未配置公司信息"
          :image-size="64"
        />
      </div>
    </Transition>
  </el-dialog>
</template>

<script>
import { useAppStore } from '@/store/modules/app'
import TextBlockSkeleton from '@/components/skeleton/TextBlockSkeleton.vue'

export default {
  name: 'SiteAboutDialog',
  components: { TextBlockSkeleton },
  data() {
    return {
      appStore: useAppStore(),
      loading: false
    }
  },
  computed: {
    visible: {
      get() {
        return this.appStore.aboutVisible
      },
      set(v) {
        if (!v) this.appStore.closeAbout()
      }
    },
    site() {
      return this.appStore.siteInfo || {}
    },
    siteName() {
      return this.appStore.siteName
    },
    infoItems() {
      const s = this.site
      const list = []
      if (s.companyName) list.push({ label: '公司名称', value: s.companyName })
      if (s.companyAddress) list.push({ label: '公司地址', value: s.companyAddress })
      if (s.contactEmail) {
        list.push({ label: '客服邮箱', value: s.contactEmail, href: 'mailto:' + s.contactEmail })
      }
      if (s.contactPhone) {
        list.push({ label: '联系电话', value: s.contactPhone, href: 'tel:' + s.contactPhone })
      }
      if (s.contactWechat) list.push({ label: '企业微信', value: s.contactWechat })
      if (s.docUrl) {
        list.push({ label: '文档地址', value: s.docUrl, href: s.docUrl, external: true })
      }
      if (s.githubUrl) {
        list.push({ label: 'GitHub', value: s.githubUrl, href: s.githubUrl, external: true })
      }
      return list
    }
  },
  watch: {
    visible(v) {
      if (v) this.ensureSite()
    }
  },
  methods: {
    async ensureSite() {
      this.loading = true
      try {
        await this.appStore.fetchSiteInfo()
      } finally {
        this.loading = false
      }
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

.about-body {
  min-height: 80px;
}

.about-lead {
  margin: 0 0 16px;
  font-size: 13px;
  line-height: 1.7;
  color: $text-secondary;
}

.about-dl {
  margin: 0;
  border-top: 1px solid $border-light;
}

.about-row {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid $border-light;

  dt {
    margin: 0;
    font-size: 13px;
    color: $text-secondary;
    line-height: 1.6;
  }

  dd {
    margin: 0;
    font-size: 14px;
    color: $text-primary;
    line-height: 1.6;
    word-break: break-all;

    a {
      color: $primary-color;

      &:hover {
        opacity: 0.85;
      }
    }
  }
}
</style>

<style lang="scss">

.site-modal.site-about-modal {
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
