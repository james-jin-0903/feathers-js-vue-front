<template>

  <li class="voicemail-item" v-if="!deleted">
    <div class="unread-status">
      <status-indicator
        v-if="!markedRead"
        status="active">
      </status-indicator>
    </div>
    <div class="voicemail-source" @click="toggleActions">
      <div class="call-number">
        {{ callerIdName }}
      </div>
      <div class="call-name">
        {{ numberFormatter(callerIdNum) }}
      </div>
    </div>
    <div class="call-info">
      <div class="call-time">
        {{ dateFormatter(time) }}
      </div>
      <div class="call-duration">
        {{durationFormatter(duration)}}
      </div>
    </div>
    <div class="voicemail-actions">
      <el-button
        @click="streamVoicemail"
        v-if="!playActive"
        icon="el-icon-caret-right"
        circle>
      </el-button>
      <el-button
        v-loading="fileLoading"
        @click="pauseVoicemail"
        v-if="playActive"
        icon="mdi mdi-pause"
        circle>
      </el-button>
      <el-button
        @click="deleteVoicemail"
        icon="el-icon-delete"
        circle>
      </el-button>
    </div>
    <div class="voicemail-av" v-show="audioURL.length && isStreaming">
      <div :id="'vm-audio-'+id">
        <audio src=""></audio>
      </div>
      <div class="vm-audio-progress">
        <progress
          :id="'progress-bar-'+id"
          value="0"
          max="1">
        </progress>
        <div class="black-text time-left-text">
          {{timeLeft}}
        </div>
      </div>
    </div>

  </li>


</template>

<script>

  import moment from 'moment';
  import feathersClient from "../../../../feathers/feathers-client";
  import {mapGetters} from "vuex";
  import {hostServer} from "../../../../feathers/feathers-client";

  export default {
    name: 'Voicemail',
    props: {
      id: {required: true},
      time: {required: true},
      duration: {required: true},
      callerIdName: {required: true},
      callerIdNum: {required: true},
      status: {required: true},
      dir: {required: true}
    },
    computed: {
      ...mapGetters('voicemails', {getVoicemailBox: 'get'}),
      user(){
        return this.$store.state.auth.user;
      }
    },
    data() {
      return {
        playActive: false,
        markedRead: this.status !== 'unread',
        deleted: false,
        isStreaming: false,
        isPaused: false,
        audioURL: '',
        audioObject: {},
        fileLoading: false,
        fileRetrieved: false,
        timeLeft: null,
        actionsVisible: false
      }
    },
    methods: {
      durationFormatter(time) {
        const hours = Math.floor(time / 3600);
        const remainderSeconds = time % 3600;
        const minutes = Math.floor(remainderSeconds / 60);
        const seconds = Math.round(remainderSeconds % 60);

        if (hours > 0) {
          return hours + 'hr ' + minutes + 'm';
        }

        if (minutes > 0) {
          return minutes + 'm';
        }

        if (seconds > 0) {
          return seconds + 's';
        }

        return '0';
      },
      timeLeftFormatter(time){
        const remainderSeconds = time % 3600;
        let minutes = Math.floor(remainderSeconds / 60);
        let seconds = Math.round(remainderSeconds % 60);

        if (minutes > 0) {
          if(minutes < 10){
            minutes = '0' + minutes;
          }

          if(seconds < 10){
            seconds = '0' + seconds;
          }

          return minutes + ':' + seconds;
        }

        if (seconds > 0) {

          if(seconds < 10){
            seconds = '0' + seconds;
          }

          return '00:' + seconds;
        }

        return '00:00';
      },
      dateFormatter(time) {
        const dayToday = moment().format('YYYY-MM-DD');
        const dayCall = moment.unix(time).format('YYYY-MM-DD');
        const dayDifference = moment.duration(moment(dayToday).diff(moment(dayCall))).asDays();

        if (dayDifference === 1) {
          return 'Yesterday'
        }

        if (dayDifference >= 2 && dayDifference <= 6) {
          return moment.unix(time).format('dddd');
        }

        if (dayToday === dayCall) {
          return moment.unix(time).format('h:mm A');
        }

        return moment.unix(time).format('M/D');
      },
      numberFormatter(number) {
        return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },
      streamVoicemail() {
        this.playActive = true;

        if (!this.isStreaming && !this.fileRetrieved) {
          this.fileLoading = true;
          fetch(`${hostServer}/voicemail-messages/${this.id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${this.$store.state.auth.accessToken}`
            }
          })
            .then( res => res.json())
            .then(data => {
              const bufferlen = data.recording.data.length;
              const bufferArray = new Uint8Array(bufferlen);
              for(let i = 0; i < bufferlen; i++){
                bufferArray[i] = data.recording.data[i];
              }
              const blob = new Blob([bufferArray.buffer], {type: 'audio/mp3'});
              this.audioURL = window.URL.createObjectURL(blob);
              this.audioObject = document.getElementById('vm-audio-' + this.id).querySelector('audio');
              this.audioObject.src = this.audioURL;
              this.fileLoading = false;
              this.audioObject.play();
              this.isStreaming = true;
              this.fileRetrieved = true;

              this.audioObject.addEventListener('ended', () => {
                this.playActive = false;
                this.isStreaming = false;
                this.isPaused = false;
              });

              this.audioObject.addEventListener('timeupdate', () => {
                this.initProgressBar();
              })
            });
        }

        if (this.isStreaming) {
          this.audioObject.play();
        }

        if (!this.isStreaming && this.fileRetrieved) {
          this.audioObject.play();
          this.playActive = true;
          this.isStreaming = true;
        }

        if (!this.markedRead && this.status === 'unread') {
          this.updateVoicemail()
        }

      },
      initProgressBar() {
        const length = this.audioObject.duration ? this.audioObject.duration : 0;
        const current_time = this.audioObject.currentTime;
        if(length){
          this.timeLeft = this.timeLeftFormatter(length - current_time);
        }

        let progressBar = document.getElementById('progress-bar-' + this.id);
        if (length) {
          progressBar.value = current_time / length;
        } else {
          progressBar.value = length;
        }
        progressBar.addEventListener('click', (event) => {
          const percent = event.offsetX / progressBar.offsetWidth;
          this.audioObject.currentTime = percent * length;
          progressBar.value = percent / 100;
        });

      },
      pauseVoicemail() {
        this.playActive = false;

        if (this.isStreaming) {
          this.audioObject.pause();
          this.isPaused = true;
        }

      },
      updateVoicemail() {
        const voicemailMessagesService = feathersClient.service('voicemail-messages');

        //check the voicemail messages store for msg numbers with Old so we are sure to update correctly.
        let lastOldMessageNum = 0;
        if(this.lastVMNumber){
          lastOldMessageNum = this.lastVMNumber
        } else{
          const mailbox = this.getVoicemailBox(this.user.myExtension.voicemailId);
          for(let i = 0; i < mailbox.messages.length; i++){
            if(mailbox.messages[i].status === 'read'){
              lastOldMessageNum = lastOldMessageNum < mailbox.messages[i].msgnum ? mailbox.messages[i].msgnum : lastOldMessageNum;
            }
          }
        }

        //this is to mark read voicemails as unread
        const contextString = this.dir.split('/INBOX')[0];
        const context = contextString + '/Old';

        //patch the actual vm message in db
        voicemailMessagesService.patch(this.id, {
          dir: context,
          msgnum: lastOldMessageNum + 1
        }).then((res) => {
          this.$store.commit('setLastVMNumber', lastOldMessageNum + 1);
          this.markedRead = true;
          this.$store.commit('subtractVoicemailCount');
        });
      },
      deleteVoicemail() {
        this.$confirm('Delete Voicemail?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        }).then(() => {
          const voicemailMessagesService = feathersClient.service('voicemail-messages');
          voicemailMessagesService.remove(this.id).then(() => {
            this.deleted = true;
            if(!this.markedRead){
              this.$store.commit('subtractVoicemailCount');
            }
          });
        }).catch(() => true);

      },
      toggleActions() {
        this.actionsVisible = !this.actionsVisible;
      }
    },
    mounted(){
      if(this.status === 'unread' && !this.markedRead){
        this.$store.commit('addVoicemailCount');
      }
    }
  }

