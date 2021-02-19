import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class Tenant extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'Tenant';

  static instanceDefaults() {
    return {
      name: '',
      tenantCode: ''
    }
  }
}

const servicePath = 'tenants';
const servicePlugin = makeServicePlugin({
  Model: Tenant,
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
