<template>

  <div>
    <el-table
      :data="devices" v-loading="devicesLoading"
      stripe>
      <el-table-column
        prop="Contact.User-Agent"
        label="Device">
      </el-table-column>
    </el-table>
  </div>

</template>

<script>

  import feathersClient from "../../../../feathers/feathers-client";

  export default {
    name: 'MyDevices',
    data () {
      return {
        devices: [],
        devicesLoading: true
      }
    },
    computed: {
      user(){
        return this.$store.state.auth.user;
      }
    },
    methods: {
      getDevices(){
        if(this.user.hasOwnProperty('myExtension')){
          const sbcService = feathersClient.service('sbc-management');
          const data = {
            command: 'kamExtension',
            peerName: this.user.myExtension.peerName
          };
          sbcService.create(data).then( (res) => {
            this.devices = res.result.Contacts;
            this.devicesLoading = false;
          });
        } else{
          this.devicesLoading = false;
        }
      }
    },
    mounted(){
      this.getDevices();

      const channelService = feathersClient.service('channel-memberships');
      channelService.on('notifyExtStatus', (item) => {
        if(item.status !== 'UNAVAILABLE'){
          this.getDevices();
        }
      });
    }
  }

</script>