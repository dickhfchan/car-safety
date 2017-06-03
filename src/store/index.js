import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config.js'
import urls from './modules/urls.js'
import menu from './menu.js'
import * as dateFunctions from 'date-functions'
import { newDate } from '@/utils.js'
import runtime from '@/runtime.js'
// import createLogger from '@/../node_modules/vuex/src/plugins/logger.js'

Vue.use(Vuex)

const dateFormat = 'yyyy-MM-dd'
const today = dateFunctions.format(new Date(), dateFormat)
const tenDaysBefore = dateFunctions.format(dateFunctions.subDays(new Date(), 10), dateFormat)
const fourteenDaysBefore = dateFunctions.format(dateFunctions.subDays(new Date(), 14), dateFormat)
let storagedDefaultVehicles = window.localStorage.getItem('vehicles')
storagedDefaultVehicles = storagedDefaultVehicles == null ? [{vrm_id: 45, vrm_mark_code: 'RC6558'}] : JSON.parse(storagedDefaultVehicles)
const storagedMap = window.localStorage.getItem('map')
let storagedUser = window.localStorage.getItem('user')
if (storagedUser) {
  storagedUser = JSON.parse(storagedUser)
  if (new Date().getTime() - (storagedUser.lastTime || 0) > 3600000) {
    storagedUser = null
  }
}

const lang = (storagedUser && (window.localStorage.getItem('lang_' + storagedUser.company_id) || storagedUser.lang)) || window.localStorage.getItem('lang') || 'en'

// store local data
const local = {}

