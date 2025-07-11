/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/first-job',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'guide/dashboard',
        'guide/job-management',
        'guide/network-providers',
        'guide/cost-optimization',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: ['api/overview', 'api/jobs', 'api/providers', 'api/webhooks'],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: ['architecture/overview', 'architecture/atomic-commitment', 'architecture/security'],
    },
    {
      type: 'category',
      label: 'Troubleshooting',
      items: [
        'troubleshooting/common-issues',
        'troubleshooting/debugging',
        'troubleshooting/support',
      ],
    },
  ],
};

module.exports = sidebars;
