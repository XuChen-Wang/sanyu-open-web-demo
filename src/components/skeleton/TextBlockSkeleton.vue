<template>
  <div class="text-block-skeleton">
    <el-skeleton animated :rows="rows" />
  </div>
</template>

<script>
export default {
  name: 'TextBlockSkeleton',
  props: {
    rows: {
      type: Number,
      default: 8
    }
  }
}
</script>

<style scoped lang="scss">
.text-block-skeleton {
  min-height: 140px;
  padding: 4px 0;
}
</style>
