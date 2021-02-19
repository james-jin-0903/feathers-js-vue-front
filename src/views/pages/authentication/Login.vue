<template>
  <vue-scroll class="login-page align-vertical">
    <div class="form-wrapper align-vertical-middle">
      <div class="form-box card-base card-shadow--extraLarge">
        <img class="image-logo" src="@/assets/images/logo.svg" alt="logo"/>

        <form @submit.prevent="login">
          <el-input v-model="form.email" placeholder="Enter your E-mail">
            <template slot="prefix">E-mail</template>
          </el-input>
          <el-input type="password" v-model="form.password" placeholder="Enter your password" autocomplete="off">
            <label slot="prefix">Password</label>
          </el-input>
          <div class="flex">
            <div class="box grow text-center">
              <router-link to="/forgot-password">Forgot Password?</router-link>
            </div>
          </div>
          <div class="flex text-center center pt-30 pb-10">
            <el-button native-type="submit" type="default" size="large" class="login-btn" plain>
              Login
            </el-button>
          </div>
        </form>
      </div>
    </div>
  </vue-scroll>
</template>

<script>

  import feathersClient from "../../../feathers/feathers-client";
  import {mapActions} from 'vuex';
  import findIndex from 'lodash/findKey';

  export default {
    name: 'Login',
    data() {
      return {
        branchOptions: [],
        departmentOptions: [],
        form: {
          email: '',
          password: '',
        }
      }
    },
    computed: {
      user(){
        return this.$store.state.auth.user;
      }
    },
    watch: {
      user(){
        this.processLogin();
      }
    },
    methods: {
      ...mapActions('phonebook-entries', {getPhonebookEntries: 'find'}),

      async login() {
        //call auth service at feathers. we will need error handling here
        await this.$store.dispatch('auth/authenticate',
          {
            strategy: 'local',
            email: this.form.email.trim(),
            password: this.form.password.trim()
          })
          .catch(error => {
          this.$notify({
            title: error.name,
            message: error.message,
            type: 'error'
          });
        });
      },
      async processLogin(){
        console.log('user must have logged in');
        const {myExtension, userRole} = this.user;

        //find any tenants for the user
        const tenants = await this.$store.dispatch('tenants/find');
        this.$store.commit('setTenants', tenants);

        if(myExtension){

          const {dnd, status, hostServer, peerName, tenantCode, number,
            tenantId, omniaPhonebookId} = this.user.myExtension;

          //update user specific info in store
          this.$store.commit('setUserDND', dnd === 'on');
          this.$store.commit('setUserStatus', status);
          this.$store.commit('setUserHostServer', hostServer);

          //joins the user specific channel
          await feathersClient.service('channel-memberships').create({
            roomType: 'user',
            peerName
          });

          //joins the extensions / calls channel for assigned tenant
          await feathersClient.service('channel-memberships').create({
            roomType: 'extensions',
            tenantCode
          });

          //send request to get any connected calls
          await feathersClient.service('nats-actions-handler').create({
            reqType: 'refreshConnectedCalls',
            hostServer,
            peerName,
            tenantCode,
            userId: this.user.id,
            userExten: number
          });

          // Load user company directory
          await feathersClient.service('extensions').find({
            query: {tenantId}
          }).then(res => {
            this.$store.commit('companydirectory/addItems', res);
            let branchOptions = [];
            let departmentOptions = [];
            res.forEach((item) => {
              if (!branchOptions.includes(item.branch) && item.branch !== '') {
                branchOptions.push(item.branch)
              }
              if (!departmentOptions.includes(item.department) && item.department !== '') {
                departmentOptions.push(item.department)
              }
            });
            this.$store.commit('setHudDepartments', departmentOptions);
            this.$store.commit('setHudBranches', branchOptions);
            this.$store.commit('setActiveHudBranches', branchOptions);
            this.$store.commit('setActiveHudDepartments', departmentOptions);
          });

          // Load custom contacts
          if(omniaPhonebookId){
            await this.getPhonebookEntries({
              query: {
                tenantId,
                phonebookId: omniaPhonebookId
              }
            });
          }

          //load the user's anchored tenant
          const anchorIndex = findIndex(tenants, tenant => tenant.id === tenantId);
          if(anchorIndex >= 0){
            console.log('setting anchor account as selected', tenants[anchorIndex].name);
            this.$store.commit('setSelectedTenant', tenants[anchorIndex]);
          }
        } else{
          if(+userRole === 1){
            console.log('user has no extension. setting selected account to first', tenants[0].name);
            this.$store.commit('setSelectedTenant', tenants[0]);
          }
        }

        this.$store.commit('setLogin');
        this.$notify({
          title: 'Login Successful',
          message: 'Welcome Back!',
          type: 'success'
        });

        //lil jon welcome back.
/*        const audioObject = document.getElementById('yeah').querySelector('audio');
        audioObject.play();*/

        return this.$router.push('/omnia/contacts');
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../assets/scss/_variables';

  .login-page {
    background: #191d24;
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
        font-size: 15px;
        color: $text-color-accent;
        text-decoration: none;
        font-weight: 500;
      }

      .image-logo {
        width: 80px;
        margin: 0px auto;
        margin-bottom: 30px;
        display: block;
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

      .signin-box {
        font-size: 15px;
      }
    }
  }

  @media (max-width: 768px) {
    .layout-container .container .view.login-page {
      margin-left: -5px;
      margin-right: -5px;
      max-width: calc(100% + 10px);
    }
  }
</style>
