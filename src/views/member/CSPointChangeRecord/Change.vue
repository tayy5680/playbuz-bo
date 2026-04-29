<template>
  <el-button
    @click="() => isOpen = true"
    type="primary"
    size="small"
  >
    {{ $t('新增補扣點') }}
  </el-button>
  <el-dialog
    v-if="isOpen"
    v-model="isOpen"
    :before-close="onClose"
    :title="$t('新增補扣點')"
    center
  >
    <el-form
      v-loading="isLoading"
      label-position="left"
      align="left"
      label-width="auto"
      size="small"
    >
      <el-form-item :label="$t('搜尋類型')">
        <el-select v-model="form.searchType">
          <template
            v-for="option of FETCH_TYPE_LIST"
            :key="option.key"
          >
            <el-option
              :label="$t(option.name)"
              :value="option.key"
            />
          </template>
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('搜尋資料')">
        <el-select
          filterable
          remote
          :remote-method="searchByType"
          :loading="isSelectLoading"
          :placeholder="searchTypePlaceholder"
          v-model="form.MemberID"
          @blur="v$.MemberID.$touch"
          :class="{'--invalid': v$.MemberID.$invalid && v$.MemberID.$dirty}"
        >
          <el-option
            v-for="item in form.memberList"
            :key="item.MemberID"
            :label="item.Label"
            :value="item.MemberID"
          />
        </el-select>
        <FormErrors :v$="v$.MemberID" />
      </el-form-item>
      <el-form-item :label="$t('幣別')">
        <el-select
          v-model="form.PointTypeID"
          @blur="v$.PointTypeID.$touch"
          :class="{'--invalid': v$.PointTypeID.$invalid && v$.PointTypeID.$dirty}"
        >
          <template
            v-for="option of POINT_TYPE_LIST"
            :key="option.id"
          >
            <el-option
              :label="$t(option.name)"
              :value="option.id"
            />
          </template>
        </el-select>
        <FormErrors :v$="v$.PointTypeID" />
      </el-form-item>
      <el-form-item :label="$t('點數')">
        <el-input
          v-model="form.Point"
          type="number"
          @blur="v$.Point.$touch"
          :class="{'--invalid': v$.Point.$invalid && v$.Point.$dirty}"
        />
        <FormErrors :v$="v$.Point" />
      </el-form-item>
      <el-form-item :label="$t('理由')">
        <el-input
          v-model="form.Note"
          type="textarea"
          @blur="v$.Note.$touch"
          :class="{'--invalid': v$.Note.$invalid && v$.Note.$dirty}"
        />
        <FormErrors :v$="v$.Note" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        type="primary"
        :loading="isLoading"
        @click="onSubmit"
      >
        {{ $t('確定') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, watch, computed } from 'vue'
import { POINT_TYPE_LIST } from '@/configs'
import { loadingCounter } from '@/utils/loading-counter'
import { useNotice } from '@/utils/use-notice'
import { useValidator, required, integer } from '@/utils/use-validator'
import FormErrors from '@/components/FormErrors'
import {
  getMemberbyInput,
  postCustomerServiceChange,
} from '@/api/member'
import { useI18n } from 'vue-i18n'

export default {
  components: {
    FormErrors,
  },

  emits: ['success'],

  setup (props, context) {
    const { t } = useI18n()
    const FETCH_TYPE_LIST = reactive([
      { name: '會員暱稱', key: 'NickName' },
      { name: '會員ID', key: 'MemberID' },
      { name: '會員信箱', key: 'Email' },
    ])

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
      form.searchType = FETCH_TYPE_LIST?.[0].key
      form.memberList = []
      form.MemberID = undefined
      form.PointTypeID = undefined
      form.Point = undefined
      form.Note = undefined
    }
    initForm()
    watch(
      () => form.searchType,
      () => {
        form.MemberID = undefined
        form.memberList = []
      },
    )

    const rules = {
      MemberID: {
        required: required(),
      },
      PointTypeID: {
        required: required(),
      },
      Point: {
        integer: integer(),
        required: required(),
      },
      Note: {
        required: required(),
      },
    }
    const v$ = useValidator(rules, form)

    const searchTypePlaceholder = computed(() => {
      const res = FETCH_TYPE_LIST.find(item => item.key === form.searchType).name
      return t(`請輸入${res}`)
    })
    const isSelectLoading = ref(false)
    const searchByType = (newVal) => {
      if ((form.searchType === 'MemberID' && isNaN(parseInt(newVal))) || (form.searchType !== 'Email' && newVal.length < 3)) {
        form.memberList = []
        return
      }

      isSelectLoading.value = true
      setTimeout(async () => {
        const res = await getMemberbyInput({ [form.searchType]: newVal })
        const list = res?.Data ?? []
        form.memberList = list.map(item => ({ ...item, Label: item?.[form.searchType] ?? item.MemberID }))
        isSelectLoading.value = false
      }, 200)
    }

    const onSubmit = async () => {
      v$.value.$touch()
      if (v$.value.$error) return useNotice({ type: 'warning', message: '內容輸入錯誤', allowDuplicate: true })

      loadingCountPlus()
      try {
        await postCustomerServiceChange(form)
        context.emit('success')
        useNotice({ type: 'success', message: '成功' })
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
      POINT_TYPE_LIST,
      FETCH_TYPE_LIST,
      isOpen,
      isLoading,
      isSelectLoading,
      form,
      searchTypePlaceholder,
      // methods
      onSubmit,
      onClose,
      searchByType,
      v$,
    }
  },
}
</script>
