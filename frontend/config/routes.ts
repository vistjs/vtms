export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/auth',
    name: 'auth',
    icon: 'team',
    routes: [
      {
        path: '/auth/user',
        name: 'user',
        component: './Auth/User',
      },
      {
        path: '/auth/role',
        name: 'role',
        component: './Auth/Role',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/project',
    name: 'project',
    icon: 'schedule',
    routes: [
      {
        path: '/project/list',
        name: 'list',
        component: './Project/List',
      },
      {
        path: '/project/:projectId/cases',
        name: 'cases',
        component: './Project/Cases',
        hideInMenu: true,
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/admin',
    name: 'admin',
    layout: false,
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
      },
      {
        component: './404',
      },
    ],
  },
  {
    path: '/',
    redirect: '/project/list',
  },
  {
    component: './404',
  },
];
