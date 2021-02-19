<template>
  <div class="page-table scrollable only-y">
    <div class="table-box page-header card-base card-shadow--medium">
      <el-row>
        <el-col :span="12">
          <h1>
            <v-svg class="voxo-pink" sprite="phone-number" />
            Phone Numbers
          </h1>
        </el-col>

        <el-col class="text-right" :span="12">
          <el-tag>
            <i class="el-icon-info" style="margin-right: 4px"></i>
            Total: {{ total | number }}
          </el-tag>
        </el-col>
      </el-row>
      <div class="flex">
        <div class="box">
          <el-input v-model="search" placeholder="Search" clearable> </el-input>
          <el-button class="table-button-excel ml-10" @click="exportTable"
            >Export to Excel</el-button
          >
          <el-button @click="createVisible = true">Add New</el-button>
        </div>
        <div class="box right">
          <el-pagination
            small
            background
            layout="prev, pager, next"
            @current-change="pageSet"
            @next-click="pageNext"
            @prev-click="pagePrevious"
            :current-page="page"
            :page-size="50"
            :pager-count="5"
            :total="total"
          />
        </div>
      </div>
      <el-table
        :data="filteredData()"
        v-loading="deleteProcessing"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @row-click="
          (row, event, column) => {
            if (column.hasOwnProperty('label')) {
              getNumberProfile(row.id, event, column);
            }
          }
        "
        @cell-mouse-leave="actionsDown"
        stripe
        class="voxo-table"
      >
        <el-table-column label="" width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-pink">
              <v-svg class="voxo-white" sprite="phone-number" />
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="number"
          label="Number"
          :formatter="numberFormatter"
          sortable
        >
        </el-table-column>
        <el-table-column prop="namePrefix" label="Prefix" sortable>
        </el-table-column>
        <el-table-column prop="recording" label="Recording" sortable>
        </el-table-column>
        <el-table-column prop="fax" label="Fax" sortable> </el-table-column>
        <el-table-column prop="branch" label="Branch" sortable>
        </el-table-column>
        <el-table-column prop="department" label="Department" sortable>
        </el-table-column>
        <el-table-column label="Destination Status" prop="useStatus" sortable>
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
                @click="getNumberProfile(scope.row.id)"
              ></el-button>
              <el-button
                :id="'delete-' + scope.row.id"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                @click="deleteRecord(scope.row.id)"
              ></el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      id="edit-modal"
      class="form-modal"
      v-loading="editProcessing"
      :visible.sync="editVisible"
      :fullscreen="true"
      :show-close="false"
      :modal="false"
      @closed="clearFormFields(editForm)"
    >
      <div id="edit-modal-header" class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">Update Number</h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="updateNumber">Update</el-button>
            <el-button type="default" @click="cancelOperation">
              Cancel</el-button
            >
          </div>
        </div>
      </div>

      <el-form>
        <div class="inline-form-group">
          <el-col :span="9">
            <el-input
              v-model="editForm.number"
              placeholder="Enter Number"
              :readOnly="true"
              :disabled="true"
            >
              <template slot="prefix">Phone Number</template>
            </el-input>
          </el-col>
          <el-col :span="1"></el-col>
          <el-col :span="14">
            <el-input
              v-model="editForm.callerId"
              placeholder="Enter Caller Id Name"
              v-loading="findingCallerId"
            >
              <template slot="prefix">Caller Id Name</template>
            </el-input>
          </el-col>
        </div>

        <div class="inline-form-group">
          <el-col :span="14">
            <el-input
              v-model="editForm.namePrefix"
              placeholder="Enter Prefix Name"
            >
              <template slot="prefix">Prefix Name</template>
            </el-input>
          </el-col>
          <el-col :span="1"></el-col>
          <el-col :span="9">
            <el-select
              v-model="editForm.recording"
              :value="editForm.recording"
              placeholder="Select Option"
            >
              <template slot="prefix">Allow Recording</template>
              <el-option
                v-for="(option, index) in recordingOptions"
                :key="index"
                :value="option"
                :label="option"
              >
              </el-option>
            </el-select>
          </el-col>
        </div>
        <el-select
          v-model="editForm.branch"
          :value="editForm.branch"
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
        <div class="modal-footer-actions">
          <el-button
            circle
            type="danger"
            icon="el-icon-delete"
            @click="deleteRecord(modalModelId)"
          ></el-button>
        </div>
      </el-form>
    </el-dialog>

    <el-dialog
      id="create-modal"
      class="form-modal"
      v-loading="createProcessing"
      :visible.sync="createVisible"
      :fullscreen="true"
      :show-close="false"
      :modal="false"
      @closed="clearFormFields(createForm)"
    >
      <div id="create-modal-header" class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">Order Numbers</h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="orderNumbers">Create</el-button>
            <el-button type="default" @click="cancelOperation">
              Cancel</el-button
            >
          </div>
        </div>
      </div>

      <el-form>
        <div class="inline-form-group">
          <el-col :span="7">
            <el-select
              v-model="createForm.state"
              :value="createForm.state"
              placeholder="Select State"
              @change="fetchRateCenters"
              filterable
            >
              <template slot="prefix">State</template>
              <el-option
                v-for="(state, index) in states"
                :key="index"
                :value="state.abbreviation"
                :label="state.name"
              >
              </el-option>
            </el-select>
          </el-col>
          <el-col :span="1"></el-col>
          <el-col :span="16">
            <el-select
              v-model="createForm.rateCenter"
              :value="createForm.rateCenter"
              placeholder="Select Rate Center"
              @change="getCoverage"
              filterable
            >
              <template slot="prefix">Rate Center</template>
              <el-option
                v-for="(center, index) in rateCenters"
                :key="index"
                :value="center"
                :label="center"
              >
              </el-option>
            </el-select>
          </el-col>
        </div>

        <div class="inline-form-group">
          <el-col :span="24">
            <el-select
              v-model="createForm.area"
              :value="createForm.area"
              placeholder="Select NPA-NXX"
              v-loading="optionsLoading"
              @change="getInventory"
              filterable
            >
              <template slot="prefix">NPA-NXX</template>
              <el-option
                v-for="(area, index) in areaOptions"
                :key="index"
                :value="area.npa + area.nxx"
                :label="
                  area.npa +
                  ' - ' +
                  area.nxx +
                  ' - XXXX ' +
                  '( ' +
                  area.count +
                  ' available)'
                "
              >
              </el-option>
            </el-select>
          </el-col>
        </div>

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

        <h2 class="form-section-header">Choose Numbers</h2>

        <el-transfer
          v-model="createForm.numbers"
          :data="numberOptions"
          v-loading="numbersLoading"
          :titles="['Available', 'Assigned']"
          filterable
        >
        </el-transfer>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import stateList from "../../../ref/states";
