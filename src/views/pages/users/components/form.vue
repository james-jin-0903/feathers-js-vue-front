<template>

  <div>
    <el-dialog
      class="form-modal"
      :visible.sync="visible"
      :fullscreen="true"
      :show-close="false"
      :modal="false"
      @open="populateFields(userRecord)">
      <div class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">
            {{ context }} User
          </h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="handleSubmit">{{ context === 'Edit' ? 'Save' : context }}</el-button>
            <el-button type="default" @click="handleClose">Cancel</el-button>
          </div>
        </div>
      </div>
      <el-form>
        <div class="button-group" v-if="context === 'Edit'">
          <el-checkbox-group v-model="resetPassword">
            <el-checkbox :label="true" class="black-text">
              Reset Password and Send Invite?
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <el-input type="text" v-model="form.email" placeholder="Enter Email">
          <template class="label-prefix" slot="prefix">Email</template>
        </el-input>
        <el-select
          v-model="form.userRole"
          filterable
          placeholder="Select Role">
          <template slot="prefix">User Role</template>
          <el-option v-if="+this.user.userRole === 1" :key="1" label="Platform Administrator" :value="1"></el-option>
          <el-option v-for="role in roleOptions" :key="role.value" :label="role.label" :value="role.value"></el-option>
        </el-select>
        <div v-if="+form.userRole === 3">
          <h2 class="form-section-header">
            Assign Accounts
          </h2>
          <el-transfer
            v-model="form.tenantIds"
            :data="transferTenants"
            :titles="['Available', 'Assigned']"
            filterable>
          </el-transfer>
        </div>
        <el-select
          v-model="form.tenantId"
          v-show="+form.userRole"
          filterable
          :placeholder="+form.userRole < 5 ? 'Select Home Account' : 'Select Account'"
          @change="queryTenantInfo">
          <template slot="prefix">{{ +form.userRole < 5 ? 'Home Account' : 'Account' }}</template>
          <el-option
            v-for="(tenant, index) in transferTenants"
            :key="index"
            :label="tenant.label"
            :value="tenant.key">
          </el-option>
        </el-select>
        <el-select
          v-loading="extensionOptionsLoading"
          v-model="form.extension"
          v-show="form.tenantId"
          filterable
          clearable
          placeholder="Select Extension">
          <template slot="prefix">
            Extension
          </template>
          <el-option
            v-for="exten in availableExtensions"
            :key="exten.id"
            :label="exten.name + ' - ' + exten.number"
            :value="exten.number">
          </el-option>
        </el-select>
        <div v-if="(+form.userRole === 7 || +form.userRole === 3) && form.tenantId">
          <h2 class="form-section-header" v-if="availableQueues.length">
            <span v-if="+form.userRole === 7">
              Assign Queues
            </span>
            <span v-else>
              Add Queue Reports
            </span>
          </h2>
          <h2 class="form-section-header flex align-center" v-if="!availableQueues.length && +form.userRole === 7">
            <el-icon class="el-icon-warning mr-10"></el-icon>
            Selected Account Has No Assignable Queues
          </h2>
          <div class="inline-form-group" v-if="availableQueues.length">
            <el-switch
              v-model="form.receiveQueueReports">
            </el-switch>
            <h4 class="ml-10 black-text">Receive Queue Reports?</h4>
          </div>
          <el-transfer
            v-model="form.adminQueues"
            v-if="availableQueues.length && (+form.userRole === 7 || form.receiveQueueReports)"
            :data="availableQueues"
            :titles="['Available', 'Assigned']"
            filterable>
          </el-transfer>
        </div>
        <div class="modal-footer-actions">
          <el-button
            circle
            type="danger"
            icon="el-icon-delete"
            @click="deleteRecord(recordId)"
            v-if="context === 'Edit'">
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>

</template>

