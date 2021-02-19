<template>
  <div>
    <el-dialog
      class="form-modal"
      :visible.sync="visible"
      :fullscreen="true"
      :show-close="false"
      :modal="false"
      @open="populateFields(accountRecord)">
      <div id="edit-modal-header" class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">
            {{context}} Account
          </h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="handleSubmit">{{context}}</el-button>
            <el-button type="default" @click="handleClose">Cancel</el-button>
          </div>
        </div>
      </div>
      <el-form v-model="form">
        <el-input v-model="form.name" placeholder="Enter Acount Name">
          <template slot="prefix">Account Name</template>
        </el-input>
        <el-select
          v-model="form.timeZone"
          :value="form.timeZone"
          placeholder="Select Time Zone">
          <template slot="prefix">Time Zone</template>
          <el-option v-for="time in timeZones" :key="time" :label="time" :value="time"></el-option>
        </el-select>
        <div class="modal-footer-actions">
          <el-button circle type="danger" icon="el-icon-delete" @click="deleteRecord(recordId)"></el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>

  import {mapActions, mapGetters} from 'vuex';

  export default {
    name: 'AccountForm',
    props: {
      context: {required: true},
      recordId: {default: ''},
      visible: {default: false}
    },
    data() {
      return {
        timeZones: [
          'America/Chicago', 'America/New_York',
          'America/Los_Angeles', 'America/Denver'
        ],
        form: {
          name: '',
          timeZone: ''
        }
      }
    },
    computed: {
      ...mapGetters('tenants', {accountProfile: 'get'}),
      accountRecord() {
        if (this.context === 'Edit') {
          let currentRecord = this.accountProfile(this.recordId);
          this.populateFields(currentRecord);
          return currentRecord;
        }
        return {};
      }
    },
    methods: {
      ...mapActions('tenants', {patchAccount: 'patch', createAccount: 'create', deleteAccount: 'remove'}),
      populateFields(record) {
        for (let key in record) {
          if (record.hasOwnProperty(key)) {
            if (this.form.hasOwnProperty(key)) {
              this.form[key] = record[key]
            }
          }
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
      clearFormFields() {
        Object.keys(this.form).forEach((key) => {
          this.form[key] = typeof this.form[key] === typeof [] ? [] : '';
        });
      },
      handleSubmit() {
        if (this.context === 'Edit') {
          this.handleEdit();
        }
        if (this.context === 'Create') {
          this.handleCreate();
        }
      },
      handleEdit() {
        let data = {...this.form};
        this.$confirm('Update Account Details?', 'Warning', {
          confirmButtonText: 'Update',
          cancelButtonText: 'Cancel'
        })
          .then(() => {
            this.patchAccount([this.recordId, data])
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'Account ' + res.name + ' has been updated!',
                  type: 'success'
                });
                this.$emit('modalClosed');
                this.clearFormFields();
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
      },
      handleCreate() {
        let data = {...this.form};
        this.$confirm('Confirm Account Creation?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        })
          .then(() => {
            this.createAccount(data)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'User ' + res.name + ' has been created!',
                  type: 'success'
                });
                this.$emit('modalClosed');
                this.clearFormFields();
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
      },
      deleteRecord(id) {
        this.$confirm('Permanently delete this account? No Going Back!', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.deleteAccount(id)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'Account ' + res.name + ' has been removed!',
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
              });
          })
          .catch(() => true);
      }
    }
  }

</script>