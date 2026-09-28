<template>
  <div class="home-page">
    <!-- Hero Banner：蓝湖「矩形 5」整图铺满 -->
    <section class="hero" :class="{ 'is-ready': heroReady }">
      <el-carousel
        class="hero-carousel"
        height="420px"
        :interval="4000"
        :autoplay="heroSlides.length > 1"
        :loop="heroSlides.length > 1"
        :indicator-position="heroSlides.length > 1 ? undefined : 'none'"
        :arrow="heroSlides.length > 1 ? 'hover' : 'never'"
      >
        <el-carousel-item v-for="slide in heroSlides" :key="slide.bannerId">
          <img
            class="hero-banner"
            :src="slide.imageUrl"
            alt=""
            aria-hidden="true"
          />
          <div v-if="slide.title || slide.summary || (slide.buttonText && slide.linkType !== 'none')" class="hero-panel page-container">
            <div class="hero-text">
              <h1 v-if="slide.title">{{ slide.title }}</h1>
              <p v-if="slide.summary">{{ slide.summary }}</p>
              <el-button
                v-if="slide.buttonText && slide.linkType !== 'none'"
                type="primary"
                size="large"
                class="hero-cta"
                @click="onHeroCta(slide)"
              >
                {{ slide.buttonText }}
              </el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- 搜索条：骑在 banner 底部 -->
    <div class="search-bar-wrap page-container" :class="{ 'is-ready': heroReady }">
      <div class="search-bar">
        <el-icon class="search-icon"><Search /></el-icon>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索API，如:天气、图片压缩、企业工商..."
          @keyup.enter="onSearch"
        />
        <el-button type="primary" class="search-btn" @click="onSearch">搜索</el-button>
      </div>
    </div>

    <!-- 分类 Tab（白底）+ 接口卡片（灰底） -->
    <section class="catalog">
      <div class="cat-tabs-wrap">
        <div class="cat-tabs page-container">
          <button
            v-for="cat in categories"
            :key="cat.categoryCode"
            type="button"
            class="cat-tab"
            :class="{ active: activeCategory === cat.categoryCode }"
            @click="activeCategory = cat.categoryCode"
          >
            <span class="cat-tab-icon">
              <img :src="catIconSrc(cat)" alt="" />
            </span>
            <span>{{ cat.categoryName }}</span>
          </button>
          <router-link to="/explore" class="cat-more">
            更多
            <el-icon :size="14" class="cat-more-plus"><Plus /></el-icon>
          </router-link>
        </div>
      </div>

      <div class="catalog-body">
        <div class="page-container">
          <Transition name="skeleton-reveal" mode="out-in">
            <HomeCategoriesSkeleton v-if="loading" key="home-sk" />
            <div v-else key="home-grid" class="api-grid">
              <ApiCard
                v-for="api in displayApis"
                :key="api.apiCode"
                :api="api"
                variant="home"
              />
              <div v-if="!displayApis.length" class="empty-tip">该分类下暂无接口</div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- 能力指标 -->
    <section class="stats">
      <div class="stats-inner page-container">
        <div v-for="item in stats" :key="item.label" class="stat-item">
          <img class="stat-icon" :src="item.icon" alt="" />
          <div class="stat-text">
            <div class="stat-num">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 场景全覆盖：矩形20 背景铺满，分类按钮按蓝湖坐标叠放 -->
    <section v-if="scenarioTags.length" class="scenarios">
      <div class="scenarios-bg" aria-hidden="true" />
      <div class="scenarios-overlay">
        <h2 class="section-title">场景全覆盖</h2>
        <p class="section-sub">按能力分类快速找到可用接口，登录后即可调试与接入</p>
        <div class="scenario-wall">
          <button
            v-for="tag in scenarioTags"
            :key="tag.code || tag.name"
            type="button"
            class="scenario-item"
            @click="goExploreCategory(tag.code)"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>
    </section>

    <!-- 底部 CTA -->
    <section class="cta">
      <div class="cta-bg" aria-hidden="true" />
      <div class="cta-inner page-container">
        <h2>准备好接入了吗？</h2>
        <p>浏览接口文档，创建 Token，几分钟完成第一次调用</p>
        <div class="cta-actions">
          <el-button type="primary" size="large" @click="goExplore">浏览接口</el-button>
          <el-button size="large" plain @click="goConsole">进入控制台</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ApiCard from '@/components/ApiCard.vue'
