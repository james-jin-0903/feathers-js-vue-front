<template>
<div class="incoming-call">
    <el-dialog
      width="350px"
      :visible.sync="incomingCallDialog"
      :modal="true"
      :close-on-click-modal="false"
      :show-close="false">
      <template slot="title">
        <div class="incoming-call-header">
          Incoming Call
        </div>
      </template>
      <div class="incoming-call-modal">
        <div class="incoming-call-container">
          <div class="incoming-caller-info">
            <div class="avatar-group">
              <div class="contact-avatar" v-if="contactAvatar">
                <img :src="contactAvatar" :alt="incomingCaller" :title="incomingCaller" />
              </div>
              <div class="contact-avatar" v-else>
                {{nameFormatter(incomingCaller).substring(0,1).toUpperCase()}}
              </div>
            </div>
            <div class="incoming-caller-stats">
              <p class="caller-name"><strong>{{nameFormatter(incomingCaller)}}</strong></p>
              <p class="caller-number">{{numberFormatter(incomingPhoneNumber)}}</p>
            </div>
          </div>
          <div class="incoming-actions">
            <div class="incoming-accept-button">
              <div class="button-wrapper" @click="acceptCall">
                <v-svg class="voxo-green mr-10" sprite="call"/>
                <strong>Accept</strong>
              </div>
            </div>
            <div class="incoming-decline-button">
                <div class="button-wrapper" @click="declineCall">
                  <v-svg class="voxo-red mr-10" sprite="call-block"/>
                  <strong>Decline</strong>
                </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import {mapGetters} from 'vuex';
import {globalEventBus} from '../../../../globalEventBus';
import feathersClient from "../../../../feathers/feathers-client";


