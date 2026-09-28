<template>
  <div class="api-card-skeleton card">
    <el-skeleton animated>
      <template #template>
        <div class="sk-row sk-top">
          <el-skeleton-item variant="circle" class="sk-icon" />
          <el-skeleton-item variant="text" class="sk-tag" />
        </div>
        <el-skeleton-item variant="h3" class="sk-title" />
        <el-skeleton-item variant="text" class="sk-line" />
        <el-skeleton-item variant="text" class="sk-line short" />
        <div class="sk-tags">
          <el-skeleton-item variant="text" class="sk-chip" />
          <el-skeleton-item variant="text" class="sk-chip" />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
export default {
  name: 'ApiCardSkeleton'
}
</script>

<style scoped lang="scss">
.api-card-skeleton {
  padding: 20px;
}

.sk-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sk-icon {
  width: 44px;
  height: 44px;
}

.sk-tag {
  width: 64px;
  height: 20px;
}

.sk-title {
  width: 58%;
  height: 22px;
  margin-top: 12px;
}

.sk-line {
  width: 100%;
  height: 14px;
  margin-top: 10px;

  &.short {
    width: 82%;
  }
}

.sk-tags {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.sk-chip {
  width: 52px;
  height: 20px;
}
</style>
