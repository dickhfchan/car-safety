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
  //
  { path: '*', redirect: { name: 'dashboard' } }
]
