import { titleCase } from 'helper-js'
import config from '@/config.js'

const dateTimeFields = ['start_time', 'end_time', 'time', 'start_date', 'end_date', 'date', 'create_ts', 'update_ts', 'last_loc_update_ts', 'apps_ts', 'last_access_ts']

export function initAxios(axios, Vue, store, config) {
  const axiosInstance = axios.create({
    baseURL: store.state.urls.server.base,
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
  if (config.isDevelopment) {
    return http.post('http://' + window.location.host + '/proxy', {
      url,
      method,
      data
    })
  } else {
    return http[method](url, data)
  }
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

export function getRowData(row) {
  const item = {}
  Object.keys(row).filter(key => key !== 'visible').forEach(key => {
    item[key] = row[key]
    if (dateTimeFields.indexOf(key) > -1 && (item[key] + '').length === 13) {
      item[key] = Math.round(item[key] / 1000)
    }
  })
  return item
}
export function beforeSave(row) {
  dateTimeFields.forEach(fld => {
    if (row[fld]) {
      row[fld] = parseInt(row[fld])
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
