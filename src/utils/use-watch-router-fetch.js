import { useRouter } from 'vue-router'
import { watch } from 'vue'

export const useWatchRouterFetch = (fetch) => {
  const router = useRouter()

  watch(
    () => router.currentRoute.value.path,
    (newValue, oldValue) => {
      if (oldValue !== undefined && newValue !== oldValue) {
        stop()
      }
    },
  )

  const stop = watch(
    () => router.currentRoute.value.query,
    () => fetch(),
    { immediate: true },
  )

  return stop
}
