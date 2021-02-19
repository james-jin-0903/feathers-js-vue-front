<template>
  <div>

    <el-button
      v-if="!navCollapsed && userHasExtension"
      :disabled="!softphoneEnabled"
      class="make-call-button"
      type="primary"
      @click="toggleSoftphone(true)">
      <v-svg class="voxo-white" sprite="call-2"/>
      <span class="make-call-text ml-10">{{softphoneEnabled ? 'MAKE A CALL' : 'SOFTPHONE DISABLED'}}</span>
    </el-button>
    <el-tooltip v-else placement="right" :content="softphoneEnabled ? 'MAKE A CALL' : 'SOFTPHONE DISABLED'">
      <el-button
        v-if="userHasExtension"
        :disabled="!softphoneEnabled"
        class="make-call-button-mobile"
        type="primary"
        @click="toggleSoftphone(true)"
        style="box-shadow: none; margin-left: 20px;">
        <v-svg class="voxo-white" sprite="phone"/>
      </el-button>
    </el-tooltip>

    <div class="my-calls-view">
      <div class="current-call-item"
           v-for="item in myCurrentCalls"
           :key="item.channel">
        <connected-call
          :channel="item.channel"
          :systemname="item.systemname"
          :cidnum="item.cidnum"
          :cidname="item.cidname"
          :direction="item.direction"
          :duration="item.duration"
          :disabled-buttons="item.disabledButtons"
          :call-item="item"
          :status="item.status"
          :softphone-call="item.softphoneCall"
          :sipHandle="item.sipHandle"
          :onHold="item.onHold"
          :atxferActive="item.atxferActive"
          :atxferCallerId="item.atxferCallerId"
          :conferencing="item.conferencing"
          :participants="item.participants"
          :confBridgeId="item.bridgeId">
        </connected-call>
      </div>
    </div>

    <el-menu
      ref="portalNav"
      v-if="!hudMode"
      :default-active.sync="activeLink"
      :mode="mode"
      @select="goto"
      :collapse="isCollapse"
      :unique-opened="true"
      class="main-navigation-menu"
      :class="{'nav-collapsed':isCollapse}">

      <el-menu-item index="/dashboard">
        <v-svg class="voxo-blue" sprite="mockup"/>
        <span slot="title">Dashboard</span>
      </el-menu-item>

      <el-submenu index="PhoneSystem">
        <template slot="title">
          <v-svg class="icon-muted" sprite="telephone-3"/>
          <span>Phone System</span>
        </template>
        <el-menu-item index="/extensions">
          <v-svg class="voxo-green" sprite="telephone-2"/>
          <span slot="title">Extensions</span>
        </el-menu-item>
        <el-menu-item index="/phone-numbers">
          <v-svg class="voxo-pink" sprite="phone-number"/>
          <span slot="title">Phone Numbers</span>
        </el-menu-item>
        <el-menu-item index="/virtual-receptionist">
          <v-svg class="voxo-purple" sprite="receptionist"/>
          <span slot="title">Virtual Receptionist</span>
        </el-menu-item>
        <el-menu-item index="/call-groups">
          <v-svg class="voxo-orange" sprite="group"/>
          <span slot="title">Call Groups</span>
        </el-menu-item>
        <el-menu-item index="/call-queues">
          <v-svg class="voxo-red" sprite="queue"/>
          <span slot="title">Call Queues</span>
        </el-menu-item>
        <el-menu-item index="/feature-codes">
          <v-svg class="voxo-blue" sprite="hash"/>
          <span slot="title">Feature Codes</span>
        </el-menu-item>
        <el-menu-item index="/voicemails">
          <v-svg class="voxo-purple" sprite="voicemail-2"/>
          <span slot="title">Voicemails</span>
        </el-menu-item>
        <el-menu-item index="/devices">
          <v-svg class="voxo-pink" sprite="devices"/>
          <span slot="title">Devices</span>
        </el-menu-item>
        <el-menu-item index="/faxes">
          <v-svg class="voxo-orange" sprite="fax-2"/>
          <span slot="title">Faxes</span>
        </el-menu-item>
        <el-menu-item index="/paging-groups">
          <v-svg class="voxo-green" sprite="megaphone"/>
          <span slot="title">Paging Groups</span>
        </el-menu-item>
        <el-menu-item index="/call-blocking">
          <v-svg class="voxo-dark-red" sprite="call-block"/>
          <span slot="title">Call Blocking</span>
        </el-menu-item>
        <el-menu-item index="/conference-bridges">
          <v-svg class="voxo-aqua" sprite="group-2"/>
          <span slot="title">Conference Bridges</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="Account">
        <template slot="title">
          <v-svg class="icon-muted" sprite="app"/>
          <span>Account</span>
        </template>
        <el-menu-item index="/locations">
          <v-svg class="voxo-green" sprite="ambulance"></v-svg>
          <span slot="title">e911 Locations</span>
        </el-menu-item>
        <el-menu-item index="/number-porting">
          <v-svg class="voxo-aqua" sprite="call-forward"></v-svg>
          <span slot="title">Number Porting</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <v-svg class="icon-muted" sprite="group-2"/>
          <span slot="title">Users</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <v-svg class="voxo-red" sprite="gear"></v-svg>
          <span slot="title">Settings</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="Billing">
        <template slot="title">
          <v-svg class="icon-muted" sprite="wallet"/>
          <span>Billing</span>
        </template>
        <el-menu-item index="/bill-history">
          <v-svg class="voxo-blue" sprite="file-add"/>
          <span slot="title">Bill History</span>
        </el-menu-item>
        <el-menu-item index="/payment-info">
          <v-svg class="voxo-green" sprite="credit-card"></v-svg>
          <span slot="title">Payment Info</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="Reports">
        <template slot="title">
          <v-svg class="icon-muted" sprite="report"/>
          <span>Reports</span>
        </template>
        <el-menu-item index="/call-summary">
          <v-svg class="voxo-pink" sprite="bar-chart"/>
          <span slot="title">Call Summary</span>
        </el-menu-item>
        <el-menu-item index="/user-reports">
          <v-svg class="voxo-purple" sprite="group-2"></v-svg>
          <span slot="title">Users</span>
        </el-menu-item>
        <el-menu-item index="/queue-reports">
          <v-svg class="voxo-red" sprite="queue"></v-svg>
          <span slot="title">Queues</span>
        </el-menu-item>
      </el-submenu>

      <el-submenu index="SystemAdmin">
        <template slot="title">
          <v-svg class="icon-muted" sprite="home-user"/>
          <span>System Admin</span>
        </template>
        <el-menu-item index="/accounts">
          <v-svg class="voxo-blue" sprite="lighthouse"/>
          <span slot="title">Accounts</span>
        </el-menu-item>
        <el-menu-item index="/admin/phone-numbers" v-if="isSuper">
          <v-svg class="voxo-green" sprite="phone-number" />
          <span slot="title">Phone Numbers</span>
        </el-menu-item>
        <el-menu-item index="/admin/users" v-if="isSuper">
          <v-svg class="icon-muted" sprite="group-2"/>
          <span slot="title">Users</span>
        </el-menu-item>
