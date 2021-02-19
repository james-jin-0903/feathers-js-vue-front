<template>

  <div class="table-box card-base card-shadow--medium">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="Business Contacts" name="Business Contacts" class="tab-section">
        <div id="contacts-view">
          <div class="box flex align-center">
            <el-form class="list-search-input">
              <el-input
                v-model="search"
                placeholder="Search Name / Number"
                clearable>
              </el-input>
            </el-form>
            <el-popover>
              <div class="filter-columns">
                <div class="contacts-filter mr-10">
                  <h5
                    v-if="hudBranches.length"
                    class="hud-subheader text-muted">
                    BRANCHES
                  </h5>
                  <el-checkbox-group
                    class="filter-group"
                    v-model="activeBranches"
                    @change="filterBranches">
                    <el-checkbox
                      :class="checkBoxClasses[index] + ' no-check filter-checkbox'"
                      v-for="(item, index) in hudBranches"
                      :key="index"
                      :label="item">
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                <div class="contacts-filter">
                  <h5
                    v-if="hudDepartments.length"
                    class="hud-subheader text-muted">
                    DEPARTMENTS
                  </h5>
                  <el-checkbox-group
                    class="filter-group"
                    v-model="activeDepartments"
                    @change="filterDepartments">
                    <el-checkbox
                      :class="checkBoxClasses[index + hudBranches.length] + ' no-check filter-checkbox'"
                      v-for="(item, index) in hudDepartments"
                      :key="index"
                      :label="item">
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </div>
              <el-tooltip placement="top" content="Filter" slot="reference">
                <el-button class="keypad-btn nav-call-button" size="mini" circle type="primary">
                  <v-svg sprite="filter"/>
                </el-button>
              </el-tooltip>
            </el-popover>

            <h4 class="black-text text-right">{{contactsCount}} contacts shown</h4>
          </div>
          <div class="configureMessage" v-if="!userConfigured">
            Your User Extension Has Not Been Configured. See Admin.
          </div>
          <div class="item-list-contacts">
            <contact
              v-for="item in filteredList"
              :key="item.id"
              :name="item.name"
              :number="item.number"
              :email="item.email"
              :status="item.extStatus"
              :dnd="item.dnd"
              :branch="item.branch"
              :department="item.department"
              :avatar="item.avatarPath"
              :showDial="true">
            </contact>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Personal Contacts" name="Personal Contacts" class="tab-section">
        <div id="personal-contacts-view">
          <div class="box flex align-center">
            <div class="add-contact-button">
              <!--              <el-button type="default" @click="syncContacts">
                              <el-icon class="el-icon-refresh"></el-icon>
                              Sync
                            </el-button>-->
              <el-tooltip content="Add Contacts" placement="top">
                <el-button
                  type="default"
                  circle
                  icon="el-icon-plus"
                  @click="showModal('Create')">
                </el-button>
              </el-tooltip>
            </div>
            <el-form class="list-search-input">
              <el-input
                v-model="searchPersonal"
                placeholder="Search Name / Number"
                clearable>
              </el-input>
            </el-form>
            <h4 class="black-text text-right">{{personalContactsCount}} contacts shown</h4>
          </div>
          <div class="configureMessage" v-if="!userConfigured">
            Your User Extension Has Not Been Configured. See Admin.
          </div>
          <div class="item-list-contacts">
            <personal-contact
              v-for="item in filteredListPersonal"
              :key="item.id"
              :firstName="item.FIRSTNAME"
              :lastName="item.LASTNAME"
              :number="item.PHONE1"
              :email="item.EMAIL"
              :company="item.COMPANY"
              :showDial="true"
              @openModal="showModal('Edit', item.id)">
            </personal-contact>
          </div>
        </div>
        <contact-form
          :visible="contactModalVisible"
          :context="modalContext"
          :recordId="modalModelId"
          @modalClosed="contactModalVisible = false">
        </contact-form>
      </el-tab-pane>

    </el-tabs>
  </div>


</template>

