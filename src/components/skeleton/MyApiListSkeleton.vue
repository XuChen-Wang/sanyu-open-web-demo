<template>
  <div class="myapi-list-skeleton">
    <div v-for="n in count" :key="n" class="myapi-card-skeleton card">
      <el-skeleton animated>
        <template #template>
          <div class="sk-top">
            <el-skeleton-item variant="circle" class="sk-icon" />
            <div class="sk-meta">
              <el-skeleton-item variant="text" class="sk-title" />
              <el-skeleton-item variant="text" class="sk-sub" />
            </div>
            <el-skeleton-item variant="button" class="sk-doc-btn" />
          </div>
          <div class="sk-quota">
            <el-skeleton-item variant="text" class="sk-quota-line" />
            <el-skeleton-item variant="text" class="sk-progress" />
            <el-skeleton-item variant="text" class="sk-quota-sub" />
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyApiListSkeleton',
  props: {
    count: {
      type: Number,
      default: 3
    }
  }
}
</script>

<style scoped lang="scss">
.myapi-list-skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.myapi-card-skeleton {
  padding: 20px 24px;
}

.sk-top {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.sk-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
}

.sk-meta {
  flex: 1;
  min-width: 0;
}

.sk-title {
  width: 160px;
  height: 20px;
}

.sk-sub {
  width: 120px;
  height: 14px;
  margin-top: 8px;
}

.sk-doc-btn {
  width: 88px;
  height: 32px;
  border-radius: 999px;
  flex-shrink: 0;
}

.sk-quota {
  background: #f8fafc;
  border-radius: 8px;
  padding: 14px 16px;
}

.sk-quota-line {
  width: 180px;
  height: 14px;
  margin-bottom: 10px;
}

.sk-progress {
  width: 100%;
  height: 10px;
  border-radius: 999px;
}

.sk-quota-sub {
  width: 120px;
  height: 14px;
  margin-top: 10px;
}
</style>
