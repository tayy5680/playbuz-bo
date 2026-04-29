<template>
  <el-dialog v-if="isOpen" v-model="isOpen" :before-close="onClose" :title="$t('重設密碼')">
    <el-form v-loading="isLoading" label-position="left" align="left" size="small" label-width="auto">
      <el-form-item :label="$t('新密碼')">
        <el-input v-model="form.Password" type="password" @blur="v$.Password.$touch" :class="{ '--invalid': v$.Password.$invalid && v$.Password.$dirty }" />
        <FormErrors :v$="v$.Password" />
      </el-form-item>
      <el-form-item :label="$t('確認新密碼')">
        <el-input v-model="form.ConfirmPassword" type="password" @blur="v$.ConfirmPassword.$touch" :class="{ '--invalid': v$.ConfirmPassword.$invalid && v$.ConfirmPassword.$dirty }" />
        <FormErrors :v$="v$.ConfirmPassword" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="isLoading" @click="onSubmit">
        {{ $t('確定') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, toRef, reactive, watch } from 'vue'
import { loadingCounter } from '@/utils/loading-counter'
import { useNotice } from '@/utils/use-notice'
import { useValidator, required, betweenLength, sameAs } from '@/utils/use-validator'
import FormErrors from '@/components/FormErrors'
import { passwordChange } from '@/api/token'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    FormErrors,
  },

  props: {
    isShow: {
      required: true,
      type: Boolean,
    },
  },

  emits: ['close', 'success'],

  setup (props, context) {
    const isOpen = ref(false)
    watch(
      () => isOpen.value,
      (newValue) => {
        if (!newValue) context.emit('close')
      },
    )
    watch(
      () => props.isShow,
      (newValue) => {
        if (newValue) {
          initForm()
          isOpen.value = true
        }
      },
    )

    const { t } = useI18n()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 表單資料相關
    const form = reactive({})
    const initForm = () => {
      form.Password = ''
      form.ConfirmPassword = ''
    }
    initForm()

    const rules = {
      Password: {
        required: required(),
        betweenLength: betweenLength(6, 12),
      },
      ConfirmPassword: {
        required: required(),
        sameAs: sameAs(toRef(form, 'Password'), t('密碼')),
      },
    }
    const v$ = useValidator(rules, form)

    const onSubmit = async () => {
      v$.value.$touch()
      if (v$.value.$error) return useNotice({ type: 'warning', message: '內容輸入錯誤', allowDuplicate: true })

      loadingCountPlus()
      try {
        await passwordChange(form)
        useNotice({ type: 'success', message: '成功' })
        context.emit('success')
        isOpen.value = false
        onClose()
      } catch {
        // DO NOTHING
      } finally {
        loadingCountMinus()
      }
    }

    const onClose = (done) => {
      v$.value.$reset()
      done()
    }

    return {
      // data
      isOpen,
      isLoading,
      form,
      // methods
      onSubmit,
      onClose,
      v$,
    }
  },
}
</script>
