<template>
  <div class="page-table scrollable only-y">
    <!-- DIDs Table -->
    <div class="table-box page-header card-base card-shadow--medium">
      <el-row>
        <el-col :span="12">
          <h1>
            <v-svg class="voxo-green" sprite="phone-number" />
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
          <el-input clearable placeholder="Search" v-model="search" />

          <el-button style="margin-left: 8px" @click="createVisible = true">
            Create
          </el-button>
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
        stripe
        class="voxo-table"
        height="calc(100% - 8em)"
        row-key="id"
        v-loading="isPending"
        @cell-mouse-enter="
          (row) => {
            visibleActionsId = row.id;
          }
        "
        @cell-mouse-leave="
          () => {
            visibleActionsId = '';
          }
        "
        @row-click="
          (row, event, column) => {
            if (column.hasOwnProperty('label')) {
              getNumberProfile(row.id, event, column);
            }
          }
        "
        :data="didsList.data"
      >
        <el-table-column label="" width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-pink">
              <v-svg class="voxo-white" sprite="phone-number" />
            </div>
          </template>
        </el-table-column>

        <el-table-column
          sortable
          label="Number"
          prop="number"
          :formatter="numberFormatter"
        />

        <el-table-column sortable label="Prefix" prop="namePrefix" />

        <el-table-column sortable label="Destination Status" prop="useStatus" />

        <el-table-column label="Tenant" prop="tenantName" />

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

    <!-- Create Modal -->
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
          <h1 class="modal-title col-2">Create Number</h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="createNumber">Create</el-button>
            <el-button type="default" @click="cancelOperation">
              Cancel</el-button
            >
          </div>
        </div>
      </div>

      <el-form>
        <div class="inline-form-group">
          <el-col :span="9">
            <el-input v-model="createForm.number" placeholder="Enter Number">
              <template #prefix>Phone Number</template>
            </el-input>
          </el-col>

          <el-col :span="1"></el-col>

          <el-col :span="14">
            <el-input
              v-model="createForm.callerId"
              placeholder="Enter Caller Id Name"
              v-loading="findingCallerId"
            >
              <template #prefix>Caller Id Name</template>
            </el-input>
          </el-col>
        </div>

        <div class="inline-form-group">
          <el-col>
            <el-select
              v-model="createForm.tenantId"
              :value="createForm.tenantId"
              placeholder="Move to Tenant"
            >
              <template #prefix>Tenant</template>

              <el-option
                v-for="tenant in tenants"
                :key="tenant.id"
                :label="
                  tenant.id === originalTenantId
                    ? `${tenant.name} (current)`
                    : tenant.name
                "
                :value="tenant.id"
              />
            </el-select>
          </el-col>
        </div>
        <el-select
          v-model="createForm.branch"
          :value="createForm.branch"
          placeholder="Select or Add Branch"
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
      </el-form>
    </el-dialog>

    <!-- Edit Modal -->
    <el-dialog
      class="form-modal"
      id="edit-model"
      v-loading="editProcessing"
      @closed="clearFormFields(editForm)"
      :fullscreen="true"
      :modal="false"
      :show-close="false"
      :visible.sync="editVisible"
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
              <template #prefix>Phone Number</template>
            </el-input>
          </el-col>

          <el-col :span="1"></el-col>

          <el-col :span="14">
            <el-input
              v-model="editForm.callerId"
              placeholder="Enter Caller Id Name"
              v-loading="findingCallerId"
            >
              <template #prefix>Caller Id Name</template>
            </el-input>
          </el-col>
        </div>

        <div class="inline-form-group">
          <el-col :span="14">
            <el-input
              v-model="editForm.namePrefix"
              placeholder="Enter Prefix Name"
            >
              <template #prefix>Prefix Name</template>
            </el-input>
          </el-col>

          <el-col :span="1"></el-col>

          <el-col :span="9">
            <el-select
              v-model="editForm.recording"
              :value="editForm.recording"
              placeholder="Select Option"
            >
              <template #prefix>Allow Recording</template>

              <el-option
                v-for="(option, index) in recordingOptions"
                :key="index"
                :label="option"
                :value="option"
              />
            </el-select>
          </el-col>
        </div>

        <div class="inline-form-group">
          <el-col>
            <el-select
              v-model="editForm.tenantId"
              :value="editForm.tenantId"
              placeholder="Move to Tenant"
            >
              <template #prefix>Tenant</template>

              <el-option
                v-for="tenant in tenants"
                :key="tenant.id"
                :label="
                  tenant.id === originalTenantId
                    ? `${tenant.name} (current)`
                    : tenant.name
                "
                :value="tenant.id"
              />
            </el-select>
          </el-col>
        </div>

        <el-select
          v-model="editForm.branch"
          :value="editForm.branch"
          placeholder="Select or Add Branch"
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
            icon="el-icon-delete"
            type="danger"
            @click="deleteRecord(modalModelId)"
          />
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import debounce from "lodash/debounce";
import { mapActions, mapGetters } from "vuex";
import feathersClient from "../../../feathers/feathers-client";
import stateList from "../../../ref/states";

