import Login from '../../views/pages/authentication/Login.vue';
import ForgotPassword from '../../views/pages/authentication/ForgotPassword.vue';
import Profile from '../../views/pages/user-profile/view.vue';
import ResetPassword from "../../views/pages/authentication/ResetPassword";
import NotFound from '../../views/pages/NotFound.vue';

import layouts from '../../layout';

export default [
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
          auth: true,
          layout: layouts.navLeft,
          hudRoute: true,
          searchable: true,
          tags: ['pages'],
          roles: [1, 3, 5, 7]
        }
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
        meta: {
          layout: layouts.contenOnly
        }
    },
    {
        path: '/forgot-password',
        name: 'forgot-password',
        component: ForgotPassword,
        meta: {
          layout: layouts.contenOnly
        }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword,
      meta: {
        layout: layouts.contenOnly
      }
    },
    {
      path: '*',
      name: 'not-found',
      component: NotFound,
      meta: {
        layout: layouts.contenOnly
      }
    }
];