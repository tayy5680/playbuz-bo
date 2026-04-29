<template>
  <el-button size="small" @click="() => isOpen = true">{{ $t('編輯') }}</el-button>
  <el-dialog v-model="isOpen" :title="$t('編輯')" :width="500">
    <el-form>
      <el-form-item :label="$t('會員ID')" prop="MemberID">{{ props.scope.row.MemberID }}</el-form-item>
      <el-form-item :label="$t('狀態')">
        <el-select v-model="status">
          <el-option v-for="type in STATUS_TYPE_LIST" :key="type.id" :label="$t(type.name)" :value="type.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="() => isOpen = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="submit">
          {{ $t('確定') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { updateMemberStatus } from '@/api/member'
import { useNotice } from '@/utils/use-notice'
import i18n from '@/configs/locales'

const STATUS_TYPE_LIST = [
  { name: '啟用', id: 0 },
  { name: '停用', id: 1 },
]

export default {

  props: {
    scope: {
      required: true,
      type: Object,
    },
  },

  emits: ['update'],

  setup (props, context) {
    const isOpen = ref(false)
    const status = ref(0)

    const { global: { t } } = i18n

    const submit = () => {
      console.log('hi')

      updateMemberStatus({
        MemberID: props.scope.row.MemberID,
        StatusID: status.value,
      }).then((res) => {
        console.log(res)
        if (res.Status.Code === '0') {
          useNotice({ type: 'success', message: t('修改成功'), allowDuplicate: true })
          isOpen.value = false
          context.emit('update')
        } else {
          useNotice({ type: 'error', message: res.Status.Message, allowDuplicate: true })
        }
      })
    }

    watch(
      () => isOpen.value,
      (newValue) => {
        // console.log(newValue)
        status.value = JSON.parse(JSON.stringify(props.scope.row.StatusID))
      },
    )

    return {
      isOpen,
      props,
      status,
      STATUS_TYPE_LIST,
      submit,
    }
  },
}
</script>

<style lang="scss" scoped>
  .dialog-footer {
    :deep(.el-button) {
      margin-left: 10px !important;
    }
  }
</style>
