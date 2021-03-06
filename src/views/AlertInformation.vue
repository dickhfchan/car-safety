<template>
  <div class="alert-information">

    <Alert-Information-Table v-show="rows.length > 0" :columns="columns" :rows="filteredRows" :parent="self"></Alert-Information-Table>

    <div class="text-center" v-show="rows.length === 0">{{$t('noRecordsFound')}}</div>

    <!-- video diaplog -->
    <md-dialog ref="dialogVideo" @close="$refs.video && $refs.video.pause()" class="alert-information dialog-video">
      <md-dialog-content>
        <video style="width:100%;" :src="videoSrc" controls="controls" ref="video">
          Your browser does not support HTML5 video.
        </video>
        <md-button class="md-icon-button md-raised md-dense video-close-button"  @click.native="$refs.dialogVideo.close()">
          <md-icon>close</md-icon>
        </md-button>
      </md-dialog-content>
    </md-dialog>
  </div>
</template>
<script>
import { retry, waitFor, camelCase, binarySearch } from 'helper-js'
import { format } from 'date-functions'
import runtime from '@/runtime.js'
import mapIcons from '../map-icons.js'
import { initColumns, initRows as initRowsOld, exportExcel } from '../utils.js'
import config from '@/config.js'
import AlertInformationTable from '../components/AlertInformationTable.vue'

const initRows = (vm, rows, columns) => {
  rows.forEach(row => {
    vm.$set(row, 'active', false)
  })
  initRowsOld(vm, rows, columns)
}

const statesMap = {
  '0': '',
  '1': 'brake',
  '2': 'left turn signal light',
  '3': 'brake  and left turn singal light',
  '4': 'right turn signal light',
  '5': 'brake and right turn signal light',
}

function keepOneDigital(n) {
  const str = Math.round(n * 10) + ''
  const left = str.substr(0, str.length - 1)
  const right = str.substr(-1)
  if (right === '0') {
    return parseInt(left)
  } else {
    return parseFloat(`${left}.${right}`)
  }
}

