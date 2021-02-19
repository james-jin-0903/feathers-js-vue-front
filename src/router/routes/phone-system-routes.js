import ExtensionsTable from '../../views/pages/extensions/view';
import DidsTable from '../../views/pages/phone-numbers/view';
import IVRSTable from '../../views/pages/virtual-receptionist/view';
import CallGroupsTable from '../../views/pages/call-groups/view';
import QueuesTable from '../../views/pages/call-queues/view';
import FeatureCodesTable from '../../views/pages/feature-codes/view';
import VoicemailsTable from '../../views/pages/voicemails/view';
import DevicesTable from '../../views/pages/devices/view';
import FaxesTable from '../../views/pages/faxes/view';
import PagingGroupsTable from '../../views/pages/paging-groups/view';
import CallBlockingTable from '../../views/pages/call-blocking/view';
import ConferenceBridgesTable from '../../views/pages/conference-bridges/view';

import layouts from '../../layout';

export default [
    {
        path: '/extensions',
        name: 'extensions',
        component: ExtensionsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['extensions'],
          roles: [1, 3]
        }
    },
    {
        path: '/phone-numbers',
        name: 'phone-numbers',
        component: DidsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['phone-numbers'],
          roles: [1, 3]
        }
    },
    {
        path: '/virtual-receptionist',
        name: 'virtual-receptionist',
        component: IVRSTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['virtual-receptionist, virtual receptionist'],
          roles: [1, 3]
        }
    },
    {
        path: '/call-groups',
        name: 'call-groups',
        component: CallGroupsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['call-groups'],
          roles: [1, 3]
        }
    },
    {
        path: '/call-queues',
        name: 'call-queues',
        component: QueuesTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['call-queues'],
          roles: [1, 3]
        }
    },
    {
        path: '/feature-codes',
        name: 'feature-codes',
        component: FeatureCodesTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['features', 'feature codes'],
          roles: [1, 3]
        }
    },
    {
        path: '/voicemails',
        name: 'voicemails',
        component: VoicemailsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['voicemails'],
          roles: [1, 3]
        }
    },
    {
        path: '/devices',
        name: 'devices',
        component: DevicesTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['devices'],
          roles: [1, 3]
        }
    },
    {
        path: '/faxes',
        name: 'faxes',
        component: FaxesTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['faxes'],
          roles: [1, 3]
        }
    },
    {
        path: '/paging-groups',
        name: 'paging-groups',
        component: PagingGroupsTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['paging groups'],
          roles: [1, 3]
        }
    },
    {
        path: '/call-blocking',
        name: 'call-blocking',
        component: CallBlockingTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['call-blocking'],
          roles: [1, 3]
        }
    },
    {
        path: '/conference-bridges',
        name: 'conference-bridges',
        component: ConferenceBridgesTable,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          searchable: true,
          tags: ['conference bridges'],
          roles: [1, 3]
        }
    },
];