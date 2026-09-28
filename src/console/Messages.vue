<template>
  <div class="messages-page">
    <div class="card messages-card">
      <div class="msg-head">
        <div class="msg-tabs">
          <span
            v-for="tab in tabs"
            :key="tab.type"
            class="msg-tab"
            :class="{ active: currentTab === tab.type }"
            @click="switchTab(tab.type)"
          >
            {{ tab.name }}
            <el-badge v-if="unreadCount(tab.type) > 0" :value="unreadCount(tab.type)" :max="99" class="tab-badge" />
          </span>
        </div>
        <div class="msg-actions">
          <el-button size="small" text :disabled="unreadCount(currentTab) === 0" @click="markAllRead">全部已读</el-button>
        </div>
      </div>

      <Transition name="skeleton-reveal" mode="out-in">
        <MessageListSkeleton v-if="loading && list.length === 0" key="msg-sk" />
        <div v-else key="msg-list" class="msg-list" :class="{ 'is-refreshing': loading }">
          <div
            v-for="msg in list"
            :key="msg.id"
            class="msg-item"
            :class="{ unread: !msg.read }"
            @click="onRead(msg)"
          >
            <span class="msg-dot" :class="{ read: msg.read }"></span>
            <div class="msg-content">
              <div class="msg-title">
                <span class="msg-type-tag" :class="'type-' + msg.type">{{ typeName(msg.type) }}</span>
                {{ msg.title }}
              </div>
              <div class="msg-body">{{ msg.content }}</div>
              <div class="msg-time">{{ msg.time }}</div>
            </div>
            <el-button v-if="!msg.read" size="small" text type="primary" @click.stop="markRead(msg)">标为已读</el-button>
          </div>
          <el-empty v-if="!loading && list.length === 0" description="暂无消息" :image-size="80" />
        </div>
      </Transition>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          background
          @current-change="fetchList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { getMessages, getMessageUnreadCounts, readMessage, readAllMessages } from '@/api/console'
import MessageListSkeleton from '@/components/skeleton/MessageListSkeleton.vue'

export default {
  name: 'ConsoleMessages',
  components: { MessageListSkeleton },
  data() {
    return {
      tabs: [
        { type: 'all', name: '全部' },
        { type: 'system', name: '系统通知' },
        { type: 'order', name: '订单消息' },
        { type: 'ticket', name: '工单回复' }
      ],
      currentTab: 'all',
      list: [],
      unreadCounts: { all: 0, system: 0, order: 0, ticket: 0 },
      total: 0,
      page: 1,
      pageSize: 8,
      loading: true,
      listRequestId: 0,
      refreshTimer: null
    }
  },
  methods: {
    typeName(type) {
      const map = { system: '系统', order: '订单', ticket: '工单' }
      return map[type] || '通知'
    },
    unreadCount(type) {
      return Number(this.unreadCounts[type] || 0)
    },
    switchTab(type) {
      if (this.currentTab === type) return
      this.currentTab = type
      this.page = 1
      this.fetchList()
    },
    async fetchList(showLoading = true) {
      const requestId = ++this.listRequestId
      if (showLoading) this.loading = true
      try {
        const res = await getMessages({
          page: this.page,
          pageSize: this.pageSize,
          type: this.currentTab
        })
        if (requestId === this.listRequestId && res.code === 200) {
          this.list = res.rows || []
          this.total = Number(res.total || 0)
        }
      } finally {
        if (showLoading && requestId === this.listRequestId) this.loading = false
      }
    },
    async fetchUnreadCounts() {
      const res = await getMessageUnreadCounts()
      if (res.code === 200) {
        this.unreadCounts = { ...this.unreadCounts, ...(res.data || {}) }
      }
    },
    async onRead(msg) {
      if (!msg.read) {
        await this.markRead(msg)
      }
      if (msg.jumpPath) {
        this.$router.push(msg.jumpPath)
      }
    },
    async markRead(msg) {
      const res = await readMessage(msg.id)
      if (res.code === 200) {
        msg.read = true
        this.decreaseUnread(msg.type)
      }
    },
    async markAllRead() {
      const type = this.currentTab === 'all' ? '' : this.currentTab
      const res = await readAllMessages(type)
      if (res.code === 200) {
        this.list.forEach(m => { m.read = true })
        await this.fetchUnreadCounts()
        this.$message.success('已全部标为已读')
      }
    },
    decreaseUnread(type) {
      this.unreadCounts.all = Math.max(0, this.unreadCount('all') - 1)
      this.unreadCounts[type] = Math.max(0, this.unreadCount(type) - 1)
    },
    async refreshMessages() {
      if (document.hidden) return
      await this.fetchUnreadCounts()
      if (this.page === 1) await this.fetchList(false)
    },
    onVisibilityChange() {
      if (!document.hidden) this.refreshMessages()
    }
  },
  mounted() {
    Promise.allSettled([this.fetchList(), this.fetchUnreadCounts()])
    this.refreshTimer = window.setInterval(this.refreshMessages, 30000)
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  },
  beforeUnmount() {
    if (this.refreshTimer) window.clearInterval(this.refreshTimer)
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }
}
</script>

<style scoped lang="scss">

.messages-card {
  padding: 16px 24px;
}

.msg-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid $border-light;
  margin-bottom: 8px;
}

.msg-tabs {
  display: flex;
  gap: 24px;

  .msg-tab {
    padding: 12px 2px;
    font-size: 14px;
    color: $text-secondary;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 4px;

    &:hover {
      color: $primary-color;
    }

    &.active {
      color: $primary-color;
      font-weight: 600;
      border-bottom-color: $primary-color;
    }

    .tab-badge {
      :deep(.el-badge__content) {
        transform: translateY(-50%);
      }
    }
  }
}

.msg-list {
  min-height: 200px;
}

.msg-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px 8px;
  border-bottom: 1px solid $border-light;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: $bg-page;
  }

  &.unread {
    .msg-title {
      font-weight: 600;
      color: $text-primary;
    }
  }

  .msg-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: $primary-color;
    margin-top: 7px;
    flex-shrink: 0;

    &.read {
      background: transparent;
      border: 1px solid $border-color;
    }
  }

  .msg-content {
    flex: 1;
    min-width: 0;

    .msg-title {
      font-size: 14px;
      color: $text-regular;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .msg-type-tag {
      font-size: 11px;
      padding: 1px 6px;
      border-radius: 4px;
      flex-shrink: 0;

      &.type-system {
        color: #3a7afe;
        background: rgba(58, 122, 254, 0.1);
      }

      &.type-order {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
      }

      &.type-ticket {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }
    }

    .msg-body {
      font-size: 13px;
      color: $text-secondary;
      margin-top: 6px;
      line-height: 1.6;
    }

    .msg-time {
      font-size: 12px;
      color: $text-placeholder;
      margin-top: 8px;
    }
  }
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
