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
                <!-- Travelled distance: {{vehicle.travelledDistance}} KM -->
              </div>
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
      <md-layout md-flex="100" v-if="isSelected">
        <md-card  class="card-1" v-if="state.type==='driver'">
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
                   <md-table-cell v-for="(col, index) in columns1" v-if="col.visible" :key="col.name"
                   <!-- :style="getColorStyle(rows1, row, col)" -->
                   >
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
        <md-card  class="m-a card-1" v-else-if="state.type=='vehicle'">
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
      </md-layout>
    </md-layout>
  </div>
</template>
<script>
import DatatableFooter from '../components/DatatableFooter.vue'
import { format } from 'date-functions'
import { sortRows as onSort, exportExcel, initColumns, initRows } from '@/utils.js'
import Chartist from 'chartist'
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

export default {
  components: { DatatableFooter },
  data() {
    return {
      safetyScoreHistoryChartID: this._uid + 'safetyScoreHistory',
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
        { name: 'pcw_score', text: this.$t('pcwScore'),

        },
        { name: 'ufcw_score', text: this.$t('ufcwScore'),

        },
        { name: 'fcw_score', text: this.$t('fcwScore'),
        },
        { name: 'hmw_h_score', text: this.$t('hmwHScore'),
        },
        { name: 'hmw_m_score', text: this.$t('hmwMScore'),
        },
        { name: 'hmw_l_score', text: this.$t('hmwLScore'),
        },
        { name: 'lldw_score', text: this.$t('lldwScore'),
        },
        { name: 'rldw_score', text: this.$t('rldwScore'),
        },
        { name: 'spw_score', text: this.$t('spwScore'),

        },
        { name: 'vb_score', text: this.$t('vbScore'),

        },
        { name: 'aaw_score', text: this.$t('aawScore'),

        },
        { name: 'abw_score', text: this.$t('abwScore'),

        },
        { name: 'atw_score', text: this.$t('atwScore'),

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
    }
  },
  computed: {
    state() { return this.$store.state.driverVehicleProfile },
    isSelected() { return (this.state.type === 'driver' && this.state.driver) || (this.state.type === 'vehicle' && this.state.vehicle) },
    driver() { return this.$store.getters[`${md}/driverObj`] },
    vehicle() { return this.$store.getters[`${md}/vehicleObj`] },
  },
  watch: {
    'state.type'() {
      this.getInfoRowSmartly()
      this.renderSafetyScoreHistoryChart()
    },
    'state.dateType'() {
      this.getInfoRowSmartly()
      this.renderSafetyScoreHistoryChart()
    },
    'state.driver'() {
      this.getInfoRowSmartly()
      this.renderSafetyScoreHistoryChart()
    },
    'state.vehicle'() {
      this.getInfoRowSmartly()
      this.renderSafetyScoreHistoryChart()
    },
  },
  created() {
    initColumns(this, this.driverInfoColumns)
    initColumns(this, this.vehicleInfoColumns)
  },
  methods: {
    onSort,
    exportExcel,
    onclickFullscreen(chart) {
      this[chart] && this[chart].update(null)
    },
    renderSafetyScoreHistoryChart() {
      if (!this.isSelected) {
        return
      }
      this.$nextTick(() => {
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
      })
    },
    getDriverInfoRows() {
      const rows = this.state.driverInfos
      .filter(item => item.driver_id === this.state.driver)
      .filter(item => item.type === this.state.dateType.substr(0, 1).toUpperCase())
      .map(row => Object.assign({}, row)) // clone row
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
    },
    getVehicleInfoRows() {
      const rows = this.state.vehicleInfos
      .filter(item => item.vrm_id === this.state.vehicle)
      .filter(item => item.type === this.state.dateType.substr(0, 1).toUpperCase())
      .map(row => Object.assign({}, row)) // clone row
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
    },
    getInfoRowSmartly() {
      if (this.state.type === 'driver') {
        this.getDriverInfoRows()
      } else {
        this.getVehicleInfoRows()
      }
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
}
</style>
