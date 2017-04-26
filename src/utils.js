export function initAxios(axios, Vue, store, config) {
  const axiosInstance = axios.create({
    baseURL: store.state.urls.server.base,
    withCredentials: config.isCROS
  })
  Vue.Axios = axios
  Vue.http = Vue.prototype.$http = axiosInstance
  axiosInstance.interceptors.response.use((response) => {
    // Do something with response data
    return response
  }, (error) => {
    // Do something with response error
    if (error.response && error.response.status === 401) {
      store.commit('authenticated', false)
    }
    return Promise.reject(error)
  })
}

export function initVDV(validator, rules, messages, Vue) {
  Vue.use(validator)
  Object.assign(Vue.validator.rules, rules)
  Object.assign(Vue.validator.messages, messages)
}

export function initRouter(Router, Vue, store, config, routes) {
  Vue.use(Router)
  const router = new Router({
    mode: 'history',
    base: config.clientBaseUrl,
    routes
  })
  return router
}

export function axiosNamedPost(name, url, query) {
  if (!this._axiosNamedPostStore) {
    this._axiosNamedPostStore = {}
  }
  // cancel prev request
  if (this._axiosNamedPostStore[name]) {
    this._axiosNamedPostStore[name]()
    delete this._axiosNamedPostStore[name]
  }
  // CancelToken
  const Axios = this.$root.constructor.Axios
  const CancelToken = Axios.CancelToken
  return this.$http.post(url, query, {
    cancelToken: new CancelToken((c) => {
      this._axiosNamedPostStore[name] = c
    })
  })
}
