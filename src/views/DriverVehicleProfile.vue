<template>
  <div class="driver-vehicle-profile">
    <p class="md-title m-a" style="text-align:center;" v-show="!isSelected">No driver or vehicle selected</p>
    <md-layout md-gutter v-if="isSelected">
      <md-layout md-flex="50" md-flex-xsmall="100">
        <md-card  class="m-a w-100 card-1">
          <md-card-content class="flex flex-col">
            <h2 class="md-title">{{$t(`${state.type === 'driver' ? 'driver' : 'vehicle'}Profile`)}}</h2>

            <div v-if="state.type==='driver'" class="profile driver-profile">
              <div class="avatar">
                <img src="../assets/img/avatar-2.jpg" alt="" />
              </div>
              <div class="information">
                <h3 >{{driver.name}}</h3>
                Phone home: {{driver.phone_home}}
                <br />
                Phone mobile: {{driver.phone_mobile}}
                <br />
                Dob: {{driver.dob}}
                <br />
                Grade: {{grade}}
                <!-- <br />
                <!-- <br />
                Travelled distance: {{driver.travelledDistance}} KM -->
              </div>
            </div>
            <div v-if="state.type==='vehicle'" class="profile vehicle-profile">
              <div class="avatar">
                <img src="../assets/img/avatar-2.jpg" alt="" />
              </div>
              <div class="information">
                <h3 >{{vehicle.vrm_mark_code}}</h3>
                Dob: {{vehicle.dob}}
                <br />
                Grade: {{grade}}
                <!-- Travelled distance: {{vehicle.travelledDistance}} KM -->
              </div>
            </div>

            <div class="card-buttons">
              <fullscreen-button></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>
      <md-layout md-flex="50" md-flex-xsmall="100">
        <md-card  class="m-a w-100 card-1">
          <md-card-content class="flex flex-col">
            <h2 class="md-title">{{$t('warningCountSum')}}</h2>
            <div class="relative m-a">
              <canvas :id="warningCountSumChartID" class="w-100 warning-count-sum-chart"></canvas>
            </div>

            <div class="card-buttons">
              <fullscreen-button></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>
      <md-layout md-flex="100">
        <md-card  class="m-a w-100 card-1">
          <md-card-content class="flex flex-col">
            <h2 class="md-title">{{$t('safetyScoreHistory')}}</h2>

            <div class="relative">
              <div :id="safetyScoreHistoryChartID" class="w-100 safety-score-history-chart"></div>
            </div>

            <div class="card-buttons">
              <fullscreen-button @click.native="onclickFullscreen('safetyScoreHistoryChart')"></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>
      <md-layout md-flex="100">
        <md-card  class="m-a w-100 card-1">
          <md-card-content class="flex flex-col">
            <h2 class="md-title">{{$t('warningCountHistoryPer100KM')}}</h2>

            <div class="relative">
              <div :id="warningCountHistoryPer100KMChartID" class="w-100 warning-count-history-per-100km-chart"></div>
              <div class="chart2-blocks">
                <div class="item" v-for="(col, i) in chart2Columns">
                  {{col.text}}: <div :class="['color-block', 'ct-color-'+(chart2Columns.length-i)]"></div>
                </div>
              </div>
            </div>

            <div class="card-buttons">
              <fullscreen-button @click.native="onclickFullscreen('safetyScoreHistoryChart')"></fullscreen-button>
            </div>
          </md-card-content>
        </md-card>
      </md-layout>

      <md-layout md-flex="100" v-if="isSelected">
        <template v-if="state.type==='driver'">
          <md-card class="card-1 m-a">
            <md-card-content>
              <h2 class="md-title">{{$t('driverScoreAndAlertCountPer100KM')}}</h2>

              <div class="relative overflow-hidden-y">
                <md-table @select="" @sort="onSort($event, driverInfoRows, driverInfoColumns)">
                 <md-table-header>
                   <md-table-row>
                     <md-table-head v-for="col in driverInfoColumns" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
                   </md-table-row>
                 </md-table-header>

                 <md-table-body>
                   <md-table-row v-for="row in driverInfoRows" v-if="row.visible" :key="row.avg_warn_id" :md-item="row">
                     <md-table-cell v-for="(col, index) in driverInfoColumns" v-if="col.visible" :key="col.name">
                       {{ row[col.name] }}
                     </md-table-cell>
                   </md-table-row>
                 </md-table-body>
               </md-table>

               <Datatable-Footer :rows="driverInfoRows"></Datatable-Footer>
              </div>

              <div class="card-buttons">
                <md-button class="md-icon-button" @click.native="exportExcel(driverInfoRows, driverInfoColumns, $t('driverScoreAndAlertCountPer100KM'))">
                  <md-icon>get_app</md-icon>
                  <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
                </md-button>
                <fullscreen-button></fullscreen-button>
              </div>
            </md-card-content>
          </md-card>
          <md-card class="card-1 m-a">
            <md-card-content>
              <h2 class="md-title">{{$t('safetyScoreRanking')}}</h2>

              <div class="relative overflow-hidden-y">
                <md-table @select="" @sort="onSort($event, driverRanks, driverRankColumns)">
                 <md-table-header>
                   <md-table-row>
                     <md-table-head v-for="col in driverRankColumns" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
                   </md-table-row>
                 </md-table-header>

                 <md-table-body>
                   <md-table-row v-for="row in driverRanks" v-if="row.visible" :key="row.avg_warn_id" :md-item="row">
                     <md-table-cell v-for="(col, index) in driverRankColumns" v-if="col.visible" :key="col.name">
                       {{ row[col.name] }}
                     </md-table-cell>
                   </md-table-row>
                 </md-table-body>
               </md-table>

               <Datatable-Footer :rows="driverRanks"></Datatable-Footer>
              </div>

              <div class="card-buttons">
                <md-button class="md-icon-button" @click.native="exportExcel(driverRanks, driverRankColumns, $t('safetyScoreRanking'))">
                  <md-icon>get_app</md-icon>
                  <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
                </md-button>
                <fullscreen-button></fullscreen-button>
              </div>
            </md-card-content>
          </md-card>
        </template>

        <template v-else-if="state.type=='vehicle'">
          <md-card  class="m-a card-1">
            <md-card-content>
              <h2 class="md-title">{{$t('vehicleScoreAndAlertCountPer100KM')}}</h2>
              <div class="relative overflow-hidden-y">
                <md-table  @select="" @sort="onSort">
                 <md-table-header>
                   <md-table-row>
                     <md-table-head v-for="col in vehicleInfoColumns" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
                   </md-table-row>
                 </md-table-header>

                 <md-table-body>
                   <md-table-row v-for="row in vehicleInfoRows" v-if="row.visible" :key="row.avg_warn_id" :md-item="row">
                     <md-table-cell v-for="col in vehicleInfoColumns" v-if="col.visible" :key="col.name">
                       {{ row[col.name] }}
                     </md-table-cell>
                   </md-table-row>
                 </md-table-body>
               </md-table>

               <Datatable-Footer :rows="vehicleInfoRows"></Datatable-Footer>
              </div>

              <div class="card-buttons">
                <md-button class="md-icon-button" @click.native="exportExcel(driverInfoRows, driverInfoColumns, $t('vehicleScoreAndAlertCountPer100KM'))">
                  <md-icon>get_app</md-icon>
                  <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
                </md-button>
                <fullscreen-button></fullscreen-button>
              </div>
            </md-card-content>
          </md-card>
          <md-card class="card-1 m-a">
            <md-card-content>
              <h2 class="md-title">{{$t('safetyScoreRanking')}}</h2>

              <div class="relative overflow-hidden-y">
                <md-table @select="" @sort="onSort($event, vehicleRanks, vehicleRankColumns)">
                 <md-table-header>
                   <md-table-row>
                     <md-table-head v-for="col in vehicleRankColumns" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
                   </md-table-row>
                 </md-table-header>

                 <md-table-body>
                   <md-table-row v-for="row in vehicleRanks" v-if="row.visible" :key="row.avg_warn_id" :md-item="row">
                     <md-table-cell v-for="(col, index) in vehicleRankColumns" v-if="col.visible" :key="col.name">
                       {{ row[col.name] }}
                     </md-table-cell>
                   </md-table-row>
                 </md-table-body>
               </md-table>

               <Datatable-Footer :rows="driverRanks"></Datatable-Footer>
              </div>

              <div class="card-buttons">
                <md-button class="md-icon-button" @click.native="exportExcel(vehicleRanks, vehicleRankColumns, $t('safetyScoreRanking'))">
                  <md-icon>get_app</md-icon>
                  <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
                </md-button>
                <fullscreen-button></fullscreen-button>
              </div>
            </md-card-content>
          </md-card>
        </template>
      </md-layout>
    </md-layout>
  </div>
