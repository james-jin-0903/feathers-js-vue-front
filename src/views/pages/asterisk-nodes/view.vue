<template>
  <div class="page-table scrollable only-y">

    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="voxo-purple" sprite="receptionist"/>
        Asterisk Nodes
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
        class="voxo-table"
        >
        <el-table-column
          label=""
          width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-purple">
              <v-svg class="voxo-white" sprite="receptionist"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="Name"
          sortable>
        </el-table-column>
        <el-table-column
          prop="ip"
          label="IP Address"
          sortable>
        </el-table-column>
        <el-table-column
          prop="devStatePong"
          label="DevStatePong"
          sortable>
        </el-table-column>
        <el-table-column
          prop="devStateVersion"
          label="DevStateVersion"
          sortable>
        </el-table-column>
        <el-table-column
          prop="mirtaPbxVersion"
          label="Mirta PBX Version"
          sortable>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <div
              :id="'actions-'+ scope.row.id"
              class="table-actions"
              v-if="visibleActionsId === scope.row.id">
              <el-button
                circle
                :id="'edit-'+ scope.row.id"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="openEditModal(scope.row.id)">
              </el-button>
              <el-button
                circle
                :id="'delete-'+scope.row.id"
                type="danger"
                icon="el-icon-delete"
                size="mini">
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog id="edit-modal" title="View / Edit Virtual Receptionist" :visible.sync="editVisible" :fullscreen="true">

    </el-dialog>

    <el-dialog id="create-modal" title="Create Virtual Receptionist" :visible.sync="createVisible" :fullscreen="true">

    </el-dialog>

  </div>
</template>

<script>

  import {mapActions} from 'vuex';
  import {exportExcel} from '../../../globals/globals';

  export default {
    name: 'AsteriskNodesTable',
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
      user() {
        return this.$store.state.auth.user
      }
    },
    watch: {
      user() {
        this.populateTable()
      }
    },
    methods: {
      ...mapActions('asterisk-nodes', {findNodes: 'find'}),
      formatter(row, column) {
        return row.address;
      },
      filteredData() {
        return this.tableData.filter(data => !this.search
          || data.name.toLowerCase().includes(this.search.toLowerCase())
          || data.ip.toLowerCase().includes(this.search.toLowerCase())
          || data.devStateVersion.toString().toLowerCase().includes(this.search.toLowerCase())
          || data.mirtaPbxVersion.toString().toLowerCase().includes(this.search.toLowerCase())
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
        this.findNodes().then((res) => this.tableData = res);
      },
      exportTable() {
        exportExcel('asterisk-nodes');
      }
    },
    mounted() {
      if (this.user) {
        this.populateTable()
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/variables';

</style>

