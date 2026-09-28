<template>
  <div class="myapi-page">
    <div class="myapi-head">
      <div class="myapi-head-text">
        <h3>我的接口</h3>
        <p class="myapi-sub">展示你调用过的接口及今日额度</p>
      </div>
      <el-button type="primary" round @click="$router.push('/explore')">
        探索接口
      </el-button>
    </div>

    <Transition name="skeleton-reveal" mode="out-in">
      <MyApiListSkeleton v-if="loading && list.length === 0" key="myapi-sk" />
      <div v-else key="myapi-list" class="api-cards" :class="{ 'is-refreshing': loading && list.length > 0 }">
        <div v-for="item in list" :key="item.id" class="myapi-card card">
          <div class="api-info">
            <span class="api-icon">
              <img v-if="item.iconUrl" :src="item.iconUrl" class="api-icon-img" alt="" />
              <img v-else :src="defaultIcon" class="api-icon-img" alt="" />
            </span>
            <div class="api-meta">
              <div class="api-name-row">
                <span class="api-name">{{ item.name }}</span>
                <span class="price-tag" :class="'tag-' + item.priceType">{{ priceText(item) }}</span>
                <span v-if="item.priceType === 'pay'" class="price-value">{{ item.price }} 元/次</span>
              </div>
              <div class="api-meta-sub">最近调用：{{ item.lastCallTime }}</div>
            </div>
            <router-link :to="docLink(item)" class="doc-link">
              <el-button size="small" round>查看文档</el-button>
            </router-link>
          </div>

          <div class="quota-info">
            <div class="quota-row">
              <span class="quota-label">今日额度</span>
              <span class="quota-used">已用 {{ item.used }} 次</span>
              <span class="quota-total">/ 共 {{ item.unlimited ? '不限' : (item.freeTimes + ' 次') }}</span>
            </div>
            <el-progress
              :percentage="progressPercent(item)"
              :stroke-width="10"
              :color="progressColor(item)"
              :show-text="false"
            />
            <div class="quota-remain">
              剩余 <b>{{ remainText(item) }}</b>{{ item.unlimited ? '' : ' 次' }}
              <span v-if="!item.unlimited && item.remain < 100" class="low-tip">
                今日额度即将用完，可升级套餐提升上限
              </span>
            </div>
          </div>
        </div>

        <el-empty v-if="!loading && list.length === 0" description="暂无调用记录，去探索页试试接口吧" />
      </div>
    </Transition>
  </div>
</template>

<script>
import { getMyApis } from '@/api/console'
import MyApiListSkeleton from '@/components/skeleton/MyApiListSkeleton.vue'
import { resolveApiIconUrl, DEFAULT_OPEN_ICON } from '@/utils/openIcon'

export default {
  name: 'ConsoleMyApi',
  components: { MyApiListSkeleton },
  data() {
    return {
      list: [],
      loading: true,
      defaultIcon: DEFAULT_OPEN_ICON
    }
  },
  methods: {
    priceText(item) {
      if (item.priceType === 'free') return '免费接口'
      if (item.priceType === 'vip') return '会员接口'
      return '计次接口'
    },
    progressPercent(item) {
      if (item.unlimited || !item.freeTimes) return 0
      return Math.min(100, Math.round((item.used / item.freeTimes) * 100))
    },
    progressColor(item) {
      if (item.unlimited || !item.freeTimes) return '#3a7afe'
      const ratio = item.used / item.freeTimes
      if (ratio >= 0.9) return '#ef4444'
      if (ratio >= 0.6) return '#f59e0b'
      return '#3a7afe'
    },
    remainText(item) {
      if (item.unlimited) return '不限'
      return item.remain
    },
    docLink(item) {
      const code = item.id
      if (!code) return { path: '/explore' }
      return `/docs/${encodeURIComponent(code)}`
    },
    mapRow(row) {
      const chargeType = row.chargeType || 'free'
      const dailyUsed = Number(row.dailyUsed) || 0
      const dailyLimit = Number(row.dailyLimit) || 0
      const dailyLeft = row.dailyLeft == null ? 0 : Number(row.dailyLeft)
      const unlimited = dailyLeft === -1 || dailyLimit <= 0
      return {
        id: row.apiCode,
        name: row.apiName || row.apiCode || '-',
        iconUrl: resolveApiIconUrl(row.apiIcon),
        category: row.categoryCode || '',
        priceType: chargeType === 'payg' ? 'pay' : chargeType,
        price: row.unitPrice,
        used: dailyUsed,
        freeTimes: unlimited ? 0 : dailyLimit,
        remain: unlimited ? 0 : Math.max(0, dailyLeft),
        unlimited,
        lastCallTime: row.lastCallTime || '-'
      }
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getMyApis()
        this.list = (res.data || []).map(this.mapRow)
      } catch (e) {
        this.list = []
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.fetchList()
  }
}
</script>

<style scoped lang="scss">

.myapi-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.myapi-head-text {
  min-width: 0;

  h3 {
    font-size: 16px;
    margin: 0;
    color: $text-primary;
  }
}

.myapi-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: $text-placeholder;
}

.api-cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: opacity 0.2s ease;

  &.is-refreshing {
    opacity: 0.55;
    pointer-events: none;
  }
}

.myapi-card {
  padding: 20px 24px;
}

.api-info {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.api-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f1f1f1;

  .api-icon-img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
}

.api-meta {
  flex: 1;
  min-width: 0;
}

.api-name-row {
  display: flex;
  align-items: center;
  gap: 8px;

  .api-name {
    font-size: 16px;
    font-weight: 600;
    color: $text-primary;
  }

  .price-value {
    color: $color-pay;
    font-size: 13px;
    font-weight: 500;
  }
}

.api-meta-sub {
  font-size: 12px;
  color: $text-placeholder;
  margin-top: 4px;
}

.doc-link {
  flex-shrink: 0;
}

.quota-info {
  background: $bg-page;
  border-radius: 8px;
  padding: 14px 16px;
}

.quota-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 13px;

  .quota-label {
    color: $text-secondary;
  }

  .quota-used {
    color: $text-primary;
    font-weight: 500;
  }

  .quota-total {
    color: $text-placeholder;
  }
}

.quota-remain {
  margin-top: 8px;
  font-size: 13px;
  color: $text-secondary;

  b {
    color: $primary-color;
  }

  .low-tip {
    margin-left: 10px;
    color: $color-pay;
    font-size: 12px;
  }
}
</style>
