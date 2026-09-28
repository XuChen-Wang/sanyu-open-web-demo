<template>
  <div class="logs-page">
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">接口</span>
          <el-select
            v-model="filters.apiCode"
            placeholder="全部接口"
            clearable
            filterable
            class="filter-control filter-api"
            @change="onFilterChange"
          >
            <el-option
              v-for="api in apiOptions"
              :key="api.apiCode"
              :label="api.apiName"
              :value="api.apiCode"
            />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">状态</span>
          <el-select
            v-model="filters.status"
            placeholder="全部状态"
            clearable
            class="filter-control filter-status"
            @change="onFilterChange"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="fail" />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">时间</span>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            unlink-panels
            class="filter-control filter-date"
            style="width: 240px"
            @change="onFilterChange"
          />
        </div>

        <div class="filter-actions">
          <el-button type="primary" round @click="fetchLogs">
            <el-icon class="btn-icon"><Search /></el-icon>
            查询
          </el-button>
          <el-button round @click="resetFilters">重置</el-button>
        </div>
      </div>
    </div>

    <div class="card logs-card">
      <div class="logs-summary">
        <div class="logs-summary-left">
          <span class="logs-title">调用记录</span>
          <span class="logs-count">共 <b>{{ total.toLocaleString('zh-CN') }}</b> 条<span v-if="!filters.status" class="logs-count-hint">（不含请求无效）</span></span>
        </div>
      </div>

      <Transition name="skeleton-reveal" mode="out-in">
        <TableSkeleton v-if="loading && list.length === 0" key="logs-sk" :rows="8" :columns="6" />
        <el-table
          v-else
          key="logs-table"
          v-loading="loading"
          element-loading-text="加载中..."
          :data="list"
          stripe
          class="logs-table"
          :class="{ 'is-refreshing': loading }"
          empty-text="暂无调用日志"
        >
          <el-table-column prop="time" label="调用时间" width="170" />
          <el-table-column prop="apiName" label="接口名称" min-width="150" show-overflow-tooltip />
          <el-table-column label="Token" width="160">
            <template #default="{ row }">
              <span class="token-mask" :title="row.tokenName">{{ row.keyMask || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="ip" label="IP 地址" width="140" />
          <el-table-column label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'success' ? 'success' : 'danger'" effect="light" round>
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="耗时" width="90" align="right" />
          <el-table-column label="消费" width="110" align="right">
            <template #default="{ row }">
              <span :class="Number(row.consume) === 0 ? 'consume-free' : 'consume-pay'">
                {{ formatConsume(row.consume) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </Transition>

      <div class="pagination-wrap">
        <span class="usage-pager-total">共 {{ total.toLocaleString('zh-CN') }} 条</span>
        <el-select v-model="pageSize" class="pager-size" :disabled="loading" @change="onSizeChange">
          <el-option v-for="n in [10, 20, 50, 100]" :key="n" :label="n + '条/页'" :value="n" />
        </el-select>
        <el-button :disabled="page <= 1 || loading" @click="goPrev">上一页</el-button>
        <span class="page-current">第 {{ page }} 页</span>
        <el-button type="primary" plain :disabled="!canNext || loading" @click="goNext">下一页</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Search } from '@element-plus/icons-vue'
import { getCallLogs, getUsedApis } from '@/api/console'
import TableSkeleton from '@/components/skeleton/TableSkeleton.vue'

export default {
  name: 'ConsoleLogs',
  components: { TableSkeleton, Search },
  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10,
      hasMore: false,
      beforeId: null,
      cursorStack: [],
      fetchedPage: 1,
      loading: true,
      filters: {
        apiCode: '',
        status: '',
        dateRange: null
      },
      apiOptions: []
    }
  },
  computed: {
    canNext() {
      if (!this.list.length) {
        return false
      }
      if (this.hasMore) {
        return true
      }
      return this.page * this.pageSize < this.total
    }
  },
  methods: {
    formatConsume(amount) {
      const n = Number(amount)
      if (!n) return '免费'
      return '¥' + n.toFixed(3)
    },
    mapRow(row) {
      const latency = row.latencyMs
      return {
        logId: row.logId,
        time: row.callTime || '-',
        apiName: row.apiName || row.apiCode || '-',
        apiCode: row.apiCode,
        tokenName: row.tokenName || '',
        keyMask: row.keyMask || '',
        ip: row.clientIp || '-',
        status: row.status,
        cost: latency == null ? '-' : `${latency}ms`,
        consume: row.amount == null ? 0 : Number(row.amount),
        errorMsg: row.errorMsg || ''
      }
    },
    onFilterChange() {
      this.resetCursor()
      this.fetchLogs()
    },
    resetCursor() {
      this.page = 1
      this.fetchedPage = 1
      this.beforeId = null
      this.cursorStack = []
    },
    onSizeChange() {
      this.resetCursor()
      this.fetchLogs()
    },
    goNext() {
      if (!this.canNext || !this.list.length || this.loading) {
        return
      }
      this.cursorStack.push(this.beforeId)
      this.beforeId = this.list[this.list.length - 1].logId
      this.page += 1
      this.fetchLogs()
    },
    goPrev() {
      if (this.page <= 1 || this.loading) {
        return
      }
      this.beforeId = this.cursorStack.pop() || null
      this.page -= 1
      this.fetchLogs()
    },
    async fetchApiOptions() {
      try {
        const res = await getUsedApis()
        this.apiOptions = res.data || []
      } catch (e) {
        this.apiOptions = []
      }
    },
    async fetchLogs() {
      this.loading = true
      try {
        const res = await getCallLogs({
          pageSize: this.pageSize,
          beforeId: this.beforeId,
          apiCode: this.filters.apiCode,
          status: this.filters.status,
          dateRange: this.filters.dateRange
        })
        this.list = (res.rows || []).map(this.mapRow)
        this.total = res.total || 0
        if (typeof res.hasMore === 'boolean') {
          this.hasMore = res.hasMore
        } else {
          this.hasMore = this.list.length >= this.pageSize && this.page * this.pageSize < this.total
        }
        this.fetchedPage = this.page
      } catch (e) {
        this.list = []
        this.total = 0
        this.hasMore = false
      } finally {
        this.loading = false
      }
    },
    resetFilters() {
      this.filters.apiCode = ''
      this.filters.status = ''
      this.filters.dateRange = null
      this.resetCursor()
      this.fetchLogs()
    }
  },
  mounted() {
    this.fetchApiOptions()
    this.fetchLogs()
  }
}
</script>

<style scoped lang="scss">

.filter-card {
  padding: 16px 20px;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 16px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  flex-shrink: 0;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1;
}

.filter-control {
  width: 180px;
}

.filter-api {
  width: 200px;
}

.filter-status {
  width: 128px;
}

.filter-date {
  width: 240px !important;
  flex-shrink: 0;

  :deep(.el-range-editor.el-input__wrapper) {
    width: 240px;
    border-radius: 8px;
    box-shadow: 0 0 0 1px #e5e7eb inset;
    padding: 0 8px;

    &:hover {
      box-shadow: 0 0 0 1px #c9cdd4 inset;
    }

    &.is-focus {
      box-shadow: 0 0 0 1px $primary-color inset !important;
    }
  }

  :deep(.el-range-input) {
    font-size: 13px;
  }

  :deep(.el-range-separator) {
    color: $text-placeholder;
    font-size: 12px;
    padding: 0 2px;
    flex: 0;
  }
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.btn-icon {
  margin-right: 4px;
}

.logs-card {
  padding: 18px 20px 16px;
}

.logs-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 12px;
}

.logs-summary-left {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.logs-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
}

.logs-count {
  font-size: 13px;
  color: $text-secondary;

  b {
    color: $primary-color;
    font-weight: 600;
  }
}

.logs-count-hint {
  margin-left: 2px;
  color: $text-placeholder;
}

.logs-table {
  :deep(.el-table__header th) {
    background: #f8fafc;
    color: $text-secondary;
    font-weight: 600;
    font-size: 13px;
  }

  :deep(.el-table__cell) {
    font-size: 13px;
  }
}

.token-mask {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: $text-regular;
  letter-spacing: 0.02em;
}

.consume-free {
  color: $color-free;
  font-size: 13px;
  font-weight: 500;
}

.consume-pay {
  color: $color-pay;
  font-size: 13px;
  font-weight: 500;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 4px;
}

.usage-pager-total {
  margin-right: 4px;
  font-size: 13px;
  color: $text-secondary;
}

.pager-size {
  width: 110px;
}

.page-current {
  min-width: 64px;
  padding: 0 8px;
  font-size: 13px;
  color: $text-regular;
  text-align: center;
}

@media (max-width: 900px) {
  .filter-actions {
    margin-left: 0;
    width: 100%;
  }
}
</style>
