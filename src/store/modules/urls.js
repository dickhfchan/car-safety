import config from '@/config.js'
import {isset} from 'helper-js'

export default {
  state: {
    client: {
      base: config.clientBaseUrl,
      login: config.clientLoginUrl,
      user: clientUrls('user'),
      post: clientUrls('post'),
      tag: clientUrls('tag'),
      page: clientUrls('page'),
      file: clientUrls('file'),
      image: clientUrls('image'),
      menu: clientUrls('menu'),
      advertisement: clientUrls('advertisement'),
      slider: clientUrls('slider'),
      friendLink: clientUrls('friendLink'),
      config: clientUrls('config')
    },
    server: {
      base: config.serverBaseUrl,
      CSRFToken: 'CSRFToken',
      routes: 'routes', // get routes from server
      auth: {
        /* eslint-disable */
        captcha:    'auth.captcha',
        captchaRequired: 'auth.captchaRequired',
        user:       'auth.user',
        logout:     'auth.logout',
        login:      'auth.login',
        /* eslint-enable */
      }
    }
  },
  mutations: {
    serverPath(state, urls) {
      for (const key in state.server) {
        if (!isset(urls[key])) {
          urls[key] = state.server[key]
        }
      }
      state.server = urls
    }
  }
}

function clientUrls(prefix, except = []) {
  const result = {}
  const defaultKeys = ['all', 'trashed', 'add', 'edit']
  defaultKeys.filter(item => !except.includes(item)).forEach(item => { result[item] = '/' + prefix + '/' + item })
  return result
}
