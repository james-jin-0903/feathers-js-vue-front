// Import the dashboard here for settings route
import Dashboard from '../../views/pages/dashboard/view.vue'; // 
import LocationsTable from '../../views/pages/locations/view';
import PortRequestsTable from '../../views/pages/number-porting/view';

import layouts from '../../layout';
import UsersTable from "../../views/pages/users/view";

export default [
    {
        path: '/locations',
        name: 'locations',
        component: LocationsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['locations'],
          roles: [1, 3]
        }
    },
    {
        path: '/number-porting',
        name: 'number-porting',
        component: PortRequestsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['number-porting'],
          roles: [1, 3]
        }
    },
    {
      path: '/users',
      name: 'users',
      component: UsersTable,
      meta: {
        auth: true,
        layout: layouts.navLeft,
        searchable: true,
        tags: ['users'],
        roles: [1, 3]
      }
    },
    {
        path: '/settings',
        name: 'settings',
        component: Dashboard,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['settings'],
          roles: [1, 3]
        }
    },
];