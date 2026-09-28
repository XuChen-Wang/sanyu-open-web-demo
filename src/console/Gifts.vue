<template>
  <div class="gifts-page">
    <!-- 兑换入口 -->
    <div class="card redeem-card">
      <h3 class="card-title">
        <el-icon color="#f59e0b"><Present /></el-icon>
        礼品兑换
      </h3>
      <div class="redeem-row">
        <el-input v-model="redeemCode" placeholder="请输入兑换码，如：GIFT-XXXX-XXXX" class="redeem-input" clearable>
          <template #prefix>
            <el-icon><Ticket /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" round :loading="redeeming" @click="onRedeem">立即兑换</el-button>
      </div>
      <div class="redeem-tip">
        兑换码可在平台活动、官方社群或合作渠道获取。兑换成功后礼品将自动发放到账户。
      </div>
    </div>

    <!-- 可用礼品 -->
    <div class="card gift-card">
      <h3 class="card-title">可用礼品</h3>
      <div class="gift-list">
        <div v-for="gift in gifts" :key="gift.id" class="gift-item">
          <span class="gift-icon" :style="{ background: gift.color + '1a', color: gift.color }">
            <el-icon :size="22"><component :is="gift.icon" /></el-icon>
          </span>
          <div class="gift-info">
            <div class="gift-name">{{ gift.name }}</div>
            <div class="gift-desc">{{ gift.desc }}</div>
          </div>
          <el-button size="small" round @click="onUseGift(gift)">立即使用</el-button>
        </div>
        <el-empty v-if="gifts.length === 0" description="暂无可用礼品" :image-size="80" />
      </div>
    </div>

    <!-- 兑换记录 -->
    <div class="card gift-card">
      <h3 class="card-title">兑换记录</h3>
      <el-table :data="records" stripe>
        <el-table-column prop="time" label="兑换时间" width="180" />
        <el-table-column prop="code" label="兑换码" width="180">
          <template #default="{ row }">
            <span class="redeem-code">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gift" label="礼品" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已使用' ? 'info' : 'success'" effect="light">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 兑换成功弹窗 -->
    <el-dialog v-model="successVisible" title="兑换成功" width="420px">
      <div class="success-box">
        <el-icon color="#10b981" :size="52"><CircleCheckFilled /></el-icon>
        <div class="success-title">{{ successGift }}</div>
        <div class="success-desc">礼品已发放到你的账户，可在「可用礼品」中查看和使用</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="successVisible = false">好的</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { redeemGift, getGifts, getGiftRecords } from '@/api/console'

export default {
  name: 'ConsoleGifts',
  data() {
    return {
      redeemCode: '',
      redeeming: false,
      gifts: [],
      records: [],
      successVisible: false,
      successGift: ''
    }
  },
  methods: {
    async fetchData() {
      const [giftRes, recordRes] = await Promise.all([getGifts(), getGiftRecords()])
      if (giftRes.code === 200) this.gifts = giftRes.data
      if (recordRes.code === 200) this.records = recordRes.data
    },
    async onRedeem() {
      const code = this.redeemCode.trim()
      if (!code) {
        this.$message.warning('请输入兑换码')
        return
      }
      this.redeeming = true
      const res = await redeemGift(code)
      this.redeeming = false
      if (res.code === 200) {
        this.successGift = res.data.gift
        this.successVisible = true
        this.redeemCode = ''
        this.fetchData()
      } else {
        this.$message.error(res.msg || '兑换码无效或已过期')
      }
    },
    onUseGift(gift) {
      this.$confirm(`确定使用「${gift.name}」吗？`, '使用礼品', {
        confirmButtonText: '使用',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.gifts = this.gifts.filter(g => g.id !== gift.id)
        this.$message.success(`「${gift.name}」已发放到你的账户`)
      }).catch(() => {})
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped lang="scss">

.redeem-card,
.gift-card {
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

.redeem-row {
  display: flex;
  gap: 12px;

  .redeem-input {
    flex: 1;
    max-width: 400px;
  }
}

.redeem-tip {
  font-size: 12px;
  color: $text-placeholder;
  margin-top: 10px;
}

.gift-list {
  .gift-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 10px;
    border-bottom: 1px solid $border-light;

    &:last-child {
      border-bottom: none;
    }

    .gift-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .gift-info {
      flex: 1;

      .gift-name {
        font-size: 15px;
        font-weight: 600;
        color: $text-primary;
      }

      .gift-desc {
        font-size: 12px;
        color: $text-placeholder;
        margin-top: 3px;
      }
    }
  }
}

.redeem-code {
  font-family: monospace;
  font-size: 13px;
  color: $text-regular;
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
    line-height: 1.6;
  }
}
</style>
