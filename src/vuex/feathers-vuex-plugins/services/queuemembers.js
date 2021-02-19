import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class QueueMember extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'QueueMember';

}

const servicePath = 'queuemembers';
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: 'uniqueid',
  Model: QueueMember,
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
