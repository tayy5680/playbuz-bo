<template lang="pug">
el-button(@click="() => isOpen = true" type="primary" size="small") {{$t('新增')}}
el-dialog(
  v-if="isOpen"
  v-model="isOpen"
  :title="$t('新增推廣連結')"
  center
)
  el-form(v-loading="isLoading" label-position="left" label-width="auto" size="small")
    el-form-item(:label="$t('推廣碼')")
      el-input(v-model="form.PromoteCode" disabled)
    el-form-item(:label="$t('備註')")
      el-input(
        v-model="form.Note"
        :class="{'--invalid': v$.Note.$invalid && v$.Note.$dirty}"
        @blur="v$.Note.$touch"
      )
      FormErrors(:v$="v$.Note")
  template(#footer)
    el-button(type="primary" :loading="isLoading" @click="onSubmit") {{$t('確定')}}
</template>
<script>
import { ref, reactive, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useNotice } from '@/utils/use-notice'
import { loadingCounter } from '@/utils/loading-counter'
import { useValidator, maxLength } from '@/utils/use-validator'
import FormErrors from '@/components/FormErrors'
import {
  getPromoteCode,
  postPromoteCode,
} from '@/api/advertiser'
import i18n from '@/configs/locales'

export default {
  components: {
    FormErrors,
  },

  emits: ['success'],

  setup (props, context) {
    const { global: { t } } = i18n
    const isOpen = ref(false)
    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) initForm()
      },
    )

    // 表單資料相關
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    const store = useStore()
    const memberID = computed(() => store.state.memberID)
    const form = reactive({})
    const initForm = async () => {
      loadingCountPlus()
      try {
        const res = await getPromoteCode()
        form.PromoteCode = res.Data
        form.Note = ''
        form.MemberID = memberID.value
      } catch {
        // TODO
      } finally {
        loadingCountMinus()
      }
    }

    const rules = {
      Note: {
        maxLength: maxLength(30),
      },
    }
    const v$ = useValidator(rules, form)

    const onSubmit = async () => {
      v$.value.$touch()
      if (v$.value.$error) return useNotice({ type: 'warning', message: t('內容輸入錯誤'), allowDuplicate: true })

      loadingCountPlus()
      try {
        await postPromoteCode(form)
        context.emit('success')
        useNotice({ type: 'success', message: t('成功') })
        isOpen.value = false
        onClose()
      } catch {
        // TODO
      } finally {
        loadingCountMinus()
      }
    }

    const onClose = (done) => {
      v$.value.$reset()
      done()
    }

    return {
      isOpen,
      isLoading,
      form,
      // fn
      onSubmit,
      v$,
    }
  },
}
</script>
