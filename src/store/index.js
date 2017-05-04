import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config.js'
import urls from './modules/urls.js'
import menu from './menu.js'
// import createLogger from '@/../node_modules/vuex/src/plugins/logger.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    urls
  },
  state: {
    map: 'baiduMap',
    lang: window.localStorage.getItem('lang') || 'en',
    baiduMapAK: '0WbyzDGMdtHjqr2rW4EZ1HGrKb2vdbpG',
    baiduMapServiceId: 139574,
    googleMapAK: 'AIzaSyCRJiQRpULDNnsylPwEgDu8XhgLN6kmu8I',
    authenticated: true,
    user: {},
    menu,
  },
  mutations: {
    map(state, val) { state.map = val },
    lang(state, val) {
      if (state.lang !== val) {
        state.lang = val
        window.localStorage.setItem('lang', val)
        window.location.reload()
      }
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
