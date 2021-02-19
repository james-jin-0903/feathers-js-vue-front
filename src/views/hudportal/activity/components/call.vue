<template>

    <li class="call-item">
      <div class="call-details">
        <div class="call-item-icon">
          <v-svg class="voxo-green" sprite="call-inbound" v-if="callDirection === 'INBOUND' && callAnswered"/>
          <v-svg class="voxo-red" sprite="call-inbound" v-if="callDirection === 'INBOUND' && !callAnswered"/>
          <v-svg class="voxo-green" sprite="call-outbound" v-if="callDirection === 'OUTBOUND' && callAnswered"/>
          <v-svg class="voxo-red" sprite="call-outbound" v-if="callDirection === 'OUTBOUND' && !callAnswered"/>
        </div>
        <div class="call-source">
          <div class="call-number">
            {{numberFormatter(callNumber)}}
          </div>
          <div class="call-name">
            {{callerId}}
          </div>
        </div>
      </div>
      <div class="call-info">
        <div class="call-time">
          {{dateFormatter(startTime)}}
        </div>
        <div class="call-duration">
          {{durationFormatter(talkTime)}}
        </div>
      </div>
      <el-tooltip placement="top" content="Dial" v-if="softphoneEnabled">
        <el-button
          class="manager-action-button"
          size="mini"
          type="text"
          @click="dialCall"
          style="box-shadow: none;">
          <v-svg class="voxo-green" sprite="phone"/>
        </el-button>
      </el-tooltip>
    </li>

</template>

<script>

  import moment from 'moment';
  import {globalEventBus} from "../../../../globalEventBus";

  export default {
    name: 'CallView',
    props: {
      startTime: {required: true},
      callNumber: {required: true},
      callerId: {required: true},
      talkTime: {required: true},
      direction: {required: true},
      disposition: {required: true}
    },
    data() {
      return {}
    },
    computed: {
      callDirection(){
        if(this.direction == 'inbound'){
          return 'INBOUND'
        }
        if(this.direction == 'outbound'){
          return 'OUTBOUND'
        }
      },
      callAnswered(){
        if(this.disposition == 'ANSWERED'){
          return true;
        }
      },
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      }
    },
    methods: {
      durationFormatter(time){
        const hours = Math.floor(time / 3600);
        const remainderSeconds = time%3600;
        const minutes = Math.floor(remainderSeconds / 60);
        const seconds = Math.round(remainderSeconds%60);

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
      dateFormatter(time) {
        const dayToday = moment().format('YYYY-MM-DD');
        const dayCall = moment(time).format('YYYY-MM-DD');
        const dayDifference = moment.duration(moment(dayToday).diff(moment(dayCall))).asDays();

        if(dayDifference === 1){
          return 'Yesterday'
        }

        if(dayDifference >= 2 && dayDifference <= 6){
          return moment(time).format('dddd');
        }

        if(dayToday === dayCall){
          return moment(time).format('h:mm A');
        }

        return moment(time).format('M/D');
      },
      numberFormatter(number) {
        return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },
      dialCall(){
        globalEventBus.$emit('dialSoftphone', this.callNumber);
      }
    }
  }

</script>

<style lang="scss" scoped>


</style>