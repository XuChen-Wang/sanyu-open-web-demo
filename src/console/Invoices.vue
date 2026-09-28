<template>
  <div class="invoices-page">
    <!-- 开票说明 -->
    <div class="tip-card card">
      <el-icon class="tip-icon" color="#3a7afe" :size="22"><DocumentChecked /></el-icon>
      <div class="tip-text">
        <p class="tip-title">发票说明</p>
        <p>累计消费满 ¥100 可申请开票，支持增值税普通发票与专用发票，开票金额将从累计消费中扣除。</p>
      </div>
      <el-button type="primary" round @click="openApply">
        <el-icon style="margin-right: 4px;"><Plus /></el-icon>
        申请开票
      </el-button>
    </div>

    <!-- 发票抬头 -->
    <div class="card inv-card">
      <h3 class="card-title">发票抬头</h3>
      <div class="inv-rows">
        <div v-for="title in titles" :key="title.id" class="inv-row">
          <div class="inv-info">
            <div class="inv-name">
              {{ title.name }}
              <el-tag v-if="title.isDefault" size="small" type="primary" effect="light" style="margin-left: 8px;">默认</el-tag>
            </div>
            <div class="inv-meta">{{ title.type }} · 税号：{{ title.taxNo }}</div>
          </div>
          <div class="inv-actions">
            <el-button size="small" text type="primary" @click="onSetDefault(title)">设为默认</el-button>
            <el-button size="small" text type="danger" @click="onDeleteTitle(title)">删除</el-button>
          </div>
        </div>
      </div>
      <el-button size="small" round @click="titleVisible = true">
        <el-icon style="margin-right: 4px;"><Plus /></el-icon>
        新增抬头
      </el-button>
    </div>

    <!-- 开票记录 -->
    <div class="card inv-card">
      <h3 class="card-title">开票记录</h3>
      <el-table :data="records" stripe>
        <el-table-column prop="invoiceNo" label="发票号码" width="170">
          <template #default="{ row }">
            <span class="inv-no">{{ row.invoiceNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="抬头" min-width="160" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="amount" label="开票金额" width="110">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="applyTime" label="申请时间" width="170" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === '已开票' ? 'success' : 'warning'" effect="light">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button v-if="row.status === '已开票'" size="small" text type="primary" @click="onDownload(row)">下载</el-button>
            <span v-else class="no-op">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增抬头弹窗 -->
    <el-dialog v-model="titleVisible" title="新增发票抬头" width="480px">
      <el-form :model="titleForm" label-width="90px">
        <el-form-item label="抬头类型" required>
          <el-radio-group v-model="titleForm.type">
            <el-radio value="企业">企业</el-radio>
            <el-radio value="个人">个人</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="抬头名称" required>
          <el-input v-model="titleForm.name" placeholder="企业名称或个人姓名" />
        </el-form-item>
        <el-form-item v-if="titleForm.type === '企业'" label="税号" required>
          <el-input v-model="titleForm.taxNo" placeholder="统一社会信用代码" maxlength="18" />
        </el-form-item>
        <el-form-item v-if="titleForm.type === '企业'" label="注册地址">
          <el-input v-model="titleForm.address" placeholder="企业注册地址" />
        </el-form-item>
        <el-form-item v-if="titleForm.type === '企业'" label="开户行">
          <el-input v-model="titleForm.bank" placeholder="开户银行" />
        </el-form-item>
        <el-form-item v-if="titleForm.type === '企业'" label="银行账号">
          <el-input v-model="titleForm.account" placeholder="银行账号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="titleVisible = false">取消</el-button>
        <el-button type="primary" @click="onAddTitle">保存</el-button>
      </template>
    </el-dialog>

    <!-- 申请开票弹窗 -->
    <el-dialog v-model="applyVisible" title="申请开票" width="480px">
      <el-form :model="applyForm" label-width="90px">
        <el-form-item label="发票抬头" required>
          <el-select v-model="applyForm.titleId" style="width: 100%">
            <el-option v-for="t in titles" :key="t.id" :label="t.name" :value="t.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="发票类型" required>
          <el-radio-group v-model="applyForm.type">
            <el-radio value="增值税普通发票">增值税普通发票</el-radio>
            <el-radio value="增值税专用发票">增值税专用发票</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开票金额" required>
          <el-input-number v-model="applyForm.amount" :min="100" :max="finance.balance + 100" :precision="2" :step="100" style="width: 200px" />
          <span class="amount-hint">元（最低 ¥100）</span>
        </el-form-item>
        <el-form-item label="接收邮箱" required>
          <el-input v-model="applyForm.email" placeholder="电子发票将发送至该邮箱" />
        </el-form-item>
      </el-form>
      <div class="apply-tip">开票金额将从累计消费额度中扣除，本次可开票金额：¥{{ finance.balance.toFixed(2) }}</div>
      <template #footer>
        <el-button @click="applyVisible = false">取消</el-button>
        <el-button type="primary" :loading="applying" @click="onApply">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { getInvoices, addInvoiceTitle, applyInvoice } from '@/api/console'

export default {
  name: 'ConsoleInvoices',
  data() {
    return {
      titles: [],
      records: [],
      finance: { balance: 0 },
      titleVisible: false,
      titleForm: { type: '企业', name: '', taxNo: '', address: '', bank: '', account: '' },
      applyVisible: false,
      applyForm: { titleId: '', type: '增值税普通发票', amount: 100, email: '' },
      applying: false
    }
  },
  methods: {
    async fetchData() {
      const res = await getInvoices()
      if (res.code === 200) {
        this.titles = res.data.titles
        this.records = res.data.records
        this.finance = res.data.finance
      }
    },
    onSetDefault(title) {
      this.titles.forEach(t => { t.isDefault = t.id === title.id })
      this.$message.success('默认抬头已更新')
    },
    onDeleteTitle(title) {
      this.$confirm(`确定删除抬头「${title.name}」吗？`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.titles = this.titles.filter(t => t.id !== title.id)
        this.$message.success('抬头已删除')
      }).catch(() => {})
    },
    onAddTitle() {
      if (!this.titleForm.name.trim()) {
        this.$message.warning('请输入抬头名称')
        return
      }
      if (this.titleForm.type === '企业' && !this.titleForm.taxNo.trim()) {
        this.$message.warning('请输入税号')
        return
      }
      this.titles.push({
        id: Date.now(),
        ...this.titleForm,
        isDefault: this.titles.length === 0
      })
      this.titleVisible = false
      this.$message.success('抬头添加成功')
    },
    openApply() {
      if (this.titles.length === 0) {
        this.$message.warning('请先添加发票抬头')
        return
      }
      this.applyForm.titleId = this.titles.find(t => t.isDefault)?.id || this.titles[0].id
      this.applyVisible = true
    },
    async onApply() {
      if (!this.applyForm.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.applyForm.email)) {
        this.$message.warning('请输入正确的接收邮箱')
        return
      }
      this.applying = true
      const res = await applyInvoice(this.applyForm)
      this.applying = false
      if (res.code === 200) {
        this.applyVisible = false
        this.$message.success('开票申请已提交，电子发票将发送至邮箱')
        this.fetchData()
      }
    },
    onDownload(row) {
      this.$message.success(`发票 ${row.invoiceNo} 下载中…（演示环境）`)
    }
  },
  mounted() {
    this.fetchData()
  }
}
</script>

