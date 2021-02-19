<template>
  <vue-scroll class="forgot-password-page align-vertical">
    <div class="form-wrapper align-vertical-middle">
      <div class="form-box card-base card-shadow--extraLarge">
        <img class="image-logo" src="@/assets/images/logo.svg" alt="logo"/>

        <form @submit.prevent="submit">
          <el-input v-model="email" placeholder="Email">
            <template slot="prefix">Enter your email</template>
          </el-input>
        </form>

        <div class="flex text-center center pt-20 pb-10">
          <el-button native-type="submit" type="default" size="large" class="send-btn" @click="submit" plain>
            Reset Password
          </el-button>
        </div>
      </div>
    </div>
  </vue-scroll>
</template>

<script>

  import feathersClient from "../../../feathers/feathers-client";

  export default {
    name: 'ForgotPassword',
    data() {
      return {
        email: ''
      }
    },
    methods: {
      submit() {
        if(this.email.length > 2){
          const resetService = feathersClient.service('forgot-password');
          resetService.create({ email: this.email}).then( () => {
            this.$notify({
              title: 'Success',
              message: 'Request Submitted. Are Belongs to Us. Check Your Email',
              type: 'success'
            });
            this.$router.push('login');
          })
        } else{
          this.$notify({
            title: 'Error',
            message: 'The Email?',
            type: 'error'
          });
        }
      }
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

  @media (max-width: 768px) {
    .layout-container .container .view.forgot-password-page {
      margin-left: -5px;
      margin-right: -5px;
      max-width: calc(100% + 10px);
    }
  }
</style>
