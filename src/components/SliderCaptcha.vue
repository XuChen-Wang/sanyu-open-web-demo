<template>
  <div class="slider-captcha">

    <!-- 拼图区域 -->
    <div v-if="captcha" class="sc-body">
      <div
        class="sc-bg"
        :style="{
          width: captcha.bgWidth + 'px',
          height: captcha.bgHeight + 'px',
          backgroundImage: `url(${captcha.backgroundImage})`,
          backgroundSize: '100% 100%'
        }"
      >
        <!-- 缺口目标位置提示（背景图上的凹槽视觉由背景图自带，无需额外绘制） -->
        <!-- 拖动中的滑块块（跟随手指，直接显示 sliderImage） -->
        <div
          class="sc-block"
          :style="{
            width: captcha.blockSize + 'px',
            height: captcha.blockSize + 'px',
            top: captcha.y + 'px',
            left: moveX + 'px',
            backgroundImage: `url(${captcha.sliderImage})`,
            backgroundSize: '100% 100%'
          }"
        ></div>
      </div>

      <!-- 拖动轨道 -->
      <div class="sc-track">
        <div class="sc-track-bg"></div>
        <div class="sc-track-progress" :style="{ width: progressWidth + 'px' }"></div>
        <span v-if="!dragging && !checking" class="sc-track-tip">{{ trackTip }}</span>
        <div
          class="sc-track-btn"
          :style="{ left: moveX + 'px' }"
          @mousedown="onStart"
          @touchstart.prevent="onStart"
        >
          <el-icon :size="16"><DArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <div v-else class="sc-loading">
      <el-icon class="is-loading" :size="22"><Loading /></el-icon>
    </div>
  </div>
</template>

<script>
import { Refresh, DArrowRight, Loading } from '@element-plus/icons-vue'
import { getSliderCaptcha, checkSliderCaptcha } from '@/api/user'

export default {
  name: 'SliderCaptcha',
  components: { Refresh, DArrowRight, Loading },
  props: {
    // 成功后对外输出 ticket，由父组件继续发短信
    autoCheck: {
      type: Boolean,
      default: true
    }
  },
  emits: ['success', 'fail'],
  data() {
    return {
      captcha: null,
      loading: false,
      checking: false,
      dragging: false,
      moveX: 0, // 当前拖动距离（px）
      startX: 0,
      trackTip: '按住滑块，拖动到最右侧完成验证',
      checkResult: null
    }
  },
  computed: {
    progressWidth() {
      return this.moveX + (this.captcha ? this.captcha.blockSize / 2 : 0)
    }
  },
  mounted() {
    this.loadCaptcha()
  },
  methods: {
    async loadCaptcha() {
      this.loading = true
      this.captcha = null
      this.checkResult = null
      this.moveX = 0
      this.trackTip = '按住滑块，拖动到最右侧完成验证'
      try {
        const res = await getSliderCaptcha()
        if (res.code === 200) {
          this.captcha = res.data
          this.$emit('success', { captchaId: res.data.captchaId })
        } else {
          this.trackTip = res.msg || '加载验证码失败'
          this.$message && this.$message.error(res.msg || '加载验证码失败')
        }
      } catch (e) {
        this.trackTip = '加载验证码失败'
        this.$message && this.$message.error('验证码加载失败，请检查网络')
      } finally {
        this.loading = false
      }
    },

    // ===== 拖动逻辑 =====
    onStart(e) {
      if (!this.captcha || this.checking) return
      this.dragging = true
      this.trackTip = ''
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      this.startX = clientX
      document.addEventListener('mousemove', this.onMove)
      document.addEventListener('mouseup', this.onEnd)
      document.addEventListener('touchmove', this.onMove, { passive: false })
      document.addEventListener('touchend', this.onEnd)
    },
    onMove(e) {
      if (!this.dragging) return
      e.preventDefault && e.preventDefault()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      let delta = clientX - this.startX
      const maxMove = this.captcha.bgWidth - this.captcha.blockSize
      this.moveX = Math.max(0, Math.min(delta, maxMove))
    },
    onEnd() {
      if (!this.dragging) return
      this.dragging = false
      document.removeEventListener('mousemove', this.onMove)
      document.removeEventListener('mouseup', this.onEnd)
      document.removeEventListener('touchmove', this.onMove)
      document.removeEventListener('touchend', this.onEnd)
      if (this.autoCheck) {
        this.doCheck()
      }
    },
    async doCheck() {
      if (!this.captcha || this.checking) return
      this.checking = true
      try {
        const res = await checkSliderCaptcha({
          captchaId: this.captcha.captchaId,
          moveX: Math.round(this.moveX)
        })
        if (res.code === 200) {
          this.checkResult = res.data
          this.trackTip = '验证通过'
          this.$emit('success', res.data)
          this.$message && this.$message.success('验证通过')
        } else {
          this.trackTip = res.msg || '验证失败，请重试'
          this.$emit('fail', res)
          this.$message && this.$message.error(res.msg || '验证失败，请重试')
          // 失败后自动刷新一张新图（接口说明：无论成败都会消费当前 captchaId）
          setTimeout(() => {
            this.moveX = 0
            this.loadCaptcha()
          }, 400)
        }
      } catch (e) {
        this.trackTip = '验证失败，请重试'
        this.$emit('fail')
        this.$message && this.$message.error('验证失败，请重试')
        setTimeout(() => {
          this.moveX = 0
          this.loadCaptcha()
        }, 400)
      } finally {
        this.checking = false
      }
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.onMove)
    document.removeEventListener('mouseup', this.onEnd)
    document.removeEventListener('touchmove', this.onMove)
    document.removeEventListener('touchend', this.onEnd)
  }
}
</script>

<style scoped lang="scss">
.slider-captcha {
  width: 100%;
  user-select: none;

  .sc-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .sc-title-text {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
  }

  .sc-body {
    .sc-bg {
      position: relative;
      border-radius: 6px;
      overflow: hidden;
      background-color: #e5e7eb;

      .sc-block {
        position: absolute;
        // 注意：sliderImage 是不规则拼图形状（透明背景），
        // 不能用 box-shadow（会画出方形边框），要用 drop-shadow 跟随形状
        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
        transition: none;
        cursor: grab;

        &:active {
          cursor: grabbing;
        }
      }
    }
  }

  .sc-track {
    position: relative;
    height: 40px;
    margin-top: 10px;
    background: #f2f4f7;
    border: 1px solid #e0e4ea;
    border-radius: 6px;

    .sc-track-bg {
      position: absolute;
      inset: 0;
      border-radius: 6px;
    }

    .sc-track-progress {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      background: rgba(58, 122, 254, 0.12);
      border-radius: 6px;
      transition: width 0.1s;
    }

    .sc-track-tip {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #8a94a6;
      pointer-events: none;
      transition: color 0.2s;
    }

    .sc-track-btn {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #fff;
      border-radius: 6px;
      cursor: grab;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      color: #3a7afe;
      z-index: 2;

      &:active {
        cursor: grabbing;
      }
    }
  }

  .sc-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    color: #8a94a6;
  }
}
</style>
