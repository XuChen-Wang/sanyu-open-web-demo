<template>
  <el-drawer
    :model-value="modelValue"
    class="api-debug-drawer"
    size="1080px"
    append-to-body
    destroy-on-close
    @update:model-value="onVisibleChange"
  >
    <template #header>
      <div class="drawer-title">在线调试</div>
    </template>

    <div class="debug-shell">
      <!-- 顶栏 -->
      <section class="debug-top">
        <div class="debug-bar__url">
          <span class="method-badge" :class="methodClass">{{ methodText }}</span>
          <code>{{ displayUrl || '未配置路径' }}</code>
        </div>
        <div class="debug-bar__actions">
          <el-button @click="initForm">重置参数</el-button>
          <el-button type="primary" class="send-btn" :loading="loading" :disabled="!canSend" @click="handleSend">
            发送请求
          </el-button>
        </div>
      </section>

      <div class="debug-main">
        <!-- 左：鉴权 + 参数 -->
        <div class="debug-left">
          <section class="debug-section">
            <h4 class="debug-section__title">鉴权</h4>
            <template v-if="!isLogin">
              <el-alert type="warning" :closable="false" show-icon title="请先登录后再调试" />
              <el-button type="primary" class="login-btn" @click="onLogin">去登录</el-button>
            </template>
            <template v-else>
              <el-input
                v-model="apiKey"
                type="password"
                show-password
                clearable
                class="param-input"
                placeholder="粘贴完整 Token（X-Api-Key）"
                @change="persistApiKey"
              />
              <p class="token-paste-tip">
                完整 Token 仅创建时展示一次，请粘贴本地保存的密钥。
                <router-link to="/console/token" class="link">去创建</router-link>
              </p>
            </template>
          </section>

          <section class="debug-section debug-section--params">
            <h4 class="debug-section__title">请求参数</h4>

            <div v-if="debugParams.length" class="debug-param-grid">
              <div
                v-for="param in debugParams"
                :key="param.name"
                class="debug-param-card"
                :class="{ 'debug-param-card--wide': isWideParam(param) }"
              >
                <div class="debug-param-card__header">
                  <span class="param-label">{{ param.name }}</span>
                  <span v-if="param.required" class="param-badge param-badge--required">必填</span>
                  <span v-if="param.type" class="param-badge param-badge--type">{{ param.type }}</span>
                </div>
                <p v-if="param.desc" class="param-desc">{{ param.desc }}</p>
                <div class="debug-param-card__control">
                  <div v-if="isFileType(param.type)" class="file-control">
                    <input
                      :key="`${param.name}-${fileInputVersion}`"
                      type="file"
                      :multiple="isMultipleFileType(param)"
                      class="native-file-input"
                      @change="onFileChange(param, $event)"
                    />
                    <div v-if="selectedFileNames(param.name)" class="selected-files">
                      已选择：{{ selectedFileNames(param.name) }}
                    </div>
                  </div>
                  <el-select
                    v-else-if="enumOptions(param).length"
                    v-model="debugForm[param.name]"
                    clearable
                    filterable
                    class="param-input"
                    :placeholder="placeholderOf(param)"
                  >
                    <el-option
                      v-for="opt in enumOptions(param)"
                      :key="String(opt.value)"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                  <el-input-number
                    v-else-if="isNumberType(param.type)"
                    v-model="debugForm[param.name]"
                    controls-position="right"
                    class="param-input param-input--number"
                    :placeholder="placeholderOf(param)"
                  />
                  <el-switch
                    v-else-if="isBooleanType(param.type)"
                    v-model="debugForm[param.name]"
                  />
                  <el-input
                    v-else-if="isLongTextParam(param)"
                    v-model="debugForm[param.name]"
                    type="textarea"
                    :rows="3"
                    class="param-input"
                    :placeholder="placeholderOf(param)"
                  />
                  <el-input
                    v-else
                    v-model="debugForm[param.name]"
                    clearable
                    class="param-input"
                    :placeholder="placeholderOf(param)"
                  />
                </div>
              </div>
            </div>

            <el-form v-else-if="isBodyMethod" label-position="top" class="debug-form">
              <el-form-item label="请求体 JSON">
                <el-input v-model="debugBodyJson" type="textarea" :rows="10" placeholder="{}" />
              </el-form-item>
            </el-form>

            <el-empty v-else description="文档未配置请求参数" :image-size="64" class="debug-empty" />
          </section>
        </div>

        <!-- 右：响应独占 -->
        <section class="debug-right">
          <div class="debug-right__head">
            <h4 class="debug-section__title">响应结果</h4>
            <el-button
              v-if="debugResult"
              size="small"
              text
              type="primary"
              @click="copyResult"
            >
              复制
            </el-button>
          </div>
          <div class="debug-result-panel" v-loading="loading" element-loading-text="请求中...">
            <div v-if="debugImageSrc" class="debug-image">
              <div class="debug-image__title">图片预览</div>
              <img
                :src="debugImageSrc"
                alt="preview"
                class="debug-image__img"
                referrerpolicy="no-referrer"
              />
              <el-button type="primary" plain size="small" @click="downloadImage">下载图片</el-button>
            </div>
            <pre v-if="debugResult" class="debug-code">{{ debugResult }}</pre>
            <div v-else-if="!loading" class="debug-result-placeholder">
              点击「发送请求」查看响应
            </div>
          </div>
        </section>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { debugOpenApi } from '@/api/openDebug'
