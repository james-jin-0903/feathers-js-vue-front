<template>
  <div class="layout-container flex justify-center"
       :class="{
		  'column':navPos === 'top' || navPos === 'bottom',
		  'boxed':boxed,
		  'footer-above':footer === 'above',
		  'content-only':!navPos
	  }"
       v-loading="appLoading"
       element-loading-text="(There seems to be some connectivity issues. We are trying to re-initiate the connection to the application)">

    <transition name="fade">
      <div class="splash-screen" v-if="splashScreen">
        <div class="wrap">
          <div class="wrap lds-ellipsis"><div></div><div></div><div></div><div></div></div>
        </div>
      </div>
    </transition>

    <vertical-nav
      :position="navPos"
      :collapse-nav="collapseNav"
      :open-sidebar.sync="openSidebar"
      @push-page="closeSidebar"
      v-if="navPos === 'left'"/>

    <div class="container flex column box grow">

      <div class="header" v-if="toolbar === 'top'">
        <Toolbar @toggle-sidebar="openSidebar = !openSidebar" :menu-burger="navPos"/>
      </div>
      <horizontal-nav :position="navPos" @push-page="closeSidebar" v-if="navPos === 'top'"/>
      <div class="header" v-if="toolbar === 'bottom'">
        <Toolbar @toggle-sidebar="openSidebar = !openSidebar" :menu-burger="navPos"/>
      </div>

      <div class="main box grow flex">
        <span class="main-out-border--top-left" v-if="roundedCorners"></span>
        <span class="main-out-border--top-right" v-if="roundedCorners"></span>
        <span class="main-out-border--bottom-left" v-if="roundedCorners"></span>
        <span class="main-out-border--bottom-right" v-if="roundedCorners"></span>
        <transition :name="viewAnimation" mode="out-in">
          <router-view class="view box grow"/>
        </transition>
        <Keypad @softphoneDial="dialSoftphone"/>
      </div>

      <horizontal-nav :position="navPos" @push-page="closeSidebar" v-if="navPos === 'bottom'" style="margin-bottom:0;"/>

      <Footer v-if="footer === 'below'" :position="footer"/>
    </div>

    <vertical-nav
      :position="navPos"
      :collapse-nav="collapseNav"
      :open-sidebar.sync="openSidebar"
      @push-page="closeSidebar"
      v-if="navPos === 'right'"/>

    <Footer v-if="footer === 'above'" :position="footer"/>

<!--    SOUNDS-->
    <div id="yeah">
      <audio src="/static/yeah_sfx.mp3" type="audio/mpeg"></audio>
    </div>
    <div id="call-accepted">
      <audio src="/static/sounds/start_notification.mp3" type="audio/mpeg"></audio>
    </div>
    <div id="call-ringing">
      <audio src="/static/sounds/incoming_call.wav" type="audio/wav" loop></audio>
    </div>
    <div id="call-ended">
      <audio src="/static/sounds/end_notification.mp3" type="audio/mpeg"></audio>
    </div>
    <div id="outbound-call-ringing">
      <audio src="/static/sounds/ringback.wav" type="audio/wav" loop></audio>
    </div>
    <div id="call-waiting-sound">
      <audio src="/static/sounds/call_waiting.mp3" type="audio/mpeg"></audio>
    </div>

<!--    STREAMS-->
    <audio id="video-master" autoplay style="display: none;"></audio>
    <audio id="video-0" autoplay style="display: none;"></audio>
    <audio id="video-1" autoplay style="display: none;"></audio>
    <audio id="video-2" autoplay style="display: none;"></audio>
    <audio id="video-3" autoplay style="display: none;"></audio>
    <audio id="video-4" autoplay style="display: none;"></audio>
    <audio id="video-5" autoplay style="display: none;"></audio>

<!--    MIGHT NEED TO INJECT MULTIPLE INSTANCES OF THESE-->
    <incoming-call
      modalHandleId="master"
      @acceptCall="holdOtherCalls">
    </incoming-call>
    <incoming-call
      modalHandleId="0"
      @acceptCall="holdOtherCalls">
    </incoming-call>
    <incoming-call
      modalHandleId="1"
      @acceptCall="holdOtherCalls">
    </incoming-call>
    <incoming-call
      modalHandleId="2"
      @acceptCall="holdOtherCalls">
    </incoming-call>
    <incoming-call
      modalHandleId="3"
      @acceptCall="holdOtherCalls">
    </incoming-call>
    <incoming-call
      modalHandleId="4"
      @acceptCall="holdOtherCalls">
    </incoming-call>
    <incoming-call
      modalHandleId="5"
      @acceptCall="holdOtherCalls">
    </incoming-call>

  </div>
</template>


