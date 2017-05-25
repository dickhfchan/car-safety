<template>
  <div class="">
    <md-card  class="m-a card-1">
      <md-card-content>
        <h2 class="md-title">{{$t('totalScoreAndAlertCountPer100KM')}}</h2>

        <div class="relative overflow-hidden-y">
          <md-table @select="" @sort="onSort($event, rows1, columns1)">
           <md-table-header>
             <md-table-row>
               <md-table-head v-for="col in columns1" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
             </md-table-row>
           </md-table-header>

           <md-table-body>
             <md-table-row v-for="row in rows1" v-if="row.visible" :key="row.vrm_grp_id" :md-item="row">
               <md-table-cell v-for="col in columns1" v-if="col.visible" :key="col.name">
                 {{ row[col.name] }}
               </md-table-cell>
             </md-table-row>
           </md-table-body>
         </md-table>

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
          <md-table @select="" @sort="onSort($event, rows1Ranking, columns1)">
           <md-table-header>
             <md-table-row>
               <md-table-head v-for="col in columns1" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
             </md-table-row>
           </md-table-header>

           <md-table-body>
             <md-table-row v-for="row in rows1Ranking" v-if="row.visible" :key="row.vrm_grp_id" :md-item="row">
               <md-table-cell v-for="(col, index) in columns1" v-if="col.visible" :key="col.name" :class="index > 1 && 'rank' + row[col.name]">
                 {{ row[col.name] }}
               </md-table-cell>
             </md-table-row>
           </md-table-body>
         </md-table>

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
import { initColumns, initRows, sortRows, generateExcel } from '../utils.js'

export default {
  components: {},
  data() {
    return {
      columns1: [
        {
          'name': 'name',
          text: this.$t('driverName'),
        },
        {
          'name': '車牌',
          visible: false,
        },
        {
          name: 'total_score',
          text: this.$t('totalScore')
        },
        {
          name: 'hmw',
          text: this.$t('hmw')
        },
        {
          name: 'pcw',
          text: this.$t('pcw')
        },
        {
          name: 'fcw',
          text: this.$t('fcw')
        },
        {
          name: 'ufcw',
          text: this.$t('ufcw')
        },
        {
          name: 'lldw',
          text: this.$t('lldw')
        },
        {
          name: 'rldw',
          text: this.$t('rldw')
        },
        {
          name: 'aaw',
          text: this.$t('aaw')
        },
        {
          name: 'abw',
          text: this.$t('abw')
        }
      ],
      rows1: [],
      rows1Ranking: [],
      loading: false,
    }
  },
  computed: {
    dateRange() { return this.$store.state.dateRangeInD2 }
  },
  watch: {
    dateRange: {
      deep: true,
      handler() { this.getData() }
    }
  },
  created() {
    //
    initColumns(this, this.columns1)
    this.getData()
  },
  methods: {
    getData() {
      const dateRange = this.dateRange
      const start = new Date(`${dateRange[0]} 00:00:00`).getTime()
      const end = new Date(`${dateRange[1]} 23:59:59`).getTime()
      this.loading = true
      retry(() => this.$http.get('dao/avg_warning_drv_name'))()
      .then(({data}) => {
        this.loading = false
        this.rows1 = data.JSON
        .filter(row => start <= row.start_date && row.start_date <= end)
        .filter(row => row.company_id === this.$store.state.user.company_id)
        // compute hmw
        this.rows1.forEach(row => {
          row.hmw = row.hmw_h + row.hmw_m + row.hmw_l
        })
        // get ranking
        this.rows1Ranking = this.rows1.map(row => Object.assign({}, row)) // clone
        initRows(this, this.rows1, this.columns1)
        initRows(this, this.rows1Ranking, this.columns1)
        this.columns1.forEach((col, i) => {
          if (i > 1) {
            const ranking = this.rows1Ranking.slice(0)
            ranking.sort((a, b) => a[col.name] - b[col.name])
            ranking.reverse()
            let prev = -1
            let rank = 0
            ranking.forEach(row => {
              const cell = parseFloat(row[col.name])
              if (cell !== prev) {
                rank++
              }
              row[col.name] = rank > 20 ? 20 : rank
              prev = cell
            })
          }
        })
      }).catch((e) => {
        this.loading = false
        this.$alert('load failed')
        throw e
      })
    },
    onSort(e, rows, columns) {
      sortRows(e, rows, columns)
    },
    exportExcel(rows, columns, title) {
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
  }
}
</script>
<style lang="scss">
.md-table-cell, .md-table tbody .md-table-row:hover .md-table-cell{
  $total : 20;
  $half : $total / 2;
  $unit : 255 / $half;
  @for $i from 1 through $total{
    &.rank#{$i}{
      @if $i <= $half {
        $red : ($i - 1) * $unit;
        $green: 255;
        background-color: rgb($red, $green, 30);
      }
      @else {
        $red : 255;
        $green: 255 - ($i - 10) * $unit;
        background-color: rgb($red, $green, 30);
      }
    }
  }
}
</style>
