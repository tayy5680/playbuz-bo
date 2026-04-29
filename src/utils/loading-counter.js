import { ref, computed } from 'vue'

export function loadingCounter () {
  const loadingCount = ref(0)
  return {
    isLoading: computed(() => loadingCount.value !== 0),
    loadingCountPlus () { ++loadingCount.value },
    loadingCountMinus () { --loadingCount.value },
  }
}
