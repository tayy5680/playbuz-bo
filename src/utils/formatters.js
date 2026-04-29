import dayjs from 'dayjs'
import {
  ENABLE_LIST,
} from '@/configs'

export function createFormatter (list, key, value) {
  const map = list.reduce((acc, item) => {
    return Object.assign(acc, { [item[key]]: item[value] })
  }, {})
  return (row, col, value) => map[value] ?? value
}

export function timeFormatter (val, { format = 'YYYY-MM-DD HH:mm:ss', to = '' } = {}) {
  const timeString = dayjs(val).format(format)
  if (['', 'Invalid Date', 'Invalid date'].includes(timeString)) return to
  return timeString
}

export function enableFormatter (val, to = '-') {
  const target = ENABLE_LIST.find(({ value }) => value === val)
  return target ? target.name : val
}

export function pointFormatter (row, col, val) {
  if (val === undefined) return ''
  const str = val.toString().split('.')
  str[0] = str[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  // 取小數點第二位
  if (str.length > 1) str[1] = str[1].substr(0, 2)
  return str.join('.')
}
