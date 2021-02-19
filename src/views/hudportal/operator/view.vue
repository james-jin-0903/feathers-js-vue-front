<template>

  <div style="overflow-y: auto; overflow-x: hidden;">
    <el-row :gutter="30" class="ashleys-flex-wrapper">
      <el-col :xs="24" :sm="24" :md="8" :lg="9" :xl="9" class="operator-users">
        <h3 class="form-section-header flex align-center">
          <span style="margin-right: auto;">USERS</span>
          <el-form class="table-search-form">
            <el-form-item>
              <el-input
                v-model="userSearch"
                placeholder="Search"
                clearable>
              </el-input>
            </el-form-item>
          </el-form>
        </h3>
        <el-table
          v-loading="usersLoading"
          :data="filteredUsers()"
          :default-sort="{prop: 'name', order: 'ascending'}"
          height="calc(100vh - 10.5em)"
          class="voxo-table"
          stripe>
          <el-table-column
            label=""
            width="43px">
            <template slot-scope="scope">
              <el-tooltip placement="left" :content="userTooltipStatus(scope.row)">
                <div class="avatar-group">
                  <div class="contact-avatar" v-if="scope.row.avatarPath">
                    <img :src="scope.row.avatarPath" :alt="scope.row.name" :title="scope.row.name" />
                  </div>
                  <div class="contact-avatar" v-else>
                    {{scope.row.name.substring(0,1).toUpperCase()}}
                  </div>
                  <div class="status-light">
                    <status-indicator
                      :pulse="getStatusFromEvent(scope.row.extStatus) === 'positive' || getStatusFromEvent(scope.row.extStatus) === 'intermediary'"
                      :status="getStatusFromEvent(scope.row.extStatus)">
                    </status-indicator>
                  </div>
                  <div class="dnd-icon" v-if="scope.row.dnd === 'on'">
                    <hr/>
                    <status-indicator></status-indicator>
                  </div>
                </div>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="Name"
            sortable>
          </el-table-column>
          <el-table-column
            prop="number"
            label="Number"
            sortable>
          </el-table-column>
          <el-table-column v-if="userTenantSelected" width="60px">
            <template slot-scope="scope">
              <el-tooltip placement="right" content="Call">
                <el-button
                  v-if="softphoneEnabled"
                  class="manager-action-button"
                  v-loading="callStarting"
                  size="mini"
                  type="text"
                  @click="dialCall(scope.row.number)"
                  style="box-shadow: none;">
                  <v-svg class="voxo-green" sprite="phone"/>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :xs="24" :sm="24" :md="15" :lg="15" :xl="15" class="ashleys-flex">
        <el-row :gutter="30" class="panel-right operator-stats">
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <div class="card-base card-shadow--medium mb-10 widget small-widget">
              <div class="widget-header ph-20 pb-10 mb-10">
                <div class="stats-flex-body fadeInLeft">
                  <h3 class="stat-header widget-title text-truncate">
                    <v-svg width="18" height="18" class="voxo-green" sprite="call-inbound"/>
                    <span class="pl-10">ACTIVE CALLS</span>
                  </h3>
                  <h1 class="m-0 text-truncate voxo-blue text-center stat-number">{{activeCalls}}</h1>
                  <div class="stats-sub"></div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <div class="card-base card-shadow--medium mb-30 widget small-widget">
              <div class="widget-header ph-20 pb-10 mb-10">
                <div class="stats-flex-body fadeInLeft">
                  <h3 class="stat-header widget-title text-truncate">
                    <v-svg width="18" height="18" class="voxo-aqua" sprite="telephone"/>
                    <span class="pl-10">EXTENSIONS</span>
                  </h3>
                  <h1 class="m-0 text-truncate voxo-blue text-center stat-number">{{userCount}}</h1>
                  <div class="stats-sub">
                    <div class="sub-stat-group">
                      <div class="sub-stat-number">
                        {{onlineUsers}}
                      </div>
                      <div class="sub-stat-title">
                        ONLINE
                      </div>
                    </div>
                    <div class="sub-stat-group">
                      <div class="sub-stat-number text-right">
                        {{offlineUsers}}
                      </div>
                      <div class="sub-stat-title">
                        OFFLINE
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
            <div class="card-base card-shadow--medium mb-30 widget small-widget">
              <div class="widget-header ph-20 pb-10 mb-10">
                <div class="stats-flex-body fadeInLeft">
                  <h3 class="stat-header widget-title text-truncate">
                    <v-svg width="18" height="18" class="voxo-purple" sprite="group"/>
                    <span class="pl-10">USERS:CALLS</span>
                  </h3>
                  <h1 class="m-0 text-truncate voxo-blue text-center stat-number">{{availableUsers}} : {{activeCalls}}</h1>
                  <div class="stats-sub"></div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row class="operator-active-calls">
          <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
            <h3 class="form-section-header flex align-center">
              <span style="margin-right: auto;">ACTIVE CALLS</span>
              <el-form class="table-search-form">
                <el-form-item>
                  <el-input
                    v-model="callSearch"
                    placeholder="Search"
                    clearable>
                  </el-input>
                </el-form-item>
              </el-form>
            </h3>
            <el-table
              :data="filteredCalls()"
              height="calc(100vh - 30em)"
              class="voxo-table agent-calls"
              :default-sort="{prop: 'name', order: 'ascending'}"
              stripe>
              <el-table-column
                type="index"
                width="30"
                align="center">
              </el-table-column>
              <el-table-column
                v-if="userTenantSelected && userIsAdmin && softphoneEnabled"
                width="70px">
                <template slot-scope="scope">
                  <el-tooltip class="item" effect="dark" content="Listen" placement="left">
                    <el-button
                      class="manager-action-button"
                      @click="callSpyRequest(scope.row.channel,false)">
                      <v-svg class="voxo-blue" sprite="eye"></v-svg>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip class="item" effect="dark" content="Coach" placement="right">
                    <el-button
                      class="manager-action-button"
                      @click="callSpyRequest(scope.row.channel,true)">
                      <v-svg class="voxo-pink" sprite="hearing"></v-svg>
                    </el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column
                label="Name"
                prop="name">
              </el-table-column>
              <el-table-column
                prop="cidname"
                label="Caller Name"
                sortable>
              </el-table-column>
              <el-table-column
                prop="cidnum"
                label="Caller Number"
                :formatter="numberFormatter"
                sortable>
              </el-table-column>
              <el-table-column
                label="Duration">
                <template slot-scope="scope">
                    <span class="call-badge">
                      <el-tooltip effect="dark" content="Inbound" placement="right" v-if="scope.row.direction === 'recipient'">
                        <el-badge :value="convertTimeHold(scope.row.duration)" class="item" type="success"></el-badge>
                      </el-tooltip>
                      <el-tooltip effect="dark" content="Outbound" placement="right" v-if="scope.row.direction === 'initiator'">
                        <el-badge :value="convertTimeHold(scope.row.duration)" class="item" type="primary"></el-badge>
                      </el-tooltip>
                    </span>
                </template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>

