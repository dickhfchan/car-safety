// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// packages
import 'babel-polyfill'
import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios'
// vue-data-validator
import VDVValidaotr from '../node_modules/vue-data-validator/dist/validator.esm.js'
import VDVRules from '../node_modules/vue-data-validator/dist/rules.esm.js'
import VDVEnMessages from '../node_modules/vue-data-validator/dist/messages/en.esm.js'
// files
import config from '@/config.js'
import App from './App'
import store from './store/index.js'
import routes from './routes/index.js'
import { initAxios, initVDV, initRouter, beforeStart } from '@/utils.js'
//
Vue.config.productionTip = config.isDevelopment

// axios
initAxios(axios, Vue, store, config)

// VDV
initVDV(VDVValidaotr, VDVRules, VDVEnMessages, Vue)

// router
const router = initRouter(Router, Vue, store, config, routes)

// start
/* eslint-disable no-new */
beforeStart(Vue, store, config).then(() => {
  Vue.http.post(store.state.urls.server.routes)
  .then(({data}) => store.commit('serverPath', data))
  .then(() => {
    new Vue({
      el: '#app',
      store,
      router,
      template: '<App/>',
      components: { App }
    })
  })
}).catch((error) => {
  if (error.response && error.response.status === 401) {
    window.location.href = store.state.urls.client.base + store.state.urls.client.login
  } else {
    throw error
  }
})
