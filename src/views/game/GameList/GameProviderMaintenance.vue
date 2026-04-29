<template lang="pug">
el-button(:loading="isLoading" @click="xslx" type="primary" size="small") {{$t('匯出報表')}}
span.tip.warning-text(v-if="isMaintenance") {{$t('遊戲商維護中')}}
el-button(:loading="isLoading" @click="handleChangeGameProviderMaintenance" type="primary" size="small") {{$t('遊戲商維護')}}
</template>
<script>
import { ElMessageBox } from 'element-plus'
import { loadingCounter } from '@/utils/loading-counter'
import i18n from '@/configs/locales'
import { GAME_PROVIDER_LIST } from '@/configs'
import { useNotice } from '@/utils/use-notice'

import {
  changeGameProviderMaintenance,
} from '@/api/game'
import { outputXlsx } from '@/utils/outputXlsx'

export default {
  emits: ['sucess'],

  props: {
    gameProviderID: {
      required: true,
      type: Number,
    },
    isMaintenance: {
      required: true,
      type: Boolean,
    },
    outputData: {
      type: Array,
      default: () => [],
    },
  },

  setup (props, context) {
    const { global: { t } } = i18n
    const { isLoading, loadingCountPlus, loadingCountMinus } = loadingCounter()

    // 單一遊戲維護
    const handleChangeGameProviderMaintenance = async () => {
      const inputData = {
        GameProviderID: props.gameProviderID,
        MaintenanceStatus: props.isMaintenance ? 0 : 1,
      }
      const gameProviderName = GAME_PROVIDER_LIST.find(item => item.id === props.gameProviderID)?.name ?? '-'
      try {
        loadingCountPlus()
        await ElMessageBox.confirm(
          t(props.isMaintenance ? '確認是否結束{GameProviderName}的維護？' : '確認是否進行{GameProviderName}的維護？', { GameProviderName: gameProviderName }),
          '',
          {
            confirmButtonText: t('確定'),
            cancelButtonText: t('取消'),
            type: 'warning',
          },
        )
        await changeGameProviderMaintenance(inputData)
        context.emit('sucess')
      } catch (error) {
        // DO NOTING
      } finally {
        loadingCountMinus()
      }
    }
    const xslx = () => {
      if (!props.outputData.length) return useNotice({ type: 'warning', message: t('查無資料'), allowDuplicate: true })
      const translatedTitles = {
        FrontSort: t('遊戲排序'),
        GameProvider: t('遊戲商'),
        GameID: t('遊戲ID'),
        GameName: t('遊戲名稱'),
        GameProviderGameID: t('遊戲商遊戲ID'),
        GameType: t('遊戲類型'),
        GoldStatus: t('遊戲狀態-金幣'),
        SilverStatus: t('遊戲狀態-銀幣'),
        isMaintenance: t('維護'),
      }
      const outputData = props.outputData.map(item => {
        const newData = {}
        Object.keys(translatedTitles).forEach(key => {
          if (key === 'GoldStatus' || key === 'SilverStatus' || key === 'isMaintenance') newData[translatedTitles[key]] = item[key] ? t('開啟') : t('關閉')
          else newData[translatedTitles[key]] = item[key]
        })
        return newData
      })

      outputXlsx(outputData, `${props.outputData[0]?.GameProvider ?? ''} - ${t('遊戲列表')}`)
    }
    return {
      isLoading,
      xslx,
      // fn
      handleChangeGameProviderMaintenance,
    }
  },
}
</script>
<style lang="scss">
@import '~/scss/variables.scss';

.tip {
  margin: 0 $main-padding/2;
}
</style>
;