export default {
  components: { AlertInformationTable },
  data() {
    return {
      self: this,
      warningTypes: null,
      warningTypesI18n: null,
      columns: [
        {
          name: 'sequence',
          text: '#',
          valueProcessor: ({row, rows}) => rows.indexOf(row) + 1,
          exportAble: false,
        },
        {
          'name': 'warning_vdo_id',
          text: this.$t('video')
        },
        {
          'name': 'warningType',
          visible: false,
          valueProcessor: ({row}) => this.warningTypes[row.wt]
        },
        {
          'name': 'warningTypeDisplay',
          'text': this.$t('warningType'),
          valueProcessor: ({row}) => this.warningTypesI18n[row.wt]
        },
        {
          'name': 'startTimeDisplay',
          text: this.$t('startTime'),
          valueProcessor: ({row}) => format(new Date(row.start_time), 'HH:mm:ss')
        },
        {
          'name': 'endTimeDisplay',
          text: this.$t('endTime'),
          visible: false,
          valueProcessor: ({row}) => format(new Date(row.end_time), 'HH:mm:ss'),
        },
        {
          'name': 'durationDisplay',
          text: this.$t('duration'),
          valueProcessor: ({row}) => keepOneDigital(row.duration / 1000),
        },
        {
          'name': 'start_spd',
          'text': this.$t('startSpd')
        },
        {
          'name': 'end_spd',
          'text': this.$t('endSpd')
        },
        {
          'name': 'top_spd',
          'text': this.$t('topSpd')
        },
        {
          'name': 'hw',
          'text': this.$t('hw')
        },
        {
          'name': 'near_hw',
          'text': this.$t('nearHw')
        },
        {
          'name': 'wt',
          'text': this.$t('wt'),
          visible: false,
        },
        {
          'name': 'ss',
          'text': this.$t('ss'),
          visible: false,
        },
        {
          'name': 'alt',
          'text': this.$t('alt'),
          visible: false,
        },
        {
          'name': 'bearing',
          'text': this.$t('bearing'),
          visible: false,
        },
        {
          'name': 'lat',
          'text': this.$t('lat'),
          visible: false,
        },
        {
          'name': 'lng',
          'text': this.$t('lng'),
          visible: false,
        },
        {
          'name': 'state',
          'text': this.$t('state'),
          valueProcessor: ({value}) => statesMap[value] || ''
        },
      ],
      rows: [],
      overLays: [], // store alert markers
      videoSrc: null,
    }
  },
  computed: {
    // be turned to expired when request start
    rowsExpired: {
      get() { return this.$store.state.alertInformationRowsExpired },
      set(val) { this.$store.commit('alertInformationRowsExpired', val) }
    },
    filteredRows() {
      let wt = this.$store.state.alertInformationWarningType
      if (wt === 'all') {
        return this.rows
      } else {
        wt = parseInt(wt)
        return this.rows.filter(row => row.wt === wt)
      }
    },
  },
  watch: {
    // get rows
    '$store.state.tripId': {
      immediate: true,
      handler() { this.getData() }
    },
    // '$store.state.points': {
    //   immediate: true,
    //   handler() { this.renderAlertPoint() }
    // },
    // '$store.state.pointsFromTripDetail': {
    //   immediate: true,
    //   handler() { this.renderAlertPoint() }
    // },
    // '$store.state.map': {
    //   immediate: true,
    //   handler() { this.renderAlertPoint() }
    // },
    // 'rows': {
    //   immediate: true,
    //   handler() { this.renderAlertPoint() }
    // },
  },
  created() {
    initColumns(this, this.columns)
    this.baiduMapMarkers = []
  },
  methods: {
    getData() {
      const state = this.$store.state
      const currentTrip = state.allTrips.find(v => v.veh_trip_id === state.tripId)
      if (currentTrip) {
        const dateInUrlFormat = 'yyyy-MM-dd+HH%3Amm%3Ass'
        const start = format(new Date(currentTrip.start_time), dateInUrlFormat)
        const end = format(new Date(currentTrip.end_time), dateInUrlFormat)
        const getWarningTypes = this.warningTypes == null ? this.getWarningTypes() : Promise.resolve()
        const getLogData = retry(() => this.$http.get(`dao/log_data/${currentTrip.vrm_id}?start_time=${start}&end_time=${end}`))
        // const getLogData = retry(() => this.$http.get(`dao/log_data/45?start_time=2017-04-27+00%3A00%3A00&end_time=2017-04-28+00%3A00%3A00`))
        this.rowsExpired = true
        return Promise.all([getWarningTypes, getLogData()]).then((data) => {
          const response = data[1]
          this.rows = response.data.JSON
          initRows(this, this.rows, this.columns)
          this.rowsExpired = false
          return this.rows
        }).catch((e) => {
          this.$alert(this.$t('getAlertInformationFailed'))
          throw e
        })
      }
    },
    getWarningTypes() {
      const func = retry(() => this.$http.get('dao/warning_type'))
      return func().then(({data}) => {
        const warningTypes = {}
        data.JSON.forEach(item => { warningTypes[item.warn_type_id] = item.warn_type_code })
        const warningTypesI18n = {}
        Object.keys(warningTypes).forEach(key => {
          warningTypesI18n[key] = this.$t(camelCase(warningTypes[key].toLowerCase()))
        })
        this.warningTypes = warningTypes
        this.warningTypesI18n = warningTypesI18n
      }).catch((e) => {
        this.$alert(this.$t('getWarningTypesFailed'))
        throw e
      })
    },
    renderAlertPoint() {
      switch (this.$store.state.map) {
        case 'googleMap':
          this.renderAlertPointOnGoogleMap()
          break
        case 'baiduMap':
          this.renderAlertPointOnBaiduMap()
          break
      }
    },
    clearMarkers() {
      switch (this.$store.state.map) {
        case 'googleMap':
          const overLays = this.overLays
          overLays.forEach(v => v.setMap(null))
          overLays.length = 0
          break
        case 'baiduMap':
          if (runtime.bmtr && runtime.bmtr.map) {
            this.baiduMapMarkers.forEach(marker => {
              runtime.bmtr.map.removeOverlay(marker)
            })
            this.baiduMapMarkers = []
          }
          break
      }
    },
    renderAlertPointOnGoogleMap() {
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
            const icon = mapIcons[row.warningType]
            const marker = new google.maps.Marker({
              position: { lat: row.lat, lng: row.lng },
              icon,
            })
            const infowindow = new google.maps.InfoWindow({
              content: `
<pre>
${this.$t('duration')}:     ${row.duration} seconds
${this.$t('topSpd')}:    ${row.top_spd} KM/h
${this.$t('startSpd')}:  ${row.start_spd} KM/h
${this.$t('endSpd')}:    ${row.end_spd} KM/h
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
    renderAlertPointOnBaiduMap() {
      //
      const state = this.$store.state
      if (!this.rowsExpired && !state.pointsExpired) {
        waitFor('baiduMapReady', () => runtime.bmtr && runtime.bmtr.map)
        .then(() => {
          const bmtr = runtime.bmtr
          const BMap = bmtr.BMap
          const map = bmtr.map
          const rows = this.rows
          let prevOpenedInfoWindow = null
          let prevRowOfOpenedInfoWindow = null
          const pointsClone = this.$store.state.points.slice(0)
          pointsClone.sort((a, b) => a.time - b.time)
          rows.forEach(row => {
            // find nearest point by time with binarySearch
            let nearest
            binarySearch(pointsClone, item => {
              nearest = item
              return row.start_time - item.time
            })
            const point = new BMap.Point(nearest.lng, nearest.lat)
            const icon = mapIcons[row.warningType]
            const BMapIcon = new BMap.Icon(icon, new BMap.Size(26, 26), {
              anchor: new BMap.Size(13, 26),
            })
            const marker = new BMap.Marker(point, {icon: BMapIcon})
            this.baiduMapMarkers.push(marker)
            map.addOverlay(marker)
            const infoWindow = new BMap.InfoWindow(`
<pre>
${this.$t('duration')}:     ${row.duration} seconds
${this.$t('topSpd')}:    ${row.top_spd} KM/h
${this.$t('startSpd')}:  ${row.start_spd} KM/h
${this.$t('endSpd')}:    ${row.end_spd} KM/h
</pre>`,
              {
                width: 250,
                height: 120,
              })
            marker.addEventListener('click', () => {
              if (prevOpenedInfoWindow) {
                prevRowOfOpenedInfoWindow.active = false
              }
              prevOpenedInfoWindow = infoWindow
              prevRowOfOpenedInfoWindow = row
              row.active = true
              map.openInfoWindow(infoWindow, point)
            })
            infoWindow.addEventListener('close', () => {
              row.active = false
            })
          })
        })
      }
    },
    exportExcel,
    playAlertVideo(row) {
      this.videoSrc = config.serverBaseUrl.replace(/\/$/, '') + `/video/${row.warning_vdo_id}`
      this.$refs.dialogVideo.open()
    },
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
  &.dialog-video{
    .md-dialog{
      width: 1000px; // md-dialog max-width is 80%
      overflow: visible;
    }
    .md-dialog-content{
      padding: 0;
      width: 100%;
      overflow: visible;
    }
    .video-close-button{
      right: -10px;
      top: -10px;
      background: #fff;
      position: absolute;
      margin: 0;
      &:hover{
        background-color: #ccc;
      }
    }
  }
}
</style>
