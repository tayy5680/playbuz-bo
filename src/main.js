import 'normalize.css/normalize.css'

import ElementPlus from 'element-plus'
// theme color: #2B2F3A
import '../src/assets/custom-theme/index.css'
import '~/scss/global.scss'

import { createApp, h } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from '@/configs/locales'
import { useI18n } from 'vue-i18n'

createApp({
  render: () => h(App),
  setup () {
    const { locale } = useI18n()
    locale.value = localStorage.getItem('language') ?? process.env.VUE_APP_LANGUAGE ?? 'zh-TW'
    if (!localStorage.getItem('language')) localStorage.setItem('language', locale.value)
  },
})
  .use(ElementPlus)
  .use(store)
  .use(router)
  .use(i18n)
  .mount('#app')
