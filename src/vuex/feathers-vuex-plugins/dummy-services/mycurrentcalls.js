import feathersClient, {makeServicePlugin, BaseModel} from "@/feathers/feathers-client";
import {clearList, updateItems} from '../custom-mutations';

class MyCurrentCall extends BaseModel {

  constructor(data, options) {
    super(data, options);
  }

  static modelName = 'MyCurrentCall';

}

const servicePath = 'mycurrentcalls';
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: 'channel',
  Model: MyCurrentCall,
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