import HomeCategoriesSkeleton from '@/components/skeleton/HomeCategoriesSkeleton.vue'
import { getOpenTree } from '@/api/platform'
import { getHomeBanners } from '@/api/site'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { Search, Plus } from '@element-plus/icons-vue'
import { resolveOpenIconUrl, resolveApiIconUrl } from '@/utils/openIcon'
import { resolveMediaUrl } from '@/utils/media'
import heroBanner from '@/assets/home/hero-banner.png'
import statIcon1 from '@/assets/home/icons/stat-1.png'
import statIcon2 from '@/assets/home/icons/stat-2.png'
import statIcon3 from '@/assets/home/icons/stat-3.png'
import statIcon4 from '@/assets/home/icons/stat-4.png'
import statIcon5 from '@/assets/home/icons/stat-5.png'

export default {
  name: 'HomePage',
  components: {
    ApiCard,
    HomeCategoriesSkeleton,
    Search,
    Plus
  },
  data() {
    return {
      userStore: useUserStore(),
      appStore: useAppStore(),
      keyword: '',
      categories: [],
      apiMap: {},
      activeCategory: '',
      loading: true,
      heroReady: false,
      banners: [],
      fallbackHero: heroBanner
    }
  },
  computed: {
    hero() {
      return {
        desc: '图片处理、文本能力、生活服务、数据查询等优质接口，登录即可调用'
      }
    },
    heroSlides() {
      if (this.banners.length) {
        return this.banners.map((item) => ({
          ...item,
          imageUrl: resolveMediaUrl(item.imageUrl)
        }))
      }
      return [
        {
          bannerId: 'fallback',
          title: '三域聚合开放平台',
          summary: this.hero.desc,
          imageUrl: this.fallbackHero,
          linkType: 'internal',
          linkUrl: '/explore',
          buttonText: '了解详情'
        }
      ]
    },
    stats() {
      return [
        { value: '开箱即用', label: '文档调试一体', icon: statIcon1 },
        { value: '流水可见', label: '调用可追溯', icon: statIcon2 },
        { value: 'X-Api-Key', label: '统一鉴权', icon: statIcon3 },
        { value: '在线调试', label: '文档页可测', icon: statIcon4 },
        { value: 'Token', label: '控制台管理', icon: statIcon5 }
      ]
    },
    displayApis() {
      const code = this.activeCategory || (this.categories[0] && this.categories[0].categoryCode)
      if (!code) return []
      return (this.apiMap[code] || []).slice(0, 6)
    },
    scenarioTags() {
      return (this.categories || [])
        .slice(0, 6)
        .map((cat) => ({
          code: cat.categoryCode || '',
          name: cat.categoryName || cat.categoryCode
        }))
        .filter((t) => t.name)
    }
  },
  methods: {
    catIconSrc(cat) {
      // 与管理端一致：读分类 icon 配置（上传图）；未配置则默认图
      return resolveOpenIconUrl(cat && cat.icon)
    },
    async fetchCategories() {
      try {
        const res = await getOpenTree()
        if (res.code === 200) {
          const tree = res.data || []
          const sorted = tree.sort((a, b) => (a.sortNum ?? 0) - (b.sortNum ?? 0))
          this.categories = sorted
          if (sorted.length && !this.activeCategory) {
            this.activeCategory = sorted[0].categoryCode
          }
          const map = {}
          sorted.forEach((cat) => {
            const apis = cat.apis || []
            map[cat.categoryCode] = apis.slice(0, 8).map((api) => ({
              ...api,
              categoryCode: api.categoryCode || cat.categoryCode,
              categoryName: api.categoryName || cat.categoryName,
              iconUrl: resolveApiIconUrl(api.apiIcon)
            }))
          })
          this.apiMap = map
        }
      } catch (e) {
        // 分类加载失败时保留空数组
      }
    },
    async fetchBanners() {
      try {
        const res = await getHomeBanners()
        if (res.code === 200) {
          this.banners = res.data || []
        }
      } catch (e) {
        this.banners = []
      }
    },
    onHeroCta(slide) {
      if (!slide || slide.linkType === 'none') return
      const url = (slide.linkUrl || '').trim()
      if (!url) return
      if (slide.linkType === 'external') {
        window.open(url, '_blank', 'noopener,noreferrer')
        return
      }
      this.$router.push(url)
    },
    onSearch() {
      const keyword = (this.keyword || '').trim()
      this.$router.push({ path: '/explore', query: keyword ? { keyword } : {} })
    },
    goExplore() {
      this.$router.push('/explore')
    },
    goExploreCategory(categoryCode) {
      const query = categoryCode ? { category: categoryCode } : {}
      this.$router.push({ path: '/explore', query })
    },
    goConsole() {
      if (this.userStore.isLogin) {
        this.$router.push('/console')
      } else {
        this.appStore.openLogin()
      }
    }
  },
  async mounted() {
    this.$nextTick(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.heroReady = true
        })
      })
    })
    this.loading = true
    await Promise.all([this.fetchCategories(), this.fetchBanners()])
    this.loading = false
  }
}
</script>