import rateCentersList from "../../../ref/rate-centers";
import feathersClient from "../../../feathers/feathers-client";
import { exportExcel } from "../../../globals/globals";
import debounce from "lodash/debounce";

export default {
  name: "DidsTable",
  data() {
    return {
      search: "",
      limit: 50,
      page: 1,
      pages: 1,
      total: 0,
      branchOptions: [],
      needsBackendFilter: true,
      initialQueryDone: false,
      visibleActionsId: "",
      modalModelId: "",
      editVisible: false,
      createVisible: false,
      states: stateList,
      rateCenters: "",
      areaOptions: "",
      numberOptions: [],
      optionsLoading: false,
      numbersLoading: false,
      createProcessing: false,
      deleteProcessing: false,
      editProcessing: false,
      findingCallerId: false,
      recordingOptions: ["yes", "no"],
      originalCallerId: "",
      createForm: {
        state: "",
        rateCenter: "",
        area: "",
        numbers: [],
        branch: "",
      },
      editForm: {
        number: "",
        callerId: "",
        namePrefix: "",
        recording: "",
        callerIdUpdated: false,
        branch: "",
      },
    };
  },
  computed: {
    ...mapGetters("dids", { getNumberList: "find", numberProfile: "get" }),
    selectedTenant() {
      return this.$store.state.selectedTenant;
    },
    user() {
      return this.$store.state.auth.user;
    },
    didsList() {
      return this.getNumberList({
        query: { tenantId: this.selectedTenant.id, allowEmergency: "" },
      }).data;
    },
  },
  watch: {
    page: debounce(function () {
      this.isFindPending = true;
      this.getDidsList();
    }, 500),
    search: debounce(function () {
      console.log("search changed");
      this.getDidsList();
    }, 500),
    user() {
      this.findNumbers({
        query: {
          tenantId: this.selectedTenant.id,
          allowEmergency: "",
          $limit: this.limit,
        },
      });
    },
    selectedTenant() {
      this.initialQueryDone = false;
      this.needsBackendFilter = true;
      this.deleteProcessing = true;
      this.$store.commit("dids/clearList");
      const currentPage = this.page;
      const currentSearch = this.search;
      this.page = 1;
      this.search = "";

      //if neither one of the watchers are trigger by resetting search or page number, we need to query.
      const pageWatchTriggered = !(currentPage === this.page);
      const searchWatchTriggered = !(currentSearch === this.search);

      if (!(pageWatchTriggered || searchWatchTriggered)) {
        this.getDidsList();
      }
    },
  },
  methods: {
    ...mapActions("extensions", {
      findExtensions: "find",
    }),
    ...mapActions("dids", {
      findNumbers: "find",
      createNumbers: "create",
      removeNumber: "remove",
      patchNumber: "patch",
    }),

    fetchBranchOptions() {
      this.branchOptions = [];
      let params = { query: { tenantId: this.selectedTenant.id } };
      this.findExtensions(params).then((res) => {
        res.forEach((item) => {
          if (!this.branchOptions.includes(item.branch) && item.branch !== "") {
            this.branchOptions.push(item.branch);
          }
        });
      });
    },

    exportTable() {
      exportExcel("phone-numbers");
    },

    numberFormatter(row, column) {
      return row.number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },

    filteredData() {
      if (!this.needsBackendFilter) {
        return this.didsList.filter(
          (data) =>
            !this.search ||
            data.number
              .toString()
              .toLowerCase()
              .includes(this.search.toLowerCase()) ||
            data.namePrefix.toLowerCase().includes(this.search.toLowerCase()) ||
            data.branch.toLowerCase().includes(this.search.toLowerCase()) ||
            data.department.toLowerCase().includes(this.search.toLowerCase())
        );
      } else {
        return this.didsList;
      }
    },

    //Create / Order Functions
    fetchRateCenters() {
      this.createForm.rateCenter = "";
      this.createForm.area = "";
      this.createForm.numbers = [];
      this.numberOptions = [];
      this.rateCenters = rateCentersList[this.createForm.state].sort();
    },

    getCoverage() {
      const numberOrderingService = feathersClient.service("tn-ordering");
      this.optionsLoading = true;
      this.numberOptions = [];
      this.createForm.numbers = [];
      const params = {
        query: {
          context: "coverage",
          rateCenter: this.createForm.rateCenter,
          state: this.createForm.state,
        },
      };
      numberOrderingService.find(params).then((res) => {
        //if there are no results let user know there are no available numbers
        if (!res.length) {
          this.$notify({
            title: "No Available Numbers",
            message:
              "There Are No Available Numbers For the Selected Rate Center!",
            type: "error",
          });
          this.optionsLoading = false;
          this.areaOptions = "";
          this.numberOptions = [];
          this.createForm.area = "";
        } else {
          this.areaOptions = res;
          this.createForm.area = "";
          this.createForm.numbers = [];
          this.optionsLoading = false;
        }
      });
    },

    getInventory() {
      const numberOrderingService = feathersClient.service("tn-ordering");
      this.numbersLoading = true;
      let params = {
        query: {
          context: "inventory",
          rateCenter: this.createForm.rateCenter,
          state: this.createForm.state,
          npanxx: this.createForm.area,
        },
      };

      numberOrderingService.find(params).then((res) => {
        let transferNumbers = [];
        res.forEach((n) => {
          transferNumbers.push({
            key: n.telephoneNumber,
            label: n.telephoneNumber,
            disabled: false,
          });
        });
        this.numberOptions = transferNumbers;
        this.numbersLoading = false;
      });
    },

    orderNumbers() {
      const postData = {
        tenantId: this.selectedTenant.id,
        numbers: this.createForm.numbers,
      };

      this.$confirm("Process Number Order?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.createProcessing = true;
          this.createNumbers(postData)
            .then((res) => {
              this.$notify({
                title: "Success",
                message: "Order Successful!",
                type: "success",
              });
              this.createProcessing = false;
              let numbersCreated = [];
              res.forEach((d) => {
                numbersCreated.push(d.number);
              });
              let numbersIgnored = [];
              this.createForm.numbers.forEach((number) => {
                if (!numbersCreated.includes(number)) {
                  numbersIgnored.push(number);
                }
              });

              if (numbersIgnored.length) {
                this.$alert(
                  numbersIgnored + ": Not Available For Order",
                  "Order Alert",
                  {
                    confirmButtonText: "OK",
                  }
                );
              }

              this.clearFormFields(this.createForm);
              this.createVisible = false;
              this.numberOptions = [];
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
            });
        })
        .catch(() => true);
    },

    //edit operations
    getNumberProfile(id) {
      this.editVisible = true;
      this.modalModelId = id;
      const currentRecord = this.numberProfile(id);
      this.populateFields(currentRecord);

      //fetch the current calling name from inteliquent
      this.findingCallerId = true;
      const numberOrderingService = feathersClient.service("tn-ordering");
      let params = {
        query: { context: "numberDetails", number: this.editForm.number },
      };
      numberOrderingService
        .find(params)
        .then((res) => {
          this.editForm.callerId = res[0].tnFeature.callerId.callingName;
          this.originalCallerId = res[0].tnFeature.callerId.callingName;
          this.findingCallerId = false;
        })
        .catch(() => {
          this.findingCallerId = false;
        });
    },

    updateNumber() {
      //check if caller id name was changed to know whether or not to call inteliquent service
      this.editForm.callerIdUpdated =
        this.editForm.callerId !== this.originalCallerId;

      //confirm complete close modal
      this.$confirm("Update Phone Number Details?", "Warning", {
        confirmButtonText: "Update",
        cancelButtonText: "Cancel",
      })
        .then(() => {
          this.editProcessing = true;
          //set up form data to post.
          let data = { ...this.editForm, tenantId: this.selectedTenant.id };
          delete data.number;

          //patch existing Did record
          this.patchNumber([this.modalModelId, data])
            .then((res) => {
              this.$notify({
                title: "Success",
                message: res.number + " has been updated!",
                type: "success",
              });
              this.editVisible = false;
              this.editProcessing = false;
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
            });
        })
        .catch(() => true);
    },

    //delete operations
    deleteRecord(id) {
      if (!this.editVisible) {
        this.deleteProcessing = true;
      }
      this.editProcessing = true;

      //set a delay to ensure that the destinations have had time to return asynchronously
      let message = "";
      const DidRecord = this.numberProfile(id);

      if (DidRecord.useStatus === "Unavailable") {
        message =
          "Are You Sure? This number is assigned to something in your account." +
          " Once you delete this number it will not be able to be retrieved again.";
      } else {
        message = "Permanently Delete This Number?";
      }

      this.deleteProcessing = false;
      this.$confirm(message, {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          if (!this.editVisible) {
            this.deleteProcessing = true;
          }
          this.editProcessing = true;
          this.removeNumber(id)
            .then(() => {
              this.$notify({
                title: "Success",
                message: "Phone Number Successfully Removed!",
                type: "success",
              });
              this.deleteProcessing = false;
              this.editProcessing = false;
              this.editVisible = false;
            })
            .catch((error) => {
              this.$notify({
                title: error.name,
                message: error.message,
                type: "error",
              });
              this.deleteProcessing = false;
              this.editProcessing = false;
            });
        })
        .catch(() => true);
    },

    //General Form and Table Operations
    actionsDown() {
      this.visibleActionsId = "";
    },
    actionsUp(row) {
      this.visibleActionsId = row.id;
    },

    cancelOperation() {
      this.$confirm("Cancel Operation?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      }).then(() => {
        this.createVisible = false;
        this.editVisible = false;
        this.clearFormFields(this.createForm);
        this.numberOptions = [];
      });
    },

    populateFields(record) {
      for (let key in record) {
        if (record.hasOwnProperty(key)) {
          if (this.editForm.hasOwnProperty(key)) {
            this.editForm[key] = record[key];
          }
        }
      }
    },

    clearFormFields(form) {
      Object.keys(form).forEach((key) => {
        form[key] = typeof form[key] === typeof [] ? [] : "";
      });
    },

    openEditModal(id) {
      this.modalModelId = id;
      this.editVisible = true;
    },

    getDidsList() {
      if (this.user && this.needsBackendFilter) {
        this.deleteProcessing = true;
        this.$store.commit("dids/clearList");
        this.findNumbers({
          query: {
            tenantId: this.selectedTenant.id,
            allowEmergency: "",
            filter: this.search,
            $limit: this.limit,
            $skip: this.page > 1 ? this.limit * (this.page - 1) : 0,
          },
        }).then((response) => {
          this.limit = response.limit;
          this.pages = Math.ceil(response.total / response.limit);
          this.total = response.total;
          this.page = this.page > this.pages ? 1 : this.page;
          this.deleteProcessing = false;
          if (!this.initialQueryDone && !this.search.length) {
            this.initialQueryDone = true;
            this.needsBackendFilter = this.pages > 1;
          }
        });
      }
    },
    pageNext() {
      if (this.page < this.pages) {
        this.page += 1;
      }
    },
    pagePrevious() {
      if (this.page > 1) {
        this.page -= 1;
      }
    },
    pageSet(page) {
      this.page = page;
    },
  },
  beforeMount() {
    //check context of route so we can show a modal if appropriate
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("context")) {
      const context = urlParams.get("context");
      if (context === "create") {
        this.createVisible = true;
      }
    }
  },
  created() {
    this.getDidsList();
    this.fetchBranchOptions();
  },
  filters: {
    /**
     * Format a number with commas and decimals, or return the original value if NOT a number.
     *
     * @param {string|number} value
     * @return {string|number}
     */
    number(value) {
      return !isNaN(value)
        ? new Intl.NumberFormat("en-US").format(value)
        : value;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/variables";
</style>

