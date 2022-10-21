export default [
  {
    path: '/login',
    component: './Login',
    // 不展示顶栏
    headerRender: false,
    // 不展示页脚
    footerRender: false,
    // 不展示菜单
    menuRender: false,
    // 不展示菜单顶栏
    menuHeaderRender: false,
  },
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
      },
    ],
  },
  {
    path: '/case',
    name: 'case',
    hideInMenu: true,
    hideInBreadcrumb: true,
    routes: [
      {
        path: '/case/:caseId/task',
        name: 'task',
        component: './Case/Task',
      },
      {
        path: '/case/:caseId/report/:branch',
        name: 'report',
        component: './Case/Report',
        menuRender: false,
      },
    ],
  },
  {
    path: '/',
    redirect: '/project/list',
  },
  {
    path: '/*',
    component: './404',
  },
];
