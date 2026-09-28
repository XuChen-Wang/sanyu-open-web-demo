<template>
  <div class="overview-page">
    <Transition name="skeleton-reveal" mode="out-in" @after-enter="onContentRevealed">
      <OverviewSkeleton v-if="loading" key="overview-sk" />

      <div v-else key="overview-body" class="overview-body">
        <!-- 欢迎区 -->
        <section class="welcome card">
          <div class="welcome-main">
            <h2 class="welcome-title">{{ greeting }}，{{ displayName }}</h2>
            <p class="welcome-sub">
              今日调用 <b>{{ formatNum(overview.todayCalls) }}</b> 次
              <span class="dot">·</span>
              成功 {{ formatNum(overview.todaySuccess) }}
              <span class="dot">·</span>
              失败 {{ formatNum(overview.todayFail) }}
            </p>
          </div>
          <div class="welcome-actions">
            <el-button type="primary" round @click="$router.push('/explore')">
              探索接口
            </el-button>
            <el-button round @click="$router.push('/console/token')">
              Token 管理
            </el-button>
          </div>
        </section>

        <!-- KPI -->
        <div class="kpi-grid">
          <div
            v-for="item in kpiList"
            :key="item.key"
            class="kpi-card card"
            :class="'tone-' + item.tone"
          >
            <div class="kpi-icon">
              <el-icon :size="20"><component :is="item.icon" /></el-icon>
            </div>
            <div class="kpi-body">
              <div class="kpi-value">{{ item.value }}</div>
              <div class="kpi-label">{{ item.label }}</div>
              <div v-if="item.hint" class="kpi-hint">{{ item.hint }}</div>
            </div>
          </div>
        </div>

        <div class="mid-grid">
          <!-- 趋势 -->
          <section class="trend card">
            <div class="panel-head">
              <h3>调用趋势（近 14 天）</h3>
              <el-radio-group v-model="trendType" size="small" @change="renderTrend">
                <el-radio-button value="line">折线</el-radio-button>
                <el-radio-button value="bar">柱状</el-radio-button>
              </el-radio-group>
            </div>
            <div class="chart-wrap">
              <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="trend-chart" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="overviewAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3a7afe" stop-opacity="0.28" />
                    <stop offset="100%" stop-color="#3a7afe" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <line
                  v-for="g in gridLines"
                  :key="'g' + g.y"
                  :x1="padding.left"
                  :y1="g.y"
                  :x2="chartW - padding.right"
                  :y2="g.y"
                  class="grid-line"
                />
                <text
                  v-for="g in gridLines"
                  :key="'t' + g.y"
                  :x="padding.left - 8"
                  :y="g.y + 4"
                  class="axis-label"
                  text-anchor="end"
                >{{ g.value }}</text>

                <template v-if="trendType === 'bar'">
                  <rect
                    v-for="(point, i) in points"
                    :key="'b' + i"
                    :x="point.x - barW / 2"
                    :y="point.y"
                    :width="barW"
                    :height="Math.max(0, chartH - padding.bottom - point.y)"
                    rx="3"
                    class="bar"
                  >
                    <title>{{ point.date }}：{{ point.count }} 次</title>
                  </rect>
                </template>
                <template v-else>
                  <path :d="areaPath" class="area-fill" />
                  <polyline :points="polylinePoints" class="area-line" fill="none" />
                  <circle
                    v-for="(point, i) in points"
                    :key="'c' + i"
                    :cx="point.x"
                    :cy="point.y"
                    r="3"
                    class="dot"
                  >
                    <title>{{ point.date }}：{{ point.count }} 次</title>
                  </circle>
                </template>

                <text
                  v-for="(point, i) in xLabels"
                  :key="'x' + i"
                  :x="point.x"
                  :y="chartH - padding.bottom + 18"
                  class="axis-label"
                  text-anchor="middle"
                >{{ point.date }}</text>
              </svg>
              <div v-if="!hasTrendData" class="chart-empty">近 14 天暂无调用记录</div>
            </div>
          </section>

          <!-- 右侧：账户 + 快捷入口 -->
          <aside class="side-col">
            <section class="account card">
              <div class="panel-head">
                <h3>账户概览</h3>
                <el-tag
                  size="small"
                  :type="overview.isVip ? 'warning' : 'info'"
                  effect="light"
                  round
                >{{ overview.isVip ? '会员' : '普通' }}</el-tag>
              </div>
              <div class="account-rows">
                <div class="account-row">
                  <span class="account-label">当前套餐</span>
                  <span class="account-value">{{ overview.planName || '未开通套餐' }}</span>
                </div>
                <div class="account-row">
                  <span class="account-label">到期时间</span>
                  <span class="account-value">{{ expireText }}</span>
                </div>
                <div class="account-row">
                  <span class="account-label">账户余额</span>
                  <span class="account-value balance">¥ {{ balanceText }}</span>
                </div>
              </div>
              <div class="account-actions">
                <el-button type="primary" size="small" round @click="$router.push('/vip')">
                  {{ overview.isVip ? '续费 / 升级' : '开通会员' }}
                </el-button>
                <el-button size="small" round @click="$router.push('/console/orders')">订单记录</el-button>
              </div>
            </section>

            <section class="quick card">
              <div class="panel-head">
                <h3>快捷入口</h3>
              </div>
              <div class="quick-grid">
                <button
                  v-for="q in quickLinks"
                  :key="q.path"
                  type="button"
                  class="quick-item"
                  @click="$router.push(q.path)"
                >
                  <span class="quick-icon" :style="{ background: q.bg, color: q.color }">
                    <el-icon :size="16"><component :is="q.icon" /></el-icon>
                  </span>
                  <span class="quick-text">{{ q.label }}</span>
                </button>
              </div>
            </section>
          </aside>
        </div>

        <!-- 最近调用 -->
        <section class="recent card">
          <div class="panel-head">
            <h3>最近调用</h3>
            <el-button size="small" text type="primary" @click="$router.push('/console/logs')">
              查看全部
            </el-button>
          </div>
          <el-table :data="recentRows" stripe style="width: 100%" empty-text="暂无调用记录">
            <el-table-column prop="time" label="调用时间" width="180" />
            <el-table-column prop="apiName" label="接口名称" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="row.status === 'success' ? 'success' : 'danger'"
                  effect="light"
                >{{ row.status === 'success' ? '成功' : '失败' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="latency" label="耗时" width="100" />
            <el-table-column label="消费" width="110">
              <template #default="{ row }">
                <span :class="row.free ? 'consume-free' : 'consume-pay'">{{ row.consume }}</span>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </div>
    </Transition>
  </div>
</template>

<script>
import {
  Compass,
  Document,
  Grid,
  Key,
  Timer,
  TrendCharts
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { getOverview } from '@/api/console'
import OverviewSkeleton from '@/components/skeleton/OverviewSkeleton.vue'

export default {
  name: 'ConsoleOverview',
  components: {
    OverviewSkeleton,
    Compass,
    Document,
    Grid,
    Key,
    Timer,
    TrendCharts
  },
  data() {
    return {
      userStore: useUserStore(),
      loading: true,
      overview: {
        todayCalls: 0,
        totalCalls: 0,
        todaySuccess: 0,
        todayFail: 0,
        tokenCount: 0,
        usedApiCount: 0,
        balance: 0,
        isVip: 0,
        planName: '',
        planCode: '',
        expireTime: null,
        trend: [],
        recentCalls: []
      },
      trendType: 'line',
      chartW: 720,
      chartH: 260,
      padding: { top: 24, left: 48, right: 12, bottom: 36 },
      points: [],
      quickLinks: [
        { label: '我的接口', path: '/console/myapi', icon: Grid, color: '#3a7afe', bg: 'rgba(58,122,254,0.12)' },
        { label: '调用日志', path: '/console/logs', icon: Document, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        { label: 'Token', path: '/console/token', icon: Key, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
        { label: '探索 API', path: '/explore', icon: Compass, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' }
      ]
    }
  },
  computed: {
    displayName() {
      return this.userStore.displayName || '用户'
    },
    greeting() {
      const h = new Date().getHours()
      if (h < 6) return '夜深了'
      if (h < 12) return '早上好'
      if (h < 14) return '中午好'
      if (h < 18) return '下午好'
      return '晚上好'
    },
    balanceText() {
      const n = Number(this.overview.balance || 0)
      return Number.isFinite(n) ? n.toFixed(2) : '0.00'
    },
    expireText() {
      if (!this.overview.expireTime) return '长期有效'
      return String(this.overview.expireTime).slice(0, 16)
    },
    kpiList() {
      const o = this.overview
      const today = Number(o.todayCalls || 0)
      const ok = Number(o.todaySuccess || 0)
      const rate = today > 0 ? Math.round((ok / today) * 100) : null
      return [
        {
          key: 'today',
          label: '今日调用',
          value: this.formatNum(o.todayCalls),
          hint: rate == null ? '暂无数据' : `成功率 ${rate}%`,
          icon: Timer,
          tone: 'blue'
        },
        {
          key: 'total',
          label: '累计调用',
          value: this.formatNum(o.totalCalls),
          hint: '不含请求无效',
          icon: TrendCharts,
          tone: 'green'
        },
        {
          key: 'token',
          label: 'Token 数量',
          value: this.formatNum(o.tokenCount),
          hint: '访问密钥',
          icon: Key,
          tone: 'orange'
        },
        {
          key: 'apis',
          label: '已用接口',
          value: this.formatNum(o.usedApiCount),
          hint: '有过调用记录',
          icon: Grid,
          tone: 'purple'
        }
      ]
    },
    hasTrendData() {
      return (this.overview.trend || []).some(t => Number(t.count) > 0)
    },
    maxCount() {
      const max = Math.max(...(this.overview.trend || []).map(t => Number(t.count) || 0), 0)
      if (max <= 0) return 10
      const step = max <= 20 ? 5 : max <= 100 ? 10 : max <= 1000 ? 50 : 100
      return Math.ceil(max / step) * step
    },
    gridLines() {
      const lines = []
      for (let i = 0; i <= 4; i++) {
        const y = this.padding.top + ((this.chartH - this.padding.top - this.padding.bottom) / 4) * i
        const value = Math.round((this.maxCount / 4) * (4 - i))
        lines.push({
          y,
          value: value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : value
        })
      }
      return lines
    },
    barW() {
      const n = (this.overview.trend || []).length || 1
      return Math.min(22, (this.chartW - this.padding.left - this.padding.right) / n / 1.8)
    },
    polylinePoints() {
      return this.points.map(p => `${p.x},${p.y}`).join(' ')
    },
    areaPath() {
      if (this.points.length === 0) return ''
      const first = this.points[0]
      const last = this.points[this.points.length - 1]
      const base = this.chartH - this.padding.bottom
      return `M ${first.x},${base} L ${this.points.map(p => `${p.x},${p.y}`).join(' L ')} L ${last.x},${base} Z`
    },
    xLabels() {
      // 14 天标签太密，隔天显示
      return this.points.filter((_, i) => i % 2 === 0 || i === this.points.length - 1)
    },
    recentRows() {
      return (this.overview.recentCalls || []).map(row => {
        const amount = Number(row.amount || 0)
        const free = !(amount > 0)
        return {
          time: row.callTime || '-',
          apiName: row.apiName || row.apiCode || '-',
          status: row.status || 'fail',
          latency: row.latencyMs == null ? '-' : `${row.latencyMs}ms`,
          free,
          consume: free ? '免费' : `${amount.toFixed(2)}元`
        }
      })
    }
  },
  methods: {
    formatNum(v) {
      const n = Number(v || 0)
      if (!Number.isFinite(n)) return '0'
      return n.toLocaleString('zh-CN')
    },
    renderTrend() {
      const data = this.overview.trend || []
      const innerW = this.chartW - this.padding.left - this.padding.right
      const innerH = this.chartH - this.padding.top - this.padding.bottom
      const max = this.maxCount || 1
      this.points = data.map((item, i) => {
        const x = this.padding.left + (data.length <= 1 ? innerW / 2 : (innerW / (data.length - 1)) * i)
        const count = Number(item.count) || 0
        const y = this.padding.top + innerH - (count / max) * innerH
        return { x, y, date: item.date, count }
      })
    },
    onContentRevealed() {
      if (!this.loading) {
        this.renderTrend()
      }
    },
    async fetchOverview() {
      this.loading = true
      try {
        const res = await getOverview()
        if (res.code === 200 && res.data) {
          this.overview = {
            ...this.overview,
            ...res.data,
            trend: res.data.trend || [],
            recentCalls: res.data.recentCalls || []
          }
        }
      } catch (e) {
        // request 拦截器已提示
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    this.fetchOverview()
  }
}
</script>

<style scoped lang="scss">

.overview-body {
  min-height: 640px;
}

.welcome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  margin-bottom: 16px;
  background:
    radial-gradient(120% 140% at 100% 0%, rgba(58, 122, 254, 0.12), transparent 55%),
    $bg-card;
}

.welcome-title {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: $text-primary;
}

.welcome-sub {
  margin: 0;
  font-size: 13px;
  color: $text-secondary;

  b {
    color: $primary-color;
    font-weight: 700;
  }

  .dot {
    margin: 0 6px;
    color: $text-placeholder;
  }
}

.welcome-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.kpi-card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 20px;
}

.kpi-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.tone-blue .kpi-icon {
  background: linear-gradient(135deg, #3a7afe, #6ea1ff);
}

.tone-green .kpi-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.tone-orange .kpi-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.tone-purple .kpi-icon {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  color: $text-primary;
}

.kpi-label {
  margin-top: 4px;
  font-size: 13px;
  color: $text-secondary;
}

.kpi-hint {
  margin-top: 6px;
  font-size: 12px;
  color: $text-placeholder;
}

.mid-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.9fr);
  gap: 16px;
  margin-bottom: 16px;
}

.side-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  padding: 20px 24px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    color: $text-primary;
  }
}

.chart-wrap {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

.trend-chart {
  width: 100%;
  min-width: 520px;
  height: auto;
}

.chart-empty {
  position: absolute;
  inset: 28px 12px 36px 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-placeholder;
  font-size: 13px;
  pointer-events: none;
}

.grid-line {
  stroke: #e5e7eb;
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.axis-label {
  font-size: 11px;
  fill: #9ca3af;
}

.bar {
  fill: rgba(58, 122, 254, 0.75);

  &:hover {
    fill: #3a7afe;
  }
}

.area-line {
  stroke: #3a7afe;
  stroke-width: 2;
  stroke-linejoin: round;
}

.area-fill {
  fill: url(#overviewAreaGradient);
}

.dot {
  fill: #3a7afe;
  stroke: #fff;
  stroke-width: 1.5;
}

.account-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.account-label {
  color: $text-secondary;
}

.account-value {
  color: $text-primary;
  font-weight: 600;
  text-align: right;

  &.balance {
    color: $primary-color;
    font-variant-numeric: tabular-nums;
  }
}

.account-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
}

.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid $border-color;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: rgba(58, 122, 254, 0.45);
    background: rgba(58, 122, 254, 0.04);
  }
}

.quick-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.quick-text {
  font-size: 13px;
  color: $text-regular;
  font-weight: 500;
}

.recent {
  margin-bottom: 4px;
}

.consume-free {
  color: $color-free;
  font-size: 13px;
}

.consume-pay {
  color: $color-pay;
  font-size: 13px;
}

@media (max-width: 1100px) {
  .mid-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 720px) {
  .welcome {
    flex-direction: column;
    align-items: flex-start;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }
}
</style>
