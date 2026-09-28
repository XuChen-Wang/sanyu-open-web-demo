<template>
  <div class="vip-page-skeleton">
    <PlanListSkeleton :count="4" />

    <div class="compare-skeleton card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h3" class="sk-compare-title" />
          <el-skeleton-item variant="image" class="sk-compare-table" />
        </template>
      </el-skeleton>
    </div>

    <div class="warning-skeleton card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="text" class="sk-warning-title" />
          <el-skeleton-item variant="text" class="sk-warning-line" />
          <el-skeleton-item variant="text" class="sk-warning-line short" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
import PlanListSkeleton from './PlanListSkeleton.vue'

export default {
  name: 'VipPageSkeleton',
  components: { PlanListSkeleton }
}
</script>

<style scoped lang="scss">
.vip-page-skeleton {
  min-height: 720px;
}

.compare-skeleton {
  padding: 24px 28px;
  margin-bottom: 0;
}

.sk-compare-title {
  width: 120px;
  height: 22px;
  margin-bottom: 16px;
}

.sk-compare-table {
  width: 100%;
  height: 280px;
  border-radius: 8px;
}

.warning-skeleton {
  margin-top: 24px;
  padding: 16px 20px;
}

.sk-warning-title {
  width: 88px;
  height: 18px;
  margin-bottom: 12px;
}

.sk-warning-line {
  width: 100%;
  height: 14px;
  margin-bottom: 8px;

  &.short {
    width: 76%;
  }
}
</style>
