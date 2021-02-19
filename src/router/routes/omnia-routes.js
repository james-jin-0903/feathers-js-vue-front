// Omnia Route imports
import OMNIAQueues from '../../views/hudportal/queues/view';
import OMNIAContacts from '../../views/hudportal/contacts/view';
import OMNIAActivity from '../../views/hudportal/activity/view';
import OMNIAOperator from '../../views/hudportal/operator/view';
// import OMNIAChat from '../../views/hudportal/chat/view';

//Test stuff
import IncomingCall from '../../views/hudportal/softphone/components/incoming-call';

import layouts from '../../layout';

export default [
  {
    path: '/omnia/contacts',
    name: 'OMNIA Contacts',
    component: OMNIAContacts,
    meta: {
      auth: true,
      layout: layouts.navLeft,
      hudRoute: true
    }
  },
  {
    path: '/omnia/activity',
    name: 'OMNIA Activity',
    component: OMNIAActivity,
    meta: {
      auth: true,
      layout: layouts.navLeft,
      hudRoute: true
    }
  },
  {
    path: '/omnia/queues',
    name: 'OMNIA Queues',
    component: OMNIAQueues,
    meta: {
      auth: true,
      layout: layouts.navLeft,
      hudRoute: true
    }
  },
  {
    path: '/omnia/operator',
    name: 'Omnia Operator Panel',
    component: OMNIAOperator,
    meta: {
      auth: true,
      layout: layouts.navLeft,
      hudRoute: true
    }
  },
/*  {
    path: '/omnia/chat',
    name: 'OMNIA Chat',
    component: OMNIAChat,
    meta: {
      auth: true,
      layout: layouts.navLeft,
      hudRoute: true
    }
  }*/
];
