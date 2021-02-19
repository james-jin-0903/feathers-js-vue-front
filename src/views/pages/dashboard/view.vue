<template>
  <div class="page-dashboard">

    <resize-observer @notify="__resizeHandler"/>

    <el-row class="mt-0 mb-20" :gutter="30" v-loading="chartLoading">
      <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <div class="card-base card-shadow--medium dashboard-bg p-20" style="height:400px" v-loading="!asyncChart1">
          <h1 class="white-text mv-0 animated fadeInDown">Call Report</h1>
          <h3 class="mt-0 mb-40 white-text o-050 animated slideInUp"></h3>
          <div id="chart1" style="height:300px; width:100%"></div>
        </div>
      </el-col>
    </el-row>

    <el-row class="mt-0" :gutter="30">
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="!asyncComponent">
          <div class="widget-header ph-20 pt-10">
            <div class="flex justify-center align-center">
              <div class="widget-info box grow text-truncate animated fadeInLeft">
                <h2 class="m-10 widget-title text-truncate pt-5 pb-10">
                  <v-svg class="success-text" sprite="checkbox"/>
                  System Status
                </h2>
              </div>
            </div>
            <div class="system-status">
              <div class="status-wrapper">
                <div class="system-status-group">
                  <span class="black-text">Fax</span>
                  <v-svg class="voxo-green" sprite="check-circle-negative"></v-svg>
                </div>
              </div>
              <div class="status-wrapper">
                <div class="system-status-group">
                  <span class="black-text">Features</span>
                  <v-svg class="voxo-green" sprite="check-circle-negative"></v-svg>
                </div>
              </div>
              <div class="status-wrapper">
                <div class="system-status-group">
                  <span class="black-text">Mobile</span>
                  <v-svg class="voxo-green" sprite="check-circle-negative"></v-svg>
                </div>
              </div>
              <div class="status-wrapper">
                <div class="system-status-group">
                  <span class="black-text">SMS</span>
                  <v-svg class="voxo-green" sprite="check-circle-negative"></v-svg>
                </div>
              </div>
              <div class="status-wrapper">
                <div class="system-status-group">
                  <span class="black-text">Voice</span>
                  <v-svg class="voxo-green" sprite="check-circle-negative"></v-svg>
                </div>
              </div>
              <div class="status-wrapper">
                <div class="system-status-group">
                  <span class="black-text">PSTN</span>
                  <v-svg class="voxo-green" sprite="check-circle-negative"></v-svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="!asyncComponent">
          <div class="widget-header ph-20 pt-10">
            <div class="flex justify-center align-center">
              <div class="widget-info box grow text-truncate animated fadeInLeft">
                <h2 class="m-10 widget-title text-truncate pt-5 pb-10">
                  <v-svg class="voxo-blue" sprite="group-2"/>
                  Users
                </h2>
                <h2 class="m-0 text-truncate voxo-blue text-center">{{userCount}} <span
                  class="black-text font-size-15 font-weight-400">Users</span></h2>
                <div class="dashboard-button">
                  <router-link to="/users">
                    <el-button round>
                      <div class="dashboard-button-group">
                        <v-svg class="voxo-blue" sprite="group-2"></v-svg>
                        <span>View All Users</span>
                      </div>
                    </el-button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="!asyncComponent">
          <div class="widget-header ph-20 pt-10">
            <div class="flex justify-center align-center">
              <div class="widget-info box grow text-truncate animated fadeInLeft">
                <h2 class="m-10 widget-title text-truncate pt-5 pb-10">
                  <v-svg class="success-text" sprite="telephone"/>
                  Extensions
                </h2>
                <h2 class="m-0 text-truncate voxo-green text-center">{{extCount}} <span
                  class="black-text font-size-15 font-weight-400">Extensions</span></h2>
                <div class="dashboard-button">
                  <router-link to="/extensions">
                    <el-button round>
                      <div class="dashboard-button-group">
                        <v-svg class="voxo-green" sprite="telephone"></v-svg>
                        <span>View All Extensions</span>
                      </div>
                    </el-button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row class="mt-0" :gutter="30">
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="!asyncComponent">
          <div class="widget-header ph-20 pt-10">
            <div class="flex justify-center align-center">
              <div class="widget-info box grow text-truncate animated fadeInLeft">
                <h2 class="m-10 widget-title text-truncate pt-5 pb-10">
                  <v-svg class="voxo-aqua" sprite="call-forward"/>
                  Port Your Number
                </h2>
                <h2 class="m-0 text-truncate voxo-green text-center"><span
                  class="black-text font-size-15 font-weight-400">Transfer your existing numbers to VOXO</span></h2>
                <div class="dashboard-button">
                  <router-link to="/number-porting?context=create">
                    <el-button round>
                      <div class="dashboard-button-group">
                        <v-svg class="voxo-aqua" sprite="call-forward"></v-svg>
                        <span>Create Request</span>
                      </div>
                    </el-button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="!asyncComponent">

          <div class="widget-header ph-20 pt-10">
            <div class="flex justify-center align-center">
              <div class="widget-info box grow text-truncate animated fadeInLeft">
                <h2 class="m-10 widget-title text-truncate pt-5 pb-10">
                  <v-svg class="voxo-pink" sprite="phone-number"/>
                  Phone Numbers
                </h2>
                <h2 class="m-0 text-truncate voxo-pink text-center">{{didsCount}} <span
                  class="black-text font-size-15 font-weight-400">Numbers</span></h2>
                <div class="dashboard-button">
                  <router-link to="/phone-numbers?context=create">
                    <el-button round>
                      <div class="dashboard-button-group">
                        <v-svg class="voxo-pink" sprite="phone-number"></v-svg>
                        <span>New Number</span>
                      </div>
                    </el-button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="8">
        <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="!asyncComponent">
          <div class="widget-header ph-20 pt-10">
            <div class="flex justify-center align-center">
              <div class="widget-info box grow text-truncate animated fadeInLeft">
                <h2 class="m-10 widget-title text-truncate pt-5 pb-10">
                  <v-svg class="voxo-red" sprite="message"/>
                  Get Help
                </h2>
                <h2 class="m-0 text-truncate voxo-pink text-center"><span
                  class="black-text font-size-15 font-weight-400">Get help with frequently asked questions</span></h2>
                <div class="dashboard-button">
                  <router-link to="/support">
                  <el-button round>
                    <div class="dashboard-button-group">
                      <v-svg class="voxo-red" sprite="message"></v-svg>
                      <span>Get Support</span>
                    </div>
                  </el-button>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>

  import echarts from 'echarts'
  import moment from 'moment'
  import feathersClient from '../../../feathers/feathers-client';

  export default {
    name: 'Dashboard',
    data() {
      return {
        didsCount: '',
        extCount: '',
        userCount: '',
        chartLoading: false,
        asyncComponent: 'peity',
        asyncChart1: true,
        chart1: null,
        resized: false,
        dateVals: []
      }
    },
    computed: {
      user() {
        return this.$store.state.auth.user;
      },
      selectedTenant() {
        return this.$store.state.selectedTenant;
      },
      smallWidget() {
        return this.dashboardWidth >= 970 && this.dashboardWidth <= 1412 && this.windowWidth >= 1200
      }
    },
    watch: {
      user() {
        this.updateCounts()
      },
      selectedTenant() {
        this.updateCounts();
        // this.initChart1();
      }
    },
    methods: {
      updateCounts() {
        feathersClient.service('tenants').get(this.selectedTenant.id).then( res => {
          this.extCount = res.extensionsCount;
          this.didsCount = res.didsCount;
          this.userCount = res.usersCount;
        });
      },
      __resizeHandler: _.throttle(function (e) {
        if (this.resized) {

          this.asyncComponent = null
          this.removePeity()
          setTimeout(() => {
            this.asyncComponent = 'peity'
          }, 1000)

          this.asyncChart1 = false
          setTimeout(() => {
            this.asyncChart1 = true;
            this.resizeChart1()
          }, 1000)
        }
        this.resized = true
      }, 700),
      removePeity() {
        const peityEl = document.querySelectorAll('.widget .peity')//.forEach((el)=>{el.remove()})
        //ie fix
        for (let i = 0; i < peityEl.length; i++) {
          peityEl[i].parentNode.removeChild(peityEl[i])
        }
      },
      async initChart1() {
        this.chartLoading = true;
        const callReportService = feathersClient.service('call-reports');
        this.chart1 = echarts.init(document.getElementById('chart1'));

        let uniqueDateArray = [];
        let outgoingData = [];
        let incomingData = [];
        let internalData = [];
        let totalData = [];

        const end = moment().format('YYYY-MM-DD HH:mm:ss');
        const start = moment().subtract('10', 'days').format('YYYY-MM-DD 00:00:00');

        let params = {query: {tenantId: this.selectedTenant.id, start, end, type: 'plotData'}};


        //This would be better if moved to the API side.
        callReportService.find(params).then(res => {
            outgoingData = res.outGoingData;
            incomingData = res.incomingData;
            internalData = res.internalData;
            totalData = res.totalData;
            uniqueDateArray = res.uniqueDateArray;

          this.chart1.setOption({
            grid: {
              show: false,
              left: '20px',
              right: '50px',
              bottom: '20px',
              top: '20px',
              containLabel: true
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross'
              }
            },
            legend: {
              show: false,
              data: ['line', 'bar'],
              textStyle: {
                color: '#ccc'
              }
            },
            xAxis: {
              data: uniqueDateArray,
              boundaryGap: false,
              axisLine: {
                lineStyle: {
                  color: 'rgba(255,255,255,0.5)'
                }
              }
            },
            yAxis: {
              splitLine: {show: false},
              axisLine: {
                lineStyle: {
                  color: 'rgba(255,255,255,0.5)'
                }
              }
            },
            series: [
              {
                name: 'Total',
                type: 'line',
                smooth: true,
                showAllSymbol: true,
                symbol: 'emptyCircle',
                symbolSize: 10,
                lineStyle: {
                  color: '#FF8F02'
                },
                itemStyle: {
                  color: '#FF8F02',
                  borderColor: '#5f8fdf',
                  borderWidth: 3
                },
                areaStyle: {
                  color: 'rgba(255,255,255,0.2)'
                },
                animationDuration: 2800,
                animationEasing: 'cubicInOut',
                data: totalData
              },
              {
                name: 'Outgoing',
                type: 'bar',
                barWidth: 10,
                itemStyle: {
                  normal: {
                    barBorderRadius: 5,
                    color: new echarts.graphic.LinearGradient(
                      0, 0, 0, 1,
                      [
                        {offset: 0, color: '#fff'},
                        {offset: 1, color: 'rgba(255,255,255,0)'}
                      ]
                    )
                  }
                },
                data: outgoingData
              },
              {
                name: 'Incoming',
                type: 'pictorialBar',
                symbol: 'rect',
                itemStyle: {
                  normal: {
                    color: 'rgb(53,190,139,0.9)'
                  }
                },
                symbolRepeat: true,
                symbolSize: [12, 4],
                symbolMargin: 1,
                z: -10,
                data: incomingData
              },
              {
                name: 'Internal',
                type: 'pictorialBar',
                symbol: 'rect',
                itemStyle: {
                  normal: {
                    color: 'rgb(118,131,216,0.9)'
                  }
                },
                symbolRepeat: true,
                symbolSize: [12, 4],
                symbolMargin: 1,
                z: -10,
                data: internalData
              }
            ]
          })

          this.chartLoading = false;

        });
      },
      destroyChart1() {
        if (this.chart1) {
          this.chart1.dispose()
          this.chart1 = null
        }
      },
      resizeChart1() {
        if (this.chart1) {
          this.chart1.resize()
        }
      },
      uniqueArray(value, index, self) {
        return self.indexOf(value) === index;
      }
    },
    mounted() {
      // this.initChart1();

      if (this.user) {
        this.updateCounts();
      }

    },
    beforeDestroy() {
      this.destroyChart1()
    }
  }
