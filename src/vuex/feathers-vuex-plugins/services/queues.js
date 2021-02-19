import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class Queue extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'Queue';

}

const servicePath = 'queues';
const servicePlugin = makeServicePlugin({
  Model: Queue,
  idField: 'id',
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
