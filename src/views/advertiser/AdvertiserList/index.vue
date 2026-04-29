<template lang="pug">
.AdvertiserList(v-loading="isLoading")
  el-card.search-block(shadow="never")
    el-form(inline label-position="left" size="small")
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
  el-card.search-block(shadow="never")
    Breadcrumb(
      v-if="hasUpMemberId"
      :pathArr="advertiserPath"
      @queryChange="upMemberIDchange"
    )
    el-table(
      :data="[advertiserData]"
      style="width: 100%"
    )
      el-table-column(:label="$t('帳號')" prop="MemberAccount" min-width="155")
      el-table-column(:label="$t('層級')" prop="AdID" :formatter="adTypeFormatter" min-width="130")
        template(#="scope")
          div {{ $t(adTypeFormatter(null, null, scope.row.AdID)?.toString() ?? '') }}
      el-table-column(:label="$t('直屬廣告加盟商數')" prop="SecondaryAdCount" min-width="140" align="right")
      el-table-column(:label="$t('下層廣告加盟商總數')" prop="AdCount" min-width="150" align="right")
      el-table-column(:label="$t('直屬會員數')" prop="SecondaryMemberCount" min-width="100" align="right")
      el-table-column(:label="$t('下層會員總數')" prop="MemberCount" min-width="120" align="right")
  .function-block(:class="{'--is-mobile': isMobile}")
    .left
      PaginationComp(
        v-model:page="pagination.page"
        v-model:count="pagination.count"
        :totalCount="tableData.total"
        @change="handleChangePagination"
      )
    .right
      InviteLink
  .table-block
    el-table(
      :data="tableData.rows"
      style="width: 100%"
      @sort-change="handleChangeSort"
    )
      el-table-column(:label="$t('序列')" prop="serialNumber" align="center")
        template(#="scope")
          span {{ scope.$index + 1 }}
      el-table-column(:label="$t('帳號')" min-width="140")
        template(#="scope")
          CopyableButton(:modelValue="scope.row.MemberAccount")
      el-table-column(:label="$t('前台會員帳號')" min-width="230" sortable="custom")
        template(#="scope")
          div {{$t('會員ID')}}:&nbsp;
            CopyableButton(v-if="scope.row.MemberID" :modelValue="scope.row.MemberID.toString()")
          div {{$t('暱稱')}}:&nbsp;
            CopyableButton(:modelValue="scope.row.NickName")
          div {{$t('手機號')}}:&nbsp;
            CopyableButton(:modelValue="scope.row.PhoneNumber")
          div Email:&nbsp;
            CopyableButton(:modelValue="scope.row.Email")
      el-table-column(:label="$t('層級')" prop="AdID" :formatter="adTypeFormatter" min-width="130" sortable="custom")
      el-table-column(:label="$t('狀態')" min-width="100" sortable="custom")
        template(#="scope")
          div {{ $t(statusTypeFormatter(null, null, scope.row.StatusID).toString()) }}
            span(v-if="scope.row.IsTrial") ({{$t('試用')}})
      el-table-column(:label="$t('上層廣告加盟商')" min-width="230" sortable="custom")
        template(#="scope")
          div {{$t('會員ID')}}:&nbsp;
            CopyableButton(v-if="scope.row.UpMemberID" :modelValue="scope.row.UpMemberID.toString()")
          div {{$t('暱稱')}}:&nbsp;
            CopyableButton(:modelValue="scope.row.UpNickName")
          div {{$t('手機號')}}:&nbsp;
            CopyableButton(:modelValue="scope.row.UpPhoneNumber")
          div Email:&nbsp;
            CopyableButton(:modelValue="scope.row.UpEmail")
      el-table-column(:label="$t('直屬廣告加盟商數')" prop="DirectAdAccountCount" min-width="160" align="right" sortable="custom")
      el-table-column(:label="$t('下層廣告加盟商總數')" prop="AdCount" min-width="170" align="right" sortable="custom")
      el-table-column(:label="$t('直屬會員數')" prop="DirectMemberAccountCount" min-width="120" align="right" sortable="custom")
      el-table-column(:label="$t('下層會員總數')" prop="MemberCount" min-width="140" align="right" sortable="custom")
      el-table-column(:label="$t('錢包')" min-width="160" sortable="custom")
        template(#="scope")
          div {{$t('金幣')}}: {{ pointFormatter(null, null, scope.row.GoldPoint) }}
          div {{$t('銀幣')}}: {{ pointFormatter(null, null, scope.row.SilverPoint) }}
      el-table-column(:label="$t('註冊時間')" min-width="165" sortable="custom")
        template(#="scope")
          span {{ timeFormatter(scope.row.CreateTime) }}
      el-table-column(:label="$t('登入時間/IP')" min-width="165" sortable="custom")
        template(#="scope")
          div {{ timeFormatter(scope.row.LastLoginTime) }}
          div {{ scope.row.LastLoginIp }}
      el-table-column(:label="$t('操作')" min-width="120" align="center" :fixed="isMobile ? false : 'right'")
        template(#="scope")
          .operating-item(v-if="isHeadquarter")
            GameAccountDetail(:scope="scope")
          //- 1: 總廣告商, 2: A級廣告商, 3: B級廣告商
          .operating-item(v-if="[1, 2, 3].includes(scope.row.AdID)")
            el-button(@click="upMemberIDchange(scope.row)" size="small") {{$t('直屬查詢')}}
          //- 2: A級廣告商, 3: B級廣告商, 4: C級廣告商
          .operating-item(v-if="[2, 3, 4].includes(scope.row.AdID)" )
            PasswordChange(:scope="scope")
</template>
<script>
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getAdvertiserList, getAdvertiserDataByMemberID, getAdvertiserPath } from '@/api/advertiser'
import { testIsMobile } from '@/utils'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { useNotice } from '@/utils/use-notice'
import { createFormatter, timeFormatter, pointFormatter } from '@/utils/formatters'
import PaginationComp from '@/components/Pagination'
import CopyableButton from '@/components/CopyableButton'
import { AD_TYPE_INCLUDE_MEMBER_LIST } from '@/configs'
import Breadcrumb from './Breadcrumb'
import InviteLink from './InviteLink'
import GameAccountDetail from './GameAccountDetail'
import PasswordChange from './PasswordChange'
import { useStore } from 'vuex'

const FETCH_TYPE_LIST = [
  { name: '會員ID', key: 'MemberID' },
  { name: '手機號', key: 'PhoneNumber' },
  { name: '會員暱稱', key: 'NickName' },
  { name: '登入IP', key: 'LoginIp' },
  { name: '會員信箱', key: 'Email' },
]

const STATUS_TYPE_LIST = [
  { name: '啟用(加盟商)', id: 0 },
  { name: '停用(加盟商)', id: 1 },
  { name: '鎖定', id: 2 },
]

const SORT_TYPE_LIST = [
  { name: '前台會員帳號', key: 'MemberID' },
  { name: '錢包', key: 'GoldPoint' },
  { name: '狀態', key: 'StatusID' },
  { name: '上層廣告加盟商', key: 'UpMemberID' },
  { name: '註冊時間', key: 'CreateTime' },
  { name: '登入時間/IP', key: 'LastLoginTime' },
]

export default {
  name: 'AdvertiserList',

  components: {
    PaginationComp,
    CopyableButton,
    Breadcrumb,
    InviteLink,
    GameAccountDetail,
    PasswordChange,
  },

  setup () {
    const isMobile = testIsMobile()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()
    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const store = useStore()

    const isHeadquarter = computed(() => {
      // Headquarter:總廣告商
      return store.state.roles.includes('Headquarter')
    })

    const initSearchData = () => {
      searchData.value = {
        UpMemberId: undefined,
        MemberID: undefined,
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

    // 搜尋表單上面區塊的資料
    const route = useRoute()
    const hasUpMemberId = computed(() => {
      try {
        const memberId = JSON.parse(decodeURIComponent(route.query?.searchData))?.UpMemberId
        return !['', undefined].includes(memberId)
      } catch {
        return false
      }
    })
    const advertiserData = ref({})
    const advertiserPath = ref([])
    const fetchAdvertiserData = async (MemberID) => {
      const inputData = {
        MemberID,
      }
      loadingCountPlus()
      try {
        const res = await getAdvertiserDataByMemberID(inputData)
        advertiserData.value = {
          MemberAccount: res.Data.MemberAccount,
          AdID: res.Data.AdID,
          MemberID: res.Data.MemberID,
          AdCount: res.Data.AdCount,
          SecondaryAdCount: res.Data.SecondaryAdCount,
          MemberCount: res.Data.MemberCount,
          SecondaryMemberCount: res.Data.SecondaryMemberCount,
        }
        const res2 = await getAdvertiserPath(inputData)
        advertiserPath.value = res2.Data.reverse()
      } catch (error) {
        advertiserData.value = {}
        advertiserPath.value = []
      } finally {
        loadingCountMinus()
      }
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
        useNotice({ type: 'warning', message: '搜尋資料格式錯誤', allowDuplicate: true })
        return
      }

      const inputData = {
        ...searchData.value,
        ...pagination.value,
        ...sort.value,
      }
      if (searchData.value.searchType) inputData[searchData.value.searchType] = searchData.value.searchString

      loadingCountPlus()
      try {
        const res = await getAdvertiserList(inputData)
        tableData.rows = res.Data
        tableData.total = res.Count
        await fetchAdvertiserData(inputData.UpMemberId)
        storeSearchData()
      } catch (error) {
        tableData.rows = []
        tableData.total = 0
      } finally {
        loadingCountMinus()
      }
    }

    useWatchRouterFetch(handleFetch)
    const upMemberIDchange = (row) => {
      initSearchData()
      if (row) searchData.value.UpMemberId = row.MemberID
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
    const adTypeFormatter2 = (name) => {
      return createFormatter(AD_TYPE_INCLUDE_MEMBER_LIST, 'id', name)
    }

    return {
      // data
      FETCH_TYPE_LIST,
      isMobile,
      hasUpMemberId,
      advertiserData,
      advertiserPath,
      searchData,
      tableData,
      isLoading,
      pagination,
      isHeadquarter,
      // methods
      timeFormatter,
      statusTypeFormatter: createFormatter(STATUS_TYPE_LIST, 'id', 'name'),
      adTypeFormatter: createFormatter(AD_TYPE_INCLUDE_MEMBER_LIST, 'id', 'name'),
      adTypeFormatter2,
      pointFormatter,
      initSearchData,
      handleFetch,
      handleChangePagination,
      upMemberIDchange,
      handleChangeSort,
    }
  },
}
</script>
<style lang="scss" scoped>
:deep(.el-card__body > *) {
  margin-left: 8px !important;
}

:deep(.operating-item:last-of-type) {
  margin-bottom: 0 !important;
}
</style>
