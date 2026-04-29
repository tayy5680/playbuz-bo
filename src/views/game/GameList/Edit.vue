<template>
  <el-button
    @click="() => isOpen = true"
    type="primary"
    size="small"
  >
    {{ $t('編輯') }}
  </el-button>
  <el-dialog
    v-if="isOpen"
    v-model="isOpen"
    :before-close="onClose"
    :title="$t('編輯遊戲')"
    center
  >
    <el-form
      v-loading="isLoading"
      label-position="left"
      label-width="auto"
      size="small"
    >
      <el-form-item :label="$t('遊戲商')">
        <el-select
          v-model="form.GameProviderID"
          disabled
          @blur="v$.GameProviderID.$touch"
          :class="{'--invalid': v$.GameProviderID.$invalid && v$.GameProviderID.$dirty}"
        >
          <template
            v-for="option of GAME_PROVIDER_LIST"
            :key="option.id"
          >
            <el-option
              :label="$t(option.name)"
              :value="option.id"
            />
          </template>
        </el-select>
        <FormErrors :v$="v$.GameProviderID" />
      </el-form-item>
      <el-form-item :label="$t('遊戲類型')">
        <el-select
          v-model="form.GameTypeID"
          disabled
          @blur="v$.GameTypeID.$touch"
          :class="{'--invalid': v$.GameTypeID.$invalid && v$.GameTypeID.$dirty}"
        >
          <template
            v-for="option of GAME_TYPE_LIST"
            :key="option.id"
          >
            <el-option
              :label="$t(option.name)"
              :value="option.id"
            />
          </template>
        </el-select>
        <FormErrors :v$="v$.GameTypeID" />
      </el-form-item>
      <el-form-item :label="$t('遊戲ID')">
        <el-input
          v-model="form.GameID"
          disabled
          @blur="v$.GameID.$touch"
          :class="{'--invalid': v$.GameID.$invalid && v$.GameID.$dirty}"
        />
        <FormErrors :v$="v$.GameID" />
      </el-form-item>
      <el-form-item :label="$t('遊戲商遊戲ID')">
        <el-input
          v-model="form.GameProviderGameID"
          disabled
          @blur="v$.GameProviderGameID.$touch"
          :class="{'--invalid': v$.GameProviderGameID.$invalid && v$.GameProviderGameID.$dirty}"
        />
        <FormErrors :v$="v$.GameProviderGameID" />
      </el-form-item>
      <el-form-item :label="$t('遊戲名稱(繁體)')">
        <el-input
          v-model="form.TraditionalChinese"
          @blur="v$.TraditionalChinese.$touch"
          :class="{'--invalid': v$.TraditionalChinese.$invalid && v$.TraditionalChinese.$dirty}"
        />
        <FormErrors :v$="v$.TraditionalChinese" />
      </el-form-item>
      <el-form-item :label="$t('遊戲排序')">
        <el-input
          v-model="form.FrontSort"
          @blur="v$.FrontSort.$touch"
          :class="{'--invalid': v$.FrontSort.$invalid && v$.FrontSort.$dirty}"
        />
        <FormErrors :v$="v$.FrontSort" />
      </el-form-item>
      <el-form-item :label="$t('遊戲狀態-金幣')">
        <el-switch v-model="form.GoldState" />
      </el-form-item>
      <el-form-item :label="$t('遊戲狀態-銀幣')">
        <el-switch v-model="form.SilverState" />
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
import { ref, reactive, watch } from 'vue'
import { loadingCounter } from '@/utils/loading-counter'
import { useNotice } from '@/utils/use-notice'
import { useValidator, required, integer } from '@/utils/use-validator'
import FormErrors from '@/components/FormErrors'
import { GAME_PROVIDER_LIST, GAME_TYPE_LIST } from '@/configs'
import { editGame } from '@/api/game'

export default {
  components: {
    FormErrors,
  },

  emits: ['success'],

  props: {
    row: {
      required: true,
      type: Object,
    },
  },

  setup (props, context) {
    const isOpen = ref(false)
    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) initForm()
      },
    )

    // 表單資料相關
    const form = reactive({})
    const initForm = () => {
      form.GameID = props.row.GameID
      form.GameTypeID = props.row.GameTypeID
      form.GameProviderID = props.row.GameProviderID
      form.GameProviderGameID = props.row.GameProviderGameID
      form.FrontSort = props.row.FrontSort
      // 以下出入不一致需注意
      form.TraditionalChinese = props.row.GameName
      form.GoldState = props.row.GoldStatus
      form.SilverState = props.row.SilverStatus
    }
    initForm()

    const rules = {
      GameID: {
        required: required(),
        integer: integer(),
      },
      GameTypeID: {
        required: required(),
      },
      GameProviderID: {
        required: required(),
      },
      GameProviderGameID: {
        required: required(),
        integer: integer(),
      },
      FrontSort: {
        required: required(),
        integer: integer(),
      },
      TraditionalChinese: {
        required: required(),
      },
    }
    const v$ = useValidator(rules, form)

    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    const onSubmit = async () => {
      v$.value.$touch()
      if (v$.value.$error) return useNotice({ type: 'warning', message: '內容輸入錯誤', allowDuplicate: true })

      loadingCountPlus()
      try {
        await editGame({
          ...form,
          GameID: parseInt(form.GameID),
          GameProviderGameID: form.GameProviderGameID.toString(),
        })
        context.emit('success')
        useNotice({ type: 'success', message: '成功' })
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
      // data
      GAME_PROVIDER_LIST,
      GAME_TYPE_LIST,
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
