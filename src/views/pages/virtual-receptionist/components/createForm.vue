<template>
  <el-dialog
    id="create-modal"
    class="form-modal"
    :visible.sync="createVisible"
    :fullscreen="true"
    :show-close="false"
    :modal="false"
  >
    <div id="create-modal-header" class="modal-header">
      <div class="modal-header-layout flex grid-6 align-center">
        <h1 class="modal-title col-2">Create Virtual Receptionist</h1>
        <div class="modal-actions col-2">
          <el-button type="primary" @click="createOperation">Create</el-button>
          <el-button type="default" @click="cancelOperation"> Cancel</el-button>
        </div>
      </div>
    </div>

    <el-form>
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="General" name="general"
          ><el-input v-model="createForm.name" placeholder="Enter IVR Name">
            <template slot="prefix">IVR Name</template>
          </el-input>

          <!-- AVAILABLE NUMBERS -->
          <div>
            <div>
              <h2 class="form-section-header">Assign Phone Numbers</h2>
              <el-select
                v-model="createForm.phoneNums"
                :value="createForm.phoneNums"
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
            <div class="inline-form-group" v-if="!numberOptions.length">
              <h3>No available numbers found</h3>
              <router-link to="/phone-numbers?context=create">
                <el-button round>
                  <div class="dashboard-button-group">
                    <v-svg class="voxo-pink" sprite="phone-number"></v-svg>
                    <span>New Number</span>
                  </div>
                </el-button>
              </router-link>
            </div>
          </div>

          <!-- TIMEOUT DESTINATION -->
          <div>
            <h2 class="form-section-header">Timeout Destination</h2>

            <div class="inline-form-group">
              <el-col :span="12">
                <el-select
                  v-model="timeoutDstType"
                  placeholder="Destination Type"
                  filterable
                >
                  <template slot="prefix">Destination Type</template>
                  <div v-for="item in dstTypes" :key="item">
                    <el-option :label="item" :value="item"></el-option>
                  </div>
                </el-select>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="11">
                <el-select
                  v-model="createForm.timeoutDst.id"
                  filterable
                  placeholder="Select Timeout Destination"
                >
                  <template slot="prefix">Timeout Destination</template>
                  <el-option
                    v-for="item in timeoutDstOptions"
                    :key="item.id"
                    :label="getDestinationLabel(item, timeoutDstType)"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-col>
            </div>
          </div>

          <div v-if="createForm.timeoutDst.id">
            <el-select
              v-model="createForm.timeout"
              placeholder="Select timeout"
            >
              <el-option
                v-for="i in 16"
                :key="i"
                :label="i + 4"
                :value="i + 4"
              ></el-option>
              <template slot="prefix">Select timeout</template>
            </el-select>
          </div>

          <!-- WRONGKEYPRESS DESTINATION -->
          <div>
            <h2 class="form-section-header">Wrong Key Press Destination</h2>

            <div class="inline-form-group">
              <el-col :span="12">
                <el-select
                  v-model="wrongKeyPressDstType"
                  placeholder="Destination Type"
                  filterable
                >
                  <template slot="prefix">Destination Type</template>
                  <div v-for="item in dstTypes" :key="item">
                    <el-option :label="item" :value="item"></el-option>
                  </div>
                </el-select>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="11">
                <el-select
                  v-model="createForm.wrongKeyPressDst.id"
                  filterable
                  placeholder="Select WrongKeyPress Destination"
                >
                  <template slot="prefix">WrongKeyPress Destination</template>
                  <el-option
                    v-for="item in wrongKeyPressDstOptions"
                    :key="item.id"
                    :label="getDestinationLabel(item, wrongKeyPressDstType)"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-col>
            </div>
          </div>

          <div class="inline-form-group">
            <el-checkbox v-model="createForm.loopOnTimeout" :label="true">
              <span>Loop On TimeOut</span>
            </el-checkbox>
          </div>
          <div class="inline-form-group">
            <el-checkbox v-model="createForm.loopOnWrongKeyPress" :label="true">
              <span>Loop On Wrong Key Press</span>
            </el-checkbox>
          </div>
          <div class="inline-form-group">
            <el-checkbox v-model="createForm.allowDisa" :label="true">
              <span>Enable Extension Dialing</span>
            </el-checkbox>
          </div>

          <div
            v-if="createForm.loopOnTimeout || createForm.loopOnWrongKeyPress"
          >
            <h2 class="form-section-header">Max Loops</h2>
            <el-select v-model="createForm.maxLoops" placeholder="Max Loops">
              <template slot="prefix">Max Loops</template>
              <el-option v-for="i in 5" :key="i" :value="i" :label="i">
              </el-option>
            </el-select>
          </div>
        </el-tab-pane>

        <!-- KEYPRESS OPTIONS -->
        <el-tab-pane label="Key Press Options" name="keypress">
          <h2 class="form-section-header">Virtual Receptionist Options</h2>
          <div class="inline-form-group" v-for="key in keyOptions" :key="key">
            <el-col :span="1"
              ><el-tag size="medium">{{ getKeyLabel(key) }}</el-tag></el-col
            >
            <el-col :span="1"></el-col>
            <el-col :span="11">
              <el-select
                @change="onKeyDstTypeSelection(key, $event)"
                :value="getKeyDstType(key)"
                :placeholder="`Select Key ${getKeyLabel(key)} Destination Type`"
              >
                <div v-for="item in dstTypes" :key="item">
                  <el-option :label="item" :value="item"></el-option>
                </div>
              </el-select>
            </el-col>
            <el-col :span="1"></el-col>

            <el-col :span="11">
              <el-select
                @change="onKeyDstSelection(key, $event)"
                :value="getKeyDst(key)"
                filterable
                :placeholder="`Select Key ${getKeyLabel(key)} Destination`"
              >
                <el-option
                  v-for="(item, index) in getKeyDstOptions(key)"
                  :key="index"
                  :value="item.id"
                  :label="getDestinationLabel(item, getKeyDstType(key))"
                >
                </el-option>
              </el-select>
            </el-col>
          </div>

          <!-- GREETING MESSAGE -->
          <h2 class="form-section-header">Greeting Message</h2>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-dialog>
