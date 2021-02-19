<template>

  <div class="text-center">
    <el-card :class="callItem.status === 'RINGING' ? 'border-ringing connected-call card-base card-shadow--medium' : 'connected-call card-base card-shadow--medium'" v-if="!navCollapsed">
      <div slot="header" class="clearfix">
        <div class="avatar-group">
          <div class="contact-avatar">
            <v-svg sprite="call-inbound" v-if="direction === 'recipient'"/>
            <v-svg sprite="call-outbound" class="voxo-blue" v-if="direction === 'initiator'"/>
          </div>
          <div class="caller-id">
            <div v-if="conferencing">
              <div class="text-left">
                <strong>{{ swapActive && atxferActive ? 'Transfer/Merge' : 'Conference'}}</strong>
              </div>
              <div class="text-muted caller-id-number">
                {{swapActive && atxferActive ? numberFormatter(atxferCallerId) : participants.length + 'Participants'}}
              </div>
            </div>
            <div v-else>
              <div class="text-left">
                <strong>{{ swapActive && atxferActive ? 'Transfer/Merge' : callerName}}</strong>
              </div>
              <div class="text-muted caller-id-number">
                {{ swapActive && atxferActive ? numberFormatter(atxferCallerId) : numberFormatter(cidnum)}}
              </div>
            </div>
          </div>
          <span class="call-badge">
            <el-tooltip effect="dark" content="Inbound" placement="right" v-if="direction === 'recipient'">
              <el-badge :value="convertTime(durationCount)" class="item" type="success"></el-badge>
            </el-tooltip>
            <el-tooltip effect="dark" content="Outbound" placement="right" v-if="direction === 'initiator'">
              <el-badge :value="convertTime(durationCount)" class="item" type="primary"></el-badge>
            </el-tooltip>
          </span>
        </div>
      </div>
      <div class="call-connection-info">
        <el-tooltip v-if="!attendedActive" effect="dark" content="Hangup" placement="bottom">
          <el-button
            class="call-button"
            @click="callHangup(callItem)"
            size="mini" circle type="danger"
            style="margin-left: 0px;">
            <v-svg sprite="phone-down"></v-svg>
          </el-button>
        </el-tooltip>
        <div v-else>
          <el-tooltip placement="bottom" content="Cancel Transfer">
            <el-button
              class="call-button"
              size="mini" circle type="danger"
              @click="cancelAtxfer(callItem)"
              style="margin-left: 0px;">
              <v-svg sprite="exit"></v-svg>
            </el-button>
          </el-tooltip>
          <el-tooltip placement="bottom" content="Complete Transfer">
            <el-button
              class="call-button"
              size="mini" circle type="primary"
              @click="completeAtxfer(callItem)">
              <v-svg sprite="call-forward"></v-svg>
            </el-button>
          </el-tooltip>
          <el-tooltip placement="bottom" content="Swap">
            <el-button
              class="call-button"
              size="mini" circle type="success"
              @click="swapAtxfer">
              <v-svg sprite="call-flip"></v-svg>
            </el-button>
          </el-tooltip>
          <el-tooltip placement="bottom" content="Merge">
            <el-button
              class="call-button"
              size="mini" circle
              @click="mergeAtxfer">
              <v-svg sprite="merge-2"></v-svg>
            </el-button>
          </el-tooltip>
        </div>
        <el-tooltip v-if="!attendedActive" effect="dark" content="Transfer / Conference" placement="bottom">
          <el-button
            style="margin-left: auto;"
            class="call-button"
            @click="requestTransfer(callItem)"
            :disabled="callItem.disabledButtons"
            size="mini" circle type="primary">
            <v-svg sprite="transfer"></v-svg>
          </el-button>
        </el-tooltip>
        <el-tooltip effect="dark" :content="muted ? 'Unmute' : 'Mute'" placement="bottom" v-if="softphoneCall">
          <el-button
            class="call-button"
            @click="callMute"
            size="mini" circle>
            <v-svg v-if="muted" sprite="microphone-mute"></v-svg>
            <v-svg v-else sprite="microphone"></v-svg>
          </el-button>
        </el-tooltip>
        <div v-if="!attendedActive">
          <el-tooltip effect="dark" :content="callOnHold ? 'Resume' : 'Hold'" placement="bottom" v-if="softphoneCall && !callOnHold">
            <el-button
              class="call-button hold-button"
              @click="callHold"
              size="mini" circle
              style="background-color: #ff8f02;">
              <v-svg sprite="call-pause" class="voxo-white"></v-svg>
            </el-button>
          </el-tooltip>
          <el-tooltip effect="dark" :content="callOnHold ? 'Resume' : 'Hold'" placement="bottom" v-if="softphoneCall && callOnHold">
            <el-button
              class="call-button play-button"
              @click="callHold"
              size="mini" circle
              style="background-color: #35be8b;">
              <v-svg sprite="play" class="voxo-white"></v-svg>
            </el-button>
          </el-tooltip>
        </div>
        <mini-keypad
          style="margin-left: 5px;"
          :channel="channel"
          :disabled="callItem.disabledButtons"
          :server="systemname">
        </mini-keypad>
      </div>
      <el-popover
        v-if="conferencing"
        width="350"
        class="conference-participants"
        placement="right">
        <el-table
          :data="participants"
          height="200px"
          stripe>
          <el-table-column
            prop="name"
            label="Name"
            sortable>
          </el-table-column>
          <el-table-column
            prop="number"
            label="Number"
            :formatter="listNumberFormatter"
            sortable>
          </el-table-column>
        </el-table>
        <div slot="reference">
          <div class="participants-icon">
            <el-icon class="el-icon-arrow-right voxo-white"></el-icon>
          </div>
        </div>
      </el-popover>
    </el-card>
    <el-popover
      popper-class="connected-call-pop"
      trigger="click"
      placement="right"
      width="250"
      v-if="navCollapsed">
      <el-card class="connected-call card-base card-shadow--medium">
        <div slot="header" class="clearfix">
          <div class="avatar-group">
            <div class="caller-id">
              <div v-if="conferencing">
                <div class="text-left">
                  <strong>{{ swapActive && atxferActive ? 'Transfer/Merge' : 'Conference'}}</strong>
                </div>
                <div class="text-muted caller-id-number">
                  {{swapActive && atxferActive ? numberFormatter(atxferCallerId) : participants.length + 'Participants'}}
                </div>
              </div>
              <div v-else>
                <div class="text-left">
                  <strong>{{ swapActive && atxferActive ? 'Transfer/Merge' : callerName}}</strong>
                </div>
                <div class="text-muted caller-id-number">
                  {{ swapActive && atxferActive ? numberFormatter(atxferCallerId) : numberFormatter(cidnum)}}
                </div>
              </div>
            </div>
            <span class="call-badge">
            <el-tooltip effect="dark" content="Inbound" placement="right" v-if="direction === 'recipient'">
              <el-badge :value="convertTime(durationCount)" class="item" type="success"></el-badge>
            </el-tooltip>
            <el-tooltip effect="dark" content="Outbound" placement="right" v-if="direction === 'initiator'">
              <el-badge :value="convertTime(durationCount)" class="item" type="primary"></el-badge>
            </el-tooltip>
          </span>
          </div>
        </div>
        <div class="call-connection-info">
          <el-tooltip v-if="!attendedActive" effect="dark" content="Hangup" placement="bottom">
            <el-button
              class="call-button"
              @click="callHangup(callItem)"
              size="mini" circle type="danger"
              style="margin-left: 0px;">
              <v-svg sprite="phone-down"></v-svg>
            </el-button>
          </el-tooltip>
          <div v-else>
            <el-tooltip placement="bottom" content="Cancel Transfer">
              <el-button
                class="call-button"
                size="mini" circle type="danger"
                @click="cancelAtxfer(callItem)"
                style="margin-left: 0px;">
                <v-svg sprite="exit"></v-svg>
              </el-button>
            </el-tooltip>
            <el-tooltip placement="bottom" content="Complete Transfer">
              <el-button
                class="call-button"
                size="mini" circle type="primary"
                @click="completeAtxfer(callItem)">
                <v-svg sprite="call-forward"></v-svg>
              </el-button>
            </el-tooltip>
            <el-tooltip placement="bottom" content="Swap">
              <el-button
                class="call-button"
                size="mini" circle type="success"
                @click="swapAtxfer">
                <v-svg sprite="call-flip"></v-svg>
              </el-button>
            </el-tooltip>
            <el-tooltip placement="bottom" content="Merge">
              <el-button
                class="call-button"
                size="mini" circle
                @click="mergeAtxfer">
                <v-svg sprite="merge-2"></v-svg>
              </el-button>
            </el-tooltip>
          </div>
          <el-tooltip v-if="!attendedActive" effect="dark" content="Transfer / Conference" placement="bottom">
            <el-button
              style="margin-left: auto;"
              class="call-button"
              @click="requestTransfer(callItem)"
              :disabled="callItem.disabledButtons"
              size="mini" circle type="primary">
              <v-svg sprite="transfer"></v-svg>
            </el-button>
          </el-tooltip>
          <el-tooltip effect="dark" :content="muted ? 'Unmute' : 'Mute'" placement="bottom" v-if="softphoneCall">
            <el-button
              class="call-button"
              @click="callMute"
              size="mini" circle>
              <v-svg v-if="muted" sprite="microphone-mute"></v-svg>
              <v-svg v-else sprite="microphone"></v-svg>
            </el-button>
          </el-tooltip>
          <div v-if="!attendedActive">
            <el-tooltip effect="dark" :content="callOnHold ? 'Resume' : 'Hold'" placement="bottom" v-if="softphoneCall && !callOnHold">
              <el-button
                class="call-button hold-button"
                @click="callHold"
                size="mini" circle
                style="background-color: #ff8f02;">
                <v-svg sprite="call-pause" class="voxo-white"></v-svg>
              </el-button>
            </el-tooltip>
            <el-tooltip effect="dark" :content="callOnHold ? 'Resume' : 'Hold'" placement="bottom" v-if="softphoneCall && callOnHold">
              <el-button
                class="call-button play-button"
                @click="callHold"
                size="mini" circle
                style="background-color: #35be8b;">
                <v-svg sprite="play" class="voxo-white"></v-svg>
              </el-button>
            </el-tooltip>
          </div>
          <mini-keypad
            style="margin-left: 5px;"
            :channel="channel"
            :disabled="callItem.disabledButtons"
            :server="systemname">
          </mini-keypad>
          <el-popover
            v-if="conferencing"
            width="350"
            class="conference-participants"
            placement="right">
            <el-table
              :data="participants"
              height="200px"
              stripe>
              <el-table-column
                prop="name"
                label="Name"
                sortable>
              </el-table-column>
              <el-table-column
                prop="number"
                label="Number"
                :formatter="listNumberFormatter"
                sortable>
              </el-table-column>
            </el-table>
            <div slot="reference">
              <div class="participants-icon">
                <el-icon class="el-icon-arrow-right voxo-white"></el-icon>
              </div>
            </div>
          </el-popover>
        </div>
      </el-card>
      <el-button slot="reference" class="keypad-btn nav-call-button" size="mini" circle style="background: #4CC3D2">
        <v-svg sprite="call-inbound" v-if="direction === 'recipient'"/>
        <v-svg sprite="call-outbound" v-if="direction === 'initiator'"/>
      </el-button>
    </el-popover>
  </div>

