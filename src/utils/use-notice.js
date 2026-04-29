import { ElMessage } from 'element-plus'
import i18n from '@/configs/locales'

/**
 * @param {Object} optionObj 傳入的物件
 * @param {string} optionObj.message 顯示的訊息內容
 * @param {string} optionObj.type 訊息種類 info: 一般, success: 成功, error: 失敗
 * @param {string} optionObj.allowDuplicate 允許重複出現
 * @param {string} optionObj.isI18n 是否要進行翻譯
 */
const { global: { t } } = i18n
export const useNotice = ({ message = '', type = 'info', allowDuplicate = false, isI18n = true }) => {
  const defaultOption = {
    type,
    message: isI18n ? t(message) : message,
  }

  // 尋找當下是否有重複的內容存在 若沒有才顯示
  const targetClass = `el-message el-message--${type}`
  const targetHTMLCollection = document.getElementsByClassName(targetClass)
  let isDuplicated = false
  for (const item of targetHTMLCollection) {
    if (item.innerText === message) isDuplicated = true
  }
  if (allowDuplicate || !isDuplicated) return ElMessage(defaultOption)
}
