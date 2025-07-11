const { themes } = require('prism-react-renderer');
const lightTheme = themes.github;
const darkTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cortex Documentation',
  tagline: 'Multi-DePIN Orchestration Platform',
  favicon: 'img/favicon.ico',

  url: 'https://cortex-docs.netlify.app',
  baseUrl: '/',

  organizationName: 'cortex-platform',
  projectName: 'cortex-docs',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onBrokenAnchors: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/cortex-platform/cortex/tree/main/docs-site/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/cortex-social-card.jpg',
      navbar: {
        title: 'Cortex',
        logo: {
          alt: 'Cortex Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/cortex-platform/cortex',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'API Reference',
                to: '/docs/api',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.gg/cortex',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/cortex_platform',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/cortex-platform/cortex',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Cortex Platform. Built with Docusaurus.`,
      },
      prism: {
        theme: lightTheme,
        darkTheme,
        additionalLanguages: ['bash', 'json', 'yaml'],
      },
      algolia: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'cortex',
        contextualSearch: true,
      },
    }),

  themes: ['@docusaurus/theme-live-codeblock'],
};

module.exports = config;