<style scoped lang="scss">

.tip-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 24px;
  margin-bottom: 16px;

  .tip-icon {
    flex-shrink: 0;
  }

  .tip-text {
    flex: 1;

    .tip-title {
      font-weight: 600;
      color: $text-primary;
      margin: 0 0 4px;
      font-size: 14px;
    }

    p {
      margin: 0;
      font-size: 13px;
      color: $text-secondary;
      line-height: 1.6;
    }
  }
}

.inv-card {
  padding: 20px 28px;
  margin-bottom: 16px;

  .card-title {
    font-size: 16px;
    margin: 0 0 14px;
    color: $text-primary;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-light;
  }
}

.inv-rows {
  margin-bottom: 12px;
}

.inv-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: $bg-page;
  }

  .inv-name {
    font-size: 14px;
    font-weight: 500;
    color: $text-primary;
  }

  .inv-meta {
    font-size: 12px;
    color: $text-placeholder;
    margin-top: 3px;
  }

  .inv-actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}

.inv-no {
  font-family: monospace;
  font-size: 13px;
  color: $text-regular;
}

.amount {
  font-weight: 600;
  color: $text-primary;
}

.no-op {
  color: $text-placeholder;
}

.amount-hint {
  font-size: 12px;
  color: $text-placeholder;
  margin-left: 8px;
}

.apply-tip {
  font-size: 13px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  padding: 10px 14px;
  border-radius: 8px;
}
</style>
