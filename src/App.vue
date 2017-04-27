<template>
  <div id="app">
      <md-whiteframe>
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


      <md-sidenav md-theme="blue" class="md-left" ref="leftSidenav" @open="open('Left')" @close="close('Left')">
          <md-toolbar class="md-large">
            <div class="md-toolbar-container">
              <h3 class="md-title">{{$t('brand')}}</h3>
            </div>
          </md-toolbar>
          <div class="demo-drawer mdl-layout__drawer mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">

          <md-list>
            <md-list-item href="localhost:8080/#/Users">
              <md-icon>move_to_inbox</md-icon> <span>Inbox</span>
            </md-list-item>

            <md-list-item>
              <md-icon>send</md-icon> <span>Sent Mail</span>
            </md-list-item>

            <md-list-item>
              <md-icon>delete</md-icon> <span>Trash</span>
            </md-list-item>

            <md-list-item>
              <md-icon>error</md-icon> <span>Spam</span>

              <md-divider class="md-inset"></md-divider>
            </md-list-item>

            <md-list-item>
              <md-avatar>
                <img src="https://placeimg.com/40/40/people/5" alt="People">
              </md-avatar>

              <span>Abbey Christansen</span>

              <md-button class="md-icon-button md-list-action">
                <md-icon class="md-primary">chat_bubble</md-icon>
              </md-button>
            </md-list-item>

            <md-list-item>
              <md-avatar>
                <img src="https://placeimg.com/40/40/people/1" alt="People">
              </md-avatar>

              <span>Alex Nelson</span>

              <md-button class="md-icon-button md-list-action">
                <md-icon class="md-primary">chat_bubble</md-icon>
              </md-button>
            </md-list-item>

            <md-list-item>
              <md-avatar>
                <img src="https://placeimg.com/40/40/people/6" alt="People">
              </md-avatar>

              <span>Mary Johnson</span>

              <md-button class="md-icon-button md-list-action">
                <md-icon>chat_bubble</md-icon>
              </md-button>
            </md-list-item>
          </md-list>

          </div>
      </md-sidenav>

      <md-sidenav md-theme="blue" class="md-right" ref="rightSidenav" @open="open('Right')" @close="close('Right')">
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

      <keep-alive>
         <router-view></router-view>
      </keep-alive>
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

<style lang="scss">
.settings-bar-switch{
  position: absolute;
  right: 10px;
  bottom: -20px;
  margin: 0;
}
</style>
