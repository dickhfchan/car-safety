import Vue from 'vue'
import { namedHttpGet } from '@/utils.js'
import runtime from '@/runtime.js'
window.Vue = Vue
export default {
  namespaced: true,
  state: {
    type: 'driver', // driver / vehicle
    drivers: [],
    driver: null,
    vehicles: [],
    vehicle: null,
    dateType: 'daily',
  },
  mutations: {
    type(state, v) { state.type = v },
    drivers(state, v) { state.drivers = v },
    driver(state, v) { state.driver = v },
    vehicles(state, v) { state.vehicles = v },
    vehicle(state, v) { state.vehicle = v },
    dateType(state, v) { state.dateType = v },
  },
  actions: {
    getDrivers(context) {
      const {rootState} = context
      namedHttpGet('driverVehicleProfileGetDrivers', 'dao/driver')
      .then(({data}) => {
            // filter out drv_distance === 0
        context.commit('drivers', data.JSON.filter(item => item.company_id === rootState.user.company_id))
      }).catch((e) => {
        if (e.toString() !== 'Cancel') {
          Vue.alert(runtime.app.$t('errorRefreshOrFeedback'))
          throw e
        }
      })
    },
    getVehicles(context) {
      const {rootState} = context
      namedHttpGet('driverVehicleProfileGetVehicles', 'dao/veh_reg_mark')
      .then(({data}) => {
            // filter out drv_distance === 0
        context.commit('vehicles', data.JSON.filter(item => item.company_id === rootState.user.company_id))
      }).catch((e) => {
        if (e.toString() !== 'Cancel') {
          Vue.alert(runtime.app.$t('errorRefreshOrFeedback'))
          throw e
        }
      })
    },
  }
}
