<template>
  <div id="app" class="container">
    <!-- initialization -->
    <div class="absolute-backdrop center-wrapper" v-if="!$store.state.initialized">
      <md-spinner md-indeterminate></md-spinner>
    </div>
    <!-- initialized -->
    <template v-else>
      <router-view v-if="$route.name==='login'||$route.name==='unauthorized'"></router-view>
      <template v-else-if="$store.state.authenticated">
        <!-- top menu -->
        <md-whiteframe class="menu-layer top-menu">
          <md-toolbar md-theme="blue">
            <md-button class="md-icon-button" @click.native="toggleLeftSidenav">
              <md-icon>menu</md-icon>
            </md-button>

            <h2 class="md-title">{{$t('brand')}}</h2>

            <div class="flex-1">
              <Search-Box v-if="window.width >= 800"></Search-Box>
            </div>

            <md-button class="md-icon-button" v-if="searchBtnVisible" @click.native="searchBoxVisibleInSm=!searchBoxVisibleInSm">
             <md-icon>search</md-icon>
             <md-tooltip md-direction="bottom">{{$t('search')}}</md-tooltip>
            </md-button>

            <md-button class="md-icon-button" @click.native="">
             <md-icon>apps</md-icon>
             <md-tooltip md-direction="bottom">{{$t('nineBoxes')}}</md-tooltip>
            </md-button>

            <md-button class="md-icon-button" @click.native="">
             <md-icon>notifications</md-icon>
             <md-tooltip md-direction="bottom">{{$t('notifications')}}</md-tooltip>
            </md-button>

            <!-- <md-button class="md-icon-button" @click.native="toggleRightSidenav">
             <md-icon>settings</md-icon>
             <md-tooltip md-direction="bottom">{{$t('setting')}}</md-tooltip>
            </md-button> -->

            <md-avatar @click.native="toggleRightSidenav">
              <img src="./assets/img/avatar.png" alt="Avatar">
              <md-tooltip md-direction="bottom">{{$t('profile')}}</md-tooltip>
            </md-avatar>

            <Search-Box class="search-box-sm" v-if="window.width < 800 && searchBoxVisibleInSm"></Search-Box>

          </md-toolbar>
        </md-whiteframe>

        <!-- left side -->
        <md-sidenav md-theme="blue" class="md-left sidebar-layer left-side-bar" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
            <md-toolbar class="md-large logo-wrapper" md-theme="white">
              <router-link :to="{name: 'dashboard'}">
                <img src="./assets/img/webwxgetmsgimgg.jpg" alt="Vue">
              </router-link>
            </md-toolbar>
            <div class="" style="">
              <md-list>
                <template v-for="(item, index) in $store.state.menu">
                  <template v-if="item.children">
                    <!-- has children -->
                    <md-list-item  v-if="canAccessMenuItem(item)">
                      <md-icon>{{item.icon}}</md-icon>
                      <span>{{$t(item.text)}}</span>
                      <md-list-expand>
                       <md-list>
                         <md-list-item class="md-inset" v-for="childItem in item.children" :key="childItem.name"
                         :href="$router.resolve({name:item.routeName}).href"
                          @click.native.prevent="onMenuItemClik(childItem)"
                          >
                          {{$t(childItem.text)}}
                         </md-list-item>
                       </md-list>
                     </md-list-expand>
                    </md-list-item>
                  </template>
                  <!-- no children -->
                  <template v-else>
                    <md-list-item  v-if="canAccessMenuItem(item)"
                    :href="$router.resolve({name:item.routeName}).href"
                     @click.native.prevent="onMenuItemClik(item)"
                    >
                      <md-icon>{{item.icon}}</md-icon>
                      <span>{{$t(item.text)}}</span>
                    </md-list-item>
                  </template>
                </template>
              </md-list>
            </div>

        </md-sidenav>

        <!-- right side -->
        <md-sidenav md-theme="blue" class="md-right sidebar-layer" ref="rightSidenav" @open="open('Right')" @close="close('Right')">
            <md-toolbar class="">
              <div class="md-toolbar-container">
                <h3 class="md-title">{{$t('profile')}}</h3>
              </div>
            </md-toolbar>
            <div class="p-a">
              <div>{{$store.state.user.fullname}}</div>
              <!-- company code -->
              <div class="">
                <small>Company: {{$store.state.user.company.company_name}}</small>
              </div>
              <md-button class="md-raised md-warn m-x-0" @click.native="$store.dispatch('logout')">{{$t('logout')}}</md-button>
              <form novalidate @submit.stop.prevent="updateSettings">
                <md-subheader class="md-inset p-l-0">{{$t('settings')}}</md-subheader>
                <md-input-container>
                  <label for="mapSelect">{{$t('map')}}</label>
                  <md-select name="map" id="mapSelect" v-model="settings.map">
                    <md-option value="googleMap">{{$t('googleMap')}}</md-option>
                    <md-option value="baiduMap">{{$t('baiduMap')}}</md-option>
                  </md-select>
                </md-input-container>
                <md-input-container>
                  <label for="langSelect">{{$t('language')}}</label>
                  <md-select name="lang" id="langSelect" v-model="settings.lang">
                    <md-option value="en">{{$t('Englsih')}}</md-option>
                    <md-option value="zh-cn">{{$t('simplifiedChinese')}}</md-option>
                    <md-option value="zh-tw">{{$t('traditionalChinese')}}</md-option>
                  </md-select>
                </md-input-container>
                <md-button class="md-raised md-primary m-a-0" type="submit">{{$t('update')}}</md-button>
              </form>
            </div>

        </md-sidenav>

        <div class="page-content main-layer">
          <keep-alive>
             <router-view></router-view>
          </keep-alive>
        </div>
      </template>

      <!-- global alert -->
      <md-dialog-alert :md-content="alert.content" :md-ok-text="$t('ok')" ref="alert"></md-dialog-alert>

      <!-- global confirm -->
      <md-dialog-confirm
        :md-title="confirm.title"
        :md-content-html="confirm.content"
        :md-ok-text="confirm.ok"
        :md-cancel-text="confirm.cancel"
        @close="onConfirmClose"
        ref="confirm">
      </md-dialog-confirm>
    </template>
  </div>
