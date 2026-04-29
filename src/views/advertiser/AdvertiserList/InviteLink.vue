<template lang="pug">
el-button(v-if="isDisplayed" @click="() => isOpen = true" type="primary" size="small") {{$t('產生註冊連結')}}
el-dialog(
  v-if="isOpen"
  v-model="isOpen"
  :before-close="onClose"
  :title="$t('產生註冊連結')"
)
  el-form(v-loading="isLoading" label-position="left" align="left" size="small" label-width="auto")
    el-form-item(:label="$t('歡迎詞')")
      el-input(type="textarea" v-model="form.Greeting" @blur="v$.Greeting.$touch" :class="{'--invalid': v$.Greeting.$invalid && v$.Greeting.$dirty}")
      FormErrors(:v$="v$.Greeting")
  template(#footer)
    el-button(type="primary" :loading="isLoading" @click="onSubmit") {{$t('確定')}}
</template>
<script>
import { h, ref, reactive, watch, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'
import CopyableButton from '@/components/CopyableButton'
import { loadingCounter } from '@/utils/loading-counter'
import { useNotice } from '@/utils/use-notice'
import { useValidator, required } from '@/utils/use-validator'
import FormErrors from '@/components/FormErrors'
import { inviteAdvertiser } from '@/api/advertiser'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    FormErrors,
  },

  props: {
    scope: {
      required: false,
      type: Object,
    },
  },

  setup (props) {
    const { t } = useI18n()
    const isOpen = ref(false)
    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) initForm()
      },
    )

    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 表單資料相關
    const form = reactive({})
    const initForm = () => {
      const ORIGIN = location.origin
      const DEFAULT_TEXT = `${t('歡迎成為GPG的廣告加盟商！GPG廣告加盟商後台網址')}: ${ORIGIN}`

      form.UpMemberID = props?.scope?.row.MemberID ?? ''
      form.Greeting = DEFAULT_TEXT
    }
    initForm()

    const rules = {
      Greeting: {
        required: required(),
      },
    }
    const v$ = useValidator(rules, form)

    const onSubmit = async () => {
      v$.value.$touch()
      if (v$.value.$error) return useNotice({ type: 'warning', message: t('內容輸入錯誤'), allowDuplicate: true })

      loadingCountPlus()
      try {
        const res = await inviteAdvertiser(form)
        if (res?.Data?.Url) {
          ElMessageBox({
            type: 'success',
            message: h('p', null, [
              h('span', null, `${t('成功產生連結')}: `),
              h(CopyableButton, { modelValue: res.Data.Url }),
            ]),
            closeOnClickModal: false,
          })
            .then(() => {
              isOpen.value = false
            })
        } else {
          ElMessageBox({
            type: 'error',
            message: t('API格式錯誤'),
          })
        }
      } catch (err) {
        // TODO
        console.warn(err)
      } finally {
        loadingCountMinus()
      }
    }

    const onClose = (done) => {
      v$.value.$reset()
      done()
    }

    const store = useStore()
    const isDisplayed = computed(() => {
      // Headquarter:總廣告商, A, B
      const res = ['Headquarter', 'A', 'B'].filter((item) => {
        return store.state.roles.indexOf(item) > -1
      })
      return res.length > 0
    })

    return {
      // data
      isOpen,
      isLoading,
      form,
      isDisplayed,
      // methods
      onSubmit,
      onClose,
      v$,
    }
  },
}
</script>
