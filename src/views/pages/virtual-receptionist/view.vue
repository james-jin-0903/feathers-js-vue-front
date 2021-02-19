<template>
  <div class="page-table scrollable only-y">
    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="voxo-purple" sprite="receptionist" />
        Virtual Receptionist
      </h1>
      <div class="flex">
        <div class="box">
          <el-input v-model="search" placeholder="Search" clearable> </el-input>
        </div>
        <div class="box right">
          <el-button class="table-button-excel" @click="exportTable"
            >Export to Excel</el-button
          >
          <el-button @click="openCreateModal">Add New</el-button>
        </div>
      </div>
      <el-table
        :data="filteredData()"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        @cell-click="cellClicked"
        stripe
        class="voxo-table"
        v-loading="tableLoading"
      >
        <el-table-column label="" width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-purple">
              <v-svg class="voxo-white" sprite="receptionist" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name" sortable> </el-table-column>
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
              ></el-button>
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

    <edit-form
      :editVisible="editVisible"
      :numberOptions="numberOptions"
      :existingGreetings="existingGreetings"
      :clearFormFields="clearFormFields"
      :selectedIvr="selectedIvr"
      @remoteMethodForAvailableNums="remoteMethodForAvailableNums"
      @cancelOperation="cancelOperation"
      @editOperation="editOperation"
    />

    <create-form
      :createVisible="createVisible"
      :numberOptions="numberOptions"
      :existingGreetings="existingGreetings"
      :clearFormFields="clearFormFields"
      @remoteMethodForAvailableNums="remoteMethodForAvailableNums"
      @cancelOperation="cancelOperation"
      @createOperation="createOperation"
    />
  </div>
</template>

<script>
import { debounce } from "lodash";
import { mapActions } from "vuex";
import { exportExcel } from "../../../globals/globals";
import feathersClient from "../../../feathers/feathers-client";
import CreateForm from "./components/createForm";
import EditForm from "./components/editForm";

export default {
  name: "IVRSTable",
  components: { CreateForm, EditForm },
  data() {
    return {
      tableData: [],
      tableLoading: false,
      search: "",
      visibleActionsId: "",
      editIvrId: "",
      editVisible: false,
      createVisible: false,
      selectedIvr: null,
      queryForAvailableNums: "",
      numberOptions: [],
      existingGreetings: [],
      clearFormFields: false,
    };
  },
  computed: {
    selectedTenant() {
      return this.$store.state.selectedTenant;
    },
    user() {
      return this.$store.state.auth.user;
    },
  },
  watch: {
    selectedTenant() {
      this.populateTable();
    },
    user() {
      this.populateTable();
    },

    queryForAvailableNums: debounce(function () {
      this.getNumberOptions(this.queryForAvailableNums);
    }),
  },
  methods: {
    ...mapActions("ivrs", {
      findIvrs: "find",
      deleteIvr: "remove",
      createIvr: "create",
      patchIvr: "patch",
    }),

    formatter(row, column) {
      return row.address;
    },

    remoteMethodForAvailableNums(query) {
      this.queryForAvailableNums = query;
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

    getExistingGreetings() {
      const mediaFilesService = feathersClient.service("mediafiles");
      const mediaFileParams = {
        query: {
          tenantId: { $in: [this.selectedTenant.id, 0] },
        },
      };
      mediaFilesService.find(mediaFileParams).then((res) => {
        console.log(res);
        this.existingGreetings = res.data || res;
      });
    },

    filteredData() {
      return this.tableData.filter(
        (data) =>
          !this.search ||
          data.name.toLowerCase().includes(this.search.toLowerCase())
      );
    },

    //General Form and Table Operations
    actionsDown() {
      this.visibleActionsId = "";
    },
    actionsUp(row) {
      this.visibleActionsId = row.id;
    },

    deleteOperation(id) {
      this.$confirm("Process IVR Delete?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.deleteIvr(id)
            .then(() => {
              this.populateTable();
              this.$notify({
                title: "Success",
                message: "Deleted Successfully!",
                type: "success",
              });
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
            });
        })
        .catch(() => true);
    },

    openCreateModal() {
      this.clearFormFields = false;
      this.createVisible = true;
    },

    openEditModal(id) {
      this.clearFormFields = false;
      this.editIvrId = id;
      feathersClient
        .service("ivrs")
        .get(id)
        .then((res) => {
          this.selectedIvr = res;
          if (this.selectedIvr.phoneNums && this.selectedIvr.phoneNums.length) {
            this.numberOptions = [];
            this.getNumberOptions("");
            this.selectedIvr.phoneNums.forEach((num) => {
              this.numberOptions.push({
                key: num.id,
                label: num.number,
                disabled: false,
              });
            });
          }
          this.editVisible = true;
        });
    },

    populateTable() {
      this.tableLoading = true;
      let params = { query: { tenantId: this.selectedTenant.id } };
      this.findIvrs(params).then((res) => {
        // console.log(res);
        this.tableData = res;
        this.tableLoading = false;
      });
    },

    exportTable() {
      exportExcel("virtual-receptionist");
    },

    cancelOperation(type) {
      this.clearFormFields = true;
      if (type === "create") {
        this.createVisible = false;
      } else if (type === "edit") {
        this.editVisible = false;
      }
    },

    createOperation(createData) {
      const createBody = {
        ...createData,
        tenantId: this.selectedTenant.id,
      };
      console.log(createBody);
      this.$confirm("Process IVR Create?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.createIvr(createBody)
            .then(() => {
              this.$notify({
                title: "Success",
                message: "Created Successfully!",
                type: "success",
              });
              this.clearFormFields = true;
              this.cancelOperation("create");
              this.populateTable();
            })
            .catch((error) => {
              this.clearFormFields = false;
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
            });
        })
        .catch(() => true);
    },

    editOperation(editData) {
      const editBody = { ...editData, tenantId: this.selectedTenant.id };
      console.log(editBody);
      this.$confirm("Process IVR Edit?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.patchIvr([this.editIvrId, editBody])
            .then(() => {
              this.$notify({
                title: "Success",
                message: "Edited Successfully!",
                type: "success",
              });
              this.clearFormFields = true;
              this.cancelOperation("edit");
              this.populateTable();
            })
            .catch((error) => {
              this.clearFormFields = false;
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
            });
        })
        .catch(() => true);
    },

    cellClicked(row, column, cell, event) {
      if (column.label) {
        this.openEditModal(row.id);
      }
    },
  },
  created() {
    this.getExistingGreetings();
    this.getNumberOptions("");
  },

  mounted() {
    if (this.user) {
      this.populateTable();
    }
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/variables";
</style>