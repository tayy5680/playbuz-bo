import { computed } from 'vue'

export function testIsMobile () {
  const agent = navigator.userAgent
  let result = false

  // iOS
  if (/iPhone|iPad|iPod/.test(agent)) {
    result = true
  // Android
  } else if (/Android/.test(agent)) {
    result = true
  // Windows
  } else if (/Windows/.test(agent)) {
  // Macintosh
  } else if (/Macintosh/.test(agent)) {
  // Linux
  } else if (/Linux/.test(agent)) {
  }

  return result
}

export function testIsiOS () {
  const agent = navigator.userAgent
  let result = false
  if (/iPhone|iPad|iPod/.test(agent)) result = true
  return result
}

export const defaultTime = computed(() => {
  return [
    new Date(2000, 1, 1, 0, 0, 0, 0),
    new Date(2000, 1, 1, 23, 59, 59, 999),
  ]
})

export function deepCopy (value) {
  return _deepCopy(value, new WeakMap())
}
function _deepCopy (value, cache) {
  const representingType = Object.prototype.toString.call(value)
  if (representingType !== '[object Object]' && representingType !== '[object Array]') return value

  if (cache.has(value)) return cache.get(value)

  const clone = representingType === '[object Object]' ? {} : []
  Object.setPrototypeOf(clone, Object.getPrototypeOf(value))
  cache.set(value, clone)

  Object.keys(value).forEach(key => {
    clone[key] = _deepCopy(value[key], cache)
  })

  return clone
}
