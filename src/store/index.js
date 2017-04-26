import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config.js'
import urls from './modules/urls.js'
import menu from './menu.js'
// import createLogger from '@/../node_modules/vuex/src/plugins/logger.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    urls
  },
  state: {
    brand: config.brand,
    authenticated: false,
    user: {},
    menu
  },
  mutations: {
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
