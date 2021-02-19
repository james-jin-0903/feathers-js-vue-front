import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class Extension extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'Extension';

}

const servicePath = 'extensions';
const servicePlugin = makeServicePlugin({
  idField: 'id',
  Model: Extension,
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