</script>

<style lang="scss" scoped>
  @import '../../../assets/scss/variables';

  .page-dashboard {
    overflow: auto;

    .card-base {

      h1 {
        font-weight: 900;
      }
    }
  }

  .dashboard-bg {
    background: url(../../../assets/images/graph.svg) no-repeat center center / cover !important;
  }

  .dashboard-button-group {
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      padding-left: 10px;
    }
  }

  .dashboard-button {
    text-align: center;
    padding: 18px;
  }

  .system-status {
    display: flex;
    flex-wrap: wrap;

    > * {
      flex-basis: 50%;
    }
  }

  .system-status-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 5px;
    padding-bottom: 3px;
    border-bottom: 1px solid lightgray;
  }

  .widget {
    height: 200px;
    position: relative;

    .widget-header {

      .widget-icon-box {
        background: rgba(0, 0, 0, .02);
        border: 1px solid rgba(0, 0, 0, .02);
        border-radius: 4px;
        text-align: center;
        width: 60px;
        padding: 5px;
      }

      .widget-title {
        font-weight: 900;
        border-bottom: 1px solid lightgrey;
      }
    }


    .badge-box {
      .badge {
        display: inline-block;
        border-radius: 4px;
        font-size: 80%;
      }
    }
  }

  .timeline {
    max-width: 1200px;
    margin: 6px;
  }

  .timeline, .timeline-title {
    color: $text-color;
    line-height: 1.4;
    cursor: default;
    font-family: inherit;
  }

  @media (min-width: 768px) and (max-width: 1040px) {
    .radio-switcher {
      display: none;
    }

    .widget {
      .widget-header {
        .widget-icon-box {
          display: none;
        }
      }
    }
  }

  @media (max-width: 420px) {
    .radio-switcher {
      display: none;
    }

    /*		.system-status{
          >*{
            flex-basis: 100%;
          }
        }*/
  }
</style>

<style lang="scss">
  .page-dashboard {

    .widget {
      .peity {
        position: absolute;
        bottom: -1px;
        left: 0;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
      }
    }

    table.styled {
      .peity {
        margin-right: 10px;
      }
    }

    .vb-content {
      padding: 0 20px;
      box-sizing: border-box !important;
      margin-top: -5px;
      margin-left: -20px;
      margin-right: -20px;
      height: calc(100% + 15px) !important;
      width: calc(100% + 40px) !important;
    }
  }

  @media (max-width: 768px) {
    .page-dashboard {
      .vb-content {
        padding: 0 5px !important;
        margin: -5px;
        width: calc(100% + 10px) !important;
      }
    }
  }
</style>


