import Home from '../views/Home.vue'

export default [
  { path: '/home', name: 'home', component: Home },
  { path: '/users', name: 'users', component: (resolve) => require(['../views/Users.vue'], resolve) },
  { path: '/gauge', name: 'gauge', component: (resolve) => require(['../views/Gauge.vue'], resolve) },
  { path: '/plotly', name: 'plotly', component: (resolve) => require(['../views/Plotly.vue'], resolve) },
  { path: '/map', name: 'map', component: (resolve) => require(['../views/Map.vue'], resolve) },
  //
  { path: '*', redirect: { name: 'home' } }
]
