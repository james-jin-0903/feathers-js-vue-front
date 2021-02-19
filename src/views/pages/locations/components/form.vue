<template>

  <div>
    <DialogComponent
      id="edit-modal"
      class="form-modal"
      v-loading="modalLoading"
      :visible.sync="visible"
      :fullscreen="true"
      :show-close="false"
      :modal="false"
      @open="populateFields(phoneRecord)">
      <div class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">
            {{context}} Location
          </h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="handleSubmit">{{context}}</el-button>
            <el-button type="default" @click="handleClose"> Cancel</el-button>
          </div>
        </div>
      </div>

      <el-form>
        <el-input v-model="form.name" placeholder="Enter Name">
          <template slot="prefix">Name</template>
        </el-input>
        <el-input name="autoAddress" v-model="address" placeholder="Search For Address">
          <template slot="prefix">Search Address</template>
        </el-input>
        <div class="address-fields" v-if="addressFieldsActive">
          <div class="inline-form-group">
            <el-col :span="8">
              <el-input v-model="form.streetNum" placeholder="Enter Street #">
                <template slot="prefix">Street #</template>
              </el-input>
            </el-col>
            <el-col :span="1">
            </el-col>
            <el-col :span="15">
              <el-input v-model="form.streetInfo" placeholder="Enter Street Name">
                <template slot="prefix">Street Name</template>
              </el-input>
            </el-col>
          </div>
          <div class="inline-form-group">
            <el-col :span="8">
              <el-select
                v-model="form.locationType"
                :value="form.locationType"
                placeholder="Location Type"
                clearable>
                <template slot="prefix">Building/Suite</template>
                <el-option
                  v-for="location in locationOptions"
                  :key="location"
                  :label="location"
                  :value="location">
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="1">
            </el-col>
            <el-col :span="15">
              <el-input v-model="form.locationNumber" placeholder="Enter Building/Suite #">
                <template slot="prefix">Building / Suite #</template>
              </el-input>
            </el-col>
          </div>
          <div class="inline-form-group">
            <el-col :span="11">
              <el-input v-model="form.city" placeholder="Enter City">
                <template slot="prefix">City</template>
              </el-input>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="5">
              <el-input v-model="form.state" placeholder="Enter State">
                <template slot="prefix">State</template>
              </el-input>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="6">
              <el-input v-model="form.postalCode" placeholder="Enter Zip">
                <template slot="prefix">Zip Code</template>
              </el-input>
            </el-col>
          </div>
        </div>

        <div class="modal-footer-actions" v-if="context === 'Edit'">
          <el-button circle type="danger" icon="el-icon-delete" @click="deleteRecord(recordId)"></el-button>
        </div>
      </el-form>
    </DialogComponent>
  </div>

</template>

