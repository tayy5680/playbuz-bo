import { useRouter, useRoute } from 'vue-router'
import { pausableWatch } from '@vueuse/core'

export const useStoreForm = (keysToRef) => {
  const router = useRouter()
  const route = useRoute()
  const originRouteName = route.name

  // 呼叫時 將搜尋列從 router query 同步回來
  const restoreForm = () => {
    Object.keys(keysToRef).forEach(key => {
      if (router.currentRoute.value.query[key]) {
        try {
          keysToRef[key].value = JSON.parse(decodeURIComponent(router.currentRoute.value.query[key]))
        } catch (error) {
          console.error(error)
        }
      }
    })
  }

  // 在搜尋成功時 將搜尋列同步到 router query
  const storeForm = () => {
    if (route.name !== originRouteName) return
    const query = { ...router.currentRoute.value.query }
    Object.keys(keysToRef).forEach(key => {
      query[key] = encodeURIComponent(JSON.stringify(keysToRef[key].value))
    })

    // 避免觸發 restoreForm
    pause()
    const params = {
      path: router.currentRoute.value.fullPath,
      query,
    }
    // 進入新頁面若沒資料才取代 避免瀏覽器上一頁無動作
    const action = router.currentRoute.value.query?.searchData ? 'push' : 'replace'
    return router?.[action](params).finally(resume)
  }

  const { pause, resume } = pausableWatch(
    () => router.currentRoute.value.query,
    () => restoreForm(),
    { immediate: true },
  )

  return storeForm
}
