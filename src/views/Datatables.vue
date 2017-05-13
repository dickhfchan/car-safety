<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <h2 v-if="modified" class="md-title">{{datatables[current].text}} - <small class="unsaved">Unsaved</small></h2>
      <md-input-container v-else md-inline class="datatables-select">
        <md-select name="datatableSelect" v-model="current">
          <md-option :value="dt.name" v-for="dt in datatables">{{dt.text}}</md-option>
        </md-select>
      </md-input-container>

      <Paginator :source="rows" :page-size="pageSize">
          <template scope="page">
            <datatable
                :source="page.data"
                :editable="true"
                :line-numbers="false"
                :filterable="false"
                class="datatables-table"
                >
                <datatable-column
                    v-for="column in datatables[current].columns"
                    :key="column.name"
                    v-if="column.visible"
                    :id="column.name"
                    :label="column.text"
                    :width="column.width"
                    :sortable="column.sortable"
                    :groupable="column.groupable"
                    :formatter="column.formatter">
                </datatable-column>
                <datatable-column id="actions" label="Actions" width="100px"  :sortable="false" :groupable="false"></datatable-column>
                <template slot="actions" scope="cell">
                  <md-button class="md-icon-button md-accent md-dense" @click.native="remove(cell.row)">
                    <md-icon>remove_circle</md-icon>
                    <md-tooltip md-direction="bottom">Remove</md-tooltip>
                  </md-button>
                </template>
            </datatable>
          </template>
      </Paginator>

      <div class="card-buttons">
        <template v-if="modified">
          <md-button class="md-icon-button" @click.native="discard()">
            <md-icon>clear</md-icon>
            <md-tooltip md-direction="bottom">Discard</md-tooltip>
          </md-button>
          <md-button class="md-icon-button" @click.native="save()">
            <md-icon>check</md-icon>
            <md-tooltip md-direction="bottom">Save</md-tooltip>
          </md-button>
        </template>
        <md-button class="md-icon-button" @click.native="add()">
          <md-icon>add</md-icon>
          <md-tooltip md-direction="bottom">New</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click.native="discard()">
          <md-icon>refresh</md-icon>
          <md-tooltip md-direction="bottom">Refresh</md-tooltip>
        </md-button>
        <fullscreen-button></fullscreen-button>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
import { Datatable, DatatableColumn } from '@/components/datatable'
import Paginator from '../../node_modules/vuetiful/src/components/paginator/paginator.vue'
import { retry, titleCase } from 'helper-js'
import { format } from 'date-functions'
import { initColumns, generateExcel } from '../utils.js'

