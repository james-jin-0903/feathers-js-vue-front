<template>
  <li class="contact-item">
    <div class="contact-details">
      <div class="avatar-group">
        <div class="contact-avatar" v-if="avatar">
          <img :src="avatar" v-if="avatar" :alt="name" :title="name" />
        </div>
        <div class="contact-avatar" v-else>
          {{name.substring(0,1).toUpperCase()}}
        </div>
        <div class="status-light">
          <status-indicator
            :pulse="getStatusFromEvent(status) === 'positive' || getStatusFromEvent(status) === 'intermediary'"
            :status="getStatusFromEvent(status)">
          </status-indicator>
        </div>
        <div class="dnd-icon" v-if="dnd === 'on'">
          <hr/>
          <status-indicator></status-indicator>
        </div>
      </div>
      <div class="contact-info">
        <div class="contact-name">
          {{name}}
        </div>
      </div>
    </div>
    <div class="number-details">
      {{numberFormatter(number)}}
    </div>
    <el-tooltip placement="top" content="Dial" v-if="softphoneEnabled && showDial">
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

  import extensionStatus from "../../../../ref/extension-status";
  import {globalEventBus} from "../../../../globalEventBus";

  export default {
    name: 'ContactItem',
    props: {
      name: {required: true},
      number: {required: true},
      email: {required: true},
      branch: {required: true},
      status: {required: true},
      department: {required: true},
      avatar: {required: true},
      dnd: {required: true, default: ''},
      showDial: {default: false}
    },
    computed: {
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      }
    },
    methods: {
      numberFormatter(number) {
        if(number){
          return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
        }
      },
      getStatusFromEvent(status){
        return extensionStatus(status);
      },
      dialCall(){
        globalEventBus.$emit('dialSoftphone', this.number);
      }
    }
  }

</script>
