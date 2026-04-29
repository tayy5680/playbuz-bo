<template lang="pug">
.MiningReport(v-loading="isLoading")
  el-card.search-block(shadow="never")
    el-form(inline label-position="left" size="small")
      el-form-item(:label="$t('搜尋對象')")
        el-select(
          v-model="searchData.TargetType"
        )
          template(v-for="option of TABLE_TYPE_LIST" :key="option.key")
            el-option(:label="$t(option.name)" :value="option.key")
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
  el-card.search-block(v-if="hasUpMemberID" shadow="never")
    Breadcrumb(
      :pathArr="advertiserPath"
      @queryChange="upMemberIDchange"
    )
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
    AdvertiserTable(
      :data="tableData.rows"
      @upMemberIDchange="upMemberIDchange"
      @sortData="sortData"
    )
</template>
<script>
import { defineComponent, ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { useNotice } from '@/utils/use-notice'
import { createFormatter } from '@/utils/formatters'
import { getMiningReport } from '@/api/report'
import { getAdvertiserPath } from '@/api/advertiser'
import { POINT_TYPE_LIST } from '@/configs'
import Breadcrumb from './Breadcrumb'
import MemberTable from './MemberTable'
import AdvertiserTable from './AdvertiserTable'
import minMax from 'dayjs/plugin/minMax'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import i18n from '@/configs/locales'
const RAW_TABLE_TYPE_LIST = [
  { name: '會員', key: 1 },
  { name: '廣告加盟商', key: 0 },
]

const FETCH_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '會員帳號', key: 'MemberAccount' },
  { name: '會員信箱', key: 'Email' },
]

const SORT_TYPE_LIST = [
  { name: '會員資訊', key: 'MemberID' },
  { name: '本人活躍度與礦產值', key: 'PersonalEnliven' },
  { name: '下層數量統計', key: 'UpperAd' },
  { name: '下層活躍度與礦產值', key: 'SubEnliven' },
  { name: '個人等級', key: 'PersonalEnliven' },
  { name: '直屬數量統計', key: 'SubMemberTotal' },
  { name: '加盟商等級', key: 'MyNoneAgmEnliven' },
  { name: '會員等級', key: 'MyAgmEnliven' },
  { name: '總計', key: 'EnlivenTotal' },
]

export default defineComponent({
  components: {
    PaginationComp,
    CopyableButton,
    Breadcrumb,
    MemberTable,
    AdvertiserTable,
  },

  setup () {
    const { global: { t } } = i18n
    const TABLE_TYPE_LIST = computed(() => {
      return RAW_TABLE_TYPE_LIST
    })
    // 廣告加盟商的路徑顯示
    const route = useRoute()
    const hasUpMemberID = computed(() => {
      try {
        const memberID = JSON.parse(decodeURIComponent(route.query?.searchData))?.UpMemberID
        return !['', undefined].includes(memberID)
      } catch {
        return false
      }
    })
    const advertiserPath = ref([])

    const upMemberIDchange = (UpMemberID, type) => {
      searchData.value.TargetType = type
      if (searchData.value.searchType) {
        searchData.value.searchType = undefined
        searchData.value.searchString = ''
      }
      searchData.value.UpMemberID = UpMemberID
      handleFetch()
    }

    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const displayTargetType = computed(() => JSON.parse(decodeURIComponent(route.query?.searchData ?? null))?.TargetType ?? null)
    const initSearchData = () => {
      searchData.value = {
        UpMemberID: undefined,
        // 預設搜尋第0項
        TargetType: JSON.parse(decodeURIComponent(route.query?.searchData ?? null))?.TargetType ?? TABLE_TYPE_LIST.value[0].key,
        sDate: dayjs().startOf('day').toDate(),
        eDate: dayjs().endOf('day').toDate(),
        searchType: undefined,
        searchString: '',
        isFuzzySearch: true,
        isExceptGuest: true,
        // 總是排除非0資料
        IsActive: true,
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
        field: 'MemberID',
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
        const res = await getMiningReport(inputData)
        tableData.rows = res.Data
        tableData.total = res.Count
        if (inputData.UpMemberID) {
          const res2 = await getAdvertiserPath({ MemberID: inputData.UpMemberID })
          advertiserPath.value = res2.Data.reverse()
        }
        storeSearchData()
      } catch (error) {
        tableData.rows = []
        tableData.total = 0
        advertiserPath.value = []
      } finally {
        loadingCountMinus()
      }
    }

    useWatchRouterFetch(handleFetch)
    watch(sort, () => {
      pagination.value.page = 1
      handleFetch()
    }, { deep: true })
    const sortData = (obj) => {
      if (obj.order === null) {
        initSort()
      } else {
        if (!obj.prop) {
          const target = SORT_TYPE_LIST.find(element => element.name === obj.column.label)
          if (target) sort.value.field = target.key
        } else sort.value.field = obj.prop
        sort.value.orderType = obj.order === 'ascending' ? 'asc' : 'desc'
      }
    }

    return {
      // data
      POINT_TYPE_LIST,
      TABLE_TYPE_LIST,
      FETCH_TYPE_LIST,
      hasUpMemberID,
      advertiserPath,
      displayTargetType,
      searchData,
      isLoading,
      tableData,
      pagination,
      // methods
      initSearchData,
      pointTypeIdFormatter: createFormatter(POINT_TYPE_LIST, 'id', 'name'),
      upMemberIDchange,
      handleFetch,
      handleChangePagination,
      sortData,
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