</script>

<style lang="scss" scoped>

  @import '../../../../assets/scss/variables';

  .unread-status {
    min-width: 20px;
  }

  .call-number, .call-name {
    margin-left: 10px;
  }

  .call-name {
    font-size: 10pt;
  }

  .call-duration {
    font-size: 10pt;
  }

  .call-info {
    margin: 0 30px;
    width: 75px;
  }

  .vm-audio{
    canvas{
      display: none !important;
    }
  }

  .voicemail-source{
    width: 200px;
    max-width: 200px;
    cursor: pointer;
  }

  .vm-audio-progress{
    margin-left: 20px;
    display: flex;
    align-items: center;
  }

  .time-left-text{
    margin-left: 10px;
  }

  progress[value] {
    /* Reset the default appearance */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    width: 150px;
    height: 10px;
  }

  progress[value]::-webkit-progress-bar {
    background-color: #eee;
    border-radius: 50px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
  }

  progress[value]::-moz-progress-bar {
    background-color: #eee;
    border-radius: 50px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25) inset;
  }

  progress[value]::-webkit-progress-value {
    background: transparentize($voxo-blue, 0.2);
    border-radius: 50px;
  }

  @media (max-width: 959px){
    progress[value] {
      width: 200px;
      height: 10px;
    }

    .voicemail-actions, .voicemail-av{
      display: flex;
      flex-basis: 100%;
      margin-top: 15px;
      margin-left: 25px;
    }

    .vm-audio-progress{
      margin-left: 0;
    }

    .voicemail-item{
      flex-wrap: wrap;
    }

    .voicemail-source{
      width: 150px;
    }

    .call-info{
      margin-right: 5px;
    }
  }

</style>
