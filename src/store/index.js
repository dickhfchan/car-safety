import Vue from 'vue'
import Vuex from 'vuex'
import config from '../config.js'
import urls from './modules/urls.js'
import menu from './menu.js'
import * as dateFunctions from 'date-functions'
// import createLogger from '@/../node_modules/vuex/src/plugins/logger.js'

Vue.use(Vuex)

const dateFormat = 'yyyy-MM-dd'
const tempDate = new Date()
const today = dateFunctions.format(tempDate, dateFormat)
const tenDaysBefore = dateFunctions.format(dateFunctions.subDays(tempDate, 10), dateFormat)
let storagedDefaultVehicles = window.localStorage.getItem('defaultVehicles')
storagedDefaultVehicles = storagedDefaultVehicles == null ? [{vrm_id: 45, vrm_mark_code: 'RC6558'}] : JSON.parse(storagedDefaultVehicles)

// store local data
const local = {}

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
    vehicle(state, val) {
      window.localStorage.setItem('defaultVehicles', JSON.stringify([state.vehicles.find(v => v.vrm_id === val)]))
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
  },
  actions: {
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
          context.commit('allTrips', data.JSON)
          context.dispatch('getTripsInDateRange').then((trips) => {
            context.dispatch('updateTrips', trips)
          })
          context.commit('tripsLoading', false)
        }).catch((e) => {
          if (e.toString() !== 'Cancel') {
            context.commit('tripsLoading', false)
            context.commit('tripsFailed', true)
            window.alert('get trips failed')
            throw e
          }
        })
      }
    },
    getTripsInDateRange({state}) {
      const start = new Date(`${state.dateRange[0]} 00:00:00`).getTime()
      const end = new Date(`${state.dateRange[1]} 23:59:59`).getTime()
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
      // trip dont exists in trips list
      else if (state.tripId == null || !state.trips.find(v => v.veh_trip_id === state.tripId)) {
        commit('tripId', state.trips[0].veh_trip_id)
      }
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
        http.get('google/' + tripId, {
          cancelToken: new CancelToken((c) => { local.cancelPrevgetPointsRequest = c })
        }).then(({data}) => {
          // convert result point format and store
          commit('points', data.JSON.map(v => {
            return { lat: v.location.latitude, lng: v.location.longitude }
          }))
          commit('pointsLoading', false)
          commit('pointsExpired', false)
        }).catch((e) => {
          if (e.toString() !== 'Cancel') {
            commit('pointsLoading', false)
            commit('pointsFailed', true)
            window.alert('get points failed')
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
