<template lang="pug">
el-button(
  size="small"
  @click="() => isOpen = true"
) {{$t('發票明細')}}
el-dialog(v-if="isOpen" v-model="isOpen" :title="$t('發票明細')" :width="500")
  el-form(v-loading="isLoading" label-position="left" align="left" size="small" label-width="80px")
    el-form-item(v-if="scope.row.Invoice" :label="$t('發票號碼')" label-width="auto")
      CopyableButton(:modelValue="scope.row.Invoice")
    el-form-item(v-if="form.OrderDate && form.OrderDate.length" :label="$t('開立時間')" label-width="auto")
      el-date-picker(
        type="datetime"
        :modelValue="form.OrderDate"
        disabled
      )

    template(v-if="form.BuyerIdentifier")
      el-form-item(:label="$t('抬頭')" label-width="auto")
        CopyableButton(:modelValue="form.BuyerName")
      el-form-item(:label="$t('統編')" label-width="auto")
        CopyableButton(:modelValue="form.BuyerIdentifier")

    template(v-if="form.CarrierType")
      el-form-item(:label="$t('載具類型')" label-width="auto")
        el-select(v-model="form.CarrierType" disabled)
          template(v-for="option of CARRIER_TYPE_LIST" :key="option.value")
            el-option(:label="$t(option.name)" :value="option.value")
      el-form-item(:label="$t('載具編號')" label-width="auto")
        CopyableButton(v-if="form.CarrierId1" :modelValue="form.CarrierId1.toString()")
    el-form-item(label="Email" label-width="auto")
      CopyableButton(:modelValue="form.BuyerEmailAddress")
    template(v-if="form.DonateMark")
      el-form-item(:label="$t('捐贈碼')" label-width="auto")
        CopyableButton(:modelValue="form.NPOBAN")
</template>

<script>
import { defineComponent, ref, watch } from 'vue'
import { loadingCounter } from '@/utils/loading-counter'
import CopyableButton from '@/components/CopyableButton'
import { getInvoiceDetail } from '@/api/report'

const CARRIER_TYPE_LIST = [
  { value: '3J0002', name: '手機條碼' },
  { value: 'CQ0001', name: '自然人憑證' },
]

export default defineComponent({
  components: {
    CopyableButton,
  },

  props: {
    scope: {
      required: true,
      type: Object,
    },
  },

  setup (props) {
    const isOpen = ref(false)
    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) doGetInvoiceDetail()
        else initForm()
      },
    )
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    // 表單資料相關
    const form = ref({})
    const initForm = () => {
      form.value = {
        OrderDate: undefined,
        BuyerName: undefined,
        BuyerIdentifier: undefined,
        BuyerEmailAddress: undefined,
        DonateMark: undefined,
        CarrierType: undefined,
        CarrierId1: undefined,
      }
    }
    initForm()

    const doGetInvoiceDetail = async () => {
      loadingCountPlus()
      try {
        if (props.scope.row.Invoice) {
          form.value = (await getInvoiceDetail({
            transId: props.scope.row.TransID,
          })).Data
        } else {
          form.value = props.scope.row.InvoiceData
        }
      } catch {
        // TODO
      } finally {
        loadingCountMinus()
      }
    }

    return {
      // data
      CARRIER_TYPE_LIST,
      isOpen,
      isLoading,
      form,
    }
  },
})
</script>
