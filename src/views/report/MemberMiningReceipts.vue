<template lang="pug">
.MemberMiningReceipts(v-loading="isLoading")
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
      el-table-column(:label="$t('會員ID')" align="center" min-width="90" sortable="custom")
        template(#="scope")
          CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()")
      el-table-column(:label="$t('手機號')" min-width="160" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.PhoneNumber")
      el-table-column(:label="$t('會員暱稱')" min-width="190" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.NickName")
      el-table-column(:label="$t('會員信箱')" min-width="190" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.Email")
      el-table-column(:label="$t('幣別')" align="center")
        template(#="scope")
          span {{ $t(pointTypeIdFormatter(null, null, scope.row.PointTypeID).toString()) }}
      el-table-column(:label="$t('點數')" prop="Point" :formatter="pointFormatter" min-width="120" sortable="custom")
      el-table-column(:label="$t('時間')" min-width="165" sortable="custom")
        template(#="scope")
          span {{ timeFormatter(scope.row.CreateTime) }}
</template>
<script>
import { defineComponent, ref, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { useNotice } from '@/utils/use-notice'
import { getMemberMiningReceipts } from '@/api/report'
import { createFormatter, timeFormatter, pointFormatter } from '@/utils/formatters'
import { POINT_TYPE_LIST } from '@/configs'
import minMax from 'dayjs/plugin/minMax'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import i18n from '@/configs/locales'

const FETCH_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '會員信箱', key: 'Email' },
]

const SORT_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '時間', key: 'CreateTime' },
  { name: '會員信箱', key: 'Email' },
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
    const sort = ref({})
    const initSort = () => {
      sort.value = {
        field: 'CreateTime',
        orderType: 'desc',
      }
    }
    const handleChangePagination = () => {
      handleFetch()
    }
    const handleFetch = async () => {
      // 檢查MemberID
      if (searchData.value.searchType === 'MemberID' && !/^[0-9]+$/.test(searchData.value.searchString)) {
        useNotice({ type: 'warning', message: t('搜尋資料格式錯誤'), allowDuplicate: true })
        return
      }
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
        const res = await getMemberMiningReceipts(inputData)
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
      POINT_TYPE_LIST,
      FETCH_TYPE_LIST,
      searchData,
      isLoading,
      tableData,
      pagination,
      // methods
      initSearchData,
      timeFormatter,
      pointFormatter,
      pointTypeIdFormatter: createFormatter(POINT_TYPE_LIST, 'id', 'name'),
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
