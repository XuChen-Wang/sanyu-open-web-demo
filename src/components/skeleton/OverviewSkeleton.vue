<template>
  <div class="overview-skeleton">
    <div class="sk-welcome card">
      <el-skeleton animated>
        <template #template>
          <div class="sk-welcome-row">
            <div class="sk-welcome-left">
              <el-skeleton-item variant="h3" class="sk-title" />
              <el-skeleton-item variant="text" class="sk-sub" />
            </div>
            <div class="sk-welcome-right">
              <el-skeleton-item variant="button" class="sk-chip" />
              <el-skeleton-item variant="button" class="sk-chip" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <div class="sk-kpis">
      <div v-for="i in 4" :key="i" class="sk-kpi card">
        <el-skeleton animated>
          <template #template>
            <div class="sk-kpi-inner">
              <el-skeleton-item variant="circle" class="sk-icon" />
              <div class="sk-kpi-text">
                <el-skeleton-item variant="h3" class="sk-value" />
                <el-skeleton-item variant="text" class="sk-label" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <div class="sk-mid">
      <div class="sk-trend card">
        <el-skeleton animated>
          <template #template>
            <div class="sk-panel-head">
              <el-skeleton-item variant="h3" class="sk-panel-title" />
              <el-skeleton-item variant="button" class="sk-panel-btn" />
            </div>
            <el-skeleton-item variant="image" class="sk-chart" />
          </template>
        </el-skeleton>
      </div>
      <div class="sk-side">
        <div class="sk-account card">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="h3" class="sk-panel-title" />
              <el-skeleton-item variant="text" class="sk-line" />
              <el-skeleton-item variant="text" class="sk-line short" />
              <el-skeleton-item variant="text" class="sk-line" />
            </template>
          </el-skeleton>
        </div>
        <div class="sk-quick card">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="h3" class="sk-panel-title" />
              <div class="sk-quick-grid">
                <el-skeleton-item v-for="j in 4" :key="j" variant="button" class="sk-quick-item" />
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>

    <div class="sk-recent card">
      <el-skeleton animated>
        <template #template>
          <div class="sk-panel-head">
            <el-skeleton-item variant="h3" class="sk-panel-title" />
            <el-skeleton-item variant="button" class="sk-panel-btn" />
          </div>
        </template>
      </el-skeleton>
      <TableSkeleton :rows="6" :columns="5" />
    </div>
  </div>
</template>

<script>
import TableSkeleton from '@/components/skeleton/TableSkeleton.vue'

export default {
  name: 'OverviewSkeleton',
  components: { TableSkeleton }
}
</script>

<style scoped lang="scss">
.overview-skeleton {
  min-height: 640px;
}

.sk-welcome {
  padding: 22px 24px;
  margin-bottom: 16px;
}

.sk-welcome-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.sk-welcome-left {
  flex: 1;
  min-width: 0;
}

.sk-title {
  width: 220px;
  height: 28px;
  margin-bottom: 10px;
}

.sk-sub {
  width: 280px;
  height: 14px;
}

.sk-welcome-right {
  display: flex;
  gap: 10px;
}

.sk-chip {
  width: 88px;
  height: 32px;
  border-radius: 16px;
}

.sk-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.sk-kpi {
  padding: 18px 20px;
}

.sk-kpi-inner {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sk-icon {
  width: 44px;
  height: 44px;
}

.sk-kpi-text {
  flex: 1;
}

.sk-value {
  width: 72px;
  height: 24px;
  margin-bottom: 8px;
}

.sk-label {
  width: 88px;
  height: 12px;
}

.sk-mid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(260px, 0.9fr);
  gap: 16px;
  margin-bottom: 16px;
}

.sk-trend,
.sk-account,
.sk-quick,
.sk-recent {
  padding: 20px 24px;
}

.sk-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sk-panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sk-panel-title {
  width: 140px;
  height: 18px;
}

.sk-panel-btn {
  width: 72px;
  height: 28px;
  border-radius: 6px;
}

.sk-chart {
  width: 100%;
  height: 220px;
  border-radius: 8px;
}

.sk-line {
  width: 100%;
  height: 14px;
  margin-top: 12px;

  &.short {
    width: 60%;
  }
}

.sk-quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}

.sk-quick-item {
  width: 100%;
  height: 40px;
  border-radius: 8px;
}

.sk-recent {
  :deep(.table-skeleton) {
    box-shadow: none;
    padding: 0;
    margin: 0;
  }
}

@media (max-width: 1100px) {
  .sk-mid {
    grid-template-columns: 1fr;
  }

  .sk-kpis {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .sk-welcome-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .sk-kpis {
    grid-template-columns: 1fr;
  }
}
</style>
