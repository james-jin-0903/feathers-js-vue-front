<template>
  <div class="page-table scrollable only-y">
    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="success-text" sprite="telephone" />
        Extensions
      </h1>
      <div class="flex">
        <div class="box">
          <el-input v-model="search" placeholder="Search" clearable> </el-input>
        </div>
        <div class="box right">
          <el-button class="table-button-excel" @click="exportTable"
            >Export to Excel</el-button
          >
          <el-dropdown>
            <el-button
              >Add New <i class="el-icon-arrow-down el-icon--right"></i
            ></el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="openCreate('desk')"
                ><v-svg class="success-text" sprite="telephone-2" /> Desk/Mobile
                Phone</el-dropdown-item
              >
              <el-dropdown-item @click.native="openCreate('fax')"
                ><v-svg class="voxo-orange" sprite="fax-2" /> Fax
                ATA</el-dropdown-item
              >
              <el-dropdown-item @click.native="openCreate('sip')"
                ><v-svg class="voxo-purple" sprite="device-cloud" /> SIP
                Trunk</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <el-table
        :data="filteredData()"
        v-loading="tableLoading"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        @cell-click="cellClicked"
        stripe
        style="cursor: pointer"
        class="voxo-table"
      >
        <el-table-column label="" width="40px">
          <template slot-scope="scope">
            <el-tooltip
              placement="left"
              :content="userTooltipStatus(scope.row)"
            >
              <div class="avatar-group">
                <div class="contact-avatar" v-if="scope.row.avatarPath">
                  <img
                    :src="scope.row.avatarPath"
                    :alt="scope.row.name"
                    :title="scope.row.name"
                  />
                </div>
                <div class="contact-avatar" v-else>
                  {{ scope.row.name.substring(0, 1).toUpperCase() }}
                </div>
                <div class="status-light">
                  <status-indicator
                    :pulse="
                      getStatusFromEvent(scope.row.extStatus) === 'positive' ||
                      getStatusFromEvent(scope.row.extStatus) === 'intermediary'
                    "
                    :status="getStatusFromEvent(scope.row.extStatus)"
                  >
                  </status-indicator>
                </div>
                <div class="dnd-icon" v-if="scope.row.dnd === 'on'">
                  <hr />
                  <status-indicator></status-indicator>
                </div>
              </div>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="number" label="Extension" sortable>
          <template slot-scope="scope">
            <span>{{ scope.row.number }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" sortable> </el-table-column>
        <el-table-column
          prop="cidNum"
          label="Caller ID"
          :formatter="cidNumberFormatter"
          sortable
        >
        </el-table-column>
        <el-table-column prop="branch" label="Branch" sortable>
        </el-table-column>
        <el-table-column prop="department" label="Department" sortable>
        </el-table-column>
        <el-table-column prop="unconditionalStatus" label="Forwarding" sortable>
        </el-table-column>
        <el-table-column
          prop="emergencyCidNum"
          label="Location"
          :formatter="emergNumberFormatter"
          sortable
        >
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <div
              :id="'actions-' + scope.row.id"
              class="table-actions"
              v-if="visibleActionsId === scope.row.id"
            >
              <el-button
                :id="'edit-' + scope.row.id"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click="openEditModal(scope.row.id)"
              >
              </el-button>
              <el-button
                :id="'delete-' + scope.row.id"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteOperation(scope.row.id)"
                circle
              >
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <edit-extension-form
      :clearFormFields="clearFormFields"
      :editProcessing="editProcessing"
      :editVisible="editVisible"
      :editExtType="editExtType"
      :numInUse="numInUse"
      :macInUse="macInUse"
      :locationsProcessing="locationsProcessing"
      :locationOptions="locationOptions"
      :branchOptions="branchOptions"
      :departmentOptions="departmentOptions"
      :numberOptions="numberOptions"
      :deviceList="deviceList"
      :outboundCidNumbersOptions="outboundCidNumbersOptions"
      :deviceModelList="deviceModelList"
      :editFields="editFields"
      :musicOnHoldsList="musicOnHoldsList"
      @remoteMethodForOutboundCid="remoteMethodForOutboundCid"
      @remoteMethodForAvailableNums="remoteMethodForAvailableNums"
      @editOperation="editOperation"
      @cancelOperation="cancelOperation"
      @checkNumber="checkNumber"
      @checkMac="checkMac"
    />

    <create-extension-form
      :clearFormFields="clearFormFields"
      :createProcessing="createProcessing"
      :createVisible="createVisible"
      :createTypeHeader="createTypeHeader"
      :numInUse="numInUse"
      :macInUse="macInUse"
      :activeExtType="activeExtType"
      :locationsProcessing="locationsProcessing"
      :locationOptions="locationOptions"
      :branchOptions="branchOptions"
      :departmentOptions="departmentOptions"
      :numberOptions="numberOptions"
      :deviceList="deviceList"
      :outboundCidNumbersOptions="outboundCidNumbersOptions"
      :deviceModelList="deviceModelList"
      @remoteMethodForOutboundCid="remoteMethodForOutboundCid"
      @remoteMethodForAvailableNums="remoteMethodForAvailableNums"
      @createOperation="createOperation"
      @cancelOperation="cancelOperation"
      @checkNumber="checkNumber"
      @checkMac="checkMac"
    />
  </div>
</template>

<script>
import { debounce } from "lodash";
import { mapGetters, mapActions } from "vuex";
import feathersClient from "../../../feathers/feathers-client";
import { globalEventBus } from "../../../globalEventBus";
import { exportExcel } from "../../../globals/globals";
import CreateExtensionForm from "./components/createForm";
import EditExtensionForm from "./components/editForm";

export default {
  name: "ExtensionForm",
  components: { CreateExtensionForm, EditExtensionForm },
  data() {
    return {
      extNumber: null,
      mac: null,
      clearFormFields: false,
      tableData: [],
      tableLoading: false,
      search: "",
      visibleActionsId: "",
      editExtensionId: "",
      editVisible: false,
      editFields: {},
      createVisible: false,
      typeSelector: false,
      activeExtType: "",
      editExtType: "",
      createProcessing: false,
      editProcessing: false,
      createTypeHeader: "",
      deskFieldsActive: false,
      faxFieldsActive: false,
      sipFieldsActive: false,
      locationOptions: [],
      locationsProcessing: false,
      numberOptions: [],
      outboundCidNumbersOptions: [],
      numbersProcessing: false,
      branchOptions: [],
      departmentOptions: [],
      numInUse: false,
      macInUse: false,
      amiChannel: null,
      deviceList: [],
      donotcallList: [],
      deviceModelList: [],
      queryForOutboundCid: "",
      queryForAvailableNums: "",
      musicOnHoldsList: [],
    };
  },
  computed: {
    ...mapGetters("extensions", { getExtensionsList: "find" }),
    selectedTenant() {
      return this.$store.state.selectedTenant;
    },
    user() {
      return this.$store.state.auth.user;
    },
    extensionsList() {
      let params = { query: { tenantId: this.selectedTenant.id } };
      return this.getExtensionsList(params).data;
    },
  },
  watch: {
    // For inputting extension Number
    extNumber: debounce(function () {
      const checkNumberService = feathersClient.service("check-number");
      checkNumberService
        .find({
          query: { tenantId: this.selectedTenant.id, number: this.extNumber },
        })
        .then((res) => {
          this.numInUse = res.inUse;
        });
    }, 500),
    // For inputting mac address for newDevice
    mac: debounce(function () {
      const checkNumberService = feathersClient.service("check-number");
      checkNumberService
        .find({
          query: { mac: this.mac },
        })
        .then((res) => {
          this.macInUse = res.inUse;
        });
    }, 500),
    // For selecting Outbound Caller Id
    queryForOutboundCid: debounce(function () {
      this.getCallerIdOptions(this.queryForOutboundCid);
    }, 500),
    // For selecting available numbers
    queryForAvailableNums: debounce(function () {
      this.getNumberOptions(this.queryForAvailableNums);
    }),

    selectedTenant() {
      this.tableLoading = true;
      this.$store.commit("extensions/clearList");
      this.queryExtensions();
      this.getDevicelist();

      //leave ami channel and join new
      const channelService = feathersClient.service("channel-memberships");
      channelService
        .remove(null, { query: { channelName: this.amiChannel } })
        .then((res) => console.log(res));
      this.joinSocketChannel();
      //join new ami channel
      const data = {
        roomType: "extensions",
        tenantCode: this.selectedTenant.tenantCode,
        tenantId: this.selectedTenant.id,
      };
      channelService.create(data).then((res) => {
        this.amiChannel = `${data.roomType}/${data.tenantCode}`;
      });
    },
    user() {
      this.tableLoading = true;
      this.queryExtensions();
      this.getDevicelist();
      this.getDeviceModelList();
      this.joinSocketChannel();
    },
  },
  methods: {
    ...mapActions("extensions", {
      findExtensions: "find",
      createExtensions: "create",
      deleteExtensions: "remove",
      patchExtensions: "patch",
    }),
    ...mapActions("locations", { getLocations: "find" }),
    ...mapActions("dids", { getDids: "find" }),
    ...mapActions("devices", { getDevices: "find" }),
    ...mapActions("donotcalls", { getDonotcalls: "find" }),
    ...mapActions("device-models", { getDeviceModels: "find" }),
    ...mapActions("musiconholds", { getMusicOnHolds: "find" }),

    cellClicked(row, column, cell, event) {
      if (column.label) {
        this.openEditModal(row.id);
      }
    },

    getMusiconHoldsList() {
      let params = {
        query: {
          tenantId: { $in: [0, this.selectedTenant.id] },
        },
      };
      this.getMusicOnHolds(params).then((res) => {
        this.musicOnHoldsList = res;
      });
    },

    getDevicelist() {
      let params = {
        query: {
          tenantId: this.selectedTenant.id,
          phLine1ExId: { $in: [0, null] },
        },
      };
      this.getDevices(params).then((res) => {
        res.forEach((row) => {
          this.deviceList.push(row);
        });
      });
    },

    // Method to get available Numbers
    getNumberOptions(filter) {
      const didsService = feathersClient.service("dids");
      const didParams = {
        query: {
          tenantId: this.selectedTenant.id,
          allowEmergency: "",
          filter,
        },
      };
      didsService.find(didParams).then((res) => {
        this.numberOptions = [];
        res.data.forEach((t) => {
          if (t.useStatus === "Available") {
            this.numberOptions.push({
              key: t.id,
              label: t.number,
              disabled: false,
            });
          }
        });
      });
    },

    // Filtering Outbound Caller Id
    remoteMethodForOutboundCid(query) {
      this.queryForOutboundCid = query;
    },

    // Filtering Available Nums
    remoteMethodForAvailableNums(query) {
      this.queryForAvailableNums = query;
    },

    // Method to get available Outbound Caller Ids
    getCallerIdOptions(filter) {
      const didsService = feathersClient.service("dids");
      const didParams = {
        query: {
          tenantId: this.selectedTenant.id,
          allowEmergency: "",
          filter,
        },
      };
      this.outboundCidNumbersOptions = [];
      didsService.find(didParams).then((res) => {
        res.data.forEach((t) => {
          this.outboundCidNumbersOptions.push({
            key: t.id,
            label: t.number,
            disabled: false,
          });
        });
      });
    },

    getDonotcallList() {
      let params = { query: { tenantId: this.selectedTenant.id } };
      this.getDonotcalls(params).then((res) => {
        res.data.forEach((row) => {
          this.donotcallList.push(row);
        });
      });
    },

    getDeviceModelList() {
      this.getDeviceModels().then((res) => {
        res.forEach((row) => {
          this.deviceModelList.push(row);
        });
      });
    },

    cidNumberFormatter(row) {
      return row.cidNum.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },

    emergNumberFormatter(row) {
      return row.emergencyCidNum.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },

    filteredData() {
      return this.extensionsList.filter(
        (data) =>
          !this.search ||
          data.number.toLowerCase().includes(this.search.toLowerCase()) ||
          data.cidNum.toLowerCase().includes(this.search.toLowerCase()) ||
          data.name.toLowerCase().includes(this.search.toLowerCase()) ||
          data.branch.toLowerCase().includes(this.search.toLowerCase()) ||
          data.department.toLowerCase().includes(this.search.toLowerCase()) ||
          data.emergencyCidNum.toLowerCase().includes(this.search.toLowerCase())
      );
    },

    checkNumber(number) {
      this.extNumber = number;
    },

    checkMac(mac) {
      this.mac = mac;
    },

    clearInUseFields() {
      this.macInUse = false;
      this.numInUse = false;
    },

    //Create Operations
    openCreate(type) {
      console.log("creating type" + type);
      this.clearFormFields = false;
      this.activeExtType = type;

      if (type === "desk") {
        this.createTypeHeader = "Desk / Mobile Phone Ext";
      } else if (type === "fax") {
        this.createTypeHeader = "Fax ATA";
      } else {
        this.createTypeHeader = "SIP Trunk";
      }

      this.createVisible = true;
      this.typeSelector = false;

      const didsService = feathersClient.service("dids");
      const didParams = {
        query: { tenantId: this.selectedTenant.id, allowEmergency: "" },
      };
      this.numbersProcessing = true;
      this.outboundCidNumbersOptions = [];
      didsService.find(didParams).then((res) => {
        res.data.forEach((t) => {
          this.outboundCidNumbersOptions.push({
            key: t.id,
            label: t.number,
            disabled: false,
          });
          if (t.useStatus === "Available") {
            this.numberOptions.push({
              key: t.id,
              label: t.number,
              disabled: false,
            });
          }
        });
        this.numbersProcessing = false;
      });
    },

    //General Form and Table Operations
    actionsDown() {
      this.visibleActionsId = "";
    },
    actionsUp(row) {
      this.visibleActionsId = row.id;
    },

    cancelOperation() {
      // Clear the form fields
      this.clearFormFields = true;
      // this.locationOptions = [];
      this.numberOptions = [];
      this.createVisible = false;
      this.editVisible = false;

      this.clearInUseFields();
    },

    createOperation(params) {
      console.log(params);
      this.$confirm("Process Extension Create?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.createProcessing = true;
          if (params.fmfmNumber) {
            params.fmfmDialMethod = "Simultaneous";
          }

          const createBody = {
            ...params,
            tenantId: this.selectedTenant.id,
            tenantCode: this.selectedTenant.tenantCode,
          };

          // change fields based on DB field format
          createBody.followMe = createBody.followMe ? "on" : "";
          this.createExtensions(createBody)
            .then(() => {
              this.$notify({
                title: "Success",
                message: "Created Successfully!",
                type: "success",
              });
              this.createProcessing = false;
              this.cancelOperation();
            })
            .catch((error) => {
              if (error.hasOwnProperty("errors")) {
                this.$notify({
                  title: error.message,
                  message: error.errors[Object.keys(error.errors)[0]],
                  type: "error",
                });
              } else {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: "error",
                });
              }
              this.createProcessing = false;
              this.clearFormFields = false;
            });
        })
        .catch(() => true);
    },

    editOperation(params) {
      this.$confirm("Process Extension Edit?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.editProcessing = true;

          params.dnd = params.dnd ? "on" : "";

          const editBody = {
            ...params,
          };

          // change fields based on DB field format
          editBody.recording = editBody.recording ? "yes" : "no";
          editBody.followMe = editBody.followMe ? "on" : "";
          this.patchExtensions([this.editExtensionId, editBody])
            .then(() => {
              this.$notify({
                title: "Success",
                message: "Edited Successfully!",
                type: "success",
              });
              this.editProcessing = false;
              this.cancelOperation();
            })
            .catch((error) => {
              if (error.hasOwnProperty("errors")) {
                this.$notify({
                  title: error.message,
                  message: error.errors[Object.keys(error.errors)[0]],
                  type: "error",
                });
              } else {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: "error",
                });
              }
              this.editProcessing = false;
              this.clearFormFields = false;
            });
        })
        .catch(() => true);
    },

    deleteOperation(id) {
      this.$confirm("Process Extension Delete?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.tableLoading = true;
          this.deleteExtensions(id)
            .then(() => {
              this.$notify({
                title: "Success",
                message: "Deleted Successfully!",
                type: "success",
              });
              this.tableLoading = false;
            })
            .catch((error) => {
              if (error.hasOwnProperty("errors")) {
                this.$notify({
                  title: error.message,
                  message: error.errors[Object.keys(error.errors)[0]],
                  type: "error",
                });
              } else {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: "error",
                });
              }
              this.tableLoading = false;
            });
        })
        .catch(() => true);
    },

    openEditModal(id) {
      this.editExtensionId = id;
      this.clearFormFields = false;
      feathersClient
        .service("extensions")
        .get(id)
        .then((res) => {
          this.editFields = res;
          this.editExtType = res.type;
        });

      const didsService = feathersClient.service("dids");
      const didParams = {
        query: { tenantId: this.selectedTenant.id, allowEmergency: "" },
      };
      this.numbersProcessing = true;
      this.outboundCidNumbersOptions = [];
      didsService.find(didParams).then((res) => {
        res.data.forEach((t) => {
          this.outboundCidNumbersOptions.push({
            key: t.id,
            label: t.number,
            disabled: false,
          });
          if (t.useStatus === "Available") {
            this.numberOptions.push({
              key: t.id,
              label: t.number,
              disabled: false,
            });
          }
        });
        this.numbersProcessing = false;
      });

      this.editVisible = true;
    },

    queryExtensions() {
      this.branchOptions = [];
      this.departmentOptions = [];
      let params = { query: { tenantId: this.selectedTenant.id } };
      this.findExtensions(params).then((res) => {
        this.tableLoading = false;
        res.forEach((item) => {
          if (!this.branchOptions.includes(item.branch) && item.branch !== "") {
            this.branchOptions.push(item.branch);
          }
          if (
            !this.departmentOptions.includes(item.department) &&
            item.department !== ""
          ) {
            this.departmentOptions.push(item.department);
          }
        });
      });
    },

    getStatusFromEvent(code) {
      const statusReference = {
        UNKNOWN: "", //Unknown
        NOT_INUSE: "", //Idle
        INUSE: "active", //In use
        BUSY: "intermediary", //Busy (pulse)
        INVALID: "",
        UNAVAILABLE: "negative", //Unavailable
        RINGING: "positive", //Ringing (pulse)
        RINGINUSE: "active", //in use on hold
        ONHOLD: "positive", //On Hold
      };
      return statusReference[code];
    },

    userTooltipStatus(user) {
      if (user.dnd === "on") {
        return "Do Not Disturb";
      }
      if (user.extStatus === "NOT_INUSE") {
        return "Idle";
      }
      if (user.extStatus === "INUSE") {
        return "On A Call";
      }
      if (user.extStatus === "RINGING") {
        return "Ringing";
      }
      if (user.extStatus === "UNAVAILABLE") {
        return "Offline";
      }
      if (!user.extStatus) {
        return "Offline";
      }
      return "Status Unknown";
    },

    joinSocketChannel() {
      const channelService = feathersClient.service("channel-memberships");

      if (this.user.hasOwnProperty("myExtension")) {
        if (this.user.myExtension.tenantId != this.selectedTenant.id) {
          const data = {
            roomType: "extensions",
            tenantCode: this.selectedTenant.tenantCode,
            tenantId: this.selectedTenant.id,
          };
          channelService.create(data).then((res) => {
            this.amiChannel = `${data.roomType}/${data.tenantCode}`;
          });
        }
      } else {
        const data = {
          roomType: "extensions",
          tenantCode: this.selectedTenant.tenantCode,
          tenantId: this.selectedTenant.id,
        };
        channelService.create(data).then((res) => {
          this.amiChannel = `${data.roomType}/${data.tenantCode}`;
        });
      }
    },

    removeListeners() {
      const channelService = feathersClient.service("channel-memberships");
      channelService.removeListener("extensionStatus");
      channelService.removeListener("notifyExtStatus");
      globalEventBus.$off("appReconnected");
    },

    exportTable() {
      exportExcel("extensions");
    },
  },

  mounted() {
    const channelService = feathersClient.service("channel-memberships");

    //service for joining extensions channel on tenant code for status
    if (this.user) {
      this.joinSocketChannel();
    }
    channelService.on("extensionStatus", (item) => {
      // console.log(item);
      const extNum = item.peername.split("-")[0];
      let testExt = this.getExtensionsList({ query: { number: extNum } })
        .data[0];
      let extUpdate = { ...testExt };
      extUpdate.extStatus = item.status;
      if (item.hasOwnProperty("dnd")) {
        extUpdate.dnd = item.dnd;
      }
      this.$store.commit("extensions/updateItem", extUpdate);
    });
    //listens for updates to extension availability
    channelService.on("notifyExtStatus", (item) => {
      const extNum = item.peerName.split("-")[0];
      let testExt = this.getExtensionsList({ query: { number: extNum } })
        .data[0];
      let extUpdate = { ...testExt };
      if (item.status === "UNAVAILABLE") {
        extUpdate.extStatus = "UNAVAILABLE";
      } else {
        extUpdate.extStatus = "NOT_INUSE";
      }
      this.$store.commit("extensions/updateItem", extUpdate);
    });

    //monitor socket connection and reconnect to channel
    globalEventBus.$on("appReconnected", () => {
      console.log("the app did reconnect");
      this.joinSocketChannel();
    });
  },
  created() {
    const locationsService = feathersClient.service("locations");
    const params = {
      query: { tenantId: this.selectedTenant.id, allowEmergency: "on" },
    };
    this.locationsProcessing = true;

    locationsService.find(params).then((res) => {
      this.locationOptions = res;
      this.locationsProcessing = false;
    });

    if (this.user) {
      this.tableLoading = true;
      this.$store.commit("extensions/clearList");
      this.queryExtensions();
      this.getDevicelist();
      this.getDeviceModelList();
      this.getMusiconHoldsList();
    }
  },
  beforeDestroy() {
    const channelService = feathersClient.service("channel-memberships");

    if (this.user.hasOwnProperty("myExtension")) {
      if (this.user.myExtension.tenantId != this.selectedTenant.id) {
        channelService
          .remove(null, { query: { channelName: this.amiChannel } })
          .then((res) => console.log(res));
      }
    } else {
      channelService
        .remove(null, { query: { channelName: this.amiChannel } })
        .then((res) => console.log(res));
    }
    this.$store.commit("extensions/clearList");
    this.removeListeners();
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/variables";

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