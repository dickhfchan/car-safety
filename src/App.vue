<template>
  <div id="app" class="container">
    <md-whiteframe class="menu-layer">
      <md-toolbar md-theme="blue">
        <md-button class="md-icon-button" @click.native="toggleLeftSidenav">
          <md-icon>menu</md-icon>
        </md-button>


        <h2 class="md-title" style="flex: 1">{{$t('brand')}}</h2>

        <md-button class="md-icon-button">
          <md-icon>view_module</md-icon>
        </md-button>

        <md-button class="md-fab md-clean md-mini settings-bar-switch"
        @click.native="toggleRightSidenav">
         <md-icon>more_horiz</md-icon>
         <md-tooltip md-direction="left">{{$t('settings')}}</md-tooltip>
       </md-button>

      </md-toolbar>
    </md-whiteframe>

    <md-sidenav md-theme="blue" class="md-left sidebar-layer" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
        <md-toolbar class="md-large">
          <div class="md-toolbar-container">
            <h3 class="md-title">{{$t('brand')}}</h3>
          </div>
        </md-toolbar>

        <md-list>
          <md-list-item v-for="(item, index) in $store.state.menu"
          :key="index"
          :href="$router.resolve({name:item.routeName}).href"
          @click.native.prevent="$router.push({name:item.routeName})"
          >
            <md-icon>{{item.icon}}</md-icon> <span>{{$t('menu.'+item.text)}}</span>
          </md-list-item>
        </md-list>

    </md-sidenav>

    <md-sidenav md-theme="blue" class="md-right sidebar-layer" ref="rightSidenav" @open="open('Right')" @close="close('Right')">
        <md-toolbar class="">
          <div class="md-toolbar-container">
            <h3 class="md-title">{{$t('settings')}}</h3>
          </div>
        </md-toolbar>

        <form novalidate @submit.stop.prevent="updateSettings">
          <div style="padding:0 1em;">
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
          </div>
          <md-button class="md-raised md-primary" type="submit">{{$t('update')}}</md-button>
        </form>

    </md-sidenav>

    <div class="page-content main-layer">
      <keep-alive>
         <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    const settings = this.$store.state.settings
    return {
      settings: {
        map: settings.map,
        lang: settings.lang,
      }
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
    updateSettings() {
      this.$store.commit('settings', Object.assign({}, this.settings))
    }
  }
}

</script>

<style src="vue-material/dist/vue-material.css"></style>
<!-- the css about svg in vue-material.css will effect baidu map overlays, add svg{max-width: inherit;} to prevent that (already added in baidu-map-track-render-vue ) -->

<style src="./assets/css/layer.css"></style>
<!-- base -->
<style lang="scss">
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
.settings-bar-switch{
  position: absolute;
  right: 10px;
  bottom: -20px;
  margin: 0;
}
</style>
