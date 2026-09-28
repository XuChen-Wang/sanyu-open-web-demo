<template>
  <div class="token-page">
    <div class="tip-card card">
      <div class="tip-main">
        <el-icon class="tip-icon" color="#3a7afe" :size="20"><InfoFilled /></el-icon>
        <div class="tip-text">
          <p class="tip-title">Token 使用说明</p>
          <p>
            请求头携带 <code>X-Api-Key: &lt;Token&gt;</code> 即可鉴权。
            <b>完整 Token 仅在创建时展示一次</b>，请立即复制保存，关闭后无法再次查看。
            可为每个 Token 配置 IP 白名单，限制调用来源。
          </p>
        </div>
      </div>
      <el-button type="primary" round @click="openCreate">
        <el-icon class="btn-icon"><Plus /></el-icon>
        创建 Token
      </el-button>
    </div>

    <div class="card token-list-card">
      <div class="list-head">
        <span class="list-title">我的 Token</span>
        <span class="list-count">共 <b>{{ keys.length }}</b> 个</span>
      </div>

      <Transition name="skeleton-reveal" mode="out-in">
        <TableSkeleton v-if="loading && keys.length === 0" key="token-sk" :rows="4" :columns="7" />
        <el-table
          v-else
          key="token-table"
          :data="keys"
          stripe
          class="token-table"
          :class="{ 'is-refreshing': loading }"
          empty-text="暂无 Token，点击右上角创建"
        >
          <el-table-column label="名称" min-width="140">
            <template #default="{ row }">
              <div class="key-name">
                <el-icon color="#3a7afe"><Key /></el-icon>
                <span>{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="Token" min-width="200">
            <template #default="{ row }">
              <code class="key-mask">{{ row.keyMask || '-' }}</code>
            </template>
          </el-table-column>

          <el-table-column prop="boundApiSummary" label="绑定范围" min-width="120" show-overflow-tooltip />
          <el-table-column prop="ipSummary" label="IP 白名单" min-width="110" show-overflow-tooltip />
          <el-table-column prop="createTime" label="创建时间" width="168" />
          <el-table-column prop="lastUsed" label="最后使用" width="168" />

          <el-table-column label="启用" width="88" align="center">
            <template #default="{ row }">
              <el-switch
                class="status-switch"
                :model-value="isEnabled(row)"
                :loading="!!statusLoading[row.id]"
                :active-color="'#3a7afe'"
                @change="(val) => onStatusSwitch(row, val)"
              />
            </template>
          </el-table-column>

          <el-table-column label="操作" width="240" fixed="right" align="center" header-align="center">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button size="small" text type="primary" @click="openBind(row)">绑定接口</el-button>
                <el-button size="small" text type="primary" @click="openIp(row)">IP白名单</el-button>
                <el-button size="small" text type="danger" @click="onDelete(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </Transition>
    </div>

    <el-dialog
      v-model="formVisible"
      :title="formMode === 'create' ? '创建 Token' : '绑定接口'"
      width="560px"
      destroy-on-close
    >
      <el-form :model="form" label-width="90px">
        <el-form-item v-if="formMode === 'create'" label="Token名称" required>
          <el-input v-model="form.name" placeholder="如：生产环境 / 测试环境" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item v-else label="Token名称">
          <span>{{ form.name }}</span>
        </el-form-item>
        <el-form-item label="接口范围" required>
          <el-radio-group v-model="form.apiScope">
            <el-radio value="all">套餐内全部</el-radio>
            <el-radio value="custom">指定接口</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.apiScope === 'custom'" label="选择接口" required>
          <div class="api-bind-box">
            <el-input
              v-model="apiKeyword"
              clearable
              placeholder="搜索接口名称 / 编码"
              style="margin-bottom: 10px"
            />
            <div v-if="allowedTip" class="api-bind-tip">{{ allowedTip }}</div>
            <el-checkbox-group v-model="form.apiCodes" class="api-check-group" v-loading="allowedLoading">
              <el-checkbox
                v-for="api in filteredApis"
                :key="api.apiCode"
                :value="api.apiCode"
                class="api-check-item"
              >
                <span class="api-check-name">{{ api.apiName || api.apiCode }}</span>
                <span class="api-check-meta">{{ chargeText(api.chargeType) }} · {{ api.apiCode }}</span>
              </el-checkbox>
            </el-checkbox-group>
            <el-empty v-if="!allowedLoading && filteredApis.length === 0" description="暂无可选接口" :image-size="64" />
          </div>
        </el-form-item>
        <template v-if="formMode === 'create'">
          <el-form-item label="IP 限制">
            <el-radio-group v-model="form.ipMode">
              <el-radio value="all">不限制</el-radio>
              <el-radio value="whitelist">仅白名单</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="form.ipMode === 'whitelist'" label="IP 列表" required>
            <el-input
              v-model="form.ipText"
              type="textarea"
              :rows="4"
              placeholder="每行一个，支持：&#10;203.0.113.10&#10;10.0.0.*&#10;10.0.0.1-10.0.0.99"
            />
            <div class="api-bind-tip">最多 50 条；启用白名单后，仅列表内 IP 可调用该 Token</div>
          </el-form-item>
        </template>
      </el-form>
      <div v-if="formMode === 'create'" class="create-tip">
        创建后 Token 仅完整显示一次，请立即复制保存。
      </div>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">
          {{ formMode === 'create' ? '创建' : '保存' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="ipVisible" title="IP 白名单" width="520px" destroy-on-close>
      <el-form :model="ipForm" label-width="90px">
        <el-form-item label="Token名称">
          <span>{{ ipForm.name }}</span>
        </el-form-item>
        <el-form-item label="IP 限制" required>
          <el-radio-group v-model="ipForm.ipMode">
            <el-radio value="all">不限制</el-radio>
            <el-radio value="whitelist">仅白名单</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="ipForm.ipMode === 'whitelist'" label="IP 列表" required>
          <el-input
            v-model="ipForm.ipText"
            type="textarea"
            :rows="5"
            placeholder="每行一个，支持：&#10;203.0.113.10&#10;10.0.0.*&#10;10.0.0.1-10.0.0.99"
          />
          <div class="api-bind-tip">最多 50 条；保存后立即生效，鉴权走 Redis 快照</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="ipVisible = false">取消</el-button>
        <el-button type="primary" :loading="ipSaving" @click="onSubmitIp">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="successVisible" title="创建成功" width="480px" :close-on-click-modal="false">
      <div class="new-key-tip">
        <el-icon color="#10b981" :size="40"><CircleCheckFilled /></el-icon>
        <p>请立即复制保存，关闭后将无法再次查看明文</p>
      </div>
      <div class="new-key-box">
        <code>{{ newKey }}</code>
        <el-button type="primary" size="small" @click="copyKey(newKey)">复制</el-button>
      </div>
      <template #footer>
        <el-button type="primary" @click="successVisible = false">我已保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { CircleCheckFilled, InfoFilled, Key, Plus } from '@element-plus/icons-vue'
import {
  getApiKeys,
  createApiKey,
  updateApiKeyStatus,
  deleteApiKey,
  getTokenAllowedApis,
  updateTokenApis,
  updateTokenIpWhitelist
} from '@/api/console'
import { rememberTokenPlain } from '@/utils/tokenPlain'
import TableSkeleton from '@/components/skeleton/TableSkeleton.vue'

export default {
  name: 'ConsoleToken',
  components: { TableSkeleton, CircleCheckFilled, InfoFilled, Key, Plus },
  data() {
    return {
      keys: [],
      loading: true,
      formVisible: false,
      formMode: 'create',
      form: {
        keyId: null,
        name: '',
        apiScope: 'all',
        apiCodes: [],
        ipMode: 'all',
        ipText: ''
      },
      saving: false,
      ipVisible: false,
      ipForm: {
        keyId: null,
        name: '',
        ipMode: 'all',
        ipText: ''
      },
      ipSaving: false,
      successVisible: false,
      newKey: '',
      statusLoading: {},
      allowedApis: [],
      allowedTip: '',
      allowedLoading: false,
      apiKeyword: ''
    }
  },
  computed: {
    filteredApis() {
      const kw = (this.apiKeyword || '').trim().toLowerCase()
      if (!kw) return this.allowedApis
      return this.allowedApis.filter(api => {
        const name = (api.apiName || '').toLowerCase()
        const code = (api.apiCode || '').toLowerCase()
        return name.includes(kw) || code.includes(kw)
      })
    }
  },
  methods: {
    isEnabled(row) {
      return String(row.status) === '0'
    },
    chargeText(type) {
      if (type === 'vip') return '会员'
      if (type === 'payg') return '计次'
      return '免费'
    },
    mapRow(row) {
      return {
        id: row.keyId,
        name: row.name || '-',
        keyMask: row.keyMask || '',
        createTime: row.createTime || '-',
        lastUsed: row.lastUsedTime || '暂无调用',
        status: String(row.status ?? '0'),
        boundApiSummary: row.boundApiSummary || (row.apiScope === 'custom' ? '指定接口' : '套餐内全部'),
        apiScope: row.apiScope || 'all',
        apiCodes: Array.isArray(row.apiCodes) ? [...row.apiCodes] : [],
        ipMode: row.ipMode === 'whitelist' ? 'whitelist' : 'all',
        ips: Array.isArray(row.ips) ? [...row.ips] : [],
        ipSummary: row.ipSummary || (row.ipMode === 'whitelist' ? '白名单' : '不限制')
      }
    },
    parseIpText(text) {
      return String(text || '')
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    },
    formatIpText(ips) {
      return (ips || []).join('\n')
    },
    async fetchKeys() {
      this.loading = true
      try {
        const res = await getApiKeys()
        this.keys = (res.data || []).map(this.mapRow)
      } catch (e) {
        this.keys = []
      } finally {
        this.loading = false
      }
    },
    async fetchAllowedApis() {
      this.allowedLoading = true
      try {
        const res = await getTokenAllowedApis()
        const data = res.data || {}
        this.allowedApis = data.apis || []
        this.allowedTip = data.tip || ''
      } catch (e) {
        this.allowedApis = []
        this.allowedTip = ''
      } finally {
        this.allowedLoading = false
      }
    },
    copyKey(key) {
      if (!key) {
        this.$message.warning('暂无可复制的 Token')
        return
      }
      navigator.clipboard.writeText(key).then(() => {
        this.$message.success('Token 已复制到剪贴板')
      }).catch(() => {
        this.$message.error('复制失败，请手动复制')
      })
    },
    async openCreate() {
      this.formMode = 'create'
      this.form = { keyId: null, name: '', apiScope: 'all', apiCodes: [], ipMode: 'all', ipText: '' }
      this.apiKeyword = ''
      this.formVisible = true
      this.fetchAllowedApis()
    },
    async openBind(row) {
      this.formMode = 'bind'
      this.form = {
        keyId: row.id,
        name: row.name,
        apiScope: row.apiScope === 'custom' ? 'custom' : 'all',
        apiCodes: [...(row.apiCodes || [])],
        ipMode: row.ipMode === 'whitelist' ? 'whitelist' : 'all',
        ipText: this.formatIpText(row.ips)
      }
      this.apiKeyword = ''
      this.formVisible = true
      this.fetchAllowedApis()
    },
    openIp(row) {
      this.ipForm = {
        keyId: row.id,
        name: row.name,
        ipMode: row.ipMode === 'whitelist' ? 'whitelist' : 'all',
        ipText: this.formatIpText(row.ips)
      }
      this.ipVisible = true
    },
    validateForm() {
      if (this.formMode === 'create' && !this.form.name.trim()) {
        this.$message.warning('请输入 Token 名称')
        return false
      }
      if (this.form.apiScope === 'custom' && (!this.form.apiCodes || this.form.apiCodes.length === 0)) {
        this.$message.warning('请至少选择一个接口')
        return false
      }
      if (this.formMode === 'create' && this.form.ipMode === 'whitelist' && this.parseIpText(this.form.ipText).length === 0) {
        this.$message.warning('请至少填写一个 IP')
        return false
      }
      return true
    },
    buildPayload() {
      const payload = { apiScope: this.form.apiScope }
      if (this.form.apiScope === 'custom') {
        payload.apiCodes = [...this.form.apiCodes]
      } else {
        payload.apiCodes = []
      }
      if (this.formMode === 'create') {
        payload.ipMode = this.form.ipMode === 'whitelist' ? 'whitelist' : 'all'
        payload.ips = payload.ipMode === 'whitelist' ? this.parseIpText(this.form.ipText) : []
      }
      return payload
    },
    async onSubmit() {
      if (!this.validateForm()) return
      this.saving = true
      try {
        if (this.formMode === 'create') {
          const res = await createApiKey({
            name: this.form.name.trim(),
            ...this.buildPayload()
          })
          const data = res.data || {}
          this.newKey = data.plainKey || data.accessKey || ''
          if (data.keyId && this.newKey) {
            rememberTokenPlain(data.keyId, this.newKey)
          }
          this.formVisible = false
          this.successVisible = true
        } else {
          await updateTokenApis(this.form.keyId, this.buildPayload())
          this.$message.success('绑定已更新')
          this.formVisible = false
        }
        this.fetchKeys()
      } catch (e) {
        // 错误已由 request 拦截器提示
      } finally {
        this.saving = false
      }
    },
    async onSubmitIp() {
      if (this.ipForm.ipMode === 'whitelist' && this.parseIpText(this.ipForm.ipText).length === 0) {
        this.$message.warning('请至少填写一个 IP')
        return
      }
      this.ipSaving = true
      try {
        const ipMode = this.ipForm.ipMode === 'whitelist' ? 'whitelist' : 'all'
        await updateTokenIpWhitelist(this.ipForm.keyId, {
          ipMode,
          ips: ipMode === 'whitelist' ? this.parseIpText(this.ipForm.ipText) : []
        })
        this.$message.success('IP 白名单已更新')
        this.ipVisible = false
        this.fetchKeys()
      } catch (e) {
        // 错误已由 request 拦截器提示
      } finally {
        this.ipSaving = false
      }
    },
    async onStatusSwitch(row, enabled) {
      const target = enabled ? '0' : '1'
      if (String(row.status) === target) return
      this.statusLoading = { ...this.statusLoading, [row.id]: true }
      try {
        await updateApiKeyStatus(row.id, target)
        row.status = target
        this.$message.success(target === '0' ? 'Token 已启用' : 'Token 已停用')
      } catch (e) {
        // 失败时不改 status，开关会回弹
      } finally {
        this.statusLoading = { ...this.statusLoading, [row.id]: false }
      }
    },
    onDelete(row) {
      this.$confirm(`确定删除 Token「${row.name}」吗？删除后使用该 Token 的请求将立即失败。`, '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await deleteApiKey(row.id)
          this.$message.success('Token 已删除')
          this.fetchKeys()
        } catch (e) {
          // 错误已由 request 拦截器提示
        }
      }).catch(() => {})
    }
  },
  mounted() {
    this.fetchKeys()
  }
}
</script>

<style scoped lang="scss">

.tip-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 22px;
  margin-bottom: 16px;
  background:
    radial-gradient(120% 160% at 0% 0%, rgba(58, 122, 254, 0.08), transparent 55%),
    $bg-card;
}

