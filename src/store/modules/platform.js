
export default {
  namespaced: true,

  state: {
    newsOpenTypeList: [],
    newsTriggerTypeList: [],
    newsPageList: [],
    newsTagList: [],
  },

  mutations: {
    SET_NEWS_OPEN_TYPE (state, payload) {
      state.newsOpenTypeList = payload
    },
    SET_NEWS_TRIGGER_TYPE (state, payload) {
      state.newsTriggerTypeList = payload
    },
    SET_NEWS_PAGE (state, payload) {
      state.newsPageList = payload
    },
    SET_NEWS_TAG (state, payload) {
      state.newsTagList = payload
    },
  },

  actions: {
    setNewsOpenType ({ commit }, param) {
      commit('SET_NEWS_OPEN_TYPE', param)
    },

    setNewsTriggerType ({ commit }, param) {
      commit('SET_NEWS_TRIGGER_TYPE', param)
    },

    setNewsPage ({ commit }, param) {
      commit('SET_NEWS_PAGE', param)
    },

    setNewsTag ({ commit }, param) {
      commit('SET_NEWS_TAG', param)
    },
  },
}
