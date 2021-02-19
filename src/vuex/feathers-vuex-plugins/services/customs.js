import feathersClient, {
  makeServicePlugin,
  BaseModel
} from "@/feathers/feathers-client";
import {
  clearList,
  updateItems
} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class Custom extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  static modelName = "Custom";
}

const servicePath = "customs";
const servicePlugin = makeServicePlugin({
  idField: "id",
  Model: Custom,
  service: feathersClient.service(servicePath),
  servicePath,
  mutations: {
    updateItems(state, items) {
      updateItems(state, items);
    },
    updateItem(state, item) {
      updateItems(state, [item]);
    },
    clearList(state) {
      clearList(state);
    }
  }
});

export default servicePlugin;
