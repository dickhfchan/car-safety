// dependency flex-layout-attribute is imported in App.vue
// css
import './datatable.scss'
// directive
import Vue from 'vue'
import drag from '../../../node_modules/vuetiful/src/directives/v-drag.js'
// components
import Datatable from '../../../node_modules/vuetiful/src/components/datatable/datatable.vue'
import DatatableColumn from '../../../node_modules/vuetiful/src/components/datatable/datatable-column.vue'
Vue.directive('drag', drag)
export { Datatable, DatatableColumn }
