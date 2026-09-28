<template>
  <div class="faq-bot" :class="{ open: visible }">
    <transition name="faq-panel">
      <div v-if="visible" class="faq-panel" role="dialog" aria-label="客服助手">
        <header class="faq-panel__head">
          <div>
            <div class="faq-panel__title">客服助手</div>
            <div class="faq-panel__sub">常见问题快速解答</div>
          </div>
          <button type="button" class="faq-icon-btn" aria-label="关闭" @click="close">×</button>
        </header>

        <div class="faq-panel__body">
          <div class="faq-search">
            <input
              v-model="keyword"
              type="search"
              placeholder="输入关键词，如 Token、401…"
              @keyup.enter="doSearch"
            />
            <button type="button" class="faq-search-btn" @click="doSearch">搜索</button>
          </div>

          <div v-if="loading" class="faq-hint">加载中…</div>
          <div v-else-if="error" class="faq-hint error">{{ error }}</div>

          <template v-else-if="view === 'search'">
            <div class="faq-section-bar">
              <span>搜索结果</span>
              <button type="button" class="faq-link-btn" @click="backToList">返回分类</button>
            </div>
            <ul v-if="searchHits.length" class="faq-q-list">
              <li v-for="item in searchHits" :key="'s-' + item.faqId">
                <button type="button" @click="openAnswer(item)">{{ item.question }}</button>
              </li>
            </ul>
            <div v-else class="faq-hint">没有匹配到问题，可换个词或提交工单。</div>
          </template>

          <template v-else-if="view === 'answer' && current">
            <button type="button" class="faq-back" @click="backFromAnswer">← 返回</button>
            <h3 class="faq-q-title">{{ current.question }}</h3>
            <div class="faq-answer">{{ current.answer }}</div>
            <a
              v-if="current.linkUrl"
              class="faq-cta"
              href="javascript:;"
              @click.prevent="goLink(current.linkUrl)"
            >{{ current.linkText || '查看详情' }}</a>
          </template>

          <template v-else>
            <div v-for="cat in categories" :key="cat.category" class="faq-cat">
              <div class="faq-cat__name">{{ cat.categoryName }}</div>
              <ul class="faq-q-list">
                <li v-for="item in cat.items" :key="item.faqId">
                  <button type="button" @click="openAnswer(item)">{{ item.question }}</button>
                </li>
              </ul>
            </div>
            <div v-if="!categories.length" class="faq-hint">暂无常见问题</div>
          </template>
        </div>

        <footer class="faq-panel__foot">
          <button type="button" class="faq-ticket-btn" @click="goTicket">未解决？提交工单</button>
        </footer>
      </div>
    </transition>

    <button
      type="button"
      class="faq-fab"
      :aria-expanded="visible ? 'true' : 'false'"
      aria-label="打开客服助手"
      @click="toggle"
    >
      <span v-if="!visible">客服</span>
      <span v-else>收起</span>
    </button>
  </div>
</template>

<script>
import { getFaqList, searchFaq } from '@/api/faq'
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'

export default {
  name: 'FaqBotWidget',
  data() {
    return {
      visible: false,
      loading: false,
      error: '',
      categories: [],
      keyword: '',
      view: 'list',
      current: null,
      searchHits: [],
      loaded: false
    }
  },
  methods: {
    toggle() {
      this.visible = !this.visible
      if (this.visible && !this.loaded) {
        this.loadList()
      }
    },
    close() {
      this.visible = false
    },
    async loadList() {
      this.loading = true
      this.error = ''
      try {
        const res = await getFaqList()
        this.categories = (res && res.data) || []
        this.loaded = true
      } catch (e) {
        this.error = '暂时无法加载常见问题'
      } finally {
        this.loading = false
      }
    },
    async doSearch() {
      const q = (this.keyword || '').trim()
      if (!q) {
        this.view = 'list'
        this.searchHits = []
        return
      }
      this.loading = true
      this.error = ''
      try {
        const res = await searchFaq(q)
        this.searchHits = (res && res.data) || []
        this.view = 'search'
        this.current = null
      } catch (e) {
        this.error = '搜索失败，请稍后再试'
      } finally {
        this.loading = false
      }
    },
    openAnswer(item) {
      this.current = item
      this.view = 'answer'
    },
    backToList() {
      this.view = 'list'
      this.searchHits = []
      this.keyword = ''
    },
    backFromAnswer() {
      this.current = null
      this.view = this.searchHits.length ? 'search' : 'list'
    },
    goLink(url) {
      if (!url) return
      if (/^https?:\/\//i.test(url)) {
        window.open(url, '_blank', 'noopener')
        return
      }
      this.visible = false
      this.$router.push(url)
    },
    goTicket() {
      const userStore = useUserStore()
      const appStore = useAppStore()
      this.visible = false
      if (!userStore.isLogin) {
        appStore.openLogin()
        return
      }
      this.$router.push('/console/tickets')
    }
  }
}
</script>

