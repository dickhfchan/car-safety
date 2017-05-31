<template>
  <div class="login">
    <div class="card-holder">
        <md-card class="login-card">
          <md-card-header>
            <div class="md-title">{{$t('brand')}}</div>
            <div class="md-subhead">{{$t('loginSubtitle')}}</div>
          </md-card-header>

          <md-card-content>
            <form novalidate @submit.stop.prevent="submit">
              <md-input-container :class="fields.name.getValidationClass()">
                <md-icon>person</md-icon>
                <label>{{fields.name.text}}</label>
                <md-input v-model="fields.name.value" :required="fields.name.required"></md-input>
                <template v-if="fields.name.isValidationErrorsVisible()">
                  <span class="md-error" v-for="error in fields.name.errors">{{error.message}}</span>
                </template>
              </md-input-container>
              <md-input-container md-has-password :class="fields.password.getValidationClass()">
                <md-icon>lock</md-icon>
                <label>{{fields.password.text}}</label>
                <md-input v-model="fields.password.value" type="password" :required="fields.password.required"></md-input>
                <template v-if="fields.password.isValidationErrorsVisible()">
                  <span class="md-error" v-for="error in fields.password.errors">{{error.message}}</span>
                </template>
              </md-input-container>

              <md-input-container>
                <label for="langSelect">{{$t('language')}}</label>
                <md-select name="lang" id="langSelect" v-model="lang">
                  <md-option value="en">{{$t('Englsih')}}</md-option>
                  <md-option value="zh-cn">{{$t('simplifiedChinese')}}</md-option>
                  <md-option value="zh-tw">{{$t('traditionalChinese')}}</md-option>
                </md-select>
              </md-input-container>

              <md-button type="submit" class="md-raised md-primary m-a-0">{{$t('signIn')}}</md-button>
            </form>

          </md-card-content>
        </md-card>
    </div>
  </div>
</template>

<script>
// import {isObject} from 'helper-js'
 export default {
   data() {
     return {
       serverUrls: this.$store.state.urls.server,
       validation: {},
       fields: {
         name: {
           text: this.$t('username'),
           rules: 'required'
         },
         password: {
           text: this.$t('password'),
           rules: 'required'
         }
       }
     }
   },
   computed: {
     lang: {
       get() { return this.$store.state.lang },
       set(val) { setTimeout(() => {
         window.localStorage.setItem('lang', val)
         this.$store.commit('lang', val)
       }, 200) },
     }
   },
   methods: {
     submit() {
       this.validation.check().then((data) => {
         this.$http.get(`/dao/authentication/${data.name}?password=${data.password}&company_code=${this.$route.params.companyCode}`).then(({data}) => {
           if (data && data.message === 'Success') {
             this.$store.commit('authenticated', true)
             const user = data.JSON[0]
             this.$store.commit('user', user)
             this.$store.commit('lang', user.lang)
             this.$router.push({name: 'dashboard'})
             this.$emit('success', user)
           } else {
             this.$alert(this.$t('loginFailed'))
             this.$emit('error')
           }
         }).catch(e => {
           this.$alert(this.$t('loginFailed'))
           this.$emit('error')
         })
       })
     }
   },
   created() {
     this.$validate(this.validation, this.fields)
     this.$store.commit('companyCode', this.$route.params.companyCode)
   }
 }

</script>
<style lang="scss">
.login{
  display: flex;
  flex: 1;
  justify-content: center;
  padding-top: 100px;
}
.login-card{
  width: 350px;
}
</style>