import { getTokenPlainMap } from '@/utils/tokenPlain'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'

const DEBUG_API_KEY = 'portal-debug-api-key'

function asArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }
  return []
}

function prettyJson(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  try {
    return JSON.stringify(JSON.parse(value), null, 2)
  } catch (e) {
    return String(value)
  }
}

function safeParseObject(value) {
  if (!value) return null
  if (typeof value === 'object' && !Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
    } catch (e) {
      return null
    }
  }
  return null
}

function createDebugIdempotencyKey() {
  const uuid = window.crypto?.randomUUID?.()
  return uuid ? `debug-${uuid}` : `debug-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default {
  name: 'ApiDebugPanel',
  props: {
    modelValue: { type: Boolean, default: false },
    api: { type: Object, default: null },
    apiBaseUrl: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      userStore: useUserStore(),
      appStore: useAppStore(),
      debugForm: {},
      debugBodyJson: '{}',
      debugFiles: {},
      fileInputVersion: 0,
      apiKey: '',
      loading: false,
      debugResult: '',
      debugImageSrc: ''
    }
  },
  computed: {
    isLogin() {
      return this.userStore.isLogin
    },
    methodText() {
      return (this.api?.httpMethod || 'GET').toUpperCase()
    },
    methodClass() {
      return this.methodText.toLowerCase()
    },
    apiPath() {
      return this.api?.apiPath || ''
    },
    displayUrl() {
      const base = (this.apiBaseUrl || '').replace(/\/$/, '')
      const path = this.apiPath
      if (!path) return base || ''
      if (/^https?:\/\//i.test(path)) return path
      return base ? `${base}${path.startsWith('/') ? path : '/' + path}` : path
    },
    debugParams() {
      return asArray(this.api?.requestSchema).filter((item) => item && item.name)
    },
    isMultipartRequest() {
      return this.debugParams.some((param) => this.isFileType(param.type) || this.isFormLocation(param.location || param.in))
    },
    isBodyMethod() {
      return ['POST', 'PUT', 'PATCH'].includes(this.methodText)
    },
    canSend() {
      return !!(this.apiPath && this.apiBaseUrl && this.isLogin && String(this.apiKey || '').trim())
    }
  },
  watch: {
    modelValue(val) {
      if (val) {
        this.initForm()
        if (this.isLogin) this.restoreApiKey()
      }
    },
    api() {
      if (this.modelValue) this.initForm()
    },
    isLogin(val) {
      if (val && this.modelValue) this.restoreApiKey()
      else if (!val) this.apiKey = ''
    }
  },
  methods: {
    onVisibleChange(val) {
      this.$emit('update:modelValue', val)
    },
    onLogin() {
      this.appStore.openLogin()
    },
    restoreApiKey() {
      try {
        const saved = sessionStorage.getItem(DEBUG_API_KEY)
        if (saved) {
          this.apiKey = saved
          return
        }
      } catch (e) { /* ignore */ }
      const map = getTokenPlainMap()
      const values = Object.values(map || {})
      if (values.length) this.apiKey = String(values[values.length - 1] || '')
    },
    persistApiKey() {
      const key = String(this.apiKey || '').trim()
      this.apiKey = key
      try {
        if (key) sessionStorage.setItem(DEBUG_API_KEY, key)
        else sessionStorage.removeItem(DEBUG_API_KEY)
      } catch (e) { /* ignore */ }
    },
    placeholderOf(param) {
      if (param.example != null && param.example !== '') return String(param.example)
      return ''
    },
    enumOptions(param) {
      const raw = param.enum || param.options || param.enums
      if (Array.isArray(raw) && raw.length) {
        return raw.map((item) => {
          if (item != null && typeof item === 'object') {
            const value = item.value != null ? item.value : item.code
            const label = item.label || item.name || item.desc || String(value)
            return { value, label }
          }
          return { value: item, label: String(item) }
        }).filter((o) => o.value !== undefined && o.value !== null)
      }
      if (this.api?.apiCode === 'pdf.export' && String(param?.name || '').toLowerCase() === 'targettype') {
        return [
          { value: 'png', label: 'png - PNG 图片' },
          { value: 'jpg', label: 'jpg - JPG 图片' },
          { value: 'txt', label: 'txt - TXT 文本' },
          { value: 'md', label: 'md - Markdown 文档' },
          { value: 'docx', label: 'docx - Word 文档' },
          { value: 'pptx', label: 'pptx - PowerPoint 文档' }
        ]
      }
      return []
    },
    isWideParam(param) {
      return this.isLongTextParam(param) || this.enumOptions(param).length > 6
    },
    isOptionalPdfPageNumbers(param) {
      return String(this.api?.apiCode || '').startsWith('pdf.')
        && String(param?.name || '') === 'pageNumbers'
        && !param?.required
    },
    isIdempotencyKeyParam(param) {
      return String(param?.name || '').toLowerCase() === 'idempotencykey'
    },
    initForm() {
      const next = {}
      const example = safeParseObject(this.api?.requestExample)
      this.debugParams.forEach((param) => {
        const name = param.name
        if (this.isIdempotencyKeyParam(param)) {
          // 调试请求不能长期复用文档示例键；同一次表单重试仍保持该值不变。
          next[name] = createDebugIdempotencyKey()
        } else if (this.isOptionalPdfPageNumbers(param)) {
          // 页码范围取决于实际上传文件；可选时默认转换全部，示例仅作为占位提示。
          next[name] = ''
        } else if (example && example[name] !== undefined) {
          next[name] = example[name]
        } else if (param.example !== undefined && param.example !== null && param.example !== '') {
          next[name] = param.example
        } else if (this.isBooleanType(param.type)) {
          next[name] = false
        } else if (this.isNumberType(param.type)) {
          next[name] = undefined
        } else {
          next[name] = ''
        }
      })
      this.debugForm = next
      this.debugFiles = {}
      this.fileInputVersion += 1
      this.debugBodyJson = prettyJson(this.api?.requestExample) || '{}'
      this.debugResult = ''
      this.debugImageSrc = ''
    },
    buildPayload() {
      const payload = {}
      this.debugParams.forEach((param) => {
        if (this.isFileType(param.type)) return
        const val = this.debugForm[param.name]
        if (val === undefined || val === null || val === '') return
        payload[param.name] = val
      })
      return payload
    },
    buildFormData() {
      const formData = new FormData()
      this.debugParams.forEach((param) => {
        if (this.isFileType(param.type)) {
          ;(this.debugFiles[param.name] || []).forEach((file) => formData.append(param.name, file))
          return
        }
        const val = this.debugForm[param.name]
        if (val === undefined || val === null || val === '') return
        formData.append(param.name, typeof val === 'object' ? JSON.stringify(val) : String(val))
      })
      return formData
    },
    parseBodyJson() {
      const text = (this.debugBodyJson || '').trim()
      if (!text) return {}
      try {
        return JSON.parse(text)
      } catch (e) {
        throw new Error('请求体不是合法 JSON')
      }
    },
    async handleSend() {
      if (!this.isLogin) {
        this.$message.warning('请先登录')
        this.onLogin()
        return
      }
      if (!this.apiBaseUrl) {
        this.$message.warning('未配置开放 API 根地址')
        return
      }
      if (!this.apiPath) {
        this.$message.warning('缺少接口路径')
        return
      }
      if (!this.apiKey) {
        this.$message.warning('请先粘贴完整 Token')
        return
      }
      for (const param of this.debugParams) {
        const val = this.isFileType(param.type) ? (this.debugFiles[param.name] || []) : this.debugForm[param.name]
        if (param.required && (val === undefined || val === null || val === '' || (Array.isArray(val) && !val.length))) {
          this.$message.warning(`请填写必填参数：${param.name}`)
          return
        }
      }

      this.loading = true
      try {
        let params
        let data
        if (this.methodText === 'GET' || this.methodText === 'DELETE') {
          params = this.buildPayload()
        } else if (this.isMultipartRequest) {
          data = this.buildFormData()
        } else if (this.debugParams.length) {
          data = this.buildPayload()
        } else {
          data = this.parseBodyJson()
        }

        const res = await debugOpenApi({
          baseUrl: this.apiBaseUrl,
          path: this.apiPath,
          method: this.methodText,
          params,
          data,
          apiKey: this.apiKey
        })
        this.debugImageSrc = this.extractImage(res)
        this.debugResult = this.formatSuccess(res)
        this.$message.success('请求成功')
      } catch (err) {
        this.debugImageSrc = ''
        this.debugResult = this.formatError(err)
      } finally {
        this.loading = false
      }
    },
    extractImage(res) {
      const data = res?.data
      if (!data) return ''
      if (data.base64) {
        const mime = data.mimeType || 'image/png'
        return `data:${mime};base64,${data.base64}`
      }
      const url = data.cover || data.imageUrl || data.qrcodeUrl || data.url
      if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
        if (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(url) || /hdslb\.com|bilibili\.com/i.test(url)) {
          return url
        }
      }
      return ''
    },
    formatSuccess(res) {
      if (!res || typeof res !== 'object') return JSON.stringify(res, null, 2)
      const cloned = JSON.parse(JSON.stringify(res))
      if (cloned.data && typeof cloned.data.base64 === 'string' && cloned.data.base64.length > 64) {
        const bytes = cloned.data.byteLength != null ? cloned.data.byteLength : Math.floor((cloned.data.base64.length * 3) / 4)
        cloned.data.base64 = cloned.data.base64.slice(0, 24) + `...(省略，共约 ${bytes} 字节，见上方预览)`
      }
      return JSON.stringify(cloned, null, 2)
    },
    formatError(err) {
      if (typeof err === 'string') return err
      if (err?.response?.data) return JSON.stringify(err.response.data, null, 2)
      if (err?.message) return JSON.stringify({ message: err.message }, null, 2)
      try {
        return JSON.stringify(err, null, 2)
      } catch (e) {
        return String(err)
      }
    },
    copyResult() {
      if (!this.debugResult) return
      navigator.clipboard.writeText(this.debugResult).then(() => {
        this.$message.success('已复制')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },
    async downloadImage() {
      if (!this.debugImageSrc) {
        this.$message.warning('暂无可下载图片')
        return
      }
      try {
        let href = this.debugImageSrc
        let filename = 'open-debug-image.png'
        if (/^https?:\/\//i.test(href)) {
          const resp = await fetch(href, { referrerPolicy: 'no-referrer' })
          if (!resp.ok) throw new Error('HTTP ' + resp.status)
          const blob = await resp.blob()
          const mime = blob.type || 'image/jpeg'
          const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('gif') ? 'gif' : 'jpg'
          filename = `open-debug-image.${ext}`
          href = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = href
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(href)
          return
        }
        const link = document.createElement('a')
        const mimeMatch = String(href).match(/^data:([^;]+);/)
        const mime = mimeMatch?.[1] || 'image/png'
        const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg'
          : mime.includes('webp') ? 'webp'
            : mime.includes('gif') ? 'gif'
              : 'png'
        link.href = href
        link.download = `open-debug-image.${ext}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (e) {
        this.$message.error('下载失败：' + (e?.message || '未知错误'))
      }
    },
    isNumberType(type) {
      const t = String(type || '').toLowerCase()
      return ['number', 'int', 'integer', 'long', 'float', 'double'].includes(t)
    },
    isFileType(type) {
      const value = String(type || '').toLowerCase().replace(/\s/g, '')
      return value === 'file' || value === 'file[]' || value === 'files' || value === 'multipartfile' || value === 'multipartfile[]'
    },
    isFormLocation(location) {
      return ['form', 'formdata', 'multipart', 'multipart/form-data'].includes(String(location || '').toLowerCase())
    },
    isMultipleFileType(param) {
      return String(param?.type || '').includes('[]') || param?.name === 'files'
    },
    onFileChange(param, event) {
      this.debugFiles = {
        ...this.debugFiles,
        [param.name]: Array.from(event?.target?.files || [])
      }
    },
    selectedFileNames(name) {
      return (this.debugFiles[name] || []).map((file) => file.name).join('、')
    },
    isBooleanType(type) {
      const t = String(type || '').toLowerCase()
      return t === 'boolean' || t === 'bool'
    },
    isLongTextParam(param) {
      const name = String(param.name || '').toLowerCase()
      const t = String(param.type || '').toLowerCase()
      return t === 'text' || t === 'textarea' || name.includes('base64') || name === 'text' || name === 'content'
    }
  }
}
</script>

