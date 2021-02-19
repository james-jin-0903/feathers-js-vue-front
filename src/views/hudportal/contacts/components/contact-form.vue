<template>

  <div>
    <custom-modal
      class="form-modal"
      :visible.sync="visible"
      :fullscreen="true"
      :show-close="false"
      :modal="false"
      @open="populateFields(contactRecord)">
      <div class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">
            {{ context }} Contacts
          </h1>
          <div class="modal-actions col-2">
            <el-button v-if="(bulkContacts.length && context === 'Create') || context === 'Edit'" type="primary" @click="handleSubmit">{{ context }}</el-button>
            <el-button type="default" @click="handleClose">Cancel</el-button>
          </div>
        </div>
      </div>
      <el-form>
        <div class="inline-form-group">
          <el-col :span="11">
            <el-input v-model="form.FIRSTNAME" type="text" placeholder="Enter First Name">
              <template slot="prefix">First Name</template>
            </el-input>
          </el-col>
          <el-col :span="1"></el-col>
          <el-col :span="12">
            <el-input v-model="form.LASTNAME" type="text" placeholder="Enter Last Name">
              <template slot="prefix">Last Name</template>
            </el-input>
          </el-col>
        </div>
        <div class="inline-form-group">
          <el-col :span="11">
            <el-input v-model="form.PHONE1" type="text" placeholder="Enter Phone Number">
              <template slot="prefix">Phone</template>
            </el-input>
          </el-col>
          <el-col :span="1"></el-col>
          <el-col :span="12">
            <el-input v-model="form.EMAIL" type="text" placeholder="Enter Email">
              <template slot="prefix">Email</template>
            </el-input>
          </el-col>
        </div>
        <div class="inline-form-group">
          <el-col :span="11">
            <el-input v-model="form.COMPANY" type="text" placeholder="Enter Company">
              <template slot="prefix">Company</template>
            </el-input>
          </el-col>
          <el-col :span="5"></el-col>
          <el-col :span="8" style="text-align:right;">
            <el-tooltip content="Add" placement="top" v-if="context === 'Create' && fieldsValid">
              <el-button circle type="primary" @click="addContact">
                <el-icon class="el-icon-plus"></el-icon>
              </el-button>
            </el-tooltip>
            <el-tooltip content="Delete" placement="top" v-if="context === 'Edit'">
              <el-button circle type="danger" @click="handleRemove">
                <el-icon class="el-icon-delete"></el-icon>
              </el-button>
            </el-tooltip>
          </el-col>
        </div>
      </el-form>
      <div id="contact-summary-block" v-if="context === 'Create'">
        <h3 class="form-section-header">
          And / Or
        </h3>
        <div class="inline-form-group mt-20">
          <el-button
            type="primary"
            @click="startImport">
            Import CSV
          </el-button>
          <el-button
            type="danger"
            circle
            icon="el-icon-close"
            v-if="fileSelected"
            @click="closeImporting">
          </el-button>
          <el-button
            type="primary"
            circle
            icon="el-icon-check"
            v-if="csvReady"
            @click="addToBulk">
          </el-button>
        </div>
        <div class="csv-import" v-show="importVisible">
          <upload-csv
            ref="fileButton"
            v-model="parsedCSV"
            :map-fields="['FIRSTNAME', 'LASTNAME', 'PHONE1', 'EMAIL', 'COMPANY']"
            @input="csvReady = true"
            @fileSelected="submitForMapping"
            :headers="true">
          </upload-csv>
        </div>
      </div>
      <el-table
        v-if="bulkContacts.length"
        :data="bulkContacts"
        class="modal-summary-table mb-10"
        height="250px"
        stripe>
        <el-table-column
          prop="FIRSTNAME"
          label="First Name">
        </el-table-column>
        <el-table-column
          prop="LASTNAME"
          label="Last Name">
        </el-table-column>
        <el-table-column
          prop="telephoneNumber"
          label="Number"
          :formatter="numberFormatter">
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <el-button
              @click="removeFromBulk(scope.$index)"
              type="default"
              size="small"
              circle
              icon="el-icon-minus">
            </el-button>
          </template>
        </el-table-column>

      </el-table>
    </custom-modal>
  </div>

</template>

