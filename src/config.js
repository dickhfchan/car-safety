const config = {
  isDevelopment: false,
  isCROS: false,
  // follow will be enabled when isCROS
  CROS: {
    CSRFTokenRequired: true,
    updateCSRFTokenIn: 5 * 60 * 1000 // ms
  },
  //
  clientBaseUrl: null,
  serverBaseUrl: null,
  clientLoginUrl: null,
}
switch (process.env.NODE_ENV) {
  case 'production':
    Object.assign(config, {
      isCROS: false,
      clientBaseUrl: '/',
      serverBaseUrl: 'http://xxx.xx/',
      clientLoginUrl: 'login'
    })
    break
  case 'development':
    Object.assign(config, {
      isDevelopment: true,
      isCROS: true,
      clientBaseUrl: '/',
      serverBaseUrl: 'http://xxx.xx/',
      clientLoginUrl: 'login.html'
    })
    break
}
export default config
