<template>
  <el-dialog
    id="edit-modal"
    class="form-modal"
    v-loading="editProcessing"
    :visible.sync="editVisible"
    :fullscreen="true"
    :show-close="false"
    :modal="false"
  >
    <div id="edit-modal-header" class="modal-header">
      <div class="modal-header-layout flex grid-6 align-center">
        <h1 class="modal-title col-2">Edit {{ editTypeHeader }}</h1>
        <div class="modal-actions col-2">
          <el-button type="primary" @click="editOperation">Save</el-button>
          <el-button type="default" @click="cancelOperation"> Cancel</el-button>
        </div>
      </div>
    </div>

    <el-form>
      <el-tabs v-model="activeTabName">
        <!-- General Tab -->
        <el-tab-pane label="General" name="General">
          <div class="inline-form-group">
            <el-col :span="11">
              <el-input
                v-model="editForm.extNumber"
                placeholder="Extension Number"
              >
                <template slot="prefix">Extension Number</template>
                <template slot="append" v-if="numInUse">In Use!</template>
              </el-input>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="12">
              <el-input v-model="editForm.extName" placeholder="Extension Name">
                <template slot="prefix">Extension Name</template>
              </el-input>
            </el-col>
          </div>
          <el-input
            class="checkbox-append"
            v-model="email"
            placeholder="Enter Email"
            v-if="editExtType === 'desk'"
          >
            <template slot="prefix">Email</template>
            <template slot="append">
              <el-checkbox
                v-model="editForm.sendInvite"
                :label="true"
                v-if="editExtType === 'desk' && email !== ''"
              >
                <span>Send Welcome Email</span>
              </el-checkbox>
            </template>
          </el-input>
          <el-select
            v-model="location"
            placeholder="Select Location"
            v-loading="locationsProcessing"
            :disabled="!locationOptions.length"
            filterable
          >
            <template slot="prefix">Location</template>
            <el-option
              v-for="option in locationOptions"
              :key="option.diCommentName + getRandomKey()"
              :value="option.number"
              :label="option.diCommentName"
            >
            </el-option>
          </el-select>
          <div class="inline-form-group">
            <el-col :span="11">
              <el-select
                v-model="editForm.branch"
                :value="editForm.branch"
                placeholder="Select or Add Branch"
                allow-create
                filterable
              >
                <template slot="prefix">Branch</template>
                <el-option
                  v-for="item in branchOptions"
                  :key="item + getRandomKey()"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="12">
              <el-select
                v-model="editForm.department"
                :value="editForm.department"
                placeholder="Select or Add Department"
                allow-create
                filterable
              >
                <template slot="prefix">Department</template>
                <el-option
                  v-for="item in departmentOptions"
                  :key="item + getRandomKey()"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </el-col>
          </div>

          <el-checkbox
            v-model="editForm.recording"
            :label="true"
            v-if="editExtType === 'desk'"
          >
            <span>Recording</span>
          </el-checkbox>

          <div v-if="editExtType === 'desk'">
            <h2 class="form-section-header">DND</h2>
            <el-switch
              :value="editForm.dnd"
              v-model="editForm.dnd"
              active-color="#35be8b"
              inactive-color="#ff8f02"
            >
            </el-switch>
          </div>

          <div>
            <h2 class="form-section-header">Assign Available Numbers</h2>
            <el-select
              v-model="editForm.cidNums"
              :value="editForm.cidNums"
              remote
              :remote-method="remoteMethodForAvailableNums"
              multiple
              filterable
              default-first-option
              placeholder="Choose Numbers to Assign"
              @change="onChangeCidNums"
            >
              <el-option
                v-for="item in cidNumOptions"
                :key="item.label + getRandomKey()"
                :label="item.label | formatNumber"
                :value="item.key"
              >
              </el-option>
            </el-select>
          </div>
          <div>
            <h2 class="form-section-header">Rings</h2>
            <el-select v-model="rings" :value="rings" placeholder="Rings">
              <template slot="prefix">Rings</template>
              <el-option v-for="i in 15" :key="i" :value="i" :label="i">
              </el-option>
            </el-select>
          </div>

          <div v-if="editExtType === 'desk'">
            <h2 class="form-section-header">Music On Hold</h2>
            <el-select v-model="editForm.muId" placeholder="Music On Hold">
              <template slot="prefix">Music On Hold</template>
              <el-option
                v-for="item in musicOnHoldsList"
                :key="item.name + getRandomKey()"
                :value="item.id"
                :label="item.name"
              >
              </el-option>
            </el-select>
          </div>

          <div v-if="editExtType === 'sip'">
            <h2 class="form-section-header">Call Paths Field</h2>
            <el-input
              v-model.number="editForm.callLimit"
              type="number"
              placeholder="Call Paths Field"
            >
              <template slot="prefix">Call Paths Field</template>
            </el-input>
          </div>
          <h2 class="form-section-header">Outbound Caller ID</h2>
          <el-select
            v-model="editForm.cidNum"
            :value="editForm.cidNum"
            filterable
            allow-create
            remote
            :remote-method="remoteMethodForOutboundCid"
            placeholder="Select Caller ID"
          >
            <template slot="prefix">Ext Caller ID</template>
            <el-option
              v-for="option in outboundCidNumbersOptions"
              :key="option.label + getRandomKey()"
              :value="option.label"
              :label="option.label | formatNumber"
            >
            </el-option>
          </el-select>
          <h2 class="form-section-header">7-Digit Dialing</h2>
          <el-input v-model="editForm.prefix" placeholder="Your Area Code">
            <template slot="prefix">Default Area Code</template>
          </el-input>
        </el-tab-pane>
        <!-- Devices Tab -->
        <el-tab-pane
          label="Devices"
          name="Devices"
          v-if="editExtType !== 'sip'"
        >
          <div>
            <h2 class="form-section-header">Devices</h2>
            <!-- EXT HAS Device -->
            <div v-if="extHasDevice">
              <el-checkbox v-model="editForm.removeDevice" :label="true">
                <span>Remove Device</span>
              </el-checkbox>
              <div v-if="!editForm.removeDevice">
                <el-select
                  v-model="editForm.device.phPmId"
                  :value="editForm.device.phPmId"
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
                  v-model="editForm.device.name"
                  placeholder="Enter Device Name"
                >
                  <template slot="prefix">Device Name</template>
                </el-input>
                <!-- Mac Input Field with Mask -->
                <div class="el-input el-input--prefix">
                  <input
                    type="text"
                    autocomplete="off"
                    placeholder="Enter Device Mac"
                    class="el-input__inner"
                    v-model="editForm.device.mac"
                    @input="
                      editForm.device.mac = $event.target.value.toUpperCase()
                    "
                    v-mask="'##:##:##:##:##:##'"
                  /><span class="el-input__prefix">Device Mac</span>
                  <div v-if="macInUse" class="el-input-group__append">
                    In Use!
                  </div>
                </div>
              </div>
            </div>
            <!-- EXT HAS NO DEVICE -->
            <div v-if="!extHasDevice || editForm.removeDevice">
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
                  filterable
                >
                  <template slot="prefix">Device</template>
                  <el-option value="Existing Device" label="Existing Device">
                  </el-option>
                  <el-option value="New Device" label="New Device"> </el-option>
                </el-select>
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
                  v-model="editForm.newDevice.name"
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
                    :value="editForm.newDevice.mac"
                    @input="
                      editForm.newDevice.mac = $event.target.value.toUpperCase()
                    "
                    v-mask="'##:##:##:##:##:##'"
                  /><span class="el-input__prefix">Device Mac<!----></span>
                  <div v-if="macInUse" class="el-input-group__append">
                    In Use!
                  </div>
                </div>
              </div>
              <div v-if="deviceType === 'Existing Device'">
                <el-select
                  v-model="editForm.existingDevice.id"
                  :value="editForm.existingDevice.id"
                  placeholder="Select Device"
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
            </div>
          </div>
        </el-tab-pane>
        <!-- Never Miss A Call -->
        <el-tab-pane
          label="Never Miss A Call"
          name="Never Miss A Call"
          v-if="editExtType === 'desk'"
        >
          <el-input v-model="editForm.fmfmNumber" placeholder="FmFmNumber">
            <template slot="prefix">FmFmNumber</template>
          </el-input>

          <el-checkbox
            v-model="simultaneousRing"
            :disabled="editForm.fmfmNumber === ''"
            :label="true"
          >
            <span>Simultaneous Ring</span>
          </el-checkbox>

          <el-checkbox v-model="followMe" :label="true">
            <span>Follow Me</span>
          </el-checkbox>

          <el-checkbox v-model="forwardAllCalls" :label="true">
            <span>Forward All Calls</span>
          </el-checkbox>

          <!-- Destinations -->

          <!-- Forwarding -->
          <div v-if="forwardAllCalls">
            <h2 class="form-section-header">Forwarding Destination</h2>
            <div class="inline-form-group">
              <el-col :span="12">
                <el-select
                  v-model="forwardingDestType"
                  placeholder="Select Forwarding Destination Type"
                >
                  <div v-for="item in deTypeDsts" :key="item + getRandomKey()">
                    <el-option :label="item" :value="item"></el-option>
                  </div> </el-select
              ></el-col>
              <el-col :span="1"></el-col>
              <el-col :span="11">
                <el-select
                  v-model="editForm.forwardingDestination.id"
                  filterable
                  :allow-create="forwardingDestType === 'CUSTOM'"
                  placeholder="Select Forwarding Destination"
                >
                  <el-option
                    v-for="item in forwardingDestinationOptions"
                    :key="item.id + getRandomKey()"
                    :value="item.id"
                    :label="getDestinationLabel(item, forwardingDestType)"
                  >
                  </el-option>
                </el-select>
              </el-col>
            </div>
          </div>

          <!-- EXISTING -->
          <div>
            <h2 class="form-section-header">Existing Destinations</h2>
            <div class="inline-form-group">
              <el-col :span="12">
                <el-select
                  v-model="extBusyDestinationType"
                  placeholder="Destination Type"
                  filterable
                >
                  <template slot="prefix">Destination Type</template>
                  <div v-for="item in deTypeDsts" :key="item">
                    <el-option :label="item" :value="item"></el-option>
                  </div>
                </el-select>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="11">
                <el-select
                  v-model="editForm.extBusy.id"
                  filterable
                  placeholder="Select Busy Destination"
                >
                  <template slot="prefix">Busy Destination</template>
                  <el-option
                    v-for="item in availableExtBusyDests"
                    :key="item.id"
                    :label="getDestinationLabel(item, extBusyDestinationType)"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-col>
            </div>
            <div class="inline-form-group">
              <el-col :span="12">
                <el-select
                  v-model="extOfflineDestinationType"
                  placeholder="Destination Type"
                  filterable
                >
                  <template slot="prefix">Destination Type</template>
                  <div v-for="item in deTypeDsts" :key="item">
                    <el-option :label="item" :value="item"></el-option>
                  </div>
                </el-select>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="11">
                <el-select
                  v-model="editForm.extOffline.id"
                  filterable
                  placeholder="Select Offline Destination"
                >
                  <template slot="prefix">Offline Destination</template>
                  <el-option
                    v-for="item in availableExtOfflineDests"
                    :key="item.id"
                    :label="
                      getDestinationLabel(item, extOfflineDestinationType)
                    "
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-col>
            </div>
            <div class="inline-form-group">
              <el-col :span="12">
                <el-select
                  v-model="extNoAnswerDestinationType"
                  placeholder="Destination Type"
                  filterable
                >
                  <template slot="prefix">Destination Type</template>
                  <div v-for="item in deTypeDsts" :key="item">
                    <el-option :label="item" :value="item"></el-option>
                  </div>
                </el-select>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="11">
                <el-select
                  v-model="editForm.extNoAnswer.id"
                  filterable
                  placeholder="Select NoAnswer Destination"
                >
                  <template slot="prefix">NoAnswer Destination</template>
                  <el-option
                    v-for="item in availableExtNoAnswerDests"
                    :key="item.id"
                    :label="
                      getDestinationLabel(item, extNoAnswerDestinationType)
                    "
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-col>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-dialog>
</template>

