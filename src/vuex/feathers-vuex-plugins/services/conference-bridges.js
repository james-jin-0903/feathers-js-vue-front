import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class ConferenceBridge extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'Devices';

}

const servicePath = 'conference-bridges';
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: 'id',
  Model: ConferenceBridge,
  service: feathersClient.service(servicePath),
  servicePath,
  mutations: {
    updateItems(state, items) {
      updateItems(state, items)
    },
    updateItem(state, item){
      updateItems(state, [item])
    },
    clearList(state){
      clearList(state)
    }
  }
})

export default servicePlugin;