<!--        <el-menu-item index="/system-settings" v-if="isSuper">
          <v-svg class="voxo-red" sprite="gear"></v-svg>
          <span slot="title">System Settings</span>
        </el-menu-item>-->
        <el-menu-item index="/asterisk-nodes" v-if="isSuper">
          <v-svg class="voxo-red" sprite="gear"></v-svg>
          <span slot="title">Asterisk Nodes</span>
        </el-menu-item>
      </el-submenu>

      <router-link to="/omnia/contacts" :class="isCollapse ? 'content-center section-link' : 'section-link'">
        <v-svg class="icon-muted" sprite="toggle"/>
        <span class="omnia-name text-muted" v-if="!isCollapse">OMNIA</span>
      </router-link>
    </el-menu>

    <el-menu
      ref="hudNav"
      v-if="hudMode"
      :default-active.sync="activeLink"
      :mode="mode"
      @select="goto"
      :collapse="isCollapse"
      :unique-opened="true"
      background-color="transparent"
      class="main-navigation-menu"
      :class="{'nav-collapsed':isCollapse}">

      <el-menu-item index="/omnia/contacts">
        <v-svg class="icon-muted" sprite="user"/>
        <span slot="title">Contacts</span>
      </el-menu-item>

      <el-menu-item index="/omnia/activity">
        <v-svg class="icon-muted" sprite="bar-chart"/>
        <span slot="title">My Activity</span>
      </el-menu-item>

      <el-menu-item index="/omnia/queues" v-if="allowQueues">
        <v-svg class="icon-muted" sprite="group-4"/>
        <span slot="title">Call Queues</span>
      </el-menu-item>

      <el-menu-item index="/omnia/operator">
        <v-svg class="icon-muted" sprite="receptionist"/>
        <span slot="title">Operator Panel</span>
      </el-menu-item>

      <router-link to="/dashboard" :class="isCollapse ? 'content-center section-link' : 'section-link'" v-if="adminRoute">
        <v-svg class="icon-muted" sprite="laptop"/>
        <span class="text-muted" v-if="!isCollapse">Return To Admin</span>
      </router-link>

    </el-menu>

  </div>

