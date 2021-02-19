<template>
  <li class="contact-item" @click="editModal">
    <div class="contact-details">
      <div class="avatar-group" style="width:38px">
        <div class="contact-avatar">
          {{firstName.substring(0,1).toUpperCase()}}
        </div>
      </div>
      <div class="contact-info">
        <div class="contact-name">
          {{firstName}} {{lastName}}
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

  import {globalEventBus} from "../../../../globalEventBus";

  export default {
    name: 'PersonalContactItem',
    props: {
      firstName: {required: true},
      lastName: {required: true},
      number: {required: true},
      email: {required: true},
      company: {required: true},
      showDial: {default: false}
    },
    data(){
      return{

      }
    },
    computed: {
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      }
    },
    methods: {
      editModal(e){
        const {tagName} = e.target;
        if(!(tagName == 'svg' || tagName == 'BUTTON' || tagName == 'use')){
          this.$emit('openModal')
        }
      },
      numberFormatter(number) {
        if(number){
          return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
        }
      },
      dialCall(){
        globalEventBus.$emit('dialSoftphone', this.number);
      }
    }
  }

</script>
