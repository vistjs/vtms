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
    hideInBreadcrumb: true,
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
    hideInBreadcrumb: true,
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
    path: '/',
    redirect: '/project/list',
  },
  {
    component: './404',
  },
];
