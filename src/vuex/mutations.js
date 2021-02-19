// Mutations for vuex store

export default {
  setLayout(state, payload) {
    if (payload && payload.navPos !== undefined) {
      state.layout.navPos = payload.navPos;
    }
    if (payload && payload.toolbar !== undefined) {
      state.layout.toolbar = payload.toolbar;
    }
    if (payload && payload.footer !== undefined) {
      state.layout.footer = payload.footer;
    }
    if (payload && payload.boxed !== undefined) {
      state.layout.boxed = payload.boxed;
    }
    if (payload && payload.roundedCorners !== undefined) {
      state.layout.roundedCorners = payload.roundedCorners;
    }
    if (payload && payload.viewAnimation !== undefined) {
      state.layout.viewAnimation = payload.viewAnimation;
    }
    if (payload && payload.theme !== undefined) {
      state.layout.theme = payload.theme;
    }
  },
  setLogin(state, payload) {
    state.logged = true
  },
  setLogout(state, payload) {
    state.layout.navPos = null
    state.layout.toolbar = null
    state.logged = false
  },
  setSplashScreen(state, payload) {
    state.splashScreen = payload
  },
  setTenants(state, payload) {
    state.authTenants = payload
  },
  setSelectedTenant(state, payload) {
    state.selectedTenant = payload
  },
  addTenant(state, payload) {
    state.authTenants.push(payload);
  },
  setTheme(state, payload) {
    state.layout.theme = payload
  },
  setAuthUser(state, payload) {
    state.auth.user = payload;
  },
  setHudMode(state, payload) {
    state.hudMode = true
  },
  unsetHudMode(state, payload) {
    state.hudMode = false
  },
  setHudBranches(state, payload) {
    state.hudBranches = payload;
  },
  setHudDepartments(state, payload) {
    state.hudDepartments = payload;
  },
  setActiveHudBranches(state, payload) {
    state.activeHudBranches = payload;
  },
  setActiveHudDepartments(state, payload) {
    state.activeHudDepartments = payload;
  },
  setOperatorMode(state, payload){
    state.operatorMode = payload;
  },
  setOperatorBranches(state, payload){
    state.operatorBranches = payload;
  },
  setActiveOperatorBranches(state,payload){
    state.activeOperatorBranches = payload
  },
  setQueues(state, payload) {
    state.queueList = payload;
  },
  setSelectedQueue(state, payload) {
    state.selectedQueue = payload;
  },
  setQueueMode(state) {
    state.queueMode = true;
  },
  unsetQueueMode(state) {
    state.queueMode = false;
  },
  toggleCollapseNav(state) {
    state.collapseNav = !state.collapseNav;
  },
  setCollapsedNav(state, payload){
    state.collapseNav = payload;
  },
  setAppLoading(state) {
    state.appLoading = true;
  },
  unsetAppLoading(state) {
    state.appLoading = false;
  },
  setQueueLoggedIn(state, payload){
    state.queueLoggedIn = payload;
  },
  setQueuePaused(state, payload){
    state.queuePaused = payload;
  },
  setQueuePausedReason(state, payload){
    state.queuePausedReason = payload;
  },
  setActiveQueue(state, payload){
    state.activeQueue = payload;
  },
  setUserDND(state, payload){
    state.userDND = payload;
  },
  setUserStatus(state, payload){
    state.userStatus = payload
  },
  setUserHostServer(state, payload){
    state.userHostServer = payload;
  },
  setSoftphoneVisibility(state, payload) {
    state.softphoneVisible = payload;
  },
  setSoftphoneTransfer(state, payload){
    state.softphoneTransfer = payload;
  },
  setSoftphoneEnabled(state, payload){
    state.softphoneEnabled = payload;
  },
  subtractVoicemailCount(state){
    state.voicemailCount--;
  },
  addVoicemailCount(state){
    state.voicemailCount++;
  },
  zeroVoicemailCount(state){
    state.voicemailCount = 0;
  },
  setAudioInputDeviceId(state, payload){
    state.audioInputDeviceId = payload;
  },
  setLastVMNumber(state, payload){
    state.lastVMNumber = payload;
  }
};
