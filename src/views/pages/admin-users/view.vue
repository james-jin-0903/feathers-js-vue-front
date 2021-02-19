<template>
  <div class="page-table scrollable only-y">
    <div class="table-box page-header card-base card-shadow--medium">
      <el-row>
        <el-col :span="12">
          <h1>
            <v-svg class="voxo-green" sprite="group-2" />
            Users
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
          <el-button class="table-button-excel ml-10" @click="exportTable">Export to Excel</el-button>
          <el-button @click="showModal('Create')">Add New</el-button>
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
        :data="userList.data"
        v-loading="tableLoading"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        @row-click="(row, event, column) => { if(column.hasOwnProperty('label')){showModal('Edit', row.id)}}"
        stripe
        class="voxo-table">
        <el-table-column
          label=""
          width="43px">
          <template slot-scope="scope">
            <div class="avatar-group">
              <div class="contact-avatar" v-if="scope.row.avatarPath">
                <img :src="scope.row.avatarPath" :alt="scope.row.name" :title="scope.row.name" />
              </div>
              <div class="contact-avatar" v-else>
                {{scope.row.email.substring(0,1).toUpperCase()}}
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="Email"
          sortable>
        </el-table-column>
        <el-table-column
          prop="userRole"
          :formatter="roleTitle"
          label="Role"
          sortable>
        </el-table-column>
        <el-table-column width="50px">
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
                type="danger"
                icon="el-icon-delete"
                size="mini"
                circle
                @click="deleteRecord(scope.row.id)">
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- FORM COMPONENT -->
    <user-form
      :visible="modalVisible"
      :context="modalContext"
      :recordId="modalModelId"
      @modalClosed="handleModalClose">
    </user-form>

  </div>
</template>

<script>

  import {mapGetters, mapActions} from 'vuex';
  import userForm from '../users/components/form';
  import feathersClient from '../../../feathers/feathers-client';
  import {exportExcel} from '../../../globals/globals';
  import debounce from 'lodash/debounce';

  export default {
    name: 'AdministratorsTable',
    components: {userForm},
    data() {
      return {
        tableLoading: false,
        search: '',
        visibleActionsId: '',
        modalModelId: '',
        modalContext: '',
        modalVisible: false,
        limit: 50,
        page: 1,
        pages: 1,
        total: 0
      }
    },
    computed: {
      ...mapGetters('users', {userProfile: 'get', getUserList: 'find'}),
      user() {
        return this.$store.state.auth.user
      },
      userList() {
        return this.getUserList();
      },
      selectedTenant() {
        return this.$store.state.selectedTenant;
      }
    },
    watch: {
      user() {
        this.queryUsers();
      },
      page: debounce(function () { this.queryUsers() }, 500),
      search: debounce(function () { this.queryUsers() }, 500)
    },
    methods: {
      ...mapActions('users', {
        findUsers: 'find',
        removeUser: 'remove'
      }),
      roleTitle(row) {
        if (row.userRole == '1') return 'Platform Admin';
        if (row.userRole == '3') return 'Account Admin';
        if (row.userRole == '5') return 'User';
        if (row.userRole == '7') return 'Queue Manager'
        return 'No Role';
      },

      queryUsers() {
        this.$store.commit('users/clearList');
        this.tableLoading = true;
        this.findUsers({
          query: {
            $limit: this.limit,
            $skip: this.page > 1 ? (this.limit * (this.page - 1)) : 0,
            $sort: {email: 1},
            filter: this.search,
          }
        }).then( (response) => {
          this.limit = response.limit;
          this.pages = Math.ceil(response.total / response.limit);
          this.total = response.total;

          this.page = this.page > this.pages ? 1 : this.page;
          this.tableLoading = false;
        });
      },

      showModal(context, editId = null) {
        this.modalVisible = true;
        this.modalContext = context;
        this.modalModelId = editId;
      },

      //General Form and Table Operations
      actionsDown() {
        this.visibleActionsId = ''
      },
      actionsUp(row) {
        this.visibleActionsId = row.id;
      },

      deleteRecord(id) {
        this.$confirm('Permanently delete this user?', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.removeUser(id)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'User ' + res.email + ' has been removed!',
                  type: 'success'
                });
              })
              .catch(error => {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: 'error'
                });
              })
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: 'Delete Canceled'
            })
          });
      },

      removeListeners(){
        feathersClient.service('users').removeListener('created');
        feathersClient.service('users').removeListener('patched');
        feathersClient.service('users').removeListener('removed');
      },
      exportTable() {
        exportExcel('users');
      },
      handleModalClose(){
        this.modalVisible = false;
        this.modalContext = '';
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
    mounted() {
      //some special constraints on users force us to write our own logic for real time events.
      feathersClient.service('users').on('created', (item) => {
        this.total++;
        this.$store.commit('users/addItem', item);
      });
      feathersClient.service('users').on('patched', (item) => {
        this.$store.commit('users/addItem', item);
        this.$store.commit('users/updateItem', item);
      });
      feathersClient.service('users').on('removed', (item) => {
        this.total--;
        this.$store.commit('users/removeItem', item);
      });
    },
    created() {
      if (this.user) {
        this.queryUsers();
      }
    },
    beforeDestroy() {
      this.removeListeners();
    }
  }
</script>



