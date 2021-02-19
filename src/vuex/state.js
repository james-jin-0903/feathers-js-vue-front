// Application state, moved to separate file for easier state management

export default {
  layout: {
    navPos: 'left', //top, bottom, left, right, false
    toolbar: 'top', //top, bottom, false
    footer: true, //above, below, false
    boxed: false, //true, false
    roundedCorners: false, //true, false
    viewAnimation: 'fade-top', // fade-left, fade-right, fade-top, fade-top-in-out, fade-bottom, fade-bottom-in-out, fade, false
    theme: 'theme-default'
  },

  activeHudBranches: [],
  activeHudDepartments: [],
  activeOperatorBranches: [],
  activeQueue: false,
  appLoading: false,
  audioInputDeviceId: localStorage.getItem('audioInputDeviceId'),
  authTenants: [],
  collapseNav: false,
  hudBranches: [],
  hudDepartments: [],
  hudMode: false,
  lastVMNumber: null,
  logged: !!localStorage.getItem('feathers-jwt'),
  operatorBranches: [],
  operatorMode: false,
  queueList: [],
  queueLoggedIn: false,
  queueMode: false,
  queuePaused: false,
  queuePausedReason: null,
  selectedQueue: {},
  selectedTenant: {},
  selectedTenantDIDs: [],
  softphoneEnabled: localStorage.getItem('softphoneEnabled') ? !!localStorage.getItem('softphoneEnabled') : true,
  softphoneTransfer: false,
  softphoneVisible: false,
  splashScreen: true,
  userDND: false,
  userHostServer: '',
  userStatus: '',
  voicemailCount: 0,
};
