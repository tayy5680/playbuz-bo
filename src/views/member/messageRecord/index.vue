<template>
  <div class="message-record" v-loading="isLoading">
    <el-card class="search-block" shadow="never">
      <el-form inline label-position="left" size="small">
        <el-form-item :label="$t('搜尋類型')">
          <el-select v-model="searchData.searchType" clearable>
            <template v-for="option of VERIF_TYPE_LIST" :key="option.key">
              <el-option :label="$t(option.name)" :value="option.key" />
            </template>
          </el-select>
        </el-form-item>
        <el-option v-for="(option, index) in STATUS_ID" :key="index" label="option" :value="index" />
        <el-form-item>
          <el-button type="primary" @click="handleFetch">
            {{$t('搜尋')}}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="initSearchData">
            {{$t('清除條件')}}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div class="table-block">
      <el-table :data="tableData.rows" :empty-text="$t('尚未包含任何資料')" style="width: 100%;">
        <el-table-column :label="$t('序列')" prop="serialNumber">
          <template #="scope">
            <span>{{ scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('日期')" min-width="160">
          <template #="scope">
            <span>{{ timeFormatter(scope.row.CreateTime) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('會員信箱')" prop="Email" min-width="190" />
        <el-table-column :label="$t('電話號碼')" prop="Phone" min-width="190" />
        <el-table-column :label="$t('驗證碼')" min-width="190">
          <template #="scope">
            <CopyableButton :modelValue="scope.row.Code" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('發送狀態')" min-width="190">
          <template #="scope">
            <span>{{ scope.row.Status ? $t('已發送') : '-' }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'
import { loadingCounter } from '@/utils/loading-counter'
import CopyableButton from '@/components/CopyableButton'
import { timeFormatter } from '@/utils/formatters'
import { getInfosSmsVerifications, getInfosEmailVerifications } from '@/api/member'

const VERIF_TYPE_LIST = [
  { name: '電話號碼', key: 'Phone' },
  { name: '會員信箱', key: 'Email' },
]

export default {
  name: 'message-record',

  components: {
    CopyableButton,
  },

  setup () {
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    const searchData = ref({})
    const initSearchData = () => {
      searchData.value = {
        searchType: '',
        searchString: '',
      }
    }
    initSearchData()

    const tableData = reactive({
      rows: [],
      total: 0,
    })

    const handleFetch = async () => {
      try {
        loadingCountPlus()

        const responseSms = await getInfosSmsVerifications()
        const responseEmail = await getInfosEmailVerifications()
        tableData.rows = [...responseSms.Data, ...responseEmail.Data]
        if (!tableData.rows) return

        if (searchData.value.searchType) {
          tableData.rows = tableData.rows.filter(item => item[searchData.value.searchType] !== undefined)
        }
        tableData.rows.sort((a, b) => b.CreateTime.localeCompare(a.CreateTime))
      } catch {
      } finally {
        loadingCountMinus()
      }
    }
    handleFetch()

    return {
      VERIF_TYPE_LIST,
      searchData,
      tableData,
      isLoading,
      // fn
      timeFormatter,
      handleFetch,
      initSearchData,
    }
  },
}
</script>
