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
    // dateRange: [firstDayThisWeek, today],
    dateRange: ['2005-05-01', today],
    vehicle: null,
    vehicles: null,
    tripId: null,
    allTrips: [],
    trips: [], // filtered trips
    tripsLoading: true,
    tripsFailed: false,
    pointsLoading: true,
    pointsFailed: false,
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
    vehicles(state, val) { state.vehicles = val },
    tripId(state, val) { state.tripId = val },
    allTrips(state, val) { state.allTrips = val },
    trips(state, val) { state.trips = val },
    tripsLoading(state, val) { state.tripsLoading = val },
    tripsFailed(state, val) { state.tripsFailed = val },
    pointsLoading(state, val) { state.pointsLoading = val },
    pointsFailed(state, val) { state.pointsFailed = val },
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
          context.commit('tripsLoading', false)
          if (e.toString() !== 'Cancel') {
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
  },
  strict: config.isDevelopment
  // plugins: config.isDevelopment ? [createLogger()] : []
})
export default store
