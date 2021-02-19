<template>

  <div id="queue-history-plot">
    <div class="card-base card-shadow--medium dashboard-bg p-20">
      <h3 class="white-text o-050 animated slideInUp"></h3>
      <div id="history-chart" style="height: 385px; width:100%"></div>
    </div>
  </div>

</template>

<script>

  import echarts from "echarts";
  import {TimeRef} from '../../../../ref/queue-plot-time-range';

  export default {
    name: 'QueueCallVolumePlot',
    props: {
      plotData: {required: true},
      plotReady: {required: true}
    },
    computed: {
      colorTheme(){
        return this.$store.state.layout.theme;
      }
    },
    data() {
      return {
        chart: null,
        xLabels: [],
        xInterval: 0,
        yOutbound: [],
        yInbound: [],
        yInboundTimes: [],
        yOutboundTimes: [],
        yAbandoned: [],
        chartType: 'line',
      }
    },
    watch: {
      plotData(){
        if(this.plotReady){
          this.initChart();
        }
      }
    },
    methods: {
      initChart(){
        this.xInterval = 0;
        const xAxisKeys = Object.keys(this.plotData);
        if(xAxisKeys.length){

          this.chartType = 'line';
          if(xAxisKeys.length === 1){
            this.chartType = 'bar';
          }

          //here we determine how to plot the x axis
          const maxTicks = 9;
          if(xAxisKeys.length > maxTicks){
            this.xInterval = Math.ceil(xAxisKeys.length / maxTicks);
          }

          this.xLabels = xAxisKeys;
          this.buildChart();
        }else{
          this.xLabels = [];
          this.buildChart();
        }
      },
      buildChart(){
        this.chart = echarts.init(document.getElementById('history-chart'));

        const axisColor = this.colorTheme === 'theme-dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0, 0.5';

        const currentData = {...this.plotData};
        const dataLength = this.xLabels.length;
        let outboundData = [];
        let inboundData = [];
        let inboundTimes = [];
        let outboundTimes = [];
        let abandonedData = [];
        let exitKeys = [];
        let exitTimeouts = [];
        for(let i = 0; i < dataLength; i++){
          outboundData.push(currentData[this.xLabels[i]].outboundVolume);
          inboundData.push(currentData[this.xLabels[i]].inboundVolume);
          inboundTimes.push((currentData[this.xLabels[i]].inboundDuration / 60).toFixed(2));
          outboundTimes.push((currentData[this.xLabels[i]].outboundDuration / 60).toFixed(2));
          abandonedData.push(currentData[this.xLabels[i]].abandonedVolume);
          exitKeys.push(currentData[this.xLabels[i]].exitKey);
          exitTimeouts.push(currentData[this.xLabels[i]].exitTimeout);
        }

        this.yOutbound = outboundData;
        this.yInbound = inboundData;
        this.yInboundTimes = inboundTimes;
        this.yOutboundTimes = outboundTimes;
        this.yAbandoned = abandonedData;
        this.yExitKey = exitKeys;
        this.yExitTimeout = exitTimeouts;

        this.chart.setOption({
          grid: {
            show: false,
            left: '10px',
            right: '10px',
            bottom: '20px',
            top: '70px',
            containLabel: true
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            show: true,
            type: 'scroll',
            orient: 'horizontal',
            icon: 'rectangle',
            itemWidth: 15,
            itemHeight: 3,
            data: [
              {
                name: 'Inbound'
              },
              {
                name: 'Inbound Duration'
              },
              {
                name: 'Abandoned'
              },
              {
                name: 'Outbound'
              },
              {
                name: 'Outbound Duration'
              },
              {
                name: 'Exit Key'
              },
              {
                name: 'Exit Timeout'
              }
            ],
            textStyle: {
              color: axisColor
            }
          },
          xAxis: {
            data: this.xLabels,
            boundaryGap: false,
            axisLabel: {
              interval: this.xInterval
            },
            axisLine: {
              lineStyle: {
                color: axisColor
              }
            },
            axisTick: {
              interval: this.xInterval
            }
          },
          yAxis: [
            {
              name: 'Calls',
              position: 'left',
              splitLine: {show: false},
              axisLine: {
                lineStyle: {
                  color: axisColor
                }
              }
            },
            {
              name: 'Time (Min)',
              position: 'right',
              splitLine: {show: false},
              axisLine: {
                lineStyle: {
                  color: axisColor
                }
              }
            }

          ],
          series: [
            {
              name: 'Inbound',
              type: this.chartType,
              smooth: true,
              showSymbol: true,
              symbolSize: 3,
              yAxisIndex: 0,
              lineStyle: {
                color: '#3ae'
              },
              itemStyle: {
                color: '#3ae',
                borderColor: '#5f8fdf',
                borderWidth: 3
              },
              areaStyle: {
                color: 'rgba(51,170,238,0.2)'
              },
              data: this.yInbound
            },
            {
              name: 'Outbound',
              type: this.chartType,
              smooth: true,
              showSymbol: true,
              symbolSize: 3,
              itemStyle: {
                color: '#35be8b',
                borderColor: '#5f8fdf',
                borderWidth: 3
              },
              areaStyle: {
                color: 'rgba(53,190,139,0.2)'
              },
              data: this.yOutbound
            },
            {
              name: 'Abandoned',
              type: this.chartType,
              smooth: true,
              showSymbol: true,
              symbolSize: 3,
              itemStyle: {
                color: '#f25a6b',
                borderColor: '#5f8fdf',
                borderWidth: 3
              },
              areaStyle: {
                color: 'rgba(242,90,147,0.2)'
              },
              data: this.yAbandoned
            },
            {
              name: 'Inbound Duration',
              type: this.chartType,
              smooth: true,
              showSymbol: true,
              symbolSize: 3,
              yAxisIndex: 1,
              itemStyle: {
                color: '#c485db',
                borderColor: '#5f8fdf',
                borderWidth: 3
              },
              areaStyle: {
                color: 'rgba(196,133,219,0.2)'
              },
              data: this.yInboundTimes
            },
            {
              name: 'Outbound Duration',
              type: this.chartType,
              smooth: true,
              showSymbol: true,
              symbolSize: 3,
              yAxisIndex: 1,
              itemStyle: {
                color: '#f79ca6',
                borderColor: '#5f8fdf',
                borderWidth: 3
              },
              areaStyle: {
                color: 'rgba(247,156,166,0.2)'
              },
              data: this.yOutboundTimes
            },
            {
              name: 'Exit Key',
              type: this.chartType,
              smooth: true,
              showSymbol: true,
              symbolSize: 3,
              itemStyle: {
                color: '#4cc3d2',
                borderColor: '#5f8fdf',
                borderWidth: 3
              },
              areaStyle: {
                color: 'rgba(76,195,210,0.2)'
              },
              data: this.yExitKey
            },
            {
              name: 'Exit Timeout',
              type: this.chartType,
              smooth: true,
              showSymbol: true,
              symbolSize: 3,
              itemStyle: {
                color: '#ff8f02',
                borderColor: '#5f8fdf',
                borderWidth: 3
              },
              areaStyle: {
                color: 'rgba(255,143,2,0.2)'
              },
              data: this.yExitTimeout
            }
          ]
        });

      }
    },
    mounted(){
      // this.initChart();
      // console.log(this.isVisible);
    }
  }

</script>

<style lang="scss" scoped>



</style>