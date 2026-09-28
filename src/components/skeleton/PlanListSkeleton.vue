<template>
  <div class="plan-list-skeleton">
    <div v-for="n in count" :key="n" class="plan-card-skeleton card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h3" class="sk-name" />
          <el-skeleton-item variant="text" class="sk-price" />
          <el-skeleton-item variant="text" class="sk-desc" />
          <div class="sk-features">
            <el-skeleton-item v-for="i in 5" :key="i" variant="text" class="sk-feature" />
          </div>
          <el-skeleton-item variant="button" class="sk-btn" />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlanListSkeleton',
  props: {
    count: {
      type: Number,
      default: 3
    }
  }
}
</script>

<style scoped lang="scss">
.plan-list-skeleton {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  margin-bottom: 36px;
}

.plan-card-skeleton {
  width: 270px;
  flex: 0 0 270px;
  padding: 32px 24px 24px;
  text-align: center;
}

.sk-name {
  width: 88px;
  height: 24px;
  margin: 0 auto 16px;
}

.sk-price {
  width: 120px;
  height: 36px;
  margin: 0 auto 12px;
}

.sk-desc {
  width: 80%;
  height: 14px;
  margin: 0 auto 20px;
}

.sk-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.sk-feature {
  width: 100%;
  height: 16px;
}

.sk-btn {
  width: 100%;
  height: 40px;
  border-radius: 999px;
}
</style>
