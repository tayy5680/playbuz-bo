<template>
  <div
    class="AdvertiserLevelConfirm"
    v-loading="isLoading"
  >
    <el-card
      class="search-block"
      shadow="never"
    >
      <el-form
        inline
        label-position="left"
        size="small"
      >
        <el-form-item :label="$t('申請時間')">
          <el-date-picker
            v-model="searchData.Time"
            type="date"
          />
        </el-form-item>
        <el-form-item :label="$t('加盟商帳號')">
          <el-input
            v-model="searchData.Account"
            clearable
          />
        </el-form-item>
        <el-form-item :label="$t('加盟商名稱')">
          <el-input
            v-model="searchData.NickName"
            clearable
          />
        </el-form-item>
        <el-form-item :label="$t('處理進度')">
          <el-select
            v-model="searchData.ApplyStatus"
            :placeholder="' '"
            clearable
          >
            <el-option
              v-for="(option, index) in STATUS_ID"
              :key="index"
              :label="$t(option)"
              :value="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleFetch"
          >
            {{$t('搜尋')}}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="initSearchData">{{$t('清除條件')}}</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="table-block">
      <el-table
        :data="tableData.rows"
        style="width: 100%;"
        @sort-change="handleChangeSort"
        :empty-text="$t('尚未包含任何資料')"
      >
        <el-table-column
          :label="$t('序列')"
          align="left"
          width="80"
        >
          <template #="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('申請時間')"
          min-width="140"
          prop="formatApplyTime"
        />
        <el-table-column
          :label="$t('加盟商帳號')"
          min-width="140"
          prop="MemberAccount"
        />
        <el-table-column
          :label="$t('加盟商名稱')"
          min-width="140"
          prop="NickName"
        />
        <el-table-column
          :label="$t('申請重置等級')"
          min-width="140"
          prop="RemainingLv"
        />
        <el-table-column :label="$t('狀態')">
          <template #="scope">
            <span>{{ $t(STATUS_ID[scope.row.ApplyStatus]) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('最近一次修改時間')"
          min-width="160"
        >
          <template #="scope">
            <span align="center">{{ scope.row.formatVerifyTime }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('備註')"
          min-width="180"
          prop="Note"
        />
        <el-table-column
          :label="$t('操作')"
          min-width="120"
          align="center"
          :fixed="isMobile ? false : 'right'"
        >
          <template #="scope">
            <Edit
              :scope="scope"
              @sucess="handleFetch"
            />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import {
  ref,
  reactive,
} from 'vue'

import Edit from './Edit'

import { testIsMobile } from '@/utils'
import { loadingCounter } from '@/utils/loading-counter'
import {
  getDataReportAdLvResetGet,
} from '@/api/report'
import {
  STATUS_ID,
} from './config'
import dayjs from 'dayjs'
import { useStoreForm } from '@/utils/use-store-form'

export default {
  name: 'AdvertiserLevelConfirm',

  components: {
    Edit,
  },

  setup () {
    const isMobile = testIsMobile()
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    const tableData = reactive({
      rows: [],
      total: 0,
    })

    const handleChangeSort = () => {}

    const searchData = ref({})
    const initSearchData = () => {
      searchData.value = {
        MemberID: '',
        Time: '',
        Account: '',
        NickName: '',
        ApplyStatus: '',
      }
    }
    initSearchData()

    const storeSearchData = useStoreForm({ searchData })

    const handleFetch = async () => {
      loadingCountPlus()
      const inputData = JSON.parse(JSON.stringify(searchData.value))

      for (const [key, value] of Object.entries(inputData)) {
        if (value === '') delete inputData[key]
        else if (key === 'Time') {
          inputData.ApplySTime = dayjs(inputData.Time).startOf('day').toISOString()
          inputData.ApplyETime = dayjs(inputData.Time).endOf('day').toISOString()
          delete inputData.Time
        }
      }

      try {
        const result = await getDataReportAdLvResetGet(inputData)
        tableData.rows = result.Data.map(item => {
          return {
            ...item,
            formatApplyTime: dayjs(item.ApplyTime).format('YYYY-MM-DD hh:mm:ss'),
            formatVerifyTime: item.VerifyTime ? dayjs(item.VerifyTime).format('YYYY-MM-DD hh:mm:ss') : '-',
          }
        })
      } catch {
        tableData.rows = []
      } finally {
        storeSearchData()
        loadingCountMinus()
      }
    }

    handleFetch()

    return {
      isMobile,
      searchData,
      tableData,
      isLoading,
      STATUS_ID,
      // fn
      handleChangeSort,
      handleFetch,
      initSearchData,
    }
  },
}
</script>
