<template>
  <div class="home-categories-skeleton">
    <ApiGridSkeleton :count="6" />
  </div>
</template>

<script>
import ApiGridSkeleton from './ApiGridSkeleton.vue'

export default {
  name: 'HomeCategoriesSkeleton',
  components: { ApiGridSkeleton }
}
</script>

<style scoped lang="scss">
.home-categories-skeleton {
  :deep(.api-grid-skeleton) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}

@media (max-width: 1100px) {
  .home-categories-skeleton :deep(.api-grid-skeleton) {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .home-categories-skeleton :deep(.api-grid-skeleton) {
    grid-template-columns: 1fr;
  }
}
</style>
