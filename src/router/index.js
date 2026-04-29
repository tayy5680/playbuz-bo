import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
// import store from '@/store'

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

const checkAuth = async (to, from, next) => {
  // avoid router was imported first
  const store = require('@/store')

  // 登入頁 不做任何檢查
  if (to.name?.match('SignIn')) {
    next()
    return
  }

  if (!store.default.state.accessToken) {
    next({ name: 'SignIn' })
    return
  }

  next()
}

router.beforeEach((to, from, next) => {
  checkAuth(to, from, next)
})

export default router
