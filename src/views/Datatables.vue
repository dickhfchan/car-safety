<template>
  <md-card  class="m-a card-1 datatables">
    <md-card-content>
      <div class="card-title-wrapper">
        <div class="datatables-select-wrapper">
          <md-select name="datatableSelect" v-model="current" class="datatables-select inline-md">
            <md-option :value="dt.name" v-for="dt in datatables" :key="dt.name">{{dt.text}}</md-option>
          </md-select>
        </div>
        <div class="filters">
          <div class="company-filter" v-if="companyDropDownVisible">
            <label class="m-l grey">{{$t('company')}}:</label>
            <md-select class="m-l-sm inline-md company-select" v-model="company" disabled>
              <md-option :value="null">{{$t('all')}}</md-option>
              <md-option v-for="cpn in companies" :key="cpn.company_id" :value="cpn.company_id">{{cpn.company_name}}</md-option>
            </md-select>
          </div>
        </div>
      </div>

      <div class="relative overflow-hidden-y">

        <md-table @select="" @sort="onSort">
         <md-table-header>
           <md-table-row>
             <md-table-head>Actions</md-table-head>
             <md-table-head v-for="col in currentColumns" v-if="col.visible" :md-sort-by="col.name" :key="col.name">{{col.text}}</md-table-head>
           </md-table-row>
         </md-table-header>

         <md-table-body>
           <md-table-row v-for="row in filteredRows" v-show="row.visible" :key="row.avg_warn_id" :md-item="row">
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

       <Datatable-Footer :rows="filteredRows"></Datatable-Footer>


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
              <md-layout md-flex-xsmall="100" md-flex-medium="50" md-flex-large="33" v-for="field in currentColumns" :key="field.name" v-if="field.addVisible">
                <md-input-container>
                  <label>{{field.text}}</label>
                  <md-input v-model="newRow[field.name]" :disabled="field.addDisabled"></md-input>
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
              <md-layout md-flex-xsmall="100" md-flex-medium="50" md-flex-large="33" v-for="field in currentColumns" :key="field.name" v-if="field.editVisible">
                <md-input-container>
                  <label>{{field.text}}</label>
                  <md-input v-model="editingRow[field.name]" :disabled="field.editDisabled"></md-input>
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
import Vue from 'vue'
import DatatableFooter from '../components/DatatableFooter.vue'
import { titleCase } from 'helper-js'
import { initColumns, initRows, getRowData, sortRows, axiosAutoProxy, beforeSave } from '../utils.js'

