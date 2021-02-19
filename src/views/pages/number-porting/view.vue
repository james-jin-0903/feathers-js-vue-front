<template>
  <div class="page-table scrollable only-y">

    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="voxo-aqua" sprite="call-forward"/>
        Port Requests
      </h1>
      <div class="flex">
        <div class="box">
          <el-input
            v-model="search"
            placeholder="Search"
            clearable>
          </el-input>
        </div>
        <div class="box right">
          <el-button class="table-button-excel" @click="exportTable">Export to Excel</el-button>
          <el-button @click="createVisible = true">New Port Request</el-button>
        </div>
      </div>
      <el-table
        :data="filteredData()"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        @row-click="(row, event, column) => { if(column.hasOwnProperty('label')){getOrder(row.orderId)}}"
        v-loading="tableLoading"
        :default-sort="{prop: 'orderStatus', order: 'descending'}"
        stripe
        class="voxo-table">
        <el-table-column
          label=""
          width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-aqua">
              <v-svg class="voxo-white" sprite="call-forward"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="orderId"
          label="Order Number"
          sortable>
        </el-table-column>
        <el-table-column
          prop="orderStatus"
          label="Order Status"
          sortable>
        </el-table-column>
        <el-table-column
          prop="desiredDueDate"
          label="Desired Port Date"
          :formatter="portDateFormat"
          width="175px"
          sortable>
        </el-table-column>
        <el-table-column
          label="Next Port Date"
          :formatter="nextPortDate"
          width="175px"
          sortable>
        </el-table-column>
        <el-table-column
          width="150px"
          label="TN Status"
          sortable>
          <template slot-scope="scope">
            <el-button class="tn-status-btn">
              <span class="status-complete" v-if="numberComplete(scope.row)">
                <el-tag>{{ numberComplete(scope.row) }}</el-tag>
              </span>
              <span class="status-confirmed" v-if="numberConfirmed(scope.row)">
                <el-tag type="success">{{ numberConfirmed(scope.row) }}</el-tag>
              </span>
              <span class="status-pending" v-if="numberPending(scope.row)">
                <el-tag type="warning">{{ numberPending(scope.row) }}</el-tag>
              </span>
              <span class="status-rejected" v-if="numberRejected(scope.row)">
                <el-tag type="danger">{{ numberRejected(scope.row) }}</el-tag>
              </span>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <el-button
              :id="'activate-'+scope.row.orderId"
              v-if="activationsAvail(scope.row)"
              @click="activatePortOrder(scope.row.orderId)">
              Activate {{ activationsNumber(scope.row) }} Numbers
            </el-button>
          </template>
        </el-table-column>
        <el-table-column width="100px">
          <template slot-scope="scope">
            <div
              :id="'actions-'+ scope.row.orderId"
              class="table-actions"
              v-if="visibleActionsId === scope.row.orderId && editableOrder(scope.row.orderStatus)">
              <el-button
                :id="'edit-'+ scope.row.orderId"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click="getOrder(scope.row.orderId)">
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <DialogComponent
      id="edit-modal"
      class="form-modal"
      :visible.sync="editVisible"
      :fullscreen="true"
      :show-close="false"
      :modal="false"
      v-loading="processing">
      <div id="edit-modal-header" class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">
            View / Edit Port Request
          </h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="submitOrderEdit" v-if="editMade">Submit</el-button>
            <el-button type="default" @click="cancelOperation"> Cancel</el-button>
          </div>
        </div>
      </div>
      <el-form>
        <h2 class="form-section-header">
          Order Number Summary - {{ modalModelId }}
        </h2>
        <el-table
          :data="editOrderData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
          class="modal-summary-table mb-10"
          :default-sort="{prop: 'tnStatus'}"
          height="250px"
          stripe>
          <el-table-column
            prop="telephoneNumber"
            label="Number"
            :formatter="numberFormatter"
            sortable>
          </el-table-column>
          <el-table-column
            prop="tnStatus"
            label="Status"
            sortable>
          </el-table-column>
          <el-table-column>
            <template slot-scope="scope">
              <el-button
                @click="editingNumber(scope.row)"
                v-if="editableNumber(scope.row.tnStatus)">
                View / Edit
              </el-button>
            </template>
          </el-table-column>
          <el-table-column
            label=""
            width="60px">
            <template slot-scope="scope">
              <div class="voxo-square-icon" v-if="processedEdits.includes(scope.row.telephoneNumber)">
                <v-svg class="voxo-green" sprite="check"/>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <div class="order-note mt-10">
        <el-button icon="el-icon-edit" @click="noteFieldActive = !noteFieldActive"></el-button>
        <span class="black-text pl-10">Add Order Note</span>
        <el-input
          type="textarea"
          placeholder="Enter Order Notes"
          v-if="noteFieldActive"
          v-model="editNumberForm.orderNote"
          @change="editedOrderNote"
          :autosize="{ minRows: 4}">
        </el-input>
      </div>
      <div class="order-notes" v-if="editNumberForm.orderNotes">
        <el-button icon="el-icon-tickets" @click="viewNotesActive = !viewNotesActive"></el-button>
        <span class="black-text pl-10">View Order Notes</span>
        <div class="notes-container" v-if="viewNotesActive">
          <div class="note-item black-text"
               v-for="note in editNumberForm.orderNotes"
               :key="note.noteId">
            <p class="note-message">
              {{ note.insertUser }} - {{ note.insertDate }}
              <br>
              <span class="pt-5">{{ note.note }}</span>
            </p>
          </div>
        </div>
      </div>
      <div class="port-edit-container" v-show="orderIsEditable">

        <h2 class="form-section-header">
          Edit Requested Port Date - {{ editNumberForm.currentPortDate }}
        </h2>
        <div class="inline-form-group">
          <el-col :span="9">
            <el-date-picker
              v-model="editNumberForm.portDate"
              type="date"
              :editable="false"
              :picker-options="datePickerOptions"
              @change="editedPortDate"
              placeholder="New Desired Port Date">
            </el-date-picker>
          </el-col>
        </div>

        <div v-show="editNumberFormVisible">
          <h2 class="form-section-header" v-if="editNumberFormVisible">
            Edit Order Details - {{ prettyNumber(editNumberForm.telephoneNumber) }}
          </h2>
          <div class="inline-form-group">
            <el-col :span="9">
              <el-tooltip
                class="item"
                effect="dark"
                content="This is the person that is authorized to make changes on the account"
                placement="top">
                <el-input v-model="editNumberForm.authName" placeholder="Enter Authorized Person">
                  <template slot="prefix">Authorized Person</template>
                </el-input>
              </el-tooltip>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="8">
              <el-tooltip
                class="item"
                effect="dark"
                content="Account number is only required if it is displayed on your monthly bill"
                placement="top">
                <el-input v-model="editNumberForm.accountNum" placeholder="Enter Account Number">
                  <template slot="prefix">Account #</template>
                </el-input>
              </el-tooltip>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="6">
              <el-tooltip
                class="item"
                effect="dark"
                content="Pin number for the account. May Not Be Required"
                placement="top">
                <el-input v-model="editNumberForm.accountPin" placeholder="Enter Account PIN">
                  <template slot="prefix">Account PIN</template>
                </el-input>
              </el-tooltip>
            </el-col>
          </div>
          <div class="inline-form-group">
            <el-col :span="14">
              <el-input v-model="editNumberForm.name" placeholder="Enter Company Name">
                <template slot="prefix">Company Name</template>
              </el-input>
            </el-col>
            <el-col :span="1"></el-col>
            <el-col :span="9">
              <el-input v-model="editNumberForm.atn" placeholder="Enter BTN">
                <template slot="prefix">BTN</template>
              </el-input>
            </el-col>
          </div>
          <el-input name="autoAddressEdit" v-model="address" placeholder="Search For Address">
            <template slot="prefix">Search Address</template>
          </el-input>
          <div class="address-fields">
            <div class="inline-form-group">
              <el-col :span="8">
                <el-input v-model="editNumberForm.streetNum" placeholder="Enter Street #">
                  <template slot="prefix">Street Number</template>
                </el-input>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="15">
                <el-input v-model="editNumberForm.streetInfo" placeholder="Enter Street Name">
                  <template slot="prefix">Street Name</template>
                </el-input>
              </el-col>
            </div>
            <div class="inline-form-group">
              <el-col :span="8">
                <el-select
                  v-model="editNumberForm.locationType"
                  :value="editNumberForm.locationType"
                  placeholder="Location Type">
                  <template slot="prefix">Building / Suite</template>
                  <el-option
                    v-for="(location, index) in locationOptions"
                    :key="index"
                    :label="location"
                    :value="location">
                  </el-option>
                </el-select>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="15">
                <el-input v-model="editNumberForm.locationNumber" placeholder="Enter Building/Suite #">
                  <template slot="prefix">Building / Suite #</template>
                </el-input>
              </el-col>
            </div>
            <div class="inline-form-group">
              <el-col :span="11">
                <el-input v-model="editNumberForm.city" placeholder="Enter City">
                  <template slot="prefix">City</template>
                </el-input>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="5">
                <el-input v-model="editNumberForm.state" placeholder="Enter State">
                  <template slot="prefix">State</template>
                </el-input>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="6">
                <el-input v-model="editNumberForm.postalCode" placeholder="Enter Zip">
                  <template slot="prefix">Zip Code</template>
                </el-input>
              </el-col>
            </div>
          </div>
          <div class="form-comment-header black-text" v-if="multipleNumbersEditable">
            Also Apply To:
            <el-checkbox class="check-all" @change="editCheckAll" v-model="editNumberForm.checkAll">
              Check All
            </el-checkbox>
          </div>
          <el-checkbox-group class="number-check-group" v-model="editNumberForm.checkedNumbers">
            <div class="checkbox-item"
                 v-for="numberGroup in editOrderData"
                 :key="numberGroup.telephoneNumber"
                 v-if="editableNumber(numberGroup.tnStatus) && numberGroup.telephoneNumber !== editNumberForm.telephoneNumber">
              <el-checkbox :label="numberGroup.telephoneNumber" @change="checkOtherChange">
                <span class="black-text">{{ prettyNumber(numberGroup.telephoneNumber) }}</span>
              </el-checkbox>
            </div>
          </el-checkbox-group>

          <div class="button-group">
            <el-button @click="submitNumberEdit">
              Submit Edits
            </el-button>
          </div>
        </div>
      </div>

    </DialogComponent>

    <DialogComponent
      id="create-modal"
      class="form-modal"
      :visible.sync="createVisible"
      :fullscreen="true"
      :show-close="false"
      :modal="false">
      <div id="create-modal-header" class="modal-header">
        <div class="modal-header-layout flex grid-6 align-center">
          <h1 class="modal-title col-2">
            New Port Request
          </h1>
          <div class="modal-actions col-2">
            <el-button type="primary" @click="newRequest" v-if="lastNumberGroup">Submit</el-button>
            <el-button type="default" @click="cancelOperation"> Cancel</el-button>
          </div>
        </div>
      </div>
      <el-form>
        <el-steps :active="activeStep" finish-status="success">
          <el-step></el-step>
          <el-step></el-step>
          <el-step></el-step>
        </el-steps>
        <div id="step-1" v-if="activeStep == 0" v-loading="processing">
          <el-input type="textarea" placeholder="Enter Numbers One Per Line" v-model="createForm.portNumbers"
                    :autosize="{ minRows: 4}">
          </el-input>
          <div class="button-group">
            <el-button type="default" @click="portAvail">Submit</el-button>
          </div>
        </div>
        <div id="step-2" v-if="activeStep == 1">
          <el-form>
            <div class="button-group">
              <el-button icon="el-icon-arrow-left" type="default" @click="stepBack">Back</el-button>
              <el-button type="default" @click="stepForward" v-if="portSummaryData.length">Next <i
                class="el-icon-arrow-right el-icon-right"></i></el-button>
            </div>
            <h2 class="form-section-header" v-if="portSummaryData.length">
              Portable Number Summary
            </h2>
            <el-table
              :data="portSummaryData.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
              class="modal-summary-table"
              height="400px"
              v-if="portSummaryData.length"
              stripe>
              <el-table-column
                prop="telephoneNumber"
                label="Phone Number"
                :formatter="numberFormatter"
                sortable>
              </el-table-column>
              <el-table-column
                prop="serviceProviderName"
                label="Current Provider"
                sortable>
              </el-table-column>
              <el-table-column
                label=""
                width="60px">
                <template slot-scope="scope">
                  <div class="voxo-square-icon">
                    <v-svg class="voxo-green" sprite="check"/>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <h2 class="form-section-header" v-if="unportableSummary.length">
              Unportable Numbers
            </h2>
            <el-table
              :data="unportableSummary.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase()))"
              class="modal-summary-table"
              v-if="unportableSummary.length"
              stripe>
              <el-table-column
                prop="telephoneNumber"
                label="Phone Number"
                :formatter="numberFormatter"
                sortable>
              </el-table-column>
              <el-table-column
                prop="notPortableReason"
                label="Reason"
                sortable>
              </el-table-column>
              <el-table-column
                label=""
                width="50px">
                <template slot-scope="scope">
                  <div class="voxo-square-icon">
                    <v-svg class="voxo-red" sprite="cross"/>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-form>
        </div>
        <div id="step-3" v-show="activeStep == 2" v-loading="processing">
          <el-form>
            <h2 class="form-section-header">Current Group {{ currentGroupNumber }} / {{ this.csrGroupCount }}</h2>
            <div class="group-number-list">
              <el-table
                :data="tableNumbers"
                class="modal-summary-table mb-10"
                height="250px"
                stripe>
                <el-table-column
                  label="Pretty Number"
                  sortable>
                  <template slot-scope="scope">
                    {{ prettyNumber(scope.row.number) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="button-group">
              <el-button type="default" @click="stepBack" v-if="currentGroupNumber === 1">Back to Number Summary
              </el-button>
              <el-button type="default" @click="stepBack" v-if="currentGroupNumber > 1">Prev Group</el-button>
              <el-button type="default" @click="stepForward" v-if="!lastNumberGroup">Next Group</el-button>
            </div>
            <div class="successful-csr-message black-text form-section-header" v-if="noResultsGroupActive">
              Automated CSR Lookup Not Available. Use Existing Or Enter Your Information.
            </div>
            <div class="address-radio-group button-group" v-if="noResultsGroupActive">
              <div class="radio-button-group" v-for="(option,index) in createForm.csrAddressOptions" :key="index">
                <el-radio class="black-text" v-model="createForm.addressRadio" :label="index"
                          @change="fillAddressFromExisting" border>
                  Use {{ option.csrLookupResult.endUser + ' ' + option.csrLookupResult.endUserAddress }}
                </el-radio>
              </div>
              <div class="radio-button-group">
                <el-radio class="black-text" v-model="createForm.addressRadio" label="None"
                          @change="fillAddressFromExisting" v-if="this.createForm.csrAddressOptions.length" border>
                  Enter My Own Info / Clear Fields
                </el-radio>
              </div>
            </div>
            <div class="successful-csr-message black-text form-section-header" v-if="!noResultsGroupActive">
              Automated CSR Lookup Was Successful. Available Data Is Populated For You
            </div>
            <h2 class="form-section-header">
              Account Details
            </h2>
            <div class="inline-form-group">
              <el-col :span="9">
                <el-tooltip
                  class="item" effect="dark"
                  content="This is the person that is authorized to make changes on the account"
                  placement="top">
                  <el-input v-model="createForm.authorizedPerson" placeholder="Enter Authorized Person">
                    <template slot="prefix">Authorized Person</template>
                  </el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="8">
                <el-tooltip
                  class="item" effect="dark"
                  content="Account number is only required if it is displayed on your monthly bill"
                  placement="top">
                  <el-input v-model="createForm.accountNumber" placeholder="Enter Account Number">
                    <template slot="prefix">Account #</template>
                  </el-input>
                </el-tooltip>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="6">
                <el-tooltip
                  class="item" effect="dark"
                  content="Pin number for the account. May Not Be Required"
                  placement="top">
                  <el-input v-model="createForm.accountPin" placeholder="Enter Account PIN">
                    <template slot="prefix">Account PIN</template>
                  </el-input>
                </el-tooltip>
              </el-col>

            </div>
            <div class="inline-form-group">
              <el-col :span="14">
                <el-input v-model="createForm.companyName" placeholder="Enter Company Name">
                  <template slot="prefix">Company Name</template>
                </el-input>
              </el-col>
              <el-col :span="1"></el-col>
              <el-col :span="9">
                <el-date-picker
                  v-model="createForm.portDate"
                  type="date"
                  :default-value="defaultDate()"
                  :editable="false"
                  :picker-options="datePickerOptions"
                  :disabled="this.currentGroupNumber > 1"
                  placeholder="Desired Port Date"
                  v-show="this.currentGroupNumber === 1">
                </el-date-picker>
              </el-col>
            </div>
            <h2 class="form-section-header">
              Address
            </h2>
            <el-input name="autoAddressCreate" v-model="address" placeholder="Search For Address">
              <template slot="prefix">Search Address</template>
            </el-input>
            <div class="address-fields" v-show="addressFieldsActive">
              <div class="inline-form-group">
                <el-col :span="8">
                  <el-input v-model="createForm.streetNum" placeholder="Enter Street #">
                    <template slot="prefix">Street Number</template>
                  </el-input>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="15">
                  <el-input v-model="createForm.streetInfo" placeholder="Enter Street Name">
                    <template slot="prefix">Street Name</template>
                  </el-input>
                </el-col>
              </div>
              <div class="inline-form-group">
                <el-col :span="8">
                  <el-select v-model="createForm.locationType" placeholder="Location Type">
                    <template slot="prefix">Building / Suite</template>
                    <el-option v-for="(location, index) in locationOptions" :key="index" :label="location"
                               :value="location"></el-option>
                  </el-select>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="15">
                  <el-input v-model="createForm.locationNumber" placeholder="Enter Building/Suite #">
                    <template slot="prefix">Building / Suite #</template>
                  </el-input>
                </el-col>
              </div>
              <div class="inline-form-group">
                <el-col :span="11">
                  <el-input v-model="createForm.city" placeholder="Enter City">
                    <template slot="prefix">City</template>
                  </el-input>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="5">
                  <el-input v-model="createForm.state" placeholder="Enter State">
                    <template slot="prefix">State</template>
                  </el-input>
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="6">
                  <el-input v-model="createForm.postalCode" placeholder="Enter Zip">
                    <template slot="prefix">Zip Code</template>
                  </el-input>
                </el-col>
              </div>
            </div>
          </el-form>
        </div>
      </el-form>
    </DialogComponent>
    <div id="places-div" style="display:none;">
      <div></div>
    </div>
  </div>

</template>

<script>

import {mapGetters, mapActions} from 'vuex';
import {exportExcel} from '../../../globals/globals';
import DialogComponent from '../../../components/CustomModalComponent';
import feathersClient from '../../../feathers/feathers-client';
import moment from 'moment';


export default {
  name: 'PortRequestTable',
  components: {DialogComponent},
  data() {
    return {
      activeStep: 0,
      tableData: [],
      tableNumbers: [],
      portSummaryData: [],
      unportableSummary: [],
      editOrderData: [],
      search: '',
      visibleActionsId: '',
      modalModelId: '',
      address: '',
      editVisible: false,
      createVisible: false,
      processing: false,
      tableLoading: false,
      locationOptions: ['BLDG', 'FL', 'STE', 'APT'],
      addressFieldsActive: false,
      lastNumberGroup: false,
      noResultsGroupActive: false,
      csrGroups: {},
      currentCsrGroup: {},
      currentGroupNumber: 1,
      csrGroupCount: '',
      orderValidationFailed: false,
      createForm: {
        portNumbers: '',
        numberArray: [],
        accountNumber: '',
        accountPin: '',
        companyName: '',
        authorizedPerson: '',
        portDate: this.defaultDate(),
        streetNum: '',
        streetInfo: '',
        city: '',
        state: '',
        postalCode: '',
        locationType: '',
        locationNumber: '',
        csrAddressOptions: [],
        addressRadio: ''
      },
      datePickerOptions: {
        disabledDate(time) {
          let checkDate = new Date(time);
          let dateNow = new Date();
          let dateMin = new Date(dateNow);
          dateMin.setDate(dateMin.getDate());
          if (dateMin.getDay() == '0') {
            dateMin.setDate(dateMin.getDate() + 1);
          }
          if (dateMin.getDay() == '6') {
            dateMin.setDate(dateMin.getDate() + 2);
          }
          let weekend = false;
          if (checkDate.getDay() == '0' || checkDate.getDay() == '6') {
            weekend = true;
          }
          if (checkDate >= dateMin && !weekend) {
            return false;
          }
          return true;
        }
      },
      orderData: [],
      gridData: [],
      editNumberForm: {
        accountNum: '',
        accountPin: '',
        trunkGroup: '',
        atn: '',
        authName: '',
        authDate: '',
        portDate: null,
        orderNote: '',
        currentPortDate: '',
        telephoneNumber: '',
        name: '',
        streetNum: '',
        streetInfo: '',
        locationType: '',
        locationNumber: '',
        city: '',
        state: '',
        postalCode: '',
        otherNumbersMap: [],
        checkedNumbers: [],
        checkAll: false,
        orderNotes: [],
      },
      editNumberFormVisible: false,
      processedEdits: [],
      editedOrderData: {
        desiredDueDate: null,
        orderNote: null,
        orderId: ''
      },
      editMade: false,
      orderIsEditable: false,
      multipleNumbersEditable: false,
      noteFieldActive: false,
      viewNotesActive: false
    }
  },
  computed: {
    selectedTenant() {
      return this.$store.state.selectedTenant
    },
    user() {
      return this.$store.state.auth.user
    },
  },
  watch: {
    selectedTenant() {
      this.populateTable();
    },
    user() {
      this.populateTable();
    }
  },
  methods: {
    ...mapActions('number-porting', {tnPortAvailability: 'find', createPortRequest: 'create'}),
    ...mapActions('port-in-orders', {
      getPortOrder: 'get',
      getAllOrders: 'find',
      activateOrder: 'update',
      editOrder: 'patch'
    }),
    exportTable() {
      exportExcel('port-requests');
    },
    numberFormatter(row, column) {
      return row.telephoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },
    filteredData() {
      return this.tableData.filter(data => !this.search
        || data.orderId.toString().toLowerCase().includes(this.search.toLowerCase())
        || data.orderStatus.toLowerCase().includes(this.search.toLowerCase())
        || data.desiredDueDate.toLowerCase().includes(this.search.toLowerCase())
      )
    },

    //New Port Request Methods
    portAvail() {
      this.processing = true;
      const numberArray = this.createForm.portNumbers.split(/\r?\n/);
      let trimmedNumberArray = [];
      let summaryTableNumbers = [];

      numberArray.forEach((d, index) => {
        numberArray[index] = this.formatNumber(d);
      });
      numberArray.forEach((d) => {
        const tollFree = d.match(/^(\+?1)?(8(00|33|44|55|66|77|88)[2-9]\d{6})$/g);
        if (d != '' && tollFree === null) {
          trimmedNumberArray.push(d);
          summaryTableNumbers.push({number: d});
        }
      });
      this.createForm.numberArray = JSON.stringify(trimmedNumberArray);
      this.tableNumbers = summaryTableNumbers;

      //we will check the api for port availability
      let params = {query: {numbers: this.createForm.numberArray}};
      this.tnPortAvailability(params)
        .then(res => {
          let returnedGroups = res;
          let verifiedGroups = [];

          //in case a no results group is returned with only not portable numbers we don't include as an order group
          for (let i = 0; i < returnedGroups.length; i++) {
            let portableCount = 0;
            for (let k = 0; k < returnedGroups[i]['numbers'].length; k++) {
              if (returnedGroups[i]['numbers'][k].isPortable) {
                portableCount++;
              }
            }
            if (portableCount) {
              verifiedGroups.push(returnedGroups[i]);
            }
          }
          this.csrGroups = verifiedGroups;

          //check available csrlookup options to provide to user for no result group.
          const csrGroupCount = this.csrGroupCount = verifiedGroups.length;
          let csrAddressOptions = [];
          for (let i = 0; i < csrGroupCount; i++) {
            if (res[i]['csrGroup'] !== 'noResult') {
              let groupObject = {
                csrLookupResult: JSON.parse(res[i]['csrGroup']),
                id: res[i]['id']
              };
              csrAddressOptions.push(groupObject);
            }
          }
          this.createForm.csrAddressOptions = csrAddressOptions;

          //build the port summary tables
          this.processing = false;
          let portableNumbers = [];
          let notPortable = [];
          let portableNumberArray = [];

          for (let i = 0; i < res.length; i++) {
            for (let k = 0; k < res[i]['numbers'].length; k++) {
              if (!res[i]['numbers'][k].isPortable) {
                notPortable.push(res[i]['numbers'][k]);
              } else {
                portableNumbers.push(res[i]['numbers'][k]);
                portableNumberArray.push(res[i]['numbers'][k].telephoneNumber)
              }
            }
          }
          this.portSummaryData = portableNumbers;
          this.unportableSummary = notPortable;
          //clear list to avoid storing old results
          this.$store.commit('number-porting/clearList');
          if (this.activeStep++ > 2) this.active = 2;
        })
        .catch(error => {
          console.log(error);
          this.$notify({
            title: error.name,
            message: error.message,
            type: 'error'
          });
          this.processing = false;
        });
    },

    async submitOrderObject(data) {

      const message = this.lastNumberGroup ? 'Submit Group and Order with Desired Port Date of ' + this.createForm.portDate.toDateString() + '?' : 'Submit Number Group For Porting?';
      const successMessage = this.lastNumberGroup ? 'Port Order Request Created!' : 'Group Added to Order';

      let group = {
        accountNumber: data.accountNumber,
        accountPin: data.accountPin,
        authorizedPerson: data.authorizedPerson,
        city: data.city,
        companyName: data.companyName,
        location: data.locationType + ' ' + data.locationNumber,
        numberArray: data.numberArray,
        portDate: data.portDate,
        postalCode: data.postalCode,
        state: data.state,
        streetInfo: data.streetInfo,
        streetNum: data.streetNum,
        tenantId: this.selectedTenant.id
      };

      await this.$confirm(message, 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel'
      })
        .then(async () => {

          //validate the object first and throw error. if good push to order.
          const params = {query: {context: 'validateOrderObject', formData: group}};
          await this.tnPortAvailability(params)
            .then(() => {
              if (!this.lastNumberGroup) {
                this.$notify({
                  title: successMessage,
                  type: 'success'
                });
              }
              this.orderValidationFailed = false;
              this.orderData[this.currentGroupNumber - 1] = group;
            })
            .catch(error => {
              this.orderValidationFailed = true;
              this.$notify({
                title: error.name,
                message: error.message,
                type: 'error'
              });
            })
        }).catch(() => true);
    },

    async newRequest() {
      //first push result of number group to our data object
      await this.submitOrderObject(this.createForm);
      if(!this.orderValidationFailed){
        this.processing = true;
        this.createPortRequest([this.orderData, []])
          .then(() => {
            this.processing = false;
            this.$notify({
              title: 'Success',
              message: 'Port Request has been created!',
              type: 'success'
            });
            this.clearFormFields(this.createForm);
            this.createVisible = false;
            this.createForm.portDate = this.defaultDate();
          })
          .catch(error => {
            if (error.hasOwnProperty('errors')) {
              this.$notify({
                title: error.message,
                message: error.errors[Object.keys(error.errors)[0]],
                type: 'error'
              });
            } else {
              this.$notify({
                title: error.name,
                message: error.message,
                type: 'error'
              });
            }
            this.processing = false;
          })
      }

    },

    //editing an existing order
    editableOrder(status) {
      if (status === 'Pending' || status === 'Rejected') {
        return true;
      }
    },

    editCheckAll(value) {
      console.log(value);
      if (value) {
        console.log('checking all');
        this.editNumberForm.checkedNumbers = [];
        for (let i = 0; i < this.editOrderData.length; i++) {
          const tn = this.editOrderData[i].telephoneNumber;
          if (this.editNumberForm.telephoneNumber !== tn) {
            this.editNumberForm.checkedNumbers.push(tn)
          }
        }
      } else {
        this.editNumberForm.checkedNumbers = [];
      }
    },

    checkOtherChange(value) {
      if (!value) {
        this.editNumberForm.checkAll = false;
      }
      const checkedLength = this.editNumberForm.checkedNumbers.length;
      let editGroupLength = this.editOrderData.length - 1;

      if (checkedLength === editGroupLength) {
        this.editNumberForm.checkAll = true;
      }
    },

    getOrder(orderId) {

      this.modalModelId = orderId;
      this.editVisible = true;
      this.processing = true;

      this.getPortOrder(orderId)
        .then(res => {
          this.processing = false;
          this.editOrderData = res.tnGroups;
          this.editNumberForm.orderNotes = res.orderNotes;
          this.editNumberForm.currentPortDate = res.desiredDueDate.split('T')[0];
          let count = 0;
          const uneditableStatus = ['Complete', 'Received FOC'];
          for (let i = 0; i < this.editOrderData.length; i++) {
            if (!uneditableStatus.includes(this.editOrderData[i].tnStatus)) {
              count++;
              this.orderIsEditable = true;
            }
            if (count > 1) {
              this.multipleNumbersEditable = true;
              break;
            }
          }
        })
        .catch(error => {
          this.processing = false;
        });

    },

    editableNumber(status) {
      const uneditableStatus = ['Complete', 'Received FOC'];
      if (!uneditableStatus.includes(status)) {
        return true;
      }
      return false;
    },

    editingNumber(item) {

      if (this.editedOrderData.hasOwnProperty(item.telephoneNumber)) {
        this.editNumberFormVisible = true;
        this.address = this.editedOrderData[item.telephoneNumber].streetNum + ' ' + this.editedOrderData[item.telephoneNumber].streetName + ' ' + this.editedOrderData[item.telephoneNumber].city + ', ' + this.editedOrderData[item.telephoneNumber].state + ' ' + this.editedOrderData[item.telephoneNumber].postalCode;
        this.editNumberForm.city = this.editedOrderData[item.telephoneNumber].city;
        this.editNumberForm.state = this.editedOrderData[item.telephoneNumber].state;
        this.editNumberForm.postalCode = this.editedOrderData[item.telephoneNumber].postalCode;
        this.editNumberForm.streetNum = this.editedOrderData[item.telephoneNumber].streetNum;
        this.editNumberForm.streetInfo = this.editedOrderData[item.telephoneNumber].streetName;
        this.editNumberForm.locationType = this.editedOrderData[item.telephoneNumber].locationType;
        this.editNumberForm.locationNumber = this.editedOrderData[item.telephoneNumber].locationNumber;
        this.editNumberForm.accountNum = this.editedOrderData[item.telephoneNumber].accountNum;
        this.editNumberForm.accountPin = this.editedOrderData[item.telephoneNumber].accountPin;
        this.editNumberForm.name = this.editedOrderData[item.telephoneNumber].name;
        this.editNumberForm.authName = this.editedOrderData[item.telephoneNumber].authName;
        this.editNumberForm.atn = this.editedOrderData[item.telephoneNumber].atn;
        this.editNumberForm.trunkGroup = item.trunkGroup;
        this.editNumberForm.telephoneNumber = item.telephoneNumber;
      } else {
        this.editNumberFormVisible = true;
        this.address = item.streetNum + ' ' + item.streetPreDir + ' ' + item.streetName + ' ' + item.streetType + ' ' + item.city + ', ' + item.state + ' ' + item.postalCode;
        this.editNumberForm.city = item.city;
        this.editNumberForm.state = item.state;
        this.editNumberForm.postalCode = item.postalCode;
        this.editNumberForm.streetNum = item.streetNum;
        this.editNumberForm.streetInfo = item.streetPreDir + ' ' + item.streetName + ' ' + item.streetType;
        this.editNumberForm.locationType = item.locationType;
        this.editNumberForm.locationNumber = item.locationNumber;
        this.editNumberForm.telephoneNumber = item.telephoneNumber;
        this.editNumberForm.name = item.name;
        this.editNumberForm.authName = item.authName;
        this.editNumberForm.accountNum = item.accountNum;
        this.editNumberForm.accountPin = item.accountPin;
        this.editNumberForm.atn = item.atn;
        this.editNumberForm.trunkGroup = item.trunkGroup
      }
    },

    editedPortDate() {
      if (this.editNumberForm.portDate === null) {
        this.editMade = false;
      } else {
        this.editMade = true;
      }
      this.editedOrderData.desiredDueDate = this.editNumberForm.portDate;
    },

    editedOrderNote() {
      if (this.editNumberForm.orderNote === null || this.editNumberForm.orderNote === '') {
        this.editMade = false;
      } else {
        this.editMade = true;
      }
      this.editedOrderData.orderNote = this.editNumberForm.orderNote;
    },

    async submitNumberEdit() {

      let dateNow = new Date();
      let monthNow = dateNow.getMonth() + 1;
      let dayNow = dateNow.getDate();

      const orderObject = {
        name: this.editNumberForm.name,
        streetNum: this.editNumberForm.streetNum,
        streetName: this.editNumberForm.streetInfo,
        locationType1: this.editNumberForm.locationType,
        locationValue1: this.editNumberForm.locationNumber,
        city: this.editNumberForm.city,
        state: this.editNumberForm.state,
        postalCode: this.editNumberForm.postalCode,
        accountNum: this.editNumberForm.accountNum,
        accountPin: this.editNumberForm.accountPin,
        atn: this.editNumberForm.atn,
        trunkGroup: this.editNumberForm.trunkGroup,
        authName: this.editNumberForm.authName,
        authDate: dateNow.getFullYear() + '-' + monthNow + '-' + dayNow
      };

      //First Validate The Order Data Before We Process The Edit.
      await this.$confirm('Process Edits', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'Cancel'
      })
        .then(async () => {

          //validate the object first and throw error. if good push to order.
          const params = {query: {context: 'validateEditObject', formData: orderObject}};
          await this.tnPortAvailability(params)
            .then(() => {
              this.processedEdits.push(this.editNumberForm.telephoneNumber);
              this.editMade = true;
              this.editedOrderData[this.editNumberForm.telephoneNumber] = orderObject;

              //we will check for any additional numbers and and loop through and add these object too
              const additionalNumbers = this.editNumberForm.checkedNumbers;
              if (additionalNumbers.length) {
                for (let i = 0; i < additionalNumbers.length; i++) {
                  this.editedOrderData[additionalNumbers[i]] = orderObject;
                  this.processedEdits.push(additionalNumbers[i]);
                }
              }

              this.editNumberFormVisible = false;
              this.editNumberForm.checkAll = false;
              this.editNumberForm.checkedNumbers = [];
            })
            .catch(error => {
              if (error.hasOwnProperty('errors')) {
                this.$notify({
                  title: error.message,
                  message: error.data[0]['message'],
                  type: 'error'
                });
              } else {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: 'error'
                });
              }
            })
        })
    },

    submitOrderEdit() {
      this.$confirm('Update Order Details', 'Warning', {
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel'
      })
        .then(() => {
          this.processing = true;
          this.editOrder([this.modalModelId, this.editedOrderData])
            .then(res => {

              this.$notify({
                title: 'Success',
                message: 'Edited Order Submitted',
                type: 'success'
              });

              this.clearFormFields(this.createForm);
              this.editVisible = false;
              this.$store.commit('port-in-orders/clearCurrent');
              this.processing = false;
            })
            .catch(error => {
              if (error.hasOwnProperty('errors')) {
                this.$notify({
                  title: error.message,
                  message: error.errors[Object.keys(error.errors)[0]],
                  type: 'error'
                });
              } else {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: 'error'
                });
              }
              this.processing = false;
            });
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: 'Update Canceled'
          });
        });
    },

    //General Form and Table Operations
    actionsDown() {
      this.visibleActionsId = ''
    },
    actionsUp(row) {
      this.visibleActionsId = row.orderId;
    },

    cancelOperation() {
      this.$confirm('Cancel Operation?', 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      })
        .then(() => {
          this.createVisible = false;
          this.editVisible = false;
          this.clearFormFields(this.createForm);
        }).catch( () => true);
    },

    fillAddressFields(data, type) {
      let locationInfo = {
        street_number: 'short_name',
        route: 'long_name',
        locality: 'long_name',
        administrative_area_level_1: 'short_name',
        postal_code: 'short_name'
      };

      let locationObject = {
        street_number: '',
        route: '',
        locality: '',
        administrative_area_level_1: '',
        postal_code: ''
      };

      for (let i = 0; i < data.length; i++) {
        let addressType = data[i].types[0];
        if (locationInfo[addressType]) {
          locationObject[addressType] = data[i][locationInfo[addressType]];
        }
      }

      //here we will update our address object sent with the request
      if (type === 'create') {
        this.createForm.streetNum = locationObject['street_number'];
        this.createForm.streetInfo = locationObject['route'];
        this.createForm.city = locationObject['locality'];
        this.createForm.state = locationObject['administrative_area_level_1'];
        this.createForm.postalCode = locationObject['postal_code'];
        this.address = locationObject['street_number'] + ' ' + locationObject['route'] + ' ' + locationObject['locality'] + ', ' + locationObject['administrative_area_level_1'] + ' ' + locationObject['postal_code'];
        this.addressFieldsActive = true;
      }

      if (type === 'edit') {
        this.editNumberForm.streetNum = locationObject['street_number'];
        this.editNumberForm.streetInfo = locationObject['route'];
        this.editNumberForm.city = locationObject['locality'];
        this.editNumberForm.state = locationObject['administrative_area_level_1'];
        this.editNumberForm.postalCode = locationObject['postal_code'];
        this.address = locationObject['street_number'] + ' ' + locationObject['route'] + ' ' + locationObject['locality'] + ', ' + locationObject['administrative_area_level_1'] + ' ' + locationObject['postal_code'];
        this.addressFieldsActive = true;
      }

    },

    fillAddressFromExisting(index) {

      if (index !== 'None') {
        //use csr lookup result if we got one to autofill fields for step 3
        const csr = this.createForm.csrAddressOptions[index].csrLookupResult;

        if (Object.keys(csr).length) {
          this.addressFieldsActive = true;
          //if csr lookup comes back without address components request google place
          if (csr.streetNum == '') {
            this.createForm.accountNumber = csr.accountNum;
            this.createForm.authorizedPerson = csr.authName;
            this.createForm.companyName = csr.endUser;
            const input = csr.endUserAddress + ' ' + csr.city + ' ' + csr.state + ' ' + csr.postalCode;
            let placesService = new google.maps.places.PlacesService(document.getElementById('places-div'));
            placesService.findPlaceFromQuery({query: input, fields: ['place_id']}, (results, status) => {
              placesService.getDetails({
                placeId: results[0].place_id,
                fields: ['address_component']
              }, (result, status) => {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  this.fillAddressFields(result.address_components);
                }
              });
            });
          } else {
            this.createForm.accountNumber = csr.accountNum;
            this.createForm.authorizedPerson = csr.authName;
            this.createForm.companyName = csr.endUser;
            this.createForm.streetNum = csr.streetNum;
            this.address = csr.endUserAddress;
            this.createForm.streetInfo = csr.streetPreDir + ' ' + csr.streetName + ' ' + csr.streetType;
            this.createForm.city = csr.city;
            this.createForm.state = csr.state;
            this.createForm.postalCode = csr.postalCode;
            this.createForm.locationNumber = csr.locationValue1;
            this.createForm.locationType = csr.locationType1;
          }

        }
      } else {
        this.createForm.accountNumber = '';
        this.createForm.authorizedPerson = '';
        this.createForm.companyName = '';
        this.createForm.streetNum = '';
        this.address = '';
        this.createForm.streetInfo = '';
        this.createForm.city = '';
        this.createForm.state = '';
        this.createForm.postalCode = '';
        this.createForm.locationNumber = '';
        this.createForm.locationType = '';
        this.addressFieldsActive = false;
      }

    },

    fillAddressFromCSR() {

      //use csr lookup result if we got one to autofill fields for step 3
      const csr = JSON.parse(this.currentCsrGroup.csrGroup);

      if (Object.keys(csr).length) {
        this.addressFieldsActive = true;
        //if csr lookup comes back without address components request google place
        if (csr.streetNum == '') {
          this.createForm.accountNumber = csr.accountNum;
          this.createForm.authorizedPerson = csr.authName;
          this.createForm.companyName = csr.endUser;
          const input = csr.endUserAddress + ' ' + csr.city + ' ' + csr.state + ' ' + csr.postalCode;
          let placesService = new google.maps.places.PlacesService(document.getElementById('places-div'));
          placesService.findPlaceFromQuery({query: input, fields: ['place_id']}, (results, status) => {
            placesService.getDetails({
              placeId: results[0].place_id,
              fields: ['address_component']
            }, (result, status) => {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                this.fillAddressFields(result.address_components);
              }
            });
          });
        } else {
          this.createForm.accountNumber = csr.accountNum;
          this.createForm.authorizedPerson = csr.authName;
          this.createForm.companyName = csr.endUser;
          this.createForm.streetNum = csr.streetNum;
          this.address = csr.endUserAddress;
          this.createForm.streetInfo = csr.streetPreDir + ' ' + csr.streetName + ' ' + csr.streetType;
          this.createForm.city = csr.city;
          this.createForm.state = csr.state;
          this.createForm.postalCode = csr.postalCode;
          this.createForm.locationNumber = csr.locationValue1;
          this.createForm.locationType = csr.locationType1;
        }
      }

    },

    clearFormFields(form) {
      Object.keys(form).forEach((key) => {
        form[key] = typeof form[key] === typeof [] ? [] : '';
      });
      this.createForm.portDate = this.defaultDate();
      this.activeStep = 0;
      this.portSummaryData = [];
      this.unportableSummary = [];
      this.address = '';
      this.orderData = [];
      this.currentGroupNumber = 1;
      this.noResultsGroupActive = false;
      this.lastNumberGroup = false;
      this.editOrderData = [];
      this.editNumberFormVisible = false;
      this.editNumberForm.portDate = null;
      this.editNumberForm.otherNumbersMap = [];
      this.processedEdits = [];
      this.editedOrderData = {};
      this.editNumberForm.checkedNumbers = [];
      this.editNumberForm.checkAll = false;
      this.editNumberForm.orderNotes = [];
      this.editNumberForm.orderNote = null;
      this.editMade = false;
      this.processing = false;
      this.addressFieldsActive = false;
      this.orderIsEditable = false;
      this.multipleNumbersEditable = false;
      this.noteFieldActive = false;
      this.viewNotesActive = false;
    },

    formatNumber(number) {
      let formattedNumber = number.replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '').replace(/ /g, '');
      if (formattedNumber.charAt(0) == '1') {
        formattedNumber = formattedNumber.substr(1);
      }
      return formattedNumber;
    },

    prettyNumber(number) {
      return number.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    },

    numberConfirmed(row) {
      return parseInt(row.focTnQuantity);
    },

    numberPending(row) {
      const pendingQuantity = row.tnQuantity - (row.focTnQuantity + row.rejectedTnQuantity + row.activatedTnQuantity);
      return parseInt(pendingQuantity)
    },

    numberRejected(row) {
      return parseInt(row.rejectedTnQuantity)
    },

    numberComplete(row) {
      return parseInt(row.activatedTnQuantity)
    },

    activationsAvail(row) {
      let activationsAvailable = false;

      //this will loop through each of the foc items and determine if any numbers are available for activation today
      if (row.orderStatus === 'Pending') {
        row.focList.focItem.forEach(item => {
          if (item.hasOwnProperty('portDate')) {
            let portDate = item.portDate.split('T')[0];
            let dateNow = new Date();
            let monthNow = dateNow.getMonth() + 1;
            let dayNow = dateNow.getDate();
            if (monthNow < 10) {
              monthNow = '0' + monthNow
            }
            if (dayNow < 10) {
              dayNow = '0' + dayNow
            }
            let checkDate = dateNow.getFullYear() + '-' + monthNow + '-' + dayNow;
            if (portDate == checkDate && item.focTnQuantity > item.activatedTnQuantity) {
              activationsAvailable = true;
            }
          }
        });
      }

      return activationsAvailable;
    },

    nextPortDate(row) {
      let dateMin = null;

      //this will grab the next scheduled port date.
      if (row.orderStatus === 'Pending') {
        row.focList.focItem.forEach(item => {
          if (item.hasOwnProperty('portDate')) {
            const portDate = item.portDate.split('T')[0];
            const dateNow = moment().format('YYYY-MM-DD');
            if (dateMin && (portDate >= dateNow)) {
              const isNewDate = portDate < dateMin;
              if (isNewDate) {
                dateMin = portDate;
              }
            } else {
              if (portDate >= dateNow) {
                dateMin = portDate;
              }
            }
          }
        });
        if (dateMin) {
          return dateMin
        }
        return 'N/A';
      }

    },

    activatePortOrder(orderId) {

      this.tableLoading = true;
      this.activateOrder([orderId, {action: 'query'}])
        .then(res => {
          //build the html summary for the message box of the groups/numbers
          let activationData = res.data;
          let confirmMessage = `<div class="port-activate-confirm-message" style="max-height:300px; overflow: auto;">`;
          for (let i = 0; i < activationData.length; i++) {
            confirmMessage += `<h4 style="margin-bottom: 0;">${activationData[i].group}</h4>`;
            for (let k = 0; k < activationData[i].numbers.length; k++) {
              confirmMessage += `<p>${this.prettyNumber(activationData[i].numbers[k].toString())}</p>`;
            }
          }
          confirmMessage += `</div>`;
          this.tableLoading = false;
          this.$confirm(confirmMessage, 'Activation Summary', {
            confirmButtonText: 'Activate',
            cancelButtonText: 'Cancel',
            dangerouslyUseHTMLString: true
          })
            .then(() => {
              this.tableLoading = true;
              this.activateOrder([orderId, {action: 'activate'}])
                .then(() => {
                  this.$notify({
                    title: 'Success',
                    message: 'Activation Request Submitted. This update could take a while!',
                    type: 'success'
                  });
                  this.tableLoading = false
                })
                .catch((error) => {
                  if (error.hasOwnProperty('errors')) {
                    this.$notify({
                      title: error.message,
                      message: error.errors[Object.keys(error.errors)[0]],
                      type: 'error'
                    });
                  } else {
                    this.$notify({
                      title: error.name,
                      message: error.message,
                      type: 'error'
                    });
                  }
                  this.tableLoading = false;
                })
            })
            .catch(() => {
              this.$message({
                type: 'info',
                message: 'Activation Canceled'
              });
              this.tableLoading = false;
            });
          this.tableLoading = false;
        })
        .catch(error => {
          if (error.hasOwnProperty('errors')) {
            this.$notify({
              title: error.message,
              message: error.errors[Object.keys(error.errors)[0]],
              type: 'error'
            });
          } else {
            this.$notify({
              title: error.name,
              message: error.message,
              type: 'error'
            });
          }
          this.tableLoading = false;
        });
    },

    activationsNumber(row) {
      //this will loop through each of the orders and determine if any numbers are available for activation today
      let numberQuantity = 0;

      if (row.orderStatus === 'Pending') {
        row.focList.focItem.forEach(item => {
          if (item.hasOwnProperty('portDate')) {
            let portDate = item.portDate.split('T')[0];
            let dateNow = new Date();
            let monthNow = dateNow.getMonth() + 1;
            let dayNow = dateNow.getDate();
            if (monthNow < 10) {
              monthNow = '0' + monthNow
            }
            if (dayNow < 10) {
              dayNow = '0' + dayNow
            }
            let checkDate = dateNow.getFullYear() + '-' + monthNow + '-' + dayNow;
            if (portDate == checkDate && item.focTnQuantity > item.activatedTnQuantity) {
              numberQuantity = (item.focTnQuantity - item.activatedTnQuantity);
            }
          }
        });
      }

      return numberQuantity;
    },

    portDateFormat(row) {
      return row.desiredDueDate.split('T')[0];
    },

    defaultDate() {
      let checkDate = new Date();
      let dayIncrement = 0;
      let weekend = false;
      while (dayIncrement < 1) {
        weekend = false;
        checkDate.setDate(checkDate.getDate() + 1);
        if (checkDate.getDay() == '0' || checkDate.getDay() == '6') {
          weekend = true;
        }
        if (!weekend) {
          dayIncrement++;
        }
      }
      return checkDate;
    },

    stepBack() {
      this.lastNumberGroup = false;
      this.createForm.addressRadio = '';
      if (this.activeStep === 2 && this.currentGroupNumber === 1) {
        if (this.activeStep-- < 0) this.activeStep = 0;
      } else if (this.activeStep === 1) {
        //this will just take us back to the submit numbers step 1
        if (this.activeStep-- < 0) this.activeStep = 0;
      } else {
        //this will step back through the number groups
        if (this.currentGroupNumber === this.csrGroups.length) {
          delete this.orderData[this.currentGroupNumber - 1];
        }

        this.currentGroupNumber--;
        //fill out account fields with existing order info already submitted
        const groupOrderData = this.orderData[this.currentGroupNumber - 1];
        this.createForm.accountNumber = groupOrderData.accountNumber;
        this.createForm.authorizedPerson = groupOrderData.authorizedPerson;
        this.createForm.companyName = groupOrderData.companyName;
        this.createForm.streetNum = groupOrderData.streetNum;
        this.address = groupOrderData.streetNum + ' ' + groupOrderData.streetInfo + ' ' + groupOrderData.city + ', ' + groupOrderData.state + ' ' + groupOrderData.postalCode;
        this.createForm.streetInfo = groupOrderData.streetInfo;
        this.createForm.city = groupOrderData.city;
        this.createForm.state = groupOrderData.state;
        this.createForm.postalCode = groupOrderData.postalCode;
        this.createForm.locationNumber = groupOrderData.location.split(' ')[1];
        this.createForm.locationType = groupOrderData.location.split(' ')[0];
        delete this.orderData[this.currentGroupNumber - 1];
        this.currentCsrGroup = this.csrGroups[this.currentGroupNumber - 1];

        if (this.currentCsrGroup.csrGroup === 'noResult') {
          this.noResultsGroupActive = true;
        } else {
          this.noResultsGroupActive = false;
        }

        this.createForm.numberArray = [];
        this.currentCsrGroup.numbers.forEach((n) => {
          if (n.isPortable) {
            this.createForm.numberArray.push(n.telephoneNumber);
          }
        });
      }
    },

    async stepForward() {
      this.activeStep++;

      //can't go further than step 2
      if (this.activeStep - 1 >= 2) {
        this.activeStep = 2;
        await this.submitOrderObject(this.createForm);
        //console.log(this.orderValidationFailed);
        //if group passed validation we can continue
        if (!this.orderValidationFailed) {
          this.currentGroupNumber++;
          //clear applicable form fields
          this.addressFieldsActive = false;
          this.createForm.authorizedPerson = '';
          this.createForm.accountNumber = '';
          this.createForm.companyName = '';
          this.address = '';
          this.createForm.streetInfo = '';
          this.createForm.streetNum = '';
          this.createForm.locationType = '';
          this.createForm.locationNumber = '';
          this.createForm.city = '';
          this.createForm.state = '';
          this.createForm.postalCode = '';
          this.createForm.addressRadio = '';
        }
      }

      //if we are on the final group of numbers we will not show a next button and show the submit!
      if (this.currentGroupNumber === this.csrGroupCount) {
        this.lastNumberGroup = true;
      }

      //set the current csr group object and activate checkboxes if its the 'no results' group
      this.currentCsrGroup = this.csrGroups[this.currentGroupNumber - 1];
      if (this.currentCsrGroup.csrGroup === 'noResult') {
        this.noResultsGroupActive = true;
      } else {
        this.noResultsGroupActive = false;
        //fill in the form fields since the group has results
        this.fillAddressFromCSR()
      }

      this.createForm.numberArray = [];
      this.currentCsrGroup.numbers.forEach((n) => {
        if (n.isPortable) {
          this.createForm.numberArray.push(n.telephoneNumber);
        }
      });

    },

    populateTable() {
      this.tableLoading = true;
      console.log(this.selectedTenant.tenantCode);
      let params = {query: {orderRef: this.selectedTenant.tenantCode}};
      this.getAllOrders(params)
        .then(res => {
          // console.log(res);
          this.tableData = res;
          this.tableLoading = false;
          this.$store.commit('port-in-orders/clearList');
        })
        .catch(err => {
          this.tableLoading = false;
        });
    }
  },
  async beforeMount() {
    const urlParams = new URLSearchParams(window.location.search);
    //this is if we link to create from dashboard.
    if (urlParams.has('context')) {
      const context = urlParams.get('context');
      if (context === 'create') {
        this.createVisible = true;
      }
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    //if linking from external src. set tenant and open order
    if (urlParams.has('tenantId') && urlParams.has('orderId')) {
      this.$store.dispatch('tenants/find', {query: {id: urlParams.get('tenantId')}})
        .then((res) => {
          //console.log(res);
          this.$store.commit('setSelectedTenant', res[0]);
          this.populateTable();
          this.getOrder(urlParams.get('orderId'));
        });
    } else if (this.user) {
      this.populateTable()
    }

    //create google autocomplete
    this.autocomplete = new google.maps.places.Autocomplete(
      (document.querySelector("input[name='autoAddressCreate']")),
      {types: ['geocode']}
    );
    this.autocomplete.setFields(['address_components']);
    this.autocomplete.setComponentRestrictions({
      'country': ['us']
    });
    this.autocomplete.addListener('place_changed', () => {
      let place = this.autocomplete.getPlace();
      let ac = place.address_components;
      this.fillAddressFields(ac, 'create');
    });

    //edit google autocomplete
    this.autocomplete_edit = new google.maps.places.Autocomplete(
      (document.querySelector("input[name='autoAddressEdit']")),
      {types: ['geocode']}
    );
    this.autocomplete_edit.setFields(['address_components']);
    this.autocomplete_edit.setComponentRestrictions({
      'country': ['us']
    });
    this.autocomplete_edit.addListener('place_changed', () => {
      let place = this.autocomplete_edit.getPlace();
      let ac = place.address_components;
      this.fillAddressFields(ac, 'edit');
    });

    //event listeners
    const portRequestService = feathersClient.service('number-porting');
    const portOrderService = feathersClient.service('port-in-orders');
    portOrderService.on('patched', () => {
      setTimeout(() => this.populateTable(), 500);
    });
    portRequestService.on('created', () => {
      setTimeout(() => this.populateTable(), 500);
    });
    // portOrderService.on('updated', () => {setTimeout( () => this.populateTable(), 500);});
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/variables';

.el-steps {
  width: 300px;
  margin: auto;
  margin-bottom: 20px;
}

.button-group {
  max-width: 600px;
  margin: 30px auto;
}

.group-number-list {
  max-width: 600px;
  margin: 10px auto;
}

.radio-button-group {
  margin: 5px 0;
}

.modal-summary-table {
  max-width: 600px;
  margin: auto;
}

.status-complete {
  padding: 0 4px;

  .el-tag {
    color: darken($voxo-aqua, 20%);
    background-color: lighten($voxo-aqua, 20%);
  }
}

.status-pending {
  padding: 0 4px;

  .el-tag {
    color: darken($voxo-orange, 10%);
    background-color: lighten($voxo-orange, 30%);
  }
}

.status-confirmed {
  padding: 0 4px;

  .el-tag {
    color: darken($voxo-green, 10%);
    background-color: lighten($voxo-green, 30%);
  }
}

.status-rejected {
  padding: 0 4px;

  .el-tag {
    color: darken($voxo-dark-red, 10%);
    background-color: lighten($voxo-dark-red, 30%);
  }
}

.tn-status-btn {
  padding: 6px 4px;
  margin: 2px 0;
  display: flex;
  justify-content: center;
  font-weight: 700;
}

.form-comment-header, .order-note, .order-notes {
  max-width: 600px;
  margin: 5px auto;
  font: {
    size: 11pt;
  }
}

.order-note {
  margin-top: 15px;
}

.notes-container {
  margin-top: 10px;
  max-height: 250px;
  overflow: auto;
  border: 1px solid #dcdfe6;;
  padding: 5px 10px;
}

.number-check-group {
  display: flex;
  flex-wrap: wrap;

  > * {
    flex-basis: 50%;
    margin: 2px 0;
  }

  max-width: 600px;
  margin: auto;
}

.check-all {
  padding-left: 15px;
}

</style>

