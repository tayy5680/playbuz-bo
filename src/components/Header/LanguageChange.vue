<template>
  <el-dialog v-if="isOpen" v-model="isOpen" :before-close="onClose" :title="$t('設定語系')">
    <el-button v-for="item of list" :key="item.id" :type="item.id === locale ? 'info' : 'primary'" @click="onSubmit(item.id)">
      {{ item.label }}
    </el-button>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import store from '@/store'

export default {
  name: 'language-change-dialog',

  props: {
    isShow: {
      type: Boolean,
      default: () => false,
    },
  },

  emits: ['close'],

  setup (props, context) {
    const { locale } = useI18n()
    const isOpen = ref(false)
    const list = reactive([
      { id: 'zh-TW', label: '中文(台灣)' },
      { id: 'en-US', label: 'English (US)' },
    ])

    watch(isOpen, (bol) => {
      if (bol) return false
      context.emit('close')
    })

    watch(() => props.isShow, (bol) => {
      if (!bol) return false
      isOpen.value = true
    })

    const onSubmit = (id) => {
      locale.value = id
      store.dispatch('setLanguage', id)
    }

    const onClose = (done) => {
      done()
    }

    return {
      // data
      locale,
      isOpen,
      list,
      // methods
      onSubmit,
      onClose,
    }
  },
}
</script>
