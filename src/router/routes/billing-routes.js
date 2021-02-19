// For bill history and payment info routes
import Dashboard from '../../views/pages/dashboard/view.vue';
 
import layouts from '../../layout';

export default [
    {
        path: '/bill-history',
        name: 'bill-history',
        component: Dashboard,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['bill-history'],
          roles: [1, 3]
        }
    },
    {
        path: '/payment-info',
        name: 'payment-info',
        component: Dashboard,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['payment-info'],
          roles: [1, 3]
        }
    },
];