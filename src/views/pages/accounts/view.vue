<template>
  <div class="page-table scrollable only-y">

    <div class="table-box page-header card-base card-shadow--medium">
      <el-row>
        <el-col :span="12">
          <h1>
            <v-svg class="voxo-blue" sprite="lighthouse"/>
            Accounts
          </h1>
        </el-col>
        <el-col class="text-right" :span="12">
          <el-tag>
            <i class="el-icon-info" style="margin-right: 4px;"></i>
            Total: {{ total }}
          </el-tag>
        </el-col>
      </el-row>
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
          <el-button @click="showModal('Create')">Add New</el-button>
        </div>
      </div>
      <el-table
        :data="filteredData()"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        @row-click="(row, event, column) => { if(column.hasOwnProperty('label')){showModal('Edit', row.id)}}"
        class="voxo-table"
        stripe>
        <el-table-column
          label=""
          width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-blue">
              <v-svg class="voxo-white" sprite="lighthouse"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="Name"
          sortable>
        </el-table-column>
        <el-table-column
          prop="timeZone"
          label="Time Zone"
          sortable>
        </el-table-column>
        <el-table-column
          prop="tenantCode"
          label="Code"
          sortable>
        </el-table-column>
        <el-table-column>
          <template slot-scope="scope">
            <div :id="'actions-'+ scope.row.id" class="table-actions" v-if="visibleActionsId === scope.row.id">
              <el-button
                :id="'edit-'+ scope.row.id"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click="showModal('Edit', scope.row.id)">
              </el-button>
              <el-button
                :id="'delete-'+scope.row.id"
                type="danger" icon="el-icon-delete"
                size="mini"
                circle
                @click="deleteRecord(scope.row.id)">
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Account Form -->
    <account-form
      :visible="modalVisible"
      :context="modalContext"
      :recordId="modalModelId"
      @modalClosed="modalVisible = false">
    </account-form>
  </div>

</template>

<script>

  import {mapActions, mapGetters} from 'vuex';
  import accountForm from './components/form';
  import feathersClient from '../../../feathers/feathers-client';
  import {exportExcel} from '../../../globals/globals';

  export default {
    name: 'TenantsTable',
    components: {accountForm},
    data() {
      return {
        search: '',
        visibleActionsId: '',
        modalModelId: '',
        modalVisible: false,
        modalContext: '',
        limit: 50,
        page: 1,
        pages: 1,
        total: 0
      }
    },
    computed: {
      ...mapGetters('tenants', {getAccountList: 'find'}),
      user() {
        return this.$store.state.auth.user
      },
      tenantList() {
        if (+this.$store.state.auth.user.userRole === 1) {
          return this.getAccountList().data;
        }
        if (+this.$store.state.auth.user.userRole === 3) {
          return this.$store.state.authTenants;
        }
        return [];
      },

    },
    watch: {
      user() {
        if(+this.user.userRole === 1){
          this.findAccounts();
        }
      }
    },
    methods: {
      ...mapActions('tenants', {
        findAccounts: 'find',
        removeAccount: 'remove'
      }),

      cidNumberFormatter(row, column) {
        return row.cidNum.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },

      emergNumberFormatter(row, column) {
        return row.emergencyCidNum.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },

      filteredData() {
        const filtered = this.tenantList.filter(data => !this.search
          || data.name.toLowerCase().includes(this.search.toLowerCase())
          || data.tenantCode.toLowerCase().includes(this.search.toLowerCase())
        )
        this.total = filtered.length;
        return filtered;
      },

      showModal(context, editId = null) {
        this.modalVisible = true;
        this.modalContext = context;
        this.modalModelId = editId;
      },

      //deleting operation
      deleteRecord(id) {
        this.$confirm('Permanently delete this account? No Going Back!', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.removeAccount(id)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'Account ' + res.name + ' has been removed!',
                  type: 'success'
                });
                this.editVisible = false;
              })
              .catch(error => {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: 'error'
                });
              });
          })
          .catch(() => true);
      },

      //General Form and Table Operations
      actionsUp(row) {
        this.visibleActionsId = row.id;
      },
      actionsDown() {
        this.visibleActionsId = ''
      },
      exportTable() {
        exportExcel('accounts');
      },
      pageNext () {
        if (this.page < this.pages) {
          this.page += 1;
        }
      },
      pagePrevious () {
        if (this.page > 1) {
          this.page -= 1;
        }
      },
      pageSet (page) {
        this.page = page;
      }
    },
    created() {
      if (this.user) {
        if(+this.user.userRole === 1)
        this.findAccounts();
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/variables';


</style>
