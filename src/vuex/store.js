import Vue from 'vue';
import Vuex from 'vuex';

// Separate vuex file imports
import state from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import plugins from './plugins';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state,
  getters,
  actions,
  mutations, 
  plugins,
  strict: debug
})