</template>

<script>

  import {mapActions, mapGetters} from 'vuex';
  import feathersClient from "../../../feathers/feathers-client";
  import extensionStatus from "../../../ref/extension-status";
  import {globalEventBus} from "../../../globalEventBus";
  import moment from 'moment';

  export default {
    name: 'OMNIAOperator',
    data() {
      return {
        statusChannel: '',
        usersLoading: true,
        callStarting: false,
        userSearch: '',
        callSearch: '',
        filteringActive: false,
        activeCalls: 0,
        durationCounter: null
      }
    },
    computed: {
      ...mapGetters('extensions', {extensionList: 'find'}),
      ...mapGetters('currentcalls', {findCalls: 'find'}),
      user(){
        return this.$store.state.auth.user;
      },
      selectedTenant(){
        return this.$store.state.selectedTenant;
      },
      userList(){
        return this.extensionList({
          query: {
            branch: {$in: this.activeBranches}
          }
        }).data;
      },
      activeBranches(){
        return this.$store.state.activeOperatorBranches;
      },
      operatorBranches(){
        return this.$store.state.operatorBranches;
      },
      userCount(){
        if(this.userList){
          return this.userList.length;
        }
      },
      availableUsers(){
        return this.extensionList({
          query: {
            branch: {$in: this.activeBranches},
            extStatus: {$nin: ['negative', 'UNAVAILABLE']},
            dnd: {$ne: 'on'}
          }
        }).data.length;
      },
      onlineUsers(){
        return this.extensionList({
          query: {
            branch: {$in: this.activeBranches},
            extStatus: {$nin: ['negative', 'UNAVAILABLE']},
          }
        }).data.length;
      },
      offlineUsers(){
        return this.extensionList({
          query: {
            branch: {$in: this.activeBranches},
            extStatus: {$in: ['negative', 'UNAVAILABLE']},
          }
        }).data.length;
      },
      currentCallList(){
        const calls = this.findCalls({
          query: {
            branch: {$in: this.activeBranches}
          }
        }).data;
        this.activeCalls = calls.length;
        return calls;
      },
      userTenantSelected(){
        if(this.user){
          if(this.user.hasOwnProperty('myExtension')){
            return this.user.myExtension.tenantId === this.selectedTenant.id;
          }
        }
        return false
      },
      userIsAdmin() {
        if(this.user){
          const adminRoles = [1,3]
          return adminRoles.includes(this.user.userRole);
        }
      },
      userHostServer(){
        return this.$store.state.userHostServer;
      },
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      }
    },
    watch: {
      user(){
        if(this.user){
          this.joinSocketChannel();
        }
      }
    },
    methods: {
      ...mapActions('extensions', {queryExtensions: 'find'}),
      async joinSocketChannel() {
        if(this.user.hasOwnProperty('myExtension')){
          if(this.user.myExtension.tenantId != this.selectedTenant.id){
            await feathersClient.service('channel-memberships').create({
              roomType: 'extensions',
              tenantCode: this.selectedTenant.tenantCode
            }).then( res => {
              this.statusChannel = `extensions/${this.selectedTenant.tenantCode}`;
            });
          }
        }
      },
      async queryUsers(){
        //query extensions and figure out branches.
        this.usersLoading = true;
        await this.queryExtensions({query: {tenantId: this.selectedTenant.id}}).then( (res) => {
          this.usersLoading = false;
          let branchOptions = [];
          res.forEach((item) => {
            if (!branchOptions.includes(item.branch) && item.branch !== '') {
              branchOptions.push(item.branch)
            }
          });
          branchOptions.sort();
          this.$store.commit('setOperatorBranches', branchOptions);
          this.$store.commit('setActiveOperatorBranches', branchOptions);
          feathersClient.service('nats-actions-handler').create({
            reqType: 'refreshConnectedCalls',
            hostServer: this.userHostServer,
            peerName: this.user.myExtension.peerName,
            panelTenantCode: this.selectedTenant.tenantCode,
            tenantCode: this.selectedTenant.tenantCode,
            userId: this.user.id,
            userExten: this.user.myExtension.number
          });
        });
      },
      userTooltipStatus(user){
        if(user.dnd === 'on'){
          return 'Do Not Disturb'
        }
        if(user.extStatus === 'NOT_INUSE'){
          return 'Idle'
        }
        if(user.extStatus === 'INUSE'){
          return 'On A Call'
        }
        if(user.extStatus === 'RINGING'){
          return 'Ringing'
        }
        if(user.extStatus === 'UNAVAILABLE'){
          return 'Offline';
        }
        if(!user.extStatus){
          return 'Offline';
        }
        return 'Status Unknown';
      },
      getStatusFromEvent(code) {
        return extensionStatus(code)
      },
      numberFormatter(row, column, value) {
        return value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },
      convertTimeHold(time) {
        const hours = Math.floor(time / 3600);
        const remainderSeconds = time % 3600;
        const minutes = Math.floor(remainderSeconds / 60);
        const seconds = Math.round(remainderSeconds % 60);

        if (hours > 0) {return hours + 'hr ' + minutes + 'm';}
        if (minutes > 0) {return minutes + 'm ' + seconds + 's';}
        if (seconds > 0) {return seconds + 's';}
        return '0';
      },
      durationInSeconds(value){
        const durationParts = value.split(':');
        const hours = +durationParts[0];
        const minutes = +durationParts[1];
        const seconds = +durationParts[2];
        return hours*3600 + minutes*60 + seconds;
      },
      filteredUsers() {
        return this.userList.filter(data => !this.userSearch
          || data.number.toLowerCase().includes(this.userSearch.toLowerCase())
          || data.name.toLowerCase().includes(this.userSearch.toLowerCase())
        )
      },
      filteredCalls() {
        return this.currentCallList.filter(data => !this.callSearch
          || data.cidname.toLowerCase().includes(this.callSearch.toLowerCase())
          || data.cidnum.toLowerCase().includes(this.callSearch.toLowerCase())
          || data.name.toLowerCase().includes(this.callSearch.toLowerCase())
        )
      },
      checkCallExists(item){
        const queryCall = this.findCalls({query: {channel: item.channel}}).data;
        return !!queryCall.length;
      },
      pushedConnected(item){
        if(item.status === 'INUSE' && item.direction.length){
          if(item.cidnum === '' || item.cidnum === '<unknown>'){
            return false;
          }
          return item.cidnum.substr(0, 1) !== '*';
        }
        return false;
      },
      updateHoldTimes() {
        const connectedCallers = this.findCalls().data;
        //updates call durations
        for (let i = 0; i < connectedCallers.length; i++) {
          const connectedUpdate = {
            channel: connectedCallers[i].channel,
            duration: +connectedCallers[i].duration + 1
          };
          this.$store.commit('currentcalls/updateItem', connectedUpdate);
        }
      },
      callSpyRequest(channel, whisper){
        const splitChannel = channel.split('-');
        const channelPrefix = `${splitChannel[0]}-${splitChannel[1]}-`;

        if(this.softphoneEnabled){
          if(whisper){
            globalEventBus.$emit('dialSoftphone', `*5${splitChannel[0].split('/')[1]}`);
          } else{
            globalEventBus.$emit('dialSoftphone', `*6${splitChannel[0].split('/')[1]}`);
          }
        } else{
          const extensionNumber = this.user.myExtension.number;
          const channelName = `Local/${extensionNumber}@authenticated`;
          let reqBody = {
            reqType: 'spy',
            whisper,
            channelName,
            account: this.user.myExtension.tenantCode,
            channelPrefix,
            callerId: extensionNumber,
            tenantCode: splitChannel[1],
            hostServer: this.userHostServer
          };
          feathersClient.service('nats-actions-handler').create(reqBody);
        }

      },
      dialCall(exten){

        if(this.softphoneEnabled){
          globalEventBus.$emit('dialSoftphone', exten);
        } else{
          const {number, callerId, tenantCode, name} = this.user.myExtension;
          this.callStarting = true;
          feathersClient.service('nats-actions-handler').create({
            reqType: 'dial',
            extension: number,
            callerId,
            name,
            dest: exten,
            tenantCode,
            hostServer: this.userHostServer
          }).then( () => {this.callStarting = false});
        }

      },
      removeListeners(){
        const channelMemberships = feathersClient.service('channel-memberships');
        channelMemberships.removeListener('extensionStatus');
        channelMemberships.removeListener('notifyExtStatus');
        channelMemberships.removeListener('notifyActiveCall');
        globalEventBus.$off('appReconnected');
      },
    },
    created(){
      this.queryUsers();
    },
    mounted(){
      const channelMemberships = feathersClient.service('channel-memberships');
      if(this.user){
        this.joinSocketChannel();
      }

      //this is a counter to update the hold times for each caller in line
      this.durationCounter = setInterval(this.updateHoldTimes, 1000);

      this.$store.commit('setOperatorMode', true);

      channelMemberships.on('extensionStatus', evt => {
        const {status, channel, cidname, peername} = evt;
        const user = this.extensionList({query: {peerName: peername}}).data;
        if(user.length){
          this.$store.commit('extensions/updateItem', {id: user[0].id, extStatus: status});

          if(evt.hasOwnProperty('ishangup')){
            if(evt.ishangup){
              this.$store.commit('currentcalls/removeItem', evt.channel);
            } else{
              const callItem = {...evt, name: user[0].name, branch: user[0].branch};
              const callExists = this.checkCallExists(evt);
              if(this.pushedConnected(evt)){
                if(callExists){
                  const updateData = {
                    channel,
                    cidname
                  };
                  this.$store.commit('currentcalls/updateItem', updateData);
                } else {
                  this.$store.commit('currentcalls/addItem', {duration: 0, ...callItem});
                }
              }
            }
          } else{
            if (status === 'NOT_INUSE') {
              this.$store.commit('currentcalls/removeItem', evt.channel);
            } else {
              const callItem = {...evt, name: user[0].name, branch: user[0].branch};
              const callExists = this.checkCallExists(evt);
              if(this.pushedConnected(evt)){
                if(callExists){
                  const updateData = {
                    channel,
                    cidname
                  };
                  this.$store.commit('currentcalls/updateItem', updateData);
                } else {
                  this.$store.commit('currentcalls/addItem', {duration: 0, ...callItem});
                }
              }
            }
          }
          if(!evt.direction.length){
            this.$store.commit('extensions/updateItem', {id: user[0].id, dnd: evt.dnd})
          }
        }
      });

      //listens for updates to extension availability
      channelMemberships.on('notifyExtStatus', item => {
        const {peerName} = item;
        let user = this.extensionList({query: {peerName}}).data;
        if(user.length){
          const updateData = {
            id: user[0].id
          };
          if (item.status === 'UNAVAILABLE') {
            updateData.extStatus = 'UNAVAILABLE';
          } else{
            updateData.extStatus = 'NOT_INUSE';
          }
          this.$store.commit('extensions/updateItem', updateData);
        }
      });

      channelMemberships.on('notifyActiveCall', item => {
        const {channels, userId} = item;

        if (+userId === this.user.id) {
          for (let call in channels) {
            if (channels.hasOwnProperty(call)) {
              const theChannel = channels[call];
              if (!this.checkCallExists(item)) {
                const {channel, exten, connectedlinenum, connectedlinename, application, timestamp} = theChannel;
                const channelParts = channel.match(/([A-Z]*)\w+/g);
                const peername = `${channelParts[1]}-${channelParts[2]}`;
                let user = this.extensionList({
                  query: {
                    peerName: peername,
                  }
                }).data;
                if (user.length) {
                  const foundMember = user[0];
                  let cidnum = connectedlinenum === '<unknown>' ? exten : connectedlinenum;
                  let cidname = connectedlinename === '<unknown>' ? '' : connectedlinename;
                  let direction = application === 'Dial' ? 'initiator' : 'recipient';
                  const callData = {
                    name: foundMember.name,
                    branch: foundMember.branch,
                    channel,
                    cidnum,
                    cidname,
                    direction,
                    peername,
                    systemname: item.systemname,
                    duration: moment().unix() - timestamp
                  };
                  if (cidnum.length) {
                    this.$store.commit('currentcalls/addItem', callData);
                  }
                }
              }
            }
          }
        }
      });

      //monitor socket connection and reconnect to channel
      globalEventBus.$on('appReconnected', async () => {
        console.log('the app did reconnect');
        await this.joinSocketChannel();
        if(this.user.hasOwnProperty('myExtension')){
          //this will bust the current connected calls and call a service to refresh the list
          this.$store.commit('currentcalls/clearList');
          feathersClient.service('nats-actions-handler').create({
            reqType: 'refreshConnectedCalls',
            hostServer: this.userHostServer,
            peerName: this.user.myExtension.peerName,
            panelTenantCode: this.selectedTenant.tenantCode,
            tenantCode: this.selectedTenant.tenantCode,
            userId: this.user.id,
            userExten: this.user.myExtension.number
          });
        }
      });
    },
    beforeDestroy() {
      const channelMemberships = feathersClient.service('channel-memberships');

      //leave the status channel if the tenant doesn't match user tenant
      if(this.user.hasOwnProperty('myExtension')){
        if(this.user.myExtension.tenantId !== this.selectedTenant.id){
          channelMemberships.remove(null, {query: {channelName: this.statusChannel}}).then(res => console.log(res));
        }
      }
      this.$store.commit('setOperatorMode', false);
      this.$store.commit('extensions/clearList');
      this.$store.commit('currentcalls/clearList');
      clearInterval(this.durationCounter);
      this.removeListeners();
    }
  }

