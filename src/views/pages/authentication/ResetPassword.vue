<template>
  <vue-scroll class="forgot-password-page align-vertical">
    <div class="form-wrapper align-vertical-middle">
      <div class="form-box card-base card-shadow--extraLarge">
        <img class="image-logo" src="@/assets/images/logo.svg" alt="logo"/>

        <form @submit.prevent="submit">
          <el-input v-model="password" placeholder="New Password" type="password">
            <template slot="prefix">Enter Your Password</template>
          </el-input>
          <span class="pw-error" v-if="password.length && !passwordValid">
            Password must be at least 5 characters
          </span>
          <el-input v-model="confirmPass" placeholder="Confirm Password" type="password">
            <template slot="prefix">Confirm Your Password</template>
          </el-input>
          <span class="pw-error" v-if="confirmPass.length && !confirmValid">
            Passwords do not match
          </span>
          <div class="flex text-center center pt-20 pb-10">
            <el-button type="default" native-type="submit" size="large" class="send-btn" plain>
              RESET PASSWORD
            </el-button>
          </div>
        </form>

      </div>
    </div>
  </vue-scroll>
</template>

<script>

  import feathersClient from "../../../feathers/feathers-client";

  export default {
    name: 'ResetPassword',
    data() {
      return {
        password: '',
        confirmPass: '',
        passwordValid: false,
        confirmValid: false,
        authToken: '',
        email: ''
      }
    },
    watch: {
      password() {
        this.passwordValid = this.password.length >= 5;
        this.confirmValid = this.confirmPass === this.password;
      },
      confirmPass(){
        this.confirmValid = this.confirmPass === this.password;
      }
    },
    methods: {
      submit() {
        if(this.passwordValid && this.confirmValid){
          console.log('ready to reset');
          const resetService = feathersClient.service('forgot-password');
          resetService.update(null, {
            email: this.email,
            password: this.password,
            token: this.authToken
          }).then( (res) => {
            this.$notify({
              title: 'Success',
              message: res,
              type: 'success'
            });
            this.$router.push('/login');
          }).catch( (e) => {
            this.$notify({
              title: 'Error',
              message: e,
              type: 'error'
            });
          });
        } else{
          this.$notify({
            title: 'Error',
            message: 'The fields are not valid',
            type: 'error'
          });
        }
      }
    },
    mounted() {
      //check context of route so we can show a modal if appropriate
      const urlParams = new URLSearchParams(window.location.search);
      this.email = urlParams.get('email').replace('%40', '@');
      this.authToken = urlParams.get('token');
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/scss/_variables';

  .forgot-password-page {
    background: $text-color;
    margin-left: -30px;
    margin-right: -30px;

    .form-wrapper {
      width: 100%;
    }

    .form-box {
      width: 100%;
      max-width: 340px;
      padding: 30px;
      box-sizing: border-box;
      margin: 20px auto;

      a {
        font-size: 14px;
        color: $text-color-accent;
        text-decoration: none;
        font-weight: 500;
      }

      .image-logo {
        width: 80px;
        margin: 0px auto;
        margin-bottom: 50px;
        display: block;
      }

      .send-btn {
        width: 160px;
      }
    }
  }

  .login-btn,
  .social-btn {
    width: 160px;

    &.google {
      margin-bottom: 10px;
      background-color: #d73d32;
      color: white;

      &:hover {
        border-color: #d73d32;
      }
    }

    &.facebook {
      background-color: #3f5c9a;
      color: white;

      &:hover {
        border-color: #3f5c9a;
      }
    }
  }

  .pw-error{
    font-size: 8pt;
    color: $voxo-orange;
  }

  @media (max-width: 768px) {
    .layout-container .container .view.forgot-password-page {
      margin-left: -5px;
      margin-right: -5px;
      max-width: calc(100% + 10px);
    }
  }
</style>