export default {
  name: "TenantPhoneNumbers",

  computed: {
    ...mapGetters("dids", {
      getNumbersList: "find",
      numberProfile: "get",
    }),

    ...mapGetters("tenants", {
      tenantList: "find",
    }),

    selectedTenant() {
      return this.$store.state.selectedTenant;
    },

    /**
     * Reactive list of DIDs.
     *
     * @return {array}
     */
    didsList() {
      return this.getNumbersList({ query: {} });
    },

    /**
     * Is "fetch" action pending?
     *
     * @return {boolean}
     */
    isPending() {
      return this.$store.state.dids.isFindPending;
    },

    /**
     * Reactive list of tenants.
     *
     * @return {array}
     */
    tenants() {
      return this.tenantList().data;
    },
  },

  created() {
    this.getDidsList();
    this.fetchBranchOptions();
  },

  data() {
    return {
      // CRUD Functionality
      branchOptions: [],
      areaOptions: "",
      createProcessing: false,
      createVisible: false,
      deleteProcessing: false,
      editProcessing: false,
      editVisible: false,
      findingCallerId: false,
      numbersLoading: false,
      numberOptions: [],
      optionsLoading: false,
      originalCallerId: "",
      originalTenantId: "",
      rateCenters: "",
      recordingOptions: ["yes", "no"],
      state: stateList,
      visibleActionsId: "",

      // Forms
      createForm: {
        callerId: "",
        number: "",
        tenantId: "",
        branch: "",
      },
      editForm: {
        callerId: "",
        callerIdUpdated: false,
        namePrefix: "",
        number: "",
        recording: "",
        tenantId: "",
        branch: "",
      },

      // Pagination
      limit: 50,
      page: 1,
      pages: 1,
      search: "",
      total: 0,
    };
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

  methods: {
    ...mapActions("extensions", {
      findExtensions: "find",
    }),
    ...mapActions("dids", {
      createNumbers: "create",
      findNumbers: "find",
      patchNumber: "patch",
      removeNumber: "remove",
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

    /**
     * Close create/edit form on "Cancel".
     *
     * @return {void}
     */
    cancelOperation() {
      this.$confirm("Cancel Operation?", "Warning", {
        cancelButtonText: "No",
        confirmButtonText: "Yes",
        type: "warning",
      })
        .then(() => {
          this.createVisible = false;
          this.editVisible = false;
          this.clearFormFields(this.createForm);
          this.numberOperations = [];
          this.originalCallerId = "";
          this.originalTenantId = "";
        })
        .catch(() => {
          return true;
        });
    },

    /**
     * Clear values of respective form.
     *
     * @param {string} form
     * @return {void}
     */
    clearFormFields(form) {
      Object.keys(form).forEach((key) => {
        form[key] = typeof form[key] === typeof [] ? [] : "";
      });
    },

    /**
     * Manually add phone number to tenant.
     *
     * @return {void}
     */
    createNumber() {
      const data = {
        tenantId: this.createForm.tenantId,
        numbers: [this.createForm.number],
        orderType: "MANUAL",
      };

      this.$confirm("Create New Number?", "Warning", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      })
        .then(() => {
          this.createProcessing = true;
          this.createNumbers(data)
            .then(() => {
              this.$notify({
                message: "Number successfully created!",
                title: "Success",
                type: "success",
              });
            })
            .catch((error) => {
              if (error.hasOwnProperty("errors")) {
                this.$notify({
                  message: error.errors[Object.keys(error.errors)[0]],
                  title: error.message,
                  type: "error",
                });
              } else {
                this.$notify({
                  message: error.message,
                  title: error.name,
                  type: "error",
                });
              }
            });
        })
        .finally(() => {
          this.createProcessing = false;
          this.createVisible = false;
        })
        .catch(() => true);
    },

    /**
     * Prompt user to confirm action of deleting record.
     *
     * @param {int} id
     * @return {void}
     */
    deleteRecord(id) {
      if (!this.editVisible) {
        this.deleteProcessing = true;
      }

      this.editProcessing = true;

      const didRecord = this.numberProfile(id);
      let message = "";

      if (didRecord.useStatus === "Unavailable") {
        message = `Are You Sure? This number is assigned to something in a tenant's account.
            Once you delete this number it will not be able to be retrieved again.`;
      } else {
        message = "Permanently Delete This Number?";
      }

      this.deleteProcessing = false;
      this.$confirm(message, {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning",
      }).then(() => {
        if (!this.editVisible) {
          this.deleteProcessing = true;
        }

        this.removeNumber(id)
          .then(() => {
            this.$notify({
              message: "Phone Number Successfully Removed!",
              title: "Success",
              type: "success",
            });

            this.editVisible = false;
          })
          .catch((error) => {
            this.$notify({
              message: error.message,
              title: error.name,
              type: "error",
            });
          })
          .finally(() => {
            this.deleteProcessing = false;
            this.editProcessing = false;
          });
      });
    },

    /**
     * Return list of all active DIDs for all tenants.
     *
     * @return {void}
     */
    getDidsList() {
      this.$store.commit("dids/clearList");
      this.findNumbers({
        query: {
          $limit: this.limit,
          $skip: this.page > 1 ? this.limit * (this.page - 1) : 0,
          allowEmergency: "",
          filter: this.search,
        },
      }).then((response) => {
        this.limit = response.limit;
        this.pages = Math.ceil(response.total / response.limit);
        this.total = response.total;

        this.page = this.page > this.pages ? 1 : this.page;
      });
    },

    /**
     * Retrieve number profile for editing.
     *
     * @param {int} id
     * @return {void}
     */
    getNumberProfile(id) {
      const currentRecord = this.numberProfile(id);
      this.populateFields(currentRecord);
      this.originalTenantId = this.editForm.tenantId;

      this.editVisible = true;
      this.modalModelId = id;
      this.findingCallerId = true;

      const numberOrderingService = feathersClient.service("tn-ordering");
      const params = {
        query: {
          context: "numberDetails",
          number: this.editForm.number,
        },
      };

      numberOrderingService
        .find(params)
        .then((response) => {
          this.editForm.callerId = response[0].tnFeature.callerId.callingName;
          this.originalCallerId = response[0].tnFeature.callerId.callingName;
          this.editForm.branch = response[0].tnFeature.callerId.branch;
          this.findingCallerId = false;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
          this.findingCallerId = false;
        });
    },

    /**
     * Format number to US Standard.
     *
     * @param {Object[]} row
     * @return {void}
     */
    numberFormatter(row) {
      return row.number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },

    /**
     * Open edit model.
     *
     * @param {int} id
     * @return {void}
     */
    openEditModal(id) {
      this.modalModelId = id;
      this.editVisible = true;
    },

    /**
     * Retrieve next page.
     *
     * @return {void}
     */
    pageNext() {
      if (this.page < this.pages) {
        this.page += 1;
      }
    },

    /**
     * Retrieve previous page.
     *
     * @return {void}
     */
    pagePrevious() {
      if (this.page > 1) {
        this.page -= 1;
      }
    },

    /**
     * Retrieve specific page by number.
     *
     * @param {int} page
     * @return {void}
     */
    pageSet(page) {
      this.page = page;
    },

    /**
     * Populate form fields for editing.
     *
     * @param {Object[]} record
     * @return {void}
     */
    populateFields(record) {
      for (let key in record) {
        if (record.hasOwnProperty(key) && this.editForm.hasOwnProperty(key)) {
          this.editForm[key] = record[key];
        }
      }
    },

    /**
     * Prompt user when updating record and then do the thing.
     *
     * @return {void}
     */
    updateNumber() {
      this.editForm.callerIdUpdated =
        this.editForm.callerId !== this.originalCallerId;

      this.$confirm("Update Phone Number Details?", "Warning", {
        cancelButtonText: "Cancel",
        confirmButtonText: "Update",
      }).then(() => {
        let data = { ...this.editForm };
        this.editProcessing = true;
        delete data.number;

        this.patchNumber([this.modalModelId, data])
          .then((res) => {
            this.$notify({
              message: `${res.number} has been updated!`,
              title: "Success",
              type: "success",
            });

            this.editVisible = false;
          })
          .catch((error) => {
            if (error.hasOwnProperty("errors")) {
              this.$notify({
                message: error.errors[Object.keys(error.errors)[0]],
                title: error.message,
                type: "error",
              });
            } else {
              this.$notify({
                message: error.message,
                title: error.name,
                type: "error",
              });
            }
          })
          .finally(() => {
            this.editProcessing = false;
          });
      });
    },
  },

  watch: {
    page: debounce(function () {
      this.getDidsList();
    }, 500),
    search: debounce(function () {
      this.getDidsList();
    }, 500),
  },
};
</script>
