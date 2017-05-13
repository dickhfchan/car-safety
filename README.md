# car-tracking

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build


# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
## More About Build
command: npm run build  
config:  
``` js
// config/index.js  
{
  assetsPublicPath: '/' // change it if the project is not under website root
}
// src/config.js
config = {
  isCROS: false, // is the frontend and backend under diffrent domain.
  clientBaseUrl: null, // for vue-router html5 mode, define the base url of frontend
  serverBaseUrl: null, // for axios, define the base url of request to backend
}
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Changes
[17/04/28 15:32] add ./src/components/GoogleMapTrackRender.vue  
[17/04/29 16:13] Left sidebar menu is ok. First, define the menu item text in   dir 'lang', then define menu items in store/menu.js  
[17/04/29 17:25] full screen button: append '<fullscreen-button></fullscreen-button>' to md-card-header -> md-title. example:
```html
<md-card-header>
  <div class="md-title">Google Map<fullscreen-button></fullscreen-button></div>
</md-card-header>
```
## some datatables
{
  "company": {
    "columns": [
      {
        "name": "company_code"
      },
      {
        "name": "company_id"
      },
      {
        "name": "company_key"
      },
      {
        "name": "company_name"
      },
      {
        "name": "contact_name"
      },
      {
        "name": "contact_phone_no"
      },
      {
        "name": "create_ts"
      },
      {
        "name": "status"
      },
      {
        "name": "timezone"
      },
      {
        "name": "version"
      }
    ]
  },
  "driver": {
    "columns": [
      {
        "name": "company_id"
      },
      {
        "name": "create_ts"
      },
      {
        "name": "create_user"
      },
      {
        "name": "dob"
      },
      {
        "name": "driver_code"
      },
      {
        "name": "driver_id"
      },
      {
        "name": "is_default"
      },
      {
        "name": "name"
      },
      {
        "name": "phone_home"
      },
      {
        "name": "phone_mobile"
      },
      {
        "name": "phone_office"
      },
      {
        "name": "update_ts"
      },
      {
        "name": "update_user"
      },
      {
        "name": "version"
      }
    ]
  },
  "driver_group_dtl": {
    "columns": [
      {
        "name": "create_ts"
      },
      {
        "name": "create_user"
      },
      {
        "name": "driver_id"
      },
      {
        "name": "drv_grp_dtl_id"
      },
      {
        "name": "drv_grp_id"
      },
      {
        "name": "update_ts"
      },
      {
        "name": "update_user"
      },
      {
        "name": "version"
      }
    ]
  },
  "user_account": {
    "columns": [
      {
        "name": "company_id"
      },
      {
        "name": "create_ts"
      },
      {
        "name": "fullname"
      },
      {
        "name": "group_id"
      },
      {
        "name": "lang"
      },
      {
        "name": "last_login_ts"
      },
      {
        "name": "password"
      },
      {
        "name": "retry_count"
      },
      {
        "name": "status"
      },
      {
        "name": "user_id"
      },
      {
        "name": "username"
      },
      {
        "name": "version"
      }
    ]
  },
  "user_group": {
    "columns": [
      {
        "name": "company_id"
      },
      {
        "name": "group_id"
      },
      {
        "name": "group_name"
      }
    ]
  },
  "user_group_func": {
    "columns": [
      {
        "name": "func_code"
      },
      {
        "name": "group_func_id"
      },
      {
        "name": "group_id"
      }
    ]
  },
  "vehicle": {
    "columns": [
      {
        "name": "brand"
      },
      {
        "name": "company_id"
      },
      {
        "name": "create_ts"
      },
      {
        "name": "create_user"
      },
      {
        "name": "fuel_usage"
      },
      {
        "name": "idle_duration_non-trf"
      },
      {
        "name": "idle_duration_trf"
      },
      {
        "name": "latest_trip_distance"
      },
      {
        "name": "latest_trip_duration"
      },
      {
        "name": "model"
      },
      {
        "name": "run_distance"
      },
      {
        "name": "run_duration"
      },
      {
        "name": "update_ts"
      },
      {
        "name": "update_user"
      },
      {
        "name": "vehicle_id"
      },
      {
        "name": "version"
      },
      {
        "name": "year"
      }
    ]
  },
  "veh_reg_mark": {
    "columns": [
      {
        "name": "company_id"
      },
      {
        "name": "create_ts"
      },
      {
        "name": "create_user"
      },
      {
        "name": "def_drv_id"
      },
      {
        "name": "status"
      },
      {
        "name": "update_ts"
      },
      {
        "name": "update_user"
      },
      {
        "name": "vehicle_id"
      },
      {
        "name": "version"
      },
      {
        "name": "vrm_id"
      },
      {
        "name": "vrm_mark_code"
      }
    ]
  },
  "veh_reg_mark_group": {
    "columns": [
      {
        "name": "company_id"
      },
      {
        "name": "create_ts"
      },
      {
        "name": "create_user"
      },
      {
        "name": "grp_alias"
      },
      {
        "name": "grp_descpt"
      },
      {
        "name": "update_ts"
      },
      {
        "name": "update_user"
      },
      {
        "name": "version"
      },
      {
        "name": "vrm_grp_id"
      }
    ]
  },
  "veh_reg_mark_group_dtl": {
    "columns": [
      {
        "name": "create_ts"
      },
      {
        "name": "create_user"
      },
      {
        "name": "update_ts"
      },
      {
        "name": "update_user"
      },
      {
        "name": "version"
      },
      {
        "name": "vrm_grp_dtl_id"
      },
      {
        "name": "vrm_grp_id"
      },
      {
        "name": "vrm_id"
      }
    ]
  },
  "warning_type": {
    "columns": [
      {
        "name": "warn_type_code"
      },
      {
        "name": "warn_type_id"
      }
    ]
  }
}
