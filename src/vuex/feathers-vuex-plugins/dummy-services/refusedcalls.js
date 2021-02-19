import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class RefusedCall extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'RefusedCall';

}

const servicePath = 'refusedcalls';
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: 'callId',
  Model: RefusedCall,
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