</template>


<script>
  import {detect} from 'detect-browser'
  import {mapGetters} from "vuex";
  import MiniKeypad from '../views/hudportal/softphone/components/mini-keypad';
  import ConnectedCall from "../views/hudportal/softphone/components/connected-call";
  const browser = detect();

  export default {
    name: 'Nav',
    props: ['mode', 'isCollapse'],
    components: {ConnectedCall, MiniKeypad},
    data() {
      return {
        isIe: true,
        isEdge: true,
        activeLink: null
      }
    },
    methods: {
      goto(index, indexPath) {
        if (index.charAt(0) === '/') {
          this.$router.push(index)
          this.$emit('push-page', {page: index})
        }

      },
      setLink(path) {
        this.activeLink = path
      },
      toggleSoftphone(val) {
        this.$store.commit('setSoftphoneVisibility', val);
      },
    },
    computed: {
      ...mapGetters('currentcalls', {callList: 'find'}),
      ...mapGetters('mycurrentcalls', {myCallsList: 'find'}),
      hudMode() {
        return this.$store.state.hudMode;
      },
      queueMode(){
        return this.$store.state.queueMode;
      },
      user(){
        return this.$store.state.auth.user;
      },
      isSuper(){
        if(this.user){
          return this.$store.state.auth.user.userRole == '1';
        }
      },
      adminRoute(){
        if(this.user){
          if(this.user.userRole == '5' || this.user.userRole == '7'){
            return false;
          }
        }
        return true;
      },
      allowQueues(){
        if(this.user){
          if(this.user.userRole != '5'){
            return true;
          }

          if(this.user.userRole == '7'){
            const {adminQueues} = this.user;
            if(adminQueues.length){
              return true;
            }
          }

          if(this.user.hasOwnProperty('myExtension')){
            const {queueIds} = this.user.myExtension;
            if(queueIds.length){
              return true;
            }
          }
        }
        return false;
      },
      myCurrentCalls(){
        return this.myCallsList().data;
      },
      userHasExtension(){
        if(this.user){
          return this.user.hasOwnProperty('myExtension');
        }
        return false;
      },
      navCollapsed(){
        return this.$store.state.collapseNav;
      },
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      }
    },
    created() {
      if (browser.name !== 'ie') this.isIe = false
      if (browser.name !== 'edge') this.isEdge = false

      this.setLink(this.$router.currentRoute.path);
      this.$router.afterEach((to, from) => {
        this.setLink(this.$router.currentRoute.path);
      });
    }
  }
</script>
<!-- Scoped css needed here for side nav -->
<style lang="scss" scoped>
  @import '../assets/scss/_variables';

  .el-menu {
    border: none;
    padding-left: 10px;
    background-color: transparent !important;
  }

  .el-menu::before, .el-menu::after {
    display: none;
  }

  .el-submenu, .el-menu-item {
    .mdi, svg {
      vertical-align: middle;
      margin-right: 10px;
      display: inline-block;
      width: 24px;
      text-align: center;
      font-size: 24px;
    }
  }
</style>

