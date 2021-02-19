<template>
  <div class="page-profile-edit">

    <div class="extension-details" v-if="user">
      <h4>Profile Type: {{userTitle()}}</h4>
      <h4>Email: {{user.email}}</h4>
      <h4 v-if="user.hasOwnProperty('myExtension')">Extension: {{user.myExtension.number}} </h4>
      <div class="personal-meeting-info" v-loading="loadingMeetInfo">
        <h4 v-if="user.hasOwnProperty('myExtension')">Personal Meeting Info</h4>
        <div>{{ meetURL }}</div>
        <div>{{ meetDial }}</div>
      </div>
    </div>
    <el-checkbox
      v-model="passwordReset"
      :label="true"
      class="mt-30">
      Reset Password
    </el-checkbox>
    <div class="password-reset-form" v-if="passwordReset">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input type="password" v-model="password" placeholder="Enter New Password" clearable>
            <template class="label-prefix" slot="prefix">New Password</template>
          </el-input>
          <span class="pw-length-error" v-if="!passwordValid && password.length">
            Must be at least 5 characters!
          </span>
        </el-col>
        <el-col :span="6">
          <el-button :disabled="!(passwordValid)" @click="onSubmit">Submit</el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>

  import feathersClient from "../../../../feathers/feathers-client";

  export default {
    name: 'ProfileEdit',
    data() {
      return {
        passwordReset: false,
        password: '',
        passwordValid: false,
        meetURL: '',
        meetDial: '',
        loadingMeetInfo: true
      }
    },
    computed: {
      user() {
        return this.$store.state.auth.user;
      },
    },
    watch: {
      password() {
        this.passwordValid = this.password.length >= 5;
      }
    },
    methods: {
      onSubmit() {

        this.$confirm('Reset Your Password?', {}).then(() => {
          const passwordResetService = feathersClient.service('password-reset');
          passwordResetService.create({
            password: this.password
          }).then((res) => {
            this.$notify({
              title: 'Success',
              message: 'Password Reset Successful!',
              type: 'success'
            });
            this.password = '';
            this.passwordReset = false;
          }).catch((e) => {
            console.log(e);
          });
        }).catch(() => true);
      },
      resizeLabelPosition() {
        if (window.innerWidth <= 768) {
          this.labelPosition = 'top'
        }
      },
      userTitle(){
        const {userRole} = this.user;
        switch (userRole) {
          case 1:
            return 'Platform Admin';
          case 3:
            return 'Tenant Admin';
          case 5:
            return 'Basic User';
        }
      }
    },
    mounted() {
      this.resizeLabelPosition();
      window.addEventListener('resize', this.resizeLabelPosition);

      if (this.user.hasOwnProperty('myExtension')) {
        const meetService = feathersClient.service('voxo-meet-creds');
        meetService.find({
          query: {
            tenantId: this.user.myExtension.tenantId,
            ext: this.user.myExtension.number
          }
        }).then((res) => {
          this.loadingMeetInfo = false;
          this.meetURL = res.meetURL;
          this.meetDial = res.dialIn;
        });
      } else{
        this.loadingMeetInfo = false;
      }
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeLabelPosition);
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../../assets/scss/variables';

  .el-checkbox{
    width: 200px;
  }

  .el-button {
    height: 50px;
  }

  .el-col {
    position: relative;
  }

  .el-row {
    display: flex;
    align-items: center;
  }

  .pw-length-error {
    position: absolute;
    bottom: -8px;
    font-size: 8pt;
    left: 13px;
    color: $voxo-orange;
  }

  .password-reset-form {
    padding: 20px 0;
  }

  @media (max-width: 860px) {
    .el-row {
      flex-wrap: wrap;

      .el-col {
        width: 100%;
        max-width: 300px;
      }
    }
  }

</style>
