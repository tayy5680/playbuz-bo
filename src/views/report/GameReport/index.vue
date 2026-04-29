<template>
  <div class="game-report" v-loading="isLoading">
    <el-card class="search-block" shadow="never">
      <el-form inline label-position="left" size="small">
        <el-form-item :label="$t('起始時間')">
          <el-date-picker type="datetime" v-model="searchData.sDate" :disabled-date="getSDisabledDate" :clearable="false"/>
        </el-form-item>
        <el-form-item :label="$t('結束時間')">
          <el-date-picker type="datetime" v-model="searchData.eDate" :disabled-date="getEDisabledDate" :clearable="false" />
        </el-form-item>
        <el-form-item :label="$t('遊戲商')">
          <el-select v-model="searchData.gameProviderID" clearable>
            <template v-for="option of GAME_PROVIDER_LIST" :key="option.id">
              <el-option :label="$t(option.name)" :value="option.id" />
            </template>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFetch">
            {{ $t('搜尋') }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="initSearchData">
            {{ $t('清除條件') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="function-block">
      <div class="right">
        <el-button :loading="isLoading" @click="xslx" type="primary" size="small">{{$t('匯出報表')}}</el-button>
      </div>
    </div>
    <el-table
    ref="multipleTable"
    class="game-report-table"
    row-class-name="game-report-table-row"
    :data="tableData.rows"
    style="width: 100%;"
    @row-click="showRow"
    @expand-change="changeExpand" >
      <el-table-column type="expand">
        <template #default="props">
          <div m="4" class="collapse">
            <el-table :data="props.row.GameResult" border>
              <el-table-column :label="$t('遊戲名稱')" prop="GameName" width="210"/>
              <el-table-column :label="$t('遊玩玩家數')" prop="BetMemberCount" />
              <el-table-column :label="$t('總下注次數')" prop="BetCount" />
              <el-table-column :label="$t('下注金額')" align="right">
                <template #="scope">
                  <span :class="{ 'text_red': scope.row.Bet < 0 }" >
                    {{ pointFormatter(null, null, scope.row.Bet) }}
                  </span>
              </template>
              </el-table-column>
              <el-table-column :label="$t('總派彩')" align="right" >
                <template #="scope">
                  <span :class="{ 'text_red': scope.row.Payout < 0 }">
                    {{ pointFormatter(null, null,scope.row.Payout) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column :label="$t('公司輸贏')" align="right" >
                <template #="scope">
                  <span :class="{ 'text_red': scope.row.WinLose < 0 }">
                    {{ pointFormatter(null, null, scope.row.WinLose) }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('遊戲類別')" prop="GameTypeName" width="80"/>
      <el-table-column :label="$t('遊戲商')" prop="GameProvider"  width="70"/>
      <el-table-column :label="$t('幣別')" prop="pointTypeName" width="60">
        <template #scope>
          <span>{{ $t(scope.row.pointTypeName) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('遊玩玩家數')" prop="BetMemberCount" />
      <el-table-column :label="$t('總下注次數')" prop="BetCount" />
      <el-table-column :label="$t('下注金額')" align="right">
        <template #="scope">
          <span :class="{ 'text_red': scope.row.Bet < 0 }" >
            {{ pointFormatter(null, null, scope.row.Bet) }}
          </span>
      </template>
      </el-table-column>
      <el-table-column :label="$t('總派彩')" align="right" >
        <template #="scope">
          <span :class="{ 'text_red': scope.row.Payout < 0 }">
            {{ pointFormatter(null, null,scope.row.Payout) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('公司輸贏')" align="right">
        <template #="scope">
          <span :class="{ 'text_red': scope.row.CompanyWinLose < 0 }">
            {{ pointFormatter(null, null, scope.row.CompanyWinLose) }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { GAME_PROVIDER_LIST, POINT_TYPE_LIST } from '@/configs'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import { loadingCounter } from '@/utils/loading-counter'
import { getGameResultReport } from '@/api/report'
import dayjs from 'dayjs'
import { SDisabledDate, EDisabledDate } from '@/utils/disabledDate'
import { pointFormatter } from '@/utils/formatters'
import { useNotice } from '@/utils/use-notice'
import i18n from '@/configs/locales'
import { outputXlsxGameReport } from '@/utils/outputXlsx'

export default {
  name: 'GameReport',
  setup () {
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    const searchData = ref({})
    const storeSearchData = useStoreForm({ searchData })
    // 呈現資料相關
    const tableData = reactive({
      rows: [],
    })
    const multipleTable = ref(null)

    // 當下查詢狀態
    const route = useRoute()
    const routeSearchData = computed(() => JSON.parse(decodeURIComponent(route.query?.searchData ?? null)) ?? {})
    const initSearchData = () => {
      searchData.value = {
        gameProviderID: routeSearchData.value?.gameProviderID ?? GAME_PROVIDER_LIST[0].id,
        sDate: routeSearchData.value?.sDate ?? dayjs().subtract(6, 'day').startOf('day').toDate(),
        eDate: routeSearchData.value?.eDate ?? dayjs().endOf('day').toDate(),
      }
    }
    initSearchData()

    // 設定禁用日期 禁用今天到dayRange前之外的日期
    const dayRange = 182
    const getSDisabledDate = (date) => {
      return SDisabledDate(date, searchData.value.eDate, dayRange)
    }
    const getEDisabledDate = (date) => {
      return EDisabledDate(date, searchData.value.sDate, dayRange)
    }
    // 搜尋表單相關
    const handleFetch = async () => {
      const inputData = {
        ...searchData.value,
      }
      loadingCountPlus()
      try {
        const res = await getGameResultReport(inputData)
        const dataList = res.Data.reduce((acc, cur) => {
          const { PointTypeID, List } = cur
          List.forEach((itemObj) => {
            acc.push({ ...itemObj, pointTypeName: POINT_TYPE_LIST.find(el => el.id === PointTypeID)?.name ?? PointTypeID })
          })
          return acc
        }, [])
        tableData.rows = dataList
        storeSearchData()
      } catch (error) {
        tableData.rows = []
        tableData.total = 0
      } finally {
        loadingCountMinus()
      }
    }
    useWatchRouterFetch(handleFetch)

    const showRow = (row) => {
      multipleTable.value.toggleRowExpansion(row)
    }
    // 將上一個展開關閉
    const changeExpand = (row, expandedRows) => {
      if (expandedRows.length > 1) multipleTable.value.toggleRowExpansion(expandedRows[0], false)
    }

    // 匯出用資料以及排序
    const { global: { t } } = i18n
    const xslx = () => {
      if (!tableData.rows.length) return useNotice({ type: 'warning', message: t('查無資料'), allowDuplicate: true })
      const translatedTitles = {
        GameTypeName: t('遊戲類別'),
        GameProvider: t('遊戲商'),
        pointTypeName: t('幣別'),
        GameName: t('遊戲名稱'),
        BetMemberCount: t('遊玩玩家數'),
        BetCount: t('總下注次數'),
        Bet: t('下注金額'),
        Payout: t('總派彩'),
        WinLose: t('公司輸贏'),
        CompanyWinLose: t('公司輸贏'),
      }
      // 提取不同資料表的內容
      const sheetData = tableData.rows.map(item => {
        const total = {}
        Object.keys(translatedTitles).forEach(el => {
          if (el === 'WinLose') return
          total[translatedTitles[el]] = item[el] ?? ''
        })
        return {
          sheetName: `${item.GameProvider} - ${t(item.pointTypeName)}`,
          totalData: [total],
          gameData: item.GameResult.map(innerArray => {
            const newData = {}
            Object.keys(translatedTitles).forEach(key => {
              if (key === 'CompanyWinLose') return
              newData[translatedTitles[key]] = innerArray[key] ?? ''
            })
            return newData
          }),
        }
      })

      outputXlsxGameReport(sheetData, t('遊戲報表'))
    }
    return {
      GAME_PROVIDER_LIST,
      searchData,
      isLoading,
      tableData,
      multipleTable,
      changeExpand,
      showRow,
      handleFetch,
      initSearchData,
      getSDisabledDate,
      getEDisabledDate,
      pointFormatter,
      xslx,
    }
  },
}
</script>
<style lang="scss" scoped>
:deep .game-report-table {
  .game-report-table-row {
    cursor: pointer;
  }

  .el-table__expanded-cell {
    padding: 0 0 0 48px;
    background-color: #f4f4f4 !important;
  }

  .collapse {
    overflow: hidden;
    max-height: 10000px;
    transform: scaleY(1);
    animation-name: collapse;
    animation-duration: 5s;
  }

  .text_red {
    color: red;
  }

  @keyframes collapse {
    from {
      max-height: 0;
    }

    to {
      max-height: 10000px;
    }
  }
}

.function-block .right {
  margin-left: auto;
}
</style>