</template>

<script>
import SearchBox from '@/components/SearchBox.vue'
import WindowSizeListener from '@/components/WindowSizeListener.vue'

export default {
  components: { SearchBox },
  mixins: [ WindowSizeListener ],
  data () {
    const state = this.$store.state
    return {
      searchBoxVisibleInSm: false,
      settings: {
        map: state.map,
        lang: state.lang,
      },
      alert: {
        content: ' '
      },
      confirm: {
        title: '',
        content: ' ',
        ok: this.$t('ok'),
        cancel: this.$t('cancel'),
        resolve: null,
        reject: null,
      }
    }
  },
  computed: {
    searchBtnVisible() {
      return this.window.width < 800 && ['map', 'report2', 'd2', 'driverVehicleProfile'].indexOf(this.$route.name) > -1
    }
  },
  methods: {
    toggleLeftSidenav() {
      this.$refs.leftSidenav.toggle()
    },
    toggleRightSidenav() {
      this.$refs.rightSidenav.toggle()
    },
    closeRightSidenav() {
      this.$refs.rightSidenav.close()
    },
    open(ref) {
      console.log('Opened: ' + ref)
    },
    close(ref) {
      console.log('Closed: ' + ref)
    },
    canAccessMenuItem(item) {
      const pms = item.permission
      return !pms || (typeof pms === 'function' ? pms(this.$store.state.user) : this.$store.state.user.actions.includes(pms))
    },
    onMenuItemClik(item) {
      if (item.routeName) {
        this.$router.push({name: item.routeName})
        this.$refs.leftSidenav.close()
      }
    },
    updateSettings() {
      this.$store.commit('map', this.settings.map)
      window.localStorage.setItem('lang_' + this.$store.state.user.company_id, this.settings.lang)
      this.$store.commit('lang', this.settings.lang)
      this.closeRightSidenav()
    },
    onConfirmClose(type) {
      if (type === 'ok') {
        if (this.confirm.resolve) {
          this.confirm.resolve()
        }
      } else if (type === 'cancel') {
        if (this.confirm.reject) {
          this.confirm.reject(new Error('cancel'))
        }
      }
    }
  },
  created() {
    const Vue = this.$root.constructor
    // register alert
    Vue.alert = Vue.prototype.$alert = (content) => {
      this.alert.content = content
      this.$refs.alert.open()
    }
    // register confirm
    Vue.confirm = Vue.prototype.$confirm = (content, options) => {
      this.confirm.content = content
      if (options) {
        Object.assign(this.confirm, options)
      }
      if (!this.confirm.title) {
        this.confirm.title = this.$t('confirm')
      }
      this.$refs.confirm.open()
      return new Promise((resolve, reject) => {
        this.confirm.resolve = resolve
        this.confirm.reject = reject
      })
    }
    //
    this.$store.dispatch('init')
  }
}

</script>

<!-- base -->
<style lang="scss">
// <link rel="stylesheet" href="//fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic">
@import "./assets/css/google-font.css";
// <link rel="stylesheet" href="//fonts.googleapis.com/icon?family=Material+Icons">
@import "../node_modules/material-design-icons/iconfont/material-icons.css";
// the css about svg in vue-material.css will effect baidu map overlays, add svg{max-width: inherit;} to prevent that (already added in baidu-map-track-render-vue )
@import "../node_modules/vue-material/dist/vue-material.css";
// layer.scss should after vue-material.css
@import "./assets/css/layer.scss";
@import "../node_modules/css-spacing-helper/css-spacing-helper.css";
@import "./assets/css/helper.scss";
@import "../node_modules/flex-layout-attribute/sass/flex-layout-attribute.scss"; // for vuetiful datatable

body, html{
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>

<!-- layout -->
<style lang="scss" scoped>
.container{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction:column;
}
.page-content {
  flex: 1;
  overflow: auto;
}
</style>

<!-- other -->
<style lang="scss">
.top-menu{
  .md-avatar{
    min-width: initial;
    min-height: initial;
    $side : 24px;
    width: $side;
    height: $side;
  }
}
.logo-wrapper{
  display: block;
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(0,0,0,.12);
}
.d2-date-range, .report2-select-wrapper{
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding-right: 100px;
}
.search-box-sm{
  padding: 10px;
  width: 100%;
  display: block;
  > div{
    justify-content: flex-start;
  }
  // .map-filters, .d2-date-range, .report2-select-wrapper{
  //   justify-content: flex-start;
  // }
}
//
.left-side-bar.md-sidenav.md-theme-blue{
  .md-sidenav-content{
    // display: flex;
    // flex-direction: column;
    background-color: #2196f3;
    .logo-wrapper{
      background-color: #fff;
    }
    .md-list, .md-list-item-container{
      background-color: #2196f3;
    }
    .md-list-item-container{
      color: #fff;
    }
    .md-list-item .md-icon{
      color: #fff;
    }
  }
  // .menu-wrapper{
  // }
}
</style>