<style scoped lang="scss">
.home-page {
  overflow: hidden;
  background: #fff;
}

.hero {
  position: relative;
  min-height: 420px;
  padding: 0;
  overflow: hidden;
  background: #eaf3ff;
}

.hero-carousel {
  height: 420px;

  :deep(.el-carousel__container) {
    height: 420px;
  }

  :deep(.el-carousel__item) {
    overflow: hidden;
    position: absolute;
    left: 0 !important;
    transform: translateX(0) !important;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.7s ease;
  }

  :deep(.el-carousel__item.is-active) {
    opacity: 1;
    pointer-events: auto;
    z-index: 2;
  }

  :deep(.el-carousel__indicators--horizontal) {
    bottom: 68px;
    z-index: 3;
  }

  :deep(.el-carousel__button) {
    width: 28px;
    height: 3px;
    border-radius: 2px;
    background: rgba(1, 84, 220, 0.18);
    opacity: 1;
  }

  :deep(.el-carousel__indicator.is-active .el-carousel__button) {
    background: #0154dc;
  }

  :deep(.el-carousel__arrow) {
    z-index: 4;
    width: 44px;
    height: 44px;
    font-size: 16px;
    color: #0154dc;
    background: rgba(255, 255, 255, 0.78);
    box-shadow: 0 6px 20px rgba(15, 40, 90, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.9);
  }

  :deep(.el-carousel__arrow:hover) {
    color: #0146b8;
    background: #fff;
  }

  :deep(.el-carousel__arrow--left) {
    left: 28px;
  }

  :deep(.el-carousel__arrow--right) {
    right: 28px;
  }

  :deep(.el-carousel__item.is-active) .hero-banner {
    transform: scale(1) translateX(0);
  }

  :deep(.el-carousel__item.is-active) .hero-panel {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-banner {
  pointer-events: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  transform: scale(1.06) translateX(24px);
  transition: transform 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.hero.is-ready .hero-banner {
  opacity: 1;
}

.hero-panel {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0;
  /* 略偏上，避开底部搜索条与指示点的视觉重心 */
  padding-bottom: 52px;
  box-sizing: border-box;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.55s ease-out 0.12s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.12s;
}

.hero-text {
  max-width: 480px;

  h1 {
    margin: 0 0 16px;
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    color: #0a0a09;
    letter-spacing: 0.02em;
  }

  p {
    margin: 0 0 28px;
    font-size: 16px;
    line-height: 1.7;
    color: #556782;
    max-width: 440px;
  }
}

.hero-cta {
  --el-button-bg-color: #0154dc;
  --el-button-border-color: #0154dc;
  --el-button-hover-bg-color: #0146b8;
  --el-button-hover-border-color: #0146b8;
  width: 168px;
  min-width: 168px;
  height: 44px;
  padding: 0;
  border-radius: 8px;
  font-size: 16px;
}

.search-bar-wrap {
  position: relative;
  z-index: 5;
  margin-top: -52px;
  margin-bottom: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.42s ease-out 0.14s, transform 0.42s ease-out 0.14s;

  &.is-ready {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 12px 12px 12px 22px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(58, 122, 254, 0.08);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);

  .search-icon {
    color: $text-placeholder;
    font-size: 18px;
    margin-right: 12px;
  }

  .search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 15px;
    color: $text-primary;
    background: transparent;

    &::placeholder {
      color: #9c9e9e;
    }
  }

  .search-btn {
    --el-button-bg-color: #0154dc;
    --el-button-border-color: #0154dc;
    min-width: 104px;
    height: 44px;
    border-radius: 8px;
    font-size: 16px;
  }
}

.catalog {
  padding-top: 8px;
  padding-bottom: 0;
}

.cat-tabs-wrap {
  background: #fff;
  padding-bottom: 24px;
}

.cat-tabs {
  display: flex;
  align-items: stretch;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 8px;
  padding-bottom: 0;
}

.catalog-body {
  background: #f1f3f7;
  padding: 24px 0 40px;
}

.cat-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px 14px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  color: #252525;
  position: relative;
  transition: color 0.2s;

  &.active {
    color: #0154dc;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      left: 14px;
      right: 14px;
      bottom: -1px;
      height: 3px;
      border-radius: 2px 2px 0 0;
      background: #0154dc;
    }
  }

  &:hover {
    color: #0154dc;
  }
}

