<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <md-input-container md-inline class="datatables-select">
        <label for="datatableSelect">Movie</label>
        <md-select name="datatableSelect" id="datatableSelect" v-model="current">
          <md-option :value="dt.name" v-for="dt in datatables">{{dt.text}}</md-option>
        </md-select>
      </md-input-container>
      <Paginator :source="rows" :page-size="pageSize">
          <template scope="page">
            <datatable
                :source="page.data"
                :editable="false"
                :line-numbers="true"
                :filterable="false"
                class="datatables-table"
                >
                <datatable-column
                    v-for="column in datatables[current].columns"
                    v-if="column.visible"
                    :id="column.name"
                    :label="column.text"
                    :width="column.width"
                    :sortable="column.sortable"
                    :groupable="column.groupable"
                    :formatter="column.formatter">
                </datatable-column>
            </datatable>
          </template>
      </Paginator>

      <div class="card-buttons">
        <md-button class="md-icon-button" @click.native="getData()">
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
    }
  },
  computed: {
  },
  watch: {
    current: {
      immediate: true,
      handler() {
        this.rows = []
        this.getData()
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
  methods: {
    getData(table) {
      retry(() => this.$http.get(`dao/${this.current}`))()
      .then(({data}) => {
        this.rows = data.JSON
      }).catch((e) => {
        this.$alert('load data failed')
        throw e
      })
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
</style>
