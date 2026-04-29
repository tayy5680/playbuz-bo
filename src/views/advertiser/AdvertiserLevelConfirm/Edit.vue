<template>
  <el-button
    @click="() => isOpen = true"
    type="primary"
    size="small"
  >
    {{$t('審核申請')}}
  </el-button>
  <el-dialog
    v-if="isOpen"
    v-model="isOpen"
    :title="$t('審核申請')"
    center
  >
    <el-form
      label-position="left"
      label-width="auto"
      size="small"
    >
      <el-form-item :label="$t('申請確認')">
        <el-select v-model="choseStatusID">
          <template
            v-for="(option, index) in STATUS_ID"
            :key="index"
          >
            <el-option
              :label="$t(option)"
              :value="index"
            />
          </template>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('備註')">
        <el-input
          type="textarea"
          v-model="textareaText"
          :class="{'--invalid': v$.textareaText.$invalid && v$.textareaText.$dirty}"
        />
        <FormErrors :v$="v$.textareaText" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        type="primary"
        @click="onSubmit"
      >
        {{$t('確定')}}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import {
  ref,
  watch,
  reactive,
  computed,
} from 'vue'

import FormErrors from '@/components/FormErrors'

import { getDataReportAdLvResetMod } from '@/api/report'
import { STATUS_ID } from './config'
import { useNotice } from '@/utils/use-notice'
import { useValidator, maxLength } from '@/utils/use-validator'
import { useI18n } from 'vue-i18n'

export default {
  name: 'advertiser-level-confirm-edit',

  components: {
    FormErrors,
  },

  props: {
    scope: {
      type: Object,
      default: () => {},
    },
  },

  emits: ['sucess'],

  setup (props, { emit }) {
    const { t } = useI18n()
    const isOpen = ref(false)
    watch(isOpen, () => handleFetch())

    const textareaText = ref('')
    const choseStatusID = ref('')
    const loading = ref(false)

    const form = reactive({
      textareaText: computed(() => textareaText?.value || ''),
    })

    const rules = {
      textareaText: {
        maxLength: maxLength(500),
      },
    }

    const v$ = useValidator(rules, form)

    const onSubmit = async () => {
      v$.value.$touch()
      if (v$.value.$error) return useNotice({ type: 'warning', message: t('內容輸入錯誤'), allowDuplicate: true })

      if (loading.value) return false

      loading.value = true

      try {
        await getDataReportAdLvResetMod({
          ApplyStatus: choseStatusID.value,
          Note: textareaText.value,
          Id: props.scope.row.Id,
        })
        handleFetch()
        isOpen.value = false
        emit('sucess')
      } catch {
        useNotice({ type: 'error', message: t('發生錯誤，請稍後再試，或洽客服人員') })
      } finally {
        loading.value = false
        v$.value.$reset()
      }
    }

    const handleFetch = () => {
      textareaText.value = props.scope.row.Note
      choseStatusID.value = props.scope.row.ApplyStatus.toString()
    }

    handleFetch()

    return {
      v$,
      isOpen,
      STATUS_ID,
      choseStatusID,
      textareaText,
      // fn
      onSubmit,
    }
  },
}
</script>
