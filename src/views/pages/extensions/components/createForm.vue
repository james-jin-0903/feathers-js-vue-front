<template>
  <el-dialog
    id="create-modal"
    class="form-modal"
    v-loading="createProcessing"
    :visible.sync="createVisible"
    :fullscreen="true"
    :show-close="false"
    :modal="false"
  >
    <div id="create-modal-header" class="modal-header">
      <div class="modal-header-layout flex grid-6 align-center">
        <h1 class="modal-title col-2">Create {{ createTypeHeader }}</h1>
        <div class="modal-actions col-2">
          <el-button
            type="primary"
            :disabled="macInUse || numInUse"
            @click="createOperation"
            >Create</el-button
          >
          <el-button type="default" @click="cancelOperation"> Cancel</el-button>
        </div>
      </div>
    </div>

    <el-form>
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="General" name="General">
          <div class="inline-form-group">
            <el-col :span="11">
              <el-input
                v-model="createForm.extNumber"
                placeholder="Extension Number"
              >
                <template slot="prefix">Extension Number</template>
                <template slot="append" v-if="numInUse">In Use!</template>
              </el-input>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="12">
              <el-input
                v-model="createForm.extName"
                placeholder="Extension Name"
              >
                <template slot="prefix">Extension Name</template>
              </el-input>
            </el-col>
          </div>
          <el-input
            class="checkbox-append"
            v-model="email"
            placeholder="Enter Email"
            v-if="activeExtType === 'desk'"
          >
            <template slot="prefix">Email</template>
            <template slot="append">
              <el-checkbox
                v-model="createForm.sendInvite"
                :label="true"
                v-if="activeExtType === 'desk' && email !== ''"
              >
                <span>Send Welcome Email</span>
              </el-checkbox>
            </template>
          </el-input>
          <el-select
            v-model="createForm.location"
            placeholder="Select Location"
            v-loading="locationsProcessing"
            :disabled="!locationOptions.length"
            filterable
          >
            <template slot="prefix">Location</template>
            <el-option
              v-for="option in locationOptions"
              :key="option.id"
              :value="option.number"
              :label="option.diCommentName"
            >
            </el-option>
          </el-select>
          <div class="inline-form-group">
            <el-col :span="11">
              <el-select
                v-model="createForm.branch"
                :value="createForm.branch"
                placeholder="Select or Add Branch"
                allow-create
                filterable
              >
                <template slot="prefix">Branch</template>
                <el-option
                  v-for="(item, index) in branchOptions"
                  :key="index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="12">
              <el-select
                v-model="createForm.department"
                :value="createForm.department"
                placeholder="Select or Add Department"
                allow-create
                filterable
              >
                <template slot="prefix">Department</template>
                <el-option
                  v-for="(item, index) in departmentOptions"
                  :key="index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-col>
          </div>

          <el-checkbox
            v-model="createForm.recording"
            :label="true"
            v-if="activeExtType === 'desk'"
          >
            <span>Recording</span>
          </el-checkbox>

          <div>
            <h2 class="form-section-header">Assign Available Numbers</h2>
            <el-select
              v-model="createForm.cidNums"
              :value="createForm.cidNums"
              remote
              :remote-method="remoteMethodForAvailableNums"
              multiple
              filterable
              default-first-option
              placeholder="Choose Numbers to Assign"
            >
              <el-option
                v-for="item in numberOptions"
                :key="item.key"
                :label="item.label | formatNumber"
                :value="item.key"
              >
              </el-option>
            </el-select>
          </div>
          <div v-if="activeExtType === 'desk'">
            <h3 v-if="!numberOptions.length">No available numbers found</h3>
            <router-link to="/phone-numbers?context=create">
              <el-button round>
                <div class="dashboard-button-group">
                  <v-svg class="voxo-pink" sprite="phone-number"></v-svg>
                  <span>New Number</span>
                </div>
              </el-button>
            </router-link>
          </div>

          <div v-if="activeExtType === 'sip'">
            <h2 class="form-section-header">Call Paths Field</h2>
            <el-input
              v-model.number="createForm.callLimit"
              type="number"
              placeholder="Call Paths Field"
            >
              <template slot="prefix">Call Paths Field</template>
            </el-input>
          </div>
          <h2 class="form-section-header">Outbound Caller ID</h2>
          <el-select
            v-model="createForm.cidNum"
            :value="createForm.cidNum"
            filterable
            allow-create
            remote
            :remote-method="remoteMethodForOutboundCid"
            placeholder="Select Caller ID"
          >
            <template slot="prefix">Ext Caller ID</template>
            <el-option
              v-for="option in outboundCidNumbersOptions"
              :key="option.id"
              :value="option.label"
              :label="option.label | formatNumber"
            >
            </el-option>
          </el-select>
          <h2 class="form-section-header">7-Digit Dialing</h2>
          <el-input v-model="createForm.prefix" placeholder="Your Area Code">
            <template slot="prefix">Default Area Code</template>
          </el-input>

          <!--
          <h2 class="form-section-header" v-if="activeExtType === 'sip'">
            SIP Credentials
          </h2>
          <div class="inline-form-group" v-if="activeExtType === 'sip'">
            <el-col :span="12">
              <el-input
                v-model="createForm.sipUser"
                placeholder="Enter SIP Username"
                :readonly="true"
              >
                <template slot="prefix">SIP Username</template>
              </el-input>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="11">
              <el-input
                v-model="createForm.sipPass"
                placeholder="Enter SIP Password"
                :readonly="true"
              >
                <template slot="prefix">SIP Password</template>
              </el-input>
            </el-col>
          </div>
          -->
        </el-tab-pane>
        <el-tab-pane
          label="Devices"
          name="Devices"
          v-if="activeExtType !== 'sip'"
        >
          <div v-if="activeExtType !== 'sip'">
            <h2 class="form-section-header" v-if="activeExtType !== 'sip'">
              Devices
            </h2>
            <div v-if="deviceList.length === 0">
              <el-button round @click="deviceType = 'New Device'">
                <div class="dashboard-button-group">
                  <v-svg class="voxo-pink" sprite="devices" />
                  <span>New Device</span>
                </div>
              </el-button>
            </div>
            <div v-if="deviceList.length > 0">
              <el-select
                v-model="deviceType"
                :value="deviceType"
                placeholder="Select Device"
                v-if="activeExtType !== 'sip'"
                filterable
              >
                <template slot="prefix">Device</template>
                <el-option value="Existing Device" label="Existing Device">
                </el-option>
                <el-option value="New Device" label="New Device"> </el-option>
              </el-select>
            </div>
          </div>
          <div v-if="deviceType === 'New Device'">
            <el-select
              @change="onPhoneModelSelection"
              :value="phPmIdValue"
              placeholder="Select Phone Model"
            >
              <el-option
                v-for="(item, index) in deviceModelList"
                :key="index"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
            <el-input
              v-model="createForm.newDevice.name"
              placeholder="Enter Device Name"
            >
              <template slot="prefix">Device Name</template>
            </el-input>
            <!-- Mac Input Field with Mask -->
            <div class="el-input el-input--prefix">
              <!----><input
                type="text"
                autocomplete="off"
                placeholder="Enter Device Mac"
                class="el-input__inner"
                :value="createForm.newDevice.mac"
                @input="
                  createForm.newDevice.mac = $event.target.value.toUpperCase()
                "
                v-mask="'##:##:##:##:##:##'"
              /><span class="el-input__prefix">Device Mac<!----></span>
              <div v-if="macInUse" class="el-input-group__append">In Use!</div>
            </div>
          </div>
          <div v-if="deviceType === 'Existing Device'">
            <el-select
              v-model="createForm.existingDevice.id"
              :value="createForm.existingDevice.id"
              placeholder="Select Device"
              v-if="activeExtType !== 'sip'"
              :disabled="!deviceList.length"
            >
              <template slot="prefix">Device</template>
              <el-option
                v-for="option in deviceList"
                :key="option.id"
                :value="option.id"
                :label="option.name"
              >
              </el-option>
            </el-select>
          </div>
        </el-tab-pane>
        <!--
        <el-tab-pane
          label="Voicemail"
          name="Voicemail"
          v-if="activeExtType === 'desk'"
        >
          <el-input
            :readonly="true"
            v-model="createForm.voicemailPin"
            placeholder="Enter Voicemail PIN"
          >
            <template slot="prefix">PIN</template>
          </el-input>
          <el-select
            v-model="createForm.voicemailDelivery"
            :value="createForm.voicemailDelivery"
            placeholder="Select Delivery Method"
          >
            <template slot="prefix">Delivery Method</template>
            <el-option
              v-for="(item, index) in deliveryOptions"
              :key="index"
              :value="item"
              :label="item"
            >
            </el-option>
          </el-select>
        </el-tab-pane>
        -->
        <!-- <el-tab-pane
          label="Never Miss A Call"
          name="Never Miss A Call"
          v-if="activeExtType === 'desk'"
        >
          <el-input
            v-model="createForm.simulRing"
            placeholder="Enter Simultaneous Ring Number"
          >
            <template slot="prefix">Simultaneous Ring</template>
          </el-input>
          <el-select
            v-model="createForm.extNoAnswer"
            :value="createForm.extNoAnswer"
            placeholder="Select No Answer Destination"
          >
            <template slot="prefix">No Answer Destination</template>
          </el-select>
          <el-select
            v-model="createForm.extBusy"
            :value="createForm.extBusy"
            placeholder="Select Busy Destination"
          >
            <template slot="prefix">Busy Destination</template>
          </el-select>
          <el-select
            v-model="createForm.extOffline"
            :value="createForm.extOffline"
            placeholder="Select Offline Destination"
          >
            <template slot="prefix">Offline Destination</template>
          </el-select>
        </el-tab-pane> -->
      </el-tabs>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  name: "CreateExtensionForm",
  props: {
    clearFormFields: {
      type: Boolean,
      required: true,
    },
    createProcessing: { required: true },
    createVisible: { required: true },
    createTypeHeader: { required: true },
    numInUse: { required: true },
    macInUse: { required: true },
    activeExtType: { required: true },
    locationsProcessing: { required: true },
    locationOptions: { required: true },
    branchOptions: { required: true },
    departmentOptions: { required: true },
    numberOptions: { required: true },
    deviceList: { required: true },
    outboundCidNumbersOptions: { required: true },
    deviceModelList: { required: true },
  },
  data() {
    return {
      activeTabName: "General",
      deliveryOptions: ["Phone", "Email"],
      deviceType: "",
      email: "",
      createForm: {
        unconditionalStatus: "",
        followMe: false,
        recording: false,
        fmfmNumber: "",
        prefix: "",
        extNumber: "",
        extName: "",
        email: "",
        sendInvite: false,
        location: "",
        department: "",
        branch: "",
        sipUser: "",
        sipPass: "",
        voicemailDelivery: "",
        cidNum: "",
        fmfmDialMethod: "Normal",
        callLimit: null,
        cidNums: [],
        existingDevice: {
          id: null,
        },
        newDevice: {
          name: "",
          mac: "",
          phPmId: 0,
        },
      },
    };
  },
  computed: {
    extensionNumber() {
      return this.createForm.extNumber;
    },
    phPmIdValue() {
      return this.createForm.newDevice.phPmId === 0
        ? ""
        : this.createForm.newDevice.phPmId;
    },
    mac() {
      return this.createForm.newDevice.mac;
    },
  },
  watch: {
    extensionNumber() {
      if (this.extensionNumber !== "") {
        this.$emit("checkNumber", this.extensionNumber);
      }
    },
    mac() {
      if (this.mac !== "") {
        this.$emit("checkMac", this.mac);
      }
    },
    clearFormFields() {
      if (this.clearFormFields) {
        this.email = "";
        this.clearFields(this.createForm);
        this.activeTabName = "General";
        this.deliveryOptions = ["Phone", "Email"];
        this.deviceType = "";
      }
    },
    email(value) {
      if (!value) {
        this.createForm.sendInvite = false;
        this.createForm.email = "";
      } else {
        this.createForm.email = value;
      }
    },
  },
  methods: {
    onPhoneModelSelection(value) {
      this.createForm.newDevice.phPmId = value;
    },

    cancelOperation() {
      this.$emit("cancelOperation", this.createForm);
    },

    createOperation() {
      if (this.createForm.callLimit === null) {
        this.createForm.callLimit = 5;
      }

      this.createForm.recording = this.createForm.recording ? "yes" : "no";

      let createBody = {
        ...this.createForm,
        extType: this.activeExtType,
      };

      if (!this.createForm.existingDevice.id) {
        delete createBody.existingDevice;
      } else {
        delete createBody.newDevice;
      }

      if (this.activeExtType === "sip") {
        createBody.existingDevice = {
          id: 0,
        };
        delete createBody.newDevice;
      }

      this.$emit("createOperation", createBody);
    },

    clearFields(form) {
      Object.keys(form).forEach((key) => {
        if (typeof form[key] === "string") {
          form[key] = "";
        }
        if (typeof form[key] === "boolean") {
          form[key] = false;
        }
        if (Array.isArray(form[key])) {
          form[key] = [];
        }
      });
      this.createForm.fmfmDialMethod = "Normal";
      this.createForm.callLimit = null;
      this.createForm.existingDevice = {
        id: null,
      };
      this.createForm.newDevice = {
        name: "",
        mac: "",
        phPmId: null,
      };
      this.$emit("formFieldsCleared");
    },

    remoteMethodForOutboundCid(query) {
      this.$emit("remoteMethodForOutboundCid", query);
    },

    remoteMethodForAvailableNums(query) {
      this.$emit("remoteMethodForAvailableNums", query);
    },
  },
  filters: {
    formatNumber(value) {
      return `(${value.substr(0, 3)})-${value.substr(3, 3)}-${value.substr(
        6,
        4
      )}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/variables";

.checkbox-group {
  max-width: 600px;
  margin: auto;
}

.el-tabs {
  max-width: 600px;
  margin: auto;
}

.dashboard-button-group {
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    padding-left: 10px;
  }
}

.dashboard-button {
  text-align: center;
  padding: 18px;
}

.not-in-use {
  background: $voxo-pink;
}

.dnd-icon {
  right: -2px;
}
</style>
