<template lang="pug">
.CSPointChangeRecord(v-loading="isLoading")
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
      el-form-item
        el-button(
          type="primary"
          @click="handleFetch"
        ) {{$t('搜尋')}}
      el-form-item
        el-button(
          @click="initSearchData"
        ) {{$t('清除條件')}}
  .function-block(:class="{'--is-mobile': isMobile}")
    .left
      pagination-comp(
        v-model:page="pagination.page"
        v-model:count="pagination.count"
        :totalCount="tableData.total"
        @change="handleChangePagination"
      )
    .right
      Change(@success="handleFetch(true)")
  .table-block
    el-table(:data="tableData.rows" @sort-change="handleChangeSort")
      el-table-column(:label="$t('序列')" prop="serialNumber" align="center")
        template(#="scope")
          span {{ scope.$index + 1 }}
      el-table-column(:label="$t('平台交易碼')" min-width="120" align="center" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.TransID")
      el-table-column(:label="$t('會員ID')" min-width="90" sortable="custom")
        template(#="scope")
          span.text-link-button(@click="handleClickTableColumns(scope)" type="text") {{ scope.row.MemberID }}
          CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()" :buttonOnly="true")
      el-table-column(:label="$t('手機號')" min-width="160" sortable="custom")
        template(#="scope")
          span.text-link-button(@click="handleClickTableColumns(scope)" type="text") {{ scope.row.PhoneNumber }}
          CopyableButton(:modelValue="scope.row.PhoneNumber" :buttonOnly="true")
      el-table-column(:label="$t('會員暱稱')" min-width="160" sortable="custom")
        template(#="scope")
          span.text-link-button(@click="handleClickTableColumns(scope)" type="text") {{ scope.row.NickName }}
          CopyableButton(:modelValue="scope.row.NickName" :buttonOnly="true")
      el-table-column(:label="$t('會員信箱')" min-width="160" sortable="custom")
        template(#="scope")
          span.text-link-button(@click="handleClickTableColumns(scope)" type="text") {{ scope.row.Email }}
          CopyableButton(:modelValue="scope.row.Email" :buttonOnly="true")
      el-table-column(:label="$t('理由')" prop="Note" align="center")
        template(#="scope")
          span {{ scope.row.Note || '-' }}
      el-table-column(:label="$t('幣別')" align="center" sortable="custom")
        template(#="scope")
          span {{ $t(pointTypeIdFormatter(null, null, scope.row.PointTypeID).toString()) }}
      el-table-column(:label="$t('補/扣點')" prop="Point" :formatter="pointFormatter" align="center" min-width="100" sortable="custom")
      el-table-column(:label="$t('狀態')" prop="StatusID" align="center" sortable="custom")
        template(#="scope")
          span(:class="{ 'warning-text': statusTypeFormatter(null, null, scope.row.StatusID) === '失敗' }") {{ $t(statusTypeFormatter(null, null, scope.row.StatusID)) }}
      el-table-column(:label="$t('時間')" prop="CreateTime" min-width="165" sortable="custom")
        template(#="scope")
          span {{ timeFormatter(scope.row.CreateTime) }}
      el-table-column(:label="$t('當日補點次數')" prop="AddCount" min-width="130" align="center" sortable="custom")
        //- template(#="scope")
        //-   .text-link-button(@click="handleClickTableColumns(scope)" type="text") {{ scope.row.AddCount }}
      el-table-column(:label="$t('當日扣點次數')" prop="MinusCount" min-width="130" align="center" sortable="custom")
      el-table-column(:label="$t('異動人員')" prop="OperatorNickName" min-width="130" align="center" sortable="custom")
        //- template(#="scope")
        //-   .text-link-button(@click="handleClickTableColumns(scope)" type="text") {{ scope.row.MinusCount }}
</template>

<script>
import { defineComponent, ref, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { testIsMobile } from '@/utils'
import Change from './Change'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { createFormatter, timeFormatter, pointFormatter } from '@/utils/formatters'
import { getCustomerServiceChangeRecord } from '@/api/member'
import { POINT_TYPE_LIST } from '@/configs'
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

const STATUS_TYPE_LIST = [
  { name: '成功', id: 0 },
  { name: '失敗', id: 1 },
]

const SORT_TYPE_LIST = [
  { name: '平台交易碼', key: 'TransID' },
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '會員信箱', key: 'Email' },
  { name: '上層廣告加盟商', key: 'UpNickName' },
  { name: '狀態', key: 'StatusID' },
  { name: '時間', key: 'CreateTime' },
  { name: '當日補點次數', key: 'AddCount' },
  { name: '當日扣點次數', key: 'MinusCount' },
]

export default defineComponent({
  name: 'CSPointChangeRecord',

  components: {
    PaginationComp,
    CopyableButton,
    Change,
  },

  setup () {
    const { global: { t } } = i18n
    const isMobile = testIsMobile()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const initSearchData = () => {
      searchData.value = {
        sDate: dayjs().subtract(6, 'day').startOf('day').toDate(),
        eDate: dayjs().endOf('day').toDate(),
        searchType: undefined,
        searchString: '',
        isFuzzySearch: true,
      }
      pagination.value = {
        page: 1,
        count: 50,
      }
    }
    initSearchData()
    const storeSearchData = useStoreForm({ searchData, pagination })
    watch(
      () => searchData.value.searchType,
      (newValue) => {
        if (!newValue) searchData.value.searchString = ''
      },
    )
    // 設定禁用日期 禁用今天到dayRange前之外的日期
    const dayRange = 62
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
    const sort = ref({})
    const initSort = () => {
      sort.value = {
        field: 'CreateTime',
        orderType: 'desc',
      }
    }
    const handleFetch = async (noCache) => {
      const inputData = {
        ...searchData.value,
        ...pagination.value,
        ...sort.value,
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
        const res = await getCustomerServiceChangeRecord(inputData, noCache)
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

    const handleChangePagination = () => {
      handleFetch()
    }

    const handleClickTableColumns = (scope) => {
      initSearchData()
      searchData.value.searchType = 'NickName'
      searchData.value.searchString = scope.row.NickName
      searchData.value.isFuzzySearch = false
      handleFetch()
    }

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
      isMobile,
      isLoading,
      searchData,
      tableData,
      pagination,
      handleFetch,
      handleChangePagination,
      handleClickTableColumns,
      initSearchData,
      handleChangeSort,

      FETCH_TYPE_LIST,
      fetchTypeFormatter: createFormatter(FETCH_TYPE_LIST, 'id', 'name'),
      statusTypeFormatter: createFormatter(STATUS_TYPE_LIST, 'id', 'name'),
      pointTypeIdFormatter: createFormatter(POINT_TYPE_LIST, 'id', 'name'),
      pointFormatter,
      timeFormatter,
      getSDisabledDate,
      getEDisabledDate,

    }
  },
})
</script>
