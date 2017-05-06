import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config.js'
import urls from './modules/urls.js'
import menu from './menu.js'
import * as dateFunctions from 'date-functions'
// import createLogger from '@/../node_modules/vuex/src/plugins/logger.js'

Vue.use(Vuex)

const dateFormat = 'yyyy-MM-dd'
const now = new Date()
const today = dateFunctions.format(now, dateFormat)
now.setDate(now.getDate() - now.getDay())
const firstDayThisWeek = dateFunctions.format(now, dateFormat)

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
    initialPoint: { lat: 39.914271, lng: 116.405706 },
    dateRange: [firstDayThisWeek, today],
    vehicle: null,
    tripId: null,
    trips: [],
    tripsLoading: true,
    pointsLoading: true,
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
    },
    dateRange(state, val) { state.dateRange = val },
    vehicle(state, val) { state.vehicle = val },
    tripId(state, val) { state.tripId = val },
    trips(state, val) { state.trips = val },
    tripsLoading(state, val) { state.tripsLoading = val },
    pointsLoading(state, val) { state.pointsLoading = val },
  },
  strict: config.isDevelopment
  // plugins: config.isDevelopment ? [createLogger()] : []
})
export default store
