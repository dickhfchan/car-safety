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
              <md-input-container :class="fields.email.getValidationClass()">
                <md-icon>mail</md-icon>
                <label>{{fields.email.text}}</label>
                <md-input v-model="fields.email.value" :required="fields.email.required"></md-input>
                <template v-if="fields.email.isValidationErrorsVisible()">
                  <span class="md-error" v-for="error in fields.email.errors">{{error.message}}</span>
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
        email: {
          text: this.$t('email'),
          rules: 'required|email|minLength:3'
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
        this.$store.commit('lang', val)
      }, 200) },
    }
  },
  methods: {
    submit() {
      this.$store.commit('authenticated', true)
      this.validation.check().then((data) => {
        // this.$http.post(this.serverUrls.auth.login, data)
        // .then(({data}) => {
        //   if (isObject(data) && data.id > 0) {
        //     this.$store.commit('authenticated', true)
        //     this.$store.commit('user', data)
        //     this.$notification.success(`Hello, ${data.name}. You are successfully logged in.`)
        //     this.$emit('success', data)
        //   } else {
        //     this.$store.commit('authenticated', false)
        //     this.$store.commit('user', {})
        //     this.$notification.error(data)
        //     this.$emit('error')
        //   }
        // })
      })
    }
  },
  created() {
    this.$validate(this.validation, this.fields)
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
