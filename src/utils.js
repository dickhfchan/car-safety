export function initAxios(axios, Vue, store, config) {
  const axiosInstance = axios.create({
    baseURL: store.state.urls.server.base,
    // withCredentials: config.isCROS
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

export function initVDV(VueDataValidator, store, Vue) {
  Vue.use(VueDataValidator.validator)
  Object.assign(Vue.validator.rules, VueDataValidator.rules)
  Object.assign(Vue.validator.messages, store.state.lang === 'en' ? VueDataValidator.enMessages : VueDataValidator.zhCNMessages)
  Vue.validator.validClass = 'valid'
  Vue.validator.invalidClass = 'md-input-invalid'
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

export function initVueMaterial(VueMaterial, Vue) {
  Vue.use(VueMaterial)
  Vue.material.registerTheme({
    default: {
      primary: {
        color: 'light-green',
        hue: 700
      },
      accent: 'red'
    },
    blue: {
      primary: 'blue',
      accent: 'pink'
    },
    orange: {
      primary: 'orange',
      accent: 'purple'
    },
    green: {
      primary: 'green',
      accent: 'white'
    }
  })
}

export function initI18n(VueI18n, messages, store, Vue) {
  // reload when other page change lang
  window.addEventListener('storage', (e) => {
    if (e.key === 'lang') {
      window.location.reload()
    }
  })
  Vue.use(VueI18n)
  return new VueI18n({
    locale: store.state.lang, // set locale
    messages, // set locale messages
  })
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
