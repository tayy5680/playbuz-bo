<template lang="pug">
div(v-loading="isLoading")
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
      //- TODO: 缺少欄位
      //- el-form-item(label="金流類型")
      //-   el-select(v-model="searchData.prodId" clearable)
      //-     template(v-for="option of PROD_LIST" :key="option.id")
      //-       el-option(:label="option.name" :value="option.id")
      el-form-item(:label="$t('訂單狀態')")
        el-select(v-model="searchData.StoredStatusID" clearable)
          template(v-for="option of STORED_STATUS_LIST" :key="option.id")
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
      pagination-comp(v-model:page="pagination.page" v-model:count="pagination.count" :totalCount="tableData.total" @change="handleChangePagination")

    .right
      el-button(:loading="isLoading" @click="xslx" type="primary" size="small") {{$t('匯出報表')}}
  .table-block
    el-table(:data="tableData.rows" @sort-change="handleChangeSort")
      el-table-column(:label="$t('平台交易碼')" prop="TransID" min-width="120" align="center" sortable="custom")
      el-table-column(:label="$t('會員ID')" sortable="custom" min-width="90")
        template(#="scope")
          span.text-link-button(@click="() => handleClickTableColumns(scope)") {{ scope.row.MemberID}}
          CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()" :buttonOnly="true")
      el-table-column(:label="$t('手機號')" sortable="custom" min-width="160")
        template(#="scope")
          span.text-link-button(@click="() => handleClickTableColumns(scope)") {{ scope.row.PhoneNumber}}
          CopyableButton(:modelValue="scope.row.PhoneNumber" :buttonOnly="true")
      el-table-column(:label="$t('會員暱稱')" sortable="custom" min-width="160")
        template(#="scope")
          span.text-link-button(@click="() => handleClickTableColumns(scope)") {{ scope.row.NickName}}
          CopyableButton(:modelValue="scope.row.NickName" :buttonOnly="true")
      el-table-column(:label="$t('會員信箱')" sortable="custom" min-width="160")
        template(#="scope")
          span.text-link-button(@click="() => handleClickTableColumns(scope)") {{ scope.row.Email}}
          CopyableButton(:modelValue="scope.row.Email" :buttonOnly="true")
      el-table-column(:label="$t('訂單狀態')" sortable="custom" prop="StoredStatusID" :formatter="storedStatusFormatter" align="center" min-width="120")
        template(#="scope")
          div {{ $t(storedStatusFormatter(null, null, scope.row.StoredStatusID).toString()) }}
      el-table-column(:label="$t('禮包')" prop="PackageName" align="center" min-width="120" sortable="custom")
      el-table-column(:label="$t('金額')" sortable="custom" min-width="120")
        template(#="scope")
          div {{ pointFormatter(null, null, scope.row.ExpectedPaymentAmount) }}
      el-table-column(:label="$t('金流商交易碼')" sortable="custom" min-width="170" align="center")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.SESS_ID")
      el-table-column(:label="$t('發票號碼')" align="center" min-width="140")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.Invoice")
      el-table-column(:label="$t('金流')" prop="PROD_ID" :formatter="prodFormatter" align="center" min-width="140" sortable="custom")
      el-table-column(:label="$t('異動前')" sortable="custom" min-width="160")
        template(#="scope")
          template(v-if="scope.row.StoredStatusID === 1")
            div {{$t('金幣')}}: {{ pointFormatter(null, null, scope.row.GoldBeforePoint) }}
            div {{$t('銀幣')}}: {{ pointFormatter(null, null, scope.row.SilverBeforePoint) }}
          template(v-else)
            span -
      el-table-column(:label="$t('異動金額')" sortable="custom" min-width="160")
        template(#="scope")
          template(v-if="scope.row.StoredStatusID === 1")
            div {{$t('金幣')}}: {{ pointFormatter(null, null, scope.row.GoldChangePoint) }}
            div {{$t('銀幣')}}: {{ pointFormatter(null, null, scope.row.SilverChangePoint) }}
          template(v-else)
            span -
      el-table-column(:label="$t('異動後')" sortable="custom" min-width="160")
        template(#="scope")
          template(v-if="scope.row.StoredStatusID === 1")
            div {{$t('金幣')}}: {{ pointFormatter(null, null, scope.row.GoldAfterPoint) }}
            div {{$t('銀幣')}}: {{ pointFormatter(null, null, scope.row.SilverAfterPoint) }}
          template(v-else)
            span -
      el-table-column(:label="$t('實際點數')" sortable="custom" min-width="160")
        template(#="scope")
          template(v-if="scope.row.StoredStatusID === 1")
            div {{$t('金幣')}}: {{ pointFormatter(null, null, scope.row.ActuallyGoldPoint) }}
            div {{$t('銀幣')}}: {{ pointFormatter(null, null, scope.row.SilverChangePoint) }}
          template(v-else)
            span -
      el-table-column(:label="$t('贈送點數')" sortable="custom" min-width="160")
        template(#="scope")
          template(v-if="scope.row.StoredStatusID === 1")
            div {{$t('金幣')}}: {{ pointFormatter(null, null, scope.row.ExtraGoldPoint) }}
            div {{$t('銀幣')}}: {{ pointFormatter(null, null, scope.row.ExtraSilverPoint) }}
          template(v-else)
          span -
      el-table-column(:label="$t('額外內容')" min-width="160")
        template(#="scope")
          template(v-for="item of formatOtherAwardList(scope.row.ItemData)")
            div(
              v-if="item.amount"
              :key="item.id"
            ) {{`${$t(item.label)}: ${item.amount}`}}
      el-table-column(:label="$t('建立時間')" sortable="custom" min-width="165")
        template(#="scope")
          span {{ timeFormatter(scope.row.CreateTime) }}
      el-table-column(:label="$t('付款時間')" sortable="custom" min-width="165")
        template(#="scope")
          span {{ timeFormatter(scope.row.PaymentTime) }}
      el-table-column(:label="$t('操作')" :min-width="locale.includes('en')? 140 : 120" align="center" :fixed="isMobile ? false : 'right'")
        template(#="scope")
          div.control
            InvoiceDetail(:scope="scope")
            el-button(v-if="!scope.row.StoredStatusID" size="small" @click="() => completeOrderManually(scope.row.TransID)") {{ $t('手動履約') }}
</template>

<script>
import { defineComponent, ref, reactive, watch } from 'vue'
import dayjs from 'dayjs'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { testIsMobile } from '@/utils'
import InvoiceDetail from './InvoiceDetail'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { createFormatter, timeFormatter, pointFormatter } from '@/utils/formatters'
import { getMemberDepositReport, completeOrder } from '@/api/report'
import { PAY_TYPE_LIST } from '@/configs'
import { useNotice } from '@/utils/use-notice'
import minMax from 'dayjs/plugin/minMax'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import i18n from '@/configs/locales'
import { outputXlsx } from '@/utils/outputXlsx'

const PROD_LIST = [
  { name: '全部', id: 0 },
].concat(PAY_TYPE_LIST)

const STORED_STATUS_LIST = [
  { name: '全部', id: -1 },
  { name: '訂單成立', id: 0 },
  { name: '確定支付', id: 1 },
  { name: '取消', id: 2 },
  { name: '異常', id: 3 },
  { name: '系統取消訂單', id: 4 },
]

const FETCH_TYPE_LIST = [
  // { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '會員信箱', key: 'Email' },
  { name: '平台交易碼', key: 'TransID' },
  { name: '金流商交易碼', key: 'SESS_ID' },
  { name: '電子發票交易碼', key: 'InvoiceNumber' },
]

const SORT_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '會員信箱', key: 'Email' },
  { name: '平台交易碼', key: 'TransID' },
  { name: '金流商交易碼', key: 'SESS_ID' },
  { name: '電子發票交易碼', key: 'InvoiceNumber' },
  { name: '金額', key: 'ExpectedPaymentAmount' },
  { name: '建立時間', key: 'CreateTime' },
  { name: '付款時間', key: 'PaymentTime' },
  { name: '異動前', key: 'GoldBeforePoint' },
  { name: '異動金額', key: 'GoldChangePoint' },
  { name: '異動後', key: 'GoldAfterPoint' },
]

export default defineComponent({
  name: 'MemberDeposit',

  components: {
    PaginationComp,
    CopyableButton,
    InvoiceDetail,
  },

  setup () {
    const { global: { t, locale } } = i18n
    const isMobile = testIsMobile()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const sort = ref({})
    const initSort = () => {
      sort.value = {
        field: 'CreateTime',
        orderType: 'desc',
      }
    }
    initSort()
    const initSearchData = () => {
      searchData.value = {
        sDate: dayjs().subtract(6, 'day').startOf('day').toDate(),
        eDate: dayjs().endOf('day').toDate(),
        StoredStatusID: -1,
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
    const storeSearchData = useStoreForm({ searchData, pagination, sort })
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
    const handleFetch = async () => {
      const inputData = {
        ...searchData.value,
        ...sort.value,
        ...pagination.value,
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
        const res = await getMemberDepositReport(inputData)
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

    const handleClickTableColumns = (scope) => {
      initSearchData()
      searchData.value.searchType = 'NickName'
      searchData.value.searchString = scope.row.NickName
      searchData.value.isFuzzySearch = false
      handleFetch()
    }

    const itemLabel = {
      GoldPoint: '金幣',
      SilverPoint: '銀幣',
      Exp: '經驗值',
    }

    const itemFormat = [
      ['GoldPoint', 'GoldPoint'],
      ['SilverPoint', 'SilverPoint'],
      ['Exp', 'Exp'],
      ['HeadPhotoFrame', 1],
      ['ItemName', 'ItemQuantity'],
      ['SkinName', 1],
      ['CanName', 'CanQuantity'],
    ]

    const formatOtherAwardList = (obj) => {
      return itemFormat.reduce((acc, cur) => {
        const target = {
          id: cur[0]?.toLowerCase() ?? '',
          label: itemLabel[cur[0]] ?? obj[cur[0]] ?? '',
          amount: obj[cur[1]] ?? parseInt(cur[1]) ?? 0,
        }

        return Object.values(target).includes('') ? acc : acc.concat(target)
      }, [])
    }

    // 匯出用資料以及排序
    const xslx = () => {
      if (!tableData.rows.length) return useNotice({ type: 'warning', message: t('查無資料'), allowDuplicate: true })
      const translatedTitles = {
        TransID: t('平台交易碼'),
        MemberID: t('會員ID'),
        PhoneNumber: t('手機號'),
        NickName: t('會員暱稱'),
        Email: t('會員信箱'),
        SESS_ID: t('金流商交易碼'),
        Invoice: t('發票號碼'),
        PROD_ID: t('金流'),
        StoredStatusID: t('訂單狀態'),
        PackageName: t('禮包'),
        ExpectedPaymentAmount: t('金額'),
        GoldBeforePoint: `${t('異動前')}-${t('金幣')}`,
        SilverBeforePoint: `${t('異動前')}-${t('銀幣')}`,
        GoldChangePoint: `${t('異動金額')}-${t('金幣')}`,
        SilverChangePoint: `${t('異動金額')}-${t('銀幣')}`,
        GoldAfterPoint: `${t('異動後')}-${t('金幣')}`,
        SilverAfterPoint: `${t('異動後')}-${t('銀幣')}`,
        ItemData: t('額外內容'),
        CreateTime: t('建立時間'),
        PaymentTime: t('付款時間'),
      }
      const outputData = tableData.rows.map(item => {
        const newData = {}
        Object.keys(translatedTitles).forEach(key => {
          if (key === 'ItemData') newData[translatedTitles[key]] = formatOtherAwardList(item[key]).filter(item => !!item.amount).map(item => `${t(item.label)}: ${item.amount}`).join('、')
          else if (key === 'StoredStatusID') {
            const name = STORED_STATUS_LIST.find((status) => status.id === item[key])?.name
            newData[translatedTitles[key]] = name ? t(name) : item[key]
          } else newData[translatedTitles[key]] = item[key]
        })
        return newData
      })
      outputXlsx(outputData, t('會員儲值紀錄'))
    }

    const completeOrderManually = (TransID) => {
      completeOrder({ TransID }).then((res) => {
        console.log(res)
        if (res.Status.Code === '0') {
          useNotice({ type: 'success', message: t('手動履約成功'), allowDuplicate: true })
          handleFetch()
        }
      }).catch((error) => {
        console.log('error', error)
        useNotice({ type: 'error', message: t('手動履約失敗'), allowDuplicate: true })
      })
    }

    return {
      isMobile,
      isLoading,
      searchData,
      tableData,
      pagination,
      locale,
      handleFetch,
      handleChangePagination,
      handleChangeSort,
      handleClickTableColumns,

      PROD_LIST,
      STORED_STATUS_LIST,
      FETCH_TYPE_LIST,
      prodFormatter: createFormatter(PROD_LIST, 'id', 'name'),
      storedStatusFormatter: createFormatter(STORED_STATUS_LIST, 'id', 'name'),
      timeFormatter,
      pointFormatter,
      initSearchData,
      getSDisabledDate,
      getEDisabledDate,
      formatOtherAwardList,
      xslx,
      completeOrderManually,
    }
  },
})
</script>

<style lang="scss" scoped>
  .control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;

    .el-button {
      margin: 0;
    }
  }
</style>
