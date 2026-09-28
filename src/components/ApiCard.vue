<template>
  <div class="api-card card" :class="'variant-' + variant" @click="goDetail">
    <template v-if="variant === 'home'">
      <div class="home-head">
        <span class="api-icon">
          <img :src="iconSrc" class="api-icon-img" alt="" />
        </span>
        <div class="api-name">{{ api.apiName }}</div>
      </div>
      <div class="api-tags">
        <span class="api-tag cat-tag">{{ api.categoryName }}</span>
        <span class="api-tag method-tag">{{ api.httpMethod }}</span>
        <span v-if="api.unitPrice > 0" class="api-tag pay-tag">{{ api.unitPrice }}元/次</span>
      </div>
      <div class="api-desc">{{ api.summary }}</div>
      <div class="home-footer">
        <span class="price-tag" :class="'tag-' + tagClass">{{ priceText }}</span>
        <button type="button" class="detail-btn" @click.stop="goDetail">查看详情</button>
      </div>
    </template>

    <template v-else>
      <div class="api-card-top">
        <span class="api-icon">
          <img :src="iconSrc" class="api-icon-img" alt="" />
        </span>
        <span class="price-tag" :class="'tag-' + tagClass">{{ priceText }}</span>
      </div>
      <div class="api-name">{{ api.apiName }}</div>
      <div class="api-desc">{{ api.summary }}</div>
      <div class="api-tags">
        <span class="api-tag">{{ api.categoryName }}</span>
        <span class="api-tag method-tag">{{ api.httpMethod }}</span>
        <span v-if="api.unitPrice > 0" class="api-tag pay-tag">{{ api.unitPrice }}元/次</span>
      </div>
    </template>
  </div>
</template>

<script>
import { resolveApiIconUrl, DEFAULT_OPEN_ICON } from '@/utils/openIcon'

export default {
  name: 'ApiCard',
  props: {
    api: {
      type: Object,
      required: true
    },
    variant: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    iconSrc() {
      // 优先管理端 apiIcon，其次列表映射的 iconUrl，否则默认图
      return resolveApiIconUrl(this.api.apiIcon) || this.api.iconUrl || DEFAULT_OPEN_ICON
    },
    priceTypeClass() {
      return this.api.chargeType || 'free'
    },
    tagClass() {
      return this.priceTypeClass === 'payg' ? 'pay' : this.priceTypeClass
    },
    priceText() {
      if (this.api.chargeType === 'free') return '免费接口'
      if (this.api.chargeType === 'vip') return '会员接口'
      return '计次接口'
    }
  },
  methods: {
    goDetail() {
      const code = this.api.apiCode || this.api.id
      if (!code) return
      this.$router.push(`/docs/${encodeURIComponent(code)}`)
    }
  }
}
</script>

<style scoped lang="scss">
.api-card {
  padding: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid transparent;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    border-color: rgba(58, 122, 254, 0.2);
  }
}

.api-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #f1f1f1;
  color: #0154dc;

  .api-icon-img {
    width: 22px;
    height: 22px;
    object-fit: contain;
  }
}

.api-name {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
}

.api-desc {
  font-size: 13px;
  color: $text-secondary;
  line-height: 1.6;
  min-height: 42px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.api-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  min-height: 22px;

  .api-tag {
    font-size: 12px;
    color: $text-secondary;
    background: $bg-page;
    padding: 1px 8px;
    border-radius: 4px;

    &.cat-tag {
      color: #8a74f1;
      background: #f7f1ff;
    }

    &.method-tag {
      color: #636376;
      background: #f3f5f9;
    }

    &.pay-tag {
      color: $color-pay;
      background: rgba(239, 68, 68, 0.08);
    }
  }
}

.variant-home {
  height: 100%;
  gap: 12px;
  padding: 22px 20px 18px;
  border: 1px solid #f1f1f1;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);

  &:hover {
    border-color: rgba(58, 122, 254, 0.25);
  }

  .home-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .api-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;

    .api-icon-img {
      width: 20px;
      height: 20px;
    }
  }

  .api-name {
    font-size: 18px;
    line-height: 1.3;
    min-width: 0;
  }

  .api-desc {
    font-size: 14px;
    color: #8d9596;
    min-height: 44px;
    -webkit-line-clamp: 2;
  }

  .home-footer {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-top: auto;
    padding-top: 14px;
    border-top: 1px solid #f2f2f2;
  }

  .price-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 93px;
    height: 25px;
    padding: 0 10px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1;
    font-weight: 500;
  }

  .price-tag.tag-free {
    color: #10b981;
    background: #e7f8f2;
  }

  .price-tag.tag-vip {
    color: #f59e0b;
    background: #fff7e8;
  }

  .price-tag.tag-pay {
    color: #ef4444;
    background: #fdecec;
  }

  .detail-btn {
    border: none;
    outline: none;
    cursor: pointer;
    width: 123px;
    height: 38px;
    padding: 0;
    border-radius: 8px;
    font-size: 13px;
    color: #fff;
    background: linear-gradient(90deg, #0e5dfd 0%, #9b5fff 100%);
    transition: opacity 0.2s, transform 0.2s;

    &:hover {
      opacity: 0.92;
    }
  }
}
</style>
