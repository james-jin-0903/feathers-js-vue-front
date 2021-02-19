<template>

  <div id="queue-call-volume-plot">
    <div class="card-base card-shadow--medium dashboard-bg p-20">
      <h3 class="black-text mv-0 animated fadeInDown flex align-center">
        <v-svg class="voxo-purple" sprite="report"/>
        <span class="pl-10">HOURLY CALL VOLUME</span>
      </h3>
      <h3 class="white-text o-050 animated slideInUp"></h3>
      <div id="volume-chart" style="height: 385px; width:100%;"></div>
    </div>
  </div>

</template>

<script>

  import echarts from "echarts";
  import {TimeRef} from '../../../../ref/queue-plot-time-range';

  export default {
    name: 'QueueCallVolumePlot',
    props: {
      plotData: {required: true}
    },
    computed: {
      colorTheme(){
        return this.$store.state.layout.theme;
      }
    },
    watch: {
      plotData(){
        this.initChart();
      }
    },
    data() {
      return {
        chart: null,
        xTimes: [],
        xLabels: [],
        yOutbound: [],
        yInbound: [],
        yInboundTimes: [],
        yOutboundTimes: [],
        yAbandoned: [],
        chartType: 'line'
      }
    },
    methods: {
      initChart(){
        if(Object.keys(this.plotData).length){
          const hourlyKeys = Object.keys(this.plotData);
          let amKeys = [];
          let pmKeys = [];

          this.chartType = 'line';
          if(hourlyKeys.length === 1){
            this.chartType = 'bar';
          }

          for(let i = 0; i < hourlyKeys.length; i++){
            const timeKey = hourlyKeys[i].slice(-2);
            const is12 = hourlyKeys[i].substring(0, 2) === '12';
            if(!is12){
              timeKey === 'AM' ? amKeys.push(hourlyKeys[i]) : pmKeys.push(hourlyKeys[i]);
            }
          }

          let sortedAMKeys = amKeys.sort((a, b) =>{
            const hourA = a.substring(0, a.length-2);
            const hourB = b.substring(0, b.length-2);
            return hourA-hourB;
          });
          let sortedPMKeys = pmKeys.sort((a, b) =>{
            const hourA = a.substring(0, a.length-2);
            const hourB = b.substring(0, b.length-2);
            return hourA-hourB;
          });

          if(this.plotData.hasOwnProperty('12PM')){
            sortedPMKeys = ['12PM', ...sortedPMKeys];
          }

          if(this.plotData.hasOwnProperty('12AM')){
            sortedAMKeys = ['12AM', ...sortedAMKeys];
          }

          this.xTimes = [...sortedAMKeys, ...sortedPMKeys];
          const xTimeKeys = [...this.xTimes];
          const rangeKeys = [];
          for(let i = 0; i < xTimeKeys.length; i++){
            rangeKeys.push(TimeRef[xTimeKeys[i]]);
          }
          this.xLabels = rangeKeys;
          this.buildChart();
        }else{
          this.xTimes = [];
          this.xLabels = [];
          this.buildChart();
        }
      },
      buildChart(){
        this.chart = echarts.init(document.getElementById('volume-chart'));

        const axisColor = this.colorTheme === 'theme-dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0, 0.5';

        const currentData = {...this.plotData};
        const dataLength = this.xTimes.length;
        let outboundData = [];
        let inboundData = [];
        let inboundTimes = [];
        let outboundTimes = [];
        let abandonedData = [];
        let exitKeys = [];
        let exitTimeouts = [];
        for(let i = 0; i < dataLength; i++){
          outboundData.push(currentData[this.xTimes[i]].outboundVolume);
          inboundData.push(currentData[this.xTimes[i]].inboundVolume);
          inboundTimes.push((currentData[this.xTimes[i]].inboundDuration / 60).toFixed(2));
          outboundTimes.push((currentData[this.xTimes[i]].outboundDuration / 60).toFixed(2));
          abandonedData.push(currentData[this.xTimes[i]].abandonedVolume);
          exitKeys.push(currentData[this.xTimes[i]].exitKey);
          exitTimeouts.push(currentData[this.xTimes[i]].exitTimeout);
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
              interval: 1
            },
            axisLine: {
              lineStyle: {
                color: axisColor
              }
            },
            axisTick: {
              interval: 1
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
      this.initChart();
    }
  }

</script>

<style lang="scss" scoped>



</style>