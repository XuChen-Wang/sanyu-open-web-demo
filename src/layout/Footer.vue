<template>
  <footer class="site-footer">
    <div class="footer-inner page-container">
      <!-- 站点品牌区 -->
      <div class="footer-brand">
        <div class="footer-logo">
          <img v-if="logoDarkUrl" class="logo-img" :src="logoDarkUrl" :alt="siteName" />
          <span v-else class="logo-icon"><el-icon :size="18"><Connection /></el-icon></span>
          <span class="logo-text">{{ siteName }}</span>
        </div>
        <div class="footer-slogan">{{ site.seoDescription || '免费API接口_数据接口_API接口大全' }}</div>
      </div>
      <div class="footer-main">
        <div class="footer-col">
          <h4>产品</h4>
          <ul>
            <li><router-link to="/explore">接口大全</router-link></li>
            <li><router-link to="/vip">定价方案</router-link></li>
            <li><router-link :to="{ path: '/explore', query: { chargeType: 'free' } }">免费接口</router-link></li>
            <li v-if="site.docUrl"><a :href="site.docUrl" target="_blank" rel="noopener">开发文档</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>公司</h4>
          <ul>
            <li v-if="site.companyName">{{ site.companyName }}</li>
            <li v-if="site.companyAddress">地址：{{ site.companyAddress }}</li>
            <li><a href="javascript:;" @click="openAbout">关于我们</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>法律</h4>
          <ul>
            <li><a href="javascript:;" @click="openContent('service')">服务协议</a></li>
            <li><a href="javascript:;" @click="openContent('privacy')">隐私政策</a></li>
            <li v-if="site.githubUrl"><a :href="site.githubUrl" target="_blank" rel="noopener">开源 / GitHub</a></li>
          </ul>
        </div>
        <div class="footer-col footer-contact">
          <h4>联系我们</h4>
          <ul>
            <li v-if="site.contactEmail"><el-icon><Message /></el-icon> 客服邮箱：
              <a :href="'mailto:' + site.contactEmail">{{ site.contactEmail }}</a>
            </li>
            <li v-if="site.contactPhone"><el-icon><Phone /></el-icon> 联系电话：
              <a :href="'tel:' + site.contactPhone">{{ site.contactPhone }}</a>
            </li>
            <li v-if="site.contactWechat"><el-icon><ChatDotRound /></el-icon> 企业微信：{{ site.contactWechat }}</li>
            <li v-if="site.companyName"><el-icon><OfficeBuilding /></el-icon> {{ site.companyName }}</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>{{ site.copyright || ('© ' + year + ' ' + siteName + ' All rights reserved.') }}</span>
        <a
          v-if="site.icpNo"
          class="icp"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener"
        >{{ site.icpNo }}</a>
        <a
          v-if="site.policeNo"
          class="icp"
          href="https://www.beian.gov.cn/"
          target="_blank"
          rel="noopener"
        >{{ site.policeNo }}</a>
      </div>
    </div>
  </footer>
</template>

<script>
import { useAppStore } from '@/store/modules/app'
import {
  Connection,
  Message,
  Phone,
  ChatDotRound,
  OfficeBuilding
} from '@element-plus/icons-vue'

export default {
  name: 'SiteFooter',
  components: {
    Connection,
    Message,
    Phone,
    ChatDotRound,
    OfficeBuilding
  },
  data() {
    return {
      appStore: useAppStore(),
      year: new Date().getFullYear()
    }
  },
  computed: {
    site() {
      return this.appStore.siteInfo || {}
    },
    siteName() {
      return this.appStore.siteName
    },
    logoDarkUrl() {
      return this.appStore.logoDarkUrl
    }
  },
  mounted() {
    this.appStore.fetchSiteInfo()
  },
  methods: {
    openContent(type) {
      this.appStore.openSiteContent(type)
    },
    openAbout() {
      this.appStore.openAbout()
    }
  }
}
</script>

<style scoped lang="scss">

.site-footer {
  background: #1f2430;
  color: #9ca3af;
  margin-top: 0;
}

.footer-inner {
  padding: 40px 16px 20px;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;

  .logo-img {
    height: 28px;
    width: auto;
    max-width: 140px;
    object-fit: contain;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: $primary-color;
    color: #fff;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 600;
    color: #e5e7eb;
  }
}

.footer-slogan {
  font-size: 13px;
  color: #9ca3af;
  max-width: 560px;
  line-height: 1.5;
}

.footer-main {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin-bottom: 28px;
}

.footer-col {
  h4 {
    margin: 0 0 14px;
    font-size: 14px;
    color: #e5e7eb;
    font-weight: 600;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  li {
    margin-bottom: 10px;
    font-size: 13px;
    line-height: 1.5;
  }

  a {
    color: #9ca3af;

    &:hover {
      color: #fff;
    }
  }
}

.footer-contact {
  li {
    display: flex;
    align-items: flex-start;
    gap: 6px;

    .el-icon {
      margin-top: 2px;
      flex-shrink: 0;
    }

    a {
      color: #9ca3af;

      &:hover {
        color: #fff;
      }
    }
  }
}

.footer-bottom {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 12px;
  color: #6b7280;

  .icp {
    color: #6b7280;

    &:hover {
      color: #d1d5db;
    }
  }
}

@media (max-width: 900px) {
  .footer-main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .footer-main {
    grid-template-columns: 1fr;
  }
}
</style>
