import Dashboard from '../../views/pages/dashboard/view.vue';
 
import layouts from '../../layout';

export default [
    {
        path: '/call-summary',
        name: 'call-summary',
        component: Dashboard,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['call-summary'],
          roles: [1, 3]
        }
    },
    {
        path: '/user-reports',
        name: 'user-reports',
        component: Dashboard,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['user-reports'],
          roles: [1, 3]
        }
    },
    {
        path: '/queue-reports',
        name: 'queue-reports',
        component: Dashboard,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['queue-reports'],
          roles: [1, 3]
        }
    },
];