<template lang="pug">
el-button(@click="() => isOpen = true" size="small") {{$t('遊戲帳號')}}
el-dialog(v-if="isOpen" v-model="isOpen" :title="$t('遊戲帳號')")
  el-form(
    label-position="left" align="left" size="small" label-width="80px"
    v-loading="isLoading"
  )
    el-form-item(
      :label="$t(transferName(index))"
      v-for="(item, index) in gameAccountsData"
      :key="item+index"
    )
      CopyableButton(:modelValue="item")
</template>
<script>
import { ref, watch } from 'vue'
import CopyableButton from '@/components/CopyableButton'
import { getGameAccounts } from '@/api/member'
import { loadingCounter } from '@/utils/loading-counter'
import { GAME_PROVIDER_LIST } from '@/configs'

export default {
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
    const gameAccountsData = ref({})
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    watch(
      () => isOpen.value,
      (newValue) => {
        if (newValue) loadAccountDetail()
      },
    )

    const loadAccountDetail = async () => {
      isOpen.value = true
      const inputData = {
        MemberID: props.scope.row.MemberID,
      }
      loadingCountPlus()
      try {
        const res = await getGameAccounts(inputData)
        for (const item in res.Data) {
          gameAccountsData.value[item] = res.Data[item]
        }
      } catch (error) {
        gameAccountsData.value = {}
      } finally {
        loadingCountMinus()
      }
    }

    const transferName = (val) => {
      for (const item of GAME_PROVIDER_LIST) {
        if (item.key === val) return item.name
      }
      return val
    }

    return {
      isOpen,
      gameAccountsData,
      transferName,
      isLoading,
    }
  },
}
</script>
