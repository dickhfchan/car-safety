<template>
  <div class="">
    <md-card  class="m-a card-1">
      <md-card-content>
        <h2 class="md-title">{{$t('totalScoreAndAlertCountPer100KM')}}</h2>

        <div class="relative overflow-hidden-y">
          <Data-Table :rows="rows1" :columns="columns1" sortBy="name" sortType="asc"></Data-Table>

          <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div>
        </div>

        <div class="card-buttons">
          <md-button class="md-icon-button" @click.native="exportExcel(rows1, columns1, $t('totalScoreAndAlertCountPer100KM'))">
            <md-icon>get_app</md-icon>
            <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="getData()">
            <md-icon>refresh</md-icon>
            <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
          </md-button>
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>

    <md-card  class="m-x m-b card-1">
      <md-card-content>
        <h2 class="md-title">{{$t('ranking')}}</h2>

        <div class="relative overflow-hidden-y">
          <D2-Data-Table :d2="self" :rows="rows1Ranking" :columns="columns1" sortBy="name" sortType="asc"></D2-Data-Table>

          <div class="absolute-backdrop center-wrapper" v-show="loading">
            <md-spinner md-indeterminate></md-spinner>
          </div>
        </div>

        <div class="card-buttons">
          <md-button class="md-icon-button" @click.native="exportExcel(rows1Ranking, columns1, '排名圖')">
            <md-icon>get_app</md-icon>
            <md-tooltip md-direction="bottom">{{$t('export')}}</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="getData()">
            <md-icon>refresh</md-icon>
            <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
          </md-button>
          <fullscreen-button></fullscreen-button>
        </div>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
import { retry } from 'helper-js'
import { exportExcel, newDate, getRankColor, getRanks } from '../utils.js'
import DataTable from '../components/DataTable.vue'
import D2DataTable from '../components/D2DataTable.vue'

function GetRound(num, len) {
  return Math.round(num * Math.pow(10, len)) / Math.pow(10, len)
}

const notScoreCols = ['name', '車牌']

export default {
  components: { DataTable, D2DataTable },
  data() {
    return {
      self: this,
      title: this.$t('totalScoreAndAlert'),
      columns1: [
        {
          'name': 'name',
          text: this.$t('driverName'),
          locale: true,
        },
        {
          'name': '車牌',
          visible: false,
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
          visible: false,
        },
      ],
      originRow1: [],
      rows1: [],
      rows1Ranking: [],
      loading: false,
    }
  },
  computed: {
    dateRange() { return this.$store.state.dateRangeInD2 }
  },
  watch: {
    originRow1() { this.resolveData() },
    dateRange: {
      deep: true,
      handler() { this.resolveData() }
    }
  },
  created() {
    //
    this.getData()
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    getData() {
      this.loading = true
      retry(() => this.$http.get('dao/avg_warning_drv_name'))()
      .then(({data}) => {
        this.loading = false
        const rows = data.JSON
        .filter(row => row.company_id === this.$store.state.user.company_id)
        // compute hmw
        rows.forEach(row => {
          row.hmw = row.hmw_h + row.hmw_m + row.hmw_l
        })
        this.originRow1 = rows
      }).catch((e) => {
        this.loading = false
        this.$alert('load failed')
        throw e
      })
    },
    resolveData() {
      const dateRange = this.dateRange
      const start = newDate(`${dateRange[0]} 00:00:00`).getTime()
      const end = newDate(`${dateRange[1]} 23:59:59`).getTime()

      const filteredRows = this.originRow1
        .filter(row => start <= row.start_date && row.start_date <= end)
        // group by driver name
      const groupedRows = []
      const toAggregrate = this.columns1.filter(col => notScoreCols.indexOf(col.name) === -1).map(col => col.name)
      filteredRows.forEach(row => {
        let row0 = groupedRows.find(v => v.name === row.name)
        if (!row0) {
          row0 = Object.assign({ _count: 0 }, row)
          groupedRows.push(row0)
        } else {
          toAggregrate.forEach(field => {
            row0[field] = (row0[field] || 0) + (row[field] || 0)
          })
        }
        row0._count++
      })
        // average
      groupedRows.forEach(row => {
        toAggregrate.forEach(field => {
          row[field] = GetRound(row[field] / row._count, 1)
        })
      })
        // foramt count columns
      groupedRows.forEach(row => {
        this.columns1.slice(2).filter(col => col.name !== 'drv_distance').forEach(col => {
          row[col.name] = Math.round(((row[col.name] || 0) / (row.drv_distance / 100)) * 100000)
        })
        row.drv_distance = Math.round(row.drv_distance / 100000)
      })
      this.rows1 = groupedRows
        // get ranking

      this.rows1Ranking = this.rows1.map(row => Object.assign({}, row)) // clone
      this.columns1.forEach(col => {
        if (notScoreCols.indexOf(col.name) > -1) {
          return
        }
        const oneCol = this.rows1Ranking.map(row => row[col.name])
        const ranks = getRanks(oneCol, col.name === 'total_score' ? 'desc' : 'asc')
        this.rows1Ranking.forEach((row, i) => {
          row[col.name] = ranks[i]
        })
      })
    },
    getRankColor,
    getColorStyle(rows, row, col, order = 'asc') {
      if (notScoreCols.indexOf(col.name) === -1) {
        const max = Math.max(...rows.map(row => row[col.name]))
        const color = this.getRankColor(row[col.name], max, order)
        return { backgroundColor: color }
      }
    },
    exportExcel,
  }
}
</script>
<style lang="scss">
</style>
