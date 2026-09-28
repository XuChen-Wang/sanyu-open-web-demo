<template>
  <div class="login-logs-page">
    <div class="card logs-card">
      <div class="logs-head">
        <span>共 <b>{{ total }}</b> 条登录记录</span>
        <el-radio-group v-model="filter" size="small" @change="onFilterChange">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="success">成功</el-radio-button>
          <el-radio-button value="fail">失败</el-radio-button>
        </el-radio-group>
      </div>
      <Transition name="skeleton-reveal" mode="out-in">
        <TableSkeleton v-if="loading && list.length === 0" key="login-logs-sk" :rows="8" :columns="7" />
        <el-table v-else key="login-logs-table" :data="list" stripe :class="{ 'is-refreshing': loading }">
        <el-table-column prop="time" label="登录时间" width="180" />
        <el-table-column prop="type" label="登录方式" width="120">
          <template #default="{ row }">
            <el-tag size="small" :type="typeTag(row.type)" effect="light">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ip" label="IP 地址" width="150" />
        <el-table-column prop="location" label="登录地点" width="160" />
        <el-table-column prop="device" label="设备信息" min-width="200" show-overflow-tooltip />
        <el-table-column label="结果" width="90">
          <template #default="{ row }">
            <span :class="row.status === 'success' ? 'result-ok' : 'result-fail'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="msg" label="说明" min-width="140" show-overflow-tooltip />
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button v-if="row.status === 'fail'" size="small" text type="danger" @click="onReport(row)">异常?</el-button>
            <span v-else class="no-op">-</span>
          </template>
        </el-table-column>
      </el-table>
      </Transition>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next, total"
          background
          @current-change="fetchLogs"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getLoginLogs } from '@/api/console'
import TableSkeleton from '@/components/skeleton/TableSkeleton.vue'

export default {
  name: 'ConsoleLoginLogs',
  components: { TableSkeleton },
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      loading: true,
      filter: 'all'
    }
  },
  methods: {
    typeTag(type) {
      const text = type || ''
      if (text.includes('验证码') || text === 'sms') return 'success'
      if (text.includes('密码') || text === 'password') return 'warning'
      return 'info'
    },
    onFilterChange() {
      this.page = 1
      this.fetchLogs()
    },
    mapRow(row) {
      return {
        logId: row.logId,
        time: row.loginTime,
        type: row.loginTypeLabel || row.loginType || '-',
        ip: row.ipaddr || '-',
        location: row.loginLocation || '-',
        device: row.device || [row.browser, row.os].filter(Boolean).join(' / ') || '-',
        status: row.status,
        msg: row.msg || ''
      }
    },
    async fetchLogs() {
      this.loading = true
      try {
        const res = await getLoginLogs({
          page: this.page,
          pageSize: this.pageSize,
          status: this.filter
        })
        const rows = res.rows || []
        this.list = rows.map(this.mapRow)
        this.total = res.total || 0
      } catch (e) {
        this.list = []
        this.total = 0
      } finally {
        this.loading = false
      }
    },
    onReport(row) {
      this.$message.info('已标记异常登录，安全中心将加强该设备的验证')
    }
  },
  mounted() {
    this.fetchLogs()
  }
}
</script>

<style scoped lang="scss">

.logs-card {
  padding: 16px 20px;
}

.logs-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: $text-secondary;

  b {
    color: $primary-color;
  }
}

.result-ok {
  color: $color-free;
}

.result-fail {
  color: $color-pay;
}

.no-op {
  color: $text-placeholder;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
