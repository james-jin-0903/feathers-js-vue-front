import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class PortInOrder extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'PortInOrder';

}

const servicePath = 'port-in-orders';
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: 'orderId',
  Model: PortInOrder,
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