const store = new Vuex.Store({
  modules: {
    urls
  },
  state: {
    map: storagedMap || 'googleMap',
    lang: lang,
    baiduMapAK: '0WbyzDGMdtHjqr2rW4EZ1HGrKb2vdbpG',
    baiduMapServiceId: 139574,
    googleMapAK: 'AIzaSyCRJiQRpULDNnsylPwEgDu8XhgLN6kmu8I',
    authenticated: storagedUser != null,
    user: storagedUser || {},
    userCompany: null,
    companyCode: window.localStorage.getItem('companyCode'),
    menu,
    companies: [],
    dateRange: [tenDaysBefore, today],
    vehicle: storagedDefaultVehicles[0].vrm_id,
    vehicles: storagedDefaultVehicles,
    tripId: null,
    allTrips: [],
    trips: [], // filtered trips
    tripsLoading: true,
    tripsFailed: false,
    points: [],
    pointsLoading: false,
    pointsFailed: false,
    pointsExpired: true, // points belongs to tripId, a new request start, the points expire
    dateRangeInD2: [fourteenDaysBefore, today],
    report2DriverId: null,
    report2Drivers: [],
    dateRangeInReport2: [fourteenDaysBefore, today],
    alertInformationWarningType: 'all',
    builtAt: window.builtAt,
  },
  mutations: {
    map(state, val) {
      window.localStorage.setItem('map', val)
      state.map = val
    },
    lang(state, val) {
      if (state.lang !== val) {
        state.lang = val
        window.location.reload()
      }
    },
    authenticated (state, to) {
      state.authenticated = to
    },
    user(state, data) {
      state.user = data
    },
    userCompany(state, val) { state.userCompany = val },
    companyCode(state, val) { state.companyCode = val; window.localStorage.setItem('companyCode', val) },
    companies(state, val) { state.companies = val },
    dateRange(state, val) { state.dateRange = val },
    vehicle(state, val) {
      window.localStorage.setItem('vehicles', JSON.stringify([state.vehicles.find(v => v.vrm_id === val)]))
      state.vehicle = val
    },
    vehicles(state, val) { state.vehicles = val },
    tripId(state, val) { state.tripId = val },
    allTrips(state, val) { state.allTrips = val },
    trips(state, val) { state.trips = val },
    tripsLoading(state, val) { state.tripsLoading = val },
    tripsFailed(state, val) { state.tripsFailed = val },
    points(state, val) { state.points = val },
    pointsLoading(state, val) { state.pointsLoading = val },
    pointsFailed(state, val) { state.pointsFailed = val },
    pointsExpired(state, val) { state.pointsExpired = val },
    dateRangeInD2(state, val) { state.dateRangeInD2 = val },
    report2DriverId(state, val) { state.report2DriverId = val },
    report2Drivers(state, val) { state.report2Drivers = val },
    dateRangeInReport2(state, val) { state.dateRangeInReport2 = val },
    alertInformationWarningType(state, val) { state.alertInformationWarningType = val },
  },
  actions: {
    getCompanies({commit}) {
      const http = Vue.http
      http.get('dao/company').then(({data}) => {
        commit('companies', data.JSON)
      })
    },
    updateUserCompany({state, commit}) {
      if (state.user && state.companies.length > 0) {
        commit('userCompany', state.companies.find(v => v.company_id === state.user.company_id))
      }
    },
    logout({commit, state}) {
      commit('authenticated', false)
      commit('user', {})
      window.localStorage.removeItem('user')
      runtime.app.$router.push({name: 'login', params: {companyCode: state.companyCode}})
    },
    getTrips (context) {
      const vehicle = context.state.vehicle
      if (vehicle != null) {
        // cancel prev request
        if (local.cancelPrevgetTripsRequest) {
          local.cancelPrevgetTripsRequest()
          local.cancelPrevgetTripsRequest = null
        }
        const CancelToken = Vue.Axios.CancelToken
        const http = Vue.http
        context.commit('tripsLoading', true)
        context.commit('tripsFailed', false)
        // get
        http.get('dao/veh_trip/' + vehicle, {
          cancelToken: new CancelToken((c) => { local.cancelPrevgetTripsRequest = c })
        }).then(({data}) => {
          // filter out drv_distance === 0
          context.commit('allTrips', data.JSON.filter(item => item.drv_distance > 0))
          context.dispatch('getTripsInDateRange').then((trips) => {
            context.dispatch('updateTrips', trips)
          })
          context.commit('tripsLoading', false)
        }).catch((e) => {
          if (e.toString() !== 'Cancel') {
            context.commit('tripsLoading', false)
            context.commit('tripsFailed', true)
            Vue.alert(runtime.app.$t('getTripsFailed'))
            throw e
          }
        })
      }
    },
    getTripsInDateRange({state}) {
      const start = newDate(`${state.dateRange[0]} 00:00:00`).getTime()
      const end = newDate(`${state.dateRange[1]} 23:59:59`).getTime()
      const trips = state.allTrips
      // filter by date range
      .filter(v => start <= v.start_time && v.start_time <= end)
      // sort by start_time desc
      .sort((a, b) => b.start_time - a.start_time)
      return trips
    },
    // update trips and auto set value of trip id
    updateTrips({state, commit}, trips) {
      commit('trips', trips)
      if (state.trips.length === 0) {
        commit('tripId', null)
      }
      // !!disabled trip dont exists in trips list
      // else if (state.tripId == null || !state.trips.find(v => v.veh_trip_id === state.tripId)) {
      //   commit('tripId', state.trips[0].veh_trip_id)
      // }
    },
    // get map points
    getPoints({state, commit}) {
      const tripId = state.tripId
      if (tripId != null) {
        // cancel prev request
        if (local.cancelPrevgetPointsRequest) {
          local.cancelPrevgetPointsRequest()
          local.cancelPrevgetPointsRequest = null
        }
        const CancelToken = Vue.Axios.CancelToken
        const http = Vue.http
        commit('pointsLoading', true)
        commit('pointsFailed', false)
        commit('pointsExpired', true)
        // http
        const url = (state.map === 'googleMap' ? 'google/' : 'baidu/') + tripId
        http.get(url, {
          cancelToken: new CancelToken((c) => { local.cancelPrevgetPointsRequest = c })
        }).then(({data}) => {
          // convert result point format and store
          if (state.map === 'googleMap') {
            commit('points', data.JSON.map(v => {
              return { lat: v.location.latitude, lng: v.location.longitude }
            }))
          } else {
            commit('points', data.JSON.map(v => {
              return { lat: v[0], lng: v[1] }
            }))
          }
          commit('pointsLoading', false)
          commit('pointsExpired', false)
        }).catch((e) => {
          if (e.toString() !== 'Cancel') {
            commit('pointsLoading', false)
            commit('pointsFailed', true)
            Vue.alert(runtime.app.$t('getPointsFailed'))
            throw e
          }
        })
      }
    },
  },
  strict: config.isDevelopment
  // plugins: config.isDevelopment ? [createLogger()] : []
})
export default store
