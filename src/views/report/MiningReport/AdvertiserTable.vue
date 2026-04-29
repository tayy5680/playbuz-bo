<template lang="pug">
el-table.AdvertiserTable(
  :data="data"
  style="width: 100%"
  @sort-change="handleChangeSort"
)
  el-table-column(:label="$t('序列')" align="center")
    template(#="scope")
      span {{ scope.$index + 1 }}
  el-table-column(:label="$t('廣告加盟商')" min-width="230")
    template(#="scope")
      div {{$t('帳號')}}:&nbsp;
        CopyableButton(:modelValue="scope.row.MemberAccount")
      div {{$t('暱稱')}}:&nbsp;
        CopyableButton(:modelValue="scope.row.NickName")
      div {{$t('手機號')}}:&nbsp;
        CopyableButton(:modelValue="scope.row.PhoneNumber")
      div Email:&nbsp;
        CopyableButton(:modelValue="scope.row.Email")
  el-table-column(:label="$t('身份')" min-width="160" sortable="custom")
    template(#="scope")
      div {{ data[scope.$index].AdID ? AD_TYPE_INCLUDE_MEMBER_LIST.find(element => element.id === scope.row.AdID).name : $t('會員')}}
  el-table-column(:label="$t('直屬數量統計')" min-width="160" sortable="custom")
    template(#="scope")
      div(v-if="data[scope.$index].AdID && data[scope.$index].AdID !== 4") {{$t('加盟商總數')}}: {{ scope.row.SubAdTotal }}
      div {{$t('會員總數')}}: {{ data[scope.$index].AdID ? scope.row.SubMemberTotal : scope.row.IntroducedNumber}}
  el-table-column(:label="$t('個人等級')" min-width="170" sortable="custom")
    template(#="scope")
      div Lv: {{ $t(pointFormatter(null, null, scope.row.PersonalEnliven)) }}
  //- 1: 總廣告商, 2: A級廣告商, 3: B級廣告商 除了這些身份外不顯示廣告加盟商欄位
  el-table-column(
    v-if="data?.find(element => [1, 2, 3].includes(element.AdID))"
    :label="$t('加盟商等級')" min-width="170" sortable="custom")
    template(#="scope")
      //- 1: 總廣告商, 2: A級廣告商, 3: B級廣告商, 4: C級廣告商
      div.text-link-button(
        @click="upMemberIDchange(scope.row.MemberID, 0)"
      ) Lv: {{ pointFormatter(null, null, scope.row.MyNoneAgmEnliven) }}
  el-table-column(:label="$t('會員等級')" min-width="170" sortable="custom")
    template(#="scope")
      div.text-link-button(
        v-if="[1, 2, 3, 4].includes(scope.row.AdID)"
        @click="upMemberIDchange(scope.row.MemberID, 1)"
      ) Lv: {{ pointFormatter(null, null, scope.row.MyAgmEnliven)}}
      div.text-link-button(
        v-else
        @click="upMemberIDchange(scope.row.MemberID, 1)"
      ) Lv: {{ pointFormatter(null, null, scope.row.MemberEnliven) }}
  el-table-column(:label="$t('總計')" min-width="160" sortable="custom")
    template(#="scope")
      div Lv{{$t('總計')}}: {{ data[scope.$index].AdID ? pointFormatter(null, null, scope.row.EnlivenTotal) : pointFormatter(null, null, scope.row.TotalEnliven)}}
</template>
<script>
import { pointFormatter } from '@/utils/formatters'
import CopyableButton from '@/components/CopyableButton'
import { AD_TYPE_INCLUDE_MEMBER_LIST } from '@/configs'

export default {
  props: {
    data: {
      required: true,
      type: Array,
    },
  },

  emits: ['upMemberIDchange', 'sortData'],

  components: {
    CopyableButton,
  },

  setup (props, context) {
    const upMemberIDchange = (id, type) => {
      context.emit('upMemberIDchange', id, type)
    }

    const handleChangeSort = ({ column, prop, order }) => {
      const obj = {
        column, prop, order,
      }
      context.emit('sortData', obj)
    }

    return {
      upMemberIDchange,
      pointFormatter,
      handleChangeSort,
      AD_TYPE_INCLUDE_MEMBER_LIST,
    }
  },
}
</script>
