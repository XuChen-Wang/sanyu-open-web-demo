<template>
  <div class="tickets-page">
    <div class="ticket-stats">
      <button v-for="item in statCards" :key="item.key" class="stat-item card" :class="{ active: statusFilter === item.status }" @click="selectStatus(item.status)">
        <span class="num" :class="item.color">{{ item.value }}</span>
        <span class="label">{{ item.label }}</span>
      </button>
    </div>

    <div class="card tickets-card">
      <div class="tickets-head">
        <h3>我的工单</h3>
        <el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon><span>新建工单</span></el-button>
      </div>

      <Transition name="skeleton-reveal" mode="out-in">
        <TableSkeleton v-if="loading && list.length === 0" key="tickets-sk" :rows="6" :columns="6" />
        <el-table v-else key="tickets-table" :data="list" stripe :class="{ 'is-refreshing': loading }">
          <el-table-column prop="ticketNo" label="工单号" width="165">
            <template #default="{ row }">
              <el-badge :is-dot="row.userUnreadCount > 0"><span class="ticket-no">{{ row.ticketNo }}</span></el-badge>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="220" show-overflow-tooltip />
          <el-table-column prop="category" label="类型" width="120">
            <template #default="{ row }"><el-tag size="small" effect="plain">{{ row.category }}</el-tag></template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }"><el-tag size="small" :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag></template>
          </el-table-column>
          <el-table-column prop="lastReplyTime" label="最后更新" width="170" />
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ row }"><el-button link type="primary" @click="openDetail(row)">查看</el-button></template>
          </el-table-column>
        </el-table>
      </Transition>

      <div class="pagination-wrap">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="prev, pager, next, total" background @current-change="fetchList" />
      </div>
    </div>

    <el-dialog v-model="createVisible" title="新建工单" width="560px" destroy-on-close>
      <el-form ref="createFormRef" :model="createForm" :rules="rules" label-width="82px">
        <el-form-item label="问题类型" prop="category">
          <el-select v-model="createForm.category" style="width: 100%" @change="onCategoryChange">
            <el-option v-for="item in ticketTypes" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <template v-if="isInvoiceCategory">
          <el-form-item label="发票类型" prop="invoice.invoiceType">
            <el-select v-model="createForm.invoice.invoiceType" style="width: 100%" @change="onInvoiceTypeChange">
              <el-option v-for="item in invoiceTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="开票订单" prop="invoice.orderIds">
            <div class="invoice-order-picker">
              <el-button plain :loading="invoiceOrdersLoading" @click="openInvoiceOrderDialog">选择订单</el-button>
              <span v-if="createForm.invoice.orderIds.length">已选择 {{ createForm.invoice.orderIds.length }} 笔订单</span>
              <span v-else class="invoice-order-empty">尚未选择订单</span>
            </div>
            <div class="invoice-order-tip">
              <span>仅展示微信、支付宝实际支付且未申请开票的订单</span>
              <strong>开票金额：¥{{ invoiceAmount.toFixed(2) }}</strong>
            </div>
          </el-form-item>
          <el-form-item label="抬头类型" prop="invoice.titleType">
            <el-radio-group v-model="createForm.invoice.titleType" @change="onTitleTypeChange">
              <el-radio value="1">企业</el-radio>
              <el-radio value="0" :disabled="createForm.invoice.invoiceType === '1'">个人</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="发票抬头" prop="invoice.titleName">
            <el-input v-model="createForm.invoice.titleName" maxlength="200"
              :placeholder="createForm.invoice.titleType === '1' ? '请输入企业全称' : '请输入个人姓名'" />
          </el-form-item>
          <el-form-item v-if="createForm.invoice.titleType === '1'" label="企业税号" prop="invoice.taxNo">
            <el-input v-model="createForm.invoice.taxNo" maxlength="20" placeholder="请输入统一社会信用代码或纳税人识别号" />
          </el-form-item>
          <el-form-item label="接收邮箱" prop="invoice.email">
            <el-input v-model="createForm.invoice.email" maxlength="128" placeholder="电子发票将发送至该邮箱" />
          </el-form-item>
          <el-form-item label="补充说明">
            <el-input v-model="createForm.content" type="textarea" :rows="3" maxlength="5000" show-word-limit
              placeholder="选填，需要财务注意的信息" />
          </el-form-item>
        </template>
        <el-form-item v-if="!isInvoiceCategory" label="标题" prop="title">
          <el-input v-model="createForm.title" placeholder="请简要描述问题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item v-if="!isInvoiceCategory" label="详细描述" prop="content">
          <el-input v-model="createForm.content" type="textarea" :rows="6" maxlength="5000" show-word-limit
            placeholder="请描述问题、接口名称和调用时间。请勿提交完整 Token、API Key、密码或支付密钥；定位问题时仅填写编号或末尾4位。" />
        </el-form-item>
        <el-form-item v-if="!isInvoiceCategory" label="附件">
          <el-upload v-model:file-list="createFiles" :auto-upload="false" :limit="3" :on-exceed="onFileExceed" accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.log,.zip" drag style="width: 100%">
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">拖拽文件到此处，或<em>点击选择</em></div>
            <template #tip><div class="el-upload__tip">最多3个，单个不超过10MB，支持图片、PDF、TXT、LOG、ZIP</div></template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" :loading="creating" @click="onCreate">提交工单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="invoiceOrderVisible" title="选择开票订单" width="min(920px, 94vw)"
      append-to-body destroy-on-close @opened="restoreInvoiceOrderSelection">
      <el-table ref="invoiceOrderTableRef" v-loading="invoiceOrdersLoading" :data="invoiceOrders"
        row-key="orderId" max-height="460" @selection-change="onInvoiceOrderSelectionChange">
        <el-table-column type="selection" width="48" reserve-selection />
        <el-table-column prop="orderNo" label="订单号" min-width="210" show-overflow-tooltip />
        <el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="payChannelLabel" label="支付方式" width="100" />
        <el-table-column prop="payTime" label="支付时间" width="168" />
        <el-table-column label="实付金额" width="110" align="right">
          <template #default="{ row }">¥{{ Number(row.amount).toFixed(2) }}</template>
        </el-table-column>
        <template #empty><el-empty description="当前没有可开票订单" :image-size="72" /></template>
      </el-table>
      <div class="invoice-order-dialog-tip">一次最多选择 20 笔订单</div>
      <template #footer>
        <div class="invoice-order-dialog-footer">
          <span>已选 {{ invoiceOrderSelection.length }} 笔，合计 <strong>¥{{ invoiceOrderSelectionAmount.toFixed(2) }}</strong></span>
          <div>
            <el-button @click="invoiceOrderVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmInvoiceOrders">确认选择</el-button>
          </div>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="工单详情" width="680px" destroy-on-close>
      <div v-loading="detailLoading" v-if="current" class="ticket-detail">
        <div class="detail-head">
          <span class="ticket-no">{{ current.ticketNo }}</span>
          <el-tag size="small" :type="statusType(current.status)">{{ statusLabel(current.status) }}</el-tag>
          <span class="detail-type">{{ current.category }}</span>
          <span class="detail-time">{{ current.createTime }}</span>
        </div>
        <div class="detail-title">{{ current.title }}</div>

        <div v-if="current.invoiceApplication" class="invoice-detail">
          <div class="invoice-detail-head">
            <strong>开票申请 {{ current.invoiceApplication.applicationNo }}</strong>
            <el-tag size="small" :type="invoiceStatusType(current.invoiceApplication.status)">
              {{ current.invoiceApplication.statusLabel }}
            </el-tag>
          </div>
          <div class="invoice-detail-grid">
            <span>发票类型</span><b>{{ current.invoiceApplication.invoiceTypeLabel }}</b>
            <span>开票金额</span><b>¥{{ Number(current.invoiceApplication.amount).toFixed(2) }}</b>
            <span>抬头类型</span><b>{{ current.invoiceApplication.titleTypeLabel }}</b>
            <span>发票抬头</span><b>{{ current.invoiceApplication.titleName }}</b>
            <span v-if="current.invoiceApplication.taxNo">企业税号</span>
            <b v-if="current.invoiceApplication.taxNo">{{ current.invoiceApplication.taxNo }}</b>
            <span>接收邮箱</span><b>{{ current.invoiceApplication.email }}</b>
            <span v-if="current.invoiceApplication.invoiceNo">发票号码</span>
            <b v-if="current.invoiceApplication.invoiceNo">{{ current.invoiceApplication.invoiceNo }}</b>
            <span v-if="current.invoiceApplication.rejectReason">驳回原因</span>
            <b v-if="current.invoiceApplication.rejectReason" class="reject-reason">{{ current.invoiceApplication.rejectReason }}</b>
          </div>
          <div class="invoice-orders">
            <span v-for="order in current.invoiceApplication.orders" :key="order.orderId">
              {{ order.orderNo }} · ¥{{ Number(order.orderAmount).toFixed(2) }}
            </span>
          </div>
        </div>

        <div ref="conversationRef" class="conversation">
          <div v-for="message in current.messages" :key="message.messageId" class="reply-item" :class="{ mine: message.senderType === '0' }">
            <div class="reply-role">{{ message.senderType === '0' ? '我' : '客服' }}</div>
            <div class="reply-body">
              <div class="reply-content">{{ message.content }}</div>
              <div v-if="message.attachments?.length" class="attachments">
                <el-button v-for="file in message.attachments" :key="file.attachmentId" link type="primary" @click="downloadAttachment(file)">
                  <el-icon><Paperclip /></el-icon>{{ file.originalName }}
                </el-button>
              </div>
              <div class="reply-time">{{ message.createTime }}</div>
            </div>
          </div>
        </div>

        <div v-if="current.status !== '4'" class="reply-input">
          <el-input v-model="replyText" type="textarea" :rows="3" maxlength="5000" show-word-limit placeholder="输入回复内容" />
          <el-upload v-model:file-list="replyFiles" :auto-upload="false" :limit="3" :on-exceed="onFileExceed" accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.log,.zip" class="reply-upload">
            <el-button size="small" plain><el-icon><Paperclip /></el-icon>添加附件</el-button>
          </el-upload>
          <div class="reply-bar">
            <el-button link type="danger" @click="onClose(current)">关闭工单</el-button>
            <el-button type="primary" size="small" :loading="replying" @click="onReply">回复</el-button>
          </div>
        </div>
        <div v-else class="closed-tip">该工单已关闭，不能继续回复。</div>
        <div v-if="current.status === '3'" class="reopen-bar">
          <el-button type="primary" plain :loading="reopening" @click="onReopen">问题仍未解决，重新打开</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTickets, getTicketDetail, getInvoiceableOrders, createTicket, replyTicket, closeTicket, reopenTicket, downloadTicketAttachment } from '@/api/console'
