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
    </md-layout>
  </div>
</template>
<script>
import { clone, format, addDay, addDays, subDays, addMonth, subMonths, getMonthStart, addYear, subYears } from 'date-functions'
import { newDate } from '@/utils.js'
import Chartist from 'chartist'
import '@/assets/css/_chartist-settings.scss'
import 'chartist/dist/scss/chartist.scss'

function getDates(type) {
  const result = []
  const today = newDate(format(new Date(), 'yyyy-MM-dd 00:00:00'))
  let date
  switch (type) {
    case 'daily':
      date = clone(today)
      for (let i = 14; i > 0; i--) {
        result.push({
          text: format(date, 'MM-dd'),
          start: date.getTime(),
          end: addDay(date).getTime(),
        })
        subDays(date, 2)
      }
      break
    case 'weekly':
      date = subDays(clone(today), today.getDay())
      for (let i = 14; i > 0; i--) {
        const weekend = addDays(clone(date), 7)
        result.push({
          text: `${format(date, 'yyyy MM/dd')} - ${format(weekend, 'MM/dd')}`,
          start: date.getTime(),
          end: weekend.getTime(),
        })
        subDays(date, 7)
      }
      break
    case 'monthly':
      date = getMonthStart(today)
      for (let i = 12; i > 0; i--) {
        result.push({
          text: format(date, 'yyyy-MM'),
          start: date.getTime(),
          end: addMonth(date).getTime(),
        })
        subMonths(date, 2)
      }
      break
    case 'yearly':
      date = newDate(format(today, 'yyyy-01-01 00:00:00'))
      for (let i = 7; i > 0; i--) {
        result.push({
          text: format(date, 'yyyy'),
          start: date.getTime(),
          end: addYear(date).getTime(),
        })
        subYears(date, 2)
      }
      break
  }
  result.reverse()
  return result
}

function getScores(state) {
  const { type, dateType } = state
  let infos
  if (type === 'driver') {
    infos = state.driverInfos.filter(item => item.driver_id === state.driver)
  } else if (type === 'vehicle') {
    infos = state.vehicleInfos.filter(item => item.vrm_id === state.vehicle)
  }
  const result = getDates(dateType)
  result.forEach(item => {
    item.score = infos
    .filter(v => item.start <= v.start_date && v.start_date < item.end)
    .reduce((a, b) => a + b.total_score, 0)
  })
  return result
}

const md = 'driverVehicleProfile' // vuex module name

export default {
  // components:
  data() {
    return {
      safetyScoreHistoryChartID: this._uid + 'safetyScoreHistory',
      // driverInfo: {},
      // vehicleInfo: {},
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
      this.renderSafetyScoreHistoryChart()
    },
    'state.dateType'() {
      this.renderSafetyScoreHistoryChart()
    },
    'state.driver'() {
      this.renderSafetyScoreHistoryChart()
    },
    'state.vehicle'() {
      this.renderSafetyScoreHistoryChart()
    },
  },
  methods: {
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

        const scores = getScores(this.state)
        this.safetyScoreHistoryChart = new Chartist.Bar(ctx, {
          labels: scores.map(v => v.text),
          series: scores.map(v => v.score)
        },
          {
            distributeSeries: true
          }
        )
      })
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
