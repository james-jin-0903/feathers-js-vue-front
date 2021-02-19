<template>
  <div>
    <el-dialog
            :visible="dialogVisible"
            width="20%"
            style="min-width: 350px"
            :modal="true"
            :before-close="handleClose"
            :close-on-click-modal="true">

      <div id="number-autocomplete" class="header-input">
        <div>
          <div class="contact-container">
            <div v-if="selectedPerson">
              <contact
                class="contact-container"
                v-if="!selectedPerson.hasOwnProperty('COMPANY')"
                :name="selectedPerson.name"
                :number="null"
                :email="selectedPerson.email"
                :status="selectedPerson.extStatus"
                :branch="selectedPerson.branch"
                :department="selectedPerson.department"
                :dnd="''"
                :avatar="selectedPerson.avatarPath">
              </contact>
              <personal-contact
                v-else
                class="contact-container"
                :firstName="selectedPerson.FIRSTNAME"
                :lastName="selectedPerson.LASTNAME"
                :number="null"
                :email="selectedPerson.EMAIL"
                :company="selectedPerson.COMPANY">
              </personal-contact>
            </div>
          </div>
        </div>
        <el-autocomplete
          ref="autoComplete"
          v-model="number"
          value-key="nameNumber"
          :fetch-suggestions="suggestContacts"
          placeholder="Enter Name or Number"
          clearable
          :trigger-on-focus="false"
          @select="handleSelect"
          @clear="clearContact">
          <template slot-scope="scope">
            <contact
              v-if="!scope.item.hasOwnProperty('COMPANY')"
              :name="scope.item.name"
              :number="null"
              :email="scope.item.email"
              :status="scope.item.extStatus"
              :dnd="scope.item.dnd"
              :branch="scope.item.branch"
              :department="scope.item.department"
              :avatar="scope.item.avatarPath">
            </contact>
            <personal-contact
              v-else
              :firstName="scope.item.FIRSTNAME"
              :lastName="scope.item.LASTNAME"
              :number="null"
              :email="scope.item.EMAIL"
              :company="scope.item.COMPANY">
            </personal-contact>
          </template>
        </el-autocomplete>
      </div>

      <div class="button-container">

        <div class="button-wrapper" v-if="isTransferRequest">
          <el-tooltip content="Blind Transfer" placement="top">
            <el-button circle @click="processTransfer">
              <v-svg class="voxo-blue" sprite="transfer"></v-svg>
            </el-button>
          </el-tooltip>
        </div>

        <div class="button-wrapper" v-if="isTransferRequest">
          <el-tooltip content="Attended Transfer" placement="top">
            <el-button circle @click="processTransferAT">
              <v-svg class="voxo-aqua" sprite="call-forward"></v-svg>
            </el-button>
          </el-tooltip>
        </div>

        <div class="button-wrapper" v-if="isTransferRequest">
          <el-tooltip content="Conference" placement="top">
            <el-button circle @click="processTransferAT">
              <v-svg class="voxo-aqua" sprite="group"></v-svg>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <div class="keypad-container">
        <el-row>
          <el-button type="text" circle @click="updateInput(1)">
            <div class="btn-number-blank">1</div>
          </el-button>
          <el-button type="text" circle @click="updateInput(2)">
            <div class="btn-number">2</div>
            ABC
          </el-button>
          <el-button type="text" circle @click="updateInput(3)">
            <div class="btn-number">3</div>
            DEF
          </el-button>
        </el-row>
        <el-row>
          <el-button type="text" circle @click="updateInput(4)">
            <div class="btn-number">4</div>
            GHI
          </el-button>
          <el-button type="text" circle @click="updateInput(5)">
            <div class="btn-number">5</div>
            JKL
          </el-button>
          <el-button type="text" circle @click="updateInput(6)">
            <div class="btn-number">6</div>
            MNO
          </el-button>
        </el-row>
        <el-row>
          <el-button type="text" circle @click="updateInput(7)">
            <div class="btn-number">7</div>
            PQRS
          </el-button>
          <el-button type="text" circle @click="updateInput(8)">
            <div class="btn-number">8</div>
            TUV
          </el-button>
          <el-button type="text" circle @click="updateInput(9)">
            <div class="btn-number">9</div>
            WXYZ
          </el-button>
        </el-row>
        <el-row>
          <el-button type="text" circle @click="updateInput('*')">
            <div class="btn-number-blank">*</div>
          </el-button>
          <el-button type="text" circle @click="updateInput(0)">
            <div class="btn-number">0</div>
            +
          </el-button>
          <el-button type="text" circle @click="updateInput('#')">
            <div class="btn-number-blank">#</div>
          </el-button>
        </el-row>
      </div>
      <div class="button-container">
        <div class="button-wrapper" v-if="!isTransferRequest">
          <el-tooltip :content="!softphoneEnabled ? 'Call from Deskphone' : 'Call From Softphone'" placement="top">
            <el-button v-if="!softphoneEnabled" type="success" circle @click="dialCall">
              <v-svg sprite="telephone"/>
            </el-button>
            <el-button v-else type="success" circle @click="dialCall">
              <v-svg sprite="headset"/>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import feathersClient from "../../../../feathers/feathers-client";
  import Contact from "../../contacts/components/contact";
  import PersonalContact from "../../contacts/components/personal-contact";
  import {globalEventBus} from '../../../../globalEventBus';

  export default {
    name: 'Keypad',
    components: {Contact, PersonalContact},
    data() {
      return {
        number: '',
        selectedPerson: null,
        inputElement: null,
        currentSuggestions: [],
        transferItem: null,
        isTransferRequest: false
      };
    },
    computed: {
      ...mapGetters('companydirectory', {loadCompanyDirectory: 'find'}),
      ...mapGetters('phonebook-entries', {getPhonebookEntries: 'find'}),
      user(){
        return this.$store.state.auth.user;
      },
      userHostServer(){
        return this.$store.state.userHostServer;
      },
      dialogVisible() {
        return this.$store.state.softphoneVisible;
      },
      companyDirectory() {
        return this.loadCompanyDirectory().data;
      },
      personalDirectory() {
        return this.getPhonebookEntries({
          query: {
            hasDetails: true,
            phonebookId: this.user.myExtension.omniaPhonebookId,
            $sort: {
              FIRSTNAME: 1
            }
          }
        }).data;
      },
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      }
    },
    watch: {
      number(){
        //strip special characters
        this.number = this.number.replace(/['":;/{}()[|\-.,<>?_=+ \]]/g, '');
        if(!this.number.length){
          this.selectedPerson = null
        }
      },
      dialogVisible(){
        if(this.dialogVisible){
          setTimeout( () => {
            const numberField = document.getElementById('number-autocomplete').querySelector('input');
            this.inputElement = numberField;
            numberField.focus();
          }, 250);
        } else{
          this.$refs.autoComplete.suggestions = [];
          this.$store.commit('setSoftphoneTransfer', false);
          this.isTransferRequest = false;
          this.transferItem = null;
          this.clearContact();
        }
      }
    },
    methods: {
      handleClose() {
        this.$store.commit('setSoftphoneVisibility', false);
        this.$store.commit('setSoftphoneTransfer', false);
        this.isTransferRequest = false;
        this.transferItem = null;
        this.clearContact();
      },
      updateInput(value) {
        this.number = this.number + value;
      },
      suggestContacts(queryString, cb) {
        let directory = queryString ? this.companyDirectory.filter(this.filterCompany(queryString)) : this.companyDirectory;
        let personal = queryString ? this.personalDirectory.filter(this.filterPersonal(queryString)) : this.personalDirectory;
        const results = [...directory, ...personal];
        this.currentSuggestions = results;
        this.$refs.autoComplete.highlightedIndex = 0;
        cb(results);
      },
      filterCompany(queryString) {
        return (contact) => {
          return (contact.number.toLowerCase().indexOf(queryString.toLowerCase()) === 0 || contact.name.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      filterPersonal(queryString){
        return (contact) => {
          return (contact.NAME.toLowerCase().indexOf(queryString.toLowerCase()) === 0 || contact.PHONE1.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      handleSelect(item) {
        this.selectedPerson = item;
        if(item.hasOwnProperty('PHONE1')){
          this.number = item.PHONE1;
          this.name = item.NAME;
        } else{
          this.number = item.number;
          this.name = item.name;
        }
      },
      clearContact(){
        this.number = '';
        this.name = '';
        this.selectedPerson = null
      },
      processTransfer(){
        const {channel, systemname} = this.transferItem;
        feathersClient.service('nats-actions-handler').create({
          reqType: 'transfer',
          channel: channel,
          ext: this.number,
          server:systemname
        });
        this.handleClose();
      },
      processTransferAT(){
        const {channel, systemname} = this.transferItem;
        feathersClient.service('nats-actions-handler').create({
          reqType: 'transferAT',
          channel: channel,
          ext: this.number,
          server:systemname
        });
        this.$store.commit('mycurrentcalls/updateItem', {channel, atxferActive: true, atxferCallerId: this.number});
        this.handleClose();
      },
      dialCall(){
        //strip special characters
        this.number = this.number.replace(/['":;/{}()[|\-.,<>?_=+ \]]/g, '');

        if(this.softphoneEnabled){
          this.$emit('softphoneDial', this.number);
          this.handleClose();
        } else {
          const {number, callerId, tenantCode, name} = this.user.myExtension;
          feathersClient.service('nats-actions-handler').create({
            reqType: 'dial',
            extension: number,
            callerId,
            name,
            dest: this.number,
            tenantCode,
            hostServer: this.userHostServer
          });
          this.handleClose();
        }
      }
    },
    mounted(){

      //event listener for our click to call chrome extension
      window.addEventListener('dialClick', (evt) => {
        const {number} = evt.detail;
        this.number = number;
        this.dialCall();
      });

      globalEventBus.$on('janusCallAccepted', () => {
        this.handleClose();
      });

      globalEventBus.$on('transferRequest', (item) => {
        this.isTransferRequest = true;
        this.transferItem = item;
      });

      window.addEventListener('keypress', (event) => {
        if(this.dialogVisible && this.inputElement){
          if(this.inputElement === document.activeElement){
            if(event.key === 'Enter'){
              if(this.selectedPerson && !this.isTransferRequest){
                this.dialCall();
              } else if(this.number.length && this.currentSuggestions.length){
                this.handleSelect(this.currentSuggestions[0]);
                this.$refs.autoComplete.suggestions = [];
              } else {
                if(this.number.length && !this.currentSuggestions.length && !this.isTransferRequest){
                  this.dialCall();
                }
              }
            }
          }
        }
      });

    },
    beforeDestroy(){
      window.removeEventListener('keypress', () => {
        console.log('keypress listener killed');
      });
      globalEventBus.$off(['janusCallAccepted', 'transferRequest']);
    }
  }
</script>

<style lang="scss" scoped>

  @import '../../../../assets/scss/_variables';
  @import '../../../../assets/scss/_mixins';

  .contact-item{
    padding: 3px 0;
    .number-details{
      margin-left: 0 !important;
    }
  }

  .contact-container{
    height: 40px;
  }


  .header-input {
    width: 85%;
    margin: 0 auto;

    .el-input {
      //font-size: 25px;
    }

    ::placeholder {
      //font-size: 16px;
    }
  }

  .button-container {
    text-align: center;
    padding: 15px;
    display: flex;
    justify-content: center;
  }

  .keypad-container {
    text-align: center;

    .el-row {
      margin-bottom: 10px;

      &:last-child {
        margin-bottom: 10px;
      }
    }

    .el-button {
      width: 60px;
      height: 60px;
      font-size: 12px;
      color: $voxo-blue;
    }

    .btn-number {
      margin-bottom: 5px;
      font-size: 25px;
    }

    .btn-number-blank {
      font-size: 25px;
    }
  }

  .button-wrapper {
    margin: 20px 20px 0;
  }

  .el-autocomplete{
    width: 100%;
  }

  .contact-info {
    margin: 10px;

    .checkbox-wrapper {
      display: flex;
      justify-content: center;
    }

    .el-button {
      color: $voxo-blue;
      font-size: 15px;
    }

    ::placeholder {
      text-align: left;
      font-size: 17px;
    }

  }
</style>