<style scoped lang="scss">

.drawer-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}

.debug-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 100%;
  min-height: 0;
}

.debug-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  flex-shrink: 0;
}

.debug-bar__url {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 8px;

  code {
    flex: 1;
    min-width: 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    color: #4e5969;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.debug-bar__actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.send-btn {
  min-width: 96px;
}

.method-badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  color: #fff;
  background: #6b7280;

  &.get { background: #10b981; }
  &.post { background: #3a7afe; }
  &.put { background: #f59e0b; }
  &.delete { background: #ef4444; }
}

.debug-main {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 46%) minmax(0, 1fr);
  gap: 14px;
}

.debug-left {
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
}

.debug-section {
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  flex-shrink: 0;

  &--params {
    flex: 1;
    min-height: 0;
    overflow: auto;
    overscroll-behavior: contain;
  }
}

.debug-section__title {
  margin: 0 0 14px;
  padding-left: 10px;
  border-left: 3px solid $primary-color;
  font-size: 15px;
  font-weight: 600;
  color: #1d2129;
  line-height: 1.4;
}

.debug-param-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.debug-param-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: #f7f8fa;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  min-width: 0;

  &--wide {
    grid-column: 1 / -1;
  }
}

.debug-param-card__header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.debug-param-card__control {
  margin-top: 2px;
}

.param-label {
  font-weight: 600;
  font-size: 14px;
  color: #1d2129;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.param-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 22px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1;

  &--required {
    color: #f53f3f;
    background: #ffece8;
  }

  &--type {
    color: #86909c;
    background: #fff;
    border: 1px solid #e5e6eb;
  }
}

.param-desc {
  margin: 0;
  color: #86909c;
  font-size: 12px;
  line-height: 1.6;
}

.param-input {
  width: 100%;
}

.param-input--number {
  max-width: 200px;
}

.file-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.native-file-input {
  width: 100%;
  color: #4e5969;
  font-size: 13px;
}

.selected-files {
  color: #86909c;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}

.debug-form {
  margin-bottom: 0;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    color: #4e5969;
    font-size: 13px;
    padding-bottom: 6px;
  }
}

.login-btn {
  margin-top: 12px;
}

.token-paste-tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;

  .link {
    color: $primary-color;
    margin-left: 4px;
  }
}

.debug-empty {
  margin: 24px 0;
}

.debug-right {
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
}

.debug-right__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: 12px;

  .debug-section__title {
    margin: 0;
  }
}

