<template>
  <div class="api-grid-skeleton">
    <ApiCardSkeleton v-for="n in count" :key="n" />
  </div>
</template>

<script>
import ApiCardSkeleton from './ApiCardSkeleton.vue'

export default {
  name: 'ApiGridSkeleton',
  components: { ApiCardSkeleton },
  props: {
    count: {
      type: Number,
      default: 8
    }
  }
}
</script>

<style scoped lang="scss">
.api-grid-skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .api-grid-skeleton {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .api-grid-skeleton {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .api-grid-skeleton {
    grid-template-columns: 1fr;
  }
}
</style>