<script>

  import {mapGetters, mapActions} from 'vuex';
  import feathersClient from "../../../../feathers/feathers-client";
  import uploadCSV from './upload-csv';
  import customModal from '../../../../components/CustomModalComponent';

  export default{
    name: 'OmniaContactForm',
    props: {
      context: {required: true},
      recordId: {default: ''},
      visible: {default: false}
    },
    components: {
      UploadCsv: uploadCSV,
      customModal
    },
    data(){
      return {
        bulkContacts: [],
        fieldsValid: false,
        parsedCSV: null,
        importVisible: false,
        csvReady: false,
        fileSelected: false,
        omniaPhonebookId: null,
        form: {
          FIRSTNAME: '',
          LASTNAME: '',
          PHONE1: '',
          EMAIL: '',
          COMPANY: ''
        }
      }
    },
    computed: {
      ...mapGetters('phonebook-entries', { contactProfile: 'get'}),
      user(){
        return this.$store.state.auth.user;
      },
      contactRecord(){
        if (this.context === 'Edit') {
          let currentRecord = this.contactProfile(this.recordId);
          this.populateFields(currentRecord);
          return currentRecord;
        }
        return {};
      },
      fieldLength(){
        let concat = '';
        Object.keys(this.form).forEach((key) => {
          concat+=this.form[key];
        });
        return concat.length;
      },
      hasPhonebook(){
        if(this.user.hasOwnProperty('myExtension')){
          return this.user.myExtension.omniaPhonebookId !== null;
        }
      }
    },
    watch: {
      fieldLength(){
        if(this.fieldLength){
          this.fieldsValid = true;
        }else{
          this.fieldsValid = false;
        }
      }
    },
    methods: {
      ...mapActions('phonebook-entries', {createEntries: 'create', removeEntry: 'remove', updateEntry: 'patch'}),
      handleSubmit(){
        if (this.context === 'Edit') {
          this.handleEdit()
        }
        if (this.context === 'Create') {
          this.handleCreate()
        }
      },

      async handleCreate(){
        this.$confirm('Create Contacts?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        }).then( async () => {
          if(this.hasPhonebook){
            this.saveContacts()
          }else{
            await this.createPhonebook();
            this.saveContacts();
          }
        }).catch( () => true);
      },

      saveContacts(){
        const contacts = [...this.bulkContacts];
        let data = [];
        for(let i = 0; i<contacts.length; i++){
          data.push({
            tenantId: this.user.myExtension.tenantId,
            phonebookId: this.user.myExtension.omniaPhonebookId ? this.user.myExtension.omniaPhonebookId : this.omniaPhonebookId,
            ...contacts[i]
          });
        }
        this.createEntries([data]).then( () => {
          this.$emit('modalClosed');
          this.clearFormFields();
          this.bulkContacts = [];
        });
      },

      handleEdit(){
        this.$confirm('Save Changes?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        }).then( () => {
          const data = {
            ...this.form,
            tenantId: this.user.myExtension.tenantId
          };
          this.updateEntry([this.recordId, data]).then( () => {
            this.$emit('modalClosed');
            this.clearFormFields();
            this.bulkContacts = [];
          });
        }).catch( () => true);
      },

      handleRemove(){
        if(this.context === 'Edit'){
          this.deleteContact();
        } else{
          this.clearFormFields();
        }
      },

      deleteContact(){
        this.$confirm('Delete Contact?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        }).then( () => {
          this.removeEntry(this.recordId).then(res => {
            this.$emit('modalClosed');
            this.clearFormFields();
            this.bulkContacts = [];
          });
        }).catch( () => true);

      },

      handleClose(){
        this.$confirm('Cancel and Discard Unsaved Changes?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        })
          .then(() => {
            this.$emit('modalClosed');
            this.clearFormFields();
            this.bulkContacts = [];
          })
          .catch(() => true);
      },

      populateFields(record){
        for (let key in record) {
          if (record.hasOwnProperty(key)) {
            if (this.form.hasOwnProperty(key)) {
              this.form[key] = record[key]
            }
          }
        }
      },

      clearFormFields(){
        Object.keys(this.form).forEach((key) => {
          this.form[key] = typeof this.form[key] === typeof [] ? [] : '';
        });
        this.fieldsValid = false;
      },

      addContact(){
        const contact = {...this.form};
        this.bulkContacts.push(contact);
        this.clearFormFields();
      },

      numberFormatter(row, column) {
        return row.PHONE1.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },

      closeImporting(){
        this.parsedCSV = null;
        this.csvReady = false;
        this.fileSelected = false;
        this.importVisible = false;
        this.$refs.fileButton.sample = null;
        this.$refs.fileButton.fileSelected = false;
        this.$refs.fileButton.map = {};
        this.$refs.fileButton.isValidFileMimeType = false;
        this.$refs.fileButton.form = {csv: null};
        let fileButton = document.querySelector('.form-control-file');
        fileButton.value = null;
      },

      addToBulk(){
        const values = [...this.parsedCSV];
        for(let i = 0; i<values.length; i++){
          this.bulkContacts.push(values[i]);
        }
        this.closeImporting();
      },

      startImport(){
        this.importVisible = true;
        const fileButton = document.querySelector('.form-control-file');
        fileButton.click();
      },

      removeFromBulk(index){
        this.bulkContacts.splice(index, 1);
      },

      async createPhonebook(){
        const phonebookService = feathersClient.service('phonebooks');
        await phonebookService.create({
          tenantId: this.user.myExtension.tenantId,
          name: `OMNIA-${this.user.myExtension.id}`,
          includeExt: 'no'
        }).then( (res) => {this.omniaPhonebookId = res.id});
      },
      submitForMapping(){
        this.fileSelected = true;
        this.$refs.fileButton.load();
      }
    }
  }

</script>

<style lang="scss" scoped>

  #contact-summary-block{
    max-width: 600px;
    margin: 15px auto;
  }

  .modal-summary-table {
    max-width: 600px;
    margin: 20px auto;
  }

  .vue-csv-uploader{
    input[type='file']{
      display: none;
    }
  }

</style>
