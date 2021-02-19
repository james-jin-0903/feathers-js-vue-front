<template>
  <div class="page-table scrollable only-y">

    <div class="table-box page-header card-base card-shadow--medium">
      <h1>
        <v-svg class="voxo-green" sprite="ambulance"/>
        e911 Locations
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
          <el-button @click="showModal('Create')">Add New</el-button>
        </div>
      </div>
      <el-table
        :data="filteredData()"
        v-loading="editIsLoading"
        height="calc(100% - 8em)"
        @cell-mouse-enter="actionsUp"
        @cell-mouse-leave="actionsDown"
        @row-click="(row, event, column) => { if(column.hasOwnProperty('label')){showModal('Edit', row.id)}}"
        stripe
        class="voxo-table">
        <el-table-column
          label=""
          width="60px">
          <template slot-scope="scope">
            <div class="voxo-square-icon voxo-bg-green">
              <v-svg class="voxo-white" sprite="ambulance"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="diCommentName"
          label="Name"
          sortable>
        </el-table-column>
        <el-table-column
          label="Address"
          :formatter="addressFormatter"
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

    <location-form
      :visible="modalVisible"
      :context="modalContext"
      :recordId="modalModelId"
      @modalClosed="modalVisible = false">
    </location-form>

  </div>
</template>

<script>

  import {mapActions, mapGetters} from 'vuex';
  import LocationForm from './components/form';
  import { exportExcel } from '../../../globals/globals';
  import feathersClient from '../../../feathers/feathers-client';

  export default {
    name: 'LocationsTable',
    components: {LocationForm},
    data() {
      return {
        search: '',
        visibleActionsId: '',
        modalModelId: '',
        modalVisible: false,
        modalContext: '',
        editIsLoading: false,
      }
    },
    computed: {
      ...mapGetters('locations', {getLocationsList: 'find'}),
      selectedTenant() {
        return this.$store.state.selectedTenant
      },
      user() {
        return this.$store.state.auth.user
      },
      locationsList() {
        let params = {query: {tenantId: this.selectedTenant.id}};
        return this.getLocationsList(params).data;
      }
    },
    watch: {
      selectedTenant() {
        this.queryLocations();
      },
      user() {
        this.queryLocations();
      }
    },
    methods: {
      ...mapActions('locations', {
        findLocations: 'find',
        removeLocation: 'remove',
      }),
      addressFormatter(row) {
        try {
          let notes = JSON.parse(row.emergencyNotes);
          return notes.streetNum + ' ' + notes.streetInfo + ' ' + notes.location + ', ' + notes.city + ', ' + notes.state + ' ' + notes.postalCode;
        } catch (e) {
          return row.emergencyNotes
        }
      },

      filteredData() {
        return this.locationsList.filter(data => !this.search
          || data.diCommentName.toLowerCase().includes(this.search.toLowerCase())
        )
      },

      queryLocations() {
        this.editIsLoading = true;
        this.$store.commit('locations/clearList');
        let params = {query: {tenantId: this.selectedTenant.id}};
        this.findLocations(params).then(() => {
          this.editIsLoading = false;
        })
      },

      //delete row from grid
      deleteRecord(id) {
        this.$confirm('Permanently delete this E911 Location? No Going Back!', 'Warning', {
          confirmButtonText: 'Yes',
          cancelButtonText: 'Cancel',
          type: 'warning'
        })
          .then(() => {
            this.editIsLoading = true;
            this.removeLocation(id)
              .then(res => {
                this.$notify({
                  title: 'Success',
                  message: 'Account ' + res.diCommentName + ' has been removed!',
                  type: 'success'
                });
                this.editVisible = false;
                this.editIsLoading = false;
              })
              .catch(error => {
                this.$notify({
                  title: error.name,
                  message: error.message,
                  type: 'error'
                });
                this.editIsLoading = false;
              });
          })
          .catch(() => {
            this.$message({
              type: 'info',
              message: 'Delete Canceled'
            })
          });
      },

      //General Form and Table Operations
      actionsDown() {
        this.visibleActionsId = ''
      },
      actionsUp(row) {
        this.visibleActionsId = row.id;
      },

      showModal(context, editId = null) {
        this.modalVisible = true;
        this.modalContext = context;
        this.modalModelId = editId;
      },

      exportTable() {
        exportExcel('e911-locations');
      }

    },
    created() {
      if (this.user) {
        this.queryLocations();
      }
    }
  }
</script>

<style lang="scss" scoped>

  @import '../../../assets/scss/variables';

  .current-address-details {
    max-width: 600px;
    margin: 10px auto;
  }

</style>
