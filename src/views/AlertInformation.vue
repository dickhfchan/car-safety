<template>
  <md-table class="alert-information">
    <md-table-header>
      <md-table-row>
        <md-table-head v-for="col in columns" :key="col.name">{{col.text}}</md-table-head>
      </md-table-row>
    </md-table-header>

    <md-table-body>
      <md-table-row v-for="row in rows" :key="row.log_id" :class="{active: row.active}">
        <md-table-cell v-for="col in columns" :key="col.name">{{row[col.name]}}</md-table-cell>
      </md-table-row>
    </md-table-body>
  </md-table>
</template>
<script>
import { titleCase, retry, waitFor } from 'helper-js'
import { format, subHours } from 'date-functions'
import runtime from '@/runtime.js'
import mapIcons from '../map-icons.js'
import { generateExcel } from '../utils.js'

export default {
  data() {
    return {
      warningTypes: null,
      columns: [
        {
          name: 'sequence',
          text: '#',
          valueProcessor: ({row, rows}) => rows.indexOf(row) + 1
        },
        {
          'name': 'Warning',
          'text': 'Warning',
          valueProcessor: ({row}) => this.warningTypes[row.wt]
        },
        {
          'name': 'start_time',
          valueProcessor: ({value}) => format(new Date(value), 'HH:mm')
        },
        {
          'name': 'end_time',
          valueProcessor: ({value}) => format(new Date(value), 'HH:mm')
        },
        {
          'name': 'duration'
        },
        {
          'name': 'lat',
          'text': 'Latitude'
        },
        {
          'name': 'lng',
          'text': 'Longitude'
        },
        {
          'name': 'start_spd',
          'text': 'Start Speed'
        },
        {
          'name': 'end_spd',
          'text': 'End Speed'
        },
        {
          'name': 'top_spd',
          'text': 'Top Speed'
        },
        {
          'name': 'ti',
          'text': 'TI'
        },
        {
          'name': 'hw',
          'text': 'HW'
        },
        {
          'name': 'near_hw',
          'text': 'Near HW'
        },
        {
          'name': 'ss',
          'text': 'SS'
        },
        {
          'name': 'sx',
          'text': 'SX'
        },
        {
          'name': 'accuracy'
        },
        {
          'name': 'bearing'
        },
        {
          'name': 'driver_id'
        },
        {
          'name': 'log_id'
        },
        {
          'name': 'state'
        },
        {
          'name': 'upload_id'
        },
        {
          'name': 'vrm_id'
        },
        {
          'name': 'warning_vdo_id'
        },
        {
          'name': 'warning_vdo_ready'
        },
        {
          'name': 'alt',
        },
      ],
      cache: {
        rows: []
      },
      rowsExpired: false, // be turned to expired when request start
      overLays: [], // store alert markers
    }
  },
  computed: {
    rows: {
      get() { return this.cache.rows },
      set(rows) {
        this.columns
        .filter(col => col.valueProcessor)
        .forEach(col => {
          rows.forEach(row => { row[col.name] = col.valueProcessor({value: row[col.name], col, row, rows}) })
        })
        rows.forEach(row => { row.active = false })
        this.cache.rows = rows
      }
    }
  },
  watch: {
    // get rows
    '$store.state.tripId': {
      immediate: true,
      handler() { this.getData() }
    },
    '$store.state.points': {
      immediate: true,
      handler() { this.renderAlertPoint() }
    },
    '$store.state.pointsFromTripDetail': {
      immediate: true,
      handler() { this.renderAlertPoint() }
    },
    'rows': {
      immediate: true,
      handler() { this.renderAlertPoint() }
    },
  },
  created() {
    // auto generate column display name
    for (const col of this.columns) {
      if (!col.text) {
        this.$set(col, 'text', titleCase(col.name))
      }
    }
  },
  methods: {
    getData() {
      const state = this.$store.state
      const currentTrip = state.allTrips.find(v => v.veh_trip_id === state.tripId)
      if (currentTrip) {
        const dateInUrlFormat = 'yyyy-MM-dd+HH%3Amm%3Ass'
        const start = format(subHours(new Date(currentTrip.start_time), 8), dateInUrlFormat)
        const end = format(subHours(new Date(currentTrip.end_time), 8), dateInUrlFormat)
        const getWarningTypes = this.warningTypes == null ? this.getWarningTypes() : Promise.resolve()
        const getLogData = retry(() => this.$http.get(`dao/log_data/${currentTrip.vrm_id}?start_time=${start}&end_time=${end}`))
        // const getLogData = retry(() => this.$http.get(`dao/log_data/45?start_time=2017-04-27+00%3A00%3A00&end_time=2017-04-28+00%3A00%3A00`))
        this.rowsExpired = true
        return Promise.all([getWarningTypes, getLogData()]).then((data) => {
          const response = data[1]
          this.rows = response.data.JSON
          this.rowsExpired = false
          return this.rows
        }).catch((e) => {
          this.$alert('get alert information failed')
          throw e
        })
      }
    },
    getWarningTypes() {
      const func = retry(() => this.$http.get('dao/warning_type'))
      return func().then(({data}) => {
        const warningTypes = {}
        data.JSON.forEach(item => { warningTypes[item.warn_type_id] = item.warn_type_code })
        this.warningTypes = warningTypes
      }).catch((e) => {
        this.$alert('get warning types failed')
        throw e
      })
    },
    renderAlertPoint() {
      // clear
      const overLays = this.overLays
      overLays.forEach(v => v.setMap(null))
      overLays.length = 0
      //
      const state = this.$store.state
      if (!this.rowsExpired && !state.pointsExpired) {
        waitFor('googleMapReady', () => runtime.gmtr && runtime.gmtr.map)
        .then(() => {
          const gmtr = runtime.gmtr
          const google = gmtr.google
          const map = gmtr.map
          const rows = this.rows
          let prevOpenedInfoWindow = null
          let prevRowOfOpenedInfoWindow = null
          rows.forEach(row => {
            const icon = mapIcons[row.Warning]
            const marker = new google.maps.Marker({
              position: { lat: row.lat, lng: row.lng },
              icon,
            })
            const infowindow = new google.maps.InfoWindow({
              content: `
<pre>
Duration:     ${row.duration} seconds
Top Speed:    ${row.top_spd} KM/h
Start Speed:  ${row.start_spd} KM/h
End Speed:    ${row.end_spd} KM/h
</pre>`
            })
            marker.addListener('click', () => {
              if (prevOpenedInfoWindow) {
                prevOpenedInfoWindow.close()
                prevRowOfOpenedInfoWindow.active = false
              }
              prevOpenedInfoWindow = infowindow
              prevRowOfOpenedInfoWindow = row
              row.active = true
              infowindow.open(map, marker)
            })
            infowindow.addListener('closeclick', () => {
              row.active = false
            })
            overLays.push(marker)
          })
          overLays.forEach(v => v.setMap(map))
        })
      }
    },
    exportExcel() {
      const cols = this.columns.filter(col => col.name !== 'sequence')
      const data = this.rows.map(row => {
        const r = []
        cols.forEach(col => {
          r.push(row[col.name])
        })
        return r
      })
      const titleLabels = cols.map(col => col.text)
      generateExcel(data, 'Alert Information', titleLabels)
    }
  }
}

</script>
<style lang="scss">
.alert-information{
  .md-table-row.active, .md-table-row.active:hover{
    .md-table-cell{
      background-color: #689f38;
      color: #fff;
    }
  }
}
</style>
