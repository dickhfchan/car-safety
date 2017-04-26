import Home from '../views/Home.vue'

export default [
  { path: '/home', name: 'home', component: Home },
  { path: '/users', name: 'users', component: (resolve) => require(['../views/Users.vue'], resolve) },
  { path: '/gauge', name: 'gauge', component: (resolve) => require(['../views/Gauge.vue'], resolve) },
  { path: '/plotly', name: 'plotly', component: (resolve) => require(['../views/Plotly.vue'], resolve) },
  { path: '/baidu-map', name: 'baidu-map', component: (resolve) => require(['../views/BaiduMap.vue'], resolve) },
  //
  { path: '*', redirect: { name: 'home' } }
]
