<template>
  <div class="outer">
        <div class="box">
          <div class="inline-flex">
            
          <h1>Cluster Manager</h1>
          <div class="header-bar table-box page-header">
          <el-row>
            <el-col :span="12">
              <el-button square @click="addClusterDialog = true"><span>New Cluster</span></el-button>
              <el-dialog 
                :visible.sync="addClusterDialog"
                width="40%"
                :close-on-click-modal="false"
                title="Add New Cluster"
              >
                <div class="dialog-box">
                  <el-row>
                    <el-col :span="24">
                      <el-input placeholder="Name of Cluster"/>
                      <el-input placeholder="Type of Cluster"/>
                    </el-col>
                  </el-row>
                </div>
                <div class="button-wrapper">
                <el-button>Add Server</el-button>
                <el-button>Add Cluster</el-button>
                </div>
              </el-dialog>
            </el-col>

            <el-col :span="4" :offset="8">
              <el-input  style="display: inline" placeholder="Search"/>
            </el-col>
          </el-row>

          </div>
        </div>
      </div>
      
      <br/>
      <div class="main-container table-box page-header card-base card-shadow--medium" v-for="cluster in clusters" :key="cluster">
      
          <el-row>
            <el-col :span="4">
              <span><strong>{{cluster.name}}</strong></span>
            </el-col>

            <el-col :span="4">
              <span><strong>{{cluster.type}}</strong></span>
            </el-col>

            <el-col :span="12">
              <el-tooltip class="item" effect="dark" content="Location" placement="top">
              <span>0&nbsp&nbsp<v-svg class="icon-muted" sprite="pin"/></span>
              </el-tooltip>
              &nbsp&nbsp&nbsp&nbsp
              <el-tooltip class="item" effect="dark" content="Servers" placement="top">
              <span>27&nbsp&nbsp<v-svg class="icon-muted" sprite="rows"/></span>
              </el-tooltip>
              &nbsp&nbsp&nbsp&nbsp
              <el-tooltip class="item" effect="dark" content="Errors" placement="top"> 
              <span>3&nbsp&nbsp<v-svg class="voxo-red" sprite="cross-circle-negative"/></span>
              </el-tooltip>
              &nbsp&nbsp&nbsp&nbsp
              <el-tooltip class="item" effect="dark" content="Warnings" placement="top">
             <span>5&nbsp&nbsp<v-svg class="warning-text" sprite="alert"/></span>
              </el-tooltip>
              &nbsp&nbsp&nbsp&nbsp
            </el-col>

            <el-col :span="2" :offset="2">
              <el-button>Add Zone</el-button>
            </el-col>
          </el-row>
          
    <br/>

            <div class="node-container" v-for="area in areas" :key="area.name">
              <h3>{{area.name}}</h3>

              <el-button style="height: 40px; margin-top: 13px;" square>Add Server</el-button>
              <div class="node-settings table-box page-header card-base card-shadow-default-medium">
                <el-table
                  :data="nodeData"
                  :default-sort = "{prop: 'server', order: 'descending'}"
                  style="width: 100%"
                  v-loading="loading">
                  <el-table-column
                    prop="status"
                    label="STATUS"
                    width="300"
                    sortable
                    
                    :filter-method="filterStatus"
                  ></el-table-column>

                  <el-table-column
                    prop="server"
                    label="SERVER"
                    width="300"
                    sortable
                  ></el-table-column>

                  <el-table-column
                    prop="cpuLoad"
                    label="CPU"
                    width="300"
                    sortable
                  >
                  </el-table-column>
                  <el-progress :percentage="100">stuff</el-progress>
                  <el-table-column
                    prop="ramLoad"
                    label="RAM"
                    width="300"
                    sortable
                  ></el-table-column>

                  <el-table-column
                    prop="diskLoad"
                    label="DISK"
                    width="300"
                    sortable
                  ></el-table-column>

                </el-table>
              </div>
            </div>
          
          </div>
      </div>
    
</template>

<script>

  import {mapActions} from 'vuex';

  export default {
    name: "System Settings",
    data() {
      return {
        clusters: [
          {name: "Voxo Main", type: "Production"},
          {name: "Voxo Dev", type: "Development"}
        ],
        
        areas: [{name: "ATL"}, {name: "CHI"}],
        servers: ["chi-ast1", "chi-ast2", "atl-ast1", "atl-ast2", "atl-ast3"],
        zones: ["Chicago", "Atlanta"],
        status:["Online", "Offline"],
        addClusterDialog: false,
        nodeData: [
          {
            status: 'Online',
            server: 'chi-ast1',
            cpuLoad: "17%",
            ramLoad: "400 MB / 4096 MB",
            diskLoad: "20%"
          },
          {
            status: 'Online',
            server: 'chi-ast1',
            cpuLoad: "17%",
            ramLoad: "400 MB / 4096 MB",
            diskLoad: "20%"
          },
          {
            status: 'Offline',
            server: 'chi-ast1',
            cpuLoad: "17%",
            ramLoad: "400 MB / 4096 MB",
            diskLoad: "20%"
          },
          {
            status: 'Offline',
            server: 'chi-ast1',
            cpuLoad: "17%",
            ramLoad: "400 MB / 4096 MB",
            diskLoad: "20%"
          },
          {
            status: 'Offline',
            server: 'chi-ast1',
            cpuLoad: "17%",
            ramLoad: "400 MB / 4096 MB",
            diskLoad: "20%"
          },
        ]
      }
    },
    computed: {

    },
    watch: {

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
        this.visibleActionsId = '';
      },
      actionsUp(row) {
        this.visibleActionsId = row.id;
      }

    },
    mounted() {

    }
  }

</script>

<style lang="scss">
@import '../../../assets/scss/variables';

.outer {
  position: relative;
  overflow: auto;
}

  
  .header-bar {
    display: inline;

    .el-input {
      height: 100px;
    }

    .dialog-box {
      text-align: center;
      display: inline;

      .el-input {
        font-size: 20px;
        width: 200px;
      }
    }

    .button-wrapper {
      text-align: right;
    }


    .el-button {
      font-size: 15px;
      text-align: center;
      height: 40px;
    }
  }

  .main-container {
    height: auto;
    width: auto;
    overflow: auto;
    position: relative;
    
    
    .node-container {
      display: flex;
      overflow: auto;
      position: relative;
      height: 350px;
      padding: 10px;
      width: 99%;
      
      flex-wrap: wrap;

      .el-button {
        margin-left: 10px;
      }

      .node-settings {
        flex-basis: 100%;
        height: 225px;
      }
    }

    .spacer {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
</style>

