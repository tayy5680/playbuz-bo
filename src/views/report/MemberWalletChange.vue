<template lang="pug">
.MemberWalletChange(v-loading="isLoading")
  el-card.search-block(shadow="never")
    el-form(inline label-position="left" size="small")
      el-form-item(:label="$t('起始時間')")
        el-date-picker(
          type="datetime"
          v-model="searchData.sDate"
          :disabled-date="getSDisabledDate"
          :clearable="false"
        )
      el-form-item(:label="$t('結束時間')")
        el-date-picker(
          type="datetime"
          v-model="searchData.eDate"
          :disabled-date="getEDisabledDate"
          :clearable="false"
        )
      el-form-item(:label="$t('幣別')")
        el-select(v-model="searchData.pointTypeId")
          template(v-for="option of POINT_TYPE_LIST" :key="option.id")
            el-option(:label="$t(option.name)" :value="option.id")
      el-form-item(:label="$t('異動類型')")
        el-select(v-model="searchData.changeTypeId")
          template(v-for="option of CHANGE_TYPE_LIST" :key="option.id")
            el-option(:label="$t(option.name)" :value="option.id")
      el-form-item(:label="$t('搜尋類型')")
        el-select(
          v-model="searchData.searchType"
          clearable
        )
          template(v-for="option of FETCH_TYPE_LIST" :key="option.key")
            el-option(:label="$t(option.name)" :value="option.key")
      el-form-item(:label="$t('搜尋資料')")
        el-input(v-model="searchData.searchString" :disabled="!searchData.searchType" clearable)
      el-form-item(:label="$t('模糊搜尋')")
        el-checkbox(v-model="searchData.isFuzzySearch" :disabled="!searchData.searchType")
      el-form-item(:label="$t('排除訪客')")
        el-checkbox(v-model="searchData.isExceptGuest")
      el-form-item
        el-button(
          type="primary"
          @click="handleFetch"
        ) {{$t('搜尋')}}
      el-form-item
        el-button(
          @click="initSearchData"
        ) {{$t('清除條件')}}
  .function-block
    .left
      PaginationComp(
        v-model:page="pagination.page"
        v-model:count="pagination.count"
        :totalCount="tableData.total"
        @change="handleChangePagination"
      )
    .right
  .table-block
    el-table(
      :data="tableData.rows"
      style="width: 100%"
      @sort-change="handleChangeSort"
    )
      el-table-column(:label="$t('序列')" prop="serialNumber" align="center")
        template(#="scope")
          span {{ scope.$index + 1 }}
      el-table-column(:label="$t('會員ID')" align="center" sortable="custom" min-width="90")
        template(#="scope")
          CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()")
      el-table-column(:label="$t('手機號')" min-width="160" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.PhoneNumber")
      el-table-column(:label="$t('會員暱稱')" min-width="180" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.NickName")
      el-table-column(:label="$t('會員信箱')" min-width="180" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.Email")
      el-table-column(:label="$t('異動類型')" min-width="140" align="center" sortable="custom")
        template(#="scope")
          span {{ $t(changeTypeIdFormatter(null, null, scope.row.ChangeTypeID).toString()) }}
      el-table-column(:label="$t('幣別')" align="center")
        template(#="scope")
          span {{ $t(pointTypeIdFormatter(null, null, scope.row.PointTypeID).toString()) }}
      el-table-column(:label="$t('異動前')" prop="BeforePoint" :formatter="pointFormatter" min-width="120" sortable="custom")
      el-table-column(:label="$t('異動量')" prop="ChangePoint" :formatter="pointFormatter" min-width="120" sortable="custom")
      el-table-column(:label="$t('異動後')" prop="AfterPoint" :formatter="pointFormatter" min-width="120" sortable="custom")
      el-table-column(:label="$t('時間')" min-width="165" sortable="custom")
        template(#="scope")
          span {{ timeFormatter(scope.row.CreateTime) }}
</template>
<script>
import { defineComponent, ref, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { createFormatter, timeFormatter, pointFormatter } from '@/utils/formatters'
import {
  POINT_TYPE_LIST as ORIGINAL_PAY_TYPE_LIST,
  CHANGE_TYPE_LIST as ORIGINAL_CHANGE_TYPE_LIST,
} from '@/configs'
import { getMemberWalletChangeReport } from '@/api/report'
import { useNotice } from '@/utils/use-notice'
import minMax from 'dayjs/plugin/minMax'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import i18n from '@/configs/locales'

const FETCH_TYPE_LIST = [
  // { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '會員信箱', key: 'Email' },
]

const POINT_TYPE_LIST = [
  { name: '全部', id: 0 },
].concat(ORIGINAL_PAY_TYPE_LIST)

const CHANGE_TYPE_LIST = [
  { name: '全部', id: 0 },
].concat(ORIGINAL_CHANGE_TYPE_LIST)

const SORT_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '會員信箱', key: 'Email' },
  { name: '時間', key: 'CreateTime' },
]

export default defineComponent({
  components: {
    PaginationComp,
    CopyableButton,
  },

  setup () {
    const { global: { t } } = i18n
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const initSearchData = () => {
      searchData.value = {
        sDate: dayjs().startOf('day').toDate(),
        eDate: dayjs().endOf('day').toDate(),
        pointTypeId: 0,
        changeTypeId: 0,
        searchType: undefined,
        searchString: '',
        isFuzzySearch: true,
        isExceptGuest: true,
      }
      pagination.value = {
        page: 1,
        count: 50,
      }
    }
    initSearchData()
    const sort = ref({})
    const initSort = () => {
      sort.value = {
        field: 'CreateTime',
        orderType: 'desc',
      }
    }
    initSort()
    const storeSearchData = useStoreForm({ searchData, pagination })
    watch(
      () => searchData.value.searchType,
      (newValue) => {
        if (!newValue) searchData.value.searchString = ''
      },
    )
    // 設定禁用日期 禁用今天到dayRange前之外的日期
    const dayRange = 182
    const getSDisabledDate = (date) => {
      return SDisabledDate(date, searchData.value.eDate, dayRange)
    }
    const getEDisabledDate = (date) => {
      return EDisabledDate(date, searchData.value.sDate, dayRange)
    }

    // 呈現資料相關
    const tableData = reactive({
      rows: [],
      total: 0,
    })
    const handleChangePagination = () => {
      handleFetch()
    }
    const handleFetch = async () => {
      const inputData = {
        ...searchData.value,
        ...pagination.value,
        ...sort.value,
        IsGuest: !searchData.value.isExceptGuest,
      }
      // 判斷日期先後
      dayjs.extend(minMax)
      const max = dayjs.max(dayjs(searchData.value.sDate), dayjs(searchData.value.eDate))
      if (max.$d.toString() !== dayjs(searchData.value.eDate).$d.toString()) {
        useNotice({ type: 'warning', message: t('搜尋資料格式錯誤'), allowDuplicate: true })
        return
      }
      inputData.startDate = dayjs(searchData.value.sDate)?.toISOString()
      inputData.endDate = dayjs(searchData.value.eDate)?.toISOString()

      if (searchData.value.searchType) inputData[searchData.value.searchType] = searchData.value.searchString
      loadingCountPlus()
      try {
        const res = await getMemberWalletChangeReport(inputData)
        tableData.rows = res.Data
        tableData.total = res.Count
        storeSearchData()
      } catch (error) {
        tableData.rows = []
        tableData.total = 0
      } finally {
        loadingCountMinus()
      }
    }
    useWatchRouterFetch(handleFetch)

    const handleChangeSort = ({ column, prop, order }) => {
      if (order === null) {
        initSort()
      } else {
        if (!prop) {
          const target = SORT_TYPE_LIST.find(element => element.name === column.label)
          if (target) sort.value.field = target.key
        } else sort.value.field = prop
        sort.value.orderType = order === 'ascending' ? 'asc' : 'desc'
      }
      pagination.value.page = 1
      handleFetch()
    }

    return {
      // data
      FETCH_TYPE_LIST,
      POINT_TYPE_LIST,
      CHANGE_TYPE_LIST,
      searchData,
      tableData,
      isLoading,
      pagination,
      // methods
      initSearchData,
      timeFormatter,
      changeTypeIdFormatter: createFormatter(CHANGE_TYPE_LIST, 'id', 'name'),
      pointTypeIdFormatter: createFormatter(POINT_TYPE_LIST, 'id', 'name'),
      pointFormatter,
      handleFetch,
      handleChangePagination,
      handleChangeSort,
      getSDisabledDate,
      getEDisabledDate,
    }
  },
})
</script>
<style lang="scss" scoped>
:deep(.el-card__body > *) {
  margin-left: 8px !important;
}
</style>
