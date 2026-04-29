<template lang="pug">
.MemberList(v-loading="isLoading")
  el-card.search-block(shadow="never")
    el-form(inline label-position="left" size="small")
      el-form-item(v-if="isHeadquarter" :label="$t('上層廣告加盟商')")
        el-select(
          v-model="searchData.UpMemberID"
          clearable
        )
          template(v-for="option of advertiserDropdown" :key="option.MemberID")
            el-option(:label="option.NickName" :value="option.MemberID")
      el-form-item(:label="$t('VIP等級')")
        el-select(
          v-model="searchData.LV"
          clearable
        )
          template(v-for="option of VIP_LEVEL_LIST" :key="option.key")
            el-option(:label="$t(option.name)" :value="option.id")
      el-form-item(:label="$t('狀態')")
        el-select(
          v-model="searchData.StatusID"
          clearable
        )
          template(v-for="option of STATUS_TYPE_LIST" :key="option.key")
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
      el-table-column(:label="$t('會員ID')" align="center" min-width="90" sortable="custom")
        template(#="scope")
          CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()")
      el-table-column(:label="$t('手機號')" min-width="160" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.PhoneNumber")
      el-table-column(:label="$t('會員信箱')" min-width="160" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.Email")
      el-table-column(:label="$t('會員暱稱')" min-width="190" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.NickName")
      el-table-column(label="Line ID" min-width="190" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.LineID")
      el-table-column(label="APPLE ID" min-width="190" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.AppleID")
      el-table-column(:label="$t('上層廣告加盟商')" min-width="230" sortable="custom")
        template(#="scope")
          div {{$t('暱稱')}}:&nbsp;
            CopyableButton(:modelValue="scope.row.UpNickName")
          div {{$t('手機號')}}:&nbsp;
            CopyableButton(:modelValue="scope.row.UpPhoneNumber")
      el-table-column(:label="$t('VIP等級')" prop="LV" align="center" min-width="100" sortable="custom")
      el-table-column(:label="$t('狀態')" min-width="100" sortable="custom")
        template(#="scope")
          div {{ $t(statusTypeFormatter(null, null, scope.row.StatusID)) }}
            span(v-if="scope.row.IsTrial") ({{$t('試用')}})
      el-table-column(:label="$t('錢包')" min-width="160" sortable="custom")
        template(#="scope")
          div {{$t('金幣')}}: {{ pointFormatter(null, null, scope.row.GoldPoint) }}
          div {{$t('銀幣')}}: {{ pointFormatter(null, null, scope.row.SilverPoint) }}
      el-table-column(:label="$t('邀請人')" min-width="230" sortable="custom")
        template(#="scope")
          template(v-if="!['GPG', 'JKF'].includes(scope.row.IntroduceName)")
            div {{$t('暱稱')}}:&nbsp;
              CopyableButton(:modelValue="scope.row.IntroduceName")
            div {{$t('手機號')}}:&nbsp;
              CopyableButton(:modelValue="scope.row.IntroducePhoneNumber")
      el-table-column(:label="$t('邀請碼')" min-width="120" sortable="custom")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.IntroduceCode")
      el-table-column(:label="$t('註冊時間')" min-width="165" sortable="custom")
        template(#="scope")
          span {{ timeFormatter(scope.row.CreateTime) }}
      el-table-column(:label="$t('登入時間/IP')" min-width="165" sortable="custom")
        template(#="scope")
          div {{ timeFormatter(scope.row.LoginTime) }}
          div {{ scope.row.IP }}
      el-table-column(:label="$t('操作')" v-if="isHeadquarter" min-width="120" align="center" :fixed="isMobile ? false : 'right'")
        template(#="scope")
          div.control
            GameAccountDetail(:scope="scope")
            AccountStatus(:scope="scope" @update="handleFetch")
            UpdateRecord(:scope="scope")
</template>
<script>
import { ref, reactive, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { getAdvertiserDropdown, getMemberList } from '@/api/member'
import GameAccountDetail from './GameAccountDetail'
import AccountStatus from './AccountStatus.vue'
import UpdateRecord from './UpdateRecord.vue'
import { testIsMobile } from '@/utils'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { useNotice } from '@/utils/use-notice'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { createFormatter, timeFormatter, pointFormatter } from '@/utils/formatters'
import { VIP_LEVEL_LIST } from '@/configs'
import i18n from '@/configs/locales'

const FETCH_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '登入IP', key: 'LoginIp' },
  { name: '會員信箱', key: 'Email' },
]

const STATUS_TYPE_LIST = [
  { name: '啟用', id: 0 },
  { name: '停用', id: 1 },
  { name: '鎖定', id: 2 },
]

const SORT_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員信箱', key: 'Email' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '上層廣告加盟商', key: 'UpNickName' },
  { name: '狀態', key: 'StatusID' },
  { name: '錢包', key: 'GoldPoint' },
  { name: '邀請人', key: 'IntroduceName' },
  { name: '邀請碼', key: 'IntroduceCode' },
  { name: '註冊時間', key: 'CreateTime' },
  { name: '登入時間/IP', key: 'LoginTime' },
]

export default {
  name: 'MemberList',

  components: {
    PaginationComp,
    CopyableButton,
    GameAccountDetail,
    AccountStatus,
    UpdateRecord,
  },

  setup () {
    const { global: { t } } = i18n
    const isMobile = testIsMobile()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const store = useStore()
    const isHeadquarter = computed(() => {
      // Headquarter:總廣告商
      return store.state.roles.includes('Headquarter')
    })
    const advertiserDropdown = ref([])
    const advertiserDropdownFetch = async () => {
      if (!isHeadquarter.value) return
      loadingCountPlus()
      try {
        const res = await getAdvertiserDropdown()
        advertiserDropdown.value = res.Data
      } catch (error) {
        advertiserDropdown.value = []
      } finally {
        loadingCountMinus()
      }
    }
    advertiserDropdownFetch()
    const searchData = ref({})
    const pagination = ref({})
    const initSearchData = () => {
      searchData.value = {
        UpMemberID: undefined,
        LV: undefined,
        StatusID: undefined,
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
    const storeSearchData = useStoreForm({ searchData, pagination })
    watch(
      () => searchData.value.searchType,
      (newValue) => {
        if (!newValue) searchData.value.searchString = ''
      },
    )

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
        IsGuest: !searchData.value.isExceptGuest,
      }
      if (searchData.value.searchType) inputData[searchData.value.searchType] = searchData.value.searchString
      loadingCountPlus()
      try {
        const res = await getMemberList(inputData)
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
      VIP_LEVEL_LIST,
      STATUS_TYPE_LIST,
      FETCH_TYPE_LIST,
      isMobile,
      isHeadquarter,
      advertiserDropdown,
      searchData,
      tableData,
      isLoading,
      pagination,
      // methods
      timeFormatter,
      statusTypeFormatter: createFormatter(STATUS_TYPE_LIST, 'id', 'name'),
      pointFormatter,
      initSearchData,
      handleFetch,
      handleChangePagination,
      handleChangeSort,
    }
  },
}
</script>
<style lang="scss" scoped>
  :deep(.el-card__body > *) {
    margin-left: 8px !important;
  }

  .control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;

    :deep(.el-button) {
      margin: 0;
    }
  }
</style>
