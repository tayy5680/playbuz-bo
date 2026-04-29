<template lang="pug">
.GameList(v-loading="isLoading")
  el-card.search-block(shadow="never")
    el-form(inline label-position="left" size="small")
      el-form-item(:label="$t('遊戲商')")
        el-select(v-model="searchData.gameProviderID")
          template(v-for="option of GAME_PROVIDER_LIST" :key="option.id")
            el-option(:label="$t(option.name)" :value="option.id")
      el-form-item(:label="$t('遊戲名稱')")
        el-input(
          v-model="searchData.gameName"
          clearable
        )
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
      PaginationComp(
        v-model:page="pagination.page"
        v-model:count="pagination.count"
        :totalCount="tableData.total"
        @change="handleChangePagination"
      )
    .right
      GameProviderMaintenance(
        :gameProviderID="gameProviderID"
        :isMaintenance="isMaintenance"
        :outputData="tableData.rows"
        @sucess="handleFetch()"
      )

  .table-block
    el-table(
      :data="tableData.rows"
      style="width: 100%"
    )
      el-table-column(:label="$t('遊戲排序')" prop="FrontSort")
      el-table-column(:label="$t('遊戲ID')" prop="GameID")
      el-table-column(:label="$t('遊戲名稱')" prop="GameName")
      el-table-column(:label="$t('遊戲商遊戲ID')" prop="GameProviderGameID" min-width="120")
      el-table-column(:label="$t('遊戲類型')" prop="GameType")
      el-table-column(:label="$t('遊戲狀態-金幣')" min-width="120")
        template(#="scope")
          span {{ $t(enableFormatter(scope.row.GoldStatus)) }}
      el-table-column(:label="$t('遊戲狀態-銀幣')" min-width="120")
        template(#="scope")
          span {{ $t(enableFormatter(scope.row.SilverStatus)) }}
      el-table-column(:label="$t('操作')" min-width="80" align="center" :fixed="isMobile ? false : 'right'")
        template(#="scope")
          Edit(:row="scope.row" @success="handleFetch()")
      el-table-column(:label="$t('維護')" min-width="70" align="center" :fixed="isMobile ? false : 'right'")
        template(#="scope")
          //- MaintenanceStatus: 2 下架則不能切換
          el-switch(
            v-if="scope.row.MaintenanceStatus !== 2"
            :disabled="isMaintenance"
            v-model="scope.row.isMaintenance"
            @click="handleChangeGameMaintenance(scope.row)"
          )
          span(v-else) {{ $t('已下架') }}
      el-table-column(:label="$t('遊戲商維護')" min-width="70" align="center" :fixed="isMobile ? false : 'right'")
        template(#="scope")
          span.warning-text(v-if="isMaintenance") {{ $t('維護中') }}
          span(v-else) -
</template>
<script>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  getGameList,
  changeGameMaintenance,
  getGameProviderMaintenance,
} from '@/api/game'
import { testIsMobile } from '@/utils'
import { loadingCounter } from '@/utils/loading-counter'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { enableFormatter } from '@/utils/formatters'
import PaginationComp from '@/components/Pagination'
import { GAME_PROVIDER_LIST } from '@/configs'
import GameProviderMaintenance from './GameProviderMaintenance'
import Edit from './Edit'
import i18n from '@/configs/locales'

export default {
  components: {
    PaginationComp,
    GameProviderMaintenance,
    Edit,
  },

  setup () {
    const { global: { t } } = i18n
    const isMobile = testIsMobile()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    // 當下查詢維護狀態
    const route = useRoute()
    const gameProviderID = computed(() => {
      let result
      try {
        result = JSON.parse(decodeURIComponent(route.query?.searchData))?.gameProviderID
      } catch (err) {
        // 若解析失敗 給第0筆資料
        result = GAME_PROVIDER_LIST[0].id
      }
      return result
    })
    const isMaintenance = ref(false)

    // 搜尋表單相關
    const searchData = ref({})
    const pagination = ref({})
    const initSearchData = () => {
      searchData.value = {
        gameProviderID: gameProviderID.value,
        gameName: '',
      }
      pagination.value = {
        page: 1,
        count: 50,
      }
    }
    initSearchData()
    const storeSearchData = useStoreForm({ searchData, pagination })
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
      }
      loadingCountPlus()
      try {
        const res = await getGameList(inputData)
        res.Data.forEach(item => {
          // 維護中 MaintenanceStatus: 1
          item.isMaintenance = item.MaintenanceStatus === 1
        })
        tableData.rows = res.Data
        tableData.total = res.Count
        const res2 = await getGameProviderMaintenance({
          GameProviderID: searchData.value.gameProviderID,
        })
        // 維護中 MaintenanceStatus: 1
        isMaintenance.value = res2.Data?.[0]?.MaintenanceStatus === 1
        storeSearchData()
      } catch (error) {
        tableData.rows = []
        tableData.total = 0
      } finally {
        loadingCountMinus()
      }
    }
    useWatchRouterFetch(handleFetch)

    // 單一遊戲維護
    const handleChangeGameMaintenance = async (row) => {
      if (isMaintenance.value) return
      const inputData = {
        GameID: row.GameID,
        MaintenanceStatus: row.isMaintenance ? 1 : 0,
      }
      try {
        await ElMessageBox.confirm(
          inputData.MaintenanceStatus ? t('確認是否進行單一遊戲維護？') : t('確認是否結束單一遊戲維護？'),
          '',
          {
            confirmButtonText: t('確定'),
            cancelButtonText: t('取消'),
            type: 'warning',
          },
        )
        // 因呼叫可能頻繁 避免tableData快取 所以只變更本地資料
        await changeGameMaintenance(inputData)
      } catch (error) {
        // 取消或變更失敗
        row.isMaintenance = !row.isMaintenance
      }
    }

    return {
      GAME_PROVIDER_LIST,
      isMobile,
      searchData,
      tableData,
      isLoading,
      pagination,
      gameProviderID,
      isMaintenance,
      // fn
      enableFormatter,
      initSearchData,
      handleFetch,
      handleChangePagination,
      handleChangeGameMaintenance,
    }
  },
}
</script>
<style lang="scss" scoped>
:deep(.el-card__body > *) {
  margin-left: 8px !important;
}
</style>
