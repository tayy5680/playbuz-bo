<template>
  <div class="announcement_img">
    <!-- 顯示模式 -->
    <div v-if="!itemType">
      <div class="fixed" v-if="data.MediaType === 'img'">
        <el-image class="image" :src="url" fit="cover" @click="setImgDialog(true, url)">
          <template #error>
            <div class="image_slot">
              <el-icon><Close /></el-icon>
            </div>
          </template>
        </el-image>
        <span>{{ url ? url : '-' }}</span>
      </div>
      <div class="fixed" v-else>
        <div v-if="data.MediaType === 'lottie'" class="image" ref="lottieElement"></div>
        {{ url ? url : '-' }}
      </div>
    </div>
    <!-- 編輯模式 -->
    <div v-else class="edit">
      <div v-show="url && data.originMediaType === data.MediaType" class="edit_img_preview">
        <el-image v-if="data.originMediaType === 'img'" class="image" :src="url" fit="cover" @click="setImgDialog(true, url)">
          <template #error>
            <div class="image_slot">
              <el-icon><Close /></el-icon>
            </div>
          </template>
        </el-image>
        <div v-if="data.originMediaType === 'lottie'" class="image" ref="previewLottieElement"></div>
      </div>
      <div class="edit_file_upload" >
        <el-upload
          ref="uploadRef"
          action="#"
          :before-upload="onPreview"
          drag
        >
          <!-- 已選擇檔案 -->
          <div v-if="file">
            <el-image v-if="data.MediaType === 'img'" :src="file" fit="cover" />
            <div v-else class="upload_fileName"> <el-icon><Document /></el-icon>{{ fileName }}</div>
          </div>
          <!-- 未選擇檔案 -->
          <div v-else class="update__label">
            <el-image class="image" fit="cover">
              <template #error>
                <div class="image_slot">
                  <el-icon v-if="data.MediaType === 'img'"><Picture /></el-icon>
                  <el-icon v-else><Document /></el-icon>
                </div>
              </template>
            </el-image>
            <span >{{ data.MediaType === 'img' ? $t('上傳新圖片') : $t('上傳新Lottie') }}</span>
          </div>
          <template #tip>
            <div class="tips">
              {{ $t('請上傳{type}格式', {type: UPLOAD_FILE_EXTENSION[data.MediaType].join('、').replaceAll('image/','')})}}
              <br>
              {{ $t('且尺寸為 {size} 的圖片', { size: itemName === 'ImgPc' ? '856x500' : '856x1520' })}}
            </div>
          </template>
        </el-upload>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, inject, computed, watch, onMounted } from 'vue'
import { Picture, Close, Document } from '@element-plus/icons'
import { useNotice } from '@/utils/use-notice'
import { useI18n } from 'vue-i18n'
import lottie from 'lottie-web'

export default {
  props: {
    itemName: {
      type: String,
      default: () => '',
    },
    itemType: {
      type: String,
      default: () => '',
    },
    url: {
      type: String,
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    Picture,
    Close,
    Document,
  },
  emit: ['update'],
  setup (props, { emit }) {
    const { t } = useI18n()
    const lottieElement = ref(null)
    const previewLottieElement = ref(null)
    const setImgDialog = inject('setImgDialog')

    const UPLOAD_FILE_EXTENSION = {
      img: ['image/jpeg', 'image/png', 'image/gif'],
      lottie: ['application/json'],
    }
    const fileSize = ref(5)
    const file = ref('')
    const fileName = ref('')
    const itemObject = computed(() => props?.item)
    watch(itemObject, () => handleFetch())
    const handleFetch = () => {
      file.value = itemObject.value?.image || ''
    }
    const mediaType = computed(() => props.data?.MediaType)
    watch(mediaType, () => {
      file.value = ''
    })

    handleFetch()
    const onPreview = (rawFile) => {
      if (!UPLOAD_FILE_EXTENSION[props.data.MediaType].includes(rawFile.type)) {
        useNotice({ type: 'warning', message: `${t('格式錯誤')} ${UPLOAD_FILE_EXTENSION[props.data.MediaType].join(', ')}`, allowDuplicate: true, isI18n: false })
        return false
      } else if (fileSize.value <= (rawFile.size / 1024 / 1024)) {
        useNotice({ type: 'warning', message: t('尺寸須小於{size}MB', { size: fileSize }), allowDuplicate: true, isI18n: false })
        return false
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        file.value = e.target.result
        fileName.value = rawFile.name
        emit('update', { image: rawFile, file: file.value, itemName: props.itemName })
      }
      reader.readAsDataURL(rawFile)
      return false
    }

    onMounted(() => {
      if (props.data.MediaType !== 'lottie' && props.url) return
      // 一般顯示上
      if (!props.itemType) {
        lottie.loadAnimation({
          container: lottieElement.value,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: props.url,
        })
      } else if (props.data?.originMediaType === 'lottie') {
        // 編輯模式
        lottie.loadAnimation({
          container: previewLottieElement.value,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: props.url,
        })
      }
    })
    return {
      file,
      lottieElement,
      previewLottieElement,
      UPLOAD_FILE_EXTENSION,
      setImgDialog,
      fileName,
      onPreview,
    }
  },
}
</script>
<style lang="scss" scoped>
.announcement_img {
  .fixed {
    display: flex;
    align-items: center;
    margin: 5px 0 10px 0;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 10px;
    line-height: 1em;
  }

  :deep {
    .el-icon {
      width: 20px;
      height: 20px;
      line-height: 20px;
    }

    .el-upload-dragger {
      width: 100%;
      height: 80px;
    }

    .update__label {
      display: flex;
      align-items: center;
      padding: 10px;
    }

    .el-upload {
      width: 100%;
    }
  }

  .image {
    margin-right: 15px;
    width: 60px;
    min-width: 60px;
    height: 60px;
    border-radius: 10px;
    cursor: pointer;
  }

  .image_slot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: #ecf0f6;
  }

  .edit {
    display: flex;
    align-items: flex-start;
    padding: 0;
    border: 0;

    .edit_img_preview .image {
      width: 80px;
      height: 80px;
    }

    .edit_file_upload {
      flex-grow: 1;

      .tips {
        line-height: 1.5em;
      }

      .show_url {
        padding: 10px;
        background-color: #ecf0f6;
        border-radius: 10px;
        margin-bottom: 10px;
      }

      .upload_fileName {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 80px;
      }
    }
  }
}
</style>
