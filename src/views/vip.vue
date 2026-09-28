<template>
  <div class="vip-page">
    <!-- 页头 -->
    <div class="vip-head">
      <h1>会员 VIP</h1>
      <p>选择适合你的套餐，解锁更多接口与专属权益</p>
      <Transition name="skeleton-reveal" mode="out-in">
        <div v-if="loading" key="period-sk" class="period-tabs-skeleton">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="text" class="sk-period-bar" />
            </template>
          </el-skeleton>
        </div>
        <div v-else-if="periodTabs.length" key="period-tabs" class="period-tabs">
          <button
            v-for="tab in periodTabs"
            :key="tab.type"
            type="button"
            class="period-tab"
            :class="{ active: selectedPeriod === tab.type }"
            @click="selectedPeriod = tab.type"
          >
            {{ tab.label }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- 限额说明：选套餐前先说清「按单个接口」 -->
    <el-alert
      class="vip-notice"
      title="重要说明"
      type="info"
      show-icon
      :closable="false"
    >
      <template #default>
        接口请求次数和 QPS 限制都是针对<strong>单个接口</strong>的限制，不是所有接口的总和限制，请根据您的实际需求选择合适的会员等级。
      </template>
    </el-alert>

    <el-alert
      v-if="pendingPlan"
      class="pending-plan-notice"
      :title="`${pendingPlan.planName}已购买，将于${pendingPlan.pendingEffectiveTime || '当前套餐到期后'}自动生效`"
      type="success"
      show-icon
      :closable="false"
    />

    <!-- 套餐与下方内容 -->
    <Transition name="skeleton-reveal" mode="out-in">
      <VipPageSkeleton v-if="loading" key="vip-sk" />
      <div v-else key="vip-content" class="vip-body">
      <div class="plan-list">
      <div
        v-for="plan in visiblePlans"
        :key="plan.planCode"
        class="plan-card card"
        :class="{ hot: plan.hot, current: plan.current }"
      >
        <div v-if="plan.hot" class="plan-flag">推荐</div>
        <div class="plan-name">{{ plan.planName }}</div>
        <div class="plan-price">
          <span class="currency">￥</span>
          <span class="amount">{{ formatPrice(displayPrice(plan)) }}</span>
          <span v-if="periodUnit(plan)" class="unit">{{ periodUnit(plan) }}</span>
        </div>
        <div class="plan-desc">{{ plan.remark || plan.apiScopeLabel }}</div>

        <ul class="plan-features">
          <li>
            <span class="feat-label">免费接口</span>
            <span class="feat-value">
              <el-icon v-if="hasFreeScope(plan)" color="#3a7afe"><CircleCheck /></el-icon>
              <el-icon v-else color="#ef4444"><CircleClose /></el-icon>
              {{ hasFreeScope(plan) ? '可用' : '不可用' }}
            </span>
          </li>
          <li>
            <span class="feat-label">会员接口</span>
            <span class="feat-value">
              <el-icon v-if="hasVipScope(plan)" color="#3a7afe"><CircleCheck /></el-icon>
              <el-icon v-else color="#ef4444"><CircleClose /></el-icon>
              {{ hasVipScope(plan) ? '可用' : '不可用' }}
            </span>
          </li>
          <li>
            <span class="feat-label">请求次数</span>
            <span class="feat-value">
              {{ formatDailyText(plan) }}
              <span v-if="hasSpecialLimits(plan)" class="feat-tip">
                <span class="feat-tip-btn" title="特殊接口限制">i</span>
                <div class="feat-tip-bubble" role="tooltip">
                  <div class="feat-tip-title">特殊接口限制</div>
                  <div class="feat-tip-desc">以下接口有单独限制：</div>
                  <div
                    v-for="item in plan.specialLimits"
                    :key="item.apiCode"
                    class="feat-tip-row"
                  >
                    <span class="feat-tip-name">{{ item.apiName || item.apiCode }}</span>
                    <span class="feat-tip-limit">{{ formatSpecialLimitText(item) }}</span>
                  </div>
                </div>
              </span>
            </span>
          </li>
          <li>
            <span class="feat-label">QPS 限制</span>
            <span class="feat-value">{{ formatQpsText(plan) }}</span>
          </li>
          <li v-if="hasVipScope(plan)">
            <span class="feat-label">会员专属接口</span>
            <span class="feat-value">
              <a class="feat-link" href="javascript:;" @click.stop="goVipApis">查看列表</a>
            </span>
          </li>
        </ul>

        <el-button
          class="plan-btn"
          :type="plan.hot || plan.current ? 'primary' : 'default'"
          round
          :disabled="isPlanDisabled(plan)"
          @click="onBuy(plan)"
        >
          {{ planButtonText(plan) }}
        </el-button>
      </div>
      </div>

      <!-- 权益对比 -->
      <div v-if="visiblePlans.length" class="card compare-card">
      <h3 class="card-title">会员权益对比</h3>
      <el-table :data="compareRows" border>
        <el-table-column prop="name" label="权益项" width="200" />
        <el-table-column
          v-for="plan in visiblePlans"
          :key="plan.planCode"
          :label="plan.planName"
          align="center"
          :min-width="visiblePlans.length <= 4 ? 180 : 140"
        >
          <template #default="{ row }">
            <span :class="compareValueClass(row[plan.planCode])">
              {{ row[plan.planCode] }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      </div>

      <el-alert
        class="vip-warning"
      title="重要提示"
      type="warning"
      show-icon
      :closable="false"
    >
      <template #default>
        <p>API接口是计算机软件数字化产品，会员服务一经购买，不支持退款。会员权益如未使用，逾期作废。</p>
        <p>如需开具发票，请在控制台 - 财务管理 - 发票管理处申请。</p>
      </template>
      </el-alert>
      </div>
    </Transition>

    <!-- 购买确认弹窗 -->
    <el-dialog v-model="buyVisible" :title="buyDialogTitle" width="440px" align-center>
      <div v-if="buyPlan" class="buy-box">
        <div class="buy-plan-name">{{ buyPlan.planName }}</div>
        <div class="buy-price">
          ￥{{ formatPrice(displayPrice(buyPlan)) }}
          <span v-if="periodUnit(buyPlan)" class="unit">{{ periodUnit(buyPlan) }}</span>
        </div>
        <div class="buy-benefit">
          开通后立享：{{ (buyPlan.features || []).slice(0, 3).join('、') }}
          <template v-if="displayPeriodDays(buyPlan) > 0">
            ；有效期按{{ periodDurationLabel(selectedPeriod) }}计（{{ periodLabel(selectedPeriod) }}）
          </template>
          <template v-else>
            ；永久有效
          </template>
        </div>
        <el-alert
          v-if="buyAction === 'upgrade'"
          title="升级套餐支付成功后立即生效"
          type="warning"
          show-icon
          :closable="false"
        >
          当前套餐剩余有效期和未使用权益将立即终止，且不进行退款。
        </el-alert>
        <el-alert
          v-else-if="buyAction === 'downgrade'"
          :title="`降级套餐将在${currentPlan?.currentExpireTime || '当前套餐到期后'}自动生效`"
          type="info"
          show-icon
          :closable="false"
        >
          支付成功后当前套餐继续使用，系统将在到期时自动完成套餐切换。
        </el-alert>
        <el-alert
          v-else-if="buyAction === 'renew'"
          title="续费时长将从当前套餐到期时间开始顺延"
          type="success"
          show-icon
          :closable="false"
        />
        <div class="pay-methods">
          <div
            v-for="pay in payMethods"
            :key="pay.type"
            class="pay-item"
            :class="{ active: payType === pay.type }"
            @click="payType = pay.type"
          >
            <el-icon :size="18" :color="pay.color"><component :is="pay.icon" /></el-icon>
            <span>{{ pay.name }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="buyVisible = false">取消</el-button>
        <el-button type="primary" :loading="buying" @click="onConfirmBuy">确认支付</el-button>
      </template>
    </el-dialog>

    <!-- 微信 Native 支付二维码 -->
    <el-dialog
      v-model="payVisible"
      title="微信扫码支付"
      width="min(400px, calc(100vw - 32px))"
      align-center
      :close-on-click-modal="false"
      @closed="onPayDialogClosed"
    >
      <div v-if="payOrder" class="wechat-pay-box">
        <div class="pay-order-plan">{{ payOrder.planName }}</div>
        <div class="pay-order-amount">￥{{ formatPrice(payOrder.amount) }}</div>
        <div class="pay-qrcode-wrap" :class="{ expired: payExpired }">
          <img v-if="payOrder.qrCodeDataUrl" :src="payOrder.qrCodeDataUrl" alt="微信支付二维码" class="pay-qrcode" />
          <div v-if="payExpired" class="pay-expired-mask">
            <el-icon :size="28"><Clock /></el-icon>
            <span>二维码已过期</span>
          </div>
        </div>
        <div v-if="!payExpired" class="pay-status-line" :class="payStatusState">
          <el-icon v-if="payStatusState === 'checking'" class="is-loading"><Loading /></el-icon>
          <span>{{ payStatusText }}</span>
        </div>
        <div class="pay-countdown" :class="{ expired: payExpired }">
          {{ payExpired ? '本次订单已失效，请重新获取二维码' : `支付剩余时间 ${payCountdownText}` }}
        </div>
        <div class="pay-order-meta">订单号：{{ payOrder.orderNo }}</div>
        <div class="pay-order-meta">二维码有效期至：{{ payOrder.expireTime }}</div>
      </div>
      <template #footer>
        <el-button @click="payVisible = false">{{ payExpired ? '关闭' : '取消支付' }}</el-button>
        <el-button
          v-if="payExpired"
          type="primary"
          :loading="payRefreshing"
          @click="refreshPayOrder"
        >
          <el-icon><RefreshRight /></el-icon>
          重新获取二维码
        </el-button>
        <el-button
          v-else
          type="primary"
          :loading="payManualQuerying"
          :disabled="payManualCooldown"
          @click="pollPayOrder(true)"
        >
          {{ payManualQuerying ? '正在查询...' : '查询支付结果' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 开通成功弹窗 -->
    <el-dialog v-model="successVisible" :title="successPending ? '购买成功' : '开通成功'" width="380px" align-center :close-on-click-modal="false">
      <div class="success-box">
        <el-icon color="#3a7afe" :size="52"><CircleCheckFilled /></el-icon>
        <div class="success-title">{{ successPending ? `${successPlan}待生效` : `${successPlan}已生效` }}</div>
        <div class="success-desc">
          {{ successPending
            ? `当前套餐到期后自动切换${successEffectiveTime ? `，预计生效时间：${successEffectiveTime}` : ''}`
            : '会员权益已发放到你的账户，现在就去体验吧！' }}
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="successVisible = false">好的</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { getPortalPlans } from '@/api/platform'
import { createPayOrder, queryPayOrder } from '@/api/pay'
import VipPageSkeleton from '@/components/skeleton/VipPageSkeleton.vue'
import {
  CircleCheck,
  CircleClose,
  CircleCheckFilled,
  ChatDotRound,
  Clock,
  Loading,
  RefreshRight
} from '@element-plus/icons-vue'

export default {
  name: 'VipPage',
  components: {
    VipPageSkeleton,
    CircleCheck,
    CircleClose,
    CircleCheckFilled,
    ChatDotRound,
    Clock,
    Loading,
    RefreshRight
  },
  data() {
    return {
      userStore: useUserStore(),
      appStore: useAppStore(),
      loading: true,
      plans: [],
      selectedPeriod: 'month',
      buyVisible: false,
      buyPlan: null,
      payType: 'wechat',
      payMethods: [
        { type: 'wechat', name: '微信支付', icon: 'ChatDotRound', color: '#07c160' }
      ],
      buying: false,
      payVisible: false,
      payOrder: null,
      payQuerying: false,
      payManualQuerying: false,
      payManualCooldown: false,
      payManualCooldownTimer: null,
      payStatusState: 'waiting',
      payStatusText: '等待微信扫码支付',
      payPollingTimer: null,
      payCountdownTimer: null,
      payRemainingSeconds: 0,
      payExpiryHandledOrderNo: '',
      payRefreshing: false,
      successVisible: false,
      successPlan: '',
      successPending: false,
      successEffectiveTime: '',
      buyAction: 'change'
    }
  },
  computed: {
    periodTabs() {
      const order = [
        { type: 'month', label: '月付' },
        { type: 'quarter', label: '季付' },
        { type: 'year', label: '年付' }
      ]
      const available = new Set()
      this.plans.forEach((plan) => {
        ;(plan.periods || []).forEach((p) => {
          if (p && p.periodType) available.add(p.periodType)
        })
      })
      const tabs = order.filter((t) => available.has(t.type))
      return tabs.length ? tabs : [{ type: 'month', label: '月付' }]
    },
    visiblePlans() {
      return this.plans.filter((plan) => this.hasSelectedPeriod(plan))
    },
    currentPlan() {
      return this.plans.find((plan) => plan.current) || null
    },
    pendingPlan() {
      return this.plans.find((plan) => plan.pending) || null
    },
    buyDialogTitle() {
      const titles = {
        renew: '确认续费',
        upgrade: '确认升级套餐',
        downgrade: '确认降级套餐',
        change: '确认开通'
      }
      return titles[this.buyAction] || '确认开通'
    },
    compareRows() {
      const rows = [
        { name: '价格', key: 'price' },
        { name: '有效期', key: 'period' },
        { name: '免费接口', key: 'free' },
        { name: '会员接口', key: 'vip' },
        { name: '请求次数', key: 'daily' },
        { name: 'QPS', key: 'qps' },
        { name: '说明', key: 'remark' }
      ]
      return rows.map((meta) => {
        const row = { name: meta.name }
        this.visiblePlans.forEach((plan) => {
          row[plan.planCode] = this.compareCell(plan, meta.key)
        })
        return row
      })
    },
    payExpired() {
      return !!this.payOrder && (
        this.payOrder.payStatus === 'CLOSED' || this.payRemainingSeconds <= 0
      )
    },
    payCountdownText() {
      const seconds = Math.max(0, this.payRemainingSeconds)
      const minutes = Math.floor(seconds / 60)
      const remaining = seconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
    }
  },
  watch: {
    periodTabs: {
      immediate: true,
      handler(tabs) {
        if (!tabs || !tabs.length) return
        if (!tabs.some((t) => t.type === this.selectedPeriod)) {
          this.selectedPeriod = tabs[0].type
        }
      }
    }
  },
  created() {
    this.loadPlans()
  },
  beforeUnmount() {
    this.stopPayPolling()
    this.stopPayCountdown()
    this.stopPayManualCooldown()
  },
  methods: {
    async loadPlans() {
      this.loading = true
      try {
        const res = await getPortalPlans()
        if (res.code === 200 && Array.isArray(res.data)) {
          this.plans = res.data
        } else {
          this.plans = []
        }
      } catch (e) {
        this.plans = []
        this.$message.error('套餐加载失败')
      } finally {
        this.loading = false
      }
    },
    periodLabel(type) {
      if (type === 'quarter') return '季付'
      if (type === 'year') return '年付'
      return '月付'
    },
    periodDurationLabel(type) {
      if (type === 'quarter') return '自然季（+3个月）'
      if (type === 'year') return '自然年'
      return '自然月'
    },
    findPeriod(plan) {
      const list = plan?.periods || []
      return list.find((p) => p && p.periodType === this.selectedPeriod) || null
    },
    hasSelectedPeriod(plan) {
      const list = plan?.periods || []
      if (!list.length) {
        // 无 periods 时仅月付展示主表价格
        return this.selectedPeriod === 'month'
      }
      return !!this.findPeriod(plan)
    },
    displayPrice(plan) {
      const period = this.findPeriod(plan)
      if (period) return period.price
      return plan?.price || 0
    },
    displayPeriodDays(plan) {
      const period = this.findPeriod(plan)
      if (period) return Number(period.periodDays || 0)
      return Number(plan?.periodDays || 0)
    },
    formatPrice(price) {
      const n = Number(price)
      if (Number.isNaN(n)) return '0'
      return Number.isInteger(n) ? String(n) : n.toFixed(2)
    },
    periodUnit(plan) {
      if (this.selectedPeriod === 'month') return '/月'
      if (this.selectedPeriod === 'quarter') return '/季'
      if (this.selectedPeriod === 'year') return '/年'
      const days = this.displayPeriodDays(plan)
      if (days <= 0) return ''
      return `/${days}天`
    },
    isFreePlan(plan) {
      return Number(this.displayPrice(plan) || 0) <= 0
    },
    buyActionFor(plan) {
      if (plan?.current) return 'renew'
      const current = this.currentPlan
      if (!current) return 'change'
      return Number(plan?.sortNum || 0) >= Number(current.sortNum || 0) ? 'upgrade' : 'downgrade'
    },
    planButtonText(plan) {
      if (plan?.pending) return '待生效'
      if (plan?.current) return this.isFreePlan(plan) ? '当前套餐' : '续费'
      if (this.isFreePlan(plan)) return '免费开通'
      return this.buyActionFor(plan) === 'upgrade' ? '升级套餐' : '降级套餐'
    },
    isPlanDisabled(plan) {
      return !!plan?.pending || !!this.pendingPlan || (!!plan?.current && this.isFreePlan(plan))
    },
    scopeOf(plan) {
      return String(plan?.apiScope || '').toLowerCase()
    },
    hasFreeScope(plan) {
      const s = this.scopeOf(plan)
      return !s || s.includes('free') || s === 'all'
    },
    hasVipScope(plan) {
      const s = this.scopeOf(plan)
      return s.includes('vip') || s === 'all' || s.includes('free,vip')
    },
    hasSpecialLimits(plan) {
      return Array.isArray(plan?.specialLimits) && plan.specialLimits.length > 0
    },
    formatDailyText(plan) {
      const n = Number(plan?.dailyLimit || 0)
      return n > 0 ? `${n}次/天` : '不限'
    },
    formatQpsText(plan) {
      const n = Number(plan?.qpsLimit || 0)
      return n > 0 ? `${n} QPS` : '不限'
    },
    formatSpecialLimitText(item) {
      if (!item) return ''
      const daily = Number(item.dailyLimit || 0)
      const qps = Number(item.qpsLimit || 0)
      const parts = []
      if (daily > 0) parts.push(`${daily}次/天`)
      if (qps > 0) parts.push(`${qps}QPS`)
      return parts.join('，')
    },
    compareCell(plan, key) {
      if (key === 'price') {
        const unit = this.periodUnit(plan)
        return `￥${this.formatPrice(this.displayPrice(plan))}${unit}`
      }
      if (key === 'period') {
        const days = this.displayPeriodDays(plan)
        return days > 0 ? this.periodDurationLabel(this.selectedPeriod) : '永久'
      }
      if (key === 'free') {
        return this.hasFreeScope(plan) ? '可用' : '不可用'
      }
      if (key === 'vip') {
        return this.hasVipScope(plan) ? '可用' : '不可用'
      }
      if (key === 'daily') {
        return this.formatDailyText(plan)
      }
      if (key === 'qps') {
        return this.formatQpsText(plan)
      }
      return plan.remark || '—'
    },
    compareValueClass(val) {
      if (val === '可用') return 'cmp-yes'
      if (val === '不可用' || val === '无' || val === '—') return 'cmp-no'
      return 'cmp-text'
    },
    goVipApis() {
      this.$router.push({ path: '/explore', query: { chargeType: 'vip' } })
    },
    onBuy(plan) {
      if (!this.userStore.isLogin) {
        this.$message.warning('请先登录后再开通会员')
        this.appStore.openLogin()
        return
      }
      if (this.pendingPlan) {
        this.$message.warning('已有待生效套餐，请等待套餐生效后再购买')
        return
      }
      if (this.isFreePlan(plan)) {
        this.$confirm('免费套餐一般在注册时已自动开通。如需切换请联系客服。', '免费套餐', {
          confirmButtonText: '知道了',
          showCancelButton: false,
          type: 'info'
        }).catch(() => {})
        return
      }
      this.buyPlan = plan
      this.buyAction = this.buyActionFor(plan)
      this.payType = 'wechat'
      this.buyVisible = true
    },
    async onConfirmBuy() {
      if (!this.buyPlan || this.buying) return
      this.buying = true
      try {
        const res = await createPayOrder({
          planId: this.buyPlan.planId,
          periodType: this.selectedPeriod,
          payChannel: 'WECHAT'
        })
        this.payOrder = res.data
        this.buyVisible = false
        this.payVisible = true
        this.startPayMonitoring()
      } finally {
        this.buying = false
      }
    },
    startPayMonitoring() {
      this.payExpiryHandledOrderNo = ''
      this.resetPayStatus()
      this.stopPayManualCooldown()
      this.startPayCountdown()
      if (!this.payExpired) this.startPayPolling()
    },
    startPayPolling() {
      this.stopPayPolling()
      this.payPollingTimer = window.setInterval(() => {
        this.pollPayOrder(false)
      }, 5000)
    },
    stopPayPolling() {
      if (this.payPollingTimer) {
        window.clearInterval(this.payPollingTimer)
        this.payPollingTimer = null
      }
    },
    startPayCountdown() {
      this.stopPayCountdown()
      this.updatePayCountdown()
      if (this.payExpired) {
        this.handlePayExpired()
        return
      }
      this.payCountdownTimer = window.setInterval(() => {
        this.updatePayCountdown()
        if (this.payExpired) this.handlePayExpired()
      }, 1000)
    },
    stopPayCountdown() {
      if (this.payCountdownTimer) {
        window.clearInterval(this.payCountdownTimer)
        this.payCountdownTimer = null
      }
    },
    updatePayCountdown() {
      const expireAt = this.parseLocalDateTime(this.payOrder?.expireTime)
      this.payRemainingSeconds = expireAt
        ? Math.max(0, Math.ceil((expireAt.getTime() - Date.now()) / 1000))
        : 0
    },
    parseLocalDateTime(value) {
      if (!value) return null
      if (value instanceof Date) return value
      const matched = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
      if (!matched) return null
      return new Date(
        Number(matched[1]),
        Number(matched[2]) - 1,
        Number(matched[3]),
        Number(matched[4]),
        Number(matched[5]),
        Number(matched[6])
      )
    },
    handlePayExpired() {
      this.stopPayPolling()
      this.stopPayCountdown()
      const orderNo = this.payOrder?.orderNo
      if (!orderNo || this.payExpiryHandledOrderNo === orderNo) return
      this.payExpiryHandledOrderNo = orderNo
      // 到期时最后查单一次，兼顾临界时刻已经完成支付的情况。
      this.pollPayOrder(false)
    },
    async refreshPayOrder() {
      if (!this.buyPlan || this.payRefreshing) return
      this.payRefreshing = true
      try {
        const res = await createPayOrder({
          planId: this.buyPlan.planId,
          periodType: this.payOrder?.periodType || this.selectedPeriod,
          payChannel: 'WECHAT'
        })
        this.payOrder = res.data
        this.startPayMonitoring()
      } finally {
        this.payRefreshing = false
      }
    },
    onPayDialogClosed() {
      this.stopPayPolling()
      this.stopPayCountdown()
      this.stopPayManualCooldown()
      this.payQuerying = false
      this.payManualQuerying = false
      this.resetPayStatus()
    },
    async pollPayOrder(manual) {
      if (!this.payOrder?.orderNo) return
      if (manual && (this.payManualQuerying || this.payManualCooldown)) return
      if (!manual && (this.payQuerying || this.payManualQuerying)) return

      if (manual) {
        this.payManualQuerying = true
        this.setPayStatus('checking', '正在确认支付结果...')
      } else {
        this.payQuerying = true
      }
      try {
        const queriedOrderNo = this.payOrder.orderNo
        const res = await queryPayOrder(queriedOrderNo)
        const order = res.data || {}
        if (this.payOrder?.orderNo !== queriedOrderNo) {
          if (order.payStatus === 'PAID') await this.handlePaidOrder(order)
          return
        }
        this.payOrder = {
          ...this.payOrder,
          ...order,
          qrCodeDataUrl: order.qrCodeDataUrl || this.payOrder.qrCodeDataUrl
        }
        if (order.payStatus === 'PAID') {
          await this.handlePaidOrder(order)
        } else if (order.payStatus === 'CLOSED' || order.payStatus === 'FAILED') {
          this.stopPayPolling()
          this.stopPayCountdown()
          this.payRemainingSeconds = 0
          this.setPayStatus('error', order.payStatus === 'CLOSED'
            ? '支付订单已关闭，请重新获取二维码'
            : '支付失败，请重新获取二维码')
        } else if (manual) {
          this.setPayStatus('pending', '暂未查询到支付结果，请完成支付后重试')
        }
      } catch (e) {
        if (manual) this.setPayStatus('error', '查询失败，请稍后重试')
      } finally {
        if (manual) {
          this.payManualQuerying = false
          this.startPayManualCooldown()
        } else {
          this.payQuerying = false
        }
      }
    },
    async handlePaidOrder(order) {
      if (!this.payVisible) return
      this.stopPayPolling()
      this.stopPayCountdown()
      this.setPayStatus('success', '支付成功，正在开通会员...')
      this.payVisible = false
      this.successPlan = order.planName || this.buyPlan?.planName || '会员套餐'
      this.successPending = order.subscriptionStatus === '2' || order.orderType === 'downgrade'
      this.successEffectiveTime = order.effectiveTime || ''
      this.successVisible = true
      await this.userStore.fetchUserInfo()
      await this.loadPlans()
    },
    setPayStatus(state, text) {
      this.payStatusState = state
      this.payStatusText = text
    },
    resetPayStatus() {
      this.setPayStatus('waiting', '等待微信扫码支付')
    },
    startPayManualCooldown() {
      this.stopPayManualCooldown()
      this.payManualCooldown = true
      this.payManualCooldownTimer = window.setTimeout(() => {
        this.payManualCooldown = false
        this.payManualCooldownTimer = null
      }, 2000)
    },
    stopPayManualCooldown() {
      if (this.payManualCooldownTimer) {
        window.clearTimeout(this.payManualCooldownTimer)
        this.payManualCooldownTimer = null
      }
      this.payManualCooldown = false
    }
  }
}
</script>

<style scoped lang="scss">
@use "sass:color";

.vip-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 16px 48px;
}

.vip-head {
  text-align: center;
  margin-bottom: 24px;

  h1 {
    font-size: 32px;
    margin: 0 0 10px;
    color: $text-primary;
    background: linear-gradient(135deg, #f59e0b, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    font-size: 15px;
    color: $text-secondary;
    margin: 0;
  }
}

.vip-notice {
  max-width: 920px;
  margin: 0 auto 28px;
  border-radius: 10px;
  background: rgba($primary-color, 0.08);
  border: 1px solid rgba($primary-color, 0.18);

  :deep(.el-alert__title) {
    color: $primary-color;
    font-weight: 600;
  }

  :deep(.el-alert__description),
  :deep(.el-alert__content) {
    color: color.mix($primary-color, $text-primary, 35%);
    line-height: 1.6;
  }

  :deep(.el-alert__icon) {
    color: $primary-color;
  }

  strong {
    color: $primary-color;
    font-weight: 700;
  }
}

.pending-plan-notice {
  max-width: 920px;
  margin: -12px auto 28px;
}

.period-tabs {
  display: inline-flex;
  margin-top: 20px;
  padding: 4px;
  border-radius: 999px;
  background: #f3f4f6;
  gap: 4px;
}

.period-tabs-skeleton {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.sk-period-bar {
  width: 220px;
  height: 40px;
  border-radius: 999px;
}

.period-tab {
  border: 0;
  background: transparent;
  color: $text-secondary;
  font-size: 14px;
  line-height: 1;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s;

  &.active {
    background: #fff;
    color: $primary-color;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    font-weight: 600;
  }

  &:hover:not(.active) {
    color: $text-primary;
  }
}

// 套餐卡片：固定宽度，居中均匀排布，不随数量被拉宽
.plan-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 36px;
  align-items: stretch;
}

.plan-card {
  position: relative;
  width: 270px;
  flex: 0 0 270px;
  box-sizing: border-box;
  padding: 32px 24px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  transition: all 0.25s;
  border: 2px solid transparent;
  background: #fff;
  border-radius: $radius-lg;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: visible;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
  }

  &.hot {
    border-color: $primary-color;
    background: #fff;
    box-shadow: 0 8px 28px rgba(58, 122, 254, 0.15);

    .plan-name {
      color: $primary-color;
    }
  }

  &.current {
    border-color: #f59e0b;
    background: #fff;
  }

  .plan-flag {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: $primary-gradient;
    color: #fff;
    font-size: 12px;
    padding: 3px 14px;
    border-radius: 12px;
    white-space: nowrap;
    box-shadow: 0 4px 12px rgba(58, 122, 254, 0.35);
  }

  .plan-name {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
  }

  .plan-price {
    margin: 16px 0 6px;

    .currency {
      font-size: 20px;
      font-weight: 600;
      color: $text-primary;
      vertical-align: top;
    }

    .amount {
      font-size: 48px;
      font-weight: 800;
      color: $text-primary;
      line-height: 1;
    }

    .unit {
      font-size: 14px;
      color: $text-secondary;
      margin-left: 2px;
    }
  }

  .plan-desc {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 16px;
  }

  .plan-features {
    flex: 1;
    text-align: left;
    margin-bottom: 20px;
    overflow: visible;

    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 13px;
      color: $text-regular;
      padding: 7px 0;
      border-bottom: 1px dashed rgba(0, 0, 0, 0.06);

      &:last-child {
        border-bottom: none;
      }
    }

    .feat-label {
      color: $text-secondary;
      flex-shrink: 0;
    }

    .feat-value {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      color: $text-primary;
      text-align: right;
    }

    .feat-tip {
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-left: 6px;
      vertical-align: middle;

      &:hover .feat-tip-bubble,
      &:focus-within .feat-tip-bubble {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
    }

    .feat-tip-btn {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #3a7afe;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      font-style: normal;
      line-height: 16px;
      text-align: center;
      cursor: pointer;
      user-select: none;
    }

    .feat-tip-bubble {
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      bottom: calc(100% + 10px);
      z-index: 30;
      width: 280px;
      padding: 12px 14px;
      border-radius: 8px;
      background: #1f2937;
      color: #f9fafb;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
      text-align: left;
      transform: translateY(4px);
      transition: opacity 0.15s ease, transform 0.15s ease;

      &::after {
        content: '';
        position: absolute;
        top: 100%;
        right: 8px;
        border: 6px solid transparent;
        border-top-color: #1f2937;
      }
    }

    .feat-tip-title {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }

    .feat-tip-desc {
      font-size: 12px;
      color: #d1d5db;
      margin-bottom: 8px;
    }

    .feat-tip-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 12px;
      padding: 3px 0;
      line-height: 1.4;
    }

    .feat-tip-name {
      color: #e5e7eb;
      flex: 1;
      min-width: 0;
    }

    .feat-tip-limit {
      color: #fff;
      font-weight: 600;
      white-space: nowrap;
    }

    .feat-link {
      color: $primary-color;
      font-size: 13px;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .plan-btn {
    width: 100%;
  }
}

// 权益对比
.compare-card {
  padding: 24px 28px;
  background: #fff;

  .card-title {
    font-size: 18px;
    margin: 0 0 16px;
    color: $text-primary;
  }

  :deep(.el-table__header th) {
    background: $bg-page;
    font-weight: 600;
  }

  .cmp-text {
    color: $text-primary;
    font-weight: 400;
  }

  .cmp-yes {
    color: $primary-color;
    font-weight: 500;
  }

  .cmp-no {
    color: $text-placeholder;
  }
}

.vip-warning {
  width: 100%;
  max-width: none;
  margin: 24px 0 0;
  padding: 16px 20px;
  border-radius: 10px;
  background: #fff1f0;
  border: 1px solid #ffccc7;
  box-sizing: border-box;

  :deep(.el-alert__title) {
    color: #cf1322;
    font-size: 16px;
    font-weight: 600;
  }

  :deep(.el-alert__icon) {
    color: #ff4d4f;
    font-size: 20px;
    width: 20px;
  }

  :deep(.el-alert__description),
  :deep(.el-alert__content) {
    color: #a8071a;
    font-size: 14px;
    line-height: 1.75;
  }

  p {
    margin: 0;

    & + p {
      margin-top: 6px;
    }
  }
}

// 购买弹窗
.buy-box {
  text-align: center;

  :deep(.el-alert) {
    margin-top: 14px;
    text-align: left;
  }

  .buy-plan-name {
    font-size: 18px;
    font-weight: 700;
    color: $text-primary;
  }

  .buy-price {
    font-size: 36px;
    font-weight: 800;
    color: #f59e0b;
    margin: 12px 0;

    .unit {
      font-size: 14px;
      color: $text-secondary;
      font-weight: 400;
    }
  }

  .buy-benefit {
    font-size: 13px;
    color: $text-secondary;
    margin-bottom: 18px;
  }
}

.pay-methods {
  display: flex;
  gap: 10px;

  .pay-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 12px 0;
    border: 1px solid $border-color;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
    color: $text-regular;
    transition: all 0.2s;

    &:hover {
      border-color: $primary-color;
    }

    &.active {
      border-color: $primary-color;
      background: rgba(58, 122, 254, 0.08);
    }
  }
}

.wechat-pay-box {
  text-align: center;
}

.pay-order-plan {
  color: $text-primary;
  font-size: 16px;
  font-weight: 600;
}

.pay-order-amount {
  margin-top: 8px;
  color: #f59e0b;
  font-size: 28px;
  font-weight: 700;
}

.pay-qrcode-wrap {
  position: relative;
  width: min(272px, 100%);
  aspect-ratio: 1;
  margin: 16px auto 10px;
  padding: 6px;
  border: 1px solid $border-color;
  background: #fff;
  box-sizing: border-box;

  &.expired .pay-qrcode {
    opacity: 0.16;
    filter: grayscale(1);
  }
}

.pay-qrcode {
  display: block;
  width: 100%;
  height: auto;
}

.pay-expired-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: $text-primary;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.78);
}

.pay-status-line {
  display: flex;
  min-height: 22px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #07a94f;
  font-size: 14px;
  font-weight: 600;

  &.checking {
    color: $primary-color;
  }

  &.pending {
    color: #d97706;
  }

  &.error {
    color: #ef4444;
  }

  &.success {
    color: #07a94f;
  }
}

.pay-countdown {
  min-height: 20px;
  margin-top: 6px;
  color: $text-secondary;
  font-size: 13px;
  font-variant-numeric: tabular-nums;

  &.expired {
    color: #ef4444;
    font-weight: 600;
  }
}

.pay-order-meta {
  margin-top: 7px;
  color: $text-secondary;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.success-box {
  text-align: center;
  padding: 12px 0;

  .success-title {
    font-size: 18px;
    font-weight: 600;
    color: $text-primary;
    margin-top: 12px;
  }

  .success-desc {
    font-size: 13px;
    color: $text-secondary;
    margin-top: 8px;
  }
}

@media (max-width: 560px) {
  .plan-card {
    width: 100%;
    flex: 1 1 100%;
  }
}
</style>