<script>
  import {detect} from 'detect-browser'

  const browser = detect()
  import HorizontalNav from '@/core/horizontal-nav.vue';
  import VerticalNav from '@/core/vertical-nav.vue';
  import Toolbar from '@/core/toolbar.vue';
  import Footer from '@/core/footer.vue';
  import Keypad from '../src/views/hudportal/softphone/components/keypad';
  import IncomingCall from '../src/views/hudportal/softphone/components/incoming-call';

  import feathersClient from "./feathers/feathers-client";
  import {globalEventBus} from './globalEventBus';
  import {mapGetters} from 'vuex';
  import extensionStatus from "./ref/extension-status";
  import { Janus } from 'janus-gateway';
  import moment from 'moment';
  import pushIcon from '@/assets/images/logo96.png';

  export default {
    name: 'App',
    components: {
      HorizontalNav,
      VerticalNav,
      Toolbar,
      Footer,
      Keypad,
      IncomingCall
    },
    data() {
      return {
        openSidebar: false,
        innerWidth: 0,
        apiOffline: false,
        janusMaster: null,
        janusMasterId: null,
        janus: null,
        numHelpers: 6,
        janusHelpers: [],
        opaqueId: null,
        modKeyActive: false
      }
    },
    computed: {
      ...mapGetters('mycurrentcalls', {myCallsList: 'find'}),
      ...mapGetters('companydirectory', {loadCompanyDirectory: 'find', getDirectoryItem: 'get'}),
      ...mapGetters('phonebook-entries', {loadPersonalDirectory: 'find'}),
      navPos() {
        if (this.innerWidth <= 768 && (this.$store.getters.navPos === 'top' || this.$store.getters.navPos === 'bottom')) {
          return 'left'
        }
        return this.$store.getters.navPos
      },
      toolbar() {
        return this.$store.getters.toolbar
      },
      footer() {
        return this.$store.getters.footer
      },
      boxed() {
        return this.$store.getters.boxed
      },
      roundedCorners() {
        return this.$store.getters.roundedCorners
      },
      viewAnimation() {
        return this.$store.getters.viewAnimation || 'none'
      },
      isLogged() {
        return this.$store.getters.isLogged
      },
      splashScreen() {
        return this.$store.getters.splashScreen
      },
      currentRoute(){
        return this.$route;
      },
      collapseNav(){
        return this.$store.state.collapseNav;
      },
      appLoading(){
        return this.$store.state.appLoading;
      },
      user(){
        return this.$store.state.auth.user;
      },
      audioInputDevice(){
        return this.$store.state.audioInputDeviceId;
      },
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      },
      keyPadVisible(){
        return this.$store.state.softphoneVisible;
      }
    },
    methods: {
      resizeOpenNav() {
        this.innerWidth = window.innerWidth
        if (window.innerWidth <= 768) {
          this.$store.commit('setCollapsedNav', false);
        }
      },
      closeSidebar() {
        this.openSidebar = false
      },
      getStatusFromEvent(code) {
        return extensionStatus(code)
      },
      pushedConnected(item){
        if(item.status === 'RINGINUSE'){item.status = 'RINGING'}
        if((item.status === 'INUSE' || 'RINGING') && item.direction.length){
          if(item.cidnum === '' || item.cidnum === '<unknown>'){
            return false;
          }
          return true;
        } else {
          return false;
        }
      },
      checkCallExists(item){
        const queryCall = this.myCallsList({query: {channel: item.channel}}).data;
        return !!queryCall.length;
      },
      callButtonStatus(item){
        return item.status === 'RINGING';
      },
      holdOtherCalls(sipHandle){

        const ringbackAudio = document.getElementById('outbound-call-ringing').querySelector('audio');
        ringbackAudio.pause();
        ringbackAudio.currentTime = 0;

        const handleId = sipHandle.getId();

        //this is fallback functionality if the user forgot to put the current call on hold
        //check master if not this handle disable audio
        if(this.janusMaster.getId() !== handleId){
          if(this.janusMaster.webrtcStuff.pc){
            const element = document.getElementById('video-master');
            element.muted = true;
            this.janusMaster.send({message: {request: 'hold'}});
          }
        }

        //check helpers if not this handle disable audio
        this.janusHelpers.forEach( (helper, index) => {
          if(helper.getId() !== handleId){
            if(helper.webrtcStuff.pc){
              const element = document.getElementById('video-'+helper.handleId);
              element.muted = true;
              helper.send({message: {request: 'hold'}});
            }
          }
        });

      },
      dialSoftphone(number){

        //grab number to call
        const uri = `sip:${number}@sip.voxo.co`;

        let audio = true;
        if(this.audioInputDevice){
          audio = {deviceId: this.audioInputDevice}
        }

        if(!this.janusMaster.webrtcStuff.pc){
          //use the main
          //update store for other calls
          this.janusMaster.cidnum = number;
          this.updateStoreCalls(number, this.janusMaster);
          this.holdOtherCalls(this.janusMaster);
          //create offer and send call
          this.janusMaster.createOffer({
            media: {
              audio,
              video: false
            },
            trickle: true,
            success: (jsep) => {
              this.janusMaster.send({
                message: {
                  request: 'call',
                  uri
                },
                jsep
              });
              const ringback = document.getElementById('outbound-call-ringing').querySelector('audio');
              ringback.play();
            }
          });
        } else{
          //use a helper
          console.log('master is busy. looking for a helper');
          for(let i = 0; i < this.numHelpers; i++){
            if(!this.janusHelpers[i].webrtcStuff.pc){
              //found a help to user
              this.janusHelpers[i].cidnum = number;
              this.updateStoreCalls(number, this.janusHelpers[i]);
              this.holdOtherCalls(this.janusHelpers[i]);
              //create offer and send call
              this.janusHelpers[i].createOffer({
                media: {
                  audio,
                  video: false
                },
                trickle: true,
                success: (jsep) => {
                  this.janusHelpers[i].send({
                    message: {
                      request: 'call',
                      uri
                    },
                    jsep
                  });
                  const ringback = document.getElementById('outbound-call-ringing').querySelector('audio');
                  ringback.play();
                }
              });
              break;
            } else{
              console.log('this helper is busy');
            }
          }
        }

      },
      janusInit(){
        if(this.user.hasOwnProperty('myExtension') && !this.janusMaster){
          //create master janus instance and put in store
          this.opaqueId = "voxo-"+Janus.randomString(12);

          let janusServer = '';
          const HOSTS = process.env.VUE_APP_API_HOST.split(',');
          if(process.env.NODE_ENV === 'production'){
            janusServer = [
              `wss://${HOSTS[0]}/webrtc`,
              `wss://${HOSTS[1]}/webrtc`
            ];
          }else{
            janusServer = HOSTS[2];
          }

          Janus.init({
            debug: false,
            callback: () => {
              setTimeout( () => {
                globalEventBus.$emit('janusReady')
                //this is an event to let our click to dial extension know that the app is ready
                const vueStatus = new CustomEvent('vueAppStatus', {
                  detail: {
                    isReady: true
                  }
                });
                window.dispatchEvent(vueStatus);
              }, 1000);
              this.janus = new Janus({
                server: janusServer,
                success: () => {
                  //this is the master session. worry about helpers later
                  this.janus.attach({
                    plugin: 'janus.plugin.sip',
                    opaqueId: this.opaqueId,
                    success: (sipHandle) => {
                      sipHandle.handleId = 'master';
                      this.janusMaster = sipHandle;

                      // go ahead and automatically register user peer
                      const {peerName, peerSecret} = this.user.myExtension;
                      const register = {
                        request: 'register',
                        username: `sip:${peerName}@sip.voxo.co`,
                        secret: peerSecret,
                        proxy: 'sip:sip.voxo.co'
                      };
                      this.janusMaster.send({
                        message: register
                      });
                    },
                    onremotestream: (stream) => {
                      const video = document.getElementById('video-master');
                      Janus.attachMediaStream(video, stream);
                    },
                    onmessage: (msg, jsep) => {

                      if(msg.hasOwnProperty('result')){
                        const {result} = msg;
                        const callData = {
                          result,
                          jsep
                        };

                        const sipHandle = this.janusMaster;

                        //successful register, grab master id and create helpers
                        if(result.event === 'registered'){
                          this.janusMasterId = result.master_id;
                          //now we have a master id. create the helpers if not a re-registration
                          if(!this.janusHelpers.length){
                            this.createHelpers(this.janusMasterId);
                          }
                        }

                        //incoming call.
                        if(result.event === 'incomingcall'){
                          sipHandle.cidnum = result.username.split(':')[1].split('@')[0];
                          callData.sipHandle = sipHandle;
                          globalEventBus.$emit('janusIncomingCall-'+sipHandle.handleId, callData);
                          this.callPushNotify(sipHandle.handleId, sipHandle.cidnum, result.displayname);
                        }

                        //hangup event to signal audio track kill
                        if(result.event === 'hangup'){
                          this.clearPushNotify();
                          this.bustCall(sipHandle.cidnum);
                          globalEventBus.$emit('janusCallHangup-'+sipHandle.handleId);
                        }

                        //early media call accept and signal audio track kill
                        if(result.event === 'progress'){
                          if(jsep !== null && jsep !== undefined){
                            //this is a remote answer from an outbound call. we need to match it in the store and flag it as a sofphone call
                            //before this answer completes we need to make sure all other calls are on hold man
                            this.holdOtherCalls(sipHandle);
                            const callCidnum = result.username.split(':')[1].split('@')[0];
                            this.updateStoreCalls(callCidnum, sipHandle);
                            sipHandle.handleRemoteJsep({jsep, error: () => {console.log('had trouble handling the answer')}})
                          }
                          globalEventBus.$emit('janusCallAccepted-'+sipHandle.handleId);
                        }

                        //call accepted event to handle answer and signal audio track kill
                        if(result.event === 'accepted'){
                          if(jsep !== null && jsep !== undefined){
                            //this is a remote answer from an outbound call. we need to match it in the store and flag it as a sofphone call
                            //before this answer completes we need to make sure all other calls are on hold man
                            this.holdOtherCalls(sipHandle);
                            const callCidnum = result.username.split(':')[1].split('@')[0];
                            this.updateStoreCalls(callCidnum, sipHandle);
                            sipHandle.handleRemoteJsep({jsep, error: () => {console.log('had trouble handling the answer')}})
                          }
                          globalEventBus.$emit('janusCallAccepted-'+sipHandle.handleId);
                        }
                      }
                    }
                  });
                }
              });
            }
          });
        }

      },
      createHelpers(master_id){
        //going to create 6 janus helper sessions here
        for(let i = 0; i<this.numHelpers; i++){
          this.janus.attach({
            plugin: 'janus.plugin.sip',
            opaqueId: this.opaqueId,
            success: (sipHandle) => {
              sipHandle.handleId = i;
              this.janusHelpers.push(sipHandle);
              // register helper
              const {peerName} = this.user.myExtension;
              const register = {
                request: 'register',
                type: 'helper',
                username: `sip:${peerName}@sip.voxo.co`,
                master_id
              };
              this.janusHelpers[i].send({
                message: register
              });
            },
            onremotestream: (stream) => {
              const element = document.getElementById('video-'+i);
              Janus.attachMediaStream(element, stream);
            },
            onmessage: (msg, jsep) => {
              if(msg.hasOwnProperty('result')){
                const {result} = msg;
                const callData = {
                  result,
                  jsep
                };

                const sipHandle = this.janusHelpers[i];

                //incoming call.
                if(result.event === 'incomingcall'){
                  callData.sipHandle = sipHandle;
                  sipHandle.cidnum = result.username.split(':')[1].split('@')[0];
                  globalEventBus.$emit('janusIncomingCall-'+sipHandle.handleId, callData);
                  this.callPushNotify(sipHandle.handleId, sipHandle.cidnum, result.displayname);
                }

                //hangup event to signal audio track kill
                if(result.event === 'hangup'){
                  this.bustCall(sipHandle.cidnum);
                  this.clearPushNotify();
                  globalEventBus.$emit('janusCallHangup-'+sipHandle.handleId);
                }

                //early media call accept and signal audio track kill
                if(result.event === 'progress'){
                  if(jsep !== null && jsep !== undefined){
                    //this is a remote answer from an outbound call. we need to match it in the store and flag it as a sofphone call
                    //before this answer completes we need to make sure all other calls are on hold man
                    this.holdOtherCalls(sipHandle);
                    const callCidnum = result.username.split(':')[1].split('@')[0];
                    this.updateStoreCalls(callCidnum, sipHandle);
                    sipHandle.handleRemoteJsep({jsep, error: () => {console.log('had trouble handling the answer')}})
                  }
                  globalEventBus.$emit('janusCallAccepted-'+sipHandle.handleId);
                }

                //call accepted event to handle answer and signal audio track kill
                if(result.event === 'accepted'){
                  if(jsep !== null && jsep !== undefined){
                    //this is a remote answer from an outbound call. we need to match it in the store and flag it as a sofphone call
                    //before this answer completes we need to make sure all other calls are on hold man
                    this.holdOtherCalls(sipHandle);
                    const callCidnum = result.username.split(':')[1].split('@')[0];
                    this.updateStoreCalls(callCidnum, sipHandle);
                    sipHandle.handleRemoteJsep({jsep, error: () => {console.log('hand trouble handling the answer')}})
                  }
                  globalEventBus.$emit('janusCallAccepted-'+sipHandle.handleId);
                }
              }
            }
          });
        }
      },
      updateStoreCalls(callCidnum, sipHandle){
        const calls = this.myCallsList().data;
        if(calls.length){
          for(let i = 0; i < calls.length; i++){
            const {channel, cidnum, softphoneCall} = calls[i];
            if(cidnum === callCidnum){
              this.$store.commit('mycurrentcalls/updateItem', {channel, softphoneCall: true, sipHandle, onHold: false});
              const element = document.getElementById('video-'+sipHandle.handleId);
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
      bustCall(cidnum){
        const call = this.myCallsList({
          query: {
            cidnum
          }
        }).data;
        if(call.length){
          this.$store.commit('mycurrentcalls/removeItem', call[0].channel);
        }
        if(!this.myCallsList().data.length){
          this.$store.commit('setUserStatus', 'NOT_INUSE');
        }
      },
      clearMyCalls(){
        const calls = this.myCallsList({
          query: {
            softphoneCall: false
          }
        }).data;
        if(calls.length){
          this.$store.commit('mycurrentcalls/removeItems', calls);
        }
      },
      emitConferenceChannel(evt){
        globalEventBus.$emit('conferenceChannel', evt);
      },
      emitConferenceInfoComplete(evt){
        globalEventBus.$emit('conferenceInfoComplete', evt);
      },
      async joinUserChannels(){
        const natsHandler = feathersClient.service('nats-actions-handler');
        if(this.user.hasOwnProperty('myExtension')){
          //join users specific socket channel
          await feathersClient.service('channel-memberships').create({
            roomType: 'user',
            peerName: this.user.myExtension.peerName
          }).catch( (e) => console.log('error in joining user room', e));

          await feathersClient.service('channel-memberships').create({
            roomType: 'extensions',
            tenantCode: this.user.myExtension.tenantCode
          }).catch( (e) => console.log('error in joining extension status room', e));

          if(this.$route.name !== 'OMNIA Queues'){
            await natsHandler.create({
              reqType: 'refreshConnectedCalls',
              hostServer: this.user.myExtension.hostServer,
              peerName: this.user.myExtension.peerName,
              tenantCode: this.user.myExtension.tenantCode,
              userId: this.user.id,
              userExten: this.user.myExtension.number
            }).then( () => {
              setTimeout( () => {
                console.log('checking if the user has calls to determine user status locally');
                const hasCalls = this.myCallsList().data.length;
                if(!hasCalls){
                  this.$store.commit('setUserStatus', 'NOT_INUSE');
                }
              }, 5000);
            }).catch( (e) => console.log('error in refreshing user calls', e));
          }
        }
      },
      janusReconnect(){
        let activeSessions = 0;

        if(this.janusMaster){
          if(this.janusMaster.hasOwnProperty('webrtcStuff')){
            if(this.janusMaster.webrtcStuff.pc){
              activeSessions++;
            }
          }
        }

        if(!activeSessions){
          for(let i = 0; i < this.janusHelpers.length; i++){
            if(this.janusHelpers[i].hasOwnProperty('webrtcStuff')){
              if(this.janusHelpers[i].webrtcStuff.pc){
                activeSessions++;
                break;
              }
            }
          }
        }

        if(!activeSessions && this.janusMaster){
          console.log('reinitializing softphone sessions');
          this.janusMaster = null;
          this.janusHelpers = [];
          this.janus.destroy();
          this.janusInit();
        }

      },
      notificationPermissionRequest(){

        Notification.requestPermission().then( (result) => {
          //if permission was granted go ahead and subscribe the user
          if(result === 'granted'){
            //subscribe the user by default
            console.log('permission accepted!');
          } else{
            console.log('notifications denied permission!')
          }
        });
      },
      prettyNumber(number) {
        return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },
      callPushNotify(handleId, number, callerName){
        //this is web push. Need to pass sip info across event so we can answer and decline from click
        if(this.softphoneEnabled){
          navigator.serviceWorker.ready.then( (reg) => {
            if(this.user.enableCallNotifications){
              const options = {
                badge: pushIcon,
                icon: pushIcon,
                body: `${callerName.replace(/"/g, '')} | ${this.prettyNumber(number)}`,
                data: {sipHandleId: handleId},
                requireInteraction: true,
                actions: [
                  {action: 'acceptCall', title: 'Accept'},
                  {action: 'declineCall', title: 'Decline'}
                ]
              };
              reg.showNotification('Incoming Call', options);
            }
          });
        }
      },
      async clearPushNotify(){
        const reg = await navigator.serviceWorker.getRegistration();
        const notifications = await reg.getNotifications({
          includeTriggered: true
        });
        notifications.forEach((notification) => {
          notification.close();
        });
      }
    },
    watch: {
      //this will just check the route to see if it falls in the HUD portal
      currentRoute(){
        if(this.currentRoute.meta.hasOwnProperty('hudRoute')){
          this.$store.commit('setHudMode');
        } else{
          this.$store.commit('unsetHudMode');
        }
      },
      user(){
        if(this.user){
          console.log('the user changed');
          this.janusInit();
          this.$intercom.boot({
            email: this.user.email
          });
        }
      }
    },
    created() {
      if (browser.name)
        document.getElementsByTagName("html")[0].classList.add(browser.name)
    },
    mounted() {
      this.resizeOpenNav();
      window.addEventListener('resize', this.resizeOpenNav);

      const userService = feathersClient.service('users');
      const channelMemberships = feathersClient.service('channel-memberships');

      if(this.user){
        this.janusInit();
        this.$intercom.boot({
          email: this.user.email
        });
      }

      //listen for the DND status of the logged in user app wide.
      channelMemberships.on('dndStatus', (evt) => {
        this.$store.commit('setUserDND', evt.dndStatus === 'on');
      });

      //listen for presence on MY EXTENSION
      channelMemberships.on('myPresence', (evt) => {
        const {status, systemname} = evt;
        let callExists = this.checkCallExists(evt);

        if(evt.hasOwnProperty('ishangup')){
          if(evt.ishangup){
            this.$store.commit('mycurrentcalls/removeItem', evt.channel);
          } else{
            if(this.pushedConnected(evt)){
              if(callExists){
                const disabledButtons = this.callButtonStatus(evt);
                const updateData = {
                  channel: evt.channel,
                  cidname: evt.cidname,
                  disabledButtons,
                  status: evt.status
                };
                this.$store.commit('mycurrentcalls/updateItem', updateData);
              } else{
                const disabledButtons = this.callButtonStatus(evt);
                evt.duration = 0;
                evt.disabledButtons = disabledButtons;
                evt.softphoneCall = false;
                evt.sipHandle = null;
                evt.onHold = false;
                this.$store.commit('mycurrentcalls/addItem', evt);
              }
            }
          }
        } else{
          if (status === 'NOT_INUSE') {
            this.$store.commit('mycurrentcalls/removeItem', evt.channel);
          } else {
            if(this.pushedConnected(evt)){
              if(callExists){
                const disabledButtons = this.callButtonStatus(evt);
                const updateData = {
                  channel: evt.channel,
                  cidname: evt.cidname,
                  disabledButtons,
                  status: evt.status
                };
                this.$store.commit('mycurrentcalls/updateItem', updateData);
              } else{
                const disabledButtons = this.callButtonStatus(evt);
                evt.duration = 0;
                evt.disabledButtons = disabledButtons;
                evt.softphoneCall = false;
                evt.sipHandle = null;
                evt.onHold = false;
                this.$store.commit('mycurrentcalls/addItem', evt);
              }
            }
          }
        }

        callExists = this.checkCallExists(evt);
        if(callExists){
          if(status === 'RINGING'){
            this.$store.commit('setUserStatus', 'RINGING');
          } else{
            this.$store.commit('setUserStatus', 'INUSE');
          }
        } else{
          this.$store.commit('setUserStatus', status);
        }
        this.$store.commit('setUserHostServer', systemname);

      });

      channelMemberships.on('notifyExtStatus', item => {
        const {peerName} = item;
        const extNum = item.peerName.split('-')[0];
        let testExt = this.loadCompanyDirectory({query: {number: extNum}}).data[0];
        let extUpdate = {...testExt};
        if (item.status === 'UNAVAILABLE') {
          extUpdate.extStatus = 'UNAVAILABLE';
          this.$store.commit('companydirectory/updateItem', extUpdate);
        } else {
          extUpdate.extStatus = this.getStatusFromEvent('');
          this.$store.commit('companydirectory/updateItem', extUpdate);
        }
        if(peerName === this.user.myExtension.peerName){
          if (item.status === 'UNAVAILABLE') {
            this.$store.commit('setUserStatus', 'UNAVAILABLE');
          } else {
            this.$store.commit('setUserStatus', this.getStatusFromEvent(''));
          }
        }
      });

      //listen for extensionStatus on company directory
      channelMemberships.on('directoryExtensionStatus', item => {
        const extNum = item.peername.split('-')[0];
        let testExt = this.loadCompanyDirectory({query: {number: extNum}}).data[0];
        let extUpdate = {...testExt};
        extUpdate.extStatus = item.status;
        extUpdate.dnd = item.dnd;
        this.$store.commit('companydirectory/updateItem', extUpdate );
      });

      //listen for extension patched to patch company director avatar
      feathersClient.service('extensions').on('patched', (data) => {
        const directoryExtension = this.loadCompanyDirectory({query: {number: data.number}});
        if(directoryExtension.length){
          this.$store.commit('companydirectory/updateItem', data);
        }
      });

      //listen for refreshing connected calls
      channelMemberships.on('notifyUserActiveCall', (evt) => {
        if(this.user.hasOwnProperty('myExtension')){
          const {channels} = evt;
          for(let call in channels){
            if(channels.hasOwnProperty(call)){
              const theCall = channels[call];
              const {channel, exten, connectedlinenum, connectedlinename, timestamp, direction} = theCall;
              const channelParts = channel.match(/([A-Z]*)\w+/g);
              const peername = `${channelParts[1]}-${channelParts[2]}`;
              if(peername === this.user.myExtension.peerName){
                if(!this.checkCallExists(theCall)){
                  let cidnum = connectedlinenum === '<unknown>' ? exten : connectedlinenum;
                  let cidname = connectedlinename === '<unknown>' ? '' : connectedlinename;
                  const callData = {
                    channel,
                    cidnum,
                    cidname,
                    direction,
                    peername,
                    systemname: evt.systemname,
                    duration: moment().unix() - timestamp,
                    disabledButtons: false
                  };
                  this.$store.commit('mycurrentcalls/addItem', callData);
                }
              }
            }
          }
        }
      });

      channelMemberships.on('atxferMergeComplete', (evt) => {
        const call = this.myCallsList({
          query: {
            channel: evt.channel
          }
        }).data;

        if(call.length){
          let participants = call[0].participants;

          if(participants === undefined){

            let callerName = call[0].cidname;
            //check the first caller to see if we can give them an appropriate name
            const personalContact = this.loadPersonalDirectory({
              query: {
                "PHONE1": call[0].cidnum
              }
            }).data;
            if(personalContact.length){
              callerName = personalContact[0].NAME;
            }

            participants = [
              {
                name: `${this.user.myExtension.name} (Me)`,
                number: this.user.myExtension.number
              },
              {
                name: callerName.length ? callerName : 'Unknown',
                number: call[0].cidnum
              }
            ];
          }

          //check the name. if not given try to find it in the personal directory
          let mergeCallerName = 'Unknown';
          const bizContact = this.loadCompanyDirectory({
            query: {
              number: evt.target
            }
          }).data;
          if(bizContact.length){
            mergeCallerName = bizContact[0].name;
          } else{
            const personalContact = this.loadPersonalDirectory({
              query: {
                "PHONE1": evt.target
              }
            }).data;
            if(personalContact.length){
              mergeCallerName = personalContact[0].NAME;
            }
          }

          participants.push({
            name: mergeCallerName,
            number: evt.target
          });

          this.$store.commit('mycurrentcalls/updateItem', {
            channel: evt.channel,
            conferencing: true,
            participants,
            bridgeId: evt.bridgeId
          });
        }

      });

      channelMemberships.on('conferenceChannel', this.emitConferenceChannel);
      channelMemberships.on('conferenceInfoComplete', this.emitConferenceInfoComplete);

      //in case a user is updated while in session and access changes.
      userService.on('updateUserTenants', item => {
        this.$store.commit('users/updateItem', {id: item.id, tenantIds: item.tenantIds});
        const currentTenants = this.$store.state.authTenants;
        this.$store.commit('setTenants', [...currentTenants, item.newAccount]);
      });

      userService.on('userPhonebookUpdate', item => {
        if(item.userId === this.user.id){
          let extensionData = {...this.user.myExtension};
          extensionData.omniaPhonebookId = item.recordId;
          this.$store.commit('users/updateItem', {id: item.userId, myExtension: extensionData});
        }
      });

      userService.on('userAvatarUpdate', item => {
        this.$store.commit('users/updateItem', {
          id: item.userId,
          avatarFileName: item.avatarFileName,
          avatarPath: item.avatarPath
        });
      });

      globalEventBus.$on('versionUpdate', () => {
        console.log('there is a service worker version update');
        this.$message({
          dangerouslyUseHTMLString: true,
          type: 'success',
          message: `<el-button style="cursor: pointer; padding: 5px;" onclick="location.reload()">A new version of the application is available. Click to update now!</el-button>`,
          duration: 0
        });
        new confettiKit({
          colors:randomColor({hue:'pink',count: 18}),
          confettiCount: 70,
          angle: 90,
          startVelocity: 50,
          elements: {
            'confetti': {
              direction: 'down',
              rotation: true,
            },
            'star': {
              count: 10,
              direction: 'down',
              rotation: true,
            },
            'ribbon': {
              count: 5,
              direction: 'down',
              rotation: true,
            },
          },
          position: 'topLeftRight',
        });
      })

      //socket client connection event listeners.
      feathersClient.io.on('disconnect', () => {
        console.log('we disconnected');
        // this.$store.commit('setAppLoading');

        this.$notify({
          title: 'Connection Error',
          type: 'error',
          duration: 0,
          showClose: false,
          dangerouslyUseHTMLString: true,
          message: `<div class="offline-notification" style="display: flex; margin-left: -40px;">
                      <div class="el-loading-spinner mt-20" style="position: relative; width: auto;">
                        <svg viewBox="13 13 25 25" class="circular">
                          <circle cx="25" cy="25" r="10" fill="none" class="path"></circle>
                        </svg>
                      </div>
                      <div class="ml-20 mt-20">We are trying to re-initiate the connection to the application</div>
                    </div>`
        });
      });

      feathersClient.io.on('reconnect',async () => {
        console.log('we must be trying to reconnect');

        if(this.user){
          console.log('there is a user in the store so we must be logged in');
          //So i think here we will actually remove only non-softphone calls
          this.clearMyCalls();
          console.log('joining back to event channels!');
          await this.joinUserChannels();
          this.janusReconnect();
          globalEventBus.$emit('appReconnected');
          this.$notify.closeAll();
        } else{
          console.log('we did not find the user on reconnect so nothing is happening here!');
          // this.$store.commit('unsetAppLoading');
          this.$notify.closeAll();
        }

      });

      globalEventBus.$on('callResumed', (sipHandle) => {
        this.holdOtherCalls(sipHandle);
      });

      globalEventBus.$on('dialSoftphone', (number) => {
        this.dialSoftphone(number);
      });

      //execute notification permission request.
      this.notificationPermissionRequest();

      navigator.serviceWorker.addEventListener('message', event => {
        const {msg, sipHandleId} = event.data;
        if(msg === 'pushCallAccepted'){
          globalEventBus.$emit(`pushAcceptCall-${sipHandleId}`);
        }
        if(msg === 'pushCallDeclined'){
          globalEventBus.$emit(`pushDeclineCall-${sipHandleId}`);
        }
      });

      //global hot key listeners
      window.addEventListener('keydown', e => {
        if(e.key === 'Alt'){
          e.preventDefault();
          this.modKeyActive = true
        }
        //to launch dialer, softphone must be enabled and user must be logged in.
        if(this.softphoneEnabled && this.user && this.softphoneEnabled){
          if(this.modKeyActive){
            e.preventDefault();
            if(e.code === 'KeyD'){
              this.keyPadVisible ? this.$store.commit('setSoftphoneVisibility', false) : this.$store.commit('setSoftphoneVisibility', true);
            }
          }
        }
      });
      window.addEventListener('keyup', e => {
        if(e.key === 'Alt'){
          this.modKeyActive = false;
        }
      });

    },
    beforeMount() {
      const theme = this.$store.state.layout.theme;
      body.className = theme;
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.resizeOpenNav);
    }
  }
</script>

<style lang="scss">
  @import './assets/scss/_variables';
  @import './assets/scss/_mixins';

  .lds-ellipsis {
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
  }
  .lds-ellipsis div {
    position: absolute;
    top: 33px;
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: #35be8b;
    animation-timing-function: cubic-bezier(0, 1, 1, 0);
  }
  .lds-ellipsis div:nth-child(1) {
    left: 8px;
    animation: lds-ellipsis1 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(2) {
    left: 8px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(3) {
    left: 32px;
    animation: lds-ellipsis2 0.6s infinite;
  }
  .lds-ellipsis div:nth-child(4) {
    left: 56px;
    animation: lds-ellipsis3 0.6s infinite;
  }
  @keyframes lds-ellipsis1 {
    0% {
      transform: scale(0);
    }
    100% {
      transform: scale(1);
    }
  }
  @keyframes lds-ellipsis3 {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(0);
    }
  }
  @keyframes lds-ellipsis2 {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(24px, 0);
    }
  }

  .layout-container {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    background: $background-color;

    .container {
      overflow: hidden;

      .header {
        height: 60px;
        margin: 10px 20px;
      }

      .main {
        position: relative;
        overflow: hidden;
      }

      .view {
        padding: 0 20px 10px 20px;
        box-sizing: border-box;
        transition: all .4s cubic-bezier(.55, 0, .1, 1);
        backface-visibility: hidden;
      }

      .fade-top-in-out-enter {
        opacity: 0;
        transform: translate(0, 30px);
      }

      .fade-top-in-out-leave-active {
        opacity: 0;
        transform: translate(0, 30px);
      }

      .fade-top-enter {
        opacity: 0;
        transform: translate(0, 30px);
      }

      .fade-top-leave-active {
        opacity: 0;
        transform: translate(0, -30px);
      }

      .fade-bottom-in-out-enter {
        opacity: 0;
        transform: translate(0, -30px);
      }

      .fade-bottom-in-out-leave-active {
        opacity: 0;
        transform: translate(0, -30px);
      }

      .fade-bottom-enter {
        opacity: 0;
        transform: translate(0, -30px);
      }

      .fade-bottom-leave-active {
        opacity: 0;
        transform: translate(0, 30px);
      }

      .fade-left-enter {
        opacity: 0;
        transform: translate(30px, 0);
      }

      .fade-left-leave-active {
        opacity: 0;
        transform: translate(-30px, 0);
      }

      .fade-right-enter {
        opacity: 0;
        transform: translate(-30px, 0);
      }

      .fade-right-leave-active {
        opacity: 0;
        transform: translate(30px, 0);
      }

      .fade-enter {
        opacity: 0;
      }

      .fade-leave-active {
        opacity: 0;
      }


      .main-out-border {
        &--top-left, &--top-right {
          background: linear-gradient($background-color, rgba(230, 235, 241, 0));
          height: 16px;
          position: absolute;
          width: 8px;
          z-index: 1;
          top: 4px;
        }

        &--bottom-left, &--bottom-right {
          background: linear-gradient(rgba(230, 235, 241, 0), $background-color);
          height: 16px;
          position: absolute;
          width: 8px;
          z-index: 1;
          bottom: 4px;
        }

        &--top-left, &--bottom-left {
          left: 42px;

          &::after {
            content: "";
            height: 5px;
            position: absolute;
            right: -4px;
            top: -4px;
            width: 12px;
            box-shadow: 8px 0px 0px 0px $background-color inset;
            border-top-left-radius: 5px;
          }
        }

        &--top-right, &--bottom-right {
          right: 42px;

          &::after {
            content: "";
            height: 5px;
            left: -4px;
            position: absolute;
            top: -4px;
            width: 12px;
            box-shadow: -8px 0px 0px 0px $background-color inset;
            border-top-right-radius: 5px;
          }
        }

        &--bottom-left:after {
          border-radius: 0;
          border-bottom-left-radius: 5px;
        }

        &--bottom-right:after {
          border-radius: 0;
          border-bottom-right-radius: 5px;
        }

        &--bottom-left, &--bottom-right {
          &::after {
            top: initial;
            bottom: -4px;
          }
        }
      }

    }

    &.boxed {
      max-width: 1300px;
      margin: 0 auto;
      box-shadow: 0px 0px 20px 10px rgba(0, 0, 0, 0.15), 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
    }

    &.footer-above {
      padding-bottom: 40px;
      position: relative;
    }

    &.content-only {
      .container {
        .main-out-border--top-left, .main-out-border--top-right,
        .main-out-border--bottom-left, .main-out-border--bottom-right {
          display: none;
        }
      }
    }
  }

  html:not(.ie) {
    .layout-container {
      .container {
        max-width: 1920px;
      }
    }
  }

  @media (min-width: 1920px) {
    .layout-container:not(.boxed) {
      &.column {
        .container {
          margin: 0 auto;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .layout-container {
      .container {

        .header {
          height: 50px;
          background: #fff;
          box-shadow: 0px -20px 10px 20px rgba(0, 0, 0, 0.25);
          margin: 0;
          .toggle-sidebar {
            box-shadow: none !important;
          }

          .search-box {
            & > .el-autocomplete {
              box-shadow: none !important;
            }
          }
        }

        .main {
          //padding: 0 5px;
        }


        .view {
          max-width: 100%;
          padding: 15px;
          padding-left: 12px;
          padding-right: 12px;
        }

        .main-out-border--top-left, .main-out-border--top-right,
        .main-out-border--bottom-left, .main-out-border--bottom-right {
          display: none;
        }
      }
    }
  }


  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s ease-out;
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
