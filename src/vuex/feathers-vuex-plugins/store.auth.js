import { makeAuthPlugin } from '@/feathers/feathers-client';

export default makeAuthPlugin({ userService: 'users' });
