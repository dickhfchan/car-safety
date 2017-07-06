import Dashboard from '../views/Dashboard.vue'

export default [
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  { path: '/users', name: 'users', component: (resolve) => require(['../views/Users.vue'], resolve) },
  { path: '/gauge', name: 'gauge', component: (resolve) => require(['../views/Gauge.vue'], resolve) },
  { path: '/plotly', name: 'plotly', component: (resolve) => require(['../views/Plotly.vue'], resolve) },
  { path: '/map', name: 'map', component: (resolve) => require(['../views/Map.vue'], resolve) },
  { path: '/analysis', name: 'analysis', component: (resolve) => require(['../views/Analysis.vue'], resolve) },
  { path: '/analysis-group', name: 'analysisGroup', component: (resolve) => require(['../views/AnalysisGroup.vue'], resolve) },
  { path: '/datatables', name: 'datatables', component: (resolve) => require(['../views/Datatables.vue'], resolve) },
  { path: '/d1', name: 'd1', component: (resolve) => require(['../views/D1.vue'], resolve) },
  { path: '/d2', name: 'd2', component: (resolve) => require(['../views/D2.vue'], resolve) },
  { path: '/report2', name: 'report2', component: (resolve) => require(['../views/Report2.vue'], resolve) },
  { path: '/real-time', name: 'realTime', component: (resolve) => require(['../views/RealTime.vue'], resolve) },
  { path: '/login/:companyCode', name: 'login', component: (resolve) => require(['../views/Login.vue'], resolve) },
  { path: '/unauthorized', name: 'unauthorized', component: (resolve) => require(['../views/Unauthorized.vue'], resolve) },
  { path: '/fencing', name: 'fencing', component: (resolve) => require(['../views/Fencing.vue'], resolve) },
  { path: '/driver-vehicle-profile', name: 'driverVehicleProfile', component: (resolve) => require(['../views/DriverVehicleProfile.vue'], resolve) },
  //
  { path: '*', redirect: { name: 'dashboard' } }
]