export default {
  components: { Datatable, DatatableColumn, Paginator },
  data() {
    return {
      datatables: {
        'company': {
          'columns': [
            {
              'name': 'company_code'
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'company_key'
            },
            {
              'name': 'company_name'
            },
            {
              'name': 'contact_name'
            },
            {
              'name': 'contact_phone_no'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'status'
            },
            {
              'name': 'timezone'
            },
            {
              'name': 'version'
            }
          ]
        },
        'driver': {
          'columns': [
            {
              'name': 'company_id'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'dob'
            },
            {
              'name': 'driver_code'
            },
            {
              'name': 'driver_id'
            },
            {
              'name': 'is_default'
            },
            {
              'name': 'name'
            },
            {
              'name': 'phone_home'
            },
            {
              'name': 'phone_mobile'
            },
            {
              'name': 'phone_office'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version'
            }
          ]
        },
        driver_group: {
          columns: [
            {
              'name': 'company_id'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'drv_grp_id'
            },
            {
              'name': 'grp_alias'
            },
            {
              'name': 'grp_descpt'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version'
            }
          ],
        },
        'driver_group_dtl': {
          'columns': [
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'driver_id'
            },
            {
              'name': 'drv_grp_dtl_id'
            },
            {
              'name': 'drv_grp_id'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version'
            }
          ]
        },
        mob_device: {
          columns: [
            {
              'name': 'active_end_date'
            },
            {
              'name': 'active_start_date'
            },
            {
              'name': 'apps_id'
            },
            {
              'name': 'apps_timezone'
            },
            {
              'name': 'apps_ts'
            },
            {
              'name': 'apps_ver_no'
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'last_access_ts'
            },
            {
              'name': 'last_loc_update_ts'
            },
            {
              'name': 'lat'
            },
            {
              'name': 'lng'
            },
            {
              'name': 'md_id'
            },
            {
              'name': 'md_sn'
            },
            {
              'name': 'status'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version'
            },
            {
              'name': 'vrm_id'
            }
          ]
        },
        'user_account': {
          'columns': [
            {
              'name': 'company_id'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'fullname'
            },
            {
              'name': 'group_id'
            },
            {
              'name': 'lang'
            },
            {
              'name': 'last_login_ts'
            },
            {
              'name': 'password'
            },
            {
              'name': 'retry_count'
            },
            {
              'name': 'status'
            },
            {
              'name': 'user_id'
            },
            {
              'name': 'username'
            },
            {
              'name': 'version'
            }
          ]
        },
        'user_group': {
          'columns': [
            {
              'name': 'company_id'
            },
            {
              'name': 'group_id'
            },
            {
              'name': 'group_name'
            }
          ]
        },
        'user_group_func': {
          'columns': [
            {
              'name': 'func_code'
            },
            {
              'name': 'group_func_id'
            },
            {
              'name': 'group_id'
            }
          ]
        },
        users: {
          columns: [
            {
              'name': 'company'
            },
            {
              'name': 'def_lang'
            },
            {
              'name': 'def_map'
            },
            {
              'name': 'first_name'
            },
            {
              'name': 'id'
            },
            {
              'name': 'last_name'
            },
            {
              'name': 'login_name'
            },
            {
              'name': 'password'
            }
          ]
        },
        'vehicle': {
          'columns': [
            {
              'name': 'brand'
            },
            {
              'name': 'company_id'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'fuel_usage'
            },
            {
              'name': 'idle_duration_non-trf'
            },
            {
              'name': 'idle_duration_trf'
            },
            {
              'name': 'latest_trip_distance'
            },
            {
              'name': 'latest_trip_duration'
            },
            {
              'name': 'model'
            },
            {
              'name': 'run_distance'
            },
            {
              'name': 'run_duration'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'vehicle_id'
            },
            {
              'name': 'version'
            },
            {
              'name': 'year'
            }
          ]
        },
        'veh_reg_mark': {
          'columns': [
            {
              'name': 'company_id'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'def_drv_id'
            },
            {
              'name': 'status'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'vehicle_id'
            },
            {
              'name': 'version'
            },
            {
              'name': 'vrm_id'
            },
            {
              'name': 'vrm_mark_code'
            }
          ]
        },
        'veh_reg_mark_group': {
          'columns': [
            {
              'name': 'company_id'
            },
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'grp_alias'
            },
            {
              'name': 'grp_descpt'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version'
            },
            {
              'name': 'vrm_grp_id'
            }
          ]
        },
        'veh_reg_mark_group_dtl': {
          'columns': [
            {
              'name': 'create_ts'
            },
            {
              'name': 'create_user'
            },
            {
              'name': 'update_ts'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version'
            },
            {
              'name': 'vrm_grp_dtl_id'
            },
            {
              'name': 'vrm_grp_id'
            },
            {
              'name': 'vrm_id'
            }
          ]
        },
        'warning_type': {
          'columns': [
            {
              'name': 'warn_type_code'
            },
            {
              'name': 'warn_type_id'
            }
          ]
        }
      },
      rows: [],
      pageSize: 20,
      current: 'company',
      modified: false,
      newRow: null,
      _beforeunloadListenning: false,
      leaveConfirm: 'Data have been modified. Do you want to save before you continue?',
    }
  },
  computed: {
  },
  watch: {
    current: {
      immediate: true,
      handler(val, oldVal) {
        this.rows = []
        this.getData()
      }
    },
    rows: {
      deep: true,
      handler(val, oldVal) {
        if (val === oldVal) {
          this.modified = true
          if (!this._beforeunloadListenning) {
            this.listenBeforeunload()
          }
        }
      }
    }
  },
  created() {
    //
    for (const key in this.datatables) {
      const dt = this.datatables[key]
      if (!dt.name) {
        this.$set(dt, 'name', key)
      }
      if (!dt.text) {
        this.$set(dt, 'text', titleCase(dt.name))
      }
      initColumns(this, dt.columns)
    }
  },
  beforeDestroy() {
    this.unlistenBeforeunload()
  },
  beforeRouteLeave(to, from, next) {
    if (this.modified) {
      this.$confirm(this.leaveConfirm).then(() => {
        this.save()
      }).catch(e => {
        if (e.message === 'cancel') {
          this.discard()
          next()
        } else {
          throw e
        }
      })
    } else {
      next()
    }
  },
  methods: {
    getData(table) {
      retry(() => this.$http.get(`dao/${this.current}`))()
      .then(({data}) => {
        this.rows = data.JSON
      }).catch((e) => {
        this.$alert('load data failed')
        throw e
      })
    },
    add() {
      if (!this.newRow) {
        const newRow = {}
        this.datatables[this.current].columns.forEach(col => {
          newRow[col.name] = null
        })
        this.rows.splice(0, 0, newRow)
        this.newRow = newRow
        console.log(this)
      }
    },
    remove(row) {
      this.$confirm('Are you sure to remove specified item?').then(() => {
        console.log(row)
      }).catch(e => {
        if (e.message !== 'cancel') {
          throw e
        }
      })
    },
    save() {
      // this.modified = false
      // this.newRow = null
    },
    discard() {
      this.modified = false
      this.unlistenBeforeunload()
      this.getData()
    },
    saved() {
      this.modified = true
      this.unlistenBeforeunload()
    },
    beforeunload(e) {
      var confirmationMessage = this.leaveConfirm
      e.returnValue = confirmationMessage     // Gecko, Trident, Chrome 34+
      return confirmationMessage              // Gecko, WebKit, Chrome <34
    },
    listenBeforeunload() {
      this._beforeunloadListenning = true
      window.addEventListener('beforeunload', this.beforeunload)
    },
    unlistenBeforeunload() {
      this._beforeunloadListenning = false
      window.removeEventListener('beforeunload', this.beforeunload)
    }
  }
}
</script>
<style lang="scss">
.datatables-select{
  width: auto;
  display: inline-flex;
  margin: 0;
  padding: 0;
  height: 41px;
  min-height: initial;
  padding-left: 5px;
  align-items: center;
  .md-select-value{
    font-size: 20px;
  }
}
.datatables-table{
  &.table-wrapper{
    border: none;
  }
}
.unsaved{
  color: #565656;
}
</style>
