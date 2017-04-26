import Dashboard from '../views/Dashboard.vue'

export default [
  { path: '/dashboard', name: 'dashboard', component: Dashboard },
  // { path: '/about', name: 'about', component: (resolve) => require(['../views/About.vue'], resolve) },
  //
  { path: '*', redirect: { name: 'dashboard' } }
]
