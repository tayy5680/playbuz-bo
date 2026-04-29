
export default {
  namespaced: true,

  state: {
    localeList: [],
  },

  mutations: {
    SET_LOCALE_LIST (state, payload) {
      state.localeList = payload
    },
  },

  actions: {
    setLocaleList ({ commit }, param) {
      commit('SET_LOCALE_LIST', param)
    },
  },
}
