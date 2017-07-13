import Vue from 'vue'
import { namedHttpGet } from '@/utils.js'
import runtime from '@/runtime.js'

export default {
  namespaced: true,
  state: {
    type: 'driver', // driver / vehicle
    drivers: [],
    driverInfos: [],
    allDriverRanks: [],
    driver: null,
    vehicles: [],
    vehicleInfos: [],
    allVehicleRanks: [],
    vehicle: null,
    dateType: 'daily',
  },
  mutations: {
    type(state, v) { state.type = v },
    drivers(state, v) { state.drivers = v },
    driverInfos(state, v) { state.driverInfos = v },
    allDriverRanks(state, v) { state.allDriverRanks = v },
    driver(state, v) { state.driver = v },
    vehicles(state, v) { state.vehicles = v },
    vehicleInfos(state, v) { state.vehicleInfos = v },
    allVehicleRanks(state, v) { state.allVehicleRanks = v },
    vehicle(state, v) { state.vehicle = v },
    dateType(state, v) { state.dateType = v },
  },
  getters: {
    driverObj: state => state.drivers.find(item => item.driver_id === state.driver),
    vehicleObj: state => state.vehicles.find(item => item.vrm_id === state.vehicle),
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
    // deprecated
    // getDriverInfos(context) {},
    getAllDriverRanks(context) {
      namedHttpGet('driverVehicleProfile_warning_rank_drv', 'dao/warning_rank_drv')
      .then(({data}) => {
            // filter out drv_distance === 0
        context.commit('allDriverRanks', data.JSON.sort((a, b) => a.start_date - b.start_date))
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
    // deprecated
    // getVehicleInfos(context) {},
    getAllVehicleRanks(context) {
      namedHttpGet('driverVehicleProfile_warning_rank_vrm', 'dao/warning_rank_vrm')
      .then(({data}) => {
            // filter out drv_distance === 0
        context.commit('allVehicleRanks', data.JSON.sort((a, b) => a.start_date - b.start_date))
      }).catch((e) => {
        if (e.toString() !== 'Cancel') {
          Vue.alert(runtime.app.$t('errorRefreshOrFeedback'))
          throw e
        }
      })
    },
  }
}
