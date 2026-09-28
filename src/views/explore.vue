<template>
  <div class="explore-page page-container">
    <!-- 页头 -->
    <div class="explore-head">
      <h1>探索 API</h1>
      <p>浏览全部接口文档，免费额度即用，计次接口按次计费</p>
    </div>

    <!-- 分类筛选 -->
    <div class="filter-bar card">
      <span class="filter-label">分类：</span>
      <span
        class="filter-item"
        :class="{ active: currentCategory === '' }"
        @click="changeCategory('')"
      >全部</span>
      <span
        v-for="cat in categories"
        :key="cat.categoryCode"
        class="filter-item"
        :class="{ active: currentCategory === cat.categoryCode }"
        @click="changeCategory(cat.categoryCode)"
      >
        {{ cat.categoryName }}
      </span>

      <span class="filter-label" style="margin-left: 24px;">类型：</span>
      <span
        class="filter-item"
        :class="{ active: priceType === '' }"
        @click="changePriceType('')"
      >全部</span>
      <span
        class="filter-item"
        :class="{ active: priceType === 'free' }"
        @click="changePriceType('free')"
      >免费</span>
      <span
        class="filter-item"
        :class="{ active: priceType === 'vip' }"
        @click="changePriceType('vip')"
      >会员</span>
      <span
        class="filter-item"
        :class="{ active: priceType === 'payg' }"
        @click="changePriceType('payg')"
      >计次</span>
    </div>

    <!-- 接口列表 -->
    <div class="api-list">
      <Transition name="skeleton-reveal" mode="out-in">
        <ApiGridSkeleton v-if="loading && list.length === 0" key="explore-sk" :count="pageSize" />
        <div v-else-if="list.length === 0" key="explore-empty" class="empty-tip">
          <el-empty description="没有找到相关接口，换个关键词试试" />
        </div>
        <div v-else key="explore-list" class="api-grid" :class="{ 'is-refreshing': loading }">
          <ApiCard v-for="api in list" :key="api.apiCode" :api="api" />
        </div>
      </Transition>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, total"
          background
          @current-change="fetchList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ApiCard from '@/components/ApiCard.vue'
import ApiGridSkeleton from '@/components/skeleton/ApiGridSkeleton.vue'
import { getOpenCategories, getOpenApis } from '@/api/platform'
import { resolveApiIconUrl } from '@/utils/openIcon'

export default {
  name: 'ExplorePage',
  components: { ApiCard, ApiGridSkeleton },
  data() {
    return {
      categories: [],
      list: [],
      total: 0,
      page: 1,
      pageSize: 12,
      loading: true,
      currentCategory: '',
      priceType: '',
      keyword: ''
    }
  },
  created() {
    this.keyword = this.$route.query.keyword || ''
    this.currentCategory = this.$route.query.category || ''
    this.priceType = this.$route.query.chargeType || ''
  },
  watch: {
    '$route.query'(query) {
      this.keyword = query.keyword || ''
      this.currentCategory = query.category || ''
      this.priceType = query.chargeType || ''
      this.page = 1
      this.fetchList()
    }
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await getOpenCategories()
        if (res.code === 200) {
          this.categories = (res.data || []).sort((a, b) => (a.sortNum ?? 0) - (b.sortNum ?? 0))
        }
      } catch (e) {
        // 分类加载失败时保留空数组，接口列表仍可展示
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getOpenApis({
          pageNum: this.page,
          pageSize: this.pageSize,
          categoryCode: this.currentCategory || undefined,
          keyword: this.keyword || undefined,
          chargeType: this.priceType || undefined
        })
        if (res.code === 200) {
          this.list = (res.rows || []).map((item) => ({
            ...item,
            iconUrl: resolveApiIconUrl(item.apiIcon)
          }))
          this.total = res.total || 0
        }
      } catch (e) {
        // 错误已由 request 拦截器提示
      } finally {
        this.loading = false
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    changeCategory(catId) {
      if (this.currentCategory === catId) return
      this.currentCategory = catId
      this.page = 1
      this.fetchList()
    },
    changePriceType(type) {
      if (this.priceType === type) return
      this.priceType = type
      this.page = 1
      this.fetchList()
    }
  },
  mounted() {
    this.fetchCategories()
    this.fetchList()
  }
}
</script>

<style scoped lang="scss">

.explore-page {
  padding-top: 32px;
  padding-bottom: 48px;
}

.explore-head {
  margin-bottom: 20px;

  h1 {
    font-size: 28px;
    margin: 0 0 8px;
    color: $text-primary;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: $text-secondary;
  }
}

.filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 14px 20px;
  margin-bottom: 20px;

  .filter-label {
    font-size: 14px;
    color: $text-secondary;
    margin-right: 4px;
  }

  .filter-item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 14px;
    border-radius: 16px;
    font-size: 14px;
    color: $text-regular;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $primary-color;
    }

    &.active {
      background: $primary-gradient;
      color: #fff;
      font-weight: 500;
    }
  }
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  transition: opacity 0.2s ease;

  &.is-refreshing {
    opacity: 0.55;
    pointer-events: none;
  }
}

.empty-tip {
  padding: 60px 0;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 1024px) {
  .api-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .api-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .api-grid {
    grid-template-columns: 1fr;
  }
}
</style>
