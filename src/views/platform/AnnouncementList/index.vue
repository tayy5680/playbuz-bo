<template>
  <div class="report-announcement" v-loading="isLoading">
    <el-card class="search-block" shadow="never">
      <el-form inline label-position="left" size="small">
        <el-form-item :label="$t('公告類型')">
          <el-select v-model="searchData.newsType">
            <el-option v-for="(value, key) in NEWS_TYPE" :key="key" :label="$t(value)" :value="parseInt(key)">{{ $t(value) }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('標題')">
          <el-input v-model="searchData.title" clearable />
        </el-form-item>
        <el-form-item :label="$t('狀態')">
          <el-select v-model="searchData.statusId">
            <el-option :label="$t('全部')" value="" />
            <el-option v-for="(item, index) in STATUS_ID" :key="index" :label="$t(item.label)" :value="index">{{ $t(item.label) }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('頁面')" v-if="[1,3].includes(searchData.newsType)">
          <el-select v-model="searchData.newsPage">
            <el-option :label="$t('所有頁面')" value="" />
            <el-option v-for="(item, index) in newsPageList" :key="index" :label="$t(item.PageName)" :value="item.PageId">{{ $t(item.PageName) }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('標籤')" v-if="searchData.newsType === 0">
          <el-select v-model="searchData.newsTag">
            <el-option :label="$t('所有標籤')" value="" />
            <el-option v-for="(item, index) in newsTagList" :key="index" :label="$t(item.TagsName)" :value="item.TagsId">{{ $t(item.TagsName) }}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('模糊搜尋')">
          <el-checkbox v-model="searchData.isFuzzySearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFetch">
            {{ $t('搜尋') }}
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="initSearchData(true)">
            {{ $t('清除條件') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="function-block">
      <div class="left">
        <PaginationComp
          v-model:page="pagination.page"
          v-model:count="pagination.count"
          :totalCount="tableData.total"
          @change="handleChangePagination"
        />
      </div>
      <div class="right">
        <el-button :loading="isLoading" @click="showDialog(true)" type="primary" size="small">{{$t('新增公告')}}</el-button>
      </div>
    </div>

    <el-table
      ref="multipleTable"
      class="announcement-table"
      row-class-name="announcement-table-row"
      :data="tableData.rows"
      style="width: 100%;"
      @row-click="showRow"
      :empty-text="$t('尚未包含任何資料')"
      @sort-change="handleChangeSort"
      @expand-change="changeExpand" >
      <!-- 點開後內容 -->
      <el-table-column type="expand">
        <template #default="props">
          <div m="4" class="collapse">

            <el-descriptions :title="`【${$t(NEWS_TYPE?.[tableData.newsType] ?? tableData.newsType)}】 ${props.row.Title}`" :column="4" border >
              <el-descriptions-item label="ID">{{ props.row.NewsId }}</el-descriptions-item>
              <el-descriptions-item :label="$t('排序')" :span="4">{{ props.row.FrontSort ?? '-' }}</el-descriptions-item>
              <el-descriptions-item :label="$t('標題')" :span="4">{{ props.row.Title }}</el-descriptions-item>
              <el-descriptions-item :label="$t('開始時間')" width="90" min-width="130" :span="2">{{ props.row.StartTime ? timeFormatter(props.row.StartTime) : $t('立即生效') }}</el-descriptions-item>
              <el-descriptions-item :label="$t('結束時間')" width="90" :span="2">{{ props.row.EndTime ? timeFormatter(props.row.EndTime) : $t('無期限') }}</el-descriptions-item>
              <el-descriptions-item :label="$t('上架狀態')" :span="2">{{ $t(STATUS_ID?.[props.row.StatusId]?.label ??  props.row.StatusId) }}</el-descriptions-item>
              <el-descriptions-item :label="$t('建立時間')" :span="2">{{ timeFormatter(props.row.CreateTime) }}</el-descriptions-item>
              <div v-if="[1,3].includes(tableData.newsType)">
                <el-descriptions-item :label="$t('開啟方式')" :span="2">{{ $t(newsOpenTypeList.find(el => el.OpenTypeId === props.row.OpenTypeId)?.OpenType ?? props.row.OpenTypeId) }}</el-descriptions-item>
                <el-descriptions-item :label="$t('跳出頻率')" :span="2">{{ $t(newsTriggerTypeList.find(el => el.TriggerTypeId === props.row.TriggerTypeId)?.TriggerType ?? props.row.TriggerTypeId) }}</el-descriptions-item>
                <el-descriptions-item :label="$t('顯示頁面')" :span="4">
                  <el-tag class="tagsItem" size="small" v-for="(item, index) in props.row.NewsPageInfo" :key="index">{{ $t(item.PageName) }}</el-tag>
                </el-descriptions-item>
              </div>
              <el-descriptions-item :label="$t('標籤')" :span="4" v-if="tableData.newsType === 0">
                <el-tag class="tagsItem" size="small" v-for="(item, index) in props.row.TagsInfo" :key="index">{{ item.TagsName }}</el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <br />
            <h3>{{ $t('多語系內容') }}</h3>
            <el-tabs class="lang-tabs" type="border-card" stretch>
              <el-tab-pane v-for="(item, index) in props.row.NewsTranslation" :key="index" :label="item.Locale">
                <el-descriptions :column="1" border >
                  <el-descriptions-item label="ID">{{ item.Id }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('標題')">{{ item.Title }}</el-descriptions-item>
                  <el-descriptions-item :label="$t('內文')"  v-if="tableData.newsType === 0">
                    <div v-if="item.Content">
                      <el-button :type="isContentHTML ? 'primary' : 'info'" size="small" @click="isContentHTML = true">{{ $t('模擬畫面') }}</el-button>
                      <el-button :type="!isContentHTML ? 'primary' : 'info'" size="small" @click="isContentHTML = false">{{ $t('檢視原始內容') }}</el-button>
                    </div>
                    <div v-if="isContentHTML && tableData.newsType === 0" v-html="item.Content"></div>
                    <div v-else> {{ item.Content }} </div>
                  </el-descriptions-item>
                  <div v-if="[1,3].includes(tableData.newsType)">
                    <el-descriptions-item :label="$t('按鈕文字')">{{ item.ActionText }}</el-descriptions-item>
                    <el-descriptions-item :label="$t('連結')" :span="4">
                      <b>{{ $t('電腦版') }}</b>
                      <div class="url-area">{{ item.OpenUrlPc ?? '-' }}</div>
                      <b>{{ $t('手機版') }}</b>
                      <div class="url-area">{{ item.OpenUrlMo ?? '-' }}</div>
                    </el-descriptions-item>
                  </div>
                  <el-descriptions-item :label="$t(MEDIA_TYPE?.[item.MediaType] ?? '圖片')" :span="4">
                    <b>{{ $t('電腦版') }}</b>
                    <viewImageItem :url="item.ImgUrlPc" :data="item"/>
                    <b>{{ $t('手機版') }}</b>
                    <viewImageItem :url="item.ImgUrlMo" :data="item"/>
                  </el-descriptions-item>
                </el-descriptions>
              </el-tab-pane>
            </el-tabs>
          </div>
        </template>
      </el-table-column>
      <!-- 外層 -->
      <el-table-column :label="$t('排序')" width="50" align="center" prop="FrontSort">
        <template #="scope">
          {{ scope.row.FrontSort ?? '-' }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('公告類型')" width="100" align="center">
        <template #="scope">
          {{ $t(NEWS_TYPE?.[tableData.newsType] ?? tableData.newsType) }}
        </template>
      </el-table-column>
      <el-table-column :label="$t('標題')" min-width="150" prop="Title">
        <template #="scope">
          <div class="text-ellipsis">{{ scope.row.Title }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('狀態')" width="100" prop="StatusId">
        <template #="scope">
          <div :class="`status${scope.row.StatusId}`">{{ $t(STATUS_ID?.[scope.row.StatusId]?.label ??  scope.row.StatusId)  }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('公告期間')" min-width="250">
        <template #="scope">
          <div>{{ $t('開始時間') }} ：{{ scope.row.StartTime ? timeFormatter(scope.row.StartTime) : $t('立即生效') }}</div>
          <div>{{ $t('結束時間') }} ：{{ scope.row.EndTime ? timeFormatter(scope.row.EndTime) : $t('無期限') }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" align="center" fixed="right" width="100">
        <template #="scope">
            <el-button @click.stop="showDialog(true, scope.$index)" type="primary" size="small"> {{ $t('編輯') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增、修改用視窗 -->
    <viewEdit :setAdd="setAdd" :setEdit="setEdit" />

    <!-- 圖片預覽用視窗 -->
    <div class="img-dialog">
      <el-dialog v-model="isShowImgDialog">
        <el-image :src="dialogImgUrl" />
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { ref, reactive, computed, provide, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { GAME_PROVIDER_LIST } from '@/configs'
import { useStoreForm } from '@/utils/use-store-form'
import { useWatchRouterFetch } from '@/utils/use-watch-router-fetch'
import store from '@/store'
import dayjs from 'dayjs'
import viewImageItem from './ImgItem.vue'
import viewEdit from './Edit.vue'
import PaginationComp from '@/components/Pagination'
import { NEWS_TYPE, STATUS_ID, MEDIA_TYPE } from './config.js'
import { timeFormatter } from '@/utils/formatters'
import { useNotice } from '@/utils/use-notice'
import {
  postNewsGet,
  getNewsOpenTypeGet,
  getNewsTranslationGet,
  getNewsTriggerTypeGet,
  getNewsPageGet,
  getNewsTagGet,
  postNewsAdd,
  postNewsMod,
  postNewsTranslationMod,
  postNewsPageMod,
  postNewsTagMod,
} from '@/api/platform'
import { getLocale } from '@/api/token'
import { useI18n } from 'vue-i18n'
dayjs.extend(require('dayjs/plugin/isBetween'))

export default {
  name: 'announcement-list',
  components: {
    viewImageItem,
    viewEdit,
    PaginationComp,
  },
  setup () {
    const isLoading = ref(false)
    provide('isLoading', isLoading)
    const { locale } = useI18n()
    const newsOpenTypeList = computed(() => store.state.platform.newsOpenTypeList)
    const newsTriggerTypeList = computed(() => store.state.platform.newsTriggerTypeList)
    const newsPageList = computed(() => store.state.platform.newsPageList)
    const localeList = computed(() => store.state.token.localeList)
    const newsTagList = computed(() => store.state.platform.newsTagList)
    const searchData = ref({})
    // 呈現資料相關
    const tableData = reactive({
      rows: [],
      newsType: 0,
      total: 0,
    })
    provide('tableData', tableData)
    const multipleTable = ref(null)

    // 查詢相關
    const route = useRoute()
    const routeSearchData = computed(() => JSON.parse(decodeURIComponent(route.query?.searchData ?? null)) ?? {})
    const pagination = ref({})
    const sort = ref({})
    const initSearchData = (reset = false) => {
      searchData.value = {
        newsType: routeSearchData.value?.newsType ?? 0,
        isFuzzySearch: true,
        title: '',
        constent: '',
        statusId: '',
        newsPage: '',
        newsTag: '',
      }
      if (!reset) searchData.value = { ...searchData.value, ...routeSearchData.value }
      sort.value = {
        field: 'CreateTime',
        orderType: 'desc',
      }
      pagination.value = {
        page: 1,
        count: 50,
      }
    }
    const storeSearchData = useStoreForm({ searchData, pagination })

    const handleChangeSort = ({ prop, order }) => {
      sort.value.field = prop
      sort.value.orderType = order === 'ascending' ? 'asc' : 'desc'
      pagination.value.page = 1
      handleFetch()
    }
    const handleChangePagination = () => {
      handleFetch()
    }
    // 搜尋表單相關
    const handleFetch = async () => {
      if (isLoading.value) return
      try {
        isLoading.value = true
        const inputData = {
          ...searchData.value,
          skip: (pagination.value.page - 1) * pagination.value.count,
          show: pagination.value.count,
          field: sort.value.field,
          orderType: sort.value.orderType,
        }
        if (searchData.value.newsPage) inputData.newsPage = [searchData.value.newsPage]
        if (searchData.value.newsTag) inputData.newsTag = [searchData.value.newsTag]
        const res = await postNewsGet(inputData)
        tableData.total = res.count
        tableData.rows = await Promise.all(res.Data.map(item => {
          return {
            ...item,
            NewsTranslation: [],
          }
        }))

        tableData.newsType = searchData.value.newsType
        storeSearchData()
      } catch (error) {
        tableData.rows = []
        tableData.newsType = 0
        tableData.total = 0
      } finally {
        isLoading.value = false
      }
    }
    initSearchData()
    useWatchRouterFetch(handleFetch)

    // 點開行列查看詳細內容時，再取得多語系資料
    const showRow = async (row) => {
      if (isLoading.value) return
      if (!row.NewsTranslation.length) {
        try {
          isLoading.value = true
          const res = await getNewsTranslationGet({ NewsId: row.NewsId })
          row.NewsTranslation = res.Data.map((item) => {
            if (item.ImgUrlMo && !item.ImgUrlMo?.includes('https')) item.ImgUrlMo = res.BaseUrl + item.ImgUrlMo
            if (item.ImgUrlPc && !item.ImgUrlPc?.includes('https')) item.ImgUrlPc = res.BaseUrl + item.ImgUrlPc
            return item
          })
        } catch {
          row.NewsTranslation = []
        } finally {
          isLoading.value = false
        }
      }
      nextTick(() => {
        multipleTable.value.toggleRowExpansion(row)
      })
    }
    // 將上一個展開關閉
    const changeExpand = (row, expandedRows) => {
      if (expandedRows.length > 1) multipleTable.value.toggleRowExpansion(expandedRows[0], false)
    }

    // 內文是否使用v-html來檢視
    const isContentHTML = ref(true)

    /** 新增/編輯公告
     * @param {Number} isShow 是否顯示新增/編輯的彈出視窗
     * @param {String} type 彈窗畫面採用的類型： add（新增） 或 edit（編輯）
     * @param {Number} editIndex 選定編輯的那份資料Index
     */
    const showDialogData = ref({
      isShow: false,
      type: 'add',
      editIndex: '',
    })
    provide('showDialogData', showDialogData)
    const showDialog = async (bool, index = null) => {
      // index === null ? ‘新增公告’：‘編輯公告’
      if (isLoading.value) return
      if (index !== null && bool && !tableData.rows[index].NewsTranslation.length) {
        try {
          isLoading.value = true
          const res = await getNewsTranslationGet({ NewsId: tableData.rows[index].NewsId })
          tableData.rows[index].NewsTranslation = res.Data.map((item) => {
            if (item.ImgUrlMo && !item.ImgUrlMo?.includes('https')) item.ImgUrlMo = res.BaseUrl + item.ImgUrlMo
            if (item.ImgUrlPc && !item.ImgUrlPc?.includes('https')) item.ImgUrlPc = res.BaseUrl + item.ImgUrlPc
            return item
          })
        } catch {
          tableData.rows[index].NewsTranslation = []
        } finally {
          isLoading.value = false
        }
      }
      nextTick(() => {
        showDialogData.value = {
          isShow: bool,
          type: index === null ? 'add' : 'edit',
          editIndex: index && index !== null ? index : 0,
        }
      })
    }

    // 圖片
    const isShowImgDialog = ref(false)
    const dialogImgUrl = ref('')
    const setImgDialog = (isShow, url) => {
      isShowImgDialog.value = isShow
      dialogImgUrl.value = url
    }
    provide('setImgDialog', setImgDialog)

    const setAdd = async (inputData) => {
      if (isLoading.value) return
      try {
        isLoading.value = true
        await postNewsAdd(inputData)
        useNotice({ type: 'success', message: '新增成功' })
      } catch (error) {
        useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
      } finally {
        showDialogData.value.isShow = false
        isLoading.value = false
        handleFetch()
      }
    }

    const setEdit = async (inputData) => {
      if (isLoading.value) return
      const beforeData = tableData.rows[showDialogData.value.editIndex]
      try {
        isLoading.value = true
        // 是否修改了標籤
        const beforeTagsInfo = beforeData.TagsInfo?.map(el => el.TagsId) ?? []
        if (JSON.stringify(beforeTagsInfo) !== JSON.stringify(inputData.NewsTag) && inputData.newsType === 0) {
          await postNewsTagMod(inputData)
        }
        // 是否修改了頁面
        const beforeNewsPage = beforeData.NewsPageInfo?.map(el => el.PageId) ?? []
        if (JSON.stringify(beforeNewsPage) !== JSON.stringify(inputData.NewsPage) && inputData.newsType === 1) {
          await postNewsPageMod(inputData)
        }

        await postNewsMod(inputData)
        await postNewsTranslationMod(inputData)
        useNotice({ type: 'success', message: '修改成功' })
      } catch (e) {
        useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
      } finally {
        showDialogData.value.isShow = false
        isLoading.value = false
        handleFetch()
      }
    }

    // 取得參數對應內容，並儲存於vuex
    const getNewsOpenType = async () => {
      if (newsOpenTypeList.value.length) return
      try {
        const res = await getNewsOpenTypeGet()
        store.dispatch('platform/setNewsOpenType', res?.Data ?? [])
      } catch (e) {
        console.log('getNewsOpenType', e)
        newsOpenTypeList.value = []
        useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
      }
    }
    const getTriggerType = async () => {
      if (newsTriggerTypeList.value.length) return
      try {
        const res = await getNewsTriggerTypeGet()
        store.dispatch('platform/setNewsTriggerType', res?.Data ?? [])
      } catch (e) {
        console.log('getTriggerType', e)
        newsTriggerTypeList.value = []
        useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
      }
    }
    const getNewsPage = async () => {
      if (newsPageList.value.length) return
      try {
        const res = await getNewsPageGet()
        store.dispatch('platform/setNewsPage', res?.Data ?? [])
      } catch (e) {
        console.log('getNewsPage', e)
        newsPageList.value = []
        useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
      }
    }
    const getLocaleList = async () => {
      if (localeList.value.length) return
      try {
        const res = await getLocale()
        store.dispatch('token/setLocaleList', res?.Data ?? [])
      } catch (e) {
        console.log('getLocaleList', e)
        localeList.value = []
        useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
      }
    }
    const getNewsTag = async () => {
      try {
        const res = await getNewsTagGet()
        store.dispatch('platform/setNewsTag', res?.Data ?? [])
      } catch (e) {
        console.log('getNewsTag', e)
        newsTagList.value = []
        useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
      }
    }
    // 語系更動時更新
    watch(locale, () => {
      getNewsTag()
      handleFetch()
    })
    const init = async () => {
      // 數值與其意涵的基本資料取得
      getNewsOpenType()
      getTriggerType()
      getNewsPage()
      getLocaleList()
      getNewsTag()
    }
    init()

    return {
      GAME_PROVIDER_LIST,
      NEWS_TYPE,
      STATUS_ID,
      MEDIA_TYPE,
      searchData,
      isLoading,
      tableData,
      multipleTable,
      isShowImgDialog,
      dialogImgUrl,
      newsOpenTypeList,
      newsTriggerTypeList,
      isContentHTML,
      newsPageList,
      newsTagList,
      pagination,
      changeExpand,
      showRow,
      handleFetch,
      initSearchData,
      timeFormatter,
      showDialog,
      setAdd,
      setEdit,
      handleChangeSort,
      handleChangePagination,
    }
  },
}
</script>

<style lang="scss" scoped>
:deep {
  .el-descriptions__label {
    width: 90px;
  }

  .el-descriptions__content {
    word-break: break-all;
  }

  .img-dialog {
    .el-dialog__header {
      display: none;
    }

    .el-dialog__body {
      padding: 5px 5px 3px 5px;
    }

    .el-overlay {
      display: flex;
      align-items: center;
    }

    .el-dialog {
      margin: auto !important;
      width: auto !important;
      max-width: 50%;
    }
  }
}

:deep .announcement-table {
  .announcement-table-row {
    cursor: pointer;
  }

  .el-table__expanded-cell {
    padding: 0 0 0 30px;
    background-color: #f4f4f4 !important;
  }

  .cell {
    word-break: break-all;

    .el-button + .el-button {
      margin: 5px 0 0 0;
    }
  }

  .collapse {
    overflow: hidden;
    padding: 30px 0;
    width: calc(100vw - 440px);
    max-height: 10000px;
    transform: scaleY(1);
    animation-name: collapse;
    animation-duration: 3s;

    h3 {
      color: #000;
    }

    .tagsItem {
      margin: 2px;
    }

    .lang-tabs {
      border: 1px solid #eceef5;
      box-shadow: none;

      .el-tabs__header {
        background-color: #e8e8e8;
      }

      .el-tabs__content {
        padding: 32px;
        font-size: 32px;
        font-weight: 600;
        color: #6b778c;
      }

      .url-area {
        margin: 5px 0 10px 0;
        padding: 10px;
        background-color: #fafafa;
        border: 1px solid #ddd;
        border-radius: 10px;
      }
    }
  }

  .text-ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

@media screen and (max-width: 650px) {
  .function-block {
    display: block;
    text-align: center;
    line-height: 35px;
  }
}

@media screen and (max-width: 800px) {
  :deep .announcement-table .collapse {
    width: 100%;
  }
}
</style>
