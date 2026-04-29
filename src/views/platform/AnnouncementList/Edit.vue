<template>
  <div class="announcement_edit">
    <el-dialog
      v-model="showDialogData.isShow"
      :title="$t(TYPE_LABEL[showDialogData.type].title)"
      width="70%"
    >
      <el-form ref="ruleFormRef" :model="formData" @submit.prevent="submitForm(ruleFormRef)" label-width="120px" :rules="rules" >
        <el-form-item :label="$t('公告類型')">
          <el-radio-group v-model="formData.newsType" v-if="showDialogData.type === 'add'" >
            <el-radio v-for="(value, key) in NEWS_TYPE" :key="key" :label="parseInt(key)" @change="setMediaType">{{ $t(value) }}</el-radio>
          </el-radio-group>
          <div v-else>
            <el-radio >{{ $t(NEWS_TYPE[formData.newsType]) }}</el-radio>
          </div>
        </el-form-item>

        <el-form-item :label="$t('標題')" prop="Title">
          <el-input v-model="formData.Title" />
        </el-form-item>
        <el-form-item :label="$t('開始時間')" prop="StartTime">
          <el-date-picker :disabled="isclearStartTime" type="datetime" v-model="formData.StartTime" :clearable="false" class="pr-25" />
          <el-checkbox class="checkbox" v-model="isclearStartTime" @change="clearStartTime">{{ $t('立即生效') }}</el-checkbox>
        </el-form-item>
        <el-form-item :label="$t('結束時間')" prop="EndTime">
          <el-date-picker :disabled="isclearEndTime" type="datetime" v-model="formData.EndTime" :clearable="false" class="pr-25" />
          <el-checkbox class="checkbox" v-model="isclearEndTime" @change="clearEndTime">{{ $t('無期限') }}</el-checkbox>
        </el-form-item>

        <el-form-item :label="$t('排序')" class="front_sort">
          <el-checkbox class="checkbox" v-model="formData.isUnsorted">{{ $t('無排序') }}</el-checkbox>
          <el-input-number v-model="formData.FrontSort" :disabled="formData.isUnsorted" value-on-clear="null" :min="1"/>
        </el-form-item>

        <el-form-item :label="$t('上架狀態')">
          <el-select v-model="formData.StatusId">
            <el-option v-for="(item, index) in STATUS_ID" :key="index" :label="$t(item.label)" :value="item.id">{{ $t(item.label) }}</el-option>
          </el-select>
        </el-form-item>

        <div v-if="[1,3].includes(formData.newsType)">
          <el-form-item :label="$t('開啟方式')">
            <el-radio-group v-model="formData.OpenTypeId">
              <el-radio v-for="(item, index) in newsOpenTypeList" :key="index" :label="item.OpenTypeId">{{ $t(item.OpenType) }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item :label="$t('跳出頻率')">
            <el-select v-model="formData.TriggerTypeId">
              <el-option v-for="(item, index) in newsTriggerTypeList" :key="index" :label="$t(item.TriggerType)" :value="item.TriggerTypeId">{{ $t(item.TriggerType) }}</el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('顯示頁面')">
            <el-checkbox-group v-model="formData.NewsPage" :min="1">
              <el-checkbox v-for="(value, index) in newsPageList" :key="index" :label="value.PageId">{{ $t(value.PageName) }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </div>

        <el-form-item v-if="formData.newsType === 0" :label="$t('標籤')">
          <el-checkbox-group v-model="formData.NewsTag" :min="1">
            <el-checkbox v-for="(item, index) in newsTagList" :key="index" :label="item.TagsId">{{ item.TagsName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item :label="$t('多語系')" prop="NewsTranslation">
          <el-dropdown @command="addTab" v-if="btnLangList.length" trigger="click">
            <el-button type="primary">{{ $t('添加語系內容') }}</el-button>
            <template #dropdown>
              <el-dropdown-menu >
                <el-dropdown-item v-for="(item, index) in btnLangList" :key="index" :command="item">{{ item[`LocaleName_${locale.replace('-', '')}`] }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-form-item>

        <el-tabs
          v-if="formData.NewsTranslation.length"
          v-model="nowTabsIndex"
          type="card"
          class="demo-tabs"
          closable
          @tab-remove="removeTab"
        >
          <el-tab-pane
            v-for="(item, index) in formData.NewsTranslation"
            :key="index"
            :label="localeList?.find((el) => el.Locale === item.Locale)?.[`LocaleName_${locale.replace('-', '')}`] ?? item.Locale "
            :name="index.toString()"
          >
            <el-form-item :label="$t('標題')" :prop="`NewsTranslation.${index}.Title`" :rules="rules.NewsTranslationArray.Title">
              <el-input v-model="item.Title" />
            </el-form-item>
            <el-form-item :label="$t('內文')" v-if="formData.newsType === 0">
              <div v-if="item.Content">
                <el-button :type="!formData.isContentHTML ? 'primary' : 'info'" size="small" @click="formData.isContentHTML = false">{{ $t('檢視原始內容') }}</el-button>
                <el-button :type="formData.isContentHTML ? 'primary' : 'info'" size="small" @click="formData.isContentHTML = true">{{ $t('模擬畫面') }}</el-button>
              </div>
              <div v-if="formData.newsType === 0 && formData.isContentHTML" v-html="item.Content" class="simulated"></div>
              <el-input v-else v-model="item.Content" type="textarea" :autosize="{ minRows: 6}" />
            </el-form-item>
            <div v-if="[1,3].includes(formData.newsType)">
              <el-form-item :label="$t('按鈕文字')">
                <el-input v-model="item.ActionText" />
              </el-form-item>
              <el-form-item :label="$t('連結')">
                <b>{{ $t('電腦版路徑') }}</b>
                <div><el-input v-model="item.OpenUrlPc" @change="setUrlMo('pc', item)" /></div>
                <b class="pr-25">{{ $t('手機版路徑') }}</b>
                <el-checkbox class="checkbox" :v-model="item.isSameUrl" @change="setUrlMo('sameUrlbtn', item)">{{ $t('同電腦版') }}</el-checkbox>
                <div><el-input v-model="item.OpenUrlMo" :disabled="!item.isSameUrl" /></div>
              </el-form-item>
            </div>
            <el-form-item :label="$t('圖片')" :prop="`NewsTranslation.${index}.ImgPc`" :rules="rules.NewsTranslationArray.ImgPc">
              <div><b>{{ $t('電腦版') }}</b></div>
              <el-radio-group v-model="item.MediaType" v-if="[1,3].includes(formData.newsType)" @change="changeMediaType">
                <el-radio v-for="(value, key) in MEDIA_TYPE" :key="key" :label="key">{{ $t(value) }}</el-radio>
              </el-radio-group>
              <div class="video_tips" v-if="item.MediaType === 'video'">
                {{ $t('請填入youtube網址，並符合以下格式之一') }}<br>
                {{ $t('一般') }}：<span>https://www.youtube.com/watch?v=({{ $t('影片ID') }})</span>
                <br>
                {{ $t('短影音') }}：<span>https://www.youtube.com/shorts/({{ $t('影片ID') }})</span>
              </div>
              <div v-if="item.MediaType === 'video'">
                <el-input  v-model="item.videoPc"/>
                <div>{{ $t('請上傳尺寸為 {size} 的影片', { size: '1920x1080' }) }}</div>
              </div>
              <div v-else>
                <div v-if="item.ImgUrlPc && item.originMediaType === item.MediaType" class="show_url">{{ item.ImgUrlPc }}</div>
                <viewImageItem
                  :itemType="'edit'"
                  :url="item.ImgUrlPc"
                  :itemName="'ImgPc'"
                  :data="item"
                  @update="onPreview" />
              </div>
            </el-form-item>
            <el-form-item :prop="`NewsTranslation.${index}.ImgMo`" :rules="rules.NewsTranslationArray.ImgMo">
              <template #label>&nbsp;</template>
              <div><b>{{ $t('手機版') }}</b></div>
              <div v-if="item.MediaType === 'video'">
                <el-input  v-model="item.videoMo"/>
                <div>{{ $t('請上傳尺寸為 {size} 的影片', { size: '1080x1920' }) }}</div>
              </div>
              <div v-else>
                <div v-if="item.ImgUrlMo && item.originMediaType === item.MediaType" class="show_url">{{ item.ImgUrlMo }}</div>
                <viewImageItem
                  :itemType="'edit'"
                  :url="item.ImgUrlMo"
                  :itemName="'ImgMo'"
                  :data="item"
                  @update="onPreview" />
              </div>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDialogData.isShow = false">{{ $t('取消') }}</el-button>
          <el-button type="primary" v-loading="isLoading"  @click="submitForm(ruleFormRef)">{{ $t(TYPE_LABEL[showDialogData.type].btn) }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, inject, watch, reactive, nextTick } from 'vue'
import { NEWS_TYPE, STATUS_ID, MEDIA_TYPE } from './config.js'
import dayjs from 'dayjs'
import store from '@/store'
import viewImageItem from './ImgItem.vue'
import { useI18n } from 'vue-i18n'
import { useNotice } from '@/utils/use-notice'
dayjs.extend(require('dayjs/plugin/utc'))
export default {
  name: 'announcementEditArea',
  components: {
    viewImageItem,
  },
  props: {
    setAdd: {
      type: Function,
      default: () => '',
    },
    setEdit: {
      type: Function,
      default: () => '',
    },
  },
  setup (props) {
    const { t, locale } = useI18n()
    const isLoading = inject('isLoading')
    const isSubmit = ref(false)
    const localeList = computed(() => store.state.token.localeList)
    const newsOpenTypeList = computed(() => store.state.platform.newsOpenTypeList)
    const newsTriggerTypeList = computed(() => store.state.platform.newsTriggerTypeList)
    const newsPageList = computed(() => store.state.platform.newsPageList)
    const newsTagList = computed(() => store.state.platform.newsTagList)
    const TYPE_LABEL = {
      add: {
        title: '新增公告',
        btn: '確定新增',
      },
      edit: {
        title: '編輯公告',
        btn: '確定編輯',
      },
    }
    const defaultData = {
      Title: '',
      Content: '',
      StatusId: 0,
      StartTime: dayjs().format('YYYY-MM-DDT00:00:00Z'),
      EndTime: dayjs().add(7, 'day').format('YYYY-MM-DDT00:00:00Z'),
      FrontSort: 0,
      OpenTypeId: 1,
      TriggerTypeId: 1,
      NewsTranslation: [],
      NewsPage: [1],
      NewsTag: [1],
      newsType: 0,
      isUnsorted: true,
      isContentHTML: false,
    }
    const formData = ref({})

    const isclearStartTime = ref(false)
    const isclearEndTime = ref(false)
    const tableData = inject('tableData')
    const showDialogData = inject('showDialogData')

    const setUrlMo = (type, item) => {
      if (type === 'sameUrlbtn') item.isSameUrl = !item.isSameUrl
      if (!item.isSameUrl) formData.value.NewsTranslation[nowTabsIndex.value].OpenUrlMo = item.OpenUrlPc
    }

    const init = () => {
      formData.value = {}
      isSubmit.value = false
      nowTabsIndex.value = '0'
      if (ruleFormRef.value) ruleFormRef.value.clearValidate()
      if (showDialogData.value.type === 'edit') {
        const data = tableData.rows[showDialogData.value.editIndex]
        formData.value = {
          ...data,
          newsType: tableData.newsType,
          NewsTag: data.TagsInfo?.map(el => el.TagsId) ?? [1],
          NewsPage: data.NewsPageInfo?.map(el => el.PageId) ?? [1],
          FrontSort: data.FrontSort ?? 0,
          isUnsorted: data.FrontSort === null,
          NewsTranslation: [],
        }
        nextTick(() => {
          data.NewsTranslation.forEach(el => {
            formData.value.NewsTranslation.push({
              ...el,
              isSameUrl: el.OpenUrlPc === el.OpenUrlMo,
              ImgPc: [],
              ImgMo: [],
              videoPc: el.MediaType === 'video' ? el.ImgUrlPc : '',
              videoMo: el.MediaType === 'video' ? el.ImgUrlMo : '',
              MediaType: el.MediaType ?? 'img',
              originMediaType: el.MediaType ?? 'img',
            })
          })
        })
        isclearStartTime.value = Boolean(!formData.value.StartTime)
        isclearEndTime.value = Boolean(!formData.value.EndTime)
      } else {
        formData.value = {
          ...defaultData,
          NewsTranslation: [],
        }
        isclearStartTime.value = false
        isclearEndTime.value = false
      }
    }

    // 顯示dialog時重設資料
    watch(showDialogData, (val) => {
      if (val.isShow) init()
      else {
        val.type = 'add'
        val.editIndex = ''
      }
    })

    // StartTime立即生效按鈕
    const clearStartTime = (bool) => {
      isclearStartTime.value = bool
      if (bool) formData.value.StartTime = ''
      else {
        if (showDialogData.value.type === 'add') formData.value.StartTime = defaultData.StartTime
        else formData.value.StartTime = tableData.rows[showDialogData.value.editIndex].StartTime
      }
    }

    // EndTime無期限按鈕
    const clearEndTime = (bool) => {
      isclearEndTime.value = bool
      if (bool) formData.value.EndTime = ''
      else {
        if (showDialogData.value.type === 'add') formData.value.EndTime = defaultData.EndTime
        else formData.value.EndTime = tableData.rows[showDialogData.value.editIndex].EndTime
      }
    }

    // 多語系tab設定
    const nowTabsIndex = ref('0')
    const btnLangList = computed(() => {
      return localeList.value.filter(lang => {
        return !formData.value.NewsTranslation.some(data => data.Locale === lang.Locale)
      })
    })
    const addTab = (langItem) => {
      nowTabsIndex.value = formData.value.NewsTranslation.length.toString()
      formData.value.NewsTranslation.push({
        Locale: langItem.Locale,
        Title: '',
        Content: '',
        ActionText: '',
        ImgPc: [],
        ImgMo: [],
        OpenUrlPc: '',
        OpenUrlMo: '',
        isSameUrl: true,
        MediaType: 'img',
        videoPc: '',
        videoMo: '',
        originMediaType: '',
      })
    }
    const removeTab = (newsTranslationIndex) => {
      formData.value.NewsTranslation.splice(newsTranslationIndex, 1)
      nowTabsIndex.value = '0'
    }

    // 表單驗證
    const ruleFormRef = ref(null)
    const errMsg = ref('')
    const checkMessageI18n = (rule, value, callback) => {
      errMsg.value = ''
      switch (rule.msgType) {
        case 'Title' :
          if (!value) errMsg.value = '請輸入標題'
          break
        case 'NewsTranslation' :
          if (!value.length) errMsg.value = '至少填入一種語系內容'
          break
      }

      if (errMsg.value) return callback(new Error(t(errMsg.value)))
      else callback()
    }
    const checkStartTime = (rule, value, callback) => {
      if (!value && !isclearStartTime.value) return callback(new Error('起始時間設定錯誤'))
      ruleFormRef.value.validateField('EndTime')
      callback()
    }
    const checkEndTime = (rule, value, callback) => {
      if (!value && !isclearEndTime.value) return callback(new Error(t('結束時間設定錯誤')))

      // 結束時間不可早於開始時間
      const startTimeObj = dayjs(formData.value.StartTime)
      const endTimeObj = dayjs(value)
      if (formData.value.StartTime !== '' && endTimeObj.isBefore(startTimeObj)) {
        return callback(new Error(t('結束時間不可早於開始時間')))
      }
      ruleFormRef.value.validateField('StartTime')
      callback()
    }
    const checkImgPc = (rule, value, callback) => {
      try {
        const index = parseInt(rule.fullField.split('.')[1])
        const itemData = formData.value.NewsTranslation[index]
        // 如果是MediaType = video，驗證videoPc
        if (itemData.MediaType === 'video') {
          if (itemData.videoPc.includes('https://www.youtube.com/watch?v=') || itemData.videoPc.includes('https://www.youtube.com/shorts/')) callback()
          callback(new Error(t('請填入youtube網址連結')))
          if (!itemData.videoPc && !itemData.ImgUrlPc) callback(new Error(t('請填入影片網址')))
        }
        // MediaType類型改變過的話，ImgPc不能為空：
        if (itemData.MediaType !== itemData.originMediaType && !value.length) {
          callback(new Error(t('請傳入電腦版檔案')))
        }
        // 『value有檔案』或『ImgUrlPc早已有檔案』兩這之間至少有一個
        if (!value.length && !itemData.ImgUrlPc) callback(new Error(t('請傳入電腦版檔案')))
        else callback()
      } catch (e) {
        callback(new Error(t('請傳入電腦版檔案')))
      }
    }
    const getImageTypeFromUrl = (url) => {
      const match = url.match(/\.([a-zA-Z0-9]+)(\?|$)/)
      const fileExtension = match ? match[1] : null
      return fileExtension.toLowerCase() === 'jpg' ? 'image/jpeg' : 'image/' + fileExtension.toLowerCase()
    }
    const checkImgMo = (rule, value, callback) => {
      try {
        const file = rule.fullField.split('.')
        const index = parseInt(file[1])
        const itemData = formData.value.NewsTranslation[index]
        // 如果是MediaType = video，驗證videoMo
        if (itemData.MediaType === 'video') {
          if (itemData.videoMo.includes('https://www.youtube.com/watch?v=') || itemData.videoMo.includes('https://www.youtube.com/shorts/')) callback()
          callback(new Error(t('請填入youtube網址連結')))
          if (!itemData.videoPc && !itemData.ImgUrlPc) callback(new Error(t('請填入影片網址')))
        }
        // MediaType類型改變過的話，ImgMo不能為空：
        if (itemData.MediaType !== itemData.originMediaType && !value.length) {
          callback(new Error(t('請傳入手機版檔案')))
        }
        // 如果是MediaType = img，驗證img副檔名是否與電腦版相同
        if (itemData.ImgPc.length || (itemData.ImgUrlPc && itemData.originMediaType === 'img')) {
          const expectedPC = itemData.ImgPc.length ? itemData.ImgPc[0].image.type : getImageTypeFromUrl(itemData.ImgUrlPc)
          if (value.length && value[0]?.image?.type !== expectedPC) {
            callback(new Error(t('圖片副檔名格式需與電腦版相同')))
          }
          if (!value.length && getImageTypeFromUrl(itemData.ImgUrlMo) !== expectedPC) {
            callback(new Error(t('圖片副檔名格式需與電腦版相同')))
          }
        }
        // 『value有檔案』或『ImgUrlMo早已有檔案』兩這之間至少有一個
        if (!value.length && !itemData.ImgUrlMo) callback(new Error(t('請傳入手機版檔案')))
        else callback()
      } catch (e) {
        callback(new Error(e))
      }
    }
    const rules = reactive({
      Title: [
        { required: true, validator: checkMessageI18n, msgType: 'Title', trigger: 'blur' },
      ],
      StartTime: [
        { required: true, validator: checkStartTime, trigger: 'change' },
      ],
      EndTime: [
        { required: true, validator: checkEndTime, trigger: 'change' },
      ],

      NewsTranslation: [
        { type: 'array', required: true, validator: checkMessageI18n, msgType: 'NewsTranslation', trigger: 'blur' },
      ],
      NewsTranslationArray: {
        Title: [
          { required: true, validator: checkMessageI18n, msgType: 'Title', trigger: 'blur' },
        ],
        ImgPc: [
          { required: true, validator: checkImgPc, trigger: 'change' },
        ],
        ImgMo: [
          { validator: checkImgMo, trigger: 'change' },
        ],
      },
    })

    const submitForm = async (formEl) => {
      if (isLoading.value || isSubmit.value) return
      if (!formEl) return
      await formEl.validate((valid, fields) => {
        if (valid) {
          const inputData = {
            ...formData.value,
            FrontSort: formData.value.isUnsorted ? null : formData.value.FrontSort,
            NewsType: formData.value.newsType,
            NewsTranslation: formData.value.NewsTranslation.map(({ isSameUrl, ...res }) => {
              return {
                ...res,
                OpenUrlMo: isSameUrl ? res.OpenUrlPc : res.OpenUrlMo,
              }
            }),
          }
          isSubmit.value = true
          if (showDialogData.value.type === 'add') props.setAdd(inputData)
          if (showDialogData.value.type === 'edit') props.setEdit(inputData)
        } else {
          Object.keys(fields).forEach(item => {
            useNotice({ type: 'error', message: fields[item][0].message })
          })
        }
      })
    }

    // 圖片
    const onPreview = ({ image, file, id, itemName }) => {
      formData.value.NewsTranslation[nowTabsIndex.value][itemName][0] = ({
        image,
        file,
      })
      // 手動觸發驗證
      ruleFormRef.value.validate(valid => {})
    }

    // 切換公告類型時觸發
    // 0 - 最新消息': 語系內的MediaType強制改為img並清空圖片內容
    const setMediaType = (value) => {
      if (value === 0) {
        formData.value.NewsTranslation.forEach(el => {
          if (el.MediaType !== 'img') {
            el.MediaType = 'img'
            el.ImgPc = []
            el.ImgMo = []
            el.videoPc = ''
            el.videoMo = ''
          }
          return el
        })
      }
    }
    // 直接改變該語系MediaType
    const changeMediaType = (value) => {
      const dataNewsTranslation = formData.value.NewsTranslation[nowTabsIndex.value]
      formData.value.NewsTranslation[nowTabsIndex.value] = {
        ...dataNewsTranslation,
        ImgPc: value === 'video' ? '' : [],
        ImgMo: value === 'video' ? '' : [],
        videoPc: dataNewsTranslation.originMediaType === 'video' ? dataNewsTranslation.ImgUrlPc : '',
        videoMo: dataNewsTranslation.originMediaType === 'video' ? dataNewsTranslation.ImgUrlMo : '',
      }
      // 手動觸發驗證
      ruleFormRef.value.validate(valid => {})
    }

    return {
      locale,
      isLoading,
      showDialogData,
      nowTabsIndex,
      btnLangList,
      formData,
      NEWS_TYPE,
      STATUS_ID,
      TYPE_LABEL,
      MEDIA_TYPE,
      newsTagList,
      isclearStartTime,
      isclearEndTime,
      tableData,
      newsOpenTypeList,
      newsTriggerTypeList,
      newsPageList,
      localeList,
      addTab,
      removeTab,
      setUrlMo,
      onPreview,
      setMediaType,
      changeMediaType,
      clearStartTime,
      clearEndTime,
      // 表單驗證
      ruleFormRef,
      rules,
      submitForm,
    }
  },
}
</script>
<style lang="scss" scoped>
:deep {
  .el-tabs__content {
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-top: 0;
  }

  .el-tabs__header {
    margin: 0;
  }

  .el-form-item {
    display: flex;

    .simulated {
      padding: 10px;
      border: 1px dotted #7d7d7d;
      border-radius: 5px;
    }

    .el-form-item__content {
      width: 100%;
    }

    .el-form-item__label {
      padding-top: .65em;
      line-height: 1.5em;
    }

    .pr-25 {
      padding-right: 25px;
    }

    .show_url {
      padding: 10px;
      background-color: #ecf0f6;
      border-radius: 10px;
      margin-bottom: 10px;
      line-height: 1.2em;
    }

    .video_tips {
      line-height: 1.5em;
      font-size: 12px;
      margin-bottom: 14px;
      color: #ef6d6d;

      span {
        color: #4d96d5;
      }
    }
  }

  .front_sort {
    .el-form-item__content > label {
      padding-right: 25px;
    }
  }
}

@media screen and (max-width: 650px) {
  :deep {
    .el-form-item {
      display: block;
    }

    .el-form-item__label {
      min-width: 100%;
      text-align: left;
    }
  }
}
</style>
