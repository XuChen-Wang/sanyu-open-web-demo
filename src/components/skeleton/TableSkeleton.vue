<template>
  <div class="table-skeleton card">
    <el-skeleton animated>
      <template #template>
        <div class="table-skeleton-head" :style="gridStyle">
          <el-skeleton-item
            v-for="c in columns"
            :key="'h' + c"
            variant="text"
            class="table-skeleton-cell head"
          />
        </div>
        <div v-for="r in rows" :key="r" class="table-skeleton-row" :style="gridStyle">
          <el-skeleton-item
            v-for="c in columns"
            :key="'r' + r + c"
            variant="text"
            class="table-skeleton-cell"
          />
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
export default {
  name: 'TableSkeleton',
  props: {
    rows: {
      type: Number,
      default: 6
    },
    columns: {
      type: Number,
      default: 5
    }
  },
  computed: {
    gridStyle() {
      return {
        gridTemplateColumns: `repeat(${this.columns}, minmax(0, 1fr))`
      }
    }
  }
}
</script>

<style scoped lang="scss">
.table-skeleton {
  padding: 16px 20px;
}

.table-skeleton-head,
.table-skeleton-row {
  display: grid;
  gap: 12px;
  align-items: center;
}

.table-skeleton-head {
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.table-skeleton-row + .table-skeleton-row {
  margin-top: 10px;
}

.table-skeleton-cell {
  width: 100%;
  height: 16px;

  &.head {
    height: 18px;
  }
}
</style>