</template>

<script>
import feathersClient from "../../../../feathers/feathers-client";

export default {
  name: "CreateIvrForm",
  props: {
    createVisible: { required: true },
    numberOptions: { required: true },
    existingGreetings: { required: true },
    clearFormFields: { required: true },
  },

  components: {},

  data() {
    return {
      dstTypes: [
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
      activeTabName: "general",
      keyOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "SHARP", "STAR"],
      key0DstType: "",
      key0DstOptions: [],
      key1DstType: "",
      key1DstOptions: [],
      key2DstType: "",
      key2DstOptions: [],
      key3DstType: "",
      key3DstOptions: [],
      key4DstType: "",
      key4DstOptions: [],
      key5DstType: "",
      key5DstOptions: [],
      key6DstType: "",
      key6DstOptions: [],
      key7DstType: "",
      key7DstOptions: [],
      key8DstType: "",
      key8DstOptions: [],
      key9DstType: "",
      key9DstOptions: [],
      keySHARPDstType: "",
      keySHARPDstOptions: [],
      keySTARDstType: "",
      keySTARDstOptions: [],
      timeoutDstType: "",
      timeoutDstOptions: [],
      wrongKeyPressDstType: "",
      wrongKeyPressDstOptions: [],
      greetingType: "",
      existingGreetingMsgName: "",
      createForm: {
        name: "",
        phoneNums: [],
        timeoutDst: {
          id: null,
          type: "",
        },
        timeout: null,
        wrongKeyPressDst: {
          id: null,
          type: "",
        },
        loopOnTimeout: false,
        loopOnWrongKeyPress: false,
        maxLoops: null,
        allowDisa: false,
        key0Dst: {
          id: null,
          type: "",
        },
        key1Dst: {
          id: null,
          type: "",
        },
        key2Dst: {
          id: null,
          type: "",
        },
        key3Dst: {
          id: null,
          type: "",
        },
        key4Dst: {
          id: null,
          type: "",
        },
        key5Dst: {
          id: null,
          type: "",
        },
        key6Dst: {
          id: null,
          type: "",
        },
        key7Dst: {
          id: null,
          type: "",
        },
        key8Dst: {
          id: null,
          type: "",
        },
        key9Dst: {
          id: null,
          type: "",
        },
        keySHARPDst: {
          id: null,
          type: "",
        },
        keySTARDst: {
          id: null,
          type: "",
        },
        meId: null,
      },
    };
  },
  computed: {
    selectedTenant() {
      return this.$store.state.selectedTenant;
    },
  },
  watch: {
    clearFormFields(value) {
      if (value) {
        this.clearFields();
      }
    },

    timeoutDstType(type) {
      if (type !== "") {
        this.createForm.timeoutDst.type = type;
        this.createForm.timeoutDst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.timeoutDstOptions = res.data || res;
        });
      }
    },

    wrongKeyPressDstType(type) {
      if (type !== "") {
        this.createForm.wrongKeyPressDst.type = type;
        this.createForm.wrongKeyPressDst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.wrongKeyPressDstOptions = res.data || res;
        });
      }
    },

    key0DstType(type) {
      if (type !== "") {
        this.createForm.key0Dst.type = type;
        this.createForm.key0Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key0DstOptions = res.data || res;
        });
      }
    },

    key1DstType(type) {
      if (type !== "") {
        this.createForm.key1Dst.type = type;
        this.createForm.key1Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key1DstOptions = res.data || res;
        });
      }
    },

    key2DstType(type) {
      if (type !== "") {
        this.createForm.key2Dst.type = type;
        this.createForm.key2Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key2DstOptions = res.data || res;
        });
      }
    },

    key3DstType(type) {
      if (type !== "") {
        this.createForm.key3Dst.type = type;
        this.createForm.key3Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key3DstOptions = res.data || res;
        });
      }
    },

    key4DstType(type) {
      if (type !== "") {
        this.createForm.key4Dst.type = type;
        this.createForm.key4Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key4DstOptions = res.data || res;
        });
      }
    },

    key5DstType(type) {
      if (type !== "") {
        this.createForm.key5Dst.type = type;
        this.createForm.key5Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key5DstOptions = res.data || res;
        });
      }
    },

    key6DstType(type) {
      if (type !== "") {
        this.createForm.key6Dst.type = type;
        this.createForm.key6Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key6DstOptions = res.data || res;
        });
      }
    },

    key7DstType(type) {
      if (type !== "") {
        this.createForm.key7Dst.type = type;
        this.createForm.key7Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key7DstOptions = res.data || res;
        });
      }
    },

    key8DstType(type) {
      if (type !== "") {
        this.createForm.key8Dst.type = type;
        this.createForm.key8Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key8DstOptions = res.data || res;
        });
      }
    },

    key9DstType(type) {
      if (type !== "") {
        this.createForm.key9Dst.type = type;
        this.createForm.key9Dst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.key9DstOptions = res.data || res;
        });
      }
    },

    keySHARPDstType(type) {
      if (type !== "") {
        this.createForm.keySHARPDst.type = type;
        this.createForm.keySHARPDst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.keySHARPDstOptions = res.data || res;
        });
      }
    },

    keySTARDstType(type) {
      if (type !== "") {
        this.createForm.keySTARDst.type = type;
        this.createForm.keySTARDst.id = null;

        this.getAvailableDestinations(type).then((res) => {
          this.keySTARDstOptions = res.data || res;
        });
      }
    },
  },
  methods: {
    clearFields() {
      this.activeTabName = "general";
      Object.keys(this.createForm).forEach((key) => {
        if (typeof this.createForm[key] === "string") {
          this.createForm[key] = "";
        }
        if (typeof this.createForm[key] === "boolean") {
          this.createForm[key] = false;
        }
        if (typeof this.createForm[key] === "number") {
          this.createForm[key] = null;
        }
        if (Array.isArray(this.createForm[key])) {
          this.createForm[key] = [];
        }
      });
      this.keyOptions.forEach((key) => {
        const prefix = `key${key}Dst`;
        this[`${prefix}Type`] = "";
        this[`${prefix}DstOptions`] = [];
        this.wrongKeyPressDstType = "";
        this.timeoutDstType = "";
        this.timeoutDstOptions = [];
        this.wrongKeyPressDstOptions = [];
        this.createForm[prefix].id = null;
        this.createForm[prefix].type = "";
        this.createForm.timeoutDst = {
          id: null,
          type: "",
        };
        this.createForm.wrongKeyPressDst = {
          id: null,
          type: "",
        };
      });
    },

    createOperation() {
      this.createForm.allowDisa = this.createForm.allowDisa ? "on" : "";
      this.createForm.loopOnTimeout = this.createForm.loopOnTimeout ? "on" : "";
      this.createForm.loopOnWrongKeyPress = this.createForm.loopOnWrongKeyPress
        ? "on"
        : "";
      this.createForm.maxLoops = this.createForm.maxLoops || 2;
      this.createForm.timeout = this.createForm.timeout || 10;
      this.createForm.meId = this.createForm.meId || 0;
      this.$emit("createOperation", this.createForm);
    },

    cancelOperation() {
      this.$emit("cancelOperation", "create");
    },

    getKeyLabel(key) {
      return typeof key === "string" ? (key === "SHARP" ? "#" : "*") : key;
    },

    onKeyDstSelection(key, e) {
      this.createForm[`key${key}Dst`].id = e;
    },

    getKeyDst(key) {
      return this.createForm[`key${key}Dst`].id;
    },

    onKeyDstTypeSelection(key, e) {
      this[`key${key}DstType`] = e;
    },

    getKeyDstType(key) {
      return this[`key${key}DstType`];
    },

    getKeyDstOptions(key) {
      return this[`key${key}DstOptions`];
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
        .then((res) => {
          return res;
        });
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

.el-tab-pane .inline-form-group .el-col .el-select {
  margin: 5px auto;
}
</style>
