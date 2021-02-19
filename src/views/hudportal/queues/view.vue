<template>

  <div style="overflow: auto;">
    <div id="queue-summary-view" v-if="availableQueues.length">

      <el-tabs v-model="activeTab" v-if="Object.keys(summaryStats).length">
        <el-tab-pane label="Dashboard" name="Statistics" v-loading="dashboardLoading">
          <div class="tab-label pt-5" slot="label">
            <div>Dashboard</div>
            <div class="status-light live-dot">
              <status-indicator :pulse="true" :positive="true"></status-indicator>
            </div>
          </div>
          <el-row class="mt-20" :gutter="30">
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <div class="card-base card-shadow--medium mb-30 widget small-widget">
                <div class="widget-header ph-20 pb-10 mb-10">
                  <div class="stats-flex-body fadeInLeft">
                    <h3 class="stat-header widget-title text-truncate">
                      <v-svg width="18" height="18" class="voxo-green" sprite="call-inbound"/>
                      <span class="pl-10">COMPLETED CALLS</span>
                    </h3>
                    <h1 class="m-0 text-truncate voxo-blue text-center stat-number">{{summaryStats.completedCalls}}</h1>
                    <div class="stats-sub">
                      <div class="sub-stat-group">
                        <div class="sub-stat-number">
                          {{summaryStats.inboundComplete}}
                        </div>
                        <div class="sub-stat-title">
                          INBOUND
                        </div>
                      </div>
                      <div class="sub-stat-group">
                        <div class="sub-stat-number text-right">
                          {{summaryStats.outboundComplete}}
                        </div>
                        <div class="sub-stat-title">
                          OUTBOUND
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="false">
                <div class="widget-header ph-20 pb-10 mb-10">
                  <div class="stats-flex-body">
                    <h3 class="stat-header widget-title text-truncate">
                      <v-svg class="voxo-purple" sprite="group"/>
                      <span class="pl-10">
                          AGENTS:CALLERS
                      </span>
                    </h3>
                    <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                      <span :class="liveCalls > agentCount ? 'voxo-red' : ''">{{agentCount}}:{{liveCalls}}</span>
                    </h1>
                    <div class="stats-sub"></div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <div class="card-base card-shadow--medium mb-30 widget small-widget">
                <div class="widget-header ph-20 pb-10 mb-10">
                  <div class="stats-flex-body">
                    <h3 class="stat-header widget-title text-truncate">
                      <v-svg class="voxo-blue" sprite="clock"/>
                      <span class="pl-10">
                          TOTAL TALK TIME
                      </span>
                    </h3>
                    <h1 class="m-0 text-truncate voxo-blue text-center stat-number">{{convertTime(summaryStats.callDuration)}}</h1>
                    <div class="stats-sub">
                      <div class="sub-stat-group">
                        <div class="sub-stat-number">
                          {{convertTime(summaryStats.inboundTalkTime)}}
                        </div>
                        <div class="sub-stat-title">
                          INBOUND
                        </div>
                      </div>
                      <div class="sub-stat-group">
                        <div class="sub-stat-number text-right">
                          {{convertTime(summaryStats.outboundTalkTime)}}
                        </div>
                        <div class="sub-stat-title">
                          OUTBOUND
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="false">
                <div class="widget-header ph-20 pb-10 mb-10">
                  <div class="stats-flex-body">
                    <h3 class="stat-header widget-title text-truncate">
                      <v-svg class="voxo-dark-red" sprite="clock"/>
                      <span class="pl-10">
                        TOTAL WAIT TIME
                      </span>
                    </h3>
                    <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                      {{convertTime(summaryStats.waitTime)}}
                    </h1>
                    <div class="stats-sub">
                      <div class="sub-stat-group">
                        <div class="sub-stat-number">
                          {{summaryStats.shortestWait ? convertTime(summaryStats.shortestWait) : 0}}
                        </div>
                        <div class="sub-stat-title">
                          SHORTEST
                        </div>
                      </div>
                      <div class="sub-stat-group">
                        <div class="sub-stat-number text-right">
                          {{summaryStats.longestWait ? convertTime(summaryStats.longestWait) : 0}}
                        </div>
                        <div class="sub-stat-title">
                          LONGEST
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="30">
            <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
              <call-volume-plot
                :plotData="summaryStats.hourlyMetrics">
              </call-volume-plot>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="6" :xl="6">
              <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="false">
                <div class="widget-header ph-20 pb-10 mb-10">
                  <div class="stats-flex-body">
                    <h3 class="stat-header widget-title text-truncate">
                      <v-svg class="voxo-green" sprite="check"/>
                      <span class="pl-10">COMPLETED SLA ( 30s )</span>
                    </h3>
                    <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                      {{summaryStats.totalSLA}}
                    </h1>
                    <div class="stats-sub">
                      <div class="sub-stat-group">
                        <div class="sub-stat-number">
                          {{summaryStats.servicelevelperf ? (summaryStats.servicelevelperf * 100).toFixed(0) + ' %' : 0}}
                        </div>
                        <div class="sub-stat-title">
                          SERVICE LEVEL
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="false">
                <div class="widget-header ph-20 pb-10 mb-10">
                  <div class="stats-flex-body">
                    <h3 class="stat-header widget-title text-truncate">
                      <v-svg class="voxo-dark-red" sprite="call-inbound"/>
                      <span class="pl-10">
                          ABANDONED CALLS
                        </span>
                    </h3>
                    <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                      {{summaryStats.abandonedCalls}}
                    </h1>
                    <div class="stats-sub">
                      <div class="sub-stat-group">
                        <div class="sub-stat-number">
                          {{summaryStats.abandonRate ?  (summaryStats.abandonRate * 100).toFixed(0) + ' %' : 0}}
                        </div>
                        <div class="sub-stat-title">
                          ABANDON RATE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>

        <el-tab-pane label="Agent Activity" name="Agents / Calls">
          <div class="tab-label pt-5" slot="label">
            <div>Agent Activity</div>
            <div class="status-light live-dot">
              <status-indicator :pulse="true" :positive="true"></status-indicator>
            </div>
          </div>
          <el-row :gutter="20" class="mt-10">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h3 class="form-section-header flex align-center">
                <span style="margin-right: auto;">QUEUE AGENTS</span>
                <el-select
                  v-model="agentFilter"
                  :value="agentFilter"
                  placeholder="Agents Filter">
                  <el-option
                    v-for="(item,index) in agentListOptions"
                    :key="index"
                    :value="item"
                    :label="item">
                  </el-option>
                </el-select>
              </h3>
              <div>
                <el-table
                  v-loading="dashboardLoading"
                  :data="agentList"
                  :default-sort="{prop: 'membername', order: 'ascending'}"
                  height="469px"
                  class="voxo-table agents-table"
                  stripe>
                  <el-table-column
                    v-if="userIsAdmin && userTenantSelected"
                    width="55px">
                    <template slot-scope="scope">
                      <el-tooltip class="item" effect="dark" :content="scope.row.loggedIn === 1 ? 'Logged In' : 'Logged Out'" placement="top">
                        <el-switch
                          :value="scope.row.loggedIn === 1"
                          @change="handleToggle(!scope.row.loggedIn, scope.row)">
                        </el-switch>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column
                    label=""
                    width="48px">
                    <template slot-scope="scope">
                      <el-tooltip placement="left" :content="agentTooltipStatus(scope.row)">
                        <el-dropdown
                          class="toolbar-avatar"
                          placement="bottom-start"
                          trigger="click"
                          v-if="userIsAdmin && userTenantSelected">
                          <div class="avatar-group" style="">
                            <div class="contact-avatar" v-if="scope.row.avatar">
                              <img :src="scope.row.avatar" :alt="scope.row.membername" :title="scope.row.membername" />
                            </div>
                            <div class="contact-avatar" v-else>
                              {{scope.row.membername.substring(0,1).toUpperCase()}}
                            </div>
                            <div class="status-light">
                              <status-indicator
                                :pulse="getStatusFromEvent(scope.row.extStatus) === 'positive' || getStatusFromEvent(scope.row.extStatus) === 'intermediary'"
                                :status="getStatusFromEvent(scope.row.extStatus)">
                              </status-indicator>
                            </div>
                            <div class="dnd-icon" v-if="scope.row.dnd === 'on'">
                              <hr/>
                              <status-indicator></status-indicator>
                            </div>
                            <div class="leader-crown" v-if="summaryStats.callLeader === scope.row.membername">
                              <v-svg sprite="crown"></v-svg>
                            </div>
                          </div>
                          <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item v-if="(user.myExtension.number != scope.row.extension) && softphoneEnabled">
                              <div @click="dialCall(scope.row.extension)">
                                <v-svg class="voxo-green" sprite="phone"/>
                                Call
                              </div>
                            </el-dropdown-item>
                            <el-dropdown-item v-if="scope.row.loggedIn">
                              <div v-if="!scope.row.paused" @click="pauseMember(scope.row)">
                                <v-svg class="voxo-orange" sprite="pause-2"/>
                                Pause
                              </div>
                              <div v-else @click="unpauseMember(scope.row)">
                                <v-svg class="voxo-orange" sprite="pause-2"/>
                                Unpause
                              </div>
                            </el-dropdown-item>
                          </el-dropdown-menu>
                        </el-dropdown>
                        <div v-else class="avatar-group" style="margin-left: 5px; padding-top: 5px;">
                          <div class="contact-avatar" v-if="scope.row.avatar">
                            <img :src="scope.row.avatar" :alt="scope.row.membername" :title="scope.row.membername" />
                          </div>
                          <div class="contact-avatar" v-else>
                            {{scope.row.membername.substring(0,1).toUpperCase()}}
                          </div>
                          <div class="status-light">
                            <status-indicator
                              :pulse="getStatusFromEvent(scope.row.extStatus) === 'positive' || getStatusFromEvent(scope.row.extStatus) === 'intermediary'"
                              :status="getStatusFromEvent(scope.row.extStatus)">
                            </status-indicator>
                          </div>
                          <div class="dnd-icon" v-if="scope.row.dnd === 'on'">
                            <hr/>
                            <status-indicator></status-indicator>
                          </div>
                          <div class="leader-crown" v-if="summaryStats.callLeader === scope.row.membername">
                            <v-svg sprite="crown"></v-svg>
                          </div>
                        </div>
                      </el-tooltip>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="membername"
                    label="Name"
                    width="225px"
                    sortable>
                    <template slot-scope="scope">
                      <el-tooltip
                        class="item"
                        effect="dark"
                        :content="scope.row.lastPauseReason"
                        placement="top"
                        v-if="+scope.row.paused">
                        <div class="agent-name flex align-center justify-flex-start">
                          {{agentNameFormatter(scope.row.membername)}}
                          <v-svg class="voxo-orange pause-icon" :sprite="getPauseIcon(scope.row.lastPauseReason)"></v-svg>
                        </div>
                      </el-tooltip>
                      <div v-if="!+scope.row.paused" class="agent-name flex align-center justify-flex-start">
                        {{agentNameFormatter(scope.row.membername)}}
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="inboundTotal"
                    label="In"
                    width="50px"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="outboundTotal"
                    label="Out"
                    width="54px"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="refusedCalls"
                    label="Refused"
                    width="90px"
                    sortable>
                    <template slot-scope="scope">
                      {{scope.row.refusedCalls ? scope.row.refusedCalls : 0 }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="Time In/Out"
                    :formatter="getTimeFormat"
                    width="115px"
                    sortable>
                    <template slot-scope="scope">{{convertTime(scope.row.inboundTalkTime)}}/{{convertTime(scope.row.outboundTalkTime)}}</template>
                  </el-table-column>
                  <el-table-column
                    prop="pauseTime"
                    label="Pause Time"
                    :formatter="getTimeFormat"
                    sortable>
                  </el-table-column>
                </el-table>
              </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h3 class="form-section-header pl-10 pt-10 pb-5">QUEUE STATS</h3>
              <el-row :gutter="30">
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                  <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="false">
                    <div class="widget-header ph-20 pb-10 mb-10">
                      <div class="stats-flex-body">
                        <h3 class="stat-header widget-title text-truncate">
                          <v-svg class="voxo-purple" sprite="group"/>
                          <span class="pl-10">
                          AGENTS:CALLERS
                      </span>
                        </h3>
                        <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                          <span :class="liveCalls > agentCount ? 'voxo-dark-red' : ''">{{agentCount}}:{{liveCalls}}</span>
                        </h1>
                        <div class="stats-sub"></div>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                  <div class="card-base card-shadow--medium mb-30 widget small-widget" v-loading="false">
                    <div class="widget-header ph-20 pb-10 mb-10">
                      <div class="stats-flex-body">
                        <h3 class="stat-header widget-title text-truncate">
                          <v-svg class="voxo-orange" sprite="clock"/>
                          <span class="pl-10">
                          AGENTS READY
                      </span>
                        </h3>
                        <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                          <span>{{readyAgents}}</span>
                        </h1>
                        <div class="stats-sub"></div>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="30">
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                  <div class="card-base card-shadow--medium widget small-widget" v-loading="false">
                    <div class="widget-header ph-20 pb-10 mb-10">
                      <div class="stats-flex-body">
                        <h3 class="stat-header widget-title text-truncate">
                          <v-svg class="voxo-green" sprite="clock"/>
                          <span class="pl-10">
                          ACTIVE CALLS
                      </span>
                        </h3>
                        <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                          <span>{{activeCalls}}</span>
                        </h1>
                        <div class="stats-sub"></div>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
                  <div class="card-base card-shadow--medium widget small-widget" v-loading="false">
                    <div class="widget-header ph-20 pb-10 mb-10">
                      <div class="stats-flex-body">
                        <h3 class="stat-header widget-title text-truncate">
                          <v-svg class="voxo-dark-red" sprite="group"/>
                          <span class="pl-10">
                          CALLS WAITING
                      </span>
                        </h3>
                        <h1 class="m-0 text-truncate voxo-blue text-center stat-number">
                          <span>{{waitingCalls}}</span>
                        </h1>
                        <div class="stats-sub"></div>
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <el-row class="mt-20" :gutter="30">
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h3 class="form-section-header">ACTIVE CALLS</h3>
              <el-table
                :data="connectedCalls"
                height="500px"
                class="voxo-table agent-calls"
                :default-sort="{prop: 'agent', order: 'ascending'}"
                stripe>
                <el-table-column
                  v-if="userIsAdmin && userTenantSelected && softphoneEnabled"
                  width="70">
                  <template slot-scope="scope">
                    <el-tooltip class="item" effect="dark" content="Listen" placement="left">
                      <el-button
                        class="manager-action-button"
                        @click="callSpyRequest(scope.row.channel,false)">
                        <v-svg class="voxo-blue" sprite="eye"></v-svg>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip class="item" effect="dark" content="Coach" placement="right">
                      <el-button
                        class="manager-action-button"
                        @click="callSpyRequest(scope.row.channel,true)">
                        <v-svg class="voxo-pink" sprite="hearing"></v-svg>
                      </el-button>
                    </el-tooltip>
                  </template>
                </el-table-column>
                <el-table-column
                  label="Agent"
                  prop="agent"
                  :formatter="nameFormatter">
                </el-table-column>
                <el-table-column
                  prop="cidname"
                  label="Caller Name"
                  sortable>
                </el-table-column>
                <el-table-column
                  prop="cidnum"
                  label="Caller Number"
                  :formatter="numberFormatter"
                  sortable>
                </el-table-column>
                <el-table-column
                  label="Duration">
                  <template slot-scope="scope">
                    <span class="call-badge text-left">
                      <el-tooltip effect="dark" content="Inbound" placement="right" v-if="scope.row.direction === 'recipient'">
                        <el-badge :value="convertTimeDuration(scope.row.duration)" class="item" type="success"></el-badge>
                      </el-tooltip>
                      <el-tooltip effect="dark" content="Outbound" placement="right" v-if="scope.row.direction === 'initiator'">
                        <el-badge :value="convertTimeDuration(scope.row.duration)" class="item" type="primary"></el-badge>
                      </el-tooltip>
                    </span>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
            <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <h3 class="form-section-header">CALLS WAITING</h3>
              <el-table
                :data="queueCallers"
                :default-sort="{prop: 'position', order: 'ascending'}"
                height="500px"
                class="voxo-table agent-calls"
                stripe>
                <el-table-column
                  type="index"
                  width="30"
                  align="center"
                  sortable>
                </el-table-column>
                <el-table-column
                  prop="calleridname"
                  label="Caller Name"
                  sortable>
                </el-table-column>
                <el-table-column
                  prop="calleridnum"
                  label="Caller Number"
                  :formatter="numberFormatter"
                  sortable>
                </el-table-column>
                <el-table-column
                  label="Wait Time"
                  :formatter="getTimeFormatHold">
                  <template slot-scope="scope">
                    <el-badge :value="getTimeFormatHold(scope.row.wait)" class="item" type="success" v-show="scope.row.wait <= 30"></el-badge>
                    <el-badge :value="getTimeFormatHold(scope.row.wait)" class="item" type="warning" v-show="scope.row.wait > 30 && scope.row.wait <= 60"></el-badge>
                    <el-badge :value="getTimeFormatHold(scope.row.wait)" class="item" type="danger" v-show="scope.row.wait > 60"></el-badge>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>

        </el-tab-pane>

        <el-tab-pane label="Recent Activity" name="Historical">
          <div>
            <el-row>
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb-10">
                <div class="flex mb-5 align-center">
                  <h3 class="black-text mv-0 animated fadeInDown flex align-center">
                    <v-svg class="voxo-purple" sprite="report"/>
                    <span class="pl-10">Queue History</span>
                  </h3>
                  <el-date-picker
                    class="mr-10"
                    style="margin-left: auto;"
                    v-model="historyDateRange"
                    type="daterange"
                    align="right"
                    unlink-panels
                    range-separator="To"
                    start-placeholder="Start date"
                    end-placeholder="End date"
                    @change="updateHistory"
                    :picker-options="datePickerOptions">
                  </el-date-picker>
                </div>
                <call-history-plot
                  ref="historyPlot"
                  v-observe-visibility="historyVisibility"
                  v-loading="historyLoading"
                  :plotReady="historyVisible"
                  :plotData="historyStats">
                </call-history-plot>
              </el-col>
            </el-row>
            <el-row :gutter="30" class="mt-10">
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-10">
                <div class="flex mb-5 align-center">
                  <h2 class="form-section-header">Refused Calls</h2>
                  <el-date-picker
                    class="mr-10"
                    style="margin-left: auto;"
                    v-model="refusedDate"
                    align="right"
                    @change="updateRefused"
                    :picker-options="refusedDatePickerOptions">
                  </el-date-picker>
                </div>
                <el-table
                  v-loading="refusedTableLoading"
                  :data="refusedCalls"
                  height="500px"
                  class="voxo-table agent-calls"
                  stripe>
                  <el-table-column
                    type="index"
                    align="center"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="time"
                    label="Time"
                    :formatter="timeFormatter"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="data4"
                    label="Caller Name"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="data2"
                    label="Caller Number"
                    :formatter="numberFormatter"
                    sortable>
                  </el-table-column>
                  <el-table-column>
                    <template slot-scope="scope">
                      <el-popover
                        placement="left"
                        width="400"
                        trigger="click">
                        <el-table :data="refusedPopoverData" v-loading="refusedLoading" height="175px" stripe>
                          <el-table-column property="time" label="Time" :formatter="timeFormatter"></el-table-column>
                          <el-table-column property="event" label="Event" width="150px"></el-table-column>
                          <el-table-column property="agent" label="Agent" :formatter="nameFormatter"></el-table-column>
                        </el-table>
                        <el-tooltip :content="scope.row.disposition" placement="left" slot="reference">
                          <el-button
                            size="mini"
                            class="refused-call-button"
                            :style="scope.row.disposition === 'Unanswered' ? 'background: #ec205f' : 'background: #0e78e6;'"
                            icon="el-icon-view"
                            @click="trackRefused(scope.row.callId)">
                          </el-button>
                        </el-tooltip>
                      </el-popover>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
              <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mb-10">
                <div class="flex mb-5 align-center">
                  <h2 class="form-section-header">Work Hours</h2>
                  <el-date-picker
                    class="mr-10"
                    style="margin-left: auto;"
                    v-model="workDate"
                    align="right"
                    @change="updateWorkHours">
                  </el-date-picker>
                </div>
                <el-table
                  v-loading="false"
                  :data="workHours"
                  :default-sort="{prop: 'agent', order: 'ascending'}"
                  height="500px"
                  class="voxo-table agent-calls"
                  stripe>
                  <el-table-column
                    prop="agent"
                    label="Name"
                    :formatter="nameFormatter"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="login"
                    label="Login"
                    :formatter="timeFormatter"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="logout"
                    label="Logout"
                    :formatter="timeFormatter"
                    sortable>
                  </el-table-column>
                  <el-table-column
                    prop="workDay"
                    label="Work Day"
                    sortable>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>
            <el-row id="queue-averages-table" class="mt-10">
              <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb-10">
                <h2 class="form-section-header flex wrap">
                  <span style="min-width: 200px;">
                    90 Day {{ this.agentStatsType === 'average' ? 'Averages' : 'Totals'}}
                  </span>
                  <el-radio-group v-model="agentStatsType">
                    <el-radio-button type="default" label="average">Averages</el-radio-button>
                    <el-radio-button label="total">Totals</el-radio-button>
                  </el-radio-group>
                </h2>
                <el-table
                  id="average-stats-table"
                  :data="averageStats"
                  :default-sort="{prop: 'name', order: 'ascending'}"
                  height="500px"
                  class="voxo-table agent-calls"
                  stripe>
                  <el-table-column
                    prop="name"
                    label="Name"
                    :formatter="nameFormatter"
                    sortable>
                  </el-table-column>
                  <el-table-column :label="this.agentStatsType === 'average' ? 'Inbound Avg' : 'Inbound Total'">
                    <el-table-column
                      prop="dailyInAvg"
                      :label="this.agentStatsType === 'average' ? 'Daily' : 'Totals'"
                      :formatter="statMultiplierDaily"
                      sortable>
                    </el-table-column>
                    <el-table-column
                      v-if="this.agentStatsType === 'average'"
                      prop="weeklyInAvg"
                      label="Weekly"
                      sortable>
                    </el-table-column>
                    <el-table-column
                      v-if="this.agentStatsType === 'average'"
                      prop="monthlyInAvg"
                      label="Monthly"
                      sortable>
                    </el-table-column>
                  </el-table-column>
                  <el-table-column :label="this.agentStatsType === 'average' ? 'Outbound Avg' : 'Outbound Total'">
                    <el-table-column
                      prop="dailyOutAvg"
                      :label="this.agentStatsType === 'average' ? 'Daily' : 'Totals'"
                      :formatter="statMultiplierDaily"
                      sortable>
                    </el-table-column>
                    <el-table-column
                      v-if="this.agentStatsType === 'average'"
                      prop="weeklyOutAvg"
                      label="Weekly"
                      sortable>
                    </el-table-column>
                    <el-table-column
                      v-if="this.agentStatsType === 'average'"
                      prop="monthlyOutAvg"
                      label="Monthly"
                      sortable>
                    </el-table-column>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>

          </div>
        </el-tab-pane>
      </el-tabs>
      <div v-else v-loading="dashboardLoading" class="mt-30">
        The Selected Tenant Has No Available Queue Data!
      </div>
    </div>

    <el-dialog
      class="form-modal"
      :visible.sync="pauseReasonVisible"
      :close-on-press-escape="false"
      :show-close="false"
      :close-on-click-modal="false"
      :modal="false">
      <el-form>
        <h2 class="form-section-header">
          Agent Pause Reason
        </h2>
        <el-select
          v-model="pauseReason"
          placeholder="Select Reason"
          :value="pauseReason">
          <template slot="prefix">Reason</template>
          <el-option
            v-for="(reason, index) in pauseReasons"
            :key="index"
            :label="reason"
            :value="reason">
          </el-option>
        </el-select>
        <el-input
          type="text"
          v-model="otherPauseReason"
          placeholder="Enter Other"
          v-if="pauseReason === 'Other'">
          <template class="label-prefix" slot="prefix">Other Reason</template>
        </el-input>
        <div class="inline-form-group justify-flex-end">
          <el-button
            @click="processPause">
            Submit
          </el-button>
          <el-button
            @click="cancelPause">
            Cancel
          </el-button>
        </div>
      </el-form>

    </el-dialog>


  </div>

</template>

<script>

  import CallVolumePlot from './components/call-volume-plot';
  import CallHistoryPlot from './components/call-history-plot';
  import feathersClient from "../../../feathers/feathers-client";
  import {mapActions, mapGetters} from 'vuex';
  import {globalEventBus} from "../../../globalEventBus";
  import pauseIcons from "../../../ref/pause-icons";
  import extensionStatus from "../../../ref/extension-status";
  import moment from 'moment';

  export default {
    name: 'OMNIAQueues',
    components: {CallVolumePlot, CallHistoryPlot},
    data() {
      return {
        activeTab: 'Statistics',
        summaryStats: '',
        averageStats: [],
        historyStats: [],
        queueChannel: null,
        statusChannel: null,
        agentListOptions: ['All', 'Logged In', 'Logged Out'],
        agentFilter: 'Logged In',
        holdCounter: null,
        waitingCalls: 0,
        activeCalls: 0,
        liveCalls: 0,
        dashboardLoading: true,
        historyLoading: true,
        historyVisible: false,
        historyDateRange: [
          moment(),
          moment().add(1, 'days')
        ],
        refusedLoading: true,
        refusedTableLoading: true,
        refusedPopoverData: [],
        activeRefusedCallId: null,
        refusedDate: moment(),
        workDate: moment(),
        workHours: [],
        hoursTableLoading: true,
        pauseReasonVisible: false,
        pauseReasons: ['Account Review', 'Break', 'Lunch', 'Meeting', 'Personal', 'Other'],
        pauseReason: '',
        otherPauseReason: '',
        pauseAgent: '',
        pauseType: '',
        agentStatsType: 'average',
        datePickerOptions: {
          shortcuts: [{
            text: 'Last week',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: 'Last month',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: 'Last 3 months',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }],
          disabledDate(time) {
            const difference = moment(time).diff(moment(), 'days');
            return !(difference > -91 && difference < 1);
          }
        },
        refusedDatePickerOptions: {
          disabledDate(time) {
            const difference = moment(time).diff(moment(), 'days');
            return !(difference > -91 && difference <= 0);
          }
        }
      }
    },
    computed: {
      ...mapGetters('queues', {queueList: 'find'}),
      ...mapGetters('queuemembers', {findQueueMembers: 'find'}),
      ...mapGetters('queuecallers', {queueCallerList: 'find'}),
      ...mapGetters('currentcalls', {currentCallList: 'find'}),
      ...mapGetters('refusedcalls', {refusedCallList: 'find'}),
      ...mapGetters('mycurrentcalls', {myCallsList: 'find'}),
      user() {
        return this.$store.state.auth.user;
      },
      userHostServer(){
        return this.$store.state.userHostServer;
      },
      userIsAdmin() {
        if(this.user){
          const adminRoles = [1,3,7];
          return adminRoles.includes(this.user.userRole);
        }
      },
      userTenantSelected(){
        if(this.user){
          if(this.user.hasOwnProperty('myExtension')){
            return this.user.myExtension.tenantId === this.selectedTenant.id;
          }
        }
        return false
      },
      selectedTenant() {
        return this.$store.state.selectedTenant;
      },
      availableQueues() {
        return this.$store.state.queueList;
      },
      selectedQueue() {
        return this.$store.state.selectedQueue;
      },
      agentList() {
        if (this.agentFilter === 'All') {
          return this.findQueueMembers().data;
        }
        if (this.agentFilter === 'Logged In') {
          return this.findQueueMembers({
            query: {
              loggedIn: 1
            }
          }).data;
        }
        if (this.agentFilter === 'Logged Out') {
          return this.findQueueMembers({
            query: {
              loggedIn: 0
            }
          }).data;
        }
      },
      refusedCalls() {
        return this.refusedCallList().data;
      },
      agentCount() {
        return this.findQueueMembers({
          query: {
            loggedIn: 1,
            paused: {$ne: 1},
            extStatus: {$ne: 'UNAVAILABLE'},
            dnd: {$ne: 'on'}
          }
        }).data.length;
      },
      readyAgents(){
        return this.findQueueMembers({
          query: {
            loggedIn: 1,
            extStatus: 'NOT_INUSE',
            paused: {$ne: 1},
            dnd: {$ne: 'on'}
          }
        }).data.length;
      },
      queueCallers() {
        return this.queueCallerList().data;
      },
      connectedCalls(){
        this.waitingCalls = this.queueCallerList().data.length;
        const callList = this.currentCallList().data;
        this.activeCalls = callList.length;
        this.liveCalls = this.activeCalls + this.waitingCalls;
        return callList;
      },
      softphoneEnabled(){
        return this.$store.state.softphoneEnabled;
      }
    },
    watch: {
      async selectedQueue() {
        if (this.selectedQueue.id) {
          this.dashboardLoading = true;
          this.historyLoading = true;
          this.refusedTableLoading = true;
          this.hoursTableLoading = true;
          const queryQueueId = this.selectedQueue.id;
          this.historyDateRange = [
            moment(),
            moment().add(1, 'days')
          ];
          this.refusedDate = moment();
          this.$store.commit('queuemembers/clearList');
          this.$store.commit('queuecallers/clearList');
          this.$store.commit('currentcalls/clearList');
          this.$store.commit('refusedcalls/clearList');
          this.joinSocketChannel();
          //using some await functionality to not blast the backend with requests
          await this.querySummary();
          this.dashboardLoading = false;
          await this.queryHistory();
          await this.queryAverages();
          //initial queue status to get the callers in queue.
          await feathersClient.service('nats-actions-handler').create({
            reqType: 'queueStatus',
            queueId: queryQueueId,
            server: this.userHostServer,
            queryServer: !this.userTenantSelected,
            tenantCode: this.selectedTenant.tenantCode
          }).catch(e => console.log(e));
          await feathersClient.service('nats-actions-handler').create({
            reqType: 'refreshQueueConnected',
            queueId: queryQueueId,
            server: this.userHostServer,
            queryServer: !this.userTenantSelected,
            tenantCode: this.selectedTenant.tenantCode,
            userId: this.user.id,
            userExten: this.user.myExtension.number
          }).catch(e => console.log(e));
        }
      },
      summaryStats() {
        if (Object.keys(this.summaryStats).length) {
          this.$store.commit('setActiveQueue', true);
        } else {
          this.$store.commit('setActiveQueue', false);
        }
      },
      user(){
        this.queryQueues();
      }
    },
    methods: {
      ...mapActions('queues', {findQueues: 'find'}),
      queryQueues() {
        if(!this.userIsAdmin || this.user.userRole == '7'){

          let allowedQueues = this.user.myExtension.queueIds;
          if(this.user.userRole == '7'){
            const {adminQueues} = this.user;
            allowedQueues = adminQueues;
          }

          this.findQueues({
            query: {
              id: {$in: allowedQueues},
              tenantId: this.selectedTenant.id
            }
          }).then((res) => {
            this.$store.commit('setQueues', res);
            this.$store.commit('setSelectedQueue', res[0]);
          });
        } else {
          this.findQueues({
            query: {
              tenantId: this.selectedTenant.id
            }
          }).then((res) => {
            this.$store.commit('setQueues', res);
            this.$store.commit('setSelectedQueue', res[0]);
          });
        }
      },
      async queryHistory(){
        if(this.selectedQueue.id){
          const queueStatsService = feathersClient.service('queue-stats');
          const queryQueue = this.selectedQueue.id;
          await queueStatsService.find({
            query: {
              command: 'history',
              queueId: queryQueue,
              start: moment().format('YYYY-MM-DD'),
              end: moment().add(1, 'days' ).format('YYYY-MM-DD')
            }
          }).then (res => {
            this.historyLoading = false;
            if(res.hasOwnProperty(queryQueue)){
              this.historyStats = res[queryQueue].sortedDaily;
            } else{
              this.historyStats = [];
            }
          });
          await queueStatsService.find({
            query: {
              command: 'refused',
              queueId: queryQueue,
              start: moment().format('YYYY-MM-DD'),
              end: moment().add(1, 'days').format('YYYY-MM-DD')
            }
          }).then( res => {
            if(res.hasOwnProperty(queryQueue)){
              this.$store.commit('refusedcalls/addItems', res[queryQueue]);
            } else{
              this.$store.commit('refusedcalls/clearList');
            }
            this.refusedTableLoading = false;
          });
          await queueStatsService.find({
            query: {
              command: 'agentHours',
              queueId: queryQueue,
              date: moment().format('YYYY-MM-DD')
            }
          }).then( res => {
            if(res.hasOwnProperty(queryQueue)){
              this.workHours = res[queryQueue];
            }
            this.hoursTableLoading = false;
          })
        }
      },

      updateHistory(){
        this.historyLoading = true;
        const queueStatsService = feathersClient.service('queue-stats');
        queueStatsService.find({
          query: {
            command: 'history',
            queueId: this.selectedQueue.id,
            start: this.historyDateRange[0],
            end: this.historyDateRange[1]
          }
        }). then (res => {
          this.historyLoading = false;
          if(res.hasOwnProperty(this.selectedQueue.id)){
            this.historyStats = res[this.selectedQueue.id].sortedDaily;
          } else{
            this.historyStats = [];
          }
        });
      },

      updateRefused(){
        this.refusedTableLoading = true;
        this.$store.commit('refusedcalls/clearList');
        const queueStatsService = feathersClient.service('queue-stats');
        this.refusedLoading = true;
        queueStatsService.find({
          query: {
            command: 'refused',
            queueId: this.selectedQueue.id,
            start: moment(this.refusedDate).format('YYYY-MM-DD'),
            end: moment(this.refusedDate).add(1, 'days').format('YYYY-MM-DD')
          }
        }).then( res => {
          if(res.hasOwnProperty(this.selectedQueue.id)){
            this.$store.commit('refusedcalls/addItems', res[this.selectedQueue.id]);
          } else{
            this.$store.commit('refusedcalls/clearList');
          }
          this.refusedTableLoading = false;
        })
      },

      trackRefused(callId){
        if(callId !== this.activeRefusedCallId){
          this.refusedLoading = true;
          const queueLogService = feathersClient.service('queue-log');
          queueLogService.find({
            query: {
              queueId: this.selectedQueue.id,
              callId
            }
          }).then( res => {
            this.refusedPopoverData = res;
            this.refusedLoading = false;
            this.activeRefusedCallId = callId;
          })
        }
      },

      updateWorkHours(){
        this.hoursTableLoading = true;
        this.workHours = [];
        const queueStatsService = feathersClient.service('queue-stats');
        queueStatsService.find({
          query: {
            command: 'agentHours',
            queueId: this.selectedQueue.id,
            date: moment(this.workDate).format('YYYY-MM-DD'),
          }
        }).then( res => {
          if(res.hasOwnProperty(this.selectedQueue.id)){
            this.workHours = res[this.selectedQueue.id];
          }
          this.refusedTableLoading = false;
        })
      },

      historyVisibility(isVisible, entry){
        this.historyVisible = isVisible;
        if(isVisible){
          setTimeout(this.$refs.historyPlot.initChart(), 500);
        }
      },

      async querySummary() {
        if(this.selectedQueue.id){
          const queryQueue = this.selectedQueue.id;
          this.dashboardLoading = true;
          const queueStatsService = feathersClient.service('queue-stats');
          const queueStatsRes = await queueStatsService.find({
            query: {
              command: 'summary',
              queueId: queryQueue
            }
          }).catch(e => console.log(e));

          if (queueStatsRes.hasOwnProperty(queryQueue)) {
            this.summaryStats = queueStatsRes[queryQueue];
            this.$store.commit('queuemembers/addItems', queueStatsRes[queryQueue].agents);

            if(this.user.hasOwnProperty('myExtension')) {
              const omniaAgent = this.findQueueMembers({
                query: {
                  member_device: this.user.myExtension.peerName
                }
              }).data;
              if (omniaAgent.length) {
                this.$store.commit('setQueueLoggedIn', omniaAgent[0].loggedIn === 1);
                this.$store.commit('setQueuePaused', omniaAgent[0].paused === 1);
                this.$store.commit('setQueuePausedReason', omniaAgent[0].lastPauseReason);
              }
            }
          } else {
            this.summaryStats = {};
          }
        } else{
          this.summaryStats = {};
        }
      },

      async queryAverages() {
        if(this.selectedQueue.id){
          const queryQueue = this.selectedQueue.id;
          const queueStatsService = feathersClient.service('queue-stats');
          await queueStatsService.find({
            query: {
              command: 'agentAverages',
              queueId: queryQueue
            }
          }).then(res => {this.averageStats = res;}).catch( e => console.log(e));
        }
      },

      convertTime(time) {

        const hours = Math.floor(time / 3600);
        const remainderSeconds = time % 3600;
        const minutes = Math.floor(remainderSeconds / 60);
        const seconds = Math.round(remainderSeconds % 60);

        if (hours > 0) {return hours + 'hr ' + minutes + 'm';}
        if (minutes > 0) {return minutes + 'm';}
        if (seconds > 0) {return seconds + 's';}
        return '0';
      },

      convertTimeDuration(time){
        const hours = Math.floor(time / 3600);
        const remainderSeconds = time % 3600;
        const minutes = Math.floor(remainderSeconds / 60);
        const seconds = Math.round(remainderSeconds % 60);

        if (hours > 0) {return hours + 'hr ' + minutes + 'm';}
        if (minutes > 0) {return minutes + 'm ' + seconds + 's';}
        if (seconds > 0) {return seconds + 's';}
        return '0';
      },

      getTimeFormat(row, column, value, index) {
        return this.convertTime(value);
      },

      getTimeFormatHold(time) {
        return this.convertTimeDuration(time)
      },

      nameFormatter(row, column, value, index) {
        if(value){
          return value.replace(/[_]{1}/g, ' ');
        }
      },

      agentNameFormatter(name){
        return name.replace(/[_]{1}/g, ' ');
      },

      numberFormatter(row, column, value) {
        return value.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
      },

      timeFormatter(row, column, value) {
        if(value !== 'N/A'){
          return moment(value).format('h:mm:ss A');
        } else{
          return value;
        }
      },

      durationInSeconds(value){
        const durationParts = value.split(':');
        const hours = +durationParts[0];
        const minutes = +durationParts[1];
        const seconds = +durationParts[2];
        return hours*3600 + minutes*60 + seconds;
      },

      joinSocketChannel() {
        console.log('we need to change / join a queue channel');

        const channelService = feathersClient.service('channel-memberships');
        if (this.queueChannel) {
          console.log('we leave this one first');
          channelService.remove(null, {query: {channelName: this.queueChannel}});
        }

        if (this.user.hasOwnProperty('myExtension')) {
          console.log('user has extension and we join channels');
          const dataChannel = {
            roomType: 'queues',
            queueId: this.selectedQueue.id
          };

          const statusChannel = {
            roomType: 'extensions',
            tenantCode: this.selectedTenant.tenantCode,
          };

          channelService.create(dataChannel).then(res => {
            this.queueChannel = `${dataChannel.roomType}/${dataChannel.queueId}`
          });

          if(this.user.myExtension.tenantId != this.selectedTenant.id){
            channelService.create(statusChannel).then(res => {
              this.statusChannel = `${statusChannel.roomType}/${statusChannel.tenantCode}`
            });
          }
        }
      },
      removeListeners() {
        const channelService = feathersClient.service('channel-memberships');
        channelService.removeListener('queueSummary');
        channelService.removeListener('queueRefresh');
        channelService.removeListener('queueMemberPause');
        channelService.removeListener('queueCallerJoin');
        channelService.removeListener('queueCallLeave');
        channelService.removeListener('queueCallerConnected');
        channelService.removeListener('queueEntry');
        channelService.removeListener('extensionStatus');
        channelService.removeListener('notifyExtStatus');
        channelService.removeListener('notifyActiveCall');
        clearInterval(this.holdCounter);
        globalEventBus.$off(['appReconnected', 'queuePauseToggled', 'queueLoginToggled']);
      },

      getStatusFromEvent(code) {
        return extensionStatus(code)
      },

      updateMember(member, evt) {
        let updateObject = {
          uniqueid: member.uniqueid
        };

        //check and see if this member has connected call. if so they are INUSE so force it
        const memberCalls = this.currentCallList({query: {peername: evt.peername}}).data;
        if(memberCalls.length){
          updateObject.extStatus = 'INUSE'
        } else{
          updateObject.extStatus = evt.status;
        }

        //connected call info
        if (evt.direction.length) {
          if (evt.cidnum.length && evt.cidnum !== '<unknown>') {
            updateObject.connected = `${evt.cidname} - ${evt.cidnum}`;
            updateObject.direction = evt.direction;
          }
        } else {
          updateObject.connected = '';
          updateObject.direction = '';
          updateObject.dnd = evt.dnd;
        }
        this.$store.commit('queuemembers/updateItem', updateObject);
      },

      updateAgentsTable(evt) {
        const {agents} = evt;
        const agentCount = agents.length;
        for (let i = 0; i < agentCount; i++) {

          const {inboundTotal, inboundTalkTime, outboundTotal, outboundTalkTime, pauseTime,
            lastPauseReason, paused, loggedIn, refusedCalls, member_device, member_interface} = agents[i];

          //find the correct item in store.
          let existingMember = this.findQueueMembers({
            query: {
              member_device
            }
          }).data;

          if (existingMember.length) {
            this.$store.commit('queuemembers/updateItem', {
              uniqueid: existingMember[0].uniqueid,
              inboundTotal,
              inboundTalkTime,
              outboundTotal,
              outboundTalkTime,
              pauseTime,
              refusedCalls,
              loggedIn,
              paused,
              lastPauseReason,
              member_interface
            });

            if(this.user.hasOwnProperty('myExtension')){
              if(existingMember[0].member_device === this.user.myExtension.peerName){
                this.$store.commit('setQueueLoggedIn', loggedIn === 1);
                this.$store.commit('setQueuePaused', paused === 1);
                this.$store.commit('setQueuePausedReason', lastPauseReason)
              }
            }
          } else {
            this.$store.commit('queuemembers/addItem', agents[i]);
          }
        }
      },

      updateMemberPause(evt) {
        const agent = this.findQueueMembers({
          query: {
            membername: evt.membername
          }
        }).data;
        if (agent.length) {
          let updateData = {
            uniqueid: agent[0].uniqueid
          };
          updateData.paused = +evt.paused;
          if (evt.hasOwnProperty('reason')) {
            updateData.lastPauseReason = evt.reason;
          }
          this.$store.commit('queuemembers/updateItem', updateData);

          //update local loggedIn state if user getting update is the actual agent
          if(this.user.hasOwnProperty('myExtension')){
            if (agent[0].member_device === this.user.myExtension.peerName) {
              this.$store.commit('setQueuePaused', +evt.paused === 1);
              if (evt.hasOwnProperty('reason')) {
                this.$store.commit('setQueuePausedReason', evt.reason);
              }
            }
          }

        }
      },

      getPauseIcon(reason) {
        return pauseIcons(reason);
      },

      agentTooltipStatus(agent){
        if(agent.dnd === 'on'){
          return 'Do Not Disturb'
        }
        if(agent.extStatus === 'NOT_INUSE'){
          return 'Idle'
        }
        if(agent.extStatus === 'INUSE'){
          return 'On A Call'
        }
        if(agent.extStatus === 'RINGING'){
          return 'Ringing'
        }
        if(agent.extStatus === 'UNAVAILABLE'){
          return 'Offline';
        }
        if(!agent.extStatus){
          return 'Offline';
        }
        return 'Status Unknown';
      },

      updateMemberLoginStatus(evt) {
        const member = this.findQueueMembers({
          query: {
            member_device: evt.peer
          }
        }).data;

        if (member.length) {

          const updateData = {
            uniqueid: member[0].uniqueid,
            loggedIn: +evt.loggedin
          };
          this.$store.commit('queuemembers/updateItem', updateData);

          //update local loggedIn state if user getting update is the actual agent
          if(this.user.hasOwnProperty('myExtension')){
            if (member[0].member_device === this.user.myExtension.peerName) {
              this.$store.commit('setQueueLoggedIn', +evt.loggedin === 1);
            }
          }

        }
      },

      //counter for caller hold times.
      updateHoldTimes() {
        const currentCallers = this.queueCallerList().data;
        const connectedCallers = this.currentCallList().data;
        //updates hold times
        for (let i = 0; i < currentCallers.length; i++) {
          const holdUpdate = {
            channel: currentCallers[i].channel,
            wait: +currentCallers[i].wait + 1
          };
          this.$store.commit('queuecallers/updateItem', holdUpdate);
        }
        //updates call durations
        for (let i = 0; i < connectedCallers.length; i++) {
          const connectedUpdate = {
            channel: connectedCallers[i].channel,
            duration: +connectedCallers[i].duration + 1
          };
          this.$store.commit('currentcalls/updateItem', connectedUpdate);
        }
      },

      holdTextColor(val){
        if(val > 30){
          return 'voxo-orange';
        }
        if(val > 60){
          return 'voxo-red';
        }
        return 'black-text';
      },

      updateCallerPositions(leavePosition) {
        const updateAgents = this.queueCallerList({
          query: {
            position: {$gt: leavePosition}
          }
        }).data;
        for (let i = 0; i < updateAgents.length; i++) {
          const updateData = {
            channel: updateAgents[i].channel,
            position: +updateAgents[i].position - 1
          };
          this.$store.commit('queuecallers/updateItem', updateData);
        }
      },

      callSpyRequest(channel, whisper){
        const splitChannel = channel.split('-');
        const channelPrefix = `${splitChannel[0]}-${splitChannel[1]}-`;

        if(this.softphoneEnabled){
          if(whisper){
            globalEventBus.$emit('dialSoftphone', `*5${splitChannel[0].split('/')[1]}`);
          } else{
            globalEventBus.$emit('dialSoftphone', `*6${splitChannel[0].split('/')[1]}`);
          }
        } else{
          const extensionNumber = this.user.myExtension.number;
          const channelName = `Local/${extensionNumber}@authenticated`;
          let reqBody = {
            reqType: 'spy',
            whisper,
            channelName,
            account: this.user.myExtension.tenantCode,
            channelPrefix,
            callerId: extensionNumber,
            tenantCode: splitChannel[1],
            hostServer: this.userHostServer
          };
          feathersClient.service('nats-actions-handler').create(reqBody);
        }
      },

      toggleLoggedIn(val) {
        const agentData = {
          member_device: this.user.myExtension.peerName,
          extensionId: this.user.myExtension.id,
        };
        this.handleToggle(val, agentData);
      },

      handleToggle(val, agent) {

        if(+agent.paused){
          this.$notify({
            type: 'warning',
            title: 'Currently Paused',
            message: 'You Must Unpause the Agent to Log Them Out'
          });
        } else{
          const member = this.findQueueMembers({
            query: {
              member_device: agent.member_device
            }
          }).data;

          if (member.length) {
            const memberName = member[0].membername;
            if (val) {
              feathersClient.service('nats-actions-handler').create({
                reqType: 'queueLogin',
                peerName: agent.member_device,
                queueId: this.selectedQueue.id,
                memberName,
                extensionId: agent.extensionId,
                server: this.userHostServer
              });
            } else {
              feathersClient.service('nats-actions-handler').create({
                reqType: 'queueLogout',
                peerName: agent.member_device,
                queueId: this.selectedQueue.id,
                memberName,
                extensionId: agent.extensionId,
                server: this.userHostServer
              });
            }

            if(this.user.hasOwnProperty('myExtension')){
              if (member[0].member_device === this.user.myExtension.peerName) {
                this.$store.commit('setQueueLoggedIn', val);
              }
            }
          }
        }
      },

      togglePause(val, reason) {
        const member = this.findQueueMembers({
          query: {
            member_device: this.user.myExtension.peerName
          }
        }).data;

        if(member.length){
          const { membername, member_device } = member[0];
          const reqBody = {
            peerName: member_device,
            extensionId: this.user.myExtension.id,
            queueId: this.selectedQueue.id,
            memberName: membername,
            interface: member[0].member_interface,
            server: this.userHostServer
          };
          if (val) {
            feathersClient.service('nats-actions-handler').create({
              reqType: 'queuePause',
              paused: 1,
              pauseReason: reason,
              ...reqBody
            });
          } else{
            feathersClient.service('nats-actions-handler').create({
              reqType: 'queueUnpause',
              paused: 0,
              ...reqBody
            });
          }
        }
      },
      pushedConnected(item){
        if(item.status === 'INUSE' && item.direction.length){
          if(item.cidnum === '' || item.cidnum === '<unknown>'){
            return false;
          }
          if(item.cidnum.substr(0,1) === '*'){
            return false;
          }
          return true;
        } else {
          return false;
        }
      },
      checkCallExists(item){
        const queryCall = this.currentCallList({query: {channel: item.channel}}).data;
        return !!queryCall.length;
      },
      dialCall(number){
        globalEventBus.$emit('dialSoftphone', number);
      },
      pauseMember(agent){
        this.pauseAgent = agent;
        this.pauseReasonVisible = true;
        this.pauseType = 'pause';
      },
      unpauseMember(agent){
        this.pauseAgent = agent;
        this.pauseType = 'unpause';
        this.toggleMemberPause();
      },
      processPause(){
        this.toggleMemberPause();
        this.pauseReason = '';
      },
      cancelPause(){
        this.pauseAgent = '';
        this.pauseReason = '';
        this.pauseReasonVisible = false;
      },
      toggleMemberPause(){
        let pauseReason = this.pauseReason;
        const val = this.pauseType === 'pause' ? 1 : 0;
        if(!pauseReason.length || pauseReason === 'Other'){
          pauseReason = this.otherPauseReason;
        }

        if(!pauseReason.length && val){
          this.$notify({
            title: 'Warning',
            message: 'You Must Include A Pause Reason!',
            type: 'warning'
          });
        } else{
          if(+this.pauseAgent.extension === +this.user.myExtension.number){
            this.$store.commit('setQueuePaused', val);
            this.$store.commit('setQueuePausedReason', pauseReason);
          }
          this.pauseReasonVisible = false;
          const reqBody = {
            peerName: this.pauseAgent.member_device,
            extensionId: this.pauseAgent.extensionId,
            queueId: this.selectedQueue.id,
            memberName: this.pauseAgent.membername,
            interface: this.pauseAgent.member_interface,
            server: this.userHostServer
          };
          if (val) {
            console.log('pausing agent with ' + this.pauseReason);
            feathersClient.service('nats-actions-handler').create({
              reqType: 'queuePause',
              paused: 1,
              pauseReason,
              ...reqBody
            });
          } else{
            console.log('unpausing agent');
            feathersClient.service('nats-actions-handler').create({
              reqType: 'queueUnpause',
              paused: 0,
              ...reqBody
            });
          }
          this.pauseAgent = '';
        }
      },
      statMultiplierDaily(row, column, value){
        return this.agentStatsType === 'average' ? value : Math.floor(+value * 90);
      },
      statMultiplierWeekly(row, column, value){
        return this.agentStatsType === 'average' ? value : Math.floor(+value * 12);
      },
      statMultiplierMonthly(row, column, value){
        return this.agentStatsType === 'average' ? value : Math.floor(+value * 3);
      }
    },
    created() {
      if (this.user) {

        this.queryQueues();
      }
    },
    mounted() {

      this.$store.commit('setQueueMode');
      const channelService = feathersClient.service('channel-memberships');

      //this is a counter to update the hold times for each caller in line
      this.holdCounter = setInterval(this.updateHoldTimes, 1000);

      //event listeners
      //status from every 30 second query.
      channelService.on('queueSummary', (item) => {
        this.summaryStats = item;
        this.updateAgentsTable(item);
      });

      //queue member paused
      channelService.on('queueMemberPause', (item) => {
        this.updateMemberPause(item);
      });

      //user event that we can use to identify in real time if agent is logged in/out of the queue
      channelService.on('queueRefresh', (item) => {
        if(item.hasOwnProperty('loggedin')){
          this.updateMemberLoginStatus(item);
        }
      });

      //call leaves the queue line
      channelService.on('queueCallerLeave', (item) => {
        this.$store.commit('queuecallers/removeItem', item);
        this.updateCallerPositions((item.position));
      });

      //new caller joins the queue line
      channelService.on('queueCallerJoin', (item) => {
        item.wait = 0;
        this.$store.commit('queuecallers/addItem', item);
      });

      //initial entries in queue upon page load
      channelService.on('queueEntry', (item) => {
        this.$store.commit('queuecallers/addItem', item);
      });

      //call connected to agent and leave in line list
      channelService.on('queueCallerConnected', (item) => {
        this.$store.commit('queuecallers/removeItem', item.channel);
        this.updateCallerPositions((item.position));
      });

      //monitor socket connection and reconnect to channel
      globalEventBus.$on('appReconnected', () => {
        console.log('the app did reconnect');
        if(this.selectedQueue.id){
          this.joinSocketChannel();
        }
        if(this.user.hasOwnProperty('myExtension')){
          //this will refresh the callers in line list and bust current connected calls.
          this.$store.commit('queuecallers/clearList');
          this.$store.commit('currentcalls/clearList');
          if(this.selectedQueue.id){
            feathersClient.service('nats-actions-handler').create({
              reqType: 'queueStatus',
              queueId: this.selectedQueue.id,
              server: this.userHostServer,
              queryServer: !this.userTenantSelected,
              tenantCode: this.selectedTenant.tenantCode
            });
            feathersClient.service('nats-actions-handler').create({
              reqType: 'refreshQueueConnected',
              queueId: this.selectedQueue.id,
              server: this.userHostServer,
              queryServer: !this.userTenantSelected,
              tenantCode: this.selectedTenant.tenantCode,
              userId: this.user.id,
              userExten: this.user.myExtension.number
            }).then( () => {
              setTimeout( () => {
                console.log('checking if the user has calls to determine user status locally');
                const hasCalls = this.myCallsList().data.length;
                if(!hasCalls){
                  this.$store.commit('setUserStatus', 'NOT_INUSE');
                }
              }, 5000);
            }).catch( (e) => console.log('error in refreshing user calls', e));
          }
        }
      });

      //monitor queue login/logout toggle
      globalEventBus.$on('queueLoginToggled', (val) => {
        this.toggleLoggedIn(val);
      });

      //monitor queue paused toggle
      globalEventBus.$on('queuePauseToggled', (item) => {
        this.togglePause(item.value, item.pauseReason);
      });

      //normal extension status events
      channelService.on('extensionStatus', item => {

        const {peername, status} = item;
        let testExt = this.findQueueMembers({query: {member_device: peername}}).data;
        if(testExt.length){

          if(item.hasOwnProperty('ishangup')){
            if(item.ishangup){
              this.$store.commit('currentcalls/removeItem', item.channel);
            }else{
              if(testExt[0].loggedIn){
                const callItem = {...item, agent: testExt[0].membername};
                const callExists = this.checkCallExists(item);
                if(this.pushedConnected(item)){
                  if(callExists){
                    const updateData = {
                      channel: item.channel,
                      cidname: item.cidname
                    };
                    this.$store.commit('currentcalls/updateItem', updateData);
                  } else {
                    this.$store.commit('currentcalls/addItem', {duration: 0, ...callItem});
                  }
                }
              }
            }
          } else{
            if (status === 'NOT_INUSE') {
              this.$store.commit('currentcalls/removeItem', item.channel);
            } else {
              if(testExt[0].loggedIn){
                const callItem = {...item, agent: testExt[0].membername};
                const callExists = this.checkCallExists(item);
                if(this.pushedConnected(item)){
                  if(callExists){
                    const updateData = {
                      channel: item.channel,
                      cidname: item.cidname
                    };
                    this.$store.commit('currentcalls/updateItem', updateData);
                  } else {
                    this.$store.commit('currentcalls/addItem', {duration: 0, ...callItem});
                  }
                }
              }
            }
          }
          this.updateMember(testExt[0], item);
        }

      });

      //notify active channel (for refreshing connected call list)
      channelService.on('notifyActiveCall', item => {
        const {channels, userId} = item;
        if(+userId === this.user.id){
          for(let call in channels){
            if(channels.hasOwnProperty(call)){
              const theChannel = channels[call];
              if(!this.checkCallExists(theChannel)){
                const {channel, exten, connectedlinenum, connectedlinename, direction, timestamp} = theChannel;
                const channelParts = channel.match(/([A-Z]*)\w+/g);
                const peername = `${channelParts[1]}-${channelParts[2]}`;
                const queueMember = this.findQueueMembers({
                  query: {
                    member_device: peername,
                    loggedIn: 1
                  }
                }).data;
                if(queueMember.length){
                  const foundMember = queueMember[0];
                  let cidnum = connectedlinenum === '<unknown>' ? exten : connectedlinenum;
                  let cidname = connectedlinename === '<unknown>' ? '' : connectedlinename;
                  const callData = {
                    agent: foundMember.membername,
                    channel,
                    cidnum,
                    cidname,
                    direction,
                    peername,
                    systemname: item.systemname,
                    duration: moment().unix() - timestamp
                  };
                  if(cidnum.length){
                    this.$store.commit('currentcalls/addItem', callData);
                  }
                }
              }
            }
          }
        }
      });

      //listens for updates to extension availability
      channelService.on('notifyExtStatus', item => {
        const {peerName} = item;
        let testExt = this.findQueueMembers({query: {member_device: peerName}}).data;
        if(testExt.length){
          let updateData = {
            uniqueid: testExt[0].uniqueid
          };
          if (item.status === 'UNAVAILABLE') {
            updateData.extStatus = 'UNAVAILABLE';
          } else {
            updateData.extStatus = 'NOT_INUSE';
          }
          this.$store.commit('queuemembers/updateItem', updateData);
        }
      });

    },
    beforeDestroy() {
      const channelService = feathersClient.service('channel-memberships');
      this.$store.commit('queues/clearList');
      this.$store.commit('currentcalls/clearList');
      this.$store.commit('queuecallers/clearList');
      this.$store.commit('refusedcalls/clearList');
      this.$store.commit('unsetQueueMode');
      this.$store.commit('setQueues', []);
      this.$store.commit('setSelectedQueue', {});
      channelService.remove(null, {query: {channelName: this.queueChannel}}).then(res => console.log(res));

      //leave the status channel if the tenant doesn't match user tenant
      if(this.user.hasOwnProperty('myExtension')){
        if(this.user.myExtension.tenantId != this.selectedTenant.id){
          channelService.remove(null, {query: {channelName: this.statusChannel}}).then(res => console.log(res));
        }
      }
      this.removeListeners();
    }
  }

</script>

<style lang="scss" scoped>

  @import '../../../assets/scss/variables';

  .stat-number{
    font-size: 3em;
  }

  .stat-header{
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1em;
    padding-bottom: 5px;
  }

  .stats-sub{
    display: flex;
    justify-content: space-between;
    align-self: flex-end;
    height: 45px;
  }

  .stats-flex-body{
    height: 200px;
    display: flex;
    flex-wrap: wrap;
    >*{
      flex-basis: 100%;
    }
  }

  .sub-stat-number{
    font: {
      weight: bold;
    }
  }

  .sub-stat-title{
    font-size: 0.85em;
  }

  .not-in-use {
    background: $voxo-pink;
  }

  .manager-action-button{
    width: 25px;
    height: 25px;
    padding: 1px;
    svg{
      width:15px;
    }
  }

  .refused-call-button{
    padding: 5px;
    color: #fff;
  }

  .pause-icon{
    width: 18px;
  }

  .voxo-square-icon {
    width: 25px;
    height: 25px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin: 7px 0 5px 0;

    svg {
      flex: 0 0 20px;
      height: 20px;
      width: 20px;
      margin: auto;
    }
  }

  .agent-name{
    svg{
      margin-left: 3px;
    }
  }

  .tab-label{
    position: relative;
    display: flex;
  }

  .form-section-header{
    margin-top: 0;
    margin-bottom: 4px;
  }

  .call-badge{
    float: none;
  }

  .leader-crown{
    display: flex;
    position: absolute;
    z-index: 10;
    margin-top: -13px;
    margin-left: -10px;
    svg{
      position: relative;
      z-index: 100;
      width: 25px;
      height: 25px;
      transform: rotate(-25deg);
    }
  }


</style>
