<template>

  <div class="table-box card-base card-shadow--medium">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Call History" name="Call History">
        <div id="recent-calls-view">
          <div class="box flex align-center">
            <el-form class="list-search-input">
              <el-input
                v-model="searchCalls"
                placeholder="Search Number / Name"
                clearable>
              </el-input>
            </el-form>
            <div class="recent-call-filters">
              <el-checkbox-group v-model="callFilters">
                <el-checkbox
                  :class="item === 'Missed' ? 'checkboxRed' : 'checkboxGreen'"
                  v-for="(item, index) in callFilterOptions"
                  :key="index"
                  :label="item">
                </el-checkbox>
              </el-checkbox-group>
            </div>
            <h4 id="calls-count" class="black-text text-right">{{callsCount}} / {{callHistoryLength}} calls shown</h4>
          </div>
          <div class="inbound-outbound-filter">
            <el-radio-group v-model="callDirection">
              <el-radio-button type="default" label="inbound">Inbound</el-radio-button>
              <el-radio-button label="outbound">Outbound</el-radio-button>
            </el-radio-group>
          </div>
          <div class="configureMessage" v-if="!userConfigured">
            Your User Extension Has Not Been Configured. See Admin.
          </div>
          <div class="item-list">
            <call
              v-for="item in filteredCallList"
              :key="item.id"
              :startTime="item.start"
              :callNumber="item.direction === 'outbound' ? item.dialedNum : item.callerIdNumber"
              :callerId="item.direction === 'inbound' ? formatCallerId(item.callerName) : null"
              :talkTime="item.duration"
              :direction="item.direction"
              :disposition="item.disposition">
            </call>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Voicemails" name="Voicemails">
        <div class="tab-label pt-5" slot="label">
          <div>Voicemails</div>
          <el-badge
            type="primary"
            :max="15"
            :value="voicemailUnreadCount"
            class="number-badge"
            v-if="voicemailUnreadCount">
          </el-badge>
        </div>
        <div class="configureMessage" v-if="!userConfigured">
          Your User Extension Has Not Been Configured. See Admin.
        </div>
        <div class="item-list">
          <voicemail
            v-for="item in voicemailList"
            :key="item.id"
            :id="item.id"
            :time="item.origTime"
            :duration="item.duration"
            :callerIdName="formatCallerId(item.callerId)"
            :callerIdNum="formatCallerNum(item.callerId)"
            :status="item.status"
            :dir="item.dir"
            @voicemailRead="unreadVoicemails--"
            @newVoicemail="unreadVoicemails++">
          </voicemail>
        </div>
      </el-tab-pane>
      <el-tab-pane label="Faxes" name="Faxes">
        <div>
          <el-row class="fax-activity" :gutter="30">
            <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16" style="order:2;">
              <h3 style="max-width: 100%;" class="form-section-header flex align-center justify-space-between mb-10">
                <span>Fax History</span>
              </h3>
              <div class="flex align-center justify-space-between">
                <el-input
                  style="margin: 0 0 10px 0; max-width: 300px;"
                  v-model="faxSearch"
                  clearable
                  placeholder="Search Faxes">
                  <template slot="prefix">
                    Search
                  </template>
                </el-input>
                <el-pagination
                  v-if="totalFaxes > pageSize"
                  small
                  background
                  layout="prev, pager, next"
                  :pager-count="5"
                  :current-page.sync="faxesCurrentPage"
                  :page-size="pageSize"
                  :total="totalFaxes">
                </el-pagination>
              </div>
              <el-table
                v-loading="faxTableLoading"
                :data="filteredFaxList"
                stripe
                height="500">
                <el-table-column
                  prop="date"
                  label="Date"
                  :formatter="timeFormatter">
                </el-table-column>
                <el-table-column
                  prop="direction"
                  label="Direction">
                </el-table-column>
                <el-table-column
                  prop="sourceNum"
                  label="From"
                  :formatter="numberFormatter">
                </el-table-column>
                <el-table-column
                  prop="destNum"
                  label="To"
                  :formatter="numberFormatter">
                </el-table-column>
                <el-table-column
                  prop="status"
                  label="Status">
                </el-table-column>
                <el-table-column
                  label="File">
                  <template slot-scope="scope">
                    <div @click="downloadFax(scope.row.id)" style="cursor: pointer;">
                      <el-icon class="el-icon-document"></el-icon>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" v-loading="processingFax"  v-if="userHasFax && userConfigured" style="order:1">
              <h3 class="form-section-header">
               Send Fax From: {{numberFormatter(null, null, user.faxNumber)}}
              </h3>
              <el-input
                v-model="faxDestNumber"
                type="text"
                placeholder="Enter Number">
                <template slot="prefix">
                  Number
                </template>
              </el-input>
              <el-input
                v-model="faxMessage"
                type="textarea"
                :rows="5"
                placeholder="Include A Message">
              </el-input>
              <el-upload
                ref="upload"
                class="upload-demo"
                drag
                action="hailFred"
                :auto-upload="false"
                accept="application/pdf"
                multiple>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
                <div class="el-upload__tip black-text" slot="tip">PDF Files</div>
              </el-upload>
              <el-button size="small" type="primary" class="mt-10" @click="submitFax">Send</el-button>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8" v-else>
              <h3 class="form-section-header">
                Your account is not configured for sending faxes. Please contact your administrator.
              </h3>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>

  import Call from "../activity/components/call";
  import Voicemail from "../activity/components/voicemail";
  import {mapActions, mapGetters} from "vuex";
  import feathersClient from "../../../feathers/feathers-client";
  import {globalEventBus} from "../../../globalEventBus";
  import {hostServer} from "../../../feathers/feathers-client";
  import moment from 'moment';

  export default {
    name: 'MyActivity',
    components: {Call, Voicemail},
    data(){
      return {
        searchCalls: '',
        callDataLoading: false,
        voicemailDataLoading: false,
        amiOmniaChannel: '',
        callFilterOptions: ['Missed', 'Answered'],
        callFilters: ['Missed', 'Answered'],
        callsCount: '',
        callHistoryLength: '',
        activeTab: 'Call History',
        contactModalVisible: false,
        callDirection: 'inbound',
        userConfigured: true,
        userHasFax: true,
        unreadVoicemails: 0,
        faxMessage: '',
        faxDestNumber: '',
        faxTableLoading: false,
        processingFax: false,
        faxesCurrentPage: 1,
        pageSize: 50,
        totalFaxes: 0,
        faxSearch: '',
        faxChannel: ''
      }
    },
    computed: {
      ...mapGetters('call-history', {getCDRList: 'find'}),
      ...mapGetters('voicemails', {getVoicemailBox: 'get'}),
      ...mapGetters('myfaxes', {faxesList: 'find'}),
      selectedTenant(){
        return this.$store.getters.selectedTenant;
      },
      user(){
        return this.$store.state.auth.user;
      },
      callHistoryList(){

        const statusRef = {
          'Missed': ['BUSY', 'FAILED', 'NO ANSWER', 'CONGESTION'],
          'Answered': ['ANSWERED']
        };

        if(this.callFilters.length === this.callFilterOptions.length){
          return this.getCDRList({
            query: {
              direction: this.callDirection,
              $sort: {start: -1}
            }}).data
        }

        if(this.callFilters.length){
          return this.getCDRList({
            query: {
              direction: this.callDirection,
              disposition: {$in: statusRef[this.callFilters[0]]},
              $sort: {start: -1}
            }}).data
        }

        return [];
      },
      filteredCallList(){
        return this.filteredCalls();
      },
      voicemailList(){
        if(this.user.hasOwnProperty('myExtension')){
          if(this.user.myExtension.voicemailId){
            const mailbox = this.getVoicemailBox(this.user.myExtension.voicemailId);
            if(mailbox){
              return mailbox.messages;
            }
          }
        }

        return {};
      },
      voicemailUnreadCount(){
        return this.$store.state.voicemailCount;
      },
      faxList(){
        return this.faxesList({
          query: {
            $sort: {
              date: -1
            }
          }
        }).data;
      },
      filteredFaxList(){
        const allFaxes = this.filteredFaxes();
        const currentPage = this.faxesCurrentPage;
        return allFaxes.slice(((currentPage - 1) * this.pageSize), currentPage * this.pageSize);
      }
    },
    watch: {
      faxDestNumber(){
        this.faxDestNumber = this.faxDestNumber.replace(/['":;/{}()[|\-.,<>?_=+ \]]/g, '');
      },
      faxSearch(){
        this.faxesCurrentPage = 1;
      }
    },
    methods: {
      ...mapActions('call-history', {findCDR: 'find'}),
      ...mapActions('voicemails', {getVoicemail: 'get'}),
      ...mapActions('faxes', {findFaxes: 'find'}),
      filteredCalls() {
        const filteredList = this.callHistoryList.filter(data => !this.searchCalls
          || data.dialedNum.toLowerCase().includes(this.searchCalls.toLowerCase())
          || data.callerIdNumber.toLowerCase().includes(this.searchCalls.toLowerCase())
        );
        this.callsCount = filteredList.length;
        return filteredList;
      },

      filteredFaxes(){
        const filteredList = this.faxList.filter(data => !this.faxSearch
          || data.sourceNum.toLowerCase().includes(this.faxSearch.toLowerCase())
          || data.destNum.toLowerCase().includes(this.faxSearch.toLowerCase())
        );
        this.totalFaxes = filteredList.length;
        return filteredList;
      },

      formatCallerId(item) {
        if(item){
          const callerName = item.split('<')[0];
          return callerName.replace(/['"]+/g, '');
        }
        return item;
      },

      formatCallerNum(item){
        if(item){
          const callerName = item.split('<')[1];
          if(callerName){
            return callerName.replace(/['"<>]+/g, '');
          }
        }
        return item;
      },
      joinSocketChannel(){
        if(this.user.hasOwnProperty('myExtension')){
          const channelService = feathersClient.service('channel-memberships');
          const peerData = {
            tenantCode: this.user.myExtension.tenantCode,
            tenantId: this.user.myExtension.tenantId,
            extension: this.user.myExtension.number
          };
          const dataOmnia = {
            roomType: 'omnia',
            ...peerData
          };
          const peerName = `${peerData.extension}-${peerData.tenantCode}`;
          channelService.create(dataOmnia).then(() => { this.amiOmniaChannel = `${dataOmnia.roomType}/${peerName}`});

          if(this.user.faxEnabled){
            const dataFaxes = {
              roomType: 'faxes',
              email: this.user.email
            }
            channelService.create(dataFaxes).then(() => { this.faxChannel = `${dataFaxes.roomType}/${dataFaxes.email}`});
          }
        }
      },

      queryCalls(){
        this.callDataLoading = true;
        const params = {
          query: {
            tenantId: this.user.myExtension.tenantId,
            $or: [
              {dialedNum: this.user.myExtension.number},
              {whoAnswered: this.user.myExtension.number},
              {callerIdNumber: this.user.myExtension.number}
            ],
            $limit: 100,
            $sort: {start: -1}
          }
        };
        this.findCDR(params).then((res) => { this.callDataLoading = false; this.callHistoryLength = res.length;});
      },

      queryVoicemails(){
        this.voicemailDataLoading = true;
        this.getVoicemail(this.user.myExtension.voicemailId);
      },

      async queryFaxes(){
        this.faxTableLoading = true;
        this.findFaxes({
          query: {
            tenantId: this.user.myExtension.tenantId,
            statusEmail: this.user.email
          }
        }).then( async (res) => {
          this.$store.commit('myfaxes/addItems', res);
          this.faxTableLoading = false;
        }).catch( () => {
          this.faxTableLoading = false;
        });
      },
      submitFax(){
        this.processingFax = true;
        console.log('submit a faxey');
        const validated = this.validateFaxParams();
        const files = this.$refs.upload.uploadFiles;

        let formData = new FormData();
        formData.append('reqType', 'appPost');
        formData.append('numberTo', this.faxDestNumber);
        formData.append('numberFrom', this.user.faxNumber);
        formData.append('message', this.faxMessage);

        for(const file in files){
          if(files.hasOwnProperty(file)){
            formData.append(files[file].name, files[file].raw)
          }
        }

        if(validated){
          fetch(`${hostServer}/outbound-fax`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${this.$store.state.auth.accessToken}`
            }
          }).then( () => {
            this.$notify({
              title: 'Success',
              type: 'success',
              message: 'Fax Successfully Queued!'
            });
            this.processingFax = false;
            this.faxDestNumber = '';
            this.faxMessage = '';
            this.$refs.upload.clearFiles();
          }).catch( () => {
            this.processingFax = false;
            this.$notify({
              title: 'Warning',
              message: 'Something Went Wrong!',
              type: 'warning'
            });
          });
        }
      },
      validateFaxParams(){
        if(!this.faxDestNumber.length || this.faxDestNumber.match(/[^0-9]/g)){
          this.$notify({
            title: 'Warning',
            message: 'Invalid Fax Number',
            type: 'warning'
          });
          this.processingFax = false;
          return false;
        }
        const files = this.$refs.upload.uploadFiles;
        if(!files.length){
          this.$notify({
            title: 'Warning',
            message: 'No Files Attached',
            type: 'warning'
          });
          this.processingFax = false;
          return false;
        }
        return true;
      },
      downloadFax(id){
        this.faxTableLoading = true;
        const faxService = feathersClient.service('faxes');
        faxService.get(id).then( (res) => {
          this.faxTableLoading = false;
          const fileBlob = new Blob([res.file.raw]);
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(fileBlob);
          link.download = res.file.name;
          link.click();
        }).catch( () => {
          this.faxTableLoading = false;
        })
      },
      numberFormatter(row, column, value) {
        if(value){
          return value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
        }
        return this.user.email;
      },
      timeFormatter(row, column, value) {
        return moment(value).format('M/DD h:mm A');
      },
      removeListeners(){
        const channelService = feathersClient.service('channel-memberships');
        channelService.removeListener('newVoicemail');
        channelService.removeListener('notifyNewCall');
        globalEventBus.$off('appReconnected');
      }
    },
    created(){
      if(this.user){
        if(this.user.hasOwnProperty('myExtension')){
          //grabs business contacts on user's extension tenant
          this.queryCalls();
          if(this.user.myExtension.voicemailId){
            this.queryVoicemails();
          }
        } else {
          this.$notify({
            title: 'Warning',
            message: 'Your Account Has No Assigned Extension',
            type: 'warning'
          });
          this.userConfigured = false;
        }
        if(this.user.faxEnabled){
          this.queryFaxes();
        } else{
          this.userHasFax = false;
        }
      }
    },
    mounted(){
      //service for joining appropriate AMI channels
      const channelService = feathersClient.service('channel-memberships');

      this.joinSocketChannel();
      channelService.on('newVoicemail', item => {
        this.getVoicemail(this.user.myExtension.voicemailId);
      });
      channelService.on('notifyNewCall', item => {
        setTimeout(this.queryCalls, 1000);
      });
      channelService.on('newFax', item => {
        this.$store.commit('myfaxes/addItem', item);
      });

      //monitor socket connection and reconnect to channel
      globalEventBus.$on('appReconnected', () => {
        console.log('the app did reconnect');
        this.joinSocketChannel();
      });
    },
    beforeDestroy() {
      const channelService = feathersClient.service('channel-memberships');
      channelService.remove(null ,{query: {channelName: this.amiOmniaChannel}});
      channelService.remove(null, {query: {channelName: this.faxChannel}});
      this.$store.commit('voicemails/clearList');
      this.$store.commit('faxes/clearList');
      this.$store.commit('zeroVoicemailCount');
      this.removeListeners();
    }
  }

</script>

<style lang="scss" scoped>

  @import '../../../assets/scss/variables';

  .download-button{
    width: 20px;
    height: 20px;
  }

  .list-search-input{
    width: 25%;
    min-width: 200px;
    margin-top: 0px;
    margin-left: 0px !important;
  }

  .el-tabs--top{
    margin-top: 10px;
    margin-left: 0px !important;
  }

  .card-base form{
    padding-top: 0px;
  }

  .card-base .form-section-header{
    margin:10px 0;
  }

  .table-box{
    height: calc(100% - .7em);
    overflow: hidden;
  }

  @media (max-width: 969px){
    .table-box{
      overflow-y: auto;
    }

    .fax-activity{
      display: flex;
      flex-wrap: wrap;
      >*{
        flex-basis: 100%;
      }
    }
  }

  #recent-calls-view{
    height: 100%;
  }

  .item-list{
    max-height: calc(100vh - 20em);
    overflow-y: auto;
  }

  .item-list-contacts{
    margin-top: 10px;
    max-height: calc(100vh - 16em);
    overflow-y: auto;
  }

  .add-contact-button{
    text-align: right;
    margin-left: 0px !important;
  }

  .el-checkbox-group{
    display: flex;
  }

  .box{
    >*{
      margin-left: 10px;
      margin-right: 10px;
    }
  }

  .inbound-outbound-filter{
    margin-bottom: 20px;
  }

  .tab-label{
    position: relative;
    display: flex;
  }

  .number-badge{
    margin-top: -8px;
  }

  @media (max-width: 959px){
    #recent-calls-view, #contacts-view, #personal-contacts-view{
      .box{
        flex-wrap: wrap;
      }
    }
  }

  @media (max-width: 499px){
    .el-checkbox-group{
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .box{
      >*{
        flex-basis: 100%;
      }
      .black-text{
        flex-basis: 100%;
        margin-bottom: 20px;
      }
      .list-search-input{
        margin-left: 10px !important;
      }
      .call-item{
        margin-right: 10px;
      }
    }

    #calls-count{
      text-align:center !important;
    }

    .inbound-outbound-filter{
      display: flex;
      justify-content: center;
    }
  }

</style>
