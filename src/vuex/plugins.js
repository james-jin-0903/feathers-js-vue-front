// Plugins for vuex store
import Vue from "vue";
import { FeathersVuex } from "../feathers/feathers-client";
import createPersistedState from "vuex-persistedstate";

//feathers vuex service plugins
import auth from "./feathers-vuex-plugins/store.auth";
import users from "./feathers-vuex-plugins/services/users";
import tenants from "./feathers-vuex-plugins/services/tenants";
import faxes from "./feathers-vuex-plugins/services/faxes";
import features from "./feathers-vuex-plugins/services/features";
import huntlists from "./feathers-vuex-plugins/services/huntlists";
import ivrs from "./feathers-vuex-plugins/services/ivrs";
import queues from "./feathers-vuex-plugins/services/queues";
import voicemails from "./feathers-vuex-plugins/services/voicemails";
import devices from "./feathers-vuex-plugins/services/devices";
import devicemodels from "./feathers-vuex-plugins/services/device-models";
import paginggroups from "./feathers-vuex-plugins/services/paging-groups";
import callblocking from "./feathers-vuex-plugins/services/call-blocking";
import conferencebridges from "./feathers-vuex-plugins/services/conference-bridges";
import numberporting from "./feathers-vuex-plugins/services/number-porting";
import portinorders from "./feathers-vuex-plugins/services/port-in-orders";
import asterisknodes from "./feathers-vuex-plugins/services/asterisk-nodes";
import dids from "./feathers-vuex-plugins/services/dids";
import locations from "./feathers-vuex-plugins/services/locations";
import extensions from "./feathers-vuex-plugins/services/extensions";
import callhistory from "./feathers-vuex-plugins/services/call-history";
import phonebookentries from "./feathers-vuex-plugins/services/phonebook-entries";
import queuemembers from "./feathers-vuex-plugins/services/queuemembers";
import musiconholds from "./feathers-vuex-plugins/services/music-on-holds";
import destinations from "./feathers-vuex-plugins/services/destinations";
import customs from "./feathers-vuex-plugins/services/customs";

//feathers vuex dummy services to exploit feathers vuex functionality
import queuecallers from "./feathers-vuex-plugins/dummy-services/queuecallers";
import currentcalls from "./feathers-vuex-plugins/dummy-services/currentcalls";
import mycurrentcalls from "./feathers-vuex-plugins/dummy-services/mycurrentcalls";
import myfaxes from "./feathers-vuex-plugins/dummy-services/myfaxes";
import companydirectory from "./feathers-vuex-plugins/dummy-services/companydirectory";
import refusedcalls from "./feathers-vuex-plugins/dummy-services/refusedcalls";

Vue.use(FeathersVuex);

export default [
  createPersistedState({
    paths: [
      "layout",
      "selectedTenant",
      "audioInputDeviceId",
      "softphoneEnabled"
    ]
  }),
  asterisknodes,
  auth,
  callblocking,
  callhistory,
  conferencebridges,
  companydirectory,
  currentcalls,
  devices,
  devicemodels,
  dids,
  extensions,
  faxes,
  features,
  huntlists,
  ivrs,
  locations,
  mycurrentcalls,
  myfaxes,
  numberporting,
  paginggroups,
  phonebookentries,
  portinorders,
  queues,
  queuecallers,
  queuemembers,
  refusedcalls,
  tenants,
  users,
  voicemails,
  musiconholds,
  destinations,
  customs
];
