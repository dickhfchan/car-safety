import config from '@/config.js'

export default {
  state: {
    client: {
      base: config.clientBaseUrl,
      login: config.clientLoginUrl,
    },
    server: {
      base: config.serverBaseUrl,
    }
  },
  mutations: {
  }
}
