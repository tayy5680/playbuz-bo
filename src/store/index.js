import createPersistedState from 'vuex-persistedstate'
import { createStore } from 'vuex'
import {
  signIn,
  reissueToken,
  signOut,
  getMenu,
} from '@/api/token'
import { getAdvertiserData } from '@/api/advertiser'
import platform from './modules/platform'
import token from './modules/token'

export default createStore({
  plugins: [createPersistedState()],
  modules: {
    platform,
    token,
  },
  state: {
    // 以下登出不清(登入畫面使用)
    account: '',
    isRemember: false,
    // 以下登出需清除
    isMenuOpen: false,
    isTrial: false,
    accessToken: '',
    refreshToken: '',
    memberID: undefined,
    roles: [],
    menu: [],
    advertisersData: {
      AdID: undefined,
      SecondaryAdCount: 0,
      AdCount: 0,
      MemberCount: 0,
      SecondaryMemberCount: 0,
    },
    lang: 'zh-Tw',
  },

  mutations: {
    SET_DEFAULT (state) {
      state.isMenuOpen = false
      state.isTrial = false
      state.accessToken = ''
      state.refreshToken = ''
      state.memberID = undefined
      state.roles = []
      state.menu = []
      state.advertisersData = {
        AdID: undefined,
        SecondaryAdCount: 0,
        AdCount: 0,
        MemberCount: 0,
        SecondaryMemberCount: 0,
      }
    },
    SET_ACCOUNT (state, payload) {
      state.account = payload
    },
    SET_IS_REMEMBER (state, payload) {
      state.isRemember = payload
    },
    SET_IS_MENU_OPEN (state, payload) {
      state.isMenuOpen = payload
    },
    SET_IS_TRIAL (state, payload) {
      state.isTrial = payload
    },
    SET_ACCESS_TOKEN (state, payload) {
      state.accessToken = payload
    },
    SET_REFRESH_TOKEN (state, payload) {
      state.refreshToken = payload
    },
    SET_MEMBER_ID (state, payload) {
      state.memberID = payload
    },
    SET_ROLES (state, payload) {
      state.roles = payload
    },
    SET_MENU (state, payload) {
      state.menu = payload
    },
    SET_ADVERTISER_DATA (state, payload) {
      state.advertisersData.AdID = payload.AdID
      state.advertisersData.AdCount = payload.AdCount
      state.advertisersData.SecondaryAdCount = payload.SecondaryAdCount
      state.advertisersData.MemberCount = payload.MemberCount
      state.advertisersData.SecondaryMemberCount = payload.SecondaryMemberCount
    },
    SET_LANG (state, payload) {
      state.lang = payload
    },
  },
  actions: {
    async signIn ({ commit }, param) {
      const data = {
        ...param,
      }
      const res = await signIn(data)
      commit('SET_ACCOUNT', param.account)
      commit('SET_IS_REMEMBER', param.isRemember)
      commit('SET_ACCESS_TOKEN', res.access_token)
      commit('SET_REFRESH_TOKEN', res.refresh_token)
      commit('SET_MEMBER_ID', res.MemberID)
      commit('SET_ROLES', res.Roles)
      if (res?.Roles.find(target => target === 'Trial')) commit('SET_IS_TRIAL', true)
    },
    async reissueToken ({ state, commit }) {
      const data = {
        refreshToken: state.refreshToken,
      }
      const res = await reissueToken(data)
      commit('SET_ACCESS_TOKEN', res.access_token)
    },
    async signOut ({ state, commit }) {
      const data = {
        refreshToken: state.refreshToken,
      }
      await signOut(data)
      commit('SET_DEFAULT')
    },
    async getMenu ({ commit }) {
      const res = await getMenu()
      const result = []
      // 組出可用選單

      res.Data.forEach(
        item => {
            const children = []
            item.SubList.forEach(
              subItem => {
                children.push({
                  code: subItem.Code,
                  name: subItem.Name,
                  path: subItem.Path,
                })
              },
            )
            if (children.length > 0) {
              result.push({
                code: item.Code,
                name: item.Name,
                icon: item.Icon,
                path: item.Path,
                children: children,
              })
            }
        },
      )
      commit('SET_MENU', result)
    },
    async getAdvertiserInfo ({ commit }) {
      const res = await getAdvertiserData()
      const result = {
        MemberAccount: res.Data.MemberAccount,
        AdID: res.Data.AdID,
        SecondaryAdCount: res.Data.SecondaryAdCount,
        AdCount: res.Data.AdCount,
        MemberCount: res.Data.MemberCount,
        SecondaryMemberCount: res.Data.SecondaryMemberCount,
      }
      commit('SET_ADVERTISER_DATA', result)
    },
    setLanguage ({ commit }, param) {
      commit('SET_LANG', param)
      localStorage.setItem('language', param)
    },
  },
})