.cat-tab-icon {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.cat-more {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 16px;
  color: #252525;
  padding: 8px 4px;

  .cat-more-plus {
    color: #0154dc;
  }

  &:hover {
    color: #0154dc;
  }
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-height: 120px;
}

.empty-tip {
  grid-column: 1 / -1;
  padding: 40px 0;
  text-align: center;
  color: $text-placeholder;
  font-size: 14px;
}

.stats {
  position: relative;
  margin-top: 0;
  width: 100%;
  aspect-ratio: 1920 / 136;
  min-height: 120px;
  padding: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-color: #eff3ff;
  background-image: url('@/assets/home/stats-bg.png');
  background-position: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
}

.stats-inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.stat-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: block;
  object-fit: contain;
}

.stat-text {
  min-width: 0;
}

.stat-num {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  line-height: 1.3;
}

.stat-label {
  margin-top: 2px;
  font-size: 14px;
  color: #4d5256;
}

.scenarios {
  position: relative;
  margin-top: 0;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1920 / 585;
  background: transparent;
}

.scenarios-bg {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: url('@/assets/home/scenario-bg.png') center / 100% 100% no-repeat;
}

.scenarios-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.scenarios .section-title {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(52 / 585 * 100%);
  margin: 0;
  font-size: clamp(24px, 1.875vw, 36px);
  font-weight: 700;
  color: #000;
  line-height: 1.2;
  text-align: center;
}

.scenarios .section-sub {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(120 / 585 * 100%);
  margin: 0;
  font-size: clamp(14px, 0.94vw, 18px);
  color: #55575e;
  line-height: 1.4;
  text-align: center;
}

.scenario-wall {
  position: absolute;
  left: calc(261 / 1920 * 100%);
  top: calc(199 / 585 * 100%);
  width: calc(625 / 1920 * 100%);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: calc(51 / 1920 * 100%);
  row-gap: calc(27 / 585 * 100%);
}

