<template lang="pug">
div(v-loading="isLoading")
  el-card.search-block(shadow="never")
    el-form(inline label-position="left" size="small")
      el-form-item(:label="$t('起始時間')")
        el-date-picker(
          type="date"
          v-model="searchData.sDate"
          :disabled-date="getSDisabledDate"
          :clearable="false"
        )
      el-form-item(:label="$t('結束時間')")
        el-date-picker(
          type="date"
          v-model="searchData.eDate"
          :disabled-date="getEDisabledDate"
          :clearable="false"
        )

      el-form-item(:label="$t('金流類型')")
        el-select(v-model="searchData.payTypeId")
          template(v-for="option of PAY_TYPE_LIST" :key="option.id")
            el-option(:label="$t(option.name)" :value="option.id")

      el-form-item
        el-button(
          type="primary"
          @click="handleFetch"
        ) {{$t('搜尋')}}
      el-form-item
        el-button(
          @click="initSearchData"
        ) {{$t('清除條件')}}

  //- .function-block
  //-   .left
  //-     pagination-comp(v-model:page="pagination.page" v-model:count="pagination.count" :totalCount="tableData.total" @change="handleChangePagination")

  .table-block
    el-table(:data="tableData.rows" @sort-change="handleChangeSort")
      el-table-column(:label="$t('日期')" prop="DisplayDate" align="center" min-width="100" sortable="custom")
      el-table-column(:label="$t('金流')" prop="PayTypeID" :formatter="payTypeFormatter" align="center" min-width="120" sortable="custom")
      el-table-column(:label="$t('訂單建立')" align="center" sortable="custom")
        template(#="scope")
          //- el-button.text-link-button(@click="handleClickSucceeded(scope)" type="text") {{ scope.row.AllCt }}
          span {{ scope.row.AllCt }}
      el-table-column(:label="$t('交易完成')" align="center" sortable="custom")
        template(#="scope")
          //- el-button.text-link-button(@click="handleClickSucceeded(scope)" type="text") {{ scope.row.SuccessCt }}
          span {{ scope.row.SuccessCt }}
      el-table-column(:label="$t('交易完成金額')" align="center" min-width="120" sortable="custom")
        template(#="scope")
          span $ {{ pointFormatter(null, null, scope.row.SuccessAmount) }}
</template>

<script>
import { defineComponent, ref } from 'vue'
import dayjs from 'dayjs'
import PaginationComp from '@/components/Pagination'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { createFormatter, pointFormatter } from '@/utils/formatters'
import { getDepositReport } from '@/api/report'
import { PAY_TYPE_LIST as ORIGINAL_PAY_TYPE_LIST } from '@/configs'
import { useNotice } from '@/utils/use-notice'
import minMax from 'dayjs/plugin/minMax'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import i18n from '@/configs/locales'

const PAY_TYPE_LIST = [
  { name: '全部', id: 0 },
].concat(ORIGINAL_PAY_TYPE_LIST)

const SORT_TYPE_LIST = [
  { name: '訂單建立', key: 'AllCt' },
  { name: '交易完成', key: 'SuccessCt' },
  { name: '交易完成金額', key: 'SuccessAmount' },
]

export default defineComponent({
  components: {
    PaginationComp,
  },

  setup () {
    const { global: { t } } = i18n
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const sort = ref({})
    const initSort = () => {
      sort.value = {
        field: 'Date',
        orderType: 'desc',
      }
    }
    const initSearchData = () => {
      searchData.value = {
        sDate: dayjs().subtract(6, 'day').startOf('day').toDate(),
        eDate: dayjs().endOf('day').toDate(),
        payTypeId: 0,
      }
      pagination.value = {
        page: 1,
        // 規格無分頁
        count: 9999,
      }
    }
    initSearchData()
    const storeSearchData = useStoreForm({ searchData, pagination })
    // 設定禁用日期 禁用今天到dayRange前之外的日期
    const dayRange = 182
    const getSDisabledDate = (date) => {
      return SDisabledDate(date, searchData.value.eDate, dayRange)
    }
    const getEDisabledDate = (date) => {
      return EDisabledDate(date, searchData.value.sDate, dayRange)
    }
    // 呈現資料相關
    const tableData = ref({
      rows: [],
      total: 0,
    })
    const handleFetch = async () => {
      const body = {
        payTypeId: searchData.value.payTypeId,
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
      body.startDate = dayjs(searchData.value.sDate).format('YYYY-MM-DD')
      body.endDate = dayjs(searchData.value.eDate).format('YYYY-MM-DD')

      loadingCountPlus()

      const formatTableRows = (rows) => {
        // 移除連續的日期，只顯示第一個日期
        let currentDate
        for (const row of rows) {
          if (row.Date === currentDate) {
            row.DisplayDate = ''
          } else {
            currentDate = row.DisplayDate = row.Date
          }
        }

        // 增加合計
        rows.push({
          DisplayDate: '',
          Date: '',
          PayTypeID: `${t('合計')}`,
          AllCt: 0,
          SuccessCt: 0,
          SuccessAmount: 0,
        })
        for (const row of rows.slice(0, -1)) {
          rows[rows.length - 1].AllCt += row.AllCt
          rows[rows.length - 1].SuccessCt += row.SuccessCt
          rows[rows.length - 1].SuccessAmount += row.SuccessAmount
        }

        return rows
      }

      try {
        const res = await getDepositReport(body)
        tableData.value.total = res.Count
        tableData.value.rows = formatTableRows(res.Data)
        storeSearchData()
      } catch {
        // TODO
      } finally {
        loadingCountMinus()
      }
    }
    useWatchRouterFetch(handleFetch)

    const handleChangePagination = () => {
      handleFetch()
    }

    const handleChangeSort = ({ column, prop, order }) => {
      if (prop === 'DisplayDate') prop = 'Date'
      if (order === null) {
        initSort()
      } else {
        if (!prop) {
          const target = SORT_TYPE_LIST.find(element => element.name === column.label)
          if (target) sort.value.field = target.key
        } else sort.value.field = prop
        sort.value.orderType = order === 'ascending' ? 'asc' : 'desc'
      }
      handleFetch()
    }

    // TODO
    // const handleClickSucceeded = (scope) => goMemberDeposit(scope, true)
    // const handleClickFailed = (scope) => goMemberDeposit(scope, false)
    // const goMemberDeposit = (scope, isSuccessful) => {
    //   if (scope.row.PayTypeID === '合計') {
    //     const params = {
    //       dateTimeRange: JSON.stringify(encodeURIComponent(JSON.stringify(pagination.value)).value.dateRange.map(dateTime => dayjs(dateTime).toISOString())),
    //     }
    //     // 1:成功，目前沒有失敗狀態
    //     if (isSuccessful) params.storedStatusId = 1

    //     router.push({
    //       name: 'report/member-deposit',
    //       params,
    //     })
    //   } else {
    //     const params = {
    //       prodId: scope.row.PayTypeID,
    //       dateTimeRange: JSON.stringify([dayjs(scope.row.Date).toISOString(), dayjs(scope.row.Date).add(1, 'day').subtract(1, 'millisecond').toISOString()]),
    //     }
    //     // 1:成功，目前沒有失敗狀態
    //     if (isSuccessful) params.storedStatusId = 1

    //     router.push({
    //       name: 'report/member-deposit',
    //       params,
    //     })
    //   }
    // }

    return {
      isLoading,
      searchData,
      tableData,
      pagination,
      handleFetch,
      handleChangePagination,
      // handleClickSucceeded,
      // handleClickFailed,
      handleChangeSort,

      PAY_TYPE_LIST,
      payTypeFormatter: createFormatter(PAY_TYPE_LIST, 'id', 'name'),
      pointFormatter,
      initSearchData,
      getSDisabledDate,
      getEDisabledDate,
    }
  },
})
</script>
