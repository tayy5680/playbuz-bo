import { createI18n } from 'vue-i18n'

import en from '@/locales/en-US.json'
import tw from '@/locales/zh-TW.json'

const messages = {
  'en-US': en,
  'zh-TW': tw,
}

export default createI18n({
  locale: 'en-US',
  fallbackLocale: 'zh-TW',
  messages,
})
