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
        <h1 class="modal-title col-2">Create Call Group</h1>
        <div class="modal-actions col-2">
          <el-button
            type="primary"
            @click="createOperation"
            :disabled="numInUse"
            >Create</el-button
          >
          <el-button type="default" @click="cancelOperation"> Cancel</el-button>
        </div>
      </div>
    </div>

    <el-form>
      <el-tabs v-model="activeTabName">
        <el-tab-pane label="General" name="general">
          <div class="inline-form-group">
            <el-col :span="11">
              <el-input
                v-model="createForm.number"
                placeholder="Call Group Number"
              >
                <template slot="prefix">Call Group Number</template>
                <template slot="append" v-if="numInUse">In Use!</template>
              </el-input>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="12">
              <el-input v-model="createForm.name" placeholder="Call Group Name">
                <template slot="prefix">Call Group Name</template>
              </el-input>
            </el-col>
          </div>

          <div class="inline-form-group">
            <el-col :span="11">
              <el-select
                v-model="createForm.ringTime"
                placeholder="Select Ring Time"
              >
                <el-option
                  v-for="i in 60"
                  :key="i"
                  :label="i"
                  :value="i * 5"
                ></el-option>
                <template slot="prefix">Select Ring Time</template>
              </el-select>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="12">
              <el-radio v-model="ringStrategy" label="RINGALL"
                >Ring All</el-radio
              >
              <el-radio v-model="ringStrategy" label="SEQUENCE"
                >Sequential</el-radio
              >
            </el-col>
          </div>
          <div class="inline-form-group" v-if="ringStrategy === 'SEQUENCE'">
            <el-col :span="11">
              <el-select
                v-model="createForm.dialTimeout"
                placeholder="Select Dial Time Out"
              >
                <el-option
                  v-for="i in 120"
                  :key="i"
                  :label="i"
                  :value="i * 5"
                ></el-option>
                <template slot="prefix">Dial Time Out</template>
              </el-select>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="12">
              <el-checkbox v-model="createForm.type" :label="true">
                <span>Loop On TimeOut</span>
              </el-checkbox>
            </el-col>
          </div>
          <div class="inline-form-group" v-if="ringStrategy === 'SEQUENCE'">
            <el-checkbox v-model="createForm.musicOnHold" :label="true">
              <span>Music On Hold</span>
            </el-checkbox>
          </div>
          <div class="inline-form-group">
            <el-checkbox v-model="createForm.checkinuse" :label="true">
              <span>Skip Extension if On A Call</span>
            </el-checkbox>
          </div>
          <div class="inline-form-group">
            <el-checkbox v-model="createForm.checkoffline" :label="true">
              <span>Find Me</span>
            </el-checkbox>
          </div>
          <div class="inline-form-group">
            <el-checkbox v-model="createForm.allowfmfm" :label="true">
              <span>Follow Me</span>
            </el-checkbox>
          </div>

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
        </el-tab-pane>
        <el-tab-pane label="Destinations" name="destinations">
          <el-button type="primary" plain @click="addDestination">
            Add More
          </el-button>
          <draggable v-model="createForm.destinations" v-if="updateList">
            <transition-group name="list" tag="div">
              <div
                class="inline-form-group list-group-item"
                v-for="(destination, index) in createForm.destinations"
                :key="index"
              >
                <el-col :span="9">
                  <el-select
                    v-model="createForm.destinations[index].type"
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
                <el-col :span="9">
                  <el-select
                    v-model="createForm.destinations[index].id"
                    filterable
                    placeholder="Select Timeout Destination"
                  >
                    <template slot="prefix">Timeout Destination</template>
                    <el-option
                      v-for="item in timeoutDstOptionLists[index]"
                      :key="item.id"
                      :label="
                        getDestinationLabel(
                          item,
                          createForm.destinations[index].type
                        )
                      "
                      :value="item.id"
                    ></el-option>
                  </el-select>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="4">
                  <el-button-group>
                    <el-button
                      type="primary"
                      plain
                      icon="el-icon-delete"
                      @click="removeDestination(index)"
                    ></el-button>
                    <el-button
                      icon="el-icon-rank"
                      type="info"
                      plain
                    ></el-button>
                  </el-button-group>
                </el-col>
              </div>
            </transition-group>
          </draggable>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-dialog>
</template>

<script>
import feathersClient from "../../../../feathers/feathers-client";
import draggable from "vuedraggable";