<script>

  import {mapGetters, mapActions} from 'vuex';

  export default {
    name: 'UserForm',
    props: {
      context: {required: true},
      recordId: {default: ''},
      visible: {default: false}
    },
    data() {
      return {
        extensionOptionsLoading: false,
        resetPassword: false,
        roleOptions: [
          {value: 3, label: 'Account Administrator'},
          {value: 7, label: 'Queue Manager'},
          {value: 5, label: 'User'}
        ],
        form: {
          email: '',
          userRole: '',
          us_useldap: '',
          tenantId: null,
          extension: '',
          tenantIds: [],
          adminQueues: [],
          receiveQueueReports: false
        }
      }
    },
    computed: {
      ...mapGetters('users', {userProfile: 'get'}),
      ...mapGetters('extensions', {extensionList: 'find'}),
      ...mapGetters('queues', {queueList: 'find'}),
      userRecord() {
        if (this.context === 'Edit') {
          let currentRecord = this.userProfile(this.recordId);
          this.populateFields(currentRecord);
          return currentRecord;
        }
        return {};
      },
      transferTenants() {
        const authTenants = this.$store.state.authTenants;
        let transferTenants = [];
        authTenants.forEach((t) => {
          transferTenants.push({
            key: t.id,
            label: t.name,
            disabled: false
          });
        });
        return transferTenants;
      },
      availableExtensions() {
        return this.extensionList({
          query: {
            $or: [
              {email: this.form.email},
              {email: null},
              {email: ''}
            ]
          }
        }).data;
      },
      availableQueues(){
        return this.queueList({
          query: {
            tenantId: this.form.tenantId
          }
        }).data.map( (item) => {
          return {
            key: item.id,
            label: item.name,
            disabled: false
          }
        });
      },
      userExtension(){
        if(this.form.email.length){
          const exten = this.extensionList({
            query: {
              email: this.form.email
            }
          }).data;
          if(exten.length){
            return exten[0];
          }else{
            return null;
          }
        }
      },
      user(){
        return this.$store.state.auth.user;
      }
    },
    watch: {
      userRecord(){
        if(this.context === 'Edit' && this.visible){
          this.queryTenantInfo();
        }
      },
      userExtension(){
        if(this.visible){
          this.form.extension = this.userExtension ? this.userExtension.number : '';
        }
      }
    },
    methods: {
      ...mapActions('users', {updateUser: 'patch', createUser: 'create', removeUser: 'remove'}),
      ...mapActions('extensions', {findExtensions: 'find'}),
      ...mapActions('queues', {findQueues: 'find'}),
      queryTenantInfo() {
        this.$store.commit('extensions/clearList');
        this.extensionOptionsLoading = true;
        this.findExtensions({query: {tenantId: this.form.tenantId}}).then( () => {this.extensionOptionsLoading = false});
        this.findQueues({query: {tenantId: this.form.tenantId}});
      },
      handleSubmit() {
        if (this.context === 'Edit') {
          this.handleEdit()
        }
        if (this.context === 'Create') {
          this.handleCreate()
        }
      },
      handleCreate() {
        let data = {...this.form};
        data.receiveQueueReports = data.receiveQueueReports ? 1 : 0;

        const { userRole } = this.form;
        if(+userRole !== 1 && (!this.form.tenantId || !this.form.extension.length)){
          this.$notify({
            title: 'Invalid Data',
            message: 'You must assign a Home Account and Extension!',
            type: 'error'
          });
        } else {
          this.$confirm('Confirm User Creation? Please tell the new user to check their email for the invite that will contain their login information.', 'Warning', {
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            type: 'warning'
          })
            .then(() => {
              this.createUser(data)
                .then(res => this.$notify({
                  title: 'Success',
                  message: 'User ' + res.email + ' has been created!',
                  type: 'success'
                }))
                .then(() => {
                  this.clearFormFields();
                  this.$emit('modalClosed');
                })
                .catch(error => {
                  if (error.hasOwnProperty('errors')) {
                    if(error.name === 'BadRequest'){
                      this.$notify({
                        title: error.name,
                        message: error.message,
                        type: 'error'
                      });
                    } else {
                      this.$notify({
                        title: error.message,
                        message: error.errors[0].message.indexOf('us_username') >= 0 ? 'Account with this email already exists!' : error.errors[0].message,
                        type: 'error'
                      });
                    }
                  } else {
                    this.$notify({
                      title: error.name,
                      message: error.message,
                      type: 'error'
                    });
                  }
                });
            })
            .catch(() => true);
        }
      },
      handleEdit() {
        let data = {...this.form, resetPassword: this.resetPassword};
        data.receiveQueueReports = data.receiveQueueReports ? 1 : 0;

        const { userRole } = this.form;
        if(+userRole !== 1 && (!this.form.tenantId || !this.form.extension.length)){
          this.$notify({
            title: 'Invalid Data',
            message: 'You must assign a Home Account and Extension!',
            type: 'error'
          });
        } else {
          this.$confirm('Update User Details?', 'Warning', {
            confirmButtonText: 'Update',
            cancelButtonText: 'Cancel'
          })
            .then(() => {
              this.updateUser([this.recordId, data])
                .then(res => {
                  this.$notify({
                    title: 'Success',
                    message: 'User ' + res.email + ' has been updated!',
                    type: 'success'
                  });
                  this.clearFormFields();
                  this.$emit('modalClosed');
                })
                .catch(error => {
                  if (error.hasOwnProperty('errors')) {
                    this.$notify({
                      title: error.message,
                      message: error.errors[Object.keys(error.errors)[0]],
                      type: 'error'
                    });
                  } else {
                    this.$notify({
                      title: error.name,
                      message: error.message,
                      type: 'error'
                    });
                  }
                });
            })
            .catch(() => true);
        }
      },
      handleClose() {
        this.$confirm('Cancel and Discard Unsaved Changes?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel'
        })
          .then(() => {
            this.$emit('modalClosed');
            this.clearFormFields();
          })
          .catch(() => true);
      },
      deleteRecord(id) {
        this.$confirm('Permanently delete this user?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.removeUser(id)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'User ' + res.email + ' has been removed!',
                  type: 'success'
                });
                this.$emit('modalClosed');
                this.clearFormFields();
              })
              .catch(error => {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: 'error'
                });
              })
          })
          .catch(() => true);
      },
      clearFormFields() {
        this.resetPassword = false;
        this.form.tenantId = null;
        this.form.tenantIds = [];
        this.form.adminQueues = [];
        this.form.receiveQueueReports = false;
        this.form.email = '';
        this.form.us_useldap = '';
        this.form.userRole = '';
        this.form.extension = '';
        this.$store.commit('extensions/clearList');
      },
      populateFields(record) {
        for (let key in record) {
          if (record.hasOwnProperty(key)) {
            if (this.form.hasOwnProperty(key)) {
              this.form[key] = record[key]
            }
          }
        }
        this.form.receiveQueueReports = !!record.receiveQueueReports;
      },
    }
  }

</script>

<style lang="scss" scoped>

  .button-group {
    max-width: 600px;
    margin: 30px auto;
  }

</style>
