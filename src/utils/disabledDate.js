import dayjs from 'dayjs'

export const SDisabledDate = (date, searchDate, days) => {
  if (searchDate) {
    if (afterDay(date, searchDate)) return true
  } else if (afterDay(date)) return true
  if (beforeDay(days, date)) return true
  return false
}
export const EDisabledDate = (date, searchDate, days) => {
  if (searchDate) {
    if (beforeDay(days, date, searchDate)) return true
  } else if (beforeDay(days, date)) return true
  if (afterDay(date)) return true
  return false
}
// 判斷date是否在searchDate之後 searchDate預設為今天
const afterDay = (date, searchDate = dayjs()) => {
  return dayjs(date).isAfter(searchDate)
}
// 判斷date是否在searchDate之前 searchDate預設為兩個月
const beforeDay = (days, date, searchDate = dayjs().subtract(days, 'days')) => {
  return dayjs(date).isBefore(searchDate)
}
