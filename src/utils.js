import { titleCase, windowLoaded, unset } from 'helper-js'
import Vue from 'vue'

export const dateTimeFields = ['start_time', 'end_time', 'time', 'start_date', 'end_date', 'date',
  'create_ts', 'update_ts', 'last_loc_update_ts', 'apps_ts', 'last_access_ts',
  'active_end_date', 'active_start_date', 'last_access_ts', 'last_loc_update_ts', 'last_login_ts']

export function initAxios(axios, Vue, store, config) {
  const axiosInstance = axios.create({
    baseURL: store.state.urls.server.base,
    timeout: 20000, // 20 seconds
    // withCredentials: config.isCROS
  })
  Vue.Axios = axios
  Vue.http = Vue.prototype.$http = axiosInstance
  axiosInstance.interceptors.response.use((response) => {
    // Do something with response data
    // convert timestamp to 13
    let dataJSON
    try {
      dataJSON = response.data.JSON
    } catch (e) {
      dataJSON = null
    }
    if (dataJSON) {
      dataJSON.forEach(row => {
        dateTimeFields.forEach(fld => {
          if (row[fld]) {
            const str = row[fld] + ''
            if (str.length === 10) {
              row[fld] = parseInt(str + '000')
            }
          }
        })
      })
    }
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
  // router.beforeEach((to, from, next) => {
  //   if (store.state.authenticated) {
  //     next()
  //   } else {
  //     if (to.name === 'unauthorized' || (to.name === 'login' && to.params.companyCode)) {
  //       next()
  //     } else {
  //       next({name: 'unauthorized'})
  //     }
  //   }
  // })
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
  // this is disabled, because it has bug in ie 11
  // reload when other page change lang
  // window.addEventListener('storage', (e) => {
  //   if (e.key === 'lang') {
  //     window.location.reload()
  //   }
  // })
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

// use proxy in developing
export function axiosAutoProxy(http, url, method, data) {
  if (method === 'delete') {
    data = { data: data }
  }
  return http[method](url, data)
  // if (config.isDevelopment) {
  //   return http.post('http://' + window.location.host + '/proxy', {
  //     url,
  //     method,
  //     data
  //   })
  // } else {
  //   return http[method](url, data)
  // }
}

export function initColumns(vm, columns) {
  // auto generate column display name
  for (const col of columns) {
    if (col.visible == null) {
      vm.$set(col, 'visible', true)
    }
    if (!col.text) {
      vm.$set(col, 'text', titleCase(col.name))
    }
    if (!col.width) {
      const len = col.text.length
      vm.$set(col, 'width', `${len > 3 ? (100 + (len - 6) * 5) : '60'}px`)
    }
  }
}

export function initRows(vm, rows, columns) {
  for (const row of rows) {
    if (row.visible == null) {
      vm.$set(row, 'visible', true)
    }
    for (const col of columns) {
      if (col.valueProcessor) {
        row[col.name] = col.valueProcessor({value: row[col.name], column: col, row, rows})
      }
    }
  }
}

export function getRowData(row, cols) {
  const item = {}
  cols.forEach(col => {
    item[col.name] = row[col.name]
  })
  return item
}
export function beforeSave(row, cols) {
  dateTimeFields.forEach(fld => {
    if (row[fld]) {
      row[fld] = newDate(row[fld]).getTime() / 1000
    }
  })
  cols.forEach(col => {
    if (row.hasOwnProperty(col.name) && !col.primaryKey && row[col.name] == null) {
      row[col.name] = ''
    }
  })
  return row
}

export function sortRows(event, rows, columns) {
  const sorted = rows.sort((a, b) => a[event.name] - b[event.name])
  if (event.type === 'desc') {
    sorted.reverse()
  }
  return sorted
}

export function generateExcel(JSONData, FileName, ShowLabel) {
    // 先转化json
  var arrData = typeof JSONData !== 'object' ? JSON.parse(JSONData) : JSONData
  var excel = '<table>'
    // 生成表头
  var row = '<tr>'
  for (let i = 0; i < ShowLabel.length; i++) {
    row += '<td>' + ShowLabel[i] + '</td>'
  }
  excel += row + '</tr>'
    // 循环生成表身
  for (let i = 0; i < arrData.length; i++) {
    row = '<tr>'
    for (var j in arrData[i]) {
//                    var name = arrData[i][index].name === "." ? "" : arrData[i][index].name;
      var td = arrData[i][j]
      row += '<td>' + td + '</td>'
    }
    excel += row + '</tr>'
  }
  excel += '</table>'
  var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
        "xmlns:x='urn:schemas-microsoft-com:office:excel' xmlns='http://www.w3.org/TR/REC-html40'>"
  excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">'
  excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-excel'
  excelFile += '; charset=UTF-8">'
  excelFile += '<head>'
  excelFile += '<!--[if gte mso 9]>'
  excelFile += '<xml>'
  excelFile += '<x:ExcelWorkbook>'
  excelFile += '<x:ExcelWorksheets>'
  excelFile += '<x:ExcelWorksheet>'
  excelFile += '<x:Name>'
  excelFile += 'sheet'
  excelFile += '</x:Name>'
  excelFile += '<x:WorksheetOptions>'
  excelFile += '<x:DisplayGridlines/>'
  excelFile += '</x:WorksheetOptions>'
  excelFile += '</x:ExcelWorksheet>'
  excelFile += '</x:ExcelWorksheets>'
  excelFile += '</x:ExcelWorkbook>'
  excelFile += '</xml>'
  excelFile += '<![endif]-->'
  excelFile += '</head>'
  excelFile += '<body>'
  excelFile += excel
  excelFile += '</body>'
  excelFile += '</html>'
  var uri = 'data:application/vnd.ms-excel;charset=utf-8,' + encodeURIComponent(excelFile)
  var link = document.createElement('a')
  link.href = uri
  link.style = 'visibility:hidden'
  link.download = FileName + '.xls'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// about map

export function loadGoogleMap(ak) {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google)
  }
  const fun = loadGoogleMap
  return windowLoaded().then(() => {
    if (fun.loaded) {
      return window.google
    } else {
      if (!fun.requested) {
        fun.requested = true
        window._GoogleMapLoadedCallback = () => { fun.loaded = true; unset(window, '_GoogleMapLoadedCallback') }
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${ak}&callback=_GoogleMapLoadedCallback`
        document.body.appendChild(script)
      }
      return new Promise(function(resolve, reject) {
        const requestInterval = window.setInterval(function () {
          if (fun.loaded) {
            window.clearInterval(requestInterval)
            resolve(window.google)
          }
        }, 10)
      })
    }
  })
}
/**
 * [newDate description]
 * @param  {[type]} str [format: yyyy-MM-dd HH:mm:ss]
 * @return [type]       [description]
 */
export function newDate(str) {
  const t = str.split(' ')
  const args = t[0].split('-').map(v => parseInt(v))
  args[1]-- // convert month to 0 -11
  t[1].split(':').forEach(v => { args.push(parseInt(v)) })
  return new Date(...args)
}

export function getRankColor(rank, max, order = 'asc') {
  const blue = 30
  const min = 1
  if (max === min) {
    return order === 'asc' ? `rgb(0, 255, ${blue})` : `rgb(255, 0, ${blue})`
  }
  const halfL = Math.floor((max - min + 1) / 2)
  const halfR = max - min + 1 - halfL
  const unitL = 255 / halfL
  const unitR = 255 / halfR
  const center = halfL + min - 1
  let red, green
  if (rank <= center) {
    red = Math.round((rank - min) * unitL)
    green = 255
  } else {
    red = 255
    green = Math.round(255 - (rank - center) * unitR)
  }
  if (order === 'desc') {
    const t = red
    red = green
    green = t
  }
  return `rgb(${red}, ${green}, 30)`
}

export function getRanks(arr0, order = 'asc') {
  const arr = arr0.slice(0)
  arr.sort((a, b) => a - b)
  if (order === 'desc') {
    arr.reverse()
  }
  return arr0.map(item => arr.indexOf(item) + 1)
}

export function sortRowsByProp(rows, prop) {
  rows.sort((a, b) => {
    const aProp = a[prop]
    const bProp = b[prop]
    if (aProp < bProp) {
      return -1
    }
    if (aProp > bProp) {
      return 1
    }
    // equal
    return 0
  })
}

export function exportExcel(rows, columns, title) {
  const cols = columns
  const data = rows.map(row => {
    const r = []
    cols.forEach(col => {
      const val = row[col.name]
      r.push(col.formatter ? col.formatter(val) : val)
    })
    return r
  })
  const titleLabels = cols.map(col => col.text)
  generateExcel(data, title, titleLabels)
}

export function loadBaiduMap(ak) {
  if (window.BMap) {
    return Promise.resolve(window.BMap)
  }
  const fun = loadBaiduMap
  return windowLoaded().then(() => {
    if (fun.loaded) {
      return Promise.resolve(window.BMap)
    } else {
      if (!fun.requested) {
        fun.requested = true
        window._BaiduMapLoadedCallback = () => { fun.loaded = true; unset(window, '_BaiduMapLoadedCallback') }
        const script = document.createElement('script')
        script.src = `http://api.map.baidu.com/api?v=2.0&ak=${ak}&callback=_BaiduMapLoadedCallback`
        document.body.appendChild(script)
      }
      return new Promise(function(resolve, reject) {
        const requestInterval = window.setInterval(function () {
          if (fun.loaded) {
            window.clearInterval(requestInterval)
            resolve(window.BMap)
          }
        }, 10)
      })
    }
  })
}

/**
 * [baiduMapReady must be under vm]
 * @return [type] [description]
 */
export function baiduMapReady() {
  return loadBaiduMap(this.ak).then(BMap => {
    this.BMap = BMap
    if (!this.map) {
      this.map = new BMap.Map(this.id)
      this.map.enableScrollWheelZoom()
    }
    this.map.addControl(new BMap.NavigationControl({anchor: window.BMAP_ANCHOR_BOTTOM_RIGHT, type: window.BMAP_NAVIGATION_CONTROL_ZOOM}))
    return Promise.resolve({BMap, map: this.map})
  })
}

/**
 * [googleMapReady must be under vm]
 * @return [type] [description]
 */
export function googleMapReady() {
  return loadGoogleMap(this.ak).then(google => {
    if (!this.map) {
      this.map = new google.maps.Map(document.getElementById(this.id), {
        zoom: 15,
        mapTypeId: 'roadmap',
        mapTypeControl: true,
        mapTypeControlOptions: {
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE
          ]
        }
      })
    }
    return Promise.resolve({google, map: this.map})
  })
}

// http
const storeOfCancelOldRequest = {}
export function cancelOldRequest(name) {
  const cancel = storeOfCancelOldRequest[name]
  if (cancel) {
    cancel()
    delete storeOfCancelOldRequest[name]
  }
}
export function namedHttpGet(name, url, options0) {
  cancelOldRequest(name)
  const CancelToken = Vue.Axios.CancelToken
  const http = Vue.http
  const options = Object.assign({}, options0 || {})
  options.cancelToken = new CancelToken((c) => { storeOfCancelOldRequest[name] = c })
  return http.get(url, options)
}