<style lang="scss">
  @import '../assets/scss/variables';

  .main-navigation-menu {
    transition: width .1s;

  // Just delete the same stuff here as above

    &:not(.el-menu--collapse) {
      .el-submenu__title, .el-menu-item {
        padding-left: 10px !important;
        font-size: 16px;
        height: 38px;
        line-height: 30px;
        margin: 5px 0;
        background-color: transparent !important;
      }

      &:not(.el-menu--horizontal) {
        .el-menu-item, .el-submenu:not(.is-opened) {
          position: relative;
          border-radius: 4px;

          &:hover {
            background-color: #e7ebee !important;
          }

          &.is-active {
            color: #fff;
            background-color: #0e78e6 !important;

            svg {
              color: #fff;
            }

            &::before {
              background: $text-color-accent;
            }
          }
        }
      }

      .el-submenu.is-opened {
        background-color: transparent !important;
        position: relative;

        li {
          padding-left: 12px !important;
          line-height: 33px;
          margin: 3px 5px 3px 30px;
        }

        &::before {
          display: none;
        }

        .el-menu-item, .el-submenu {
          &::before, &::after {
            display: none;
          }
        }
      }

      .el-menu-item-group__title {
        padding: 15px 0 0px 20px;
        color: transparentize($text-color, 0.65);
      }
    }

    .el-submenu__title, .el-menu-item:not(.is-active) {
      color: $text-color;
      i {
        color: #a3adb8;
      }
    }

    &.el-menu--collapse {
      .el-menu-item-group__title {
        padding: 15px 0 0px 0px;
        width: 100%;
        text-align: center;
      }
    }

    &.el-menu--horizontal {
      white-space: nowrap;
      overflow: hidden;
      display: table;

      & > * {
        display: inline-block;
      }
    }

    &.nav-collapsed {
      .el-menu-item, .el-submenu__title {
        & > span {
          display: none;
        }
      }
    }
  }

  .main-navigation-submenu {
    .el-menu {
      background: #fff !important;

      .el-menu-item:not(.is-active) {
        color: $text-color;
      }

      .el-menu-item:hover {
        background-color: transparentize($background-color, 0.3) !important;
      }
    }
  }

  .el-submenu__icon-arrow {
    font-size: 15px;
    right: 10px;
  }

  .el-checkbox{
    display: block;
    margin-left: 15px;
  }

  .el-checkbox + .el-checkbox{
    margin-left: 15px;
  }

  .hud-subheader{
    margin: 0 10px 5px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
  }

  .filter-group{
    margin-bottom: 5px;
  }

  .el-switch {
    padding-left: 12px;
  }

  .omnia-name{
    letter-spacing: 2px;
  }

  .current-call-item{
    padding: 3px;
    margin-left: 10px;
    margin-bottom: 10px;
    position: relative;
  }

  .el-card {
    font-size: 13px;
    border: none;
    border-radius: 18px;

    .el-card__header {
      padding: 6px 10px;

      .avatar-group {
        align-items: center;
        justify-content: center;

        .contact-avatar {
          background-color: $background-color;
          box-shadow: inset 0 0 0 1px #c4cdd5, 0 1px 0 rgba(44, 45, 48, 0.15);
          color: #606266;
          border-radius: 50px;

          svg {
            width: 16px;

          }
        }
      }
    }

    .el-card__body {
      padding: 6px 10px;
    }

  }

  .call-connection-info{
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .el-button--info {
      border-color: transparent;
    }

    .keypad-btn {
      margin-left: auto;
      background-color: $voxo-purple;

    }

    .el-button--mini {
      width: 31px;
      height: 31px;

      svg {
        width: 17px;
        margin-top: -3px;
      }
    }
  }

  .atxfer-popover {
    min-width: 70px;
    margin-left: 10px;
    padding: 8px 2px;
    .popper__arrow {
      left: 16px !important;
    }
    .el-button {
      width: 31px;
      height: 31px;

      svg {
        width: 17px;
        margin-top: -3px;
      }
    }
  }

  .call-actions{
    display: flex;
  }

  .caller-id{
    padding-left: 8px;
    line-height: 13px;
  }

  .caller-id-number {
    font-size: 11px;
  }

  .call-badge {
    float: right;
    margin-left: auto;
    line-height: 10px;

    .el-badge__content {
      font-weight: 600;
    }
  }

  .connected-call-pop {
    border: none;
    padding: 8px;
    background: transparent !important;
    box-shadow: none;
  }

  .section-link{
    display: flex;
    align-items: center;
    padding-left: 11px !important;
    font-size: 16px;
    height: 38px;
    line-height: 30px;
    margin: 5px 0;
    background-color: transparent !important;
    color: inherit;
    text-decoration: none;
    svg{
      margin-right: 10px;
    }
  }

  .content-center{
    justify-content: center;
  }

  .make-call-button span{
    display: flex;
    justify-content: center;
    align-content: center;
  }

  button.make-call-button{
    padding: 10px;
    box-shadow: none;
    width: 90%;
    margin-left: 20px;
    margin-right: 20px;
  }

  .make-call-text{
    margin-top: 2px;
  }

</style>
