<template lang="pug">
el-table.MemberTable(
  :data="data"
  style="width: 100%"
  @sort-change="handleChangeSort"
)
  el-table-column(:label="$t('序列')" align="center")
    template(#="scope")
      span {{ scope.$index + 1 }}
  el-table-column(:label="$t('會員資訊')" min-width="230" sortable="custom")
    template(#="scope")
      div {{$t('暱稱')}}:&nbsp;
        CopyableButton(:modelValue="scope.row.NickName")
      div {{$t('會員ID')}}:&nbsp;
        CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()")
      div {{$t('手機號')}}:&nbsp;
        CopyableButton(:modelValue="scope.row.PhoneNumber")
      div Email:&nbsp;
        CopyableButton(:modelValue="scope.row.Email")
  el-table-column(:label="$t('本人活躍度與礦產值')" min-width="180" sortable="custom")
    template(#="scope")
      div {{$t('活躍度')}}: {{ pointFormatter(null, null, scope.row.PersonalEnliven) }}
      div {{$t('礦產值')}}: {{ pointFormatter(null, null, scope.row.PersonalMineral) }}
  el-table-column(label="Return from random pool" prop="Rta" :formatter="pointFormatter" min-width="200" align="center")
  el-table-column(:label="$t('邀請人數')" prop="IntroducedNumber" align="center" min-width="100" sortable="custom")
  el-table-column(label="As a upper" prop="Rtu" :formatter="pointFormatter" min-width="100" align="center")
  el-table-column(:label="$t('實得總計')" prop="Total" :formatter="pointFormatter" align="center" min-width="100" sortable="custom")
</template>
<script>
import { pointFormatter } from '@/utils/formatters'
import CopyableButton from '@/components/CopyableButton'

export default {
  props: {
    data: {
      required: true,
      type: Array,
    },
  },

  components: {
    CopyableButton,
  },

  emits: ['sortData'],

  setup (props, context) {
    const handleChangeSort = ({ column, prop, order }) => {
      const obj = {
        column, prop, order,
      }
      context.emit('sortData', obj)
    }
    return {
      pointFormatter,
      handleChangeSort,
    }
  },
}
</script>