.debug-result-panel {
  flex: 1;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.debug-result-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 13px;
  background: #f7f8fa;
  border: 1px solid #eef0f4;
  border-radius: 8px;
}

.debug-code {
  flex: 1;
  min-height: 0;
  margin: 0;
  padding: 14px 16px;
  background: #f7f8fa;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  overflow: auto;
  overscroll-behavior: contain;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  color: #4e5969;
  white-space: pre-wrap;
  word-break: break-word;
}

.debug-image {
  flex-shrink: 0;
  padding: 14px;
  background: #f7f8fa;
  border: 1px solid #eef0f4;
  border-radius: 8px;

  &__title {
    margin-bottom: 10px;
    font-weight: 600;
    color: #1d2129;
    font-size: 13px;
  }

  &__img {
    display: block;
    max-width: 100%;
    max-height: 200px;
    margin: 0 auto 12px;
    background: #fff;
    border-radius: 8px;
  }
}

@media (max-width: 960px) {
  .debug-main {
    grid-template-columns: 1fr;
  }

  .debug-left,
  .debug-right {
    max-height: none;
  }

  .debug-section--params {
    overflow: visible;
  }

  .debug-result-panel {
    min-height: 280px;
  }

  .debug-param-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<style lang="scss">
.api-debug-drawer.el-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 16px 20px 8px;
  }

  .el-drawer__body {
    height: calc(100% - 56px);
    padding: 8px 20px 20px;
    background: #f5f7fa;
    overflow: hidden;
    box-sizing: border-box;
  }
}
</style>
