import Vue from 'vue';
import Router from 'vue-router';

// Separate route imports
import OMNIARoutes from './routes/omnia-routes';
import UserRoutes from './routes/user-routes';
import PhoneSystemRoutes from './routes/phone-system-routes';
import AccountRoutes from './routes/account-routes';
import BillingRoutes from './routes/billing-routes';
import ReportsRoutes from './routes/reports-routes';
import SystemAdminRoutes from './routes/system-admin-routes';

//apps
import Dashboard from '../views/pages/dashboard/view.vue';

//feathers client
import feathersClient from '../feathers/feathers-client';

//support page
import Support from '../views/pages/support/view.vue';

//ui
import layouts from '../layout';
import store from '../vuex/store';

import decode from 'jwt-decode';
import moment from 'moment';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    ...UserRoutes,
    ...PhoneSystemRoutes,
    ...AccountRoutes,
    ...BillingRoutes,
    ...ReportsRoutes,
    ...SystemAdminRoutes,
    ...OMNIARoutes,
    {
      path: '/',
      alias: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: {
        auth: true,
        layout: layouts.navLeft,
        searchable: true,
        tags: ['app'],
        roles: [1, 3],
      }
    },
    {
      path: '/support',
      name: 'support',
      component: Support,
      meta: {
        auth: true,
        layout: layouts.navLeft,
      }
    },
    {
      path: '/logout',
      beforeEnter(to, from, next) {
        auth.logout()
        next({
          path: '/login'
        })
      }
    },
  ]
});

const l = {
  contenOnly() {
    store.commit('setLayout', layouts.contenOnly)
  },
  navLeft() {
    store.commit('setLayout', layouts.navLeft)
  },
  navRight() {
    store.commit('setLayout', layouts.navRight)
  },
  navTop() {
    store.commit('setLayout', layouts.navTop)
  },
  navBottom() {
    store.commit('setLayout', layouts.navBottom)
  },
  set(layout) {
    store.commit('setLayout', layout)
  }
};

const auth = {
  loggedIn() {
    return store.getters.isLogged
  },
  logout() {
    store.commit('setLogout');
    localStorage.removeItem('feathers-jwt');
    window.location.href = '/login'
  }
};

// disable the NavigationDuplicate error happening in the console
const beforePush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return beforePush.call(this, location).catch(error => error);
};

router.beforeEach((to, from, next) => {
  let authrequired = false
  if (to && to.meta && to.meta.auth)
    authrequired = true

  if (authrequired) {
    if (auth.loggedIn()) {

      //we obviously have a jwt set in localstorage .. check if expired and if true push to login!
      const userToken = localStorage.getItem('feathers-jwt');
      const validToken = decode(userToken).exp > moment().unix();

      //expired token we will remove it from storage and direct to login, bruh.
      if (!validToken) {
        localStorage.removeItem('feathers-jwt');
        if (to.name !== 'login') {
          window.location.href = '/'
          return false
        }
        next()
      }

      //if a jwt is valid, and user state is not populated (aka page refresh) we will reauth using jwt strategy :)
      if (validToken && !store.state.auth.user) {
        console.log('we are doing the auth ??');
        store.dispatch('auth/authenticate')
          .then(async () => {

            //it might be a good idea to move this logic to where it renders (toolbar). I am undecided.
            const user = store.state.auth.user;
            let {myExtension} = user;
            //find any tenants for the user
            const tenants = await store.dispatch('tenants/find');
            store.commit('setTenants', tenants);

            if (myExtension) {

              const {peerName, tenantCode, hostServer, number, tenantId,
                omniaPhonebookId, dnd, status} = user.myExtension;

              //update user specific info in store
              store.commit('setUserDND', dnd === 'on');
              store.commit('setUserStatus', status);
              store.commit('setUserHostServer', hostServer);

              //joins the user specific channel
              await feathersClient.service('channel-memberships').create({
                roomType: 'user',
                peerName
              });

              //joins the extensions / calls channel for assigned tenant
              await feathersClient.service('channel-memberships').create({
                roomType: 'extensions',
                tenantCode
              });

              //send request to get any connected calls if not landing on page that already calls it
              if(to.name !== 'OMNIA Queues') {
                await feathersClient.service('nats-actions-handler').create({
                  reqType: 'refreshConnectedCalls',
                  hostServer,
                  peerName,
                  tenantCode,
                  userId: user.id,
                  userExten: number
                });
              }

              // Load user company directory
              await store.dispatch('extensions/find', {
                query: {
                  tenantId
                }
              }).then(res => {
                store.commit('companydirectory/addItems', res);
                let branchOptions = [];
                let departmentOptions = [];
                res.forEach((item) => {
                  if (!branchOptions.includes(item.branch) && item.branch !== '') {
                    branchOptions.push(item.branch)
                  }
                  if (!departmentOptions.includes(item.department) && item.department !== '') {
                    departmentOptions.push(item.department)
                  }
                });
                store.commit('extensions/clearList');
                store.commit('setHudDepartments', departmentOptions);
                store.commit('setHudBranches', branchOptions);
                store.commit('setActiveHudBranches', branchOptions);
                store.commit('setActiveHudDepartments', departmentOptions);
              });

              // Load custom contacts
              if(omniaPhonebookId){
                await store.dispatch('phonebook-entries/find', {
                  query: {
                    tenantId,
                    phonebookId: omniaPhonebookId
                  }
                });
              }
            }

            const {selectedTenant} = JSON.parse(localStorage.getItem('vuex'));
            const lastSelectedTenant = selectedTenant.hasOwnProperty('id') ? selectedTenant : tenants[0];
            store.commit('setSelectedTenant', lastSelectedTenant);
          })
          .then(() => {

            const {userRole} = store.state.auth.user;
            if (!to.meta.hasOwnProperty('roles')) {
              next();
            } else {
              const roleArray = to.meta.roles;
              if (roleArray.includes(userRole)) {
                next()
              } else {
                router.push('/omnia/contacts')
              }
            }
          }).catch( (err) => {
            localStorage.removeItem('feathers-jwt');
            if (to.name !== 'login') {
              window.location.href = '/';
              return false
            }
            next()
          });
      } else {
        if (to.name === 'login') {
          window.location.href = '/';
          return false
        } else {

          const {userRole} = store.state.auth.user;

          if (!to.meta.hasOwnProperty('roles')) {
            next();
          } else {
            const roleArray = to.meta.roles;

            if (roleArray.includes(userRole)) {
              next()
            } else {
              router.push('/omnia/contacts')
            }
          }
        }
      }

    } else {
      if (to.name !== 'login') {
        window.location.href = '/login'
        return false
      }
      next()
    }
  } else {
    if (auth.loggedIn() && to.name === 'login') {
      window.location.href = '/'
      return false
    } else {
      next()
    }
  }

  if (to && to.meta && to.meta.layout) {
    l.set(to.meta.layout)
  }
});

router.afterEach((to, from) => {
  setTimeout(() => {
    store.commit('setSplashScreen', false)
  }, 500)
});

export default router
