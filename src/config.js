const config = {
  isDevelopment: false,
  isCROS: false,
  // follow will be enabled when isCROS
  CROS: {
    CSRFTokenRequired: true,
    updateCSRFTokenIn: 5 * 60 * 1000 // ms
  },
  //
  clientBaseUrl: '/',
  serverBaseUrl: 'http://54.255.227.246:8080/api/',
  clientLoginUrl: null,
}
switch (process.env.NODE_ENV) {
  case 'production':
    Object.assign(config, {
    })
    break
  case 'development':
    Object.assign(config, {
      isDevelopment: true,
    })
    break
}
export default config