<script>

  import Contact from "../contacts/components/contact";
  import PersonalContact from "../contacts/components/personal-contact";
  import ContactForm from "../contacts/components/contact-form";
  import {mapGetters} from "vuex";
  import feathersClient from "../../../feathers/feathers-client";
  import {globalEventBus} from "../../../globalEventBus";
  import extensionStatus from "../../../ref/extension-status";
  import colors from '../../../ref/colors';

  export default{
    name: 'MyContacts',
    components: {Contact, PersonalContact, ContactForm},
    data(){
      return {
        search: '',
        searchPersonal: '',
        personalContactsLoading: false,
        branchOptions: [],
        departmentOptions: [],
        contactsCount: '',
        personalContactsCount: '',
        activeTab: 'Business Contacts',
        contactModalVisible: false,
        modalContext: '',
        modalModelId: '',
        userConfigured: true,
        activeBranches: [],
        activeDepartments: [],
        checkBoxClasses: colors
      }
    },
    computed: {
      ...mapGetters('companydirectory', {getContactList: 'find'}),
      ...mapGetters('phonebook-entries', {getPhonebookEntriesList: 'find'}),
      selectedTenant(){
        return this.$store.getters.selectedTenant;
      },
      contactList(){
        const list = this.getContactList({
          query: {
            $or: [
              {branch: {$in: this.activeBranches}, department: {$in: this.activeDepartments}},
              {branch: {$in: this.activeBranches}, department: ''},
              {branch: '', department: {$in: this.activeDepartments}},
              {branch: '', department: ''}
            ],
            $sort: {
              name: 1
            }
          }}).data;
        this.contactsCount = list.length;
        return list;
      },
      personalContactList(){
        //in case an entry is empty we make sure details exists
        if(this.user.hasOwnProperty('myExtension')){
          const list = this.getPhonebookEntriesList({
            query: {
              hasDetails: true,
              phonebookId: this.user.myExtension.omniaPhonebookId,
              $sort: {
                FIRSTNAME: 1
              }
            }
          }).data;
          this.personalContactsCount = list.length;
          return list;
        }
        return [];

      },
      user(){
        return this.$store.state.auth.user;
      },
      filteredList(){
        return this.filteredData()
      },
      filteredListPersonal(){
        return this.filteredDataPersonal();
      },
      hudBranches(){
        return this.$store.getters.hudBranches;
      },
      hudDepartments(){
        return this.$store.getters.hudDepartments;
      },
      checkedBranches(){
        return this.$store.getters.activeHudBranches;
      },
      checkedDepartments(){
        return this.$store.getters.activeHudDepartments;
      },
    },
    watch: {
      checkedBranches(){
        this.activeBranches = this.checkedBranches;
      },
      checkedDepartments(){
        this.activeDepartments = this.checkedDepartments;
      }
    },
    methods: {
      filteredData() {
        const filteredList = this.contactList.filter(data => !this.search
          || data.number.toLowerCase().includes(this.search.toLowerCase())
          || data.name.toLowerCase().includes(this.search.toLowerCase())
        );
        this.contactsCount = filteredList.length;
        return filteredList;
      },

      filteredDataPersonal(){
        const filteredList = this.personalContactList.filter(data => !this.searchPersonal
          || data.FIRSTNAME.toLowerCase().includes(this.searchPersonal.toLowerCase())
          || data.LASTNAME.toLowerCase().includes(this.searchPersonal.toLowerCase())
          || data.PHONE1.toLowerCase().includes(this.searchPersonal.toLowerCase())
        );
        this.personalContactsCount = filteredList.length;
        return filteredList;
      },
      showModal(context, editId = null) {
        this.contactModalVisible = true;
        this.modalContext = context;
        this.modalModelId = editId;
      },
      syncContacts(){
        console.log('try to sync the contacts man.');
        const sbcService = feathersClient.service('sbc-management');
        const data = {
          command: 'resyncDevices',
          peerName: this.user.myExtension.peerName
        };
        sbcService.create(data).then(res => {
          this.$notify({
            title: 'Success',
            message: 'Sync Successful',
            type: 'success'
          });
        });
      },
      getStatusFromEvent(code) {
        return extensionStatus(code)
      },
      filterBranches(){
        console.log('sandwich');
        const data = [...this.activeBranches];
        this.$store.commit('setActiveHudBranches', data )
      },
      filterDepartments(){
        const data = [...this.activeDepartments];
        this.$store.commit('setActiveHudDepartments', data )
      }
    },
    created(){
      if(this.user){
        if(!this.user.hasOwnProperty('myExtension')){
          this.$notify({
            title: 'Warning',
            message: 'Your Account Has No Assigned Extension',
            type: 'warning'
          });
          this.userConfigured = false;
        }
      }
    },
    mounted(){
      this.activeBranches = this.checkedBranches;
      this.activeDepartments = this.checkedDepartments;
    }
  }

</script>

<style lang="scss" scoped>

  @import '../../../assets/scss/variables';

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

  .table-box{
    height: calc(100% - .7em);
    overflow: hidden;
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

  .filter-columns{
    display: flex;
  }

  .filter-checkbox{
    display: block;
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