export default {
  name: "CreateForm",
  props: {
    createVisible: { required: true },
    numInUse: { required: true },
    numberOptions: { required: true },
    clearFormFields: { required: true }
  },
  components: {
    draggable
  },
  data() {
    return {
      activeTabName: "general",
      ringStrategy: "",
      timeoutDstType: "",
      timeoutDstOptions: [],
      timeoutDstOptionLists: [],
      updateList: true,
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
        "SMS"
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
      createForm: {
        tenantId: null,
        number: null,
        name: "",
        ringTime: null,
        type: "",
        dialTimeout: null,
        musicOnHold: false,
        checkinuse: false,
        allowfmfm: false,
        checkoffline: false,
        destinations: [],
        phoneNums: [],
        timeoutDst: {
          id: null,
          type: ""
        }
      }
    };
  },
  computed: {
    callGroupNumber() {
      return this.createForm.number;
    },
    selectedTenant() {
      return this.$store.state.selectedTenant;
    },
    destinationTypeList() {
      return this.createForm.destinations.map(row => row.type);
    }
  },
  watch: {
    clearFormFields(value) {
      if (value) {
        this.clearFields();
      }
    },
    callGroupNumber() {
      if (this.callGroupNumber !== "") {
        this.$emit("numberChange", this.callGroupNumber);
      }
    },
    ringStrategy() {
      if (this.ringStrategy === "RINGALL") {
        this.createForm.dialTimeout = 300;
      }
    },
    async timeoutDstType(type) {
      if (type !== "") {
        this.createForm.timeoutDst.type = type;
        this.createForm.timeoutDst.id = null;

        var res = await this.getAvailableDestinations(type);
        this.timeoutDstOptions = res.data || res;
      }
    },
    async destinationTypeList() {
      for (var i = 0; i < this.destinationTypeList.length; i++) {
        var row = this.destinationTypeList[i];
        if (row !== "") {
          var res = await this.getAvailableDestinations(row);
          this.timeoutDstOptionLists[i] = res.data || res;
        }
      }
      this.updateList = false;
      this.updateList = true;
    }
  },
  methods: {
    createOperation() {
      this.createForm.tenantId = this.selectedTenant.id;
      this.$emit("createOperation", this.createForm);
    },

    cancelOperation() {
      this.$emit("cancelOperation", "create");
    },

    clearFields() {
      this.createForm = {
        tenantId: null,
        number: null,
        name: "",
        ringTime: null,
        type: "",
        dialTimeout: null,
        checkinuse: false,
        allowfmfm: false,
        checkoffline: false,
        destinations: [],
        phoneNums: [],
        timeoutDst: {
          id: null,
          type: ""
        }
      };
      this.timeoutDstType = "";
      this.timeoutDstOptions = [];
      this.activeTabName = "general";
    },

    remoteMethodForAvailableNums(query) {
      this.$emit("remoteMethodForAvailableNums", query);
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
            field: "name"
          };
        case "CUSTOM":
          return {
            prefix: "Custom",
            field: "name"
          };
        case "DISA":
          return {
            prefix: "Disa",
            field: "name"
          };
        case "DISABLEUNCONDITIONALDID":
          return {
            prefix: "DID",
            field: "diCommentName"
          };
        case "ENABLEUNCONDITIONALDID":
          return {
            prefix: "DID",
            field: "diCommentName"
          };
        case "EXT":
          return {
            prefix: "Extension",
            field: "name"
          };
        case "HUNTLIST":
          return {
            prefix: "Huntlist",
            field: "name"
          };
        case "IVR":
          return {
            prefix: "IVR",
            field: "name"
          };
        case "LOGINADQUEUE":
          return {
            prefix: "",
            field: ""
          };
        case "LOGOUTQUEUE":
          return {
            prefix: "",
            field: ""
          };
        case "MEDIAFILE":
          return {
            prefix: "Media File",
            field: "name"
          };
        case "MEETME":
          return {
            prefix: "",
            name: ""
          };
        case "PLAYBACK":
          return {
            prefix: "Playback",
            field: "name"
          };
        case "QUEUE":
          return {
            prefix: "Queue",
            field: "name"
          };
        case "RERECORD":
          return {
            prefix: "",
            name: ""
          };
        case "SETUNCONDITIONALDID":
          return {
            prefix: "DID",
            field: "diCommentName"
          };
        case "SMS":
          return {
            prefix: "SMS",
            field: "diCommentName"
          };
        case "SPECIAL":
          return {
            prefix: "SPECIAL",
            field: "code"
          };
        case "TOGGLEPAUSEQUEUE":
          return {
            prefix: "",
            field: ""
          };
        case "TOGGLEUNCONDITIONALDID":
          return {
            prefix: "",
            field: ""
          };
        case "VOICEMAIL":
          return {
            prefix: "VOICEMAIL BOX",
            field: "mailbox"
          };
        default:
          return false;
      }
    },
    getAvailableDestinations(destinationType, isForwardingCalls = false) {
      return new Promise((resolve, reject) => {
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

        feathersClient
          .service(this.getServiceBasedOnDestinationType(destinationType))
          .find({ query })
          .then(res => {
            resolve(res);
          });
      });
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
    addDestination() {
      this.createForm.destinations.push({
        id: null,
        type: "",
        order: 0
      });
    },
    removeDestination(id) {
      this.createForm.destinations = this.createForm.destinations.filter(
        (row, index) => {
          return index !== id;
        }
      );
    }
  },
  filters: {
    formatNumber(value) {
      return `(${value.substr(0, 3)})-${value.substr(3, 3)}-${value.substr(
        6,
        4
      )}`;
    }
  }
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

.list-enter-active,
.list-leave-active,
.list-move {
  transition: 500ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
  transition-property: opacity, transform;
}

.list-enter {
  opacity: 0;
  transform: translateX(50px) scaleY(0.5);
}

.list-enter-to {
  opacity: 1;
  transform: translateX(0) scaleY(1);
}

.list-leave-active {
  position: absolute;
}

.list-leave-to {
  opacity: 0;
  transform: scaleY(0);
  transform-origin: center top;
}
</style>
