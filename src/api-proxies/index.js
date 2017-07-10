const bodyParser = require('body-parser')
const axios = require('axios')
const config = require('../config.js')
const http = axios.create({
  baseURL: config.serverBaseUrl,
  // withCredentials: config.isCROS
})

module.exports = function (app) {
  app.use(bodyParser.json()) // for parsing application/json

  app.post('/proxy', function(req, res) {
    const data = req.body
    console.log(`api proxyies: ${data.method} ${data.url}`)
    http[data.method](data.url, data.data).then(({data}) => {
      console.log('request successfully')
      console.log(data)
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(data))
    }).catch(e => {
      console.log('request failed')
      console.log(e)
      res.send(`error: ${e.toString()}`)
    })
  })
}
