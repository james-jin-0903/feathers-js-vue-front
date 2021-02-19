<template>
  <el-dialog
    id="edit-modal"
    class="form-modal"
    :visible.sync="editVisible"
    :fullscreen="true"
    :show-close="false"
    :modal="false"
  >
    <div id="edit-modal-header" class="modal-header">
      <div class="modal-header-layout flex grid-6 align-center">
        <h1 class="modal-title col-2">edit Virtual Receptionist</h1>
        <div class="modal-actions col-2">
          <el-button type="primary" @click="editOperation">edit</el-button>
          <el-button type="default" @click="cancelOperation"> Cancel</el-button>
        </div>
      </div>
    </div>

    <el-form>
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="General" name="general"
          ><el-input v-model="editForm.name" placeholder="Enter IVR Name">
            <template slot="prefix">IVR Name</template>
          </el-input>

          <!-- AVAILABLE NUMBERS -->
          <div>
            <div>
              <h2 class="form-section-header">Assign Phone Numbers</h2>
              <el-select
                v-model="editForm.phoneNums"
                remote
                :remote-method="remoteMethodForAvailableNums"
                multiple
                filterable
                default-first-option
                placeholder="Choose Numbers to Assign"
                @change="onPhoneNumsChanged"
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
            <div class="inline-form-group">
              <h3 v-if="!numberOptions.length">No available numbers found</h3>
            </div>
            <div class="inline-form-group">
              <router-link to="/phone-numbers?context=edit">
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
                  v-model="editForm.timeoutDst.id"
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

          <div v-if="editForm.timeoutDst.id">
            <el-select v-model="editForm.timeout" placeholder="Select timeout">
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
                  v-model="editForm.wrongKeyPressDst.id"
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
            <el-checkbox v-model="editForm.loopOnTimeout" :label="true">
              <span>Loop On TimeOut</span>
            </el-checkbox>
          </div>
          <div class="inline-form-group">
            <el-checkbox v-model="editForm.loopOnWrongKeyPress" :label="true">
              <span>Loop On Wrong Key Press</span>
            </el-checkbox>
          </div>
          <div class="inline-form-group">
            <el-checkbox v-model="editForm.allowDisa" :label="true">
              <span>Enable Extension Dialing</span>
            </el-checkbox>
          </div>

          <div v-if="editForm.loopOnTimeout || editForm.loopOnWrongKeyPress">
            <h2 class="form-section-header">Max Loops</h2>
            <el-select v-model="editForm.maxLoops" placeholder="Max Loops">
              <template slot="prefix">Max Loops</template>
              <el-option v-for="i in 5" :key="i" :value="i" :label="i">
              </el-option>
            </el-select>
          </div>
          <!-- GREETING MESSAGE -->
          <h2 class="form-section-header">Greeting Message</h2></el-tab-pane
        >
        <!-- KEYPRESS OPTIONS -->
        <el-tab-pane label="Key Press Options" name="keypress">
          <h2 class="form-section-header">Virtual Receptionist Options</h2>
          <div class="inline-form-group" v-for="key in keyOptions" :key="key">
            <el-col :span="1"
              ><el-tag size="medium">{{ getKeyLabel(key) }}</el-tag></el-col
            >
            <el-col :span="1"></el-col>
            <el-col :span="10">
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
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-dialog>
</template>

<script>
import feathersClient from "../../../../feathers/feathers-client";
import { isEqual } from "lodash";