</script>

<style lang="scss" scoped>

  .manager-action-button{
    width: 25px;
    height: 25px;
    padding: 1px;
    svg{
      width:15px;
    }
  }

  .status-light, .dnd-icon{
    right: 0px;
  }

  .stat-number{
    font-size: 3em;
  }

  .stat-header{
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1em;
    padding-bottom: 5px;
  }

  .stats-sub{
    display: flex;
    justify-content: space-between;
    align-self: flex-end;
    height: 45px;
  }

  .stats-flex-body{
    height: 200px;
    display: flex;
    flex-wrap: wrap;
    >*{
      flex-basis: 100%;
    }
  }

  .sub-stat-number{
    font: {
      weight: bold;
    }
  }

  .sub-stat-title{
    font-size: 0.85em;
  }

  .call-badge{
    float: none;
  }

  .el-form{
    .el-form-item{
      max-width: 300px;
      margin-bottom: 5px;
    }
  }

  .panel-right {
    margin-top: 42px;
  }

  .form-section-header{
    margin-top: 0;
    margin-bottom: 4px;
  }

  @media (max-width: 1000px){

    .ashleys-flex-wrapper{
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      >*{
        flex-basis: 100%;
      }
      .operator-users{
        order: 2;
      }
    }

    .ashleys-flex{
      order: 1;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      >*{
        flex-basis: 100%;
      }
      .operator-stats{
        order: 2;
      }
      .operator-active-calls{
        order: 1;
      }
    }
  }

</style>

