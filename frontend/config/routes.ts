export default [
  {
    path: '/auth',
    name: 'auth',
    icon: 'team',
    hideInBreadcrumb: true,
    access: 'canAdmin',
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
        name: 'login',
        path: '/auth/login',
        component: './Auth/Login',
        hideInMenu: true,
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
        path: '/project/task',
        name: 'task',
        component: './Project/Task',
        hideInMenu: true,
      },
      {
        path: '/project/report',
        name: 'report',
        component: './Project/Report',
        hideInMenu: true,
        menuRender: false,
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
