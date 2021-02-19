<template>
  <div class="page-table scrollable only-y">

    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="voxo-red" sprite="queue"/>
        Call Queues
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
            <div class="voxo-square-icon voxo-bg-red">
              <v-svg class="voxo-white" sprite="queue"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="Name"
          sortable>
        </el-table-column>
        <el-table-column
          prop="number"
          label="Number"
          sortable>
        </el-table-column>
        <el-table-column
          prop="server"
          label="Server"
          sortable>
        </el-table-column>
        <el-table-column
          prop="recording"
          label="Recording"
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

    <el-dialog id="edit-modal" title="View / Edit Call Queue" :visible.sync="editVisible" :fullscreen="true">

    </el-dialog>

    <el-dialog id="create-modal" title="Create Call Queue" :visible.sync="createVisible" :fullscreen="true">

    </el-dialog>
  </div>
</template>

<script>

  import {mapActions} from 'vuex';
  import { exportExcel } from '../../../globals/globals';

  export default {
    name: 'QueuesTable',
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
      ...mapActions('queues', {findQueues: 'find'}),
      filteredData() {
        return this.tableData.filter(data => !this.search
          || data.number.toString().toLowerCase().includes(this.search.toLowerCase())
          || data.name.toLowerCase().includes(this.search.toLowerCase())
          || data.server.toLowerCase().includes(this.search.toLowerCase())
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
        this.findQueues(params).then((res) => this.tableData = res);
      },
      exportTable() {
        exportExcel('call-queues');
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

  .table-box {
    overflow: auto;
  }

  .table-actions {
    position: absolute;
    top: -8px;
    right: 30px;
    background: #fff;
    padding: 5px;
    border-radius: 10px;
    border: 1px solid lightgray;
    z-index: 1;
  }

  @media only screen and (max-width: 767px) {
    .table-box {
      display: flex;
      flex-direction: column;
      height: 80vh;
    }

    .page-table {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>

