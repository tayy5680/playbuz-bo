<template>
  <div class="CopyableButton" v-show="modelValue">
    <span class="text" v-if="!buttonOnly">
      {{ modelValue }}
    </span>
    <i class="icon-copy" ref="inputRef" :data-clipboard-text="modelValue" />
  </div>
</template>

<script>
import { defineComponent, onMounted, onUpdated, ref } from 'vue'
import Clipboard from 'clipboard'
import { useNotice } from '@/utils/use-notice'

export default defineComponent({
  name: 'copyable-button',

  props: {
    modelValue: String,
    buttonOnly: {
      type: Boolean,
      default: false,
    },
  },

  setup (props, { slots }) {
    const inputRef = ref()
    const oldClipboard = ref()
    const initClipboard = () => {
      // eslint-disable-next-line no-unused-expressions
      oldClipboard.value?.destroy?.()

      const clipboard = new Clipboard(inputRef.value)
      clipboard.on('success', () => { useNotice({ type: 'success', message: '複製成功', allowDuplicate: true }) })
      clipboard.on('error', () => { useNotice({ type: 'error', message: '複製失敗', allowDuplicate: true }) })
      oldClipboard.value = clipboard
    }
    onUpdated(initClipboard)
    onMounted(initClipboard)

    return {
      inputRef,
      slots,
    }
  },
})
</script>

<style lang="scss" scoped>
.CopyableButton {
  display: inline;
}

.icon-copy {
  vertical-align: middle;
  display: inline-block;
  margin-right: 0;
  width: 20px;
  height: 20px;
  background: url('./images/icon-copy.svg') no-repeat center center;
  cursor: pointer;
}
</style>
