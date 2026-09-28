<template>
  <div class="invite-page">
    <!-- 邀请统计 -->
    <div class="invite-stats">
      <div class="stat-item card">
        <div class="num">{{ stats.invited }}</div>
        <div class="label">已邀请用户</div>
      </div>
      <div class="stat-item card">
        <div class="num blue">{{ stats.registered }}</div>
        <div class="label">已注册</div>
      </div>
      <div class="stat-item card">
        <div class="num green">{{ stats.commission.toFixed(2) }}</div>
        <div class="label">累计返利（元）</div>
      </div>
      <div class="stat-item card">
        <div class="num orange">{{ stats.withdrawable.toFixed(2) }}</div>
        <div class="label">可提现（元）</div>
      </div>
    </div>

    <!-- 邀请链接 -->
    <div class="card invite-card">
      <h3 class="card-title">
        <el-icon color="#3a7afe"><Share /></el-icon>
        我的邀请链接
      </h3>
      <div class="link-row">
        <el-input v-model="inviteLink" readonly class="link-input">
          <template #prefix>
            <el-icon><Link /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" round @click="copyLink">复制链接</el-button>
        <el-button round @click="copyLink">分享海报</el-button>
      </div>
      <div class="invite-rules">
        <div class="rule-title">返利规则</div>
        <ul>
          <li>好友通过你的邀请链接注册，即可获得 <b>¥5</b> 余额奖励。</li>
          <li>好友首次充值，你可获得充值金额 <b>10%</b> 的返利。</li>
          <li>好友后续每次充值，你均可获得充值金额 <b>5%</b> 的返利。</li>
          <li>返利实时到账，满 <b>¥10</b> 即可提现。</li>
        </ul>
      </div>
    </div>

    <!-- 邀请记录 -->
    <div class="card invite-card">
      <h3 class="card-title">邀请记录</h3>
      <el-table :data="records" stripe>
        <el-table-column prop="user" label="被邀请人" width="160" />
        <el-table-column prop="time" label="注册时间" width="180" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已注册' ? 'success' : 'info'" effect="light">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="recharge" label="累计充值" width="110">
          <template #default="{ row }">
            ¥{{ row.recharge.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="我的返利" width="110">
          <template #default="{ row }">
            <span class="commission">¥{{ row.commission.toFixed(2) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 提现 -->
    <div class="card invite-card">
      <h3 class="card-title">提现</h3>
      <div class="withdraw-row">
        <span class="withdraw-label">可提现金额</span>
        <span class="withdraw-value">¥{{ stats.withdrawable.toFixed(2) }}</span>
        <el-button type="primary" round :disabled="stats.withdrawable < 10" @click="onWithdraw">
          申请提现（满 ¥10）
        </el-button>
      </div>
      <div class="withdraw-tip">提现将原路退回至你的充值账户，一般 1-3 个工作日到账。</div>
    </div>
  </div>
</template>

<script>
import { getInviteInfo, withdraw } from '@/api/console'

export default {
  name: 'ConsoleInvite',
  data() {
    return {
      stats: { invited: 0, registered: 0, commission: 0, withdrawable: 0 },
      records: [],
      inviteLink: ''
    }
  },
  methods: {
    async fetchData() {
      const res = await getInviteInfo()
      if (res.code === 200) {
        this.stats = res.data.stats
        this.records = res.data.records
        this.inviteLink = res.data.link
      }
    },
    copyLink() {
      navigator.clipboard.writeText(this.inviteLink).then(() => {
        this.$message.success('邀请链接已复制')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },
    onWithdraw() {
      this.$confirm(`确定提现 ¥${this.stats.withdrawable.toFixed(2)} 吗？`, '提现确认', {
        confirmButtonText: '确认提现',
        cancelButtonText: '取消',
        type: 'info'
      }).then(async () => {
        const res = await withdraw()
        if (res.code === 200) {
          this.$message.success('提现申请已提交，预计 1-3 个工作日到账')
          this.fetchData()
        }
      }).catch(() => {})
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped lang="scss">

.invite-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  .stat-item {
    text-align: center;
    padding: 20px 8px;

    .num {
      font-size: 26px;
      font-weight: 700;
      color: $color-free;

      &.blue {
        color: $primary-color;
      }

      &.green {
        color: $color-free;
      }

      &.orange {
        color: #f59e0b;
      }
    }

    .label {
      font-size: 13px;
      color: $text-secondary;
      margin-top: 6px;
    }
  }
}

.invite-card {
  padding: 20px 28px;
  margin-bottom: 16px;

  .card-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 16px;
    margin: 0 0 16px;
    color: $text-primary;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-light;
  }
}

.link-row {
  display: flex;
  gap: 12px;

  .link-input {
    flex: 1;
  }
}

.invite-rules {
  margin-top: 16px;
  background: $bg-page;
  border-radius: 8px;
  padding: 14px 18px;

  .rule-title {
    font-size: 13px;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8px;
  }

  ul {
    list-style: disc;
    padding-left: 18px;

    li {
      font-size: 13px;
      color: $text-secondary;
      line-height: 2;

      b {
        color: $color-pay;
      }
    }
  }
}

.commission {
  color: $color-free;
  font-weight: 600;
}

.withdraw-row {
  display: flex;
  align-items: center;
  gap: 14px;

  .withdraw-label {
    font-size: 14px;
    color: $text-secondary;
  }

  .withdraw-value {
    font-size: 24px;
    font-weight: 700;
    color: $text-primary;
    flex: 1;
  }
}

.withdraw-tip {
  font-size: 12px;
  color: $text-placeholder;
  margin-top: 10px;
}

@media (max-width: 1024px) {
  .invite-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
