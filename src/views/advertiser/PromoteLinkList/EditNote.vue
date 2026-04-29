<template lang="pug">
span {{ scope.row.Note }}
i.el-icon-edit-outline(
  v-if="enableEdit"
  @click="() => isOpen = true"
  :class="{hasContent: scope.row.Note}"
)
el-dialog(v-if="isOpen" v-model="isOpen" :title="$t('編輯備註')")
  el-form(v-loading="isLoading" label-position="left" align="left" size="small" label-width="auto")
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
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { loadingCounter } from '@/utils/loading-counter'
import { useNotice } from '@/utils/use-notice'
import { editPromoteLink } from '@/api/advertiser'
import { useValidator, maxLength } from '@/utils/use-validator'
import FormErrors from '@/components/FormErrors'
import i18n from '@/configs/locales'

export default {
  components: {
    FormErrors,
  },

  emits: ['success'],

  props: {
    scope: {
      required: true,
      type: Object,
    },
  },

  setup (props, context) {
    const { global: { t } } = i18n
    const isOpen = ref(false)
    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) initForm()
      },
    )
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    const store = useStore()
    const enableEdit = computed(() => store.state.account === props.scope?.row?.MemberAccount)
    // 表單資料相關
    const form = ref({})
    const initForm = () => {
      form.value = {
        PromoteID: props.scope?.row?.PromoteID,
        Note: props.scope?.row?.Note,
      }
    }
    initForm()

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
        await editPromoteLink(form.value)
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
      enableEdit,
      // fn
      onSubmit,
      v$,
    }
  },
}
</script>
<style lang="scss" scoped>
.el-icon-edit-outline {
  cursor: pointer;
}

.hasContent {
  margin-left: 5px;
}
</style>
