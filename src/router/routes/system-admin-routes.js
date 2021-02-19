// import Dashboard from '../../views/pages/dashboard/view.vue';
import TenantsTable from '../../views/pages/accounts/view';
import AdminsTable from '../../views/pages/admin-users/view';
import AsteriskNodesTable from '../../views/pages/asterisk-nodes/view';
import SystemSettings from '../../views/pages/system-settings/view';
import TenantPhoneNumbers from '../../views/pages/tenant-phone-numbers/view';

import layouts from '../../layout';

export default [
    {
        path: '/accounts',
        name: 'accounts',
        component: TenantsTable,
        meta: {
          auth: true,
          layouts: layouts.navLeft,
          searchable: true,
          tags: ['accounts'],
          roles: [1, 3]
        }
    },
    {
        path: '/admin/users',
        name: 'admin-users',
        component: AdminsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['users'],
          roles: [1]
        }
    },
    {
        path: '/admin/phone-numbers',
        name: 'tenant-phone-numbers',
        component: TenantPhoneNumbers,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: false,
          tags: ['dids'],
          roles: [1]
        }
    },
    {
        path: '/system-settings',
        name: 'system-settings',
        component: SystemSettings,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['system-settings'],
          roles: [1],
        }
    },
    {
        path: '/asterisk-nodes',
        name: 'asterisk-nodes',
        component: AsteriskNodesTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['asterisk-nodes'],
          roles: [1]
        }
    },
];

