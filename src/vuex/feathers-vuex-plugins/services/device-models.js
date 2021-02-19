import feathersClient, {
  makeServicePlugin,
  BaseModel
} from "@/feathers/feathers-client";

class DeviceModels extends BaseModel {
  constructor(data, options) {
    super(data, options);
  }

  static modelName = "Devices";
}

const servicePath = "device-models";
const servicePlugin = makeServicePlugin({
  enableEvents: false,
  idField: "id",
  Model: DeviceModels,
  service: feathersClient.service(servicePath),
  servicePath
});

export default servicePlugin;