export default {
    name: "IncomingCall",
    props: {
      modalHandleId: {required: true}
    },
    data() {
      return {
        incomingCallDialog: false,
        incomingCaller: 'James Harrod',
        incomingPhoneNumber: '1001',
        contactAvatar: null,
        callStatus: false,
        messageVisible: false,
        innerVisible: false,
        optionsVisible: false,
        customReminder: false,
        reminderTime: '',
        reminderMessage: '',
        message: '',
        newCaller: 'John Smith',
        newCallerPhoneNumber: '123-456-7890',
        jsep: null,
        sipHandle: null,
      }
    },
    computed: {
      ...mapGetters('mycurrentcalls', {currentCallList: 'find'}),
      ...mapGetters('companydirectory', {directoryList: 'find'}),
      ...mapGetters('phonebook-entries', {getPhonebookEntries: 'find'}),
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      },
      audioInputDevice(){
        return this.$store.state.audioInputDeviceId;
      }
    },
    watch: {
      softphoneEnabled(){
        if(this.softphoneEnabled){
          this.registerSoftPhoneEvents();
        } else{
          this.killSoftphoneEvents();
        }
      }
    },
    methods: {
      acceptCall() {
        this.$emit('acceptCall', this.sipHandle);

        let audio = true;
        if(this.audioInputDevice){
          audio = {deviceId: this.audioInputDevice}
        }

        let jsep = {...this.jsep};
        this.sipHandle.createAnswer({
          jsep,
          media: {
            audio,
            video: false
          },
          trickle: true,
          success: (jsep) => {
            this.sipHandle.send({
              message: {
                request: 'accept'
              },
              jsep
            });
            this.incomingCallDialog = false;
          },
          error: (error) => {
            console.log(error);
            this.sipHandle.send({
              message: {
                request: 'decline',
                code: 480
              }
            });
          }
        });
        this.clearPushNotify();
        setTimeout(this.flagSoftphone, 500);
      },
      declineCall() {
        this.incomingCallDialog = false;
        console.log(`Declining call from ${this.incomingCaller}: ${this.incomingPhoneNumber}`);
        this.sipHandle.send({
          message: {
            request: 'hangup'
          }
        });
        this.clearPushNotify();
        this.processHangup();
      },
      async clearPushNotify(){
        const reg = await navigator.serviceWorker.getRegistration();
        const notifications = await reg.getNotifications({
          includeTriggered: true
        });
        notifications.forEach((notification) => {
          notification.close();
        });
      },
      flagSoftphone(){
        //so a couple things to do here. we need to flag this current call as softphone and be sure all the other are onHold
        const calls = this.currentCallList().data;
        if(calls.length){
          for(let i = 0; i < calls.length; i++){
            const {channel, cidnum, softphoneCall} = calls[i];
            if(cidnum === this.incomingPhoneNumber){
              this.$store.commit('mycurrentcalls/updateItem', {channel, softphoneCall: true, sipHandle: this.sipHandle, onHold: false});
              const element = document.getElementById('video-'+this.sipHandle.handleId);
              element.muted = false;
            } else{
              if(softphoneCall !== undefined && softphoneCall){
                const element = document.getElementById('video-'+calls[i].sipHandle.handleId);
                element.muted = true;
              }
              this.$store.commit('mycurrentcalls/updateItem', {channel, onHold: true});

            }
          }
        }
      },
      processHangup(){
        //after terminating the janus session send the actual hangup to asterisk as well.
        const call = this.currentCallList({
          query: {
            cidnum: this.incomingPhoneNumber
          }
        }).data;
        if(call.length){
          const {systemname, channel} = call[0];
          feathersClient.service('nats-actions-handler').create({
            reqType: 'hangup',
            channel,
            server: systemname
          });
        }
      },
      numberFormatter(number) {
        return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },
      nameFormatter(name){
        return name.replace(/['"]+/g, '');
      },
      getAvatar(){
        const contact = this.directoryList({
          query: {
            number: this.incomingPhoneNumber
          }
        }).data;
        if(contact.length){
          this.contactAvatar = contact[0].avatarPath
        }
      },
      getDirectoryName(){
        if(!this.contactAvatar){
          const contact = this.getPhonebookEntries({
            query: {
              "PHONE1": this.incomingPhoneNumber
            }
          }).data;
          if(contact.length){
            this.incomingCaller = contact[0].NAME;
          }
        }
      },
      registerSoftPhoneEvents(){
        globalEventBus.$on('janusIncomingCall-'+this.modalHandleId, (evt) => {
          const {jsep, result, sipHandle} = evt;
          this.sipHandle = sipHandle;
          this.jsep = jsep;
          this.incomingCaller = result.displayname;
          this.incomingPhoneNumber = sipHandle.cidnum;
          this.contactAvatar = null;
          this.getAvatar();
          this.getDirectoryName();
          this.incomingCallDialog = true;

          //check if already on softphone call
          const calls = this.currentCallList({
            query: {
              softphoneCall: true
            }
          }).data;
          if(calls.length){
            const audioWaiting = document.getElementById('call-waiting-sound').querySelector('audio');
            audioWaiting.play();
          } else{
            const audioRing = document.getElementById('call-ringing').querySelector('audio');
            audioRing.play();
          }

        });
        globalEventBus.$on('janusCallHangup-'+this.modalHandleId, () => {
          this.incomingCallDialog = false;
          const audioRing = document.getElementById('call-ringing').querySelector('audio');
          audioRing.pause();
          audioRing.currentTime = 0;

          const audioRingback = document.getElementById('outbound-call-ringing').querySelector('audio');
          audioRingback.pause();
          audioRingback.currentTime = 0;

          const endAudio = document.getElementById('call-ended').querySelector('audio');
          endAudio.play();
        });
        globalEventBus.$on('janusCallAccepted-'+this.modalHandleId, () => {
          const audioRing = document.getElementById('call-ringing').querySelector('audio');
          audioRing.pause();
          audioRing.currentTime = 0;

          const ringback = document.getElementById('outbound-call-ringing').querySelector('audio');
          ringback.pause();
          ringback.currentTime = 0;
        });
        globalEventBus.$on('pushAcceptCall-'+this.modalHandleId,  async () => {
          this.acceptCall();
        });
        globalEventBus.$on('pushDeclineCall-'+this.modalHandleId, () => {
          this.declineCall();
        });
      },
      killSoftphoneEvents(){
        globalEventBus.$off([
          'janusCallHangup-'+this.modalHandleId,
          'janusCallAccepted-'+this.modalHandleId,
          'janusIncomingCall-'+this.modalHandleId,
          'pushAcceptCall-'+this.modalHandleId,
          'pushDeclineCall-'+this.modalHandleId
        ]);
      }
    },
    mounted(){
      //softphone functionality if enabled
      if(this.softphoneEnabled){
        this.registerSoftPhoneEvents();
      }
    }
}
</script>

<style lang="scss" scoped>

@import '../../../../assets/scss/_variables';
@import '../../../../assets/scss/_mixins';

.contact-avatar{
  width: 35px;
  height: 35px;
  margin-right: 10px;
}

.caller-number {
  font-size: 11px;
  text-align: left;
}

.incoming-caller-info{
  display: flex;
  align-items: center;
  padding: 10px;
}

.incoming-caller-stats{
  p{
    margin: 0;
    text-align:left;
  }
}
</style>
