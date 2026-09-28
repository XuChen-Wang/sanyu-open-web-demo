<template>
  <div class="not-found">
    <div class="nf-code">404</div>
    <div class="nf-title">抱歉，页面不存在</div>
    <div class="nf-desc">您访问的页面可能已被删除或地址错误</div>
    <div class="nf-actions">
      <el-button type="primary" round @click="$router.push('/')">返回首页</el-button>
      <el-button round @click="$router.push('/explore')">去探索接口</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped lang="scss">

.not-found {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.nf-code {
  font-size: 120px;
  font-weight: 800;
  background: $primary-gradient;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
}

.nf-title {
  font-size: 22px;
  color: $text-primary;
  font-weight: 600;
}

.nf-desc {
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 20px;
}
</style>