<script>

  import {mapGetters, mapActions} from 'vuex';
  import DialogComponent from '../../../../components/CustomModalComponent';

  export default {
    name: 'locationsForm',
    components: {
      DialogComponent
    },
    props: {
      context: {required: true},
      recordId: {default: ''},
      visible: {default: false}
    },
    data() {
      return {
        modalLoading: false,
        address: '',
        locationOptions: ['BLDG', 'FL', 'STE', 'APT'],
        addressFieldsActive: false,
        form: {
          name: '',
          streetNum: '',
          streetInfo: '',
          locationType: '',
          locationNumber: '',
          city: '',
          state: '',
          postalCode: ''
        }
      }
    },
    computed: {
      ...mapGetters('locations', {phoneProfile: 'get'}),
      modalVisible() {
        return this.visible;
      },
      phoneRecord() {
        if (this.context === 'Edit') {
          return this.phoneProfile(this.recordId);
        }
        return {};
      },
      selectedTenant() {
        return this.$store.state.selectedTenant;
      }
    },
    watch: {
      modalVisible(){
        if(this.context === 'Edit'){
          this.addressFieldsActive = true;
        }
      }
    },
    methods: {
      ...mapActions('locations', {createLocation: 'create', patchLocation: 'patch', removeLocation: 'remove'}),
      handleSubmit() {
        if (this.context === 'Create') {
          this.handleCreate();
        }
        if (this.context === 'Edit') {
          this.handleEdit();
        }
      },

      handleCreate() {
        let data = {
          tenantId: this.selectedTenant.id,
          address: {
            name: this.form.name,
            streetNum: this.form.streetNum,
            streetInfo: this.form.streetInfo,
            location: this.form.locationType + ' ' + this.form.locationNumber,
            city: this.form.city,
            state: this.form.state,
            postalCode: this.form.postalCode
          }
        };

        this.$confirm('Confirm e911 Creation?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning'
        })
          .then(() => {
            this.modalLoading = true;
            this.createLocation(data)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'Location ' + res.diCommentName + ' has been created!',
                  type: 'success'
                });
                this.modalLoading = false;
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
                this.modalLoading = false;
              });
          })
          .catch(() => true);
      },

      handleEdit() {
        this.$confirm('Update Account Details?', 'Warning', {
          confirmButtonText: 'Update',
          cancelButtonText: 'Cancel'
        })
          .then(() => {
            //set up form data to post.
            this.modalLoading = true;
            let data = {
              address: {...this.form}
            };
            data.address['location'] = data.address.locationType + ' ' + data.address.locationNumber;

            this.patchLocation([this.recordId, data])
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'Account ' + res.diCommentName + ' has been updated!',
                  type: 'success'
                });
                this.modalLoading = false;
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
                this.modalLoading = false;
              });
          })
          .catch(() => true);
      },

      deleteRecord(id) {
        this.$confirm('Permanently delete this E911 Location? No Going Back!', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.modalLoading = true;
            this.removeLocation(id)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'Account ' + res.diCommentName + ' has been removed!',
                  type: 'success'
                });
                this.$emit('modalClosed');
                this.clearFormFields();
                this.modalLoading = false;
              })
              .catch(error => {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: 'error'
                });
                this.modalLoading = false;
              });
          })
          .catch(() => true);
      },


      handleClose() {
        this.$emit('modalClosed');
        this.clearFormFields();
      },
      clearFormFields() {
        Object.keys(this.form).forEach((key) => {
          this.form[key] = typeof this.form[key] === typeof [] ? [] : '';
        });
        this.address = '';
        this.addressFieldsActive = false;
      },
      populateAddressFields(obj) {
        this.form.streetNum = obj['street_number'];
        this.form.streetInfo = obj['route'];
        this.form.city = obj['locality'];
        this.form.state = obj['administrative_area_level_1'];
        this.form.postalCode = obj['postal_code'];
        this.address = obj['street_number'] + ' ' + obj['route'] + ' ' + obj['locality'] + ', ' + obj['administrative_area_level_1'] + ' ' + obj['postal_code'];
      },
      populateFields(record) {
        this.form.name = record.diCommentName;
        try {
          const addressComponents = JSON.parse(record.emergencyNotes);
          this.form.streetNum = addressComponents.streetNum;
          this.form.streetInfo = addressComponents.streetInfo;
          this.form.city = addressComponents.city;
          this.form.state = addressComponents.state;
          this.form.postalCode = addressComponents.postalCode;
          if(addressComponents.location.length){
            let location_extras = addressComponents.location.split(' ');
            this.form.locationNumber = location_extras[1];
            this.form.locationType = location_extras[0];
          }
        } catch {
          console.log('address not stored');
        }
      }
    },
    mounted() {

      if (this.context === 'Create') {
        this.addressFieldsActive = false;
      }

      let locationInfo = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        postal_code: 'short_name'
      };

      this.autocomplete = new google.maps.places.Autocomplete(
        (document.querySelector("input[name='autoAddress']")),
        {types: ['geocode']}
      );
      this.autocomplete.setFields(['address_components']);
      this.autocomplete.setComponentRestrictions({
        'country': ['us']
      });
      this.autocomplete.addListener('place_changed', () => {
        let place = this.autocomplete.getPlace();
        let ac = place.address_components;

        let locationObject = {
          street_number: '',
          route: '',
          locality: '',
          administrative_area_level_1: '',
          postal_code: ''
        };

        for (let i = 0; i < ac.length; i++) {
          let addressType = ac[i].types[0];
          if (locationInfo[addressType]) {
            locationObject[addressType] = ac[i][locationInfo[addressType]];
          }
        }

        //here we will update our address object sent with the request
        this.populateAddressFields(locationObject);
        this.addressFieldsActive = true;
      });

    }
  }

</script>

<style lang="scss" scoped>

  .current-address-details {
    max-width: 600px;
    margin: 10px auto;
  }

</style>