</template>
<script>
import DatatableFooter from '../components/DatatableFooter.vue'
import { format, addDays, subDays, getMonthStart, addMonths, subMonths, subYears } from 'date-functions'
import { newDate, sortRows as onSort, exportExcel, initColumns, initRows } from '@/utils.js'
import Chartist from 'chartist'
import Chart from 'chart.js'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

function getDateText(dateType, timestamp) {
  const date = new Date(timestamp)
  let text
  switch (dateType) {
    case 'daily':
      text = format(date, 'MM-dd')
      break
    case 'weekly':
      text = format(date, 'yyyy-MM-dd')
      break
    case 'monthly':
      text = format(date, 'yyyy-MM')
      break
    case 'yearly':
      text = format(date, 'yyyy')
      break
  }
  return text
}

const md = 'driverVehicleProfile' // vuex module name

const warningCountColumns = ['pcw', 'hmw_h', 'hmw_m', 'hmw_l', 'fcw', 'ufcw_h', 'ufcw_l', 'lldw', 'rldw', 'spw', 'aaw', 'abw', 'atw', 'vb']

export default {
  components: { DatatableFooter },
  data() {
    return {
      safetyScoreHistoryChartID: 'safetyScoreHistory' + this._uid,
      warningCountHistoryPer100KMChartID: 'warningCountHistoryPer100KM' + this._uid,
      warningCountSumChartID: 'warningCountSum' + this._uid,
      // driverInfo: {},
      // vehicleInfo: {},
      driverInfoRows: [],
      vehicleInfoRows: [],
      driverInfoColumns: [
        {
          name: 'start_date_formatted',
          text: this.$t('startDate'),
          valueProcessor: ({row}) => format(new Date(row.start_date), 'yyyy-MM-dd'),
        },
        { name: 'total_score',
          text: this.$t('totalScore')
        },
        { name: 'pcw',
          text: this.$t('pcw'),
        },
        { name: 'hmw_h',
          text: this.$t('hmwH'),
        },
        { name: 'hmw_m',
          text: this.$t('hmwM'),
        },
        { name: 'hmw_l',
          text: this.$t('hmwL'),
        },
        { name: 'fcw',
          text: this.$t('fcw'),
        },
        { name: 'ufcw_h',
          text: this.$t('ufcwH'),
        },
        { name: 'ufcw_l',
          text: this.$t('ufcwL'),
        },
        { name: 'lldw',
          text: this.$t('lldw'),
        },
        { name: 'rldw',
          text: this.$t('rldw'),
        },
        { name: 'spw',
          text: this.$t('spw'),
        },
        { name: 'aaw',
          text: this.$t('aaw'),
        },
        { name: 'abw',
          text: this.$t('abw'),
        },
        { name: 'atw',
          text: this.$t('atw'),
        },
        { name: 'vb',
          text: this.$t('vb')
        },
        { name: 'drv_distance',
          text: this.$t('drvDistance'),
        },
      ],
      vehicleInfoColumns: [
        {
          name: 'start_date_formatted',
          text: this.$t('startDate'),
          valueProcessor: ({row}) => format(new Date(row.start_date), 'yyyy-MM-dd'),
        },
        { name: 'total_score', text: this.$t('totalScore'),

        },
        { name: 'drv_duration', text: this.$t('drvDuration'),

        },
        { name: 'pcw', text: this.$t('pcw'),

        },
        { name: 'ufcw', text: this.$t('ufcw'),

        },
        { name: 'fcw', text: this.$t('fcw'),

        },
        { name: 'hmw_h', text: this.$t('hmwH'),

        },
        { name: 'hmw_m', text: this.$t('hmwM'),

        },
        { name: 'hmw_l', text: this.$t('hmwL'),

        },
        { name: 'lldw', text: this.$t('lldw'),

        },
        { name: 'rldw', text: this.$t('rldw'),

        },
        { name: 'spw', text: this.$t('spw'),

        },
        { name: 'vb', text: this.$t('vb'),

        },
        { name: 'aaw', text: this.$t('aaw'),

        },
        { name: 'abw', text: this.$t('abw'),

        },
        { name: 'atw', text: this.$t('atw'),

        },
        { name: 'drv_distance', text: this.$t('drvDistance'),

        },
      ],
      driverRankColumns: [
        {
          name: 'start_date_formatted',
          text: this.$t('startDate'),
          valueProcessor: ({row}) => format(new Date(row.start_date), 'yyyy-MM-dd'),
        },
        { name: 'total_score',
          text: this.$t('totalScore')
        },
        { name: 'pcw',
          text: this.$t('pcw'),
        },
        { name: 'hmw_h',
          text: this.$t('hmwH'),
        },
        { name: 'hmw_m',
          text: this.$t('hmwM'),
        },
        { name: 'hmw_l',
          text: this.$t('hmwL'),
        },
        { name: 'fcw',
          text: this.$t('fcw'),
        },
        { name: 'ufcw_h',
          text: this.$t('ufcwH'),
        },
        { name: 'ufcw_l',
          text: this.$t('ufcwL'),
        },
        { name: 'lldw',
          text: this.$t('lldw'),
        },
        { name: 'rldw',
          text: this.$t('rldw'),
        },
        { name: 'spw',
          text: this.$t('spw'),
        },
        { name: 'aaw',
          text: this.$t('aaw'),
        },
        { name: 'abw',
          text: this.$t('abw'),
        },
        { name: 'atw',
          text: this.$t('atw'),
        },
        { name: 'vb',
          text: this.$t('vb')
        },
      ],
      vehicleRankColumns: [
        {
          name: 'start_date_formatted',
          text: this.$t('startDate'),
          valueProcessor: ({row}) => format(new Date(row.start_date), 'yyyy-MM-dd'),
        },
        { name: 'total_score',
          text: this.$t('totalScore')
        },
        { name: 'pcw',
          text: this.$t('pcw'),
        },
        { name: 'hmw_h',
          text: this.$t('hmwH'),
        },
        { name: 'hmw_m',
          text: this.$t('hmwM'),
        },
        { name: 'hmw_l',
          text: this.$t('hmwL'),
        },
        { name: 'fcw',
          text: this.$t('fcw'),
        },
        { name: 'ufcw_h',
          text: this.$t('ufcwH'),
        },
        { name: 'ufcw_l',
          text: this.$t('ufcwL'),
        },
        { name: 'lldw',
          text: this.$t('lldw'),
        },
        { name: 'rldw',
          text: this.$t('rldw'),
        },
        { name: 'spw',
          text: this.$t('spw'),
        },
        { name: 'aaw',
          text: this.$t('aaw'),
        },
        { name: 'abw',
          text: this.$t('abw'),
        },
        { name: 'atw',
          text: this.$t('atw'),
        },
        { name: 'vb',
          text: this.$t('vb')
        },
      ],
      driverRanks: [],
      vehicleRanks: [],
      startDate: null,
      endDate: null,
      grade: null,
    }
  },
  computed: {
    state() { return this.$store.state.driverVehicleProfile },
    dateTypeHead() { return this.state.dateType.substr(0, 1).toUpperCase() },
    dateTypeHeadLowerCase() { return this.dateTypeHead.toLowerCase() },
    isSelected() { return (this.state.type === 'driver' && this.state.driver) || (this.state.type === 'vehicle' && this.state.vehicle) },
    driver() { return this.$store.getters[`${md}/driverObj`] },
    vehicle() { return this.$store.getters[`${md}/vehicleObj`] },
    chart2Columns() {
      const include = ['pcw', 'ufcw', 'fcw', 'hmw_h', 'hmw_m', 'hmw_l', 'lldw', 'rldw', 'spw', 'vb', 'aaw', 'abw', 'atw']
      const columns = this.state.type === 'driver' ? this.driverInfoColumns : this.vehicleInfoColumns
      return columns.filter(v => include.includes(v.name))
    },
  },
  watch: {
    'state.type'() {
      this.getInfoRowSmartly()
      this.getRanksSmartly()
    },
    'state.dateType'() {
      this.getStartDateAndEndDate()
      this.getInfoRowSmartly()
      this.getRanksSmartly()
    },
    'state.driver'() {
      this.getInfoRowSmartly()
      this.getRanksSmartly()
    },
    'state.vehicle'() {
      this.getInfoRowSmartly()
      this.getRanksSmartly()
    },
    driverInfoRows() {
      this.getGrade()
      this.renderWaringCountSumChart()
      this.renderSafetyScoreHistoryChart()
      this.renderWarningCountHistoryPer100KMChart()
    },
    vehicleInfoRows() {
      this.getGrade()
      this.renderWaringCountSumChart()
      this.renderSafetyScoreHistoryChart()
      this.renderWarningCountHistoryPer100KMChart()
    },
  },
  created() {
    initColumns(this, this.driverInfoColumns)
    initColumns(this, this.driverRankColumns)
    initColumns(this, this.vehicleInfoColumns)
    initColumns(this, this.vehicleRankColumns)
    this.getStartDateAndEndDate()
  },
  methods: {
    onSort,
    exportExcel,
    onclickFullscreen(chart) {
      this[chart] && this[chart].update(null)
    },
    getStartDateAndEndDate() {
      let d = addDays(new Date(), 1) // Tomorrow
      const f = 'yyyy-MM-dd'
      switch (this.state.dateType) {
        case 'daily':
          this.endDate = format(d, f)
          this.startDate = format(subDays(d, 14), f)
          break
        case 'weekly':
          this.endDate = format(addDays(d, 7 - d.getDay()), f)
          this.startDate = format(subDays(d, 14 * 7), f)
          break
        case 'monthly':
          d = addMonths(getMonthStart(d), 1)
          this.endDate = format(d, f)
          this.startDate = format(subMonths(d, 12), f)
          break
        case 'yearly':
          d = newDate(d.getFullYear() + '-12-31 23:59:59')
          this.endDate = format(d, f)
          this.startDate = format(subYears(d, 7), f)
          break
      }
    },
    getDriverInfoRows() {
      this.$http.get(`dao/avg_warning_drv_by_co_type_date/${this.state.driver}?type=${this.dateTypeHeadLowerCase}&start_date=${this.startDate}&end_date=${this.endDate}`)
      .then(({data}) => {
        const rows = data.JSON
        .sort((a, b) => a.start_date - b.start_date)
        .reverse()
        // format count columns
        rows.forEach(row => {
          this.driverInfoColumns.slice(1).filter(col => col.name !== 'drv_distance').forEach(col => {
            row[col.name] = Math.round(((row[col.name] || 0) / (row.drv_distance / 100)) * 100000)
          })
          row.drv_distance = Math.round(row.drv_distance / 100000)
        })
        this.driverInfoRows = rows
        initRows(this, this.driverInfoRows, this.driverInfoColumns)
      })
    },
    getVehicleInfoRows() {
      this.$http.get(`dao/avg_warning_vrm_by_co_type_date/${this.state.vehicle}?type=${this.dateTypeHeadLowerCase}&start_date=${this.startDate}&end_date=${this.endDate}`)
      .then(({data}) => {
        const rows = data.JSON
        .sort((a, b) => a.start_date - b.start_date)
        .reverse()
        // format count columns
        rows.forEach(row => {
          this.vehicleInfoColumns.slice(1).filter(col => col.name !== 'drv_distance').forEach(col => {
            row[col.name] = Math.round(((row[col.name] || 0) / (row.drv_distance / 100)) * 100000)
          })
          row.drv_distance = Math.round(row.drv_distance / 100000)
        })
        this.vehicleInfoRows = rows
        initRows(this, this.vehicleInfoRows, this.vehicleInfoColumns)
      })
    },
    getGrade() {
      const rows = this.state.type === 'driver' ? this.driverInfoRows : this.vehicleInfoRows
      const avg = rows.reduce((a, b) => a + b.total_score, 0) / rows.length
      let grade
      if (avg >= 80) {
        grade = 'A'
      } else if (avg >= 60) {
        grade = 'B'
      } else if (avg >= 40) {
        grade = 'C'
      } else if (avg >= 20) {
        grade = 'D'
      } else if (avg >= 0) {
        grade = 'E'
      }
      this.grade = grade
    },
    getInfoRowSmartly() {
      if (this.state.type === 'driver') {
        this.getDriverInfoRows()
      } else {
        this.getVehicleInfoRows()
      }
    },
    getRanksSmartly() {
      let rows, cols
      if (this.state.type === 'driver') {
        rows = this.state.allDriverRanks
        .filter(row => row.driver_id === this.state.driver && row.type === this.dateTypeHead)
        .map(row => Object.assign({}, row))
        .reverse()
        this.driverRanks = rows
        cols = this.driverRankColumns
      } else {
        rows = this.state.allVehicleRanks
        .filter(row => row.vrm_id === this.state.vehicle && row.type === this.dateTypeHead)
        .map(row => Object.assign({}, row))
        .reverse()
        this.vehicleRanks = rows
        cols = this.vehicleRankColumns
      }
      rows.forEach(row => {
        row.drv_distance = Math.round(row.drv_distance / 100000)
      })
      initRows(this, rows, cols)
    },
    renderWaringCountSumChart() {
      if (!this.isSelected) {
        return
      }
      const ctx = document.getElementById(this.warningCountSumChartID)
      if (!ctx) {
        return
      }
      if (this.warningCountSumChart) {
        this.warningCountSumChart.destroy()
      }
      const rows = this.state.type === 'driver' ? this.driverInfoRows : this.vehicleInfoRows
      const cols = this.state.type === 'driver' ? this.driverInfoColumns : this.vehicleInfoColumns
      const labels = warningCountColumns.map(colName => cols.find(col => col.name === colName).text)
      const data = warningCountColumns.map(colName => rows.reduce((a, b) => a + b[colName], 0))
      this.warningCountSumChart = new Chart(ctx, {
        type: 'radar',
        data: {
          labels,
          datasets: [{
            label: '',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgb(255, 99, 132)',
            data,
          }]
        },
        options: {
        }
      })
    },
    renderSafetyScoreHistoryChart() {
      if (!this.isSelected) {
        return
      }
      const ctx = document.getElementById(this.safetyScoreHistoryChartID)
      if (!ctx) {
        return
      }
      if (this.safetyScoreHistoryChart) {
        this.safetyScoreHistoryChart.detach()
        ctx.innerHTML = ''
      }

      const rows = this.state.dateType === 'driver' ? this.driverInfoRows : this.vehicleInfoRows
      this.safetyScoreHistoryChart = new Chartist.Line(ctx, {
        labels: rows.map(row => getDateText(this.state.dateType, row.start_date)),
        series: [
          rows.map(row => row.total_score)
        ]
      },
        {
          low: 0,
          showArea: true,
          fullWidth: true,
          reverseData: true,
          chartPadding: {
            right: 40
          }
        }
        )
    },
    renderWarningCountHistoryPer100KMChart() {
      if (!this.isSelected) {
        return
      }
      const ctx = document.getElementById(this.warningCountHistoryPer100KMChartID)
      if (!ctx) {
        return
      }
      if (this.warningCountHistoryPer100KMChart) {
        this.warningCountHistoryPer100KMChart.detach()
        ctx.innerHTML = ''
      }

      const rows = this.state.dateType === 'driver' ? this.driverInfoRows : this.vehicleInfoRows
      const labelCols = this.chart2Columns
      this.warningCountHistoryPer100KMChart = new Chartist.Line(ctx, {
        labels: rows.map(row => getDateText(this.state.dateType, row.start_date)),
        series: labelCols.map(col => rows.map(row => row[col.name])),
      },
        {
          reverseData: true,
          fullWidth: true,
          chartPadding: {
            right: 30
          }
        }
        )
    },
  },
}
</script>
<style lang="scss">
.driver-vehicle-profile{
  .profile{
    display: flex;
    margin-bottom: 20px;
    > .avatar{
      padding: 0 20px 0 5px;
    }
    > .information{

    }
  }
  .chart2-blocks{
    padding: 0 5px;
    .item{
      display: inline-block;
      margin-right: .5em;
      .color-block{
        display: inline-block;
        width: 30px;
        height: 10px;
        vertical-align: middle;
      }
    }
  }
}
</style>
