<template>
  <el-button size="small" @click="() => isOpen = true">{{ $t('更新紀錄') }}</el-button>
  <el-dialog v-model="isOpen" :title="`${props.scope.row.MemberID} ${$t('更新紀錄')}`" :width="500">
    <el-form>
      <el-row class="ep-bg-purple">
        <el-col :span="12"> {{ $t('狀態') }} </el-col>
        <el-col :span="12"> {{ $t('建立時間') }}</el-col>
      </el-row>
      <template v-for="item in record" :key="item.id">
        <el-row>
          <el-col :span="12"> {{ item.StatusID? $t('停用') : $t('啟用') }} </el-col>
          <el-col :span="12"> {{ item.CreateTime? timeFormatter(item.CreateTime) : '' }} </el-col>
        </el-row>
      </template>
    </el-form>
  </el-dialog>
</template>

<script>
import { ref, watch } from 'vue'
import { getMemberStatusUpdateRecord } from '@/api/member'
import { timeFormatter } from '@/utils/formatters'

export default {

  props: {
    scope: {
      required: true,
      type: Object,
    },
  },

  setup (props) {
    const isOpen = ref(false)

    const record = ref([])

    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) {
          getMemberStatusUpdateRecord({
            MemberID: props.scope.row.MemberID,
          }).then((res) => {
            console.log(res)
            if (res.Status.Code === '0') {
              record.value = res.Data
            }
          })
        }
      },
    )

    return {
      isOpen,
      props,
      timeFormatter,
      record,
    }
  },
}
</script>