import TableSkeleton from '@/components/skeleton/TableSkeleton.vue'
import { Paperclip, Plus, UploadFilled } from '@element-plus/icons-vue'
import { subscribeTicketRealtime } from '@/utils/ticketSocket'

export default {
  name: 'ConsoleTickets',
  components: { TableSkeleton, Paperclip, Plus, UploadFilled },
  data() {
    return {
      stats: { all: 0, waitStaff: 0, processing: 0, waitUser: 0, resolved: 0, closed: 0 },
      list: [], total: 0, page: 1, pageSize: 10, loading: true, statusFilter: '',
      createVisible: false, creating: false, createFiles: [],
      createForm: this.emptyCreateForm(),
      ticketTypes: ['接口调用问题', '计费与账单', 'Token/密钥问题', '文档与示例', '功能建议', '开具发票', '其他'],
      invoiceTypeOptions: [
        { value: '0', label: '增值税电子普通发票' },
        { value: '1', label: '增值税电子专用发票' }
      ],
      invoiceOrders: [], invoiceOrdersLoading: false,
      invoiceOrderVisible: false, invoiceOrderSelection: [], invoiceOrderSelectionSyncing: false,
      rules: {
        category: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入详细描述', trigger: 'blur' }],
        'invoice.invoiceType': [{ required: true, message: '请选择发票类型', trigger: 'change' }],
        'invoice.orderIds': [{ type: 'array', required: true, min: 1, message: '请选择需要开票的订单', trigger: 'change' }],
        'invoice.titleType': [{ required: true, message: '请选择抬头类型', trigger: 'change' }],
        'invoice.titleName': [{ required: true, message: '请输入发票抬头', trigger: 'blur' }],
        'invoice.taxNo': [{ validator: (rule, value, callback) => {
          if (this.createForm.invoice.titleType === '1' && !/^[0-9A-Za-z]{15,20}$/.test((value || '').trim())) {
            callback(new Error('请输入正确的企业税号'))
          } else callback()
        }, trigger: 'blur' }],
        'invoice.email': [{ required: true, type: 'email', message: '请输入正确的接收邮箱', trigger: 'blur' }]
      },
      detailVisible: false, detailLoading: false, current: null,
      replyText: '', replyFiles: [], replying: false, reopening: false,
      unsubscribeRealtime: null
    }
  },
  computed: {
    isInvoiceCategory() { return this.createForm.category === '开具发票' },
    invoiceAmount() {
      const selected = new Set(this.createForm.invoice?.orderIds || [])
      return this.invoiceOrders.filter(order => selected.has(order.orderId))
        .reduce((total, order) => total + Number(order.amount || 0), 0)
    },
    invoiceOrderSelectionAmount() {
      return this.invoiceOrderSelection.reduce((total, order) => total + Number(order.amount || 0), 0)
    },
    statCards() {
      return [
        { key: 'all', label: '全部工单', value: this.stats.all, status: '', color: '' },
        { key: 'waitStaff', label: '待客服处理', value: this.stats.waitStaff, status: '0', color: 'orange' },
        { key: 'processing', label: '处理中', value: this.stats.processing, status: '1', color: 'blue' },
        { key: 'waitUser', label: '待我回复', value: this.stats.waitUser, status: '2', color: 'violet' },
        { key: 'done', label: '已结束', value: this.stats.resolved + this.stats.closed, status: 'done', color: 'green' }
      ]
    }
  },
  methods: {
    emptyCreateForm() {
      return {
        category: '', title: '', content: '',
        invoice: { invoiceType: '0', orderIds: [], titleType: '1', titleName: '', taxNo: '', email: '' }
      }
    },
    statusLabel(status) { return ({ '0': '待客服处理', '1': '处理中', '2': '待用户回复', '3': '已解决', '4': '已关闭' })[status] || '未知' },
    statusType(status) { return ({ '0': 'warning', '1': 'primary', '2': '', '3': 'success', '4': 'info' })[status] || 'info' },
    invoiceStatusType(status) { return ({ '0': 'warning', '1': 'primary', '2': 'success', '3': 'danger', '4': 'info' })[status] || 'info' },
    messageFromRealtime(event) {
      return {
        messageId: event.messageId,
        ticketId: event.ticketId,
        senderType: event.senderType,
        senderId: event.senderId,
        senderName: event.senderName,
        content: event.content,
        messageType: event.messageType,
        visibleToUser: event.visibleToUser,
        createTime: event.createTime,
        attachments: event.attachments || []
      }
    },
    updateStats(beforeStatus, afterStatus) {
      if (!beforeStatus || beforeStatus === afterStatus) return
      const keys = { '0': 'waitStaff', '1': 'processing', '2': 'waitUser', '3': 'resolved', '4': 'closed' }
      if (keys[beforeStatus]) this.stats[keys[beforeStatus]] = Math.max(0, (this.stats[keys[beforeStatus]] || 0) - 1)
      if (keys[afterStatus]) this.stats[keys[afterStatus]] = (this.stats[keys[afterStatus]] || 0) + 1
    },
    scrollConversationToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.conversationRef
        if (container) container.scrollTop = container.scrollHeight
      })
    },
    onRealtimeMessage(event) {
      const row = this.list.find(item => item.ticketId === event.ticketId)
      const detailOpen = this.detailVisible && this.current?.ticketId === event.ticketId
      const previousStatus = row?.status || (detailOpen ? this.current.status : null)
      this.updateStats(previousStatus, event.status)

      if (row) {
        row.status = event.status
        row.lastReplyTime = event.createTime
        row.userUnreadCount = detailOpen ? 0 : (row.userUnreadCount || 0) + 1
      }
      if (detailOpen) {
        const messages = this.current.messages || (this.current.messages = [])
        if (!messages.some(message => message.messageId === event.messageId)) {
          messages.push(this.messageFromRealtime(event))
        }
        this.current.status = event.status
        this.current.lastReplyTime = event.createTime
        this.current.userUnreadCount = 0
        this.scrollConversationToBottom()
        // 复用详情接口清除数据库未读数，界面消息已在本地即时追加。
        getTicketDetail(event.ticketId).catch(() => {})
      }
      this.$message.info(`工单 ${event.ticketNo} 收到客服回复`)
    },
    async fetchList() {
      this.loading = true
      try {
        const res = await getTickets({ page: this.page, pageSize: this.pageSize, status: this.statusFilter })
        const rows = res.data.list || []
        this.stats = res.data.stats
        this.list = rows
        this.total = res.data.total
      } finally { this.loading = false }
    },
    selectStatus(status) { this.statusFilter = status; this.page = 1; this.fetchList() },
    openCreate() {
      this.createForm = this.emptyCreateForm()
      this.createForm.category = this.ticketTypes[0]
      this.createFiles = []
      this.createVisible = true
    },
    async onCategoryChange(category) {
      if (category !== '开具发票') return
      this.createForm.title = '开票申请'
    },
    onInvoiceTypeChange(type) {
      if (type === '1') this.createForm.invoice.titleType = '1'
    },
    onTitleTypeChange(type) {
      if (type === '0') this.createForm.invoice.taxNo = ''
    },
    async loadInvoiceOrders() {
      this.invoiceOrdersLoading = true
      try {
        const res = await getInvoiceableOrders()
        this.invoiceOrders = res.data || []
      } finally { this.invoiceOrdersLoading = false }
    },
    async openInvoiceOrderDialog() {
      await this.loadInvoiceOrders()
      const selectedIds = new Set(this.createForm.invoice.orderIds)
      this.invoiceOrderSelection = this.invoiceOrders.filter(order => selectedIds.has(order.orderId))
      this.invoiceOrderVisible = true
    },
    restoreInvoiceOrderSelection() {
      const table = this.$refs.invoiceOrderTableRef
      if (!table) return
      this.invoiceOrderSelectionSyncing = true
      table.clearSelection()
      this.invoiceOrderSelection.forEach(order => table.toggleRowSelection(order, true))
      this.$nextTick(() => { this.invoiceOrderSelectionSyncing = false })
    },
    onInvoiceOrderSelectionChange(rows) {
      if (this.invoiceOrderSelectionSyncing) return
      if (rows.length > 20) {
        this.$message.warning('一次最多选择20笔订单')
        this.invoiceOrderSelection = rows.slice(0, 20)
        this.$nextTick(this.restoreInvoiceOrderSelection)
        return
      }
      this.invoiceOrderSelection = rows
    },
    confirmInvoiceOrders() {
      if (this.invoiceOrderSelection.length === 0) {
        this.$message.warning('请选择需要开票的订单')
        return
      }
      this.createForm.invoice.orderIds = this.invoiceOrderSelection.map(order => order.orderId)
      this.invoiceOrderVisible = false
      this.$refs.createFormRef?.clearValidate('invoice.orderIds')
    },
    invoiceTypeLabel(type) {
      return this.invoiceTypeOptions.find(item => item.value === type)?.label || '电子发票'
    },
    onFileExceed() { this.$message.warning('每次最多上传3个附件') },
    async onCreate() {
      if (this.isInvoiceCategory) {
        this.createForm.title = '开票申请'
        if (!this.createForm.content.trim()) {
          this.createForm.content = `申请开具${this.invoiceTypeLabel(this.createForm.invoice.invoiceType)}`
        }
      }
      const valid = await this.$refs.createFormRef.validate().catch(() => false)
      if (!valid) return
      if (this.createFiles.some(file => file.size > 10 * 1024 * 1024)) { this.$message.warning('单个附件不能超过10MB'); return }
      this.creating = true
      try {
        await createTicket(this.createForm, this.createFiles)
        this.createVisible = false
        this.$message.success('工单提交成功')
        this.page = 1
        await this.fetchList()
      } finally { this.creating = false }
    },
    async openDetail(row) {
      this.detailVisible = true
      this.detailLoading = true
      this.replyText = ''
      this.replyFiles = []
      try {
        const res = await getTicketDetail(row.ticketId)
        this.current = res.data
        row.userUnreadCount = 0
        this.scrollConversationToBottom()
      } finally { this.detailLoading = false }
    },
    async refreshDetail() {
      const res = await getTicketDetail(this.current.ticketId)
      this.current = res.data
      this.scrollConversationToBottom()
      await this.fetchList()
    },
    async onReply() {
      const content = this.replyText.trim()
      if (!content) { this.$message.warning('请输入回复内容'); return }
      if (this.replyFiles.some(file => file.size > 10 * 1024 * 1024)) { this.$message.warning('单个附件不能超过10MB'); return }
      this.replying = true
      try {
        await replyTicket(this.current.ticketId, content, this.replyFiles)
        this.replyText = ''
        this.replyFiles = []
        this.$message.success('回复成功')
        await this.refreshDetail()
      } finally { this.replying = false }
    },
    onClose(row) {
      this.$confirm('确定关闭该工单吗？关闭后不能继续回复。', '关闭工单', { type: 'warning' }).then(async () => {
        await closeTicket(row.ticketId)
        this.$message.success('工单已关闭')
        await this.refreshDetail()
      }).catch(() => {})
    },
    async onReopen() {
      this.reopening = true
      try {
        await reopenTicket(this.current.ticketId)
        this.$message.success('工单已重新打开')
        await this.refreshDetail()
      } finally { this.reopening = false }
    },
    async downloadAttachment(file) {
      let url = ''
      try {
        const blob = await downloadTicketAttachment(file.attachmentId)
        if (!(blob instanceof Blob) || blob.size === 0) {
          throw new Error('附件内容为空或响应格式不正确')
        }

        url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = file.originalName || 'attachment'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (error) {
        console.error('下载工单附件失败', error)
        if (error?.message === '附件内容为空或响应格式不正确') {
          this.$message.error(error.message)
        }
      } finally {
        if (url) {
          // 延迟释放，避免部分浏览器尚未读取文件流时 URL 已失效。
          window.setTimeout(() => URL.revokeObjectURL(url), 1000)
        }
      }
    }
  },
  async mounted() {
    await this.fetchList().catch(() => {})
    const ticketId = Number(this.$route.query.ticketId)
    if (Number.isSafeInteger(ticketId) && ticketId > 0) {
      const row = this.list.find(item => item.ticketId === ticketId) || { ticketId, userUnreadCount: 0 }
      this.openDetail(row)
    }
    this.unsubscribeRealtime = subscribeTicketRealtime(this.onRealtimeMessage)
  },
  beforeUnmount() {
    this.unsubscribeRealtime?.()
  }
}
</script>

