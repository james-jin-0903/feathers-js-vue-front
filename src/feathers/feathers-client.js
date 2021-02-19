import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';
import feathersVuex from "feathers-vuex";

const HOSTS = process.env.VUE_APP_API_HOST.split(',');

let hostServer;
if(process.env.NODE_ENV === 'production'){
  hostServer = `https://${HOSTS[0]}`;
} else{
  hostServer = `http://${HOSTS[0]}`;
}

export {hostServer};

const socket = io(hostServer, {
  transports: ['websocket'],
  upgrade: false,
  reconnectionDelay: 1000
});

const feathersClient = feathers();

feathersClient.configure(socketio(socket, {
  timeout: 60000
}));

feathersClient.configure(auth({
  storage: window.localStorage
}));

export default feathersClient;

// Setting up feathers-vuex
const { makeServicePlugin, makeAuthPlugin, BaseModel, makeBaseModel, models, FeathersVuex } = feathersVuex(
  feathersClient,
  {
    serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
    idField: '_id', // Must match the id field in your database table/collection
    whitelist: ['$regex', '$options']
  }
);

export { makeAuthPlugin, makeServicePlugin, makeBaseModel, BaseModel, models, FeathersVuex }