<script>
import { isEqual } from "lodash";
import feathersClient from "../../../../feathers/feathers-client";

export default {
  name: "EditExtensionForm",
  props: {
    clearFormFields: {
      type: Boolean,
      required: true,
    },
    editProcessing: { required: true },
    editVisible: { required: true },
    numInUse: { required: true },
    macInUse: { required: true },
    locationsProcessing: { required: true },
    locationOptions: { required: true },
    branchOptions: { required: true },
    departmentOptions: { required: true },
    numberOptions: { required: true },
    deviceList: { required: true },
    outboundCidNumbersOptions: { required: true },
    deviceModelList: { required: true },
    musicOnHoldsList: { required: true },
    editFields: { required: true },
    editExtType: { required: true },
  },
  data() {
    return {
      extHasDevice: false,
      deviceType: "",
      cidNums: [],
      forwardingDestinationOptions: [],
      forwardingDestType: "",
      deTypeDsts: [
        "CONDITION",
        "CUSTOM",
        "DISA",
        "EXT",
        "HUNTLIST",
        "IVR",
        "MEDIAFILE",
        "PLAYBACK",
        "QUEUE",
        "VOICEMAIL",
        "SMS",
        // "DISABLEUNCONDITIONALDID",
        // "ENABLEUNCONDITIONALDID",
        // "LOGINADQUEUE",
        // "LOGOUTQUEUE",
        // "MEETME",
        // "RERECORD",
        // "SETUNCONDITIONALDID",
        // "SPECIAL",
        // "TOGGLEPAUSEQUEUE",
        // "TOGGLEUNCONDITIONALDID",
      ],
      activeTabName: "General",
      rings: null,
      simultaneousRing: false,
      forwardAllCalls: false,
      email: "",
      initialExtBusyDestinationType: "",
      extBusyDestinationType: "",
      availableExtBusyDests: [],
      initialExtOfflineDestinationType: "",
      extOfflineDestinationType: "",
      availableExtOfflineDests: [],
      initialExtNoAnswerDestinationType: "",
      extNoAnswerDestinationType: "",
      availableExtNoAnswerDests: [],
      emitCheckMac: false,
      initialMac: "",
      emitCheckExtNum: false,
      initialExtNum: "",
      followMe: false,
      location: "",
      initialEmail: "",
      changeInDestTypeCount: 0,
      editForm: {
        unconditionalStatus: "",
        fmfmStatus: "",
        recording: false,
        dnd: false,
        fmfmNumber: "",
        prefix: "",
        extNumber: "",
        extName: "",
        email: "",
        sendInvite: false,
        department: "",
        branch: "",
        dialTimeout: null,
        muId: "",
        cidNum: "",
        fmfmDialMethod: "",
        callLimit: null,
        cidNums: [],
        cidNumsChanged: false,
        extHasDevice: false,
        device: {
          id: null,
          name: "",
          mac: "",
          phPmId: null,
        },
        newDevice: {
          name: "",
          mac: "",
          phPmId: null,
        },
        existingDevice: {
          id: null,
        },
        extNoAnswer: {
          existingId: null,
          id: null,
          type: "",
        },
        extBusy: {
          existingId: null,
          id: null,
          type: "",
        },
        extOffline: {
          existingId: null,
          id: null,
          type: "",
        },
        forwardingDestination: {
          id: null,
          number: null,
        },
        forwardingDestType: "",
        removeDevice: false,
        emergencyCidNum: "",
        tenantId: null,
      },
    };
  },
  computed: {
    cidNumOptions() {
      return [...this.cidNums, ...this.numberOptions];
    },
    phPmIdValue() {
      return this.editForm.newDevice.phPmId === 0
        ? ""
        : this.editForm.newDevice.phPmId;
    },

    selectedTenant() {
      return this.$store.state.selectedTenant;
    },

    extensionNumber() {
      return this.editForm.extNumber;
    },

    mac() {
      return this.editForm.device.mac;
    },

    editTypeHeader() {
      switch (this.editExtType) {
        case "desk":
          return "Desk / Mobile Phone Ext";
        case "sip":
          return "SIP Trunk";
        case "fax":
          return "Fax ATA";
      }
    },
  },
  watch: {
    forwardingDestType(type) {
      if (type !== "") {
        if (this.changeInDestTypeCount === 0) {
          this.changeInDestTypeCount++;
        } else {
          this.editForm.forwardingDestination.id = null;
        }
        this.getAvailableDestinations(type, true).then((res) => {
          this.forwardingDestinationOptions = res.data || res;
        });
      }
    },

    extBusyDestinationType(type) {
      if (type !== "") {
        this.editForm.extBusy.type = type;

        if (this.initialExtBusyDestinationType !== type) {
          this.editForm.extBusy.id = null;
        }
        this.getAvailableDestinations(type).then((res) => {
          this.availableExtBusyDests = res.data || res;
        });
      }
    },

    extOfflineDestinationType(type) {
      if (type !== "") {
        this.editForm.extOffline.type = type;

        if (this.initialExtOfflineDestinationType !== type) {
          this.editForm.extOffline.id = null;
        }
        this.getAvailableDestinations(type).then((res) => {
          this.availableExtOfflineDests = res.data || res;
        });
      }
    },

    extNoAnswerDestinationType(type) {
      if (type !== "") {
        this.editForm.extNoAnswer.type = type;

        if (this.initialExtNoAnswerDestinationType !== type) {
          this.editForm.extNoAnswer.id = null;
        }
        this.getAvailableDestinations(type).then((res) => {
          this.availableExtNoAnswerDests = res.data || res;
        });
      }
    },

    extensionNumber(value) {
      if (value !== "") {
        if (!this.emitCheckExtNum) {
          this.emitCheckExtNum = true;
          this.initialExtNum = value;
          return;
        }
        if (this.initialExtNum !== value) {
          this.$emit("checkNumber", value);
        }
      }
    },
    mac(value) {
      if (value !== "") {
        if (!this.emitCheckMac) {
          this.initialMac = value;
          this.emitCheckMac = true;
          return;
        }
        if (this.initialMac !== value) {
          this.$emit("checkMac", value);
        }
      }
    },
    clearFormFields() {
      if (this.clearFormFields) {
        this.clearFields(this.editForm);
      }
    },

    email(value) {
      if (!value) {
        this.editForm.sendInvite = false;
        this.editForm.email = "";
      } else {
        this.editForm.email = value;
      }
    },

    editFields() {
      const {
        id: extId,
        tenantId,
        muId,
        prefix,
        device,
        dialTimeout,
        email,
        number,
        name,
        department,
        branch,
        fmfmNumber,
        cidNum,
        cidNums,
        dnd,
        fmfmDialMethod,
        unconditionalStatus,
        fmfmStatus,
        emergencyCidNum,
        recording,
        de_destinations,
      } = this.editFields;
      this.editForm.tenantId = tenantId;

      // Existing Destinations
      de_destinations.forEach(({ id, typeSrc, typeIdDst, typeDst }) => {
        if (typeSrc === "EXT-BUSY") {
          this.editForm.extBusy.existingId = id;

          this.editForm.extBusy.id = typeIdDst;
          this.extBusyDestinationType = typeDst;
          this.initialExtBusyDestinationType = typeDst;
        } else if (typeSrc === "EXT-OFFLINE") {
          this.editForm.extOffline.existingId = id;

          this.editForm.extOffline.id = typeIdDst;
          this.extOfflineDestinationType = typeDst;
          this.initialExtOfflineDestinationType = typeDst;
        } else if (typeSrc === "EXT-NOANSWER") {
          this.editForm.extNoAnswer.existingId = id;

          this.editForm.extNoAnswer.id = typeIdDst;
          this.extNoAnswerDestinationType = typeDst;
          this.initialExtNoAnswerDestinationType = typeDst;
        }
      });

      // Device
      if (device) {
        this.editForm.device = device;
        this.extHasDevice = true;
      }
      // Handling Music on Hold
      if (muId === 0) {
        this.editForm.muId = this.musicOnHoldsList.find(
          (el) => el.tenantId === 0
        ).id;
      } else {
        this.editForm.muId = muId;
      }

      // Handle dialTiemout
      if (dialTimeout === 0) {
        feathersClient
          .service("tenant-settings")
          .find({
            query: {
              tenantId,
              code: "EXTDIALTIMEOUT",
            },
          })
          .then((res) => {
            if (res.length) {
              this.rings = Math.ceil(res[0].value / 5);
            }
          });
      } else {
        this.rings = Math.ceil(dialTimeout / 5);
      }

      this.editForm.prefix = prefix;
      if (email) {
        this.email = email;
        this.initialEmail = email;
        this.editForm.email = email;
      }
      this.editForm.extName = name;
      this.editForm.extNumber = number;
      this.editForm.department = department;
      this.editForm.branch = branch;
      this.editForm.fmfmNumber = fmfmNumber;
      this.editForm.cidNum = cidNum;
      this.editForm.cidNums = cidNums.map((t) => {
        return t.id;
      });
      this.cidNums = cidNums.map((t) => {
        return {
          key: t.id,
          label: t.number,
          disabled: false,
        };
      });

      this.editForm.dnd = dnd === "" ? false : true;
      this.simultaneousRing = fmfmDialMethod === "Simultaneous";
      this.forwardAllCalls = unconditionalStatus === "on";

      if (this.forwardAllCalls) {
        feathersClient
          .service("destinations")
          .find({
            query: {
              tenantId,
              typeSrc: "EXT-UNCONDITIONAL",
              typeIdSrc: extId,
            },
          })
          .then((res) => {
            if (res.length) {
              const { typeDst, typeIdDst } = res[0];
              this.editForm.forwardingDestination.id = typeIdDst;
              this.forwardingDestType = typeDst;
            }
          });
      }

      this.followMe = fmfmStatus !== "";
      this.location = emergencyCidNum;
      this.editForm.prefix = prefix;
      this.editForm.recording = recording === "yes";
    },

    rings(value) {
      this.editForm.dialTimeout = value * 5;
    },
  },
  methods: {
    onPhoneModelSelection(value) {
      this.editForm.newDevice.phPmId = value;
    },

    getRandomKey() {
      const randomString = () => Math.random().toString(36).slice(2);
      return `${randomString()}-${randomString()}$${randomString()}`;
    },

    getDestinationLabel(item, type) {
      const { prefix, field } = this.destinationNameFields(type);
      return `${prefix}-${item[field]}`;
    },

    destinationNameFields(type) {
      switch (type) {
        case "CONDITION":
          return {
            prefix: "Condition",
            field: "name",
          };
        case "CUSTOM":
          return {
            prefix: "Custom",
            field: "name",
          };
        case "DISA":
          return {
            prefix: "Disa",
            field: "name",
          };
        case "DISABLEUNCONDITIONALDID":
          return {
            prefix: "DID",
            field: "diCommentName",
          };
        case "ENABLEUNCONDITIONALDID":
          return {
            prefix: "DID",
            field: "diCommentName",
          };
        case "EXT":
          return {
            prefix: "Extension",
            field: "name",
          };
        case "HUNTLIST":
          return {
            prefix: "Huntlist",
            field: "name",
          };
        case "IVR":
          return {
            prefix: "IVR",
            field: "name",
          };
        case "LOGINADQUEUE":
          return {
            prefix: "",
            field: "",
          };
        case "LOGOUTQUEUE":
          return {
            prefix: "",
            field: "",
          };
        case "MEDIAFILE":
          return {
            prefix: "Media File",
            field: "name",
          };
        case "MEETME":
          return {
            prefix: "",
            name: "",
          };
        case "PLAYBACK":
          return {
            prefix: "Playback",
            field: "name",
          };
        case "QUEUE":
          return {
            prefix: "Queue",
            field: "name",
          };
        case "RERECORD":
          return {
            prefix: "",
            name: "",
          };
        case "SETUNCONDITIONALDID":
          return {
            prefix: "DID",
            field: "diCommentName",
          };
        case "SMS":
          return {
            prefix: "SMS",
            field: "diCommentName",
          };
        case "SPECIAL":
          return {
            prefix: "SPECIAL",
            field: "code",
          };
        case "TOGGLEPAUSEQUEUE":
          return {
            prefix: "",
            field: "",
          };
        case "TOGGLEUNCONDITIONALDID":
          return {
            prefix: "",
            field: "",
          };
        case "VOICEMAIL":
          return {
            prefix: "VOICEMAIL BOX",
            field: "mailbox",
          };
        default:
          return false;
      }
    },

    getServiceBasedOnDestinationType(typeDst) {
      if (typeDst === "CONDITION") {
        return "conditions";
      } else if (typeDst === "CUSTOM") {
        return "customs";
      } else if (typeDst === "DISA") {
        return "disas";
      } else if (
        typeDst === "DISABLEUNCONDITIONALDID" ||
        typeDst === "ENABLEUNCONDITIONALDID" ||
        typeDst === "SETUNCONDITIONALDID" ||
        typeDst === "SMS" ||
        typeDst === "TOGGLEUNCONDITIONALDID"
      ) {
        return "dids";
      } else if (typeDst === "EXT") {
        return "extensions";
      } else if (typeDst === "HUNTLIST") {
        return "huntlists";
      } else if (typeDst === "IVR") {
        return "ivrs";
      } else if (typeDst === "LOGINADQUEUE" || typeDst === "LOGOUTQUEUE") {
        return "queuemembers";
      } else if (
        typeDst === "MEDIAFILE" ||
        typeDst === "PLAYBACK" ||
        typeDst === "RERECORD"
      ) {
        return "mediafiles";
      } else if (typeDst === "MEETME") {
        return "meetmes";
      } else if (typeDst === "QUEUE") {
        return "queues";
      } else if (typeDst === "SPECIAL") {
        return "specials";
      } else if (typeDst === "TOGGLEPAUSEQUEUE") {
        return "queuemembers";
      } else if (typeDst === "VOICEMAIL") {
        return "voicemails";
      }
    },

    getAvailableDestinations(destinationType, isForwardingCalls = false) {
      let query = { tenantId: this.selectedTenant.id };
      if (
        destinationType === "MEDIAFILE" ||
        destinationType === "PLAYBACK" ||
        destinationType === "RERECORD"
      ) {
        query = { me_te_id: this.selectedTenant.id };
      }

      if (destinationType === "CUSTOM" && isForwardingCalls) {
        query = { tenantId: this.selectedTenant.id, cu_ct_id: 1 };
      }

      if (
        destinationType === "DISABLEUNCONDITIONALDID" ||
        destinationType === "ENABLEUNCONDITIONALDID" ||
        destinationType === "SETUNCONDITIONALDID" ||
        destinationType === "SMS" ||
        destinationType === "TOGGLEUNCONDITIONALDID"
      ) {
        query = { tenantId: this.selectedTenant.id, allowEmergency: "" };
      }

      return feathersClient
        .service(this.getServiceBasedOnDestinationType(destinationType))
        .find({ query })
        .then((res) => res);
    },

    cancelOperation() {
      this.$emit("cancelOperation", this.editForm);
    },

    editOperation() {
      // ⭐️  Notify User if email has Changed ⭐️ //
      if (this.initialEmail !== "") {
        if (this.editForm.email !== this.initialEmail)
          this.$notify({
            title: "Warnning! Email has been changed.",
            message:
              "If this happens it would effectively disconnect the existing email's omnia user from the extension.",
            type: "warning",
          });
      }

      if (this.editForm.callLimit === null) {
        this.editForm.callLimit = 5;
      }

      this.editForm.fmfmDialMethod = this.simultaneousRing
        ? "Simultaneous"
        : "Normal";
      this.editForm.unconditionalStatus = this.forwardAllCalls ? "on" : "";

      this.editForm.fmfmStatus = this.followMe ? "on" : "";
      this.editForm.forwardingDestType = this.forwardingDestType;

      if (
        this.forwardingDestinationOptions.findIndex(
          (dst) => dst.id === this.editForm.forwardingDestination.id
        ) === -1
      ) {
        this.editForm.forwardingDestination.number = this.editForm.forwardingDestination.id;
        this.editForm.forwardingDestination.id = null;
      } else {
        this.editForm.forwardingDestination.number = null;
      }

      this.editForm.emergencyCidNum = Number(this.location);

      this.editForm.deviceType = this.deviceType;
      this.editForm.extHasDevice = this.extHasDevice;

      let editBody = {
        ...this.editForm,
        extType: this.editExtType,
      };

      console.log(editBody);

      this.$emit("editOperation", editBody);
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

      this.changeInDestTypeCount = 0;
      this.cidNums = [];
      this.initialEmail = "";
      this.email = "";
      this.activeTabName = "General";
      this.forwardingDestType = "";
      this.forwardingDestinationOptions = [];
      this.rings = 0;
      this.simultaneousRing = false;
      this.forwardAllCalls = false;
      this.initialExtBusyDestinationType = "";
      this.extBusyDestinationType = "";
      this.availableExtBusyDests = [];
      this.initialExtOfflineDestinationType = "";
      this.extOfflineDestinationType = "";
      this.availableExtOfflineDests = [];
      this.initialExtNoAnswerDestinationType = "";
      this.extNoAnswerDestinationType = "";
      this.availableExtNoAnswerDests = [];
      this.emitCheckMac = false;
      this.initialMac = "";
      this.emitCheckExtNum = false;
      this.initialExtNum = "";
      this.forwardAllCalls = false;

      // this.editForm.fmfmDialMethod = "Normal";
      this.editForm.callLimit = null;
      this.editForm.dialTimeout = null;

      this.editForm.forwardingDestination.id = null;
      this.editForm.forwardingDestination.number = null;
      this.extHasDevice = false;

      this.editForm.extNoAnswer = {
        existingId: null,
        id: null,
        type: "",
      };
      this.editForm.extBusy = {
        existingId: null,
        id: null,
        type: "",
      };
      this.editForm.extOffline = {
        existingId: null,
        id: null,
        type: "",
      };
      this.deviceType = "";
      this.editForm.newDevice = {
        name: "",
        mac: "",
        phPmId: null,
      };
      this.editForm.existingDevice = {
        id: null,
      };
      this.editForm.device = {
        id: null,
        name: "",
        mac: "",
        phPmId: null,
      };
    },

    remoteMethodForOutboundCid(query) {
      this.$emit("remoteMethodForOutboundCid", query);
    },

    remoteMethodForAvailableNums(query) {
      this.$emit("remoteMethodForAvailableNums", query);
    },

    onChangeCidNums() {
      let tempArray = this.editFields.cidNums.map((t) => {
        return t.id;
      });

      if (!isEqual(tempArray, this.editForm.cidNums)) {
        this.editForm.cidNumsChanged = true;
      } else {
        this.editForm.cidNumsChanged = false;
      }
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

.inline-form-group .el-col .el-select {
  margin: 5px auto;
}
</style>
