import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config.js'
import runtime from '../runtime.js'
import urls from './modules/urls.js'
import menu from './menu.js'
// import createLogger from '@/../node_modules/vuex/src/plugins/logger.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    urls
  },
  state: {
    settings: {
      map: 'baiduMap',
      lang: 'en',
    },
    baiduMapAK: '0WbyzDGMdtHjqr2rW4EZ1HGrKb2vdbpG',
    baiduMapServiceId: 139574,
    googleMapAK: 'AIzaSyD5L4t9qz0QOQBGK99Tsr7AQFlJvGZAHuU',
    authenticated: false,
    user: {},
    menu
  },
  mutations: {
    settings(state, val) {
      state.settings = val
      runtime.app.$i18n.locale = state.settings.lang
    },
    authenticated (state, to) {
      state.authenticated = to
    },
    user(state, data) {
      state.user = data
    }
  },
  strict: config.isDevelopment
  // plugins: config.isDevelopment ? [createLogger()] : []
})
export default store