.tip-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.tip-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.tip-text {
  min-width: 0;

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

  code {
    background: rgba(58, 122, 254, 0.08);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;
    color: $primary-color;
  }
}

.btn-icon {
  margin-right: 4px;
}

.token-list-card {
  padding: 16px 20px 12px;
}

.list-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 12px;
}

.list-title {
  font-size: 15px;
  font-weight: 600;
  color: $text-primary;
}

.list-count {
  font-size: 13px;
  color: $text-secondary;

  b {
    color: $primary-color;
    font-weight: 600;
  }
}

.token-table {
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

.key-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: $text-primary;
}

.key-mask {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: $text-regular;
}

.status-switch {
  --el-switch-on-color: #{$primary-color};
  --el-switch-off-color: #d1d5db;
  height: 22px;

  :deep(.el-switch__core) {
    height: 20px;
    min-width: 40px;
    border-radius: 12px;
    border: none;

    .el-switch__action {
      width: 16px;
      height: 16px;
    }
  }

  &.is-checked :deep(.el-switch__core .el-switch__action) {
    left: calc(100% - 18px);
  }
}

.row-actions {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  gap: 0;

  :deep(.el-button) {
    margin: 0;
    padding: 0 6px;
  }
}

.create-tip {
  font-size: 13px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  padding: 10px 14px;
  border-radius: 8px;
}

.api-bind-box {
  width: 100%;
}

.api-bind-tip {
  font-size: 12px;
  color: $text-secondary;
  margin-bottom: 8px;
  line-height: 1.5;
}

.api-check-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 280px;
  overflow: auto;
  padding: 8px 10px;
  background: $bg-page;
  border-radius: 8px;
}

.api-check-item {
  height: auto;
  margin-right: 0;
  padding: 6px 0;
  align-items: flex-start;
  white-space: normal;

  :deep(.el-checkbox__label) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    line-height: 1.4;
  }
}

.api-check-name {
  font-size: 13px;
  color: $text-primary;
}

.api-check-meta {
  font-size: 12px;
  color: $text-placeholder;
}

.new-key-tip {
  text-align: center;
  margin-bottom: 14px;

  p {
    font-size: 13px;
    color: $text-secondary;
    margin: 8px 0 0;
  }
}

.new-key-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #0f172a;
  padding: 12px 16px;
  border-radius: 8px;

  code {
    flex: 1;
    color: #7dd3fc;
    font-size: 13px;
    word-break: break-all;
  }
}
</style>
