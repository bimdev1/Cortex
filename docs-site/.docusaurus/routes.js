import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/search',
    component: ComponentCreator('/search', '5de'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'c07'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '0f6'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'f5c'),
            routes: [
              {
                path: '/docs/api/jobs',
                component: ComponentCreator('/docs/api/jobs', '348'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api/overview',
                component: ComponentCreator('/docs/api/overview', '211'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api/providers',
                component: ComponentCreator('/docs/api/providers', 'c8a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/api/webhooks',
                component: ComponentCreator('/docs/api/webhooks', 'f42'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/architecture/atomic-commitment',
                component: ComponentCreator('/docs/architecture/atomic-commitment', '089'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/architecture/overview',
                component: ComponentCreator('/docs/architecture/overview', '833'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/architecture/security',
                component: ComponentCreator('/docs/architecture/security', '6cf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/getting-started/first-job',
                component: ComponentCreator('/docs/getting-started/first-job', '4f6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/getting-started/installation',
                component: ComponentCreator('/docs/getting-started/installation', '267'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/getting-started/quick-start',
                component: ComponentCreator('/docs/getting-started/quick-start', '09c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guide/cost-optimization',
                component: ComponentCreator('/docs/guide/cost-optimization', 'f2f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guide/dashboard',
                component: ComponentCreator('/docs/guide/dashboard', '8e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guide/job-management',
                component: ComponentCreator('/docs/guide/job-management', 'ee1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/guide/network-providers',
                component: ComponentCreator('/docs/guide/network-providers', '5ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/intro',
                component: ComponentCreator('/docs/intro', '61d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/troubleshooting/common-issues',
                component: ComponentCreator('/docs/troubleshooting/common-issues', '944'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/troubleshooting/debugging',
                component: ComponentCreator('/docs/troubleshooting/debugging', '307'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/troubleshooting/support',
                component: ComponentCreator('/docs/troubleshooting/support', '58a'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