.scenario-item {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 287 / 82;
  width: 100%;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: clamp(16px, 1.04vw, 20px);
  font-weight: 500;
  letter-spacing: 0.06em;
  line-height: 1.2;
  color: #252525;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.06);
  cursor: pointer;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  transition: color 0.2s, box-shadow 0.2s;

  &:hover {
    color: #0154dc;
    box-shadow: 0 6px 18px rgba(1, 84, 220, 0.12);
  }
}

.cta {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 1920 / 288;
  min-height: 200px;
  display: flex;
  align-items: center;
}

.cta-bg {
  position: absolute;
  inset: 0;
  background: url('@/assets/home/cta-bg.png') center / cover no-repeat;
  background-color: #fff;
}

.cta-inner {
  position: relative;
  z-index: 1;
  text-align: center;
  width: 100%;

  h2 {
    margin: 0 0 12px;
    font-size: 30px;
    font-weight: 700;
    color: #424c61;
  }

  p {
    margin: 0 0 28px;
    font-size: 18px;
    color: #595e69;
  }
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;

  :deep(.el-button--primary) {
    --el-button-bg-color: #0154dc;
    --el-button-border-color: #0154dc;
    min-width: 160px;
    height: 48px;
    border-radius: 10px;
  }

  :deep(.el-button.is-plain) {
    min-width: 140px;
    height: 48px;
    border-radius: 10px;
    --el-button-bg-color: #fff;
    --el-button-border-color: #c9ced8;
    --el-button-text-color: #3c455a;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-panel,
  .hero-banner,
  .search-bar-wrap {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .hero-carousel :deep(.el-carousel__item) {
    transition: none;
  }
}

@media (max-width: 1100px) {
  .api-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stats {
    aspect-ratio: 1920 / 136;
    min-height: 120px;
    padding: 0;
  }

  .scenarios {
    aspect-ratio: 1920 / 585;
    min-height: 0;
    background: transparent;
  }

  .scenarios-bg {
    opacity: 1;
    background-size: 100% 100%;
    background-position: center;
  }

  .scenario-wall {
    left: 5%;
    width: 55%;
    max-width: none;
    margin: 0;
  }

  .cta {
    aspect-ratio: 1920 / 288;
    min-height: 200px;
    max-height: none;
    padding: 32px 16px;
  }

  .cta-bg {
    background-size: cover;
    background-position: center;
  }
}

@media (max-width: 768px) {
  .hero {
    min-height: 320px;
    padding: 48px 0 88px;
  }

  .hero-banner {
    object-position: 70% center;
  }

  .hero-text {
    max-width: 100%;

    h1 {
      font-size: 28px;
    }

    p {
      font-size: 14px;
    }
  }

  .hero-carousel {
    height: 360px;

    :deep(.el-carousel__container) {
      height: 360px;
    }

    :deep(.el-carousel__indicators--horizontal) {
      bottom: 56px;
    }

    :deep(.el-carousel__arrow) {
      display: none;
    }
  }

  .search-bar-wrap {
    margin-top: -44px;
  }

  .search-bar {
    padding: 8px 8px 8px 14px;

    .search-btn {
      min-width: 72px;
      height: 40px;
    }
  }

  .cat-more {
    margin-left: 0;
  }

  .api-grid {
    grid-template-columns: 1fr;
  }

  .stats-inner {
    flex-wrap: wrap;
    gap: 20px;

    .stat-item {
      flex: 0 0 calc(50% - 10px);
      justify-content: flex-start;
    }
  }

  .scenarios .section-title {
    font-size: 22px;
  }

  .scenarios .section-sub {
    font-size: 13px;
    padding: 0 12px;
  }

  .scenario-wall {
    left: 4%;
    width: 70%;
    top: calc(170 / 585 * 100%);
  }

  .scenario-item {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.04em;
    padding: 0 10px;
  }

  .cta-inner h2 {
    font-size: 24px;
  }

  .cta-inner p {
    font-size: 15px;
  }
}
</style>
