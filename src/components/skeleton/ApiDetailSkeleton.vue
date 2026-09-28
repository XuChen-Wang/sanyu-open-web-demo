<template>
  <div class="api-detail-skeleton page-container">
    <div class="detail-head card">
      <el-skeleton animated>
        <template #template>
          <div class="sk-head">
            <el-skeleton-item variant="circle" class="sk-head-icon" />
            <div class="sk-head-main">
              <div class="sk-head-title">
                <el-skeleton-item variant="h1" class="sk-name" />
                <el-skeleton-item variant="text" class="sk-badge" />
              </div>
              <el-skeleton-item variant="text" class="sk-desc" />
              <el-skeleton-item variant="text" class="sk-desc short" />
              <div class="sk-chips">
                <el-skeleton-item v-for="n in 4" :key="n" variant="text" class="sk-chip" />
              </div>
            </div>
            <el-skeleton-item variant="button" class="sk-btn" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <div class="section card">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="h3" class="sk-section-title" />
          <el-skeleton-item variant="text" class="sk-url" />
          <el-skeleton-item variant="text" class="sk-tip" />
        </template>
      </el-skeleton>
    </div>

    <div class="section card doc-card">
      <div class="doc-layout">
        <div class="doc-body">
          <div v-for="n in 4" :key="n" class="doc-block">
            <el-skeleton animated>
              <template #template>
                <el-skeleton-item variant="h3" class="sk-section-title" />
                <el-skeleton-item variant="text" class="sk-block-line" />
                <el-skeleton-item variant="text" class="sk-block-line" />
                <el-skeleton-item variant="text" class="sk-block-line short" />
                <el-skeleton-item v-if="n > 1" variant="image" class="sk-table" />
              </template>
            </el-skeleton>
          </div>
        </div>
        <aside class="doc-elevator-wrap">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item v-for="n in 5" :key="n" variant="text" class="sk-nav-item" />
            </template>
          </el-skeleton>
        </aside>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ApiDetailSkeleton'
}
</script>

<style scoped lang="scss">

.api-detail-skeleton {
  max-width: 1200px;
}

.detail-head,
.section {
  padding: 20px 22px;
  margin-bottom: 16px;
  background: #fff;
}

.sk-head {
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.sk-head-icon {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.sk-head-main {
  flex: 1;
  min-width: 0;
}

.sk-head-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.sk-name {
  width: 200px;
  height: 28px;
}

.sk-badge {
  width: 72px;
  height: 22px;
  border-radius: 999px;
}

.sk-desc {
  width: 100%;
  height: 14px;
  margin-bottom: 8px;

  &.short {
    width: 72%;
  }
}

.sk-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.sk-chip {
  width: 64px;
  height: 24px;
  border-radius: 999px;
}

.sk-btn {
  width: 120px;
  height: 36px;
  border-radius: 999px;
  flex-shrink: 0;
}

.sk-section-title {
  width: 96px;
  height: 22px;
  margin-bottom: 14px;
}

.sk-url {
  width: 100%;
  height: 44px;
  border-radius: 10px;
}

.sk-tip {
  width: 88%;
  height: 14px;
  margin-top: 12px;
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

.doc-block + .doc-block {
  margin-top: 36px;
  padding-top: 36px;
  border-top: 1px solid $border-light;
}

.sk-block-line {
  width: 100%;
  height: 14px;
  margin-bottom: 8px;

  &.short {
    width: 70%;
  }
}

.sk-table {
  width: 100%;
  height: 160px;
  margin-top: 12px;
  border-radius: 8px;
}

.doc-elevator-wrap {
  width: 108px;
  flex-shrink: 0;
}

.sk-nav-item {
  width: 72px;
  height: 16px;
  margin-bottom: 14px;
}

@media (max-width: 768px) {
  .sk-head {
    flex-direction: column;
  }

  .sk-btn {
    width: 100%;
  }

  .doc-elevator-wrap {
    display: none;
  }
}
</style>