</template>

<script>

import miniKeypad from './mini-keypad';
import feathersClient from "../../../../feathers/feathers-client";
import { mapGetters } from 'vuex';
import {globalEventBus} from "../../../../globalEventBus";
import {dtmfKeyMap} from '../../../../ref/hotkey-mapping';

export default {
  name: 'ConnectedCall',
  props: {
    channel: {required: true},
    systemname: {required:true},
    cidnum: {required: true},
    cidname: {required: true},
    direction: {required: true},
    callItem: {required: true},
    duration: {required: true},
    softphoneCall: {required: true, default: false},
    sipHandle: {required: true},
    onHold: {required: true},
    atxferActive: {default: false},
    atxferCallerId: {default: null},
    conferencing: {default: false},
    participants: {default: () => []},
    confBridgeId: {default: ''}
  },
  data () {
    return {
      durationCounter: null,
      durationCount: this.duration,
      callOnHold: false,
      muted: false,
      attendedActive: false,
      confChannel: null,
      eventChannels: [],
      swapActive: false,
      modKeyActive: false
    }
  },
  components: { miniKeypad },
  computed: {
    ...mapGetters('mycurrentcalls', {myCallList: 'find'}),
    ...mapGetters('companydirectory', {loadCompanyDirectory: 'find'}),
    ...mapGetters('phonebook-entries', {loadPersonalDirectory: 'find'}),
    navCollapsed(){
      return this.$store.state.collapseNav;
    },
    softphoneEnabled(){
      return this.$store.state.softphoneEnabled;
    },
    userHostServer(){
      return this.$store.state.userHostServer;
    },
    user(){
      return this.$store.state.auth.user;
    },
    callerName(){
      let callerName = this.cidname;
      const bizContact = this.loadCompanyDirectory({
        query: {
          number: this.cidnum
        }
      }).data;
      if(bizContact.length){
        callerName = bizContact[0].name;
      } else{
        const personalContact = this.loadPersonalDirectory({
          query: {
            "PHONE1": this.cidnum
          }
        }).data;
        if(personalContact.length){
          callerName = personalContact[0].NAME;
        }
      }
      console.log(callerName);
      return callerName.length ? callerName : 'Unknown';
    }
  },
  watch: {
    onHold(){
      this.callOnHold = this.onHold;
    },
    atxferActive(){
      this.attendedActive = this.atxferActive;
      if(this.atxferActive){
        const element = document.getElementById('video-'+this.sipHandle.handleId);
        element.muted = false;
        this.callOnHold = false;
        this.swapActive = true;
      }
    },
    conferencing(){
      if(this.conferencing){
        this.joinConfSocketChannel();
        this.registerConfEvents();
      }
    },
    callOnHold(){
      if(this.callOnHold && this.conferencing){
        this.sipHandle.muteAudio();
        this.muted = true;
      }
      if(!this.callOnHold && this.conferencing){
        this.sipHandle.unmuteAudio();
        this.muted = false;
      }
    },
    softphoneEnabled(){
      this.softphoneEnabled ? this.registerKeyEvents() : this.removeKeyEvents;
    }
  },
  methods: {
    requestTransfer(item) {
      this.$store.commit('setSoftphoneVisibility', true);
      globalEventBus.$emit('transferRequest', item);
    },
    callHangup(item){

      if(this.softphoneCall){
        const element = document.getElementById('video-'+this.sipHandle.handleId);
        element.muted = false;
      }

      feathersClient.service('nats-actions-handler').create({
        reqType: 'hangup',
        channel: item.channel,
        server: item.systemname
      });

      const ringbackAudio = document.getElementById('outbound-call-ringing').querySelector('audio');
      ringbackAudio.pause();
      ringbackAudio.currentTime = 0;

      const endAudio = document.getElementById('call-ended').querySelector('audio');
      endAudio.play();
    },
    callHold(){
      if(this.callOnHold){

        //the call is being resume. we need to take care of holding the others
        globalEventBus.$emit('callResumed', this.sipHandle);
        const calls = this.myCallList().data;
        if(calls.length){
          for(let i = 0; i < calls.length; i++){
            const {channel, cidnum, softphoneCall} = calls[i];
            if(cidnum === this.cidnum){
              this.$store.commit('mycurrentcalls/updateItem', {channel, onHold: false});
            } else{
              if(softphoneCall){
                this.$store.commit('mycurrentcalls/updateItem', {channel, onHold: true});
              }
            }
          }
        }
        const element = document.getElementById('video-'+this.sipHandle.handleId);
        element.muted = false;
        this.sipHandle.send({message: {request: 'unhold'}});
        this.callOnHold = false;
      } else{
        const element = document.getElementById('video-'+this.sipHandle.handleId);
        element.muted = true;
        this.sipHandle.send({message: {request: 'hold'}});
        this.callOnHold = true;
      }
    },
    requestMerge(){
      globalEventBus.$emit('requestMerge', this.channel)
    },
    numberFormatter(number) {
      return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },
    listNumberFormatter(row, column, value) {
      return value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },
    updateDuration(){
      this.durationCount++;
    },
    convertTime(time) {
      if(time < 60) {return time + 's'}
      const hours = Math.floor(time / 3600);
      const remainderSeconds = time % 3600;
      const minutes = Math.floor(remainderSeconds / 60);
      const seconds = Math.round(remainderSeconds % 60);
      if (hours > 0) {return hours + 'hr ' + minutes + 'm';}
      if (minutes > 0) {return minutes + 'm ' + seconds + 's';}
      return 0;
    },
    callMute(){
      if(this.muted){
        this.sipHandle.unmuteAudio();
        this.muted = false;
      } else{
        this.sipHandle.muteAudio();
        this.muted = true;
      }
    },
    cancelAtxfer(item){
      this.$store.commit('mycurrentcalls/updateItem', {channel: this.channel, atxferActive: false, atxferCallerId: null});
      feathersClient.service('nats-actions-handler').create({
        reqType: 'cancelAtxfer',
        channel: item.channel,
        server: item.systemname
      });
    },
    completeAtxfer(item){
      this.$store.commit('mycurrentcalls/updateItem', {channel: this.channel, atxferActive: false, atxferCallerId: null});
      this.callHangup(item);
    },
    swapAtxfer(){
      this.swapActive = !this.swapActive;
      feathersClient.service('nats-actions-handler').create({
        reqType: 'swapAtxfer',
        channel: this.channel,
        server: this.userHostServer,
      });
    },
    mergeAtxfer(){
      this.$store.commit('mycurrentcalls/updateItem', {channel: this.channel, atxferActive: false, atxferCallerId: null});
      feathersClient.service('nats-actions-handler').create({
        reqType: 'mergeAtxfer',
        channel: this.channel,
        server: this.userHostServer
      });
    },
    joinConfSocketChannel(){
      const channelMemberships = feathersClient.service('channel-memberships');
      const confChannel = {
        roomType: 'conferences',
        bridgeId: this.confBridgeId,
        server: this.userHostServer
      };

      channelMemberships.create(confChannel).then(res => {
        this.confChannel = `conferences/${confChannel.server}/${confChannel.bridgeId}`;
      });
    },
    pushChannel(evt){
      if(evt.socketChannel === this.confChannel){
        this.eventChannels.push(evt);
      }
    },
    updateConference(evt){
      if(evt.socketChannel === this.confChannel){
        const activeChannels = [...this.eventChannels];
        let numbers = [this.user.myExtension.number];
        for(let i = 0; i < activeChannels.length; i++){
          numbers.push(activeChannels[i].number);
        }

        let newList = [];
        const currentList = [...this.participants]
        for(let i = 0; i < currentList.length; i++){
          if(numbers.includes(currentList[i].number)){
            newList.push(currentList[i]);
          }
        }

        this.$store.commit('mycurrentcalls/updateItem', {
          channel: this.channel,
          participants: null,
        });
        this.$store.commit('mycurrentcalls/updateItem', {
          channel: this.channel,
          participants: newList,
        });
        this.eventChannels = [];
      }
    },
    registerConfEvents(){
      globalEventBus.$on('conferenceChannel', this.pushChannel);
      globalEventBus.$on('conferenceInfoComplete', this.updateConference);
    },
    processReconnect(){
      if(this.conferencing){
        this.joinConfSocketChannel();
      }
    },
    handleHotKeys(e){
      if(e.key === 'Alt'){
        e.preventDefault();
        this.modKeyActive = true
      }
      if(this.softphoneEnabled){
        if(this.modKeyActive && !this.callOnHold){
          if(dtmfKeyMap.hasOwnProperty(e.code)){
            e.preventDefault();
            this.sendDTFM(dtmfKeyMap[e.code]);
            return;
          }
          if(e.code === 'KeyM'){
            e.preventDefault();
            this.callMute();
            return;
          }
          if(e.code === 'KeyH'){
            e.preventDefault();
            this.callHold();
            return;
          }
          if(e.code === 'KeyT'){
            e.preventDefault();
            this.requestTransfer(this.callItem);
            return
          }
          if(e.code === 'KeyB'){
            e.preventDefault();
            this.callHangup(this.callItem);
          }
        }
      }
    },
    disableKeyMod(e){
      if(e.key === 'Alt'){
        this.modKeyActive = false;
      }
    },
    registerKeyEvents(){
      window.addEventListener('keydown', this.handleHotKeys);
      window.addEventListener('keyup', this.disableKeyMod);
    },
    sendDTFM(val){
      feathersClient.service('nats-actions-handler').create({
        reqType: 'DTMF',
        value: val,
        channel: this.channel,
        hostServer: this.systemname
      });
    }
  },
  mounted(){
    this.durationCounter = setInterval(this.updateDuration, 1000);
    globalEventBus.$on('appReconnected', this.processReconnect);
    this.registerKeyEvents();
  },
  beforeDestroy() {
    const channelMemberships = feathersClient.service('channel-memberships');
    clearInterval(this.durationCounter);
    if(this.confChannel){
      channelMemberships.remove(null, {query: {channelName: this.confChannel}}).then(res => console.log(res));
    }
    globalEventBus.$off('conferenceChannel', this.pushChannel);
    globalEventBus.$off('conferenceInfoComplete', this.updateConference);
    globalEventBus.$off('appReconnected', this.processReconnect);
    window.removeEventListener('keydown', this.handleHotKeys);
    window.removeEventListener('keyup', this.disableKeyMod);
  }
}

</script>

<style lang="scss" scoped>

@import '../../../../assets/scss/variables';

.nav-call-button{
  background-color: $voxo-aqua;
}

.caller-id-number {
  font-size: 11px;
  text-align: left;
}

@keyframes border-pulsate {
  0%   { border-color: $voxo-green; }
  50%  { border-color: transparent; }
  100% { border-color: $voxo-green; }
}

.border-ringing{
  border-width: 2px;
  border-style: solid;
  animation: border-pulsate 2s infinite;
  will-change: transform;
}

.hold-button svg{
  margin-top: -2px !important;
}

.play-button svg{
  margin-left: 2px !important;
  margin-top: -2px !important;
}

button.call-button{
  margin-left: 5px;
}

button.hold-button{
  box-shadow: inset 0 0 0 1px #c4cdd561, 0 1px 0 rgba(44, 45, 48, 0.15);
}

.atxfer-popover {
  min-width: 70px;
}

.conference-participants{
  position: absolute;
  right: 0;
  top: 38px;
}

.participants-icon{
  cursor: pointer;
  padding: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $voxo-blue;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.el-icon-arrow-right:before{
  font-size: 11px;
  position: relative;
  top: -1px;
  margin-left: 1px;
}

</style>
