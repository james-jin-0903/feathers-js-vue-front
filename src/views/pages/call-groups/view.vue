<template>
  <div class="page-table scrollable only-y">
    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="voxo-orange" sprite="group" />
        Call Groups
      </h1>
      <div class="flex">
        <div class="box">
          <el-input v-model="search" placeholder="Search" clearable> </el-input>
        </div>
        <div class="box right">
          <el-button class="table-button-excel" @click="exportTable"
            >Export to Excel</el-button
          >
          <el-button @click="createVisible = true">Add New</el-button>
        </div>
      </div>
      <el-table
        :data="filteredData()"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        stripe
        class="voxo-table"
      >
        <el-table-column label="" width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-orange">
              <v-svg class="voxo-white" sprite="group" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="number" label="Number" sortable>
        </el-table-column>
        <el-table-column prop="name" label="Name" sortable> </el-table-column>
        <el-table-column prop="type" label="Type" sortable> </el-table-column>
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
                circle
                @click="deleteOperation(scope.row.id)"
              >
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      id="edit-modal"
      title="View / Edit Call Group"
      :visible.sync="editVisible"
      :fullscreen="true"
    >
    </el-dialog>

    <create-form
      :createVisible="createVisible"
      :clearFormFields="clearFormFields"
      :numInUse="numInUse"
      :numberOptions="numberOptions"
      @createOperation="createOperation"
      @cancelOperation="cancelOperation"
      @numberChange="numberChange"
      @remoteMethodForAvailableNums="remoteMethodForAvailableNums"
    />
  </div>
</template>

<script>
import { mapActions } from "vuex";
import feathersClient from "../../../feathers/feathers-client";
import { exportExcel } from "../../../globals/globals";
import CreateForm from "./components/createForm";
import { debounce } from "lodash";

export default {
  name: "HuntListTable",
  data() {
    return {
      tableData: [],
      search: "",
      visibleActionsId: "",
      modalModelId: "",
      editVisible: false,
      queryForAvailableNums: "",
      createVisible: false,
      clearFormFields: false,
      callGroupNumber: null,
      numberOptions: [],
      numInUse: false
    };
  },
  components: {
    CreateForm
  },
  computed: {
    selectedTenant() {
      return this.$store.state.selectedTenant;
    },
    user() {
      return this.$store.state.auth.user;
    }
  },
  watch: {
    selectedTenant() {
      this.populateTable();
    },
    user() {
      this.populateTable();
    },
    callGroupNumber: debounce(function() {
      const checkNumberService = feathersClient.service("check-number");
      checkNumberService
        .find({
          query: {
            tenantId: this.selectedTenant.id,
            number: this.callGroupNumber
          }
        })
        .then(res => {
          console.log(res.inUse);
          this.numInUse = res.inUse;
        });
    }, 500),
    queryForAvailableNums: debounce(function() {
      this.getNumberOptions(this.queryForAvailableNums);
    })
  },
  methods: {
    ...mapActions("huntlists", {
      findHuntLists: "find",
      deleteHuntLists: "remove",
      createHuntLists: "create",
      patchHuntLists: "patch"
    }),
    filteredData() {
      return this.tableData.filter(
        data =>
          !this.search ||
          (!!data.number &&
            data.number
              .toString()
              .toLowerCase()
              .includes(this.search.toLowerCase())) ||
          data.name.toLowerCase().includes(this.search.toLowerCase()) ||
          data.type.toLowerCase().includes(this.search.toLowerCase())
      );
    },

    //General Form and Table Operations
    actionsDown() {
      this.visibleActionsId = "";
    },
    actionsUp(row) {
      this.visibleActionsId = row.id;
    },

    openEditModal(id) {
      this.modalModelId = id;
      this.editVisible = true;
      feathersClient
        .service("ivrs")
        .get(id)
        .then(res => {
          this.selectedIvr = res;
          if (this.selectedIvr.phoneNums && this.selectedIvr.phoneNums.length) {
            this.numberOptions = [];
            this.getNumberOptions("");
            this.selectedIvr.phoneNums.forEach(num => {
              this.numberOptions.push({
                key: num.id,
                label: num.number,
                disabled: false
              });
            });
          }
          this.editVisible = true;
        });
    },
    populateTable() {
      let params = { query: { tenantId: this.selectedTenant.id } };
      this.findHuntLists(params).then(res => (this.tableData = res));
    },
    exportTable() {
      exportExcel("call-groups");
    },
    numberChange(number) {
      this.callGroupNumber = number;
    },
    remoteMethodForAvailableNums(query) {
      this.queryForAvailableNums = query;
    },
    getNumberOptions(filter) {
      const didsService = feathersClient.service("dids");
      const didParams = {
        query: {
          tenantId: this.selectedTenant.id,
          allowEmergency: "",
          filter
        }
      };
      didsService.find(didParams).then(res => {
        this.numberOptions = [];
        res.data.forEach(t => {
          if (t.useStatus === "Available") {
            this.numberOptions.push({
              key: t.id,
              label: t.number,
              disabled: false
            });
          }
        });
      });
    },

    createOperation(params) {
      console.log(payload);
      var payload = { ...params };
      payload.destinations.map((row, index) => {
        row.order = index + 1;
      });
      payload.allowfmfm = payload.allowfmfm == true ? "on" : "";
      payload.checkoffline = payload.checkoffline == true ? "" : "on";
      payload.checkinuse = payload.checkinuse == true ? "on" : "";
      payload.musicOnHold = payload.musicOnHold == true ? "on" : "";
      payload.type = payload.type == true ? "CYCLE" : "";
      console.log(payload);

      this.$confirm("Process Call group Create?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning"
      })
        .then(() => {
          this.createHuntLists(payload)
            .then(() => {
              this.$notify({
                title: "Success",
                message: "Created Successfully!",
                type: "success"
              });
              this.clearFormFields = true;
              this.cancelOperation("create");
            })
            .catch(error => {
              this.clearFormFields = false;
              if (error.hasOwnProperty("errors")) {
                this.$notify({
                  title: error.message,
                  message: error.errors[Object.keys(error.errors)[0]],
                  type: "error"
                });
              } else {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: "error"
                });
              }
            });
        })
        .catch(() => true);
    },

    cancelOperation(type) {
      this.clearFormFields = true;
      if (type === "create") {
        this.createVisible = false;
      } else if (type === "edit") {
        this.editVisible = false;
      }
    },

    deleteOperation(id) {
      this.$confirm("Process Call group Delete?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning"
      })
        .then(() => {
          this.deleteHuntLists(id)
            .then(() => {
              this.populateTable();
              this.$notify({
                title: "Success",
                message: "Deleted Successfully!",
                type: "success"
              });
            })
            .catch(error => {
              if (error.hasOwnProperty("errors")) {
                this.$notify({
                  title: error.message,
                  message: error.errors[Object.keys(error.errors)[0]],
                  type: "error"
                });
              } else {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: "error"
                });
              }
            });
        })
        .catch(() => true);
    }
  },
  mounted() {
    if (this.user) {
      this.populateTable();
    }

    //event listeners
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/variables";
</style>
