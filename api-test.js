const axios = require('axios')
const http = axios.create({
  baseURL: 'http://54.255.227.246:8080/api/',
  // withCredentials: config.isCROS
})

http.delete('/dao/company', {data:{
  'company_id': '5',
  'company_code': 'APL',
  'company_name': 'Apple',
  'company_key': 'VVVV',
  'create_ts': 1495021630,
  'timezone': '+8:00',
  'status': 'A',
  'version': 0
}}).then(({data}) => {
  console.log(data)
}).catch(e => {
  throw e
})

// module.exports = function (app) {
//   app.use(bodyParser.json()) // for parsing application/json
//   app.post('/proxy', function(req, res) {
//     const data = req.body
//     http[data.method](data.url, data.data, {
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     }).then((response) => {
//       res.setHeader('Content-Type', 'application/json')
//       res.send(JSON.stringify(response.data))
//     }).catch(e => {
//       res.send('error')
//       throw e
//     })
//   })
// }
