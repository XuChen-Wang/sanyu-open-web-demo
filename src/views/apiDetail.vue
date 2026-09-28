<template>
  <div class="detail-page">
    <div class="breadcrumb-wrap page-container">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/explore' }">探索</el-breadcrumb-item>
        <el-breadcrumb-item>{{ api?.apiName || '接口文档' }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <Transition name="skeleton-reveal" mode="out-in">
      <ApiDetailSkeleton v-if="loading" key="detail-sk" />
      <div v-else-if="api" key="detail-content" class="detail-main page-container">
      <!-- 头部：是什么 + 贵不贵 + 操作 -->
      <div class="detail-head card">
        <div class="head-icon">
          <img v-if="iconUrl" :src="iconUrl" alt="" />
          <img v-else :src="defaultIcon" alt="" />
        </div>
        <div class="head-info">
          <div class="head-title">
            <h1>{{ api.apiName }}</h1>
            <span class="price-tag" :class="'tag-' + tagClass">{{ chargeText }}</span>
            <span v-if="api.chargeType === 'payg' && api.unitPrice != null" class="price-value">
              {{ api.unitPrice }} 元/次
            </span>
          </div>
          <p class="head-desc">{{ api.summary || '暂无简介' }}</p>
          <div class="head-meta">
            <span v-if="api.categoryName" class="meta-chip">{{ api.categoryName }}</span>
            <span class="meta-chip">{{ methodText }}</span>
            <span class="meta-chip">日限 {{ limitText(api.dailyLimit) }}</span>
            <span class="meta-chip">QPS {{ limitText(api.qpsLimit) }}</span>
            <span v-if="api.docVersion" class="meta-chip">文档 {{ api.docVersion }}</span>
          </div>
        </div>
        <div class="head-actions">
          <el-button type="primary" class="btn-debug" @click="openDebug">
            在线调试
          </el-button>
          <button type="button" class="btn-token-link" @click="onPrimaryAction">
            {{ primaryActionText }}
          </button>
          <button
            v-if="api.chargeType === 'vip'"
            type="button"
            class="btn-token-link"
            @click="$router.push('/vip')"
          >
            开通会员
          </button>
        </div>
      </div>

      <!-- 同产品多接口切换（有 productCode 且兄弟 ≥2 时展示） -->
      <div v-if="productApis.length > 1" class="product-apis card">
        <div class="product-apis-label">接口列表</div>
        <div class="product-apis-list">
          <button
            v-for="item in productApis"
            :key="item.apiCode"
            type="button"
            class="product-api-item"
            :class="{ active: item.apiCode === api.apiCode }"
            @click="switchProductApi(item.apiCode)"
          >
            {{ item.apiName }}
          </button>
        </div>
      </div>

      <!-- 请求地址 -->
      <div class="section card">
        <div class="section-head">
          <h3>请求地址</h3>
        </div>
        <div class="req-url">
          <span class="method-badge" :class="methodClass">{{ methodText }}</span>
          <code>{{ fullUrl }}</code>
          <el-button size="small" text type="primary" @click="copyText(fullUrl)">复制</el-button>
        </div>
        <div class="auth-tip">
          鉴权：请求头携带
          <code>X-Api-Key: &lt;Token&gt;</code>
          ，在
          <router-link to="/console/token" class="link">控制台 · Token 管理</router-link>
          创建。调用失败常见原因见
          <a class="link" href="#" @click.prevent="scrollToSection('errors')">错误码 · 平台公共错误码</a>。
        </div>
      </div>

      <!-- 文档：长页 + 右侧电梯 -->
      <div class="section card doc-card">
        <div class="doc-layout">
          <div class="doc-body">
            <section id="doc-desc" class="doc-section">
              <h3 class="doc-section-title">接口说明</h3>
              <div v-if="api.description" class="doc-html" v-html="api.description"></div>
              <el-empty v-else description="暂无详细说明，可参考上方简介与参数文档" :image-size="72" />
            </section>

            <section id="doc-request" class="doc-section">
              <h3 class="doc-section-title">请求参数</h3>
              <el-table v-if="requestParams.length" :data="requestParams" border stripe class="param-table">
                <el-table-column prop="name" label="参数名" min-width="140" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag size="small" type="info">{{ row.type || 'string' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="必填" width="80" align="center">
                  <template #default="{ row }">
                    <span :class="row.required ? 'req-yes' : 'req-no'">{{ row.required ? '是' : '否' }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="locationText" label="位置" width="100" />
                <el-table-column prop="desc" label="说明" min-width="180" />
                <el-table-column prop="example" label="示例" min-width="120">
                  <template #default="{ row }">
                    <code v-if="row.example !== '' && row.example != null">{{ formatCell(row.example) }}</code>
                    <span v-else class="muted">—</span>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="该接口无请求参数，或文档未配置" :image-size="72" />
              <el-alert
                v-if="isMultipartRequest"
                class="doc-alert"
                type="info"
                :closable="false"
                show-icon
                title="该接口使用 multipart/form-data；请勿手工设置 Content-Type，浏览器或 HTTP 客户端会自动补充 boundary。"
              />
            </section>

            <section id="doc-response" class="doc-section">
              <h3 class="doc-section-title">返回说明</h3>
              <p v-if="responseHasNested" class="response-schema-tip">点击左侧箭头可展开或收起下级字段</p>
              <el-table
                v-if="responseFieldTree.length"
                :data="responseFieldTree"
                row-key="fullField"
                border
                :indent="18"
                :expand-row-keys="responseExpandedKeys"
                :tree-props="{ children: 'children' }"
                class="param-table response-schema-table"
                @expand-change="onResponseExpand"
              >
                <el-table-column prop="label" label="字段" min-width="220" />
                <el-table-column prop="type" label="类型" width="100">
                  <template #default="{ row }">
                    <el-tag v-if="row.type" size="small" type="info">{{ row.type }}</el-tag>
                    <span v-else class="muted">—</span>
                  </template>
                </el-table-column>
                <el-table-column prop="desc" label="说明" min-width="220" />
              </el-table>
              <el-empty v-else description="暂无返回字段说明" :image-size="72" />

              <div v-if="responseExampleText" class="example-block">
                <div class="example-head">
                  <span>返回示例</span>
                  <el-button size="small" text @click="copyText(responseExampleText)">复制</el-button>
                </div>
                <pre><code>{{ responseExampleText }}</code></pre>
              </div>
            </section>

            <section id="doc-errors" class="doc-section">
              <h3 class="doc-section-title">错误码</h3>
              <div class="error-section">
                <h4 class="error-section-title">平台公共错误码</h4>
                <p class="error-section-tip">
                  由网关鉴权/计费返回，HTTP 状态码非 2xx，适用于所有接口；下表已按本接口计费类型（{{ chargeText }}）筛选。
                </p>
                <el-table :data="platformErrorCodes" border stripe class="param-table">
                  <el-table-column prop="httpStatus" label="HTTP" width="80" align="center" />
                  <el-table-column prop="msg" label="信息" min-width="180" />
                  <el-table-column prop="desc" label="说明" min-width="200" />
                  <el-table-column label="处理建议" min-width="120">
                    <template #default="{ row }">
                      <router-link v-if="row.action" :to="row.action.path" class="link">{{ row.action.text }}</router-link>
                      <span v-else class="muted">—</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div class="error-section">
                <h4 class="error-section-title">本接口错误码</h4>
                <p class="error-section-tip">
                  接口业务逻辑返回，通常 HTTP 200，响应体 <code>code</code> / <code>msg</code> 见下表。
                </p>
                <el-table v-if="errorCodes.length" :data="errorCodes" border stripe class="param-table">
                  <el-table-column prop="code" label="错误码" width="120" />
                  <el-table-column prop="msg" label="信息" min-width="160" />
                  <el-table-column prop="desc" label="说明" min-width="200" />
                </el-table>
                <el-empty v-else description="该接口暂无业务错误码说明" :image-size="72" />
              </div>
            </section>

            <section id="doc-examples" class="doc-section">
              <h3 class="doc-section-title">调用示例</h3>
              <div class="example-block">
                <div class="example-head">
                  <span>curl</span>
                  <el-button size="small" text @click="copyText(curlExample)">复制</el-button>
                </div>
                <pre><code>{{ curlExample }}</code></pre>
              </div>
              <div class="example-block">
                <div class="example-head">
                  <span>JavaScript</span>
                  <el-button size="small" text @click="copyText(jsExample)">复制</el-button>
                </div>
                <pre><code>{{ jsExample }}</code></pre>
              </div>
              <div v-if="requestExampleText" class="example-block">
                <div class="example-head">
                  <span>{{ isMultipartRequest ? '表单参数示例' : '请求体示例' }}</span>
                  <el-button size="small" text @click="copyText(requestExampleText)">复制</el-button>
                </div>
                <pre><code>{{ requestExampleText }}</code></pre>
              </div>
            </section>
          </div>

          <aside class="doc-elevator-wrap">
            <nav class="doc-elevator">
              <a
                v-for="item in docSections"
                :key="item.id"
                href="#"
                class="doc-elevator-item"
                :class="{ active: activeSection === item.id }"
                @click.prevent="scrollToSection(item.id)"
              >{{ item.label }}</a>
            </nav>
          </aside>
        </div>

        <el-alert
          v-if="api.hasDoc === false"
          class="doc-alert"
          type="info"
          :closable="false"
          show-icon
          title="该接口尚未发布完整文档，仅展示基础信息。完整参数说明请联系管理员在后台配置文档。"
        />
      </div>

      <ApiDebugPanel v-model="debugVisible" :api="api" :api-base-url="apiBaseUrl" />
      </div>
    </Transition>
  </div>
</template>

<script>
import { getOpenApiDetail, getOpenConfig } from '@/api/platform'
import { resolveApiIconUrl, DEFAULT_OPEN_ICON } from '@/utils/openIcon'
import { filterPlatformErrorCodes } from '@/utils/platformErrorCodes'
import ApiDetailSkeleton from '@/components/skeleton/ApiDetailSkeleton.vue'
import ApiDebugPanel from '@/components/ApiDebugPanel.vue'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'

const DOC_SECTIONS = [
  { id: 'desc', label: '接口说明' },
  { id: 'request', label: '请求参数' },
  { id: 'response', label: '返回说明' },
  { id: 'errors', label: '错误码' },
  { id: 'examples', label: '调用示例' }
]

const SCROLL_OFFSET = 80

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

/** 将 data.songs[].name 这类扁平路径收成可展开的字段树 */
function buildResponseSchemaTree(list) {
  if (!Array.isArray(list) || !list.length) return []
  const roots = []
  const nodeMap = new Map()
  list.forEach((item) => {
    const fieldPath = item && (item.field || item.name) ? String(item.field || item.name) : ''
    if (!fieldPath) return
    const parts = fieldPath.split('.').filter(Boolean)
    let path = ''
    let parentChildren = roots
    parts.forEach((rawPart, index) => {
      const isArrayPart = rawPart.includes('[]')
      const key = rawPart.replace(/\[\]/g, '')
      path = path ? `${path}.${key}` : key
      let node = nodeMap.get(path)
      if (!node) {
        node = {
          label: isArrayPart ? `${key}[]` : key,
          fullField: path,
          type: '',
          desc: '',
          children: []
        }
        nodeMap.set(path, node)
        parentChildren.push(node)
      } else if (isArrayPart && !String(node.label).endsWith('[]')) {
        node.label = `${key}[]`
      }
      if (index === parts.length - 1) {
        if (item.type) node.type = item.type
        if (item.desc || item.description) node.desc = item.desc || item.description || ''
        if (item.type === 'array' && !String(node.label).endsWith('[]')) node.label = `${key}[]`
      }
      parentChildren = node.children
    })
  })
  const prune = (nodes) => nodes.map((n) => {
    const children = prune(n.children || [])
    const next = { ...n }
    if (children.length) next.children = children
    else delete next.children
    if (!next.type) {
      if (String(next.label).endsWith('[]')) next.type = 'array'
      else if (next.children) next.type = 'object'
    }
    return next
  })
  return prune(roots)
}

function prettyJson(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch (e) {
      return value
    }
  }
  try {
    return JSON.stringify(value, null, 2)
  } catch (e) {
    return String(value)
  }
}

function isFileType(type) {
  const value = String(type || '').toLowerCase().replace(/\s/g, '')
  return value === 'file' || value === 'file[]' || value === 'files' || value === 'multipartfile' || value === 'multipartfile[]'
}

function isFormLocation(location) {
  return ['form', 'formdata', 'multipart', 'multipart/form-data'].includes(String(location || '').toLowerCase())
}

export default {
  name: 'ApiDetailPage',
  components: { ApiDetailSkeleton, ApiDebugPanel },
  data() {
    return {
      loading: true,
      api: null,
      apiBaseUrl: '',
      activeSection: 'desc',
      debugVisible: false,
      responseExpandedKeys: [],
      userStore: useUserStore(),
      appStore: useAppStore()
    }
  },
  computed: {
    apiCode() {
      return decodeURIComponent(this.$route.params.apiCode || '')
    },
    iconUrl() {
      return resolveApiIconUrl(this.api?.apiIcon)
    },
    defaultIcon() {
      return DEFAULT_OPEN_ICON
    },
    tagClass() {
      const t = this.api?.chargeType
      return t === 'payg' ? 'pay' : (t || 'free')
    },
    chargeText() {
      const t = this.api?.chargeType
      if (t === 'vip') return '会员接口'
      if (t === 'payg') return '计次接口'
      return '免费接口'
    },
    methodText() {
      return (this.api?.httpMethod || 'GET').toUpperCase()
    },
    methodClass() {
      return this.methodText.toLowerCase()
    },
    fullUrl() {
      const base = (this.apiBaseUrl || '').replace(/\/$/, '')
      const path = this.api?.apiPath || ''
      if (!path) return base || ''
      if (/^https?:\/\//i.test(path)) return path
      return base ? `${base}${path.startsWith('/') ? path : '/' + path}` : path
    },
    requestParams() {
      return asArray(this.api?.requestSchema).map((row) => ({
        name: row.name || '',
        type: row.type || 'string',
        required: !!row.required,
        desc: row.desc || row.description || '',
        example: row.example,
        location: row.location || row.in || '',
        locationText: isFileType(row.type) || isFormLocation(row.location || row.in) ? '表单' : 'JSON',
        enum: row.enum || row.options || row.enums
      }))
    },
    isMultipartRequest() {
      return this.requestParams.some((row) => isFileType(row.type) || isFormLocation(row.location))
    },
    responseFieldTree() {
      return buildResponseSchemaTree(asArray(this.api?.responseSchema))
    },
    responseHasNested() {
      return this.responseFieldTree.some((node) => node.children && node.children.length)
    },
    errorCodes() {
      return asArray(this.api?.errorCodes).map((row) => ({
        code: row.code ?? '',
        msg: row.msg || row.message || '',
        desc: row.desc || row.description || ''
      }))
    },
    platformErrorCodes() {
      return filterPlatformErrorCodes(this.api?.chargeType)
    },
    docSections() {
      return DOC_SECTIONS
    },
    requestExampleText() {
      return prettyJson(this.api?.requestExample)
    },
    responseExampleText() {
      return prettyJson(this.api?.responseExample)
    },
    primaryActionText() {
      if (!this.userStore.isLogin) return '登录获取 Token'
      return '获取 Token'
    },
    curlExample() {
      const method = this.methodText
      const url = this.fullUrl || '<API_URL>'
      if (this.isMultipartRequest) {
        const lines = [
          `curl -X ${method} '${url}' \\`,
          `  -H 'X-Api-Key: <你的Token>'`
        ]
        this.requestParams.forEach((param) => {
          lines[lines.length - 1] += ' \\'
          if (isFileType(param.type)) {
            const multiple = String(param.type || '').includes('[]') || param.name === 'files'
            lines.push(`  -F '${param.name}=@${multiple ? 'file-1.pdf' : (param.example || 'your-file')}'`)
            if (multiple) {
              lines[lines.length - 1] += ' \\'
              lines.push(`  -F '${param.name}=@file-2.pdf'`)
            }
          } else {
            const value = param.example != null && param.example !== '' ? param.example : `<${param.name}>`
            lines.push(`  -F '${param.name}=${typeof value === 'object' ? JSON.stringify(value) : value}'`)
          }
        })
        return lines.join('\n')
      }
      const lines = [
        `curl -X ${method} '${url}' \\`,
        `  -H 'X-Api-Key: <你的Token>' \\`,
        `  -H 'Content-Type: application/json'`
      ]
      if (method !== 'GET' && this.requestExampleText) {
        lines[lines.length - 1] += ' \\'
        lines.push(`  -d '${this.requestExampleText.replace(/\n/g, '')}'`)
      } else if (method === 'GET' && this.requestParams.length) {
        const qs = this.requestParams
          .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(p.example != null && p.example !== '' ? p.example : '<' + p.name + '>')}`)
          .join('&')
        lines[0] = `curl -X GET '${url}${url.includes('?') ? '&' : '?'}${qs}' \\`
      }
      return lines.join('\n')
    },
    jsExample() {
      const method = this.methodText
      const url = this.fullUrl || '<API_URL>'
      if (method === 'GET') {
        return `fetch('${url}', {\n  headers: {\n    'X-Api-Key': '<你的Token>'\n  }\n}).then(r => r.json()).then(console.log)`
      }
      if (this.isMultipartRequest) {
        const lines = ['const formData = new FormData()']
        this.requestParams.forEach((param) => {
          if (isFileType(param.type)) {
            const multiple = String(param.type || '').includes('[]') || param.name === 'files'
            if (multiple) {
              lines.push(`for (const file of document.querySelector('#${param.name}').files) {`)
              lines.push(`  formData.append('${param.name}', file)`)
              lines.push('}')
            } else {
              lines.push(`formData.append('${param.name}', document.querySelector('#${param.name}').files[0])`)
            }
          } else {
            const value = param.example != null && param.example !== '' ? String(param.example) : `<${param.name}>`
            lines.push(`formData.append('${param.name}', ${JSON.stringify(value)})`)
          }
        })
        lines.push('', `fetch('${url}', {`, `  method: '${method}',`, '  headers: {', `    'X-Api-Key': '<你的Token>'`, '  },', '  body: formData', '}).then(r => r.json()).then(console.log)')
        return lines.join('\n')
      }
      const body = this.requestExampleText || '{}'
      return `fetch('${url}', {\n  method: '${method}',\n  headers: {\n    'X-Api-Key': '<你的Token>',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(${body})\n}).then(r => r.json()).then(console.log)`
    },
    productApis() {
      const list = this.api?.productApis
      return Array.isArray(list) ? list : []
    }
  },
  watch: {
    apiCode: {
      immediate: true,
      handler() {
        this.loadDetail()
      }
    },
    api(val) {
      this.responseExpandedKeys = this.responseFieldTree.map((node) => node.fullField)
      if (val) {
        this.$nextTick(() => {
          this.destroyScrollSpy()
          this.initScrollSpy()
        })
      }
    }
  },
  beforeUnmount() {
    this.destroyScrollSpy()
  },
  methods: {
    limitText(n) {
      const v = Number(n || 0)
      return v > 0 ? String(v) : '不限'
    },
    formatCell(v) {
      if (typeof v === 'object') return JSON.stringify(v)
      return String(v)
    },
    onResponseExpand(row, expanded) {
      const key = row && row.fullField
      if (!key) return
      const next = new Set(this.responseExpandedKeys)
      if (expanded) next.add(key)
      else next.delete(key)
      this.responseExpandedKeys = [...next]
    },
    switchProductApi(code) {
      if (!code || code === this.apiCode) return
      this.$router.push(`/docs/${encodeURIComponent(code)}`)
    },
    async loadDetail() {
      if (!this.apiCode) return
      this.loading = true
      this.api = null
      this.activeSection = 'desc'
      this.debugVisible = false
      try {
        const [detailRes, configRes] = await Promise.all([
          getOpenApiDetail(this.apiCode),
          getOpenConfig().catch(() => null)
        ])
        if (configRes && configRes.code === 200 && configRes.data) {
          this.apiBaseUrl = configRes.data.apiBaseUrl || ''
        }
        if (detailRes.code === 200 && detailRes.data) {
          this.api = detailRes.data
          document.title = this.appStore.resolvePageTitle(
            `${this.api.apiName || '接口文档'} - 三域聚合开放平台`
          )
          if (!this.api.description && this.requestParams.length) {
            this.$nextTick(() => this.scrollToSection('request'))
          }
        } else {
          this.$message.error(detailRes.msg || '接口不存在')
          this.$router.replace('/404')
        }
      } catch (e) {
        this.$message.error('接口详情加载失败')
        this.$router.replace('/404')
      } finally {
        this.loading = false
      }
    },
    onPrimaryAction() {
      if (!this.userStore.isLogin) {
        this.$message.warning('请先登录')
        this.appStore.openLogin()
        return
      }
      this.$router.push('/console/token')
    },
    openDebug() {
      this.debugVisible = true
    },
    copyText(text) {
      if (!text) return
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制')
      }).catch(() => {
        this.$message.error('复制失败')
      })
    },
    scrollToSection(id) {
      const el = document.getElementById(`doc-${id}`)
      if (!el) return
      this.activeSection = id
      this._scrollLock = true
      this._highlightSection(el)
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET
      window.scrollTo({ top, behavior: 'smooth' })
      window.setTimeout(() => {
        this._scrollLock = false
      }, 650)
    },
    _highlightSection(el) {
      el.classList.remove('is-section-active')
      void el.offsetWidth
      el.classList.add('is-section-active')
      window.setTimeout(() => {
        el.classList.remove('is-section-active')
      }, 550)
    },
    initScrollSpy() {
      if (typeof IntersectionObserver === 'undefined') return
      this.destroyScrollSpy()
      const sections = DOC_SECTIONS
        .map((item) => document.getElementById(`doc-${item.id}`))
        .filter(Boolean)
      if (!sections.length) return

      this._scrollSpy = new IntersectionObserver(
        (entries) => {
          if (this._scrollLock) return
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          if (!visible.length) return
          const id = visible[0].target.id.replace('doc-', '')
          this.activeSection = id
        },
        { rootMargin: '-10% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] }
      )
      sections.forEach((el) => this._scrollSpy.observe(el))
    },
    destroyScrollSpy() {
      if (this._scrollSpy) {
        this._scrollSpy.disconnect()
        this._scrollSpy = null
      }
    }
  }
}
</script>

<style scoped lang="scss">

.detail-page {
  padding-top: 20px;
  padding-bottom: 48px;
}

.breadcrumb-wrap {
  margin-bottom: 16px;
}

.detail-main {
  max-width: 1200px;
}

.detail-head {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 24px;
  margin-bottom: 16px;
  background: #fff;
}

.product-apis {
  padding: 16px 20px;
  margin-bottom: 16px;
  background: #fff;
}

.product-apis-label {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.product-apis-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.product-api-item {
  appearance: none;
  border: 1px solid #dcdfe6;
  background: #fff;
  color: #606266;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;

  &:hover {
    border-color: #409eff;
    color: #409eff;
  }

  &.active {
    border-color: #409eff;
    color: #409eff;
    background: #ecf5ff;
    font-weight: 600;
  }
}

.head-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f1f1f1;

  img {
    width: 28px;
    height: 28px;
    object-fit: contain;
  }
}

.head-info {
  flex: 1;
  min-width: 0;
}

.head-title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;

  h1 {
    margin: 0;
    font-size: 22px;
    color: $text-primary;
  }
}

.price-value {
  font-size: 13px;
  color: #ef4444;
  font-weight: 600;
}

.head-desc {
  margin: 0 0 12px;
  color: $text-secondary;
  line-height: 1.6;
  font-size: 14px;
}

.head-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.meta-chip {
  font-size: 12px;
  color: $text-secondary;
  background: $bg-page;
  border: 1px solid $border-light;
  border-radius: 999px;
  padding: 3px 10px;
}

.head-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
  flex-shrink: 0;
  min-width: 132px;
  padding-top: 2px;
}

.btn-debug {
  height: 40px;
  padding: 0 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.02em;
  box-shadow: 0 6px 16px rgba(58, 122, 254, 0.22);
}

.btn-token-link {
  appearance: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: $text-secondary;
  cursor: pointer;
  text-align: center;
  transition: color 0.2s;

  &:hover {
    color: $primary-color;
  }
}

.section {
  padding: 20px 22px;
  margin-bottom: 16px;
  background: #fff;
}

.section-head h3 {
  margin: 0 0 14px;
  font-size: 16px;
  color: $text-primary;
  font-weight: 600;
}

.req-url {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: $bg-page;
  border-radius: 10px;
  border: 1px solid $border-light;

  code {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: $text-primary;
    word-break: break-all;
  }
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

.auth-tip {
  margin-top: 12px;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.6;

  code {
    font-size: 12px;
    background: $bg-page;
    padding: 1px 6px;
    border-radius: 4px;
  }

  .link {
    color: $primary-color;
  }
}

.doc-card {
  padding-bottom: 28px;
}

.doc-layout {
  display: flex;
  align-items: flex-start;
  gap: 28px;
}

.doc-body {
  flex: 1;
  min-width: 0;
}

.doc-elevator-wrap {
  width: 108px;
  flex-shrink: 0;
  position: sticky;
  top: 88px;
}

.doc-elevator {
  border-left: 2px solid $border-light;
  padding-left: 14px;
}

.doc-elevator-item {
  display: block;
  position: relative;
  padding: 7px 0;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.45;
  transition: color 0.25s ease, font-weight 0.25s ease;

  &::before {
    content: '';
    position: absolute;
    left: -16px;
    top: 50%;
    transform: translateY(-50%);
    width: 2px;
    height: 0;
    background: $primary-color;
    border-radius: 1px;
    opacity: 0;
    transition:
      height 0.28s cubic-bezier(0.22, 1, 0.36, 1),
      opacity 0.28s ease;
  }

  &:hover {
    color: $primary-color;
  }

  &.active {
    color: $primary-color;
    font-weight: 600;

    &::before {
      height: 18px;
      opacity: 1;
    }
  }
}

.doc-section {
  scroll-margin-top: 80px;
  transition: opacity 0.3s ease;

  & + & {
    margin-top: 36px;
    padding-top: 36px;
    border-top: 1px solid $border-light;
  }
}

.doc-section.is-section-active {
  animation: doc-section-highlight 0.55s ease;
}

.doc-section-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.doc-html {
  font-size: 14px;
  line-height: 1.8;
  color: $text-regular;
  word-break: break-word;

  :deep(img) {
    max-width: 100%;
  }

  :deep(a) {
    color: $primary-color;
  }
}

.param-table {
  width: 100%;
}

.response-schema-tip {
  margin: -8px 0 12px;
  font-size: 13px;
  color: $text-secondary;
}

.response-schema-table {
  :deep(.el-table__expand-icon) {
    color: $text-secondary;
  }
}

.req-yes {
  color: #ef4444;
  font-weight: 600;
}

.req-no {
  color: $text-placeholder;
}

.muted {
  color: $text-placeholder;
}

.example-block {
  margin-top: 16px;
  border: 1px solid $border-light;
  border-radius: 10px;
  overflow: hidden;
  background: #0f172a;

  .example-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #1e293b;
    color: #cbd5e1;
    font-size: 12px;

    :deep(.el-button) {
      color: #93c5fd;
    }
  }

  pre {
    margin: 0;
    padding: 14px 16px;
    overflow: auto;
    max-height: 360px;
  }

  code {
    color: #e2e8f0;
    font-size: 12px;
    line-height: 1.65;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.doc-alert {
  margin-top: 16px;
}

.error-section {
  & + & {
    margin-top: 28px;
    padding-top: 24px;
    border-top: 1px solid $border-light;
  }
}

.error-section-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.error-section-tip {
  margin: 0 0 12px;
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.6;

  code {
    font-size: 12px;
    background: $bg-page;
    padding: 1px 5px;
    border-radius: 4px;
  }
}

@keyframes doc-section-highlight {
  0% {
    opacity: 0.72;
  }
  100% {
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .detail-head {
    flex-direction: column;
  }

  .head-actions {
    width: 100%;
    min-width: 0;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
  }

  .btn-debug {
    width: auto;
  }

  .btn-token-link {
    text-align: left;
  }

  .about-row,
  .req-url {
    flex-wrap: wrap;
  }

  .doc-layout {
    flex-direction: column;
    gap: 0;
  }

  .doc-elevator-wrap {
    display: none;
  }

  .doc-section {
    scroll-margin-top: 72px;
  }

  .doc-section.is-section-active {
    animation: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .doc-section.is-section-active {
    animation: none;
  }
}
</style>
