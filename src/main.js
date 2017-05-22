// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// packages
// import 'babel-polyfill'
import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'
import VueMaterial from 'vue-material'
import VueI18n from 'vue-i18n'
// vue-data-validator
import * as VueDataValidator from 'vue-data-validator'
// components
import FullscreenButton from './components/FullscreenButton.vue'
// files
import config from '@/config.js'
import runtime from '@/runtime.js'
import App from './App'
import store from './store/index.js'
import routes from './routes/index.js'
import lang from './lang/index.js'
import { initAxios, initVDV, initRouter, initVueMaterial, initI18n } from '@/utils.js'
//
Vue.config.productionTip = config.isDevelopment
Vue.config.debug = config.isDevelopment
Vue.config.devtools = config.isDevelopment
// axios
initAxios(axios, Vue, store, config)

// VueMaterial
initVueMaterial(VueMaterial, Vue)

// i18n
const i18n = initI18n(VueI18n, lang, store, Vue)

// VDV
initVDV(VueDataValidator, store, Vue)

// router
const router = initRouter(Router, Vue, store, config, routes)

// register custom component
Vue.component('FullscreenButton', FullscreenButton)

// start
/* eslint-disable no-new */
const app = new Vue({
  el: '#app',
  store,
  router,
  i18n,
  template: '<App/>',
  components: { App }
})
runtime.app = app

// storage user
window.onbeforeunload = function () {
  if (store.state.authenticated && store.state.user) {
    const user = Object.assign({}, store.state.user)
    user.lastTime = new Date().getTime()
    window.localStorage.setItem('user', JSON.stringify(user))
  }
}
