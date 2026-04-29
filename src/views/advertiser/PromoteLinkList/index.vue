<template lang="pug">
.PromoteLinkList(v-loading="isLoading")
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
      el-form-item(:label="$t('層級')")
        el-select(v-model="searchData.AdID")
          template(v-for="option of AD_TYPE_LIST" :key="option.id")
            el-option(:label="$t(option.name)" :value="option.id")
      el-form-item(:label="$t('狀態')")
        el-select(v-model="searchData.StatusID")
          template(v-for="option of STATUS_TYPE_LIST" :key="option.id")
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
  .function-block(:class="{'--is-mobile': isMobile}")
    .left
      pagination-comp(
        v-model:page="pagination.page"
        v-model:count="pagination.count"
        :totalCount="tableData.total"
        @change="handleChangePagination"
      )
    .right
      Create(@success="handleFetch(true)")
  .table-block
    el-table(:data="tableData.rows" @sort-change="handleChangeSort")
      el-table-column(:label="$t('序列')" prop="serialNumber" align="center")
        template(#="scope")
          span {{ scope.$index + 1 }}
      el-table-column(:label="$t('廣告加盟商資訊')" min-width="230" sortable="custom")
        template(#="scope")
          div {{$t('帳號')}}:&nbsp;
            CopyableButton(v-if="scope.row.MemberAccount" :modelValue="scope.row.MemberAccount.toString()")
          div {{$t('暱稱')}}:&nbsp;
            CopyableButton(:modelValue="scope.row.NickName")
          div {{$t('會員ID')}}:&nbsp;
            CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()")
          div Email:&nbsp;
            CopyableButton(:modelValue="scope.row.Email")
      el-table-column(:label="$t('層級')" min-width="130" sortable="custom")
        template(#="scope")
          div {{ $t(adTypeFormatter(null, null, scope.row.AdID).toString()) }}
      el-table-column(:label="$t('推廣網址')" min-width="200")
        template(#="scope")
          CopyableButton(:modelValue="`${frontUrl}?promote=${scope.row.PromoteCode}`")
      el-table-column(:label="$t('推廣碼')" prop="PromoteCode"  min-width="130")
      el-table-column(:label="$t('註冊成功數')" prop="PromoteCount" min-width="120" sortable="custom")
      el-table-column(:label="$t('創建時間')" prop="CreateTime" min-width="165" sortable="custom")
        template(#="scope")
          span {{ timeFormatter(scope.row.CreateTime) }}
      el-table-column(:label="$t('備註')" min-width="200")
        template(#="scope")
          EditNote(:scope="scope" @success="handleFetch(true)")
      el-table-column(:label="$t('狀態')" prop="StatusID" align="center")
        template(#="scope")
          span(v-if="scope.row.IsDefault") {{$t('預設')}}
          el-switch(
            v-else
            :disabled="scope.row.MemberAccount !== account || scope.row.IsDefault === 1"
            v-model="scope.row.isEnable"
            @click="handleChangeStatus(scope.row, scope.row.MemberAccount !== account || scope.row.IsDefault === 1)"
          )
      el-table-column(:label="$t('操作')" min-width="120" align="center" :fixed="isMobile ? false : 'right'")
        template(#="scope")
          .operating-item
            a(
              :href="`${promotionUrl}?url=${frontUrl}&code=${scope.row.PromoteCode}&label=${$t('我的推廣碼')}${scope.row.PromoteCode}`"
              target="_blank"
            )
              el-button(type="primary" size="small") {{$t('推廣圖編輯')}}
          .operating-item
            el-button(
              v-if="scope.row.MemberAccount === account && scope.row.IsDefault !== 1"
              @click="handleDelete(scope.row)"
              type="danger"
              size="small"
            ) {{$t('刪除')}}

</template>

<script>
import { ref, reactive, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { testIsMobile } from '@/utils'
import Create from './Create'
import EditNote from './EditNote'
import { useNotice } from '@/utils/use-notice'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { createFormatter, timeFormatter, pointFormatter } from '@/utils/formatters'
import {
  getPromoteLinkList,
  editPromoteLink,
  deletePromoteLink,
} from '@/api/advertiser'
import {
  POINT_TYPE_LIST,
  AD_TYPE_LIST as ORIGINAL_AD_TYPE_LIST,
} from '@/configs'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import i18n from '@/configs/locales'

const FETCH_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '會員帳號', key: 'MemberAccount' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '推廣碼', key: 'PromoteCode' },
  { name: '會員信箱', key: 'Email' },
]

const STATUS_TYPE_LIST = [
  { name: '全部', id: 2 },
  { name: '啟用', id: 1 },
  { name: '停用', id: 0 },
]

const SORT_TYPE_LIST = [
  { name: '廣告加盟商資訊', key: 'MemberID' },
  { name: '創建時間', key: 'CreateTime' },
]

export default {
  name: 'PromoteLinkList',

  components: {
    PaginationComp,
    CopyableButton,
    Create,
    EditNote,
  },

  setup () {
    const { global: { t } } = i18n
    const frontUrl = computed(() => process.env.VUE_APP_FRONT_URL)
    const promotionUrl = computed(() => process.env.VUE_APP_PROMOTION_URL)
    const store = useStore()
    const account = computed(() => store.state.account)
    const AD_TYPE_LIST = computed(() => {
      // 自身登入 AdID - 表中的AdID <= 0 為可出現條件
      const filterADType = ORIGINAL_AD_TYPE_LIST.filter(item => (store.state?.advertisersData?.AdID - item.id) <= 0)
      return [
        { name: '全部', id: '' },
      ].concat(filterADType)
    })

    const isMobile = testIsMobile()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const initSearchData = () => {
      searchData.value = {
        sDate: null,
        eDate: null,
        StatusID: 2,
        AdID: '',
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
      if (searchData.value.sDate && searchData.value.eDate) {
        const max = dayjs.max(dayjs(searchData.value.sDate), dayjs(searchData.value.eDate))
        if (max.$d.toString() !== dayjs(searchData.value.eDate).$d.toString()) {
          useNotice({ type: 'warning', message: t('搜尋資料格式錯誤'), allowDuplicate: true })
          return
        }
      }
      // 日期預設為空
      if (searchData.value.sDate) inputData.startDate = dayjs(searchData.value.sDate).toISOString()
      if (searchData.value.eDate) inputData.endDate = dayjs(searchData.value.eDate).toISOString()
      if (searchData.value.searchType) inputData[searchData.value.searchType] = searchData.value.searchString
      loadingCountPlus()
      try {
        const res = await getPromoteLinkList(inputData, noCache)
        res.Data.forEach(item => {
          // StatusID 1: 啟用, 0: 停用
          item.isEnable = item.StatusID === 1
        })
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

    const handleChangeStatus = async (row, isDisable) => {
      if (isDisable) return

      const inputData = {
        PromoteID: row.PromoteID,
        StatusID: row.isEnable ? 1 : 0,
      }
      try {
        // 因呼叫可能頻繁 避免tableData快取 所以只變更本地資料
        await editPromoteLink(inputData)
      } catch (error) {
        // 取消或變更失敗
        row.isEnable = !row.isEnable
      }
    }

    const handleDelete = async (row) => {
      const inputData = {
        PromoteID: row.PromoteID,
      }
      try {
        await ElMessageBox.confirm(
          t('確認是否刪除？'),
          '',
          {
            confirmButtonText: t('確定'),
            cancelButtonText: t('取消'),
            type: 'warning',
          },
        )
        await deletePromoteLink(inputData)
        // 500後重抓資料 避免抓到未更新的內容
        setTimeout(handleFetch(true), 500)
      } catch (error) {
        // 取消或變更失敗
        // DO NOTHING
      }
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
      FETCH_TYPE_LIST,
      STATUS_TYPE_LIST,
      AD_TYPE_LIST,
      account,
      isMobile,
      isLoading,
      searchData,
      tableData,
      pagination,
      frontUrl,
      promotionUrl,
      // fn
      handleFetch,
      handleChangePagination,
      handleClickTableColumns,
      handleChangeStatus,
      handleDelete,
      initSearchData,
      statusTypeFormatter: createFormatter(STATUS_TYPE_LIST, 'id', 'name'),
      fetchTypeFormatter: createFormatter(FETCH_TYPE_LIST, 'id', 'name'),
      pointTypeIdFormatter: createFormatter(POINT_TYPE_LIST, 'id', 'name'),
      adTypeFormatter: createFormatter(AD_TYPE_LIST.value, 'id', 'name'),
      pointFormatter,
      timeFormatter,
      handleChangeSort,
      getSDisabledDate,
      getEDisabledDate,
    }
  },
}
</script>
