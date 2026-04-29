<template>
  <el-card
    class="search-block"
    shadow="never"
  >
    <template v-if="!isEdit">
      <!-- {{ isEdit }}
      {{ formData }} -->
      <div>
        <el-descriptions
          title=""
          direction="vertical"
          :column="2"
          border
        >
          <el-descriptions-item :label="$t('金幣贈點上限')">
            {{ formData.MaxGoldPerTransaction || '' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('銀幣贈點上限')">
            {{ formData.MaxSilverPerTransaction || '' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('金幣贈點下限')">
            {{ formData.MinGoldPerTransaction || '' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('銀幣贈點下限')">
            {{ formData.MinSilverPerTransaction || '' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('交易等待時間(秒)')">
            {{ formData.TransactionModeDuration || '' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('交易密碼送出次數上限')">
            {{ formData.TransactionModeMaxPasswordAttempts || '' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="edit">
          <el-button type="primary" @click="setIsEdit">{{ $t('編輯') }}</el-button>
        </div>
      </div>
    </template>

    <template v-else>
      <el-form id="rewardPoint-form" ref="formRef" :model="formData" :rules="rules">
        <el-descriptions
          title=""
          direction="vertical"
          :column="2"
          border
        >
          <el-descriptions-item :label="$t('金幣贈點上限')">
            <el-form-item prop="MaxGoldPerTransaction">
              <el-input v-model="formData.MaxGoldPerTransaction"></el-input>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('銀幣贈點上限')">
            <el-form-item prop="MaxSilverPerTransaction">
              <el-input v-model="formData.MaxSilverPerTransaction"></el-input>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('金幣贈點下限')">
            <el-form-item prop="MinGoldPerTransaction">
              <el-input v-model="formData.MinGoldPerTransaction"></el-input>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('銀幣贈點下限')">
            <el-form-item prop="MinSilverPerTransaction">
              <el-input v-model="formData.MinSilverPerTransaction"></el-input>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('交易等待時間(秒)')">
            <el-form-item prop="TransactionModeDuration">
              <el-input v-model="formData.TransactionModeDuration"></el-input>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('交易密碼送出次數上限')">
            <el-form-item prop="TransactionModeMaxPasswordAttempts">
              <el-input v-model="formData.TransactionModeMaxPasswordAttempts"></el-input>
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>

        <div class="submit">
          <el-button @click="setIsEdit">{{ $t('取消') }}</el-button>
          <el-button type="primary" @click="submit">{{ $t('確定') }}</el-button>
        </div>
      </el-form>
    </template>
  </el-card>
</template>

<script>
import { onMounted, ref, reactive } from 'vue'
import { getRewardPoint, updateRewardPoint } from '@/api/platform'
import { useNotice } from '@/utils/use-notice'

export default {
name: 'rewardpoint-list',
setup () {
  const isEdit = ref(false)

  const formData = reactive({})

  const formRef = ref(null)

  const checkValue = (rule, value, callback) => {
    if (String(value).length) {
      if (isNaN(Number(value))) {
        const errorMsg = '請輸入數字'
        callback(errorMsg)
      } else {
        callback()
      }
    } else {
      const errorMsg = '欄位必填'
      callback(errorMsg)
    }
  }

  const rules = reactive({
    MaxGoldPerTransaction: { required: true, validator: checkValue, trigger: 'change' },
    MaxSilverPerTransaction: { required: true, validator: checkValue, trigger: 'change' },
    MinGoldPerTransaction: { required: true, validator: checkValue, trigger: 'change' },
    MinSilverPerTransaction: { required: true, validator: checkValue, trigger: 'change' },
    TransactionModeDuration: { required: true, validator: checkValue, trigger: 'change' },
    TransactionModeMaxPasswordAttempts: { required: true, validator: checkValue, trigger: 'change' },
  })

  const setIsEdit = () => {
    isEdit.value = !isEdit.value
  }

  const submit = () => {
    console.log('submit')
    formRef.value.validate((valid, fields) => {
      if (valid) {
        updateRewardPoint(formData).then((res) => {
          console.log('res :>>>', res)
          if (res.Status.Code === '0') {
            useNotice({ type: 'success', message: '修改成功' })
          } else {
            useNotice({ type: 'error', message: '發生錯誤，請稍後再試，或洽客服人員' })
          }
          setIsEdit()
        })
      }
    })
  }

  onMounted(() => {
    // console.log('onMounted')
    try {
      getRewardPoint().then((res) => {
        // console.log('res :>>>', res)
        // formData = { ...res.Data }
        Object.entries(res.Data).forEach(element => {
          formData[element[0]] = element[1]
        })
        console.log(formData)
      }).catch((error) => {
        console.log('error :>>>', error)
      })
    } catch (error) {
      console.log(error)
    }
  })

  return {
    isEdit,
    formData,
    setIsEdit,
    submit,
    formRef,
    rules,
  }
},
}
</script>

<style lang="scss" scoped>
#rewardPoint-form {
  .el-form-item {
    margin-bottom: 0;
  }
}

.edit {
  display: grid;
  margin-top: 10px;

  .el-button {
    justify-self: end;
  }
}

.submit {
  margin-top: 10px;
  margin-left: auto;
  width: fit-content;
}
</style>
