<template>
  <section class="api-category">
    <div class="category-head">
      <div class="category-title">
        <span class="cat-icon">
          <img :src="iconSrc" alt="" />
        </span>
        <h2>{{ category.categoryName }}</h2>
        <span v-if="category.description" class="cat-desc">{{ category.description }}</span>
      </div>
      <router-link :to="{ path: '/explore', query: { category: category.categoryCode } }" class="more-link">
        更多
        <el-icon :size="12"><ArrowRight /></el-icon>
      </router-link>
    </div>
    <div v-if="apis.length" class="api-grid">
      <ApiCard v-for="api in apis" :key="api.apiCode" :api="api" />
    </div>
    <div v-else class="empty-tip">该分类下暂无接口</div>
  </section>
</template>

<script>
import ApiCard from '@/components/ApiCard.vue'
import { resolveOpenIconUrl } from '@/utils/openIcon'

export default {
  name: 'ApiCategory',
  components: { ApiCard },
  props: {
    category: {
      type: Object,
      required: true
    },
    apis: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    iconSrc() {
      return resolveOpenIconUrl(this.category.icon)
    }
  }
}
</script>

<style scoped lang="scss">
.api-category {
  margin-bottom: 40px;
}

.category-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.category-title {
  display: flex;
  align-items: center;
  gap: 10px;

  .cat-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid #f1f1f1;

    img {
      width: 18px;
      height: 18px;
      object-fit: contain;
    }
  }

  h2 {
    font-size: 22px;
    margin: 0;
    color: $text-primary;
  }

  .cat-desc {
    font-size: 13px;
    color: $text-secondary;
  }
}

.more-link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 14px;
  color: $primary-color;
  padding: 4px 10px;
  border-radius: 6px;

  &:hover {
    background: rgba(58, 122, 254, 0.08);
  }
}

.empty-tip {
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: $text-placeholder;
  background: $bg-card;
  border-radius: $radius-lg;
}

.api-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .api-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .api-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cat-desc {
    display: none;
  }
}

@media (max-width: 480px) {
  .api-grid {
    grid-template-columns: 1fr;
  }
}
</style>
