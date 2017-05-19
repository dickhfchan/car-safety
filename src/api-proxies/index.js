const bodyParser = require('body-parser')
const axios = require('axios')
const http = axios.create({
  baseURL: 'http://54.255.227.246:8080/api/',
  // withCredentials: config.isCROS
})

module.exports = function (app) {
  app.use(bodyParser.json()) // for parsing application/json

  app.post('/proxy', function(req, res) {
    const data = req.body
    http[data.method](data.url, data.data).then(({data}) => {
      res.setHeader('Content-Type', 'application/json')
      res.send(JSON.stringify(data))
    }).catch(e => {
      res.send('error')
    })
  })
}
