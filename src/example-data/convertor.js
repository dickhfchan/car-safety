const fs = require('fs')
const path = require('path')

const str = fs.readFileSync(path.resolve(__dirname, './vrm_trip_detail_25670.csv')).toString()
            .replace(/"(20\d\d-\d\d-\d\d \d\d:\d\d:\d\d)"/g, '$1')
const lines = str.split('\n')
const firstLine = lines.shift()
const fileds = firstLine.split(',')
const result = lines.map(line => {
  var lineArr = line.split(',')
  const row = {}
  for (var i = 0; i < fileds.length; i++) {
    row[fileds[i]] = lineArr[i] === 'NULL' ? null : lineArr[i]
  }
  return row
})
fs.writeFile(path.resolve(__dirname, './points.js'), '/* eslint-diabled */\nexport default ' + JSON.stringify(result, null, 2), function(err) {
  if (err) {
    return console.error(err)
  }
})
