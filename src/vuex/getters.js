// Getters for vuex store

export default {
  layout(state, getters) {
    return state.layout
  },
  navPos(state, getters) {
    return state.layout.navPos
  },
  toolbar(state, getters) {
    return state.layout.toolbar
  },
  footer(state, getters) {
    return state.layout.footer
  },
  boxed(state, getters) {
    return state.layout.boxed
  },
  roundedCorners(state, getters) {
    return state.layout.roundedCorners
  },
  viewAnimation(state, getters) {
    return state.layout.viewAnimation
  },
  isLogged(state, getters) {
    return state.logged
  },
  splashScreen(state, getters) {
    return state.splashScreen
  },
  //HUD Portal Stuff
  hudMode(state, getters) {
    return state.hudMode
  },
  selectedTenant(state, getters) {
    return state.selectedTenant
  },
  hudBranches(state, getters) {
    return state.hudBranches;
  },
  hudDepartments(state, getters) {
    return state.hudDepartments;
  },
  activeHudBranches(state, getters) {
    return state.activeHudBranches;
  },
  activeHudDepartments(state, getters) {
    return state.activeHudDepartments;
  }
};
