<template>
  <div class="notify-config-page">
    <!-- 接收渠道 -->
    <div class="card config-card">
      <h3 class="card-title">接收渠道</h3>
      <div class="config-row">
        <div class="config-info">
          <el-icon color="#3a7afe"><Message /></el-icon>
          <div>
            <div class="config-name">站内信</div>
            <div class="config-desc">控制台内消息通知，默认开启</div>
          </div>
        </div>
        <el-switch v-model="config.siteMsg" disabled />
      </div>
      <div class="config-row">
        <div class="config-info">
          <el-icon color="#f59e0b"><Iphone /></el-icon>
          <div>
            <div class="config-name">短信通知</div>
            <div class="config-desc">通过手机短信接收重要消息</div>
          </div>
        </div>
        <el-switch v-model="config.sms" @change="onChange" />
      </div>
      <div class="config-row">
        <div class="config-info">
          <el-icon color="#10b981"><MessageBox /></el-icon>
          <div>
            <div class="config-name">邮件通知</div>
            <div class="config-desc">通过邮箱接收消息，请先在基本信息中绑定邮箱</div>
          </div>
        </div>
        <el-switch v-model="config.email" @change="onChange" />
      </div>
    </div>

    <!-- 消息类型 -->
    <div class="card config-card">
      <h3 class="card-title">消息类型</h3>
      <el-table :data="typeRows" style="width: 100%">
        <el-table-column prop="name" label="消息类型" width="160" />
        <el-table-column prop="desc" label="说明" min-width="220" />
        <el-table-column label="站内信" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.site" size="small" @change="onChange" />
          </template>
        </el-table-column>
        <el-table-column label="短信" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.sms" size="small" :disabled="!config.sms" @change="onChange" />
          </template>
        </el-table-column>
        <el-table-column label="邮件" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.email" size="small" :disabled="!config.email" @change="onChange" />
          </template>
        </el-table-column>
      </el-table>
      <div class="save-bar">
        <el-button type="primary" round @click="onSave">保存设置</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getNotifyConfig, saveNotifyConfig } from '@/api/console'

export default {
  name: 'ConsoleNotifyConfig',
  data() {
    return {
      config: {
        siteMsg: true,
        sms: true,
        email: false
      },
      typeRows: [
        { name: '系统公告', desc: '平台功能更新、服务变更等重要公告', site: true, sms: true, email: true },
        { name: '订单消息', desc: '充值成功、消费扣费、余额不足提醒', site: true, sms: true, email: false },
        { name: '工单回复', desc: '工单有新的处理进度或回复', site: true, sms: false, email: false },
        { name: '接口告警', desc: '接口调用异常、成功率下降告警', site: true, sms: true, email: true }
      ]
    }
  },
  methods: {
    async fetchConfig() {
      const res = await getNotifyConfig()
      if (res.code === 200) {
        this.config = res.data.config
        this.typeRows = res.data.types
      }
    },
    onChange() {
      // 切换即时生效（演示）
    },
    async onSave() {
      const res = await saveNotifyConfig({ config: this.config, types: this.typeRows })
      if (res.code === 200) {
        this.$message.success('通知配置已保存')
      }
    }
  },
  mounted() {
    this.fetchConfig()
  }
}
</script>

<style scoped lang="scss">

.config-card {
  padding: 20px 28px;
  margin-bottom: 16px;

  .card-title {
    font-size: 16px;
    margin: 0 0 6px;
    color: $text-primary;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-light;
  }
}

.config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: none;
  }

  .config-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .config-name {
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
    }

    .config-desc {
      font-size: 12px;
      color: $text-placeholder;
      margin-top: 2px;
    }
  }
}

.save-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
