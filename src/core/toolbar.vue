<template>
  <div class="toolbar flex align-center justify-space-between">
    <div class="box-left box grow flex align-center">
      <button @click="toggleSidebar" v-if="menuBurger !== 'right'" class="toggle-sidebar card-base card-shadow--small">
        <v-svg sprite="menu"/>
      </button>
      <el-select :value="selectedTenant" value-key="id" filterable @change="onChangeTenant" v-if="dropdownVisible">
        <el-option
          v-for="item in tenantsList"
          :key="item.id"
          :label="item.name + ' - ' + item.tenantCode.toUpperCase()"
          :value="item">
        </el-option>
      </el-select>
      <el-select
        :value="selectedQueue"
        value-key="id"
        @change="changeQueue"
        v-if="queueMode">
        <el-option
          v-for="item in queueList"
          :key="item.id"
          :value="item"
          :label="item.name">
        </el-option>
      </el-select>
      <el-popover v-if="operatorMode" placement="right">
        <div class="filter-columns">
          <div class="contacts-filter mr-10">
            <h5
              v-if="operatorBranches.length"
              class="hud-subheader text-muted">
              BRANCHES
            </h5>
            <el-checkbox-group
              class="filter-group"
              v-model="activeOperatorBranches"
              @change="filterOperatorBranches">
              <el-checkbox
                :class="checkBoxClasses[index] + ' no-check filter-checkbox'"
                v-for="(item, index) in operatorBranches"
                :key="index"
                :label="item">
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <el-button class="keypad-btn nav-call-button" size="mini" type="primary" slot="reference">
          Filter Branches <i class="el-icon-arrow-down ml-5"></i>
        </el-button>
      </el-popover>
      <el-tooltip placement="bottom" :content="softphoneEnabled ? 'Softphone Enabled' : 'Softphone Disabled'" v-if="userHasExtension">
        <el-button
          id="devices-dropdown-toolbar"
          size="mini"
          circle
          @click="toggleSoftphoneEnabled"
          style="box-shadow: none;">
          <v-svg :class="softphoneEnabled ? 'voxo-green' : 'icon-muted'" sprite="headset"/>
        </el-button>
      </el-tooltip>
      <el-popover
        placement="bottom"
        trigger="click"
        v-show="softphoneEnabled"
        @show="queryAudioDevices"
        popper-class="devicePopper">
        <div class="dropdown-icon" slot="reference">
          <v-svg sprite="chevron-down"></v-svg>
        </div>
        <el-form class="form-modal">
          <el-select
            v-model="selectedAudioDevice"
            v-if="inputDevices.length"
            v-loading="devicesLoading"
            placeholder="Select Audio Device"
            @change="changeAudioInput">
            <template slot="prefix">Audio Device</template>
            <el-option
              v-for="(item,index) in inputDevices"
              :key="index"
              :value="item.deviceId"
              :label="item.label">
            </el-option>
          </el-select>
        </el-form>
      </el-popover>
    </div>
    <div class="box-right flex align-center pl-10">
      <el-tooltip
        :content="getTooltipStatus()"
        placement="bottom"
        v-if="queueServiceOptions">
        <el-dropdown trigger="click" :hide-on-click="false">
          <div class="agent-status-indicator">
            <status-indicator
              :status="agentStatus">
            </status-indicator>
            <v-svg class="voxo-purple" sprite="chevron-down"></v-svg>
          </div>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <span class="pr-10" style="min-width:75px; display:inline-block;">{{queueLoggedIn ? 'Logged In' : 'Logged Out'}}</span>
              <el-switch
                :value="queueLoggedIn"
                @change="toggleQueueLoggedIn"
                active-color="#35BE8B">
              </el-switch>
            </el-dropdown-item>
            <el-dropdown-item v-if="queueLoggedIn">
              <span class="pr-10" style="min-width: 75px; display:inline-block;">{{queuePaused ? 'Paused' : 'Unpaused'}}</span>
              <el-switch
                :value="queuePaused"
                @change="handleQueuePause"
                active-color="#FF8F02">
              </el-switch>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-tooltip>

      <el-dropdown class="toolbar-avatar" trigger="click" @command="onCommand" :hide-on-click="false" ref="avatarDropdown">
        <div class="avatar-group">
          <div class="contact-avatar" v-if="userHasAvatar">
            <img :src="userHasAvatar" />
          </div>
          <div class="contact-avatar" v-else-if="userHasExtension">
            {{user.myExtension.name.substring(0,1).toUpperCase()}}
          </div>
          <div class="contact-avatar" v-else-if="!userHasExtension && !userHasAvatar">
            V
          </div>
          <div class="status-light" v-if="userHasExtension">
            <status-indicator
              :pulse="getStatusFromEvent(userStatus) === 'positive' || getStatusFromEvent(userStatus) === 'intermediary'"
              :status="getStatusFromEvent(userStatus)">
            </status-indicator>
          </div>
          <div class="dnd-icon" v-if="userDND">
            <hr/>
            <status-indicator></status-indicator>
          </div>
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="/profile">Settings</el-dropdown-item>
          <el-tooltip
            v-if="userHasExtension"
            :content="userDND ? 'On' : 'Off'"
            placement="left">
            <el-dropdown-item>
              <span class="pr-10">DND</span>
              <el-switch
                :value="userDND"
                @change="toggleUserDND"
                active-color="#ff8f02">
              </el-switch>
            </el-dropdown-item>
          </el-tooltip>
          <el-dropdown-item command="/logout">Logout</el-dropdown-item>
          <el-dropdown-item command="/support">Need Help ?</el-dropdown-item>
          <el-dropdown-item>
              <div @click="toggleHotKeys">
                <span>
                  Hot Keys
                </span>
            </div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <button
        @click="toggleSidebar"
        v-if="menuBurger === 'right'"
        class="toggle-sidebar toggle-sidebar__right card-base card-shadow--small">
        <i class="el-icon-menu"></i>
      </button>
    </div>

    <el-dialog
      class="form-modal"
      :visible.sync="pauseReasonVisible"
      :close-on-press-escape="false"
      :show-close="false"
      :close-on-click-modal="false"
      :modal="false">
      <el-form>
        <h2 class="form-section-header">
          Agent Pause Reason
        </h2>
        <el-select
          style="margin: auto;"
          v-model="pauseReason"
          placeholder="Select Reason"
          :value="pauseReason">
          <template slot="prefix">Reason</template>
          <el-option
            v-for="(reason, index) in pauseReasons"
            :key="index"
            :label="reason"
            :value="reason">
          </el-option>
        </el-select>
        <el-input
          type="text"
          v-model="otherPauseReason"
          placeholder="Enter Other"
          v-if="pauseReason === 'Other'">
          <template class="label-prefix" slot="prefix">Other Reason</template>
        </el-input>
        <div class="inline-form-group justify-flex-end">
          <el-button
            @click="processPause">
            Submit
          </el-button>
          <el-button
            @click="cancelPause">
            Cancel
          </el-button>
        </div>
      </el-form>
    </el-dialog>

    <el-dialog
      width="30%"
      :visible.sync="hotKeysVisible"
      :show-close="true"
      :close-on-press-escape="true"
      :close-on-click-modal="false"
      :modal="true">
      <MacHotKeys v-if="osVersion === 'Mac'"></MacHotKeys>
      <WinHotKeys v-else></WinHotKeys>
    </el-dialog>

  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import feathersClient from "../feathers/feathers-client";
  import NotificationBox from '@/components/NotificationBox';
  import Search from '@/components/Search';
  import {globalEventBus} from "../globalEventBus";
  import colors from '../ref/colors';
  import extensionStatus from "../ref/extension-status";
  import { Janus } from 'janus-gateway';
  import MacHotKeys from '../views/pages/users/components/hot-keys-mac';
  import WinHotKeys from '../views/pages/users/components/hot-keys-win';

  export default {
    name: 'Toolbar',
    props: ['menuBurger'],
    components: {
      NotificationBox,
      Search,
      MacHotKeys,
      WinHotKeys
    },
    data() {
      return {
        popoverWidth: 300,
        fullscreen: false,
        lang: 'us',
        pauseReasonVisible: false,
        pauseReasons: ['Account Review', 'Break', 'Lunch', 'Meeting', 'Personal', 'Other'],
        pauseReason: '',
        otherPauseReason: '',
        activeOperatorBranches: [],
        checkBoxClasses: colors,
        inputDevices: [],
        devicesLoading: false,
        selectedAudioDevice: '',
        hotKeysVisible: false,
        modKeyActive: false,
      }
    },
    computed: {
      ...mapGetters('tenants', {tenantList: 'find'}),
      user() {
        console.log('something about the user changed');
        return this.$store.state.auth.user;
      },
      userHasExtension(){
        if(this.user){
          return this.user.hasOwnProperty('myExtension');
        }
        return false;
      },
      userHasAvatar(){
        if(this.user){
          return this.user.avatarPath;
        }
      },
      userStatus(){
        return this.$store.state.userStatus
      },
      selectedTenant() {
        return this.$store.state.selectedTenant;
      },
      tenantsList() {
        if(this.user){
          if (this.user.userRole == '1') {
            return this.tenantList({
              query: {
                $sort: {name: 1}
              }
            }).data;
          }
          if (this.user.userRole == '3') {
            return this.$store.state.authTenants;
          }
        }
        return [];
      },
      selectedQueue() {
        return this.$store.state.selectedQueue;
      },
      queueList(){
        return this.$store.state.queueList;
      },
      hudMode(){
        return this.$store.state.hudMode;
      },
      queueMode(){
        return this.$store.state.queueMode;
      },
      operatorMode(){
        return this.$store.state.operatorMode;
      },
      operatorBranches(){
        return this.$store.state.operatorBranches;
      },
      checkedOperatorBranches(){
        return this.$store.state.activeOperatorBranches;
      },
      dropdownVisible(){
        if(!this.user){
          return false;
        }
        if(this.user.userRole == '5'){
          return false;
        }
        if(this.hudMode){
          return false;
        }
        return true;
      },
      queueLoggedIn(){
        return this.$store.state.queueLoggedIn;
      },
      queuePaused(){
        return this.$store.state.queuePaused;
      },
      userDND(){
        return this.$store.state.userDND;
      },
      userHostServer(){
        return this.$store.state.userHostServer;
      },
      queuePausedReason(){
        return this.$store.state.queuePausedReason;
      },
      activeQueue(){
        if(this.user.hasOwnProperty('myExtension')){
          return this.$store.state.activeQueue && this.user.myExtension.tenantId === this.selectedTenant.id;
        }
        return false;
      },
      queueServiceOptions(){
        if(this.user){
          if(this.user.hasOwnProperty('myExtension')){
            return this.queueMode && this.activeQueue && this.user.myExtension.queueIds.includes(this.selectedQueue.id);
          }
        }
        return false;
      },
      agentStatus(){
        if(this.queueLoggedIn && this.queuePaused){
          return 'intermediary';
        }
        if(this.queueLoggedIn){
          return 'positive';
        }
        return 'negative';
      },
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      },
      audioInputDevice(){
        const fromStore = this.$store.state.audioInputDeviceId;
        const fromList = this.inputDevices;

        if(fromList.length){
          if(!fromStore){
            this.$store.commit('setAudioInputDeviceId', fromList[0].deviceId);
          }

          let foundMatch = false;
          if(fromStore){
            for(let i = 0; i < fromList.length; i++){
              if(fromList[i].deviceId === fromStore){
                foundMatch = true;
                break;
              }
            }
            if(foundMatch){
              this.selectedAudioDevice = fromStore;
              return fromStore;
            }
          } else{
            this.selectedAudioDevice = fromList[0].deviceId;
            return fromList[0].deviceId;
          }

          this.selectedAudioDevice = foundMatch ? fromStore : fromList[0].deviceId;
          return foundMatch ? fromStore : fromList[0].deviceId;
        }
        return null;
      },
      osVersion(){
        const isMac = navigator.appVersion.indexOf('Mac') !== -1;
        return isMac ? 'Mac' : 'Win';
      }
    },
    watch: {
      checkedOperatorBranches(){
        this.activeOperatorBranches = this.checkedOperatorBranches;
      }
    },
    methods: {
      onCommand(path) {
        this.$router.push(path)
      },
      toggleSidebar() {
        this.$emit('toggle-sidebar')
      },
      resizePopoverWidth() {
        if (window.innerWidth <= 768) {
          this.popoverWidth = 250
        } else {
          this.popoverWidth = 300
        }
      },
      onChangeTenant(val) {
        this.$store.commit('setSelectedTenant', val);
      },
      changeQueue(val){
        this.$store.commit('setSelectedQueue', val);
      },
      toggleQueueLoggedIn(val){
        if(this.$store.state.queueLoggedIn && this.$store.state.queuePaused){
          this.$notify({
            type: 'warning',
            message: 'You Must Unpause Yourself To Log Out!',
            title: 'Currently Paused'
          })
        } else{
          this.$store.commit('setQueueLoggedIn', val);
          globalEventBus.$emit('queueLoginToggled', val);
        }
      },
      toggleQueuePaused(val){
        this.$store.commit('setQueuePaused', val);
        let pauseReason = this.pauseReason;
        if(!pauseReason.length || pauseReason === 'Other'){
          pauseReason = this.otherPauseReason;
        }

        if(!pauseReason.length && val){
          this.$notify({
            title: 'Warning',
            message: 'You Must Include A Pause Reason!',
            type: 'warning'
          });
        } else{
          this.$store.commit('setQueuePausedReason', pauseReason);
          globalEventBus.$emit('queuePauseToggled', {value: val, pauseReason });
          this.pauseReasonVisible = false;
        }
      },
      toggleUserDND(val){
        this.$store.commit('setUserDND', val);
        //send the action to ami, userevent ami. this should result in an event firing the assures the store is accurate.
        const dndStatus = val === true ? 'on' : '';
        const{ peerName } = this.user.myExtension;
        feathersClient.service('nats-actions-handler').create({
          reqType: 'setDND',
          peerName,
          dndStatus,
          hostServer: this.userHostServer,
          extensionId: this.user.myExtension.id
        });
      },
      toggleSoftphone(val) {
        this.$store.commit('setSoftphoneVisibility', val);
      },
      toggleSoftphoneEnabled(){
        const value = !this.softphoneEnabled;
        this.$store.commit('setSoftphoneEnabled', value);
        if(value){
          this.queryAudioDevices();
        }
      },
      incomingCallStatus(val) {
        this.$store.commit('setIncomingCallStatus', val);
      },
      handleQueuePause(val){
        if(val){
          this.pauseReasonVisible = true;
        } else {
          this.toggleQueuePaused(false);
        }
      },
      processPause(){
        this.toggleQueuePaused(true);
        this.pauseReason = '';
        this.otherPauseReason = '';
      },
      cancelPause(){
        this.pauseReasonVisible = false;
        this.pauseReason = '';
        this.otherPauseReason = '';
      },
      getTooltipStatus(){
        if(this.queuePaused){
          return `Paused for ${this.queuePausedReason} ${this.selectedQueue.name}`;
        }
        if(this.queueLoggedIn){
          return `Logged in ${this.selectedQueue.name}`;
        }
        return `Logged out ${this.selectedQueue.name}`;
      },
      filterOperatorBranches(){
        this.$store.commit('setActiveOperatorBranches', this.activeOperatorBranches);
      },
      getStatusFromEvent(code){
        return extensionStatus(code);
      },
      changeAudioInput(val){
        this.$store.commit('setAudioInputDeviceId', val);
      },
      queryAudioDevices(){
        this.devicesLoading = true;
        let newDevices = [];
        Janus.listDevices( (devices) => {
          if(!devices.length){
            this.$notify({
              title: 'Warning',
              message: 'No Audio Devices Found. Softphone Is Disabled',
              type: 'warning'
            });
            this.$store.commit('setSoftphoneEnabled', false);
          } else {
            for(let i = 0; i < devices.length; i++) {
              if (devices[i].kind === 'audioinput') {
                newDevices.push(devices[i])
              }
            }

            this.inputDevices = newDevices;

            //devices were reloaded. we need to make sure the device in the store exists / makes sense.
            const fromStore = this.audioInputDevice;
            let foundMatch = false;
            for(let i = 0; i < this.inputDevices.length; i++){
              if(fromStore === this.inputDevices[i].deviceId){
                foundMatch = true;
                break;
              }
            }

            if(!foundMatch && devices.length){
              console.log('current device is no longer there. set a default');
              this.$store.commit('setAudioInputDeviceId', newDevices[0].deviceId);
            }
          }

          this.devicesLoading = false;
        }, {audio: true, video: false});
      },
      toggleHotKeys(){
        this.hotKeysVisible = true;
        this.$refs.avatarDropdown.visible = false;
      },
      closeHotKeys(){
        this.hotKeysVisible = false;
      }
    },
    mounted() {
      this.resizePopoverWidth();
      window.addEventListener('resize', this.resizePopoverWidth);

      //devices for webrtc
      globalEventBus.$on('janusReady', () => {
        let newDevices = [];
        Janus.listDevices((devices) => {
          if(!devices.length){
            this.$notify({
              title: 'Warning',
              message: 'No Audio Devices Found. Softphone Is Disabled',
              type: 'warning'
            });
            this.$store.commit('setSoftphoneEnabled', false);
          } else{
            for(let i = 0; i < devices.length; i++){
              if(devices[i].kind === 'audioinput'){
                newDevices.push(devices[i])
              }
            }
            this.inputDevices = newDevices;

            //devices were reloaded. we need to make sure the device in the store exists / makes sense.
            const fromStore = this.audioInputDevice;
            let foundMatch = false;
            for(let i = 0; i < this.inputDevices.length; i++){
              if(fromStore === this.inputDevices[i].deviceId){
                foundMatch = true;
                break;
              }
            }

            if(!foundMatch && devices.length){
              console.log('current device is no longer there. set a default');
              this.$store.commit('setAudioInputDeviceId', newDevices[0].deviceId);
            }
          }
        }, {audio:true, video:false});
      });

      window.addEventListener('keydown', e => {
        if(e.key === 'Alt'){
          e.preventDefault();
          this.modKeyActive = true
        }
        if(this.modKeyActive && e.code === 'KeyK'){
          e.preventDefault();
          this.hotKeysVisible ? this.closeHotKeys() : this.toggleHotKeys();
        }
      });
      window.addEventListener('keyup', e => {
        if(e.key === 'Alt'){
          this.modKeyActive = false;
        }
      });


    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizePopoverWidth);
      globalEventBus.$off('janusReady');
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/_variables';
  @import '../assets/scss/_mixins';

  .toolbar {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    .username {
      margin-left: 20px;
      font-weight: bold;
      cursor: pointer;
      @include text-bordered-shadow();
    }

    .avatar {
      border-radius: 50%;
      width: 35px;
      height: 35px;
      border: 1px solid #FFF;
      margin-left: 20px;
      box-sizing: border-box;
      display: block;
      cursor: pointer;
      box-shadow: 0 2px 5px 0 rgba(49, 49, 93, .1), 0 1px 2px 0 rgba(0, 0, 0, .08);
      transition: box-shadow .5s;

      &:hover {
        box-shadow: 0px 3px 10px 0 rgba(49, 49, 93, 0.08), 0px 2px 7px 0 rgba(0, 0, 0, 0.08);
      }
    }

    .notification-icon {
      font-size: 20px;
      outline: none;
      padding: 0;
      background: transparent;
      border: none;
      margin-left: 20px;
      //color: #aab7c5;
      color: transparentize($text-color, 0.7);
      @include text-bordered-shadow();

      &:hover {
        color: $text-color-accent;
      }
    }

    .toggle-sidebar {
      border: 1px solid transparent;
      height: 32px;
      min-height: 32px;
      line-height: 32px;
      width: 32px;
      min-width: 32px;
      max-width: 32px;
      box-sizing: border-box;
      text-align: center;
      margin: 0;
      outline: none;
      margin-right: 5px;
      font-size: 24px;
      padding: 0;
      cursor: pointer;
      display: inline-block;
      color: $text-color;
      background: white;
      display: none;
      opacity: 0;
      transition: all .2s;

      &__right {
        margin-right: 0px;
        margin-left: 5px;
      }

      &:hover, &:focus, &:active {
        color: $text-color-accent;
        border-color: $text-color-accent;
      }
    }

    .fullscreen-button {
      font-size: 24px;
      cursor: pointer;
      outline: none;
      padding: 0;
      background: transparent;
      border: none;
      margin-left: 20px;
      //color: #aab7c5;
      color: transparentize($text-color, 0.7);
      @include text-bordered-shadow();

      &:hover {
        color: $text-color-accent;
      }
    }

    .el-dropdown {
      .flag-icon {
        box-shadow: 0 2px 5px 0 rgba(49, 49, 93, .1), 0 1px 2px 0 rgba(0, 0, 0, .08);
        cursor: pointer;
        border: 1px solid lighten($background-color, 20%);
        background-color: lighten($background-color, 20%);
      }
    }
  }

  .el-switch{
    padding-left: 0;
  }

  .el-form{
    margin-top: 0;
  }

  .form-section-header{
    margin-top: 0;
  }

  .el-dropdown-menu__item--divided::before{
    display: none;
  }

  .agent-status-indicator{
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    .status-indicator{
      margin-right: 5px;
    }
  }

  .status-indicator{
    width: 15px;
    height: 15px;
  }

  .devicePopper{
    width: 300px;
    padding: 0 10px;
  }

  @media (max-width: 650px) {
    .toolbar {
      .username {
        display: none;
      }
    }
  }

  @media (max-width: 768px) {
    .toolbar {
      padding: 0 10px;

      .toggle-sidebar {
        display: block;
        opacity: 1;
      }

      .fullscreen-button {
        display: none;
      }
    }
  }
</style>

<style lang="scss" scoped>
  .contact-avatar {
    margin-left: 20px;
  }
  .form-modal{
    .el-select{
      margin: 0;
    }
  }
</style>
