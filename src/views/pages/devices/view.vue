<template>
  <div class="page-table scrollable only-y">

    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="voxo-pink" sprite="devices"/>
        Devices
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
          <el-button @click="createVisible = true">Add New</el-button>
        </div>
      </div>
      <el-table
        :data="filteredData()"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        stripe
        class="voxo-table">
        <el-table-column
          label=""
          width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-pink">
              <v-svg class="voxo-white" sprite="devices"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="Name"
          sortable>
        </el-table-column>
        <el-table-column
          prop="device_model.name"
          label="Device Name"
          sortable>
        </el-table-column>
        <el-table-column
          prop="mac"
          label="MAC"
          sortable>
        </el-table-column>
        <el-table-column
          prop="extension.name"
          label="Ext Name"
          sortable>
        </el-table-column>
        <el-table-column
          prop="extension.number"
          label="Ext Number"
          sortable>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <div
              :id="'actions-'+ scope.row.id"
              class="table-actions"
              v-if="visibleActionsId === scope.row.id">
              <el-button
                :id="'edit-'+ scope.row.id"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click="openEditModal(scope.row.id)">
              </el-button>
              <el-button
                :id="'delete-'+scope.row.id"
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle>
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog id="edit-modal" title="View / Edit Device" :visible.sync="editVisible" :fullscreen="true">

    </el-dialog>

    <el-dialog id="create-modal" title="Create Device" :visible.sync="createVisible" :fullscreen="true">

    </el-dialog>

  </div>
</template>

<script>

  import {mapActions} from 'vuex';
  import { exportExcel } from '../../../globals/globals';

  export default {
    name: 'DevicesTable',
    data() {
      return {
        tableData: [],
        search: '',
        visibleActionsId: '',
        modalModelId: '',
        editVisible: false,
        createVisible: false,
      }
    },
    computed: {
      selectedTenant() {
        return this.$store.state.selectedTenant
      },
      user() {
        return this.$store.state.auth.user
      }
    },
    watch: {
      selectedTenant() {
        this.populateTable()
      },
      user() {
        this.populateTable()
      }
    },
    methods: {
      ...mapActions('devices', {findDevices: 'find'}),
      filteredData() {
        return this.tableData.filter(data => !this.search
          || data.name.toLowerCase().includes(this.search.toLowerCase())
          || data.device_model.name.toLowerCase().includes(this.search.toLowerCase())
          || data.mac.toLowerCase().includes(this.search.toLowerCase())
          || data.extension.name.toLowerCase().includes(this.search.toLowerCase())
          || !!data.extension.number && data.extension.number.toLowerCase().includes(this.search.toLowerCase())
        )
      },

      //General Form and Table Operations
      actionsDown() {
        this.visibleActionsId = ''
      },
      actionsUp(row) {
        this.visibleActionsId = row.id;
      },

      openEditModal(id) {
        this.modalModelId = id;
        this.editVisible = true;
      },
      populateTable() {
        let params = {query: {tenantId: this.selectedTenant.id}};
        this.findDevices(params).then((res) => this.tableData = res);
      },
      exportTable() {
        exportExcel('devices');
      }
    },
    mounted() {
      if (this.user) {
        this.populateTable()
      }

      //event listeners
    },
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/variables';

</style>

