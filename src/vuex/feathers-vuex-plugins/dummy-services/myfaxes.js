import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class MyFax extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'MyFax';

}

const servicePath = 'myfaxes';
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: 'id',
  Model: MyFax,
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