export default {
  components: { DatatableFooter },
  data() {
    return {
      title: this.$t('settings'),
      company: this.$store.state.user.company_id,
      datatables: {
        // 'company': {
        //   'columns': [
        //     {
        //       'name': 'company_code'
        //     },
        //     {
        //       'name': 'company_id'
        //     },
        //     {
        //       'name': 'company_key'
        //     },
        //     {
        //       'name': 'company_name'
        //     },
        //     {
        //       'name': 'contact_name'
        //     },
        //     {
        //       'name': 'contact_phone_no'
        //     },
        //     {
        //       'name': 'status'
        //     },
        //     {
        //       'name': 'timezone'
        //     },
        //     {
        //       'name': 'version',
        //       'visible': false
        //     }
        //   ]
        // },
        'driver': {
          'columns': [
            {
              'name': 'company_id'
            },
            {
              'name': 'create_user',
              visible: false,
              addVisible: false,
              editVisible: false,
            },
            {
              'name': 'dob'
            },
            {
              'name': 'driver_code'
            },
            {
              'name': 'driver_id',
              addVisible: false,
              editDisabled: true,
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
              'name': 'update_user',
              visible: false,
            },
            {
              'name': 'version',
              visible: false,
            }
          ],
          oncreating(newRow) { delete newRow.driver_id },
        },
        'driver_group': {
          'columns': [
            {
              'name': 'company_id'
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
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            }
          ]
        },
        'driver_group_dtl': {
          'columns': [
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
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            }
          ]
        },
        // 'mob_device': {
        //   'columns': [
        //     {
        //       'name': 'active_end_date'
        //     },
        //     {
        //       'name': 'active_start_date'
        //     },
        //     {
        //       'name': 'apps_id'
        //     },
        //     {
        //       'name': 'apps_timezone'
        //     },
        //     {
        //       'name': 'apps_ts'
        //     },
        //     {
        //       'name': 'apps_ver_no'
        //     },
        //     {
        //       'name': 'company_id'
        //     },
        //     {
        //       'name': 'create_user'
        //     },
        //     {
        //       'name': 'last_access_ts'
        //     },
        //     {
        //       'name': 'last_loc_update_ts'
        //     },
        //     {
        //       'name': 'lat'
        //     },
        //     {
        //       'name': 'lng'
        //     },
        //     {
        //       'name': 'md_id'
        //     },
        //     {
        //       'name': 'md_sn'
        //     },
        //     {
        //       'name': 'status'
        //     },
        //     {
        //       'name': 'update_user'
        //     },
        //     {
        //       'name': 'version',
        //       'visible': false
        //     },
        //     {
        //       'name': 'vrm_id'
        //     }
        //   ]
        // },
        'user_account': {
          'columns': [
            {
              'name': 'company'
            },
            {
              'name': 'company_id'
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
              'name': 'map'
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
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
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
        // 'users': {
        //   'columns': [
        //     {
        //       'name': 'company'
        //     },
        //     {
        //       'name': 'def_lang'
        //     },
        //     {
        //       'name': 'def_map'
        //     },
        //     {
        //       'name': 'first_name'
        //     },
        //     {
        //       'name': 'id'
        //     },
        //     {
        //       'name': 'last_name'
        //     },
        //     {
        //       'name': 'login_name'
        //     },
        //     {
        //       'name': 'password'
        //     }
        //   ]
        // },
        // 'vehicle': {
        //   'columns': [
        //     {
        //       'name': 'brand',
        //     },
        //     {
        //       'name': 'company_id',
        //     },
        //     {
        //       'name': 'create_user',
        //     },
        //     {
        //       'name': 'fuel_usage',
        //     },
        //     {
        //       'name': 'idle_duration_non-trf',
        //     },
        //     {
        //       'name': 'idle_duration_trf',
        //     },
        //     {
        //       'name': 'latest_trip_distance',
        //     },
        //     {
        //       'name': 'latest_trip_duration',
        //     },
        //     {
        //       'name': 'model',
        //     },
        //     {
        //       'name': 'run_distance',
        //     },
        //     {
        //       'name': 'run_duration',
        //     },
        //     {
        //       'name': 'update_user',
        //     },
        //     {
        //       'name': 'vehicle_id',
        //     },
        //     {
        //       'name': 'year',
        //     },
        //     {
        //       'name': 'version',
        //       'visible': false
        //     },
        //   ],
        // },
        'veh_reg_mark': {
          'columns': [
            {
              'name': 'company_id'
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
              'name': 'update_user'
            },
            {
              'name': 'vehicle_id'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
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
              'name': 'create_user'
            },
            {
              'name': 'grp_alias'
            },
            {
              'name': 'grp_descpt'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
            },
            {
              'name': 'vrm_grp_id'
            }
          ]
        },
        'veh_reg_mark_group_dtl': {
          'columns': [
            {
              'name': 'create_user'
            },
            {
              'name': 'update_user'
            },
            {
              'name': 'version',
              'visible': false,
              addVisible: false,
              editVisible: false,
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
        // 'warning_type': {
        //   'columns': [
        //     {
        //       'name': 'warn_type_code',
        //     },
        //     {
        //       'name': 'warn_type_id',
        //     }
        //   ],
        // }
      },
      rows: [],
      current: 'driver',
      loading: false,
      newRow: {},
      editingRow: {},
    }
  },
  computed: {
    currentTable() { return this.datatables[this.current] },
    currentColumns() { return this.currentTable.columns },
    api() { return `dao/${this.current}` },
    companies() { return this.$store.state.companies },
    companyDropDownVisible() { return this.currentColumns.find(v => v.name === 'company_id') },
    filteredRows() {
      if (this.companyDropDownVisible && this.company != null) {
        return this.rows.filter(row => row.company_id === this.company)
      } else {
        return this.rows
      }
    },
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
    // set for datatable with company_id
    for (const key in this.datatables) {
      const dt = this.datatables[key]
      const colCompanyId = dt.columns.find(v => v.name === 'company_id')
      if (colCompanyId) {
        colCompanyId.addDisabled = true
        colCompanyId.editDisabled = true
        const oldC = dt.oncreating
        dt.oncreating = (data) => {
          data.company_id = this.$store.state.user.company_id
          oldC && oldC(data)
        }
      }
    }
    // init datatables
    for (const key in this.datatables) {
      const dt = this.datatables[key]
      if (!dt.name) {
        this.$set(dt, 'name', key)
      }
      if (!dt.text) {
        this.$set(dt, 'text', titleCase(dt.name))
      }
      dt.columns.forEach(col => {
        if (!col.hasOwnProperty('addVisible')) {
          this.$set(col, 'addVisible', true)
        }
        if (!col.hasOwnProperty('editVisible')) {
          this.$set(col, 'editVisible', true)
        }
      })
      initColumns(this, dt.columns)
    }
    // get datatables with columns
    // const dataTables = {}
    // for (const key in this.datatables) {
    //   // const dt = this.datatables[key]
    //   dataTables[key] = null
    //   this.$http.get('dao/' + key).then(({data}) => {
    //     if (data.JSON[0]) {
    //       dataTables[key] = Object.keys(data.JSON[0]).filter(v => v !== 'create_ts' && v !== 'update_ts')
    //       dataTables[key] = {
    //         columns: dataTables[key].map(v => {
    //           return { name: v }
    //         })
    //       }
    //     } else {
    //       dataTables[key] = this.datatables[key]
    //     }
    //     // if (dataTables[key].indexOf('version')) {
    //     //   console.log(key)
    //     // }
    //   })
    // }
    // window.dataTablesGot = () => {
    //   for (var k in dataTables) {
    //     dataTables[k].columns.forEach(v => {
    //       if (v.name === 'version') {
    //         v.visible = false
    //       }
    //     })
    //   }
    // }
    // window.dataTables = dataTables
  },
  mounted() {
    this.$nextTick(() => {
      document.title = this.title
    })
  },
  methods: {
    getData(table) {
      // cancel prev request
      if (this.cancelPrevgetDataRequest) {
        this.cancelPrevgetDataRequest()
        this.cancelPrevgetDataRequest = null
      }
      const CancelToken = Vue.Axios.CancelToken
      this.loading = true
      this.$http.get(this.api, {
        cancelToken: new CancelToken((c) => { this.cancelPrevgetDataRequest = c }),
      })
      .then(({data}) => {
        this.rows = data.JSON
        initRows(this, this.rows, this.currentColumns)
        this.loading = false
      }).catch((e) => {
        if (!e.__CANCEL__) {
          this.loading = false
          this.$alert('load data failed')
          throw e
        }
      })
    },
    onSort(e) { sortRows(e, this.rows, this.currentColumns) },
    add() {
      const newRow = {}
      this.currentColumns.forEach(col => { newRow[col.name] = null })
      this.currentTable.oncreating && this.currentTable.oncreating(newRow)
      if (newRow.hasOwnProperty('version')) {
        newRow.version = 0
      }
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
      const rowData = getRowData(row)
      this.currentTable.onediting && this.currentTable.onediting(rowData)
      this.editingRow = rowData
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
.datatables{
  .card-title-wrapper{
    display: flex;
    height: 41px;
    padding-left: 5px;
    align-items: center;
  }

  .datatables-select-wrapper{
    display: flex;
    align-items: center;
  }
  .datatables-select{
    .md-select-value{
      font-size: 20px;
    }
  }
  //
  .filters{
    display: inline-block;
  }
  .company-filter{
    display: flex;
    align-items: center;
  }
  .company-select{
    .md-select-value{
      font-size: 14px;
      color: grey;
    }
  }
  .datatables-actions .md-table-cell-container{
    padding-left: 12px!important;
    justify-content: flex-start!important;
  }
}
</style>