<style scoped lang="scss">
.faq-bot {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 2400;
  font-family: inherit;
}
.faq-fab {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #3a7afe;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(58, 122, 254, 0.35);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.faq-fab:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(58, 122, 254, 0.42);
}
.faq-panel {
  position: absolute;
  right: 0;
  bottom: 68px;
  width: min(360px, calc(100vw - 32px));
  height: min(520px, calc(100vh - 120px));
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(15, 23, 42, 0.18);
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.06);
}
.faq-panel__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 16px 16px 12px;
  background: linear-gradient(135deg, #3a7afe 0%, #5b93ff 100%);
  color: #fff;
}
.faq-panel__title { font-size: 16px; font-weight: 700; }
.faq-panel__sub { margin-top: 2px; font-size: 12px; opacity: 0.9; }
.faq-icon-btn {
  border: none; background: transparent; color: #fff;
  font-size: 22px; line-height: 1; cursor: pointer; padding: 0 4px;
}
.faq-panel__body {
  flex: 1; overflow: auto; padding: 12px 14px 8px; background: #f7f9fc;
}
.faq-search { display: flex; gap: 8px; margin-bottom: 12px; }
.faq-search input {
  flex: 1; height: 36px; border: 1px solid #dbe3f0; border-radius: 8px;
  padding: 0 10px; font-size: 13px; outline: none; background: #fff;
}
.faq-search input:focus { border-color: #3a7afe; }
.faq-search-btn {
  height: 36px; padding: 0 12px; border: none; border-radius: 8px;
  background: #3a7afe; color: #fff; font-size: 13px; cursor: pointer;
}
.faq-cat + .faq-cat { margin-top: 12px; }
.faq-cat__name {
  font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 6px;
}
.faq-q-list {
  list-style: none; margin: 0; padding: 0; background: #fff;
  border-radius: 10px; overflow: hidden; border: 1px solid #e8eef7;
}
.faq-q-list li + li { border-top: 1px solid #eef2f8; }
.faq-q-list button {
  width: 100%; text-align: left; border: none; background: transparent;
  padding: 10px 12px; font-size: 13px; color: #1e293b; cursor: pointer; line-height: 1.4;
}
.faq-q-list button:hover { background: #f0f5ff; color: #3a7afe; }
.faq-hint { font-size: 13px; color: #64748b; padding: 16px 4px; text-align: center; }
.faq-hint.error { color: #dc2626; }
.faq-section-bar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px; font-size: 12px; color: #64748b;
}
.faq-link-btn, .faq-back {
  border: none; background: transparent; color: #3a7afe; font-size: 12px; cursor: pointer; padding: 0;
}
.faq-back { margin-bottom: 8px; display: inline-block; }
.faq-q-title { margin: 0 0 10px; font-size: 15px; color: #0f172a; line-height: 1.4; }
.faq-answer {
  white-space: pre-wrap; font-size: 13px; line-height: 1.65; color: #334155;
  background: #fff; border-radius: 10px; padding: 12px; border: 1px solid #e8eef7;
}
.faq-cta {
  display: inline-flex; margin-top: 12px; padding: 8px 12px; border-radius: 8px;
  background: #eef4ff; color: #3a7afe; font-size: 13px; text-decoration: none; font-weight: 600;
}
.faq-panel__foot { padding: 10px 14px 14px; background: #fff; border-top: 1px solid #eef2f8; }
.faq-ticket-btn {
  width: 100%; height: 40px; border: 1px solid #dbe3f0; border-radius: 10px;
  background: #fff; color: #1e293b; font-size: 13px; font-weight: 600; cursor: pointer;
}
.faq-ticket-btn:hover { border-color: #3a7afe; color: #3a7afe; }
.faq-panel-enter-active, .faq-panel-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.faq-panel-enter-from, .faq-panel-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 480px) {
  .faq-bot { right: 14px; bottom: 14px; }
}
</style>
