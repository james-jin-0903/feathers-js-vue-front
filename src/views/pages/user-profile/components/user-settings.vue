<template>
  <div class="mt-30">
    <div class="pv-20">
      <el-row>
        <span class="preferences-header mt-10">Themes</span>
      </el-row>
      <el-row class="mt-10" :gutter="20">
        <el-col :span="6">
          <span class="mr-10">Dark Mode</span>
        </el-col>
        <el-col :span="18" class="text-right">
          <el-switch
            :value="colorMode"
            @change="toggleMode"
            active-color="#35be8b"
            inactive-color="#ff8f02">
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <hr>
    <div class="pv-20">
      <el-row>
        <span class="preferences-header mt-10">Notifications</span>
      </el-row>
      <el-row class="mt-10" :gutter="20">
        <el-col :span="6">
          <span class="mr-10">Incoming calls</span>
        </el-col>
        <el-col :span="18" class="text-right">
          <el-switch
            :value="enableCallNotifications"
            @change="toggleEnableCallNotifications"
            active-color="#35be8b"
            inactive-color="#f25a6b">
          </el-switch>
        </el-col>
      </el-row>
      <el-row class="mt-10" :gutter="20">
        <el-col :span="6">
          <span class="mr-10">Chat</span>
        </el-col>
        <el-col :span="18" class="text-right">
          <el-switch
            :value="enableChatNotifications"
            :disabled="true"
            @change="toggleEnableChatNotifications"
            active-color="#35be8b"
            inactive-color="#f25a6b">
          </el-switch>
        </el-col>
      </el-row>
    </div>
    <hr>
  </div>
</template>

<script>

  import feathersClient from '../../../../feathers/feathers-client';

  export default {
    name: 'UserSettings',
    data () {
      return {
        pushEnabled: false,
        enableCallNotifications: false,
        enableChatNotifications: false
      }
    },
    computed: {
      colorMode(){
        return this.$store.state.layout.theme === 'theme-dark';
      },
      user(){
        return this.$store.state.auth.user;
      }
    },
    watch: {
      userPushEnabled(){
        this.pushEnabled = !!this.userPushEnabled;
      }
    },
    methods: {
      toggleMode() {
        const body = document.getElementById("body");
        const currentClass = body.className;
        const newTheme = currentClass === "theme-dark" ? "theme-default" : "theme-dark";
        body.className = newTheme;
        this.$store.commit('setTheme', newTheme)
      },
      toggleEnableCallNotifications(){
        this.enableCallNotifications = !this.enableCallNotifications;
        const {email, receiveQueueReports, tenantId, us_useldap, userRole} = this.user;
        feathersClient.service('users').patch(this.user.id, {
          email,
          extension: '',
          receiveQueueReports,
          resetPassword: false,
          tenantId,
          us_useldap,
          userRole,
          enableCallNotifications: this.enableCallNotifications
        }).then( () => {
          const currentUser = {...this.user};
          currentUser.enableCallNotifications = this.enableCallNotifications ? 1 : 0;
          this.$store.commit('auth/setUser', currentUser);
        });

      },
      toggleEnableChatNotifications(){
        this.enableChatNotifications = !this.enableChatNotifications;
        const {email, receiveQueueReports, tenantId, us_useldap, userRole} = this.user;
        feathersClient.service('users').patch(this.user.id, {
          email,
          extension: '',
          receiveQueueReports,
          resetPassword: false,
          tenantId,
          us_useldap,
          userRole,
          enableChatNotifications: this.enableChatNotifications
        }).then( () => {
          const currentUser = {...this.user};
          currentUser.enableChatNotifications = this.enableChatNotifications ? 1 : 0;
          this.$store.commit('auth/setUser', currentUser);
        });
      },
    },
    mounted(){
      if(this.user){
        this.enableChatNotifications =  this.user.enableChatNotifications === 1;
        this.enableCallNotifications =this.user.enableCallNotifications === 1;
      }
    }
  }

</script>

<style lang="scss" scoped>

  .preferences-header{
    font: {
      weight: bold;
      size: 13pt;
    }
  }

  hr{
    opacity: 0.25;
  }

</style>
