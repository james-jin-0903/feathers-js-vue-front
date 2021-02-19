import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {updateItems, clearList} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class CompanyDirectory extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'CompanyDirectory';

}

const servicePath = 'companydirectory';
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: 'id',
  Model: CompanyDirectory,
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
