import Vue from 'vue'
import { format } from 'date-functions'
import { namedHttpGet } from '@/utils.js'
import runtime from '@/runtime.js'
window.Vue = Vue
export default {
  namespaced: true,
  state: {
    type: 'driver', // driver / vehicle
    drivers: [],
    driverInfos: [],
    driver: null,
    vehicles: [],
    vehicleInfos: [],
    vehicle: null,
    dateType: 'daily',
    date: format(new Date(), 'yyyy-MM-dd'), // day, month, year
  },
  mutations: {
    type(state, v) { state.type = v },
    drivers(state, v) { state.drivers = v },
    driverInfos(state, v) { state.driverInfos = v },
    driver(state, v) { state.driver = v },
    vehicles(state, v) { state.vehicles = v },
    vehicleInfos(state, v) { state.vehicleInfos = v },
    vehicle(state, v) { state.vehicle = v },
    dateType(state, v) { state.dateType = v },
    date(state, v) { state.date = v },
  },
  getters: {
    driverObj: state => {
      const obj0 = state.drivers.find(item => item.driver_id === state.driver)
      if (obj0) {
        const obj = Object.assign({}, obj0)
        obj.travelledDistance = state.driverInfos
        .filter(v => v.driver_id === obj.driver_id)
        .reduce((a, b) => a + b.drv_distance, 0) / 1000
        return obj
      } else {
        return {}
      }
    },
    vehicleObj: state => {
      const obj0 = state.vehicles.find(item => item.vrm_id === state.vehicle)
      if (obj0) {
        const obj = Object.assign({}, obj0)
        obj.travelledDistance = state.vehicleInfos
        .filter(v => v.vrm_id === obj.vrm_id)
        .reduce((a, b) => a + b.drv_distance, 0) / 1000
        return obj
      } else {
        return {}
      }
    },
  },
  actions: {
    getDrivers(context) {
      const {rootState} = context
      namedHttpGet('driverVehicleProfile_driver', 'dao/driver')
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
    getDriverInfos(context) {
      const {rootState} = context
      namedHttpGet('driverVehicleProfile_avg_warning_drv_name', 'dao/avg_warning_drv_name')
      .then(({data}) => {
            // filter out drv_distance === 0
        context.commit('driverInfos', data.JSON.filter(item => item.company_id === rootState.user.company_id))
      }).catch((e) => {
        if (e.toString() !== 'Cancel') {
          Vue.alert(runtime.app.$t('errorRefreshOrFeedback'))
          throw e
        }
      })
    },
    getVehicles(context) {
      const {rootState} = context
      namedHttpGet('driverVehicleProfile_veh_reg_mark', 'dao/veh_reg_mark')
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
    getVehicleInfos(context) {
      const {rootState} = context
      namedHttpGet('driverVehicleProfile_avg_warning_vrm_co', 'dao/avg_warning_vrm_co')
      .then(({data}) => {
            // filter out drv_distance === 0
        context.commit('vehicleInfos', data.JSON.filter(item => item.company_id === rootState.user.company_id))
      }).catch((e) => {
        if (e.toString() !== 'Cancel') {
          Vue.alert(runtime.app.$t('errorRefreshOrFeedback'))
          throw e
        }
      })
    },
  }
}
