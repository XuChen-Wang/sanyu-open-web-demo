<template>
  <div class="orders-page">
    <section class="account-band">
      <div class="balance-block">
        <span class="metric-label">账户可用余额</span>
        <strong class="balance-value">¥{{ formatMoney(summary.balance, 2) }}</strong>
        <el-button type="primary" size="large" @click="openRecharge">
          <el-icon><Wallet /></el-icon>
          立即充值
        </el-button>
      </div>
      <div class="metric-grid">
        <div class="metric-item">
          <span class="metric-label">累计充值</span>
          <strong>¥{{ formatMoney(summary.totalRecharge, 2) }}</strong>
          <small>仅统计余额充值</small>
        </div>
        <div class="metric-item">
          <span class="metric-label">套餐支出</span>
          <strong>¥{{ formatMoney(summary.totalPlanPayment, 2) }}</strong>
          <small>购买、变更与续费</small>
        </div>
        <div class="metric-item">
          <span class="metric-label">累计消费</span>
          <strong>¥{{ formatMoney(summary.totalConsumption, 3) }}</strong>
          <small>接口调用实际扣费</small>
        </div>
      </div>
    </section>

    <div class="card orders-card">
      <div class="orders-tabs">
        <button :class="{ active: currentTab === 'orders' }" @click="switchTab('orders')">交易订单</button>
        <button :class="{ active: currentTab === 'consume' }" @click="switchTab('consume')">消费记录</button>
        <button :class="{ active: currentTab === 'plan' }" @click="switchTab('plan')">当前套餐</button>
      </div>

      <div v-if="currentTab !== 'plan'" class="filter-row">
        <div class="filter-fields">
          <template v-if="currentTab === 'orders'">
            <el-input v-model="filters.orderNo" clearable placeholder="订单号" class="order-search" @keyup.enter="search" />
            <el-select v-model="filters.orderType" clearable placeholder="全部类型" class="filter-select" @change="search">
              <el-option label="余额充值" value="topup" />
              <el-option label="套餐订单" value="plan" />
              <el-option label="套餐购买/变更" value="change" />
              <el-option label="套餐续费" value="renew" />
              <el-option label="套餐升级" value="upgrade" />
              <el-option label="套餐降级" value="downgrade" />
            </el-select>
            <el-select v-model="filters.status" clearable placeholder="全部状态" class="filter-select" @change="search">
              <el-option label="待支付" value="0" />
              <el-option label="已支付/到账" value="1" />
              <el-option label="已关闭" value="2" />
              <el-option label="支付失败" value="3" />
              <el-option label="已退款" value="4" />
            </el-select>
          </template>
          <div class="date-field">
            <span class="filter-label">{{ currentTab === 'consume' ? '消费日期' : '创建日期' }}</span>
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              unlink-panels
              class="date-filter"
              @change="search"
            />
          </div>
        </div>
        <div class="filter-actions">
          <el-button type="primary" @click="search"><el-icon><Search /></el-icon>查询</el-button>
          <el-button @click="resetFilters"><el-icon><Refresh /></el-icon>重置</el-button>
        </div>
      </div>

      <el-table v-if="currentTab === 'orders'" v-loading="loading" :data="orders" stripe empty-text="暂无交易订单">
        <el-table-column prop="orderNo" label="订单号" width="230">
          <template #default="{ row }"><span class="order-no">{{ row.orderNo }}</span></template>
        </el-table-column>
        <el-table-column prop="orderTypeLabel" label="类型" width="140" />
        <el-table-column prop="productName" label="商品" min-width="150" show-overflow-tooltip />
        <el-table-column label="金额" width="120" align="right">
          <template #default="{ row }">
            <span :class="row.orderType === 'topup' ? 'amount-in' : 'amount-plan'">
              {{ row.orderType === 'topup' ? '+' : '' }}¥{{ formatMoney(row.amount, 2) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="payChannelLabel" label="支付方式" width="110" />
        <el-table-column label="状态" width="105" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small" effect="light">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column prop="payTime" label="支付时间" width="170">
          <template #default="{ row }">{{ row.payTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.payable" type="primary" link @click="continuePayment(row)">继续支付</el-button>
            <span v-else class="no-action">-</span>
          </template>
        </el-table-column>
      </el-table>

      <el-table v-else-if="currentTab === 'consume'" v-loading="loading" :data="consumes" stripe empty-text="暂无余额消费记录">
        <el-table-column prop="consumeTime" label="消费时间" width="180" />
        <el-table-column prop="apiName" label="接口名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="apiCode" label="接口编码" min-width="170" show-overflow-tooltip />
        <el-table-column prop="count" label="扣减次数" width="110" align="right" />
        <el-table-column label="消费金额" width="130" align="right">
          <template #default="{ row }"><span class="amount-out">-¥{{ formatMoney(row.amount, 6) }}</span></template>
        </el-table-column>
      </el-table>

      <div v-else v-loading="loading" class="current-plan-panel">
        <div class="plan-icon"><el-icon :size="28"><Medal /></el-icon></div>
        <div class="plan-main">
          <span class="plan-caption">当前生效套餐</span>
          <strong>{{ currentPlan.planName || '未开通套餐' }}</strong>
          <span class="plan-code">{{ currentPlan.planCode || 'FREE' }}</span>
        </div>
        <div class="plan-expire">
          <span>有效期至</span>
          <strong>{{ currentPlan.expireTime || '长期有效' }}</strong>
        </div>
        <el-tag :type="Number(currentPlan.isVip) === 1 ? 'success' : 'info'" effect="light">
          {{ Number(currentPlan.isVip) === 1 ? '会员有效' : '基础套餐' }}
        </el-tag>
        <el-button type="primary" @click="$router.push('/vip')">续费或升级</el-button>
      </div>

      <div v-if="currentTab !== 'plan'" class="pagination-wrap">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="total, prev, pager, next" background @current-change="fetchCurrentList" />
      </div>
    </div>

    <el-dialog v-model="rechargeVisible" title="账户充值" width="min(460px, calc(100vw - 32px))" align-center>
      <div v-loading="rechargeAmountsLoading" class="recharge-amounts">
        <button v-for="amount in amounts" :key="amount" type="button" :class="{ active: rechargeAmount === amount }" @click="rechargeAmount = amount">
          <strong>{{ amount }}</strong><span>元</span>
        </button>
        <el-empty v-if="!rechargeAmountsLoading && !amounts.length" description="暂无可用充值金额" :image-size="56" />
      </div>
      <div class="payment-method">
        <el-icon :size="22" color="#07a94f"><ChatDotRound /></el-icon>
        <div><strong>微信支付</strong><small>使用微信扫描二维码完成支付</small></div>
        <span class="selected-mark">已选择</span>
      </div>
      <div class="recharge-summary">需支付 <strong>¥{{ formatMoney(rechargeAmount, 2) }}</strong></div>
      <template #footer>
        <el-button @click="rechargeVisible = false">取消</el-button>
        <el-button type="primary" :loading="creatingPay" :disabled="rechargeAmountsLoading || rechargeAmount === null" @click="createRecharge">确认支付</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="payVisible" title="微信扫码支付" width="min(400px, calc(100vw - 32px))" align-center :close-on-click-modal="false" @closed="stopPayMonitoring">
      <div v-if="payOrder" class="wechat-pay-box">
        <div class="pay-order-plan">{{ payOrder.planName || '余额充值' }}</div>
        <div class="pay-order-amount">¥{{ formatMoney(payOrder.amount, 2) }}</div>
        <div class="pay-qrcode-wrap" :class="{ expired: payExpired }">
          <img v-if="payOrder.qrCodeDataUrl" :src="payOrder.qrCodeDataUrl" alt="微信支付二维码" class="pay-qrcode" />
          <div v-if="payExpired" class="pay-expired-mask"><el-icon :size="28"><Clock /></el-icon><span>二维码已过期</span></div>
        </div>
        <div v-if="!payExpired" class="pay-status-line" :class="payStatusState">
          <el-icon v-if="payStatusState === 'checking'" class="is-loading"><Loading /></el-icon>
          <span>{{ payStatusText }}</span>
        </div>
        <div class="pay-countdown" :class="{ expired: payExpired }">
          {{ payExpired ? '本次订单已失效，请重新发起充值' : `支付剩余时间 ${payCountdownText}` }}
        </div>
        <div class="pay-order-meta">订单号：{{ payOrder.orderNo }}</div>
        <div class="pay-order-meta">有效期至：{{ payOrder.expireTime || '-' }}</div>
      </div>
      <template #footer>
        <el-button @click="payVisible = false">关闭</el-button>
        <el-button v-if="payExpired" type="primary" :loading="creatingPay" @click="handleExpiredOrder"><el-icon><Refresh /></el-icon>{{ expiredActionText }}</el-button>
        <el-button v-else type="primary" :loading="manualQuerying" :disabled="manualCooldown" @click="pollPayOrder(true)">
          {{ manualQuerying ? '正在查询...' : '我已支付，立即查询' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ChatDotRound, Clock, Loading, Medal, Refresh, Search, Wallet } from '@element-plus/icons-vue'
import { getConsumeRecordPage, getOrderPage, getOrderSummary, getOverview } from '@/api/console'
import { createRechargeOrder, getPayOrder, getRechargeAmounts, queryPayOrder } from '@/api/pay'
import { useUserStore } from '@/store/modules/user'

export default {
  name: 'ConsoleOrders',
  components: { ChatDotRound, Clock, Loading, Medal, Refresh, Search, Wallet },
  data() {
    return {
      userStore: useUserStore(),
      summary: { balance: 0, totalRecharge: 0, totalPlanPayment: 0, totalConsumption: 0 },
      currentTab: 'orders',
      orders: [],
      consumes: [],
      currentPlan: { planName: '', planCode: '', expireTime: '', isVip: 0 },
      loading: false,
      page: 1,
      pageSize: 10,
      total: 0,
      filters: { orderNo: '', orderType: '', status: '', dateRange: null },
      rechargeVisible: false,
      rechargeAmount: null,
      amounts: [],
      rechargeAmountsLoading: false,
      creatingPay: false,
      payVisible: false,
      payOrder: null,
      payQuerying: false,
      manualQuerying: false,
      manualCooldown: false,
      manualCooldownTimer: null,
      pollingTimer: null,
      countdownTimer: null,
      payRemainingSeconds: 0,
      payStatusState: 'waiting',
      payStatusText: '等待微信扫码支付'
    }
  },
  computed: {
    payExpired() {
      return this.payRemainingSeconds <= 0
    },
    payCountdownText() {
      const minutes = Math.floor(this.payRemainingSeconds / 60)
      const seconds = this.payRemainingSeconds % 60
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    },
    expiredActionText() {
      return this.payOrder?.orderType === 'topup' ? '重新获取二维码' : '前往会员中心'
    }
  },
  methods: {
    formatMoney(value, precision) {
      const number = Number(value)
      return Number.isFinite(number) ? number.toFixed(precision) : Number(0).toFixed(precision)
    },
    statusTagType(status) {
      return { 0: 'warning', 1: 'success', 2: 'info', 3: 'danger', 4: '' }[status] || 'info'
    },
    async fetchSummary() {
      const res = await getOrderSummary()
      this.summary = { ...this.summary, ...(res.data || {}) }
      this.userStore.updateAsset({ balance: Number(this.summary.balance || 0) })
    },
    async fetchOrders() {
      const res = await getOrderPage({ page: this.page, pageSize: this.pageSize, orderType: this.filters.orderType, status: this.filters.status, orderNo: this.filters.orderNo.trim(), dateRange: this.filters.dateRange })
      this.orders = res.rows || []
      this.total = Number(res.total || 0)
    },
    async fetchConsumes() {
      const res = await getConsumeRecordPage({ page: this.page, pageSize: this.pageSize, dateRange: this.filters.dateRange })
      this.consumes = res.rows || []
      this.total = Number(res.total || 0)
    },
    async fetchCurrentPlan() {
      const res = await getOverview()
      this.currentPlan = { ...this.currentPlan, ...(res.data || {}) }
    },
    async fetchCurrentList() {
      this.loading = true
      try {
        if (this.currentTab === 'orders') await this.fetchOrders()
        else if (this.currentTab === 'consume') await this.fetchConsumes()
        else await this.fetchCurrentPlan()
      } finally {
        this.loading = false
      }
    },
    switchTab(tab) {
      if (this.currentTab === tab) return
      this.currentTab = tab
      this.page = 1
      this.total = 0
      this.fetchCurrentList()
    },
    search() {
      this.page = 1
      this.fetchCurrentList()
    },
    resetFilters() {
      this.filters = { orderNo: '', orderType: '', status: '', dateRange: null }
      this.page = 1
      this.fetchCurrentList()
    },
    async openRecharge() {
      this.rechargeVisible = true
      this.rechargeAmountsLoading = true
      this.amounts = []
      this.rechargeAmount = null
      try {
        const res = await getRechargeAmounts()
        this.amounts = (res.data || [])
          .map(value => Number(value))
          .filter(value => Number.isFinite(value) && value > 0)
        this.rechargeAmount = this.amounts.length ? this.amounts[0] : null
      } catch {
        this.amounts = []
        this.rechargeAmount = null
      } finally {
        this.rechargeAmountsLoading = false
      }
    },
    async createRecharge() {
      if (this.creatingPay) return
      if (this.rechargeAmount === null) {
        this.$message.warning('请选择充值金额')
        return
      }
      this.creatingPay = true
      try {
        const res = await createRechargeOrder({ amount: this.rechargeAmount, payChannel: 'WECHAT' })
        this.rechargeVisible = false
        this.openPayOrder(res.data)
        await this.fetchOrders()
      } finally {
        this.creatingPay = false
      }
    },
    async continuePayment(row) {
      const res = await getPayOrder(row.orderNo)
      if (res.data?.payStatus === 'PAID') {
        await this.refreshData()
        return
      }
      const amount = Number(res.data?.amount ?? row.amount)
      this.rechargeAmount = Number.isFinite(amount) ? amount : null
      this.openPayOrder(res.data)
    },
    openPayOrder(order) {
      this.payOrder = order
      this.payVisible = true
      this.startPayMonitoring()
    },
    startPayMonitoring() {
      this.stopPayMonitoring()
      this.payStatusState = 'waiting'
      this.payStatusText = '等待微信扫码支付'
      this.updatePayCountdown()
      if (!this.payExpired) {
        this.pollingTimer = window.setInterval(() => this.pollPayOrder(false), 5000)
        this.countdownTimer = window.setInterval(() => {
          this.updatePayCountdown()
          if (this.payExpired) this.stopPayMonitoring()
        }, 1000)
      }
    },
    stopPayMonitoring() {
      if (this.pollingTimer) window.clearInterval(this.pollingTimer)
      if (this.countdownTimer) window.clearInterval(this.countdownTimer)
      if (this.manualCooldownTimer) window.clearTimeout(this.manualCooldownTimer)
      this.pollingTimer = null
      this.countdownTimer = null
      this.manualCooldownTimer = null
      this.payQuerying = false
      this.manualQuerying = false
      this.manualCooldown = false
    },
    updatePayCountdown() {
      const expireAt = this.parseLocalDateTime(this.payOrder?.expireTime)
      this.payRemainingSeconds = expireAt ? Math.max(0, Math.ceil((expireAt.getTime() - Date.now()) / 1000)) : 0
    },
    parseLocalDateTime(value) {
      if (!value) return null
      const matched = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
      if (!matched) return null
      return new Date(Number(matched[1]), Number(matched[2]) - 1, Number(matched[3]), Number(matched[4]), Number(matched[5]), Number(matched[6]))
    },
    async pollPayOrder(manual) {
      if (!this.payOrder?.orderNo) return
      if (manual && (this.manualQuerying || this.manualCooldown)) return
      if (!manual && (this.payQuerying || this.manualQuerying)) return
      if (manual) {
        this.manualQuerying = true
        this.payStatusState = 'checking'
        this.payStatusText = '正在确认支付结果...'
      } else {
        this.payQuerying = true
      }
      try {
        const orderNo = this.payOrder.orderNo
        const res = await queryPayOrder(orderNo)
        const order = res.data || {}
        if (this.payOrder?.orderNo !== orderNo) return
        this.payOrder = { ...this.payOrder, ...order, qrCodeDataUrl: order.qrCodeDataUrl || this.payOrder.qrCodeDataUrl }
        if (order.payStatus === 'PAID') {
          this.stopPayMonitoring()
          this.payVisible = false
          this.$message.success(order.orderType === 'topup' ? '充值成功，余额已到账' : '支付成功，套餐已生效')
          await this.refreshData()
        } else if (order.payStatus === 'CLOSED' || order.payStatus === 'FAILED') {
          this.stopPayMonitoring()
          this.payRemainingSeconds = 0
          this.payStatusState = 'error'
          this.payStatusText = order.payStatus === 'CLOSED' ? '支付订单已关闭' : '支付失败'
        } else if (manual) {
          this.payStatusState = 'pending'
          this.payStatusText = '暂未查询到支付结果，请完成支付后重试'
        }
      } catch (e) {
        if (manual) {
          this.payStatusState = 'error'
          this.payStatusText = '查询失败，请稍后重试'
        }
      } finally {
        this.payQuerying = false
        this.manualQuerying = false
        if (manual) {
          this.manualCooldown = true
          this.manualCooldownTimer = window.setTimeout(() => { this.manualCooldown = false }, 2000)
        }
      }
    },
    async refreshRechargeOrder() {
      this.creatingPay = true
      try {
        const res = await createRechargeOrder({ amount: this.rechargeAmount, payChannel: 'WECHAT' })
        this.openPayOrder(res.data)
        await this.fetchOrders()
      } finally {
        this.creatingPay = false
      }
    },
    handleExpiredOrder() {
      if (this.payOrder?.orderType !== 'topup') {
        this.payVisible = false
        this.$router.push('/vip')
        return
      }
      this.refreshRechargeOrder()
    },
    async refreshData() {
      // 汇总、列表和用户信息互不阻塞，单个辅助接口失败时仍保留其他已返回的数据。
      await Promise.allSettled([this.fetchSummary(), this.fetchCurrentList(), this.userStore.fetchUserInfo()])
    }
  },
  mounted() {
    // 表格加载状态只跟随订单分页接口，避免较慢的汇总统计遮住已经返回的订单数据。
    this.fetchCurrentList().catch(() => {})
    this.fetchSummary().catch(() => {})
  },
  beforeUnmount() {
    this.stopPayMonitoring()
  }
}
</script>

<style scoped lang="scss">
.orders-page { min-width: 0; }

.account-band {
  display: grid;
  grid-template-columns: minmax(250px, 1.1fr) minmax(420px, 2fr);
  min-height: 168px;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid $border-light;
  border-radius: 8px;
  background: #fff;
}

.balance-block { display: grid; align-content: center; justify-items: start; padding: 24px 30px; color: #fff; background: #263548; }
.metric-label { font-size: 13px; color: $text-secondary; }
.balance-block .metric-label { color: #cad4df; }
.balance-value { margin: 5px 0 14px; font-size: 34px; line-height: 1.2; letter-spacing: 0; }
.metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: center; }
.metric-item { min-width: 0; padding: 22px 24px; border-right: 1px solid $border-light; }
.metric-item:last-child { border-right: 0; }
.metric-item strong { display: block; margin: 8px 0 5px; color: $text-primary; font-size: 22px; letter-spacing: 0; }
.metric-item small { display: block; color: $text-secondary; font-size: 12px; white-space: nowrap; }
.orders-card { padding: 0 20px 18px; overflow: hidden; }
.orders-tabs { display: flex; gap: 26px; height: 52px; border-bottom: 1px solid $border-light; }
.orders-tabs button { position: relative; padding: 0 2px; border: 0; color: $text-secondary; background: transparent; font-size: 14px; cursor: pointer; }
.orders-tabs button.active { color: $primary-color; font-weight: 600; }
.orders-tabs button.active::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: $primary-color; content: ''; }
.filter-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; padding: 14px 0; }
.filter-fields { display: flex; width: fit-content; max-width: 100%; min-width: 0; flex: 0 1 auto; align-items: center; flex-wrap: wrap; gap: 10px; }
.filter-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; }
.filter-actions :deep(.el-button + .el-button) { margin-left: 0; }
.order-search { width: 210px; }
.filter-select { width: 150px; }
.date-field { display: flex; flex: 0 0 auto; align-items: center; gap: 9px; }
.filter-label { color: $text-secondary; font-size: 13px; white-space: nowrap; }
.date-filter { width: 330px !important; flex: 0 0 330px; }
.order-no { color: $text-regular; font-family: Consolas, monospace; font-size: 13px; white-space: nowrap; }
.amount-in { color: #079455; font-weight: 600; }
.amount-plan { color: $text-primary; font-weight: 600; }
.amount-out { color: #d92d20; font-weight: 600; }
.no-action { color: $text-secondary; }
.pagination-wrap { display: flex; justify-content: flex-end; padding-top: 18px; }
.current-plan-panel { display: grid; grid-template-columns: auto minmax(180px, 1fr) minmax(180px, auto) auto auto; align-items: center; gap: 18px; min-height: 150px; padding: 22px 8px; }
.plan-icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 50%; color: #9a6700; background: #fff4cc; }
.plan-main { display: grid; gap: 4px; }
.plan-caption, .plan-expire span { color: $text-secondary; font-size: 12px; }
.plan-main strong { color: $text-primary; font-size: 21px; }
.plan-code { width: fit-content; color: $primary-color; font-family: Consolas, monospace; font-size: 12px; }
.plan-expire { display: grid; gap: 7px; }
.plan-expire strong { color: $text-primary; font-size: 14px; }
.recharge-amounts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.recharge-amounts .el-empty { grid-column: 1 / -1; }
.recharge-amounts button { min-height: 58px; border: 1px solid $border-color; border-radius: 6px; color: $text-regular; background: #fff; cursor: pointer; }
.recharge-amounts button strong { margin-right: 2px; font-size: 18px; }
.recharge-amounts button.active { border-color: $primary-color; color: $primary-color; background: rgba(58, 122, 254, 0.06); box-shadow: inset 0 0 0 1px $primary-color; }
.payment-method { display: flex; align-items: center; gap: 10px; margin-top: 18px; padding: 13px 14px; border: 1px solid #07a94f; border-radius: 6px; }
.payment-method div { display: grid; flex: 1; gap: 2px; }
.payment-method strong { color: $text-primary; font-size: 14px; }
.payment-method small { color: $text-secondary; font-size: 12px; }
.selected-mark { color: #079455; font-size: 12px; }
.recharge-summary { margin-top: 18px; text-align: right; color: $text-secondary; font-size: 14px; }
.recharge-summary strong { margin-left: 8px; color: #d97706; font-size: 22px; }
.wechat-pay-box { text-align: center; }
.pay-order-plan { color: $text-primary; font-size: 16px; font-weight: 600; }
.pay-order-amount { margin-top: 7px; color: #d97706; font-size: 28px; font-weight: 700; }
.pay-qrcode-wrap { position: relative; width: min(272px, 100%); aspect-ratio: 1; margin: 15px auto 10px; padding: 6px; border: 1px solid $border-color; background: #fff; box-sizing: border-box; }
.pay-qrcode-wrap.expired .pay-qrcode { opacity: 0.16; filter: grayscale(1); }
.pay-qrcode { display: block; width: 100%; height: auto; }
.pay-expired-mask { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: $text-primary; background: rgba(255,255,255,.8); font-size: 15px; font-weight: 600; }
.pay-status-line { display: flex; min-height: 22px; align-items: center; justify-content: center; gap: 6px; color: #079455; font-size: 14px; font-weight: 600; }
.pay-status-line.checking { color: $primary-color; }
.pay-status-line.pending { color: #d97706; }
.pay-status-line.error { color: #d92d20; }
.pay-countdown { min-height: 20px; margin-top: 5px; color: $text-secondary; font-size: 13px; font-variant-numeric: tabular-nums; }
.pay-countdown.expired { color: #d92d20; font-weight: 600; }
.pay-order-meta { margin-top: 4px; overflow-wrap: anywhere; color: $text-secondary; font-size: 12px; }

@media (max-width: 900px) {
  .account-band { grid-template-columns: 1fr; }
  .metric-grid { min-height: 120px; }
  .filter-row { align-items: flex-start; flex-direction: column; gap: 10px; }
  .filter-fields { width: 100%; }
  .filter-actions { width: 100%; justify-content: flex-end; }
  .current-plan-panel { grid-template-columns: auto 1fr auto; }
  .plan-expire { grid-column: 2 / 4; }
}

@media (max-width: 600px) {
  .balance-block { padding: 22px; }
  .metric-grid { grid-template-columns: 1fr; }
  .metric-item { padding: 15px 20px; border-right: 0; border-bottom: 1px solid $border-light; }
  .metric-item:last-child { border-bottom: 0; }
  .metric-item small { white-space: normal; }
  .orders-card { padding-right: 12px; padding-left: 12px; }
  .order-search, .filter-select { width: 100%; }
  .date-field { width: 100%; align-items: flex-start; flex-direction: column; gap: 6px; }
  .date-filter { width: 100% !important; flex-basis: auto; }
  .filter-actions :deep(.el-button) { flex: 1; }
  .current-plan-panel { grid-template-columns: auto 1fr; gap: 14px; }
  .plan-expire { grid-column: 1 / 3; }
  .current-plan-panel .el-tag, .current-plan-panel .el-button { width: 100%; grid-column: 1 / 3; }
}
</style>
