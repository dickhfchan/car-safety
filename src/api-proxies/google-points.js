const axios = require('axios')

module.exports = function (app) {
  app.get('/api/382', function(req, res) {
    axios.get('http://localhost:8080/datepicker').then(({data}) => {
      req.send(data)
    })
  })
}