export default {
  name: "editIvrForm",
  props: {
    editVisible: { required: true },
    numberOptions: { required: true },
    existingGreetings: { required: true },
    clearFormFields: { required: true },
    selectedIvr: { required: true },
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
      keyOptions: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "SHARP", "STAR"],
      firstKey0DstTypeChange: false,
      firstKey1DstTypeChange: false,
      firstKey2DstTypeChange: false,
      firstKey3DstTypeChange: false,
      firstKey4DstTypeChange: false,
      firstKey5DstTypeChange: false,
      firstKey6DstTypeChange: false,
      firstKey7DstTypeChange: false,
      firstKey8DstTypeChange: false,
      firstKey9DstTypeChange: false,
      firstKeySHARPDstTypeChange: false,
      firstKeySTARDstTypeChange: false,
      firstTimeoutDstTypeChange: false,
      firstWrongKeyPressDstTypeChange: false,
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
      activeTabName: "general",
      editForm: {
        name: "",
        phoneNums: [],
        phoneNumsChanged: false,
        timeoutDst: {
          existingId: null,
          id: null,
          type: "",
        },
        timeout: null,
        wrongKeyPressDst: {
          existingId: null,
          id: null,
          type: "",
        },
        loopOnTimeout: false,
        loopOnWrongKeyPress: false,
        maxLoops: null,
        allowDisa: false,
        key0Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key1Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key2Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key3Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key4Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key5Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key6Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key7Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key8Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        key9Dst: {
          existingId: null,
          id: null,
          type: "",
        },
        keySHARPDst: {
          existingId: null,
          id: null,
          type: "",
        },
        keySTARDst: {
          existingId: null,
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
    selectedIvr(value) {
      console.log(value);

      const {
        name,
        phoneNums,
        digitTimeout,
        allowDisa,
        loopOnTimeout,
        loopOnWrongKeyPress,
        maxLoops,
        timeout,
        de_destinations,
      } = value;

      if (de_destinations && de_destinations.length) {
        de_destinations.forEach(({ id, typeSrc, typeDst, typeIdDst }) => {
          if (typeSrc === "IVR_0") {
            this.firstKey0DstTypeChange = true;
            this.key0DstType = typeDst;
            this.editForm.key0Dst.id = typeIdDst;
            this.editForm.key0Dst.existingId = id;
          } else if (typeSrc === "IVR_1") {
            this.firstKey1DstTypeChange = true;
            this.key1DstType = typeDst;
            this.editForm.key1Dst.id = typeIdDst;
            this.editForm.key1Dst.existingId = id;
          } else if (typeSrc === "IVR_2") {
            this.firstKey2DstTypeChange = true;
            this.key2DstType = typeDst;
            this.editForm.key2Dst.id = typeIdDst;
            this.editForm.key2Dst.existingId = id;
          } else if (typeSrc === "IVR_3") {
            this.firstKey3DstTypeChange = true;
            this.key3DstType = typeDst;
            this.editForm.key3Dst.id = typeIdDst;
            this.editForm.key3Dst.existingId = id;
          } else if (typeSrc === "IVR_4") {
            this.firstKey4DstTypeChange = true;
            this.key4DstType = typeDst;
            this.editForm.key4Dst.id = typeIdDst;
            this.editForm.key4Dst.existingId = id;
          } else if (typeSrc === "IVR_5") {
            this.firstKey5DstTypeChange = true;
            this.key5DstType = typeDst;
            this.editForm.key5Dst.id = typeIdDst;
            this.editForm.key5Dst.existingId = id;
          } else if (typeSrc === "IVR_6") {
            this.firstKey6DstTypeChange = true;
            this.key6DstType = typeDst;
            this.editForm.key6Dst.id = typeIdDst;
            this.editForm.key6Dst.existingId = id;
          } else if (typeSrc === "IVR_7") {
            this.firstKey7DstTypeChange = true;
            this.key7DstType = typeDst;
            this.editForm.key7Dst.id = typeIdDst;
            this.editForm.key7Dst.existingId = id;
          } else if (typeSrc === "IVR_8") {
            this.firstKey8DstTypeChange = true;
            this.key8DstType = typeDst;
            this.editForm.key8Dst.id = typeIdDst;
            this.editForm.key8Dst.existingId = id;
          } else if (typeSrc === "IVR_9") {
            this.firstKey9DstTypeChange = true;
            this.key9DstType = typeDst;
            this.editForm.key9Dst.id = typeIdDst;
            this.editForm.key9Dst.existingId = id;
          } else if (typeSrc === "IVR_SHARP") {
            this.firstKeySHARPDstTypeChange = true;
            this.keySHARPDstType = typeDst;
            this.editForm.keySHARPDst.id = typeIdDst;
            this.editForm.keySHARPDst.existingId = id;
          } else if (typeSrc === "IVR_STAR") {
            this.firstKeySTARDstTypeChange = true;
            this.keySTARDstType = typeDst;
            this.editForm.keySTARDst.id = typeIdDst;
            this.editForm.keySTARDst.existingId = id;
          } else if (typeSrc === "IVR_WRONG") {
            this.firstWrongKeyPressDstTypeChange = true;
            this.wrongKeyPressDstType = typeDst;
            this.editForm.wrongKeyPressDst.id = typeIdDst;
            this.editForm.wrongKeyPressDst.existingId = id;
          } else if (typeSrc === "IVR_TIMEOUT") {
            this.firstTimeoutDstTypeChange = true;
            this.timeoutDstType = typeDst;
            this.editForm.timeoutDst.id = typeIdDst;
            this.editForm.timeoutDst.existingId = id;
          }
        });
      }

      this.editForm.name = name;
      this.editForm.timeout = timeout;
      this.editForm.maxLoops = maxLoops;
      this.editForm.digitTimeout = digitTimeout;
      this.editForm.allowDisa = allowDisa === "on";
      this.editForm.loopOnTimeout = loopOnTimeout === "on";
      this.editForm.loopOnWrongKeyPress = loopOnWrongKeyPress === "on";

      if (phoneNums || phoneNums.length) {
        this.editForm.phoneNums = phoneNums.map((num) => num.id);
      }
    },

    clearFormFields(value) {
      if (value) {
        this.clearFields();
      }
    },

    timeoutDstType(type) {
      if (type !== "") {
        this.editForm.timeoutDst.type = type;
        if (this.firstTimeoutDstTypeChange) {
          this.firstTimeoutDstTypeChange = false;
        } else {
          this.editForm.timeoutDst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.timeoutDstOptions = res.data || res;
        });
      }
    },

    wrongKeyPressDstType(type) {
      if (type !== "") {
        this.editForm.wrongKeyPressDst.type = type;
        if (this.firstWrongKeyPressDstTypeChange) {
          this.firstWrongKeyPressDstTypeChange = false;
        } else {
          this.editForm.wrongKeyPressDst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.wrongKeyPressDstOptions = res.data || res;
        });
      }
    },

    key0DstType(type) {
      if (type !== "") {
        this.editForm.key0Dst.type = type;
        if (this.firstKey0DstTypeChange) {
          this.firstKey0DstTypeChange = false;
        } else {
          this.editForm.key0Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key0DstOptions = res.data || res;
        });
      }
    },

    key1DstType(type) {
      if (type !== "") {
        this.editForm.key1Dst.type = type;
        if (this.firstKey1DstTypeChange) {
          this.firstKey1DstTypeChange = false;
        } else {
          this.editForm.key1Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key1DstOptions = res.data || res;
        });
      }
    },

    key2DstType(type) {
      if (type !== "") {
        this.editForm.key2Dst.type = type;
        if (this.firstKey2DstTypeChange) {
          this.firstKey2DstTypeChange = false;
        } else {
          this.editForm.key2Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key2DstOptions = res.data || res;
        });
      }
    },

    key3DstType(type) {
      if (type !== "") {
        this.editForm.key3Dst.type = type;
        if (this.firstKey3DstTypeChange) {
          this.firstKey3DstTypeChange = false;
        } else {
          this.editForm.key3Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key3DstOptions = res.data || res;
        });
      }
    },

    key4DstType(type) {
      if (type !== "") {
        this.editForm.key4Dst.type = type;
        if (this.firstKey4DstTypeChange) {
          this.firstKey4DstTypeChange = false;
        } else {
          this.editForm.key4Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key4DstOptions = res.data || res;
        });
      }
    },

    key5DstType(type) {
      if (type !== "") {
        this.editForm.key5Dst.type = type;
        if (this.firstKey5DstTypeChange) {
          this.firstKey5DstTypeChange = false;
        } else {
          this.editForm.key5Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key5DstOptions = res.data || res;
        });
      }
    },

    key6DstType(type) {
      if (type !== "") {
        this.editForm.key6Dst.type = type;
        if (this.firstKey6DstTypeChange) {
          this.firstKey6DstTypeChange = false;
        } else {
          this.editForm.key6Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key6DstOptions = res.data || res;
        });
      }
    },

    key7DstType(type) {
      if (type !== "") {
        this.editForm.key7Dst.type = type;
        if (this.firstKey7DstTypeChange) {
          this.firstKey7DstTypeChange = false;
        } else {
          this.editForm.key7Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key7DstOptions = res.data || res;
        });
      }
    },

    key8DstType(type) {
      if (type !== "") {
        this.editForm.key8Dst.type = type;
        if (this.firstKey8DstTypeChange) {
          this.firstKey8DstTypeChange = false;
        } else {
          this.editForm.key8Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key8DstOptions = res.data || res;
        });
      }
    },

    key9DstType(type) {
      if (type !== "") {
        this.editForm.key9Dst.type = type;
        if (this.firstKey9DstTypeChange) {
          this.firstKey9DstTypeChange = false;
        } else {
          this.editForm.key9Dst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.key9DstOptions = res.data || res;
        });
      }
    },

    keySHARPDstType(type) {
      if (type !== "") {
        this.editForm.keySHARPDst.type = type;
        if (this.firstKeySHARPDstTypeChange) {
          this.firstKeySHARPDstTypeChange = false;
        } else {
          this.editForm.keySHARPDst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.keySHARPDstOptions = res.data || res;
        });
      }
    },

    keySTARDstType(type) {
      if (type !== "") {
        this.editForm.keySTARDst.type = type;
        if (this.firstKeySTARDstTypeChange) {
          this.firstKeySTARDstTypeChange = false;
        } else {
          this.editForm.keySTARDst.id = null;
        }

        this.getAvailableDestinations(type).then((res) => {
          this.keySTARDstOptions = res.data || res;
        });
      }
    },
  },
  methods: {
    onPhoneNumsChanged() {
      let tempArray = this.selectedIvr.phoneNums.map((t) => {
        return t.id;
      });

      if (!isEqual(tempArray, this.editForm.phoneNums)) {
        this.editForm.phoneNumsChanged = true;
      } else {
        this.editForm.phoneNumsChanged = false;
      }
    },

    clearFields() {
      Object.keys(this.editForm).forEach((key) => {
        if (typeof this.editForm[key] === "string") {
          this.editForm[key] = "";
        }
        if (typeof this.editForm[key] === "boolean") {
          this.editForm[key] = false;
        }
        if (typeof this.editForm[key] === "number") {
          this.editForm[key] = null;
        }
        if (Array.isArray(this.editForm[key])) {
          this.editForm[key] = [];
        }
      });
      this.activeTabName = "general";
      this.keyOptions.forEach((key) => {
        const prefix = `key${key}Dst`;
        this[`${prefix}Type`] = "";
        this[`${prefix}DstOptions`] = [];
        this.wrongKeyPressDstType = "";
        this.timeoutDstType = "";
        this.timeoutDstOptions = [];
        this.wrongKeyPressDstOptions = [];
        this.editForm[prefix].id = null;
        this.editForm[prefix].existingId = null;
        this.editForm[prefix].type = "";
        this.editForm.timeoutDst = {
          existingId: null,
          id: null,
          type: "",
        };
        this.editForm.wrongKeyPressDst = {
          existingId: null,
          id: null,
          type: "",
        };
      });
    },

    editOperation() {
      this.editForm.allowDisa = this.editForm.allowDisa ? "on" : "";
      this.editForm.loopOnTimeout = this.editForm.loopOnTimeout ? "on" : "";
      this.editForm.loopOnWrongKeyPress = this.editForm.loopOnWrongKeyPress
        ? "on"
        : "";
      this.editForm.maxLoops = this.editForm.maxLoops || 2;
      this.editForm.timeout = this.editForm.timeout || 10;
      this.editForm.meId = this.editForm.meId || 0;
      this.$emit("editOperation", this.editForm);
    },

    cancelOperation() {
      this.$emit("cancelOperation", "edit");
    },

    getKeyLabel(key) {
      return typeof key === "string" ? (key === "SHARP" ? "#" : "*") : key;
    },

    onKeyDstSelection(key, e) {
      this.editForm[`key${key}Dst`].id = e;
    },

    getKeyDst(key) {
      return this.editForm[`key${key}Dst`].id;
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