<style scoped lang="scss">
.ticket-stats { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }
.stat-item { border: 1px solid transparent; padding: 17px 8px; text-align: center; cursor: pointer; background: var(--el-bg-color); }
.stat-item.active { border-color: $primary-color; box-shadow: 0 0 0 1px rgba(58, 122, 254, .08); }
.stat-item .num { display: block; font-size: 24px; font-weight: 700; color: $text-primary; }
.stat-item .num.orange { color: #d97706; } .stat-item .num.blue { color: $primary-color; }
.stat-item .num.violet { color: #7c3aed; } .stat-item .num.green { color: #059669; }
.stat-item .label { display: block; margin-top: 5px; font-size: 13px; color: $text-secondary; }
.tickets-card { padding: 16px 20px; }
.tickets-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.tickets-head h3 { margin: 0; font-size: 16px; color: $text-primary; }
.ticket-no { color: $primary-color; font-family: monospace; font-size: 13px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.detail-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.detail-type, .detail-time { font-size: 12px; color: $text-secondary; }
.detail-time { margin-left: auto; }
.detail-title { margin-bottom: 16px; font-size: 17px; font-weight: 600; color: $text-primary; }
.invoice-order-tip { width: 100%; display: flex; justify-content: space-between; gap: 12px; margin-top: 6px; color: $text-secondary; font-size: 12px; }
.invoice-order-tip strong { color: $primary-color; white-space: nowrap; }
.invoice-order-picker { width: 100%; display: flex; align-items: center; gap: 12px; }
.invoice-order-picker span { min-width: 0; color: $text-regular; font-size: 13px; }
.invoice-order-picker .invoice-order-empty { color: $text-secondary; }
.invoice-order-dialog-tip { margin-top: 8px; color: $text-secondary; font-size: 12px; }
.invoice-order-dialog-footer { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.invoice-order-dialog-footer > span { color: $text-secondary; }
.invoice-order-dialog-footer strong { color: $primary-color; }
.invoice-detail { margin-bottom: 16px; padding: 14px; border: 1px solid $border-light; border-radius: 6px; background: $bg-page; }
.invoice-detail-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.invoice-detail-grid { display: grid; grid-template-columns: 72px minmax(0, 1fr) 72px minmax(0, 1fr); gap: 8px 12px; font-size: 13px; }
.invoice-detail-grid span { color: $text-secondary; }
.invoice-detail-grid b { color: $text-regular; font-weight: 500; overflow-wrap: anywhere; }
.invoice-detail-grid .reject-reason { color: #dc2626; }
.invoice-orders { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.invoice-orders span { padding: 4px 8px; border: 1px solid $border-light; border-radius: 4px; background: #fff; color: $text-secondary; font-size: 12px; }
.conversation { max-height: 430px; overflow-y: auto; padding-right: 4px; }
.reply-item { display: flex; gap: 10px; margin-bottom: 14px; }
.reply-role { width: 40px; height: 40px; flex: 0 0 40px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: $primary-color; font-size: 12px; }
.reply-item.mine .reply-role { background: #64748b; }
.reply-body { flex: 1; min-width: 0; padding: 10px 13px; border-radius: 6px; background: $bg-page; }
.reply-content { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.7; color: $text-regular; font-size: 13px; }
.reply-time { margin-top: 6px; font-size: 12px; color: $text-placeholder; }
.attachments { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 6px; }
.reply-input { margin-top: 10px; }
.reply-upload { margin-top: 8px; }
.reply-bar { display: flex; justify-content: space-between; margin-top: 8px; }
.closed-tip { padding: 12px; text-align: center; color: $text-secondary; background: $bg-page; }
.reopen-bar { margin-top: 12px; text-align: center; }
@media (max-width: 900px) { .ticket-stats { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .tickets-card { padding: 12px; } .detail-time { display: none; } }
@media (max-width: 600px) { .invoice-detail-grid { grid-template-columns: 72px minmax(0, 1fr); } .invoice-order-tip, .invoice-order-dialog-footer { align-items: flex-start; flex-direction: column; } }
</style>
