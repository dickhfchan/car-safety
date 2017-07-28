<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <h2 class="md-title">{{$t('analysisGroup')}}</h2>

      <div class="relative overflow-hidden-y">
        <Data-Table :rows="rows" :columns="columns" sortBy="vrm_grp_id" sortType="asc" :pagination="true"></Data-Table>

        <div class="absolute-backdrop center-wrapper" v-show="loading">
          <md-spinner md-indeterminate></md-spinner>
        </div>
      </div>

      <div class="card-buttons">
        <md-switch class="md-primary" v-model="scoreColumnVisible">{{$t('scoreColumn')}}</md-switch>
        <md-button class="md-icon-button" @click.native="exportExcel">
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
</template>
<script>
import DataTable from '../components/DataTable.vue'
import { retry } from 'helper-js'
import { format } from 'date-functions'
import { generateExcel } from '../utils.js'

export default {
  components: { DataTable },
  data() {
    return {
      title: this.$t('dataListByGroup'),
      columns: [
        { name: 'vrm_grp_id', text: this.$t('vrmGrpId') },
        { name: 'total_score', text: this.$t('totalScore') },
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
        { name: 'drv_distance', text: this.$t('drvDistance'),

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
        {
          name: 'start_date',
          text: this.$t('startDate'),
          valueProcessor: ({value}) => format(new Date(value), 'MM-dd HH:mm')
        },
        { name: 'end_date',
          text: this.$t('endDate'),
          valueProcessor: ({value}) => format(new Date(value), 'MM-dd HH:mm')
        },
        { name: 'type', text: this.$t('type') },
        { name: 'avg_warn_id', text: this.$t('avgWarnId') },
      ],
      rows: [],
      cache: {
        scoreColumnVisible: false,
      }
    }
  },
  computed: {
    scoreColumnVisible: {
      get() { return this.cache.scoreColumnVisible },
      set() {
        this.cache.scoreColumnVisible = !this.cache.scoreColumnVisible
        this.columns.forEach(col => {
          if (col.name.indexOf('_score') > -1) {
            col.visible = this.scoreColumnVisible
          }
        })
      }
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
      retry(() => this.$http.get('dao/v_avg_warning_vrm_grp_co'))()
      .then(({data}) => {
        this.rows = data.JSON.filter(row => row.company_id === this.$store.state.user.company_id)
        this.loading = false
      }).catch((e) => {
        this.loading = false
        this.$alert(this.$t('loadFailed'))
        throw e
      })
    },
    exportExcel() {
      const cols = this.columns
      const data = this.rows.map(row => {
        const r = []
        cols.forEach(col => {
          const val = row[col.name]
          r.push(col.formatter ? col.formatter(val) : val)
        })
        return r
      })
      const titleLabels = cols.map(col => col.text)
      generateExcel(data, this.$t('loadFailed'), titleLabels)
    }
  }
}
</script>
<style lang="scss">
</style>
