<template>
  <div class="message-list-skeleton">
    <div v-for="n in count" :key="n" class="msg-item-skeleton">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="circle" class="sk-dot" />
          <div class="sk-body">
            <el-skeleton-item variant="text" class="sk-title" />
            <el-skeleton-item variant="text" class="sk-content" />
            <el-skeleton-item variant="text" class="sk-time" />
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageListSkeleton',
  props: {
    count: {
      type: Number,
      default: 5
    }
  }
}
</script>

<style scoped lang="scss">
.message-list-skeleton {
  padding: 4px 0;
}

.msg-item-skeleton {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;

  :deep(.el-skeleton) {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
}

.sk-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin-top: 6px;
}

.sk-body {
  flex: 1;
  min-width: 0;
}

.sk-title {
  width: 72%;
  height: 18px;
}

.sk-content {
  width: 100%;
  height: 14px;
  margin-top: 10px;
}

.sk-time {
  width: 120px;
  height: 12px;
  margin-top: 10px;
}
</style>
