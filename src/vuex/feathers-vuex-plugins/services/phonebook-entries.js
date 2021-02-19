import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from "@/vuex/feathers-vuex-plugins/custom-mutations";

class PhonebookEntry extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'PhonebookEntry';

}

const servicePath = 'phonebook-entries';
const servicePlugin = makeServicePlugin({
  idField: 'id',
  Model: PhonebookEntry,
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
