<template>
  <md-card  class="m-a card-1">
    <md-card-content>
      <md-input-container md-inline class="datatables-select">
        <md-select name="datatableSelect" v-model="current">
          <md-option :value="dt.name" v-for="dt in datatables" :key="dt.name">{{dt.text}}</md-option>
        </md-select>
      </md-input-container>

      <div class="relative overflow-hidden-y">

        <md-table @select="" @sort="onSort">
         <md-table-header>
           <md-table-row>
             <md-table-head>Actions</md-table-head>
             <md-table-head v-for="col in currentColumns" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
           </md-table-row>
         </md-table-header>

         <md-table-body>
           <md-table-row v-for="row in rows" v-show="row.visible" :key="row.avg_warn_id" :md-item="row">
             <md-table-cell class="datatables-actions">
               <md-button class="md-icon-button md-primary md-dense" @click.native="edit(row)">
                 <md-icon>edit</md-icon>
                 <md-tooltip md-direction="bottom">Edit</md-tooltip>
               </md-button>
               <md-button class="md-icon-button md-accent md-dense" @click.native="remove(row)">
                 <md-icon>remove_circle</md-icon>
                 <md-tooltip md-direction="bottom">Remove</md-tooltip>
               </md-button>
             </md-table-cell>
             <md-table-cell v-for="col in currentColumns" v-if="col.visible" :key="col.name">
               {{row[col.name]}}
             </md-table-cell>
           </md-table-row>
         </md-table-body>
       </md-table>

       <Datatable-Footer :rows="rows"></Datatable-Footer>


        <div class="absolute-backdrop center-wrapper" v-show="loading">
          <md-spinner md-indeterminate></md-spinner>
        </div>
      </div>

      <div class="card-buttons">
        <md-button id="addItem" class="md-icon-button" @click.native="add()">
          <md-icon>add</md-icon>
          <md-tooltip md-direction="bottom">New</md-tooltip>
        </md-button>
        <md-button class="md-icon-button" @click.native="getData()">
          <md-icon>refresh</md-icon>
          <md-tooltip md-direction="bottom">{{$t('refresh')}}</md-tooltip>
        </md-button>
        <fullscreen-button></fullscreen-button>
      </div>

      <md-dialog md-open-from="#addItem" md-close-to="#addItem" ref="dialogAdd"  :md-click-outside-to-close="false" :md-esc-to-close="false">
        <md-dialog-title>New Item</md-dialog-title>
        <md-dialog-content>
          <form novalidate @submit.stop.prevent="saveNew()">
            <md-layout :md-gutter="16">
              <md-layout md-flex-xsmall="100" md-flex-medium="50" md-flex-large="33" v-for="field in currentColumns" :key="field.name">
                <md-input-container>
                  <label>{{field.text}}</label>
                  <md-input v-model="newRow[field.name]"></md-input>
                </md-input-container>
              </md-layout>
            </md-layout>
            <div class="flex">
              <div class="flex-1"></div>
              <md-button class="md-primary" @click.native="closeDialogAdd()">Cancel</md-button>
              <md-button class="md-primary" type="submit">Save</md-button>
            </div>
          </form>
        </md-dialog-content>
      </md-dialog>

      <md-dialog ref="dialogEdit" :md-click-outside-to-close="false" :md-esc-to-close="false">
        <md-dialog-title>Edit Item</md-dialog-title>
        <md-dialog-content>
          <form novalidate @submit.stop.prevent="saveEditing()">
            <md-layout :md-gutter="16">
              <md-layout md-flex-xsmall="100" md-flex-medium="50" md-flex-large="33" v-for="field in currentColumns" :key="field.name">
                <md-input-container>
                  <label>{{field.text}}</label>
                  <md-input v-model="editingRow[field.name]"></md-input>
                </md-input-container>
              </md-layout>
            </md-layout>
            <div class="flex">
              <div class="flex-1"></div>
              <md-button class="md-primary" @click.native="closeDialogEdit()">Cancel</md-button>
              <md-button class="md-primary" type="submit">Save</md-button>
            </div>
          </form>
        </md-dialog-content>
      </md-dialog>

    </md-card-content>
  </md-card>
</template>
<script>
import DatatableFooter from '../components/DatatableFooter.vue'
import { retry, titleCase } from 'helper-js'
// import { format } from 'date-functions'
import { initColumns, initRows, getRowData, sortRows, axiosAutoProxy, beforeSave } from '../utils.js'

export default {
  components: { DatatableFooter },
  data() {
    return {
      title: this.$t('settings'),
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
      current: 'company',
      loading: false,
      newRow: {},
      editingRow: {},
    }
  },
  computed: {
    currentColumns() { return this.datatables[this.current].columns },
    api() { return `dao/${this.current}` }
  },
  watch: {
    current: {
      immediate: true,
      handler(val, oldVal) {
        this.rows = []
        this.getData()
      }
    },
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
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    getData(table) {
      this.loading = true
      retry(() => this.$http.get(this.api))()
      .then(({data}) => {
        this.rows = data.JSON
        initRows(this, this.rows, this.currentColumns)
        this.loading = false
      }).catch((e) => {
        this.loading = false
        this.$alert('load data failed')
        throw e
      })
    },
    onSort(e) { sortRows(e, this.rows, this.currentColumns) },
    add() {
      const newRow = {}
      this.currentColumns.forEach(col => { newRow[col.name] = null })
      this.newRow = newRow
      this.$refs.dialogAdd.open()
    },
    saveNew() {
      axiosAutoProxy(this.$http, this.api, 'post', beforeSave(this.newRow)).then(({data}) => {
        if (data === 'error') {
          this.$alert('Save Failed')
        } else if (data.toLowerCase().indexOf('succe') === -1) {
          this.$alert(data)
        } else {
          this.$alert(data)
          this.getData()
          this.$refs.dialogAdd.close()
        }
      })
    },
    closeDialogAdd() {
      this.newRow = {}
      this.$refs.dialogAdd.close()
    },
    edit(row) {
      this.editingRow = getRowData(row)
      this.$refs.dialogEdit.open()
    },
    saveEditing() {
      axiosAutoProxy(this.$http, this.api, 'post', beforeSave(this.editingRow)).then(({data}) => {
        if (data === 'error') {
          this.$alert('Save Failed')
        } else if (data.toLowerCase().indexOf('succe') === -1) {
          this.$alert(data)
        } else {
          this.$alert(data)
          this.getData()
          this.$refs.dialogEdit.close()
        }
      })
    },
    closeDialogEdit() {
      this.editingRow = {}
      this.$refs.dialogEdit.close()
    },
    remove(row) {
      this.$confirm('Are you sure to remove specified item?').then(() => {
        axiosAutoProxy(this.$http, this.api, 'delete', row).then(({data}) => {
          if (data === 'error') {
            this.$alert('Remove Failed')
          } else if (data.toLowerCase().indexOf('succe') === -1) {
            this.$alert(data)
          } else {
            this.$alert(data)
            this.getData()
          }
        })
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
    saved() {
    },
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
.datatables-actions .md-table-cell-container{
  padding-left: 12px!important;
}
</style>
