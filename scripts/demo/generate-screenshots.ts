import { chromium, type Page, type Browser } from 'playwright';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ScreenshotConfig {
  name: string;
  url: string;
  selector?: string;
  fullPage?: boolean;
  width?: number;
  height?: number;
  waitFor?: string | number | ((page: Page) => Promise<void>);
}

class ScreenshotGenerator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private outputDir: string;

  constructor() {
    this.outputDir = join(__dirname, '../../storage/screenshots');
    console.log('📸 Initializing Cortex screenshot generator...');
  }

  async initialize(): Promise<void> {
    console.log('🚀 Launching browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();

    // Set viewport for consistent screenshots
    await this.page.setViewportSize({ width: 1920, height: 1080 });

    // Ensure output directory exists
    await mkdir(this.outputDir, { recursive: true });
  }

  async generateScreenshots(): Promise<void> {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const baseUrl = 'http://localhost:13000';

    const screenshots: ScreenshotConfig[] = [
      {
        name: 'dashboard-overview',
        url: `${baseUrl}/`,
        waitFor: 2000,
        fullPage: true,
      },
      {
        name: 'dashboard-header',
        url: `${baseUrl}/`,
        selector: 'header',
        waitFor: 1000,
      },
      {
        name: 'statistics-cards',
        url: `${baseUrl}/`,
        selector: '.grid.grid-cols-1.md\\:grid-cols-4',
        waitFor: 1500,
      },
      {
        name: 'cost-overview-chart',
        url: `${baseUrl}/`,
        selector: '.chart-container',
        waitFor: 3000, // Wait for chart animation
      },
      {
        name: 'network-status-panel',
        url: `${baseUrl}/`,
        selector:
          '.bg-white.dark\\:bg-gray-800.rounded-lg.shadow.p-6:has(h3:contains("Live Network Status"))',
        waitFor: 2000,
      },
      {
        name: 'job-submission-form',
        url: `${baseUrl}/`,
        selector: 'form',
        waitFor: 1000,
      },
      {
        name: 'jobs-table',
        url: `${baseUrl}/`,
        selector: 'table',
        waitFor: 1500,
      },
      {
        name: 'dark-mode-dashboard',
        url: `${baseUrl}/`,
        waitFor: async (page) => {
          // Toggle dark mode
          await page.click('button[aria-label*="dark mode"]');
          await page.waitForTimeout(1000);
        },
        fullPage: true,
      },
    ];

    console.log(`📷 Generating ${screenshots.length} screenshots...`);

    for (const config of screenshots) {
      try {
        await this.captureScreenshot(config);
      } catch (error: unknown) {
        console.error(`❌ Failed to capture ${config.name}:`, error instanceof Error ? error.message : String(error));
      }
    }

    console.log('✅ Screenshot generation completed!');
  }

  private async captureScreenshot(config: ScreenshotConfig): Promise<void> {
    if (!this.page) {
      throw new Error('Page not available');
    }

    console.log(`📸 Capturing: ${config.name}`);

    // Navigate to the URL
    await this.page.goto(config.url, { waitUntil: 'networkidle' });

    // Handle custom wait conditions
    if (typeof config.waitFor === 'function') {
      await config.waitFor(this.page);
    } else if (typeof config.waitFor === 'number') {
      await this.page.waitForTimeout(config.waitFor);
    } else if (typeof config.waitFor === 'string') {
      await this.page.waitForSelector(config.waitFor);
    }

    // Set custom viewport if specified
    if (config.width && config.height) {
      await this.page.setViewportSize({
        width: config.width,
        height: config.height,
      });
    }

    // Take screenshot
    const screenshotOptions: any = {
      path: join(this.outputDir, `${config.name}.png`),
      type: 'png',
    };

    if (config.fullPage) {
      screenshotOptions.fullPage = true;
    } else if (config.selector) {
      const element = await this.page.waitForSelector(config.selector);
      if (element) {
        await element.screenshot(screenshotOptions);
        return;
      }
    }

    await this.page.screenshot(screenshotOptions);
    console.log(`   ✓ Saved: ${config.name}.png`);
  }

  async generateDemoAssets(): Promise<void> {
    console.log('🎨 Generating additional demo assets...');

    // Create a simple logo placeholder
    await this.generateLogo();

    // Create feature icons
    await this.generateFeatureIcons();

    // Generate social media cards
    await this.generateSocialCards();
  }

  private async generateLogo(): Promise<void> {
    if (!this.page) return;

    const logoSvg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="30" fill="url(#logoGradient)"/>
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="80" font-weight="bold" 
              text-anchor="middle" fill="white">C</text>
        <circle cx="150" cy="60" r="8" fill="white" opacity="0.8"/>
        <circle cx="120" cy="45" r="6" fill="white" opacity="0.6"/>
        <circle cx="170" cy="80" r="5" fill="white" opacity="0.7"/>
      </svg>
    `;

    await writeFile(join(this.outputDir, 'logo.svg'), logoSvg);
    console.log('   ✓ Generated: logo.svg');
  }

  private async generateFeatureIcons(): Promise<void> {
    const icons = [
      {
        name: 'multi-network',
        title: 'Multi-Network',
        description: 'Connect to 5+ DePIN networks',
        svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="50" fill="#f0f9ff" stroke="#2563eb" stroke-width="2"/>
          <circle cx="40" cy="40" r="15" fill="#93c5fd"/>
          <circle cx="80" cy="40" r="15" fill="#60a5fa"/>
          <circle cx="40" cy="80" r="15" fill="#3b82f6"/>
          <circle cx="80" cy="80" r="15" fill="#2563eb"/>
          <circle cx="60" cy="60" r="10" fill="#1d4ed8"/>
          <path d="M40 40 L60 60 M80 40 L60 60 M40 80 L60 60 M80 80 L60 60" stroke="#1e40af" stroke-width="2"/>
        </svg>`,
      },
      {
        name: 'cost-optimization',
        title: 'Cost Optimization',
        description: 'Save 15-30x vs traditional cloud',
        svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="100" height="100" rx="10" fill="#f0f9ff"/>
          <text x="60" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="#2563eb">$</text>
          <path d="M30 70 L45 55 L60 80 L75 40 L90 60" stroke="#2563eb" stroke-width="3" fill="none"/>
          <path d="M30 90 L90 90" stroke="#94a3b8" stroke-width="1"/>
          <path d="M30 80 L90 80" stroke="#94a3b8" stroke-width="1"/>
          <path d="M30 70 L90 70" stroke="#94a3b8" stroke-width="1"/>
          <path d="M30 60 L90 60" stroke="#94a3b8" stroke-width="1"/>
          <path d="M30 50 L90 50" stroke="#94a3b8" stroke-width="1"/>
          <path d="M30 40 L90 40" stroke="#94a3b8" stroke-width="1"/>
        </svg>`,
      },
      {
        name: 'real-time-monitoring',
        title: 'Real-Time Monitoring',
        description: 'Live job and network status',
        svg: `<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <rect x="15" y="15" width="90" height="90" rx="10" fill="#f0f9ff"/>
          <circle cx="60" cy="60" r="35" fill="none" stroke="#2563eb" stroke-width="3"/>
          <path d="M60 60 L60 35" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
          <path d="M60 60 L80 60" stroke="#2563eb" stroke-width="3" stroke-linecap="round"/>
          <circle cx="60" cy="60" r="5" fill="#2563eb"/>
          <circle cx="60" cy="35" r="3" fill="#2563eb"/>
          <circle cx="85" cy="60" r="3" fill="#2563eb"/>
          <circle cx="60" cy="85" r="3" fill="#2563eb"/>
          <circle cx="35" cy="60" r="3" fill="#2563eb"/>
        </svg>`,
      },
    ];

    for (const icon of icons) {
      await writeFile(join(this.outputDir, `${icon.name}.svg`), icon.svg);
      console.log(`   ✓ Generated: ${icon.name}.svg`);
    }
  }

  private async generateSocialCards(): Promise<void> {
    if (!this.page) return;

    // Create a social media card template
    const socialCardHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          width: 1200px;
          height: 630px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
        }
        .logo {
          font-size: 72px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .title {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 20px;
          max-width: 80%;
        }
        .subtitle {
          font-size: 24px;
          max-width: 70%;
          opacity: 0.9;
        }
        .badge {
          position: absolute;
          bottom: 40px;
          right: 40px;
          background-color: rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          border-radius: 20px;
          font-size: 18px;
        }
        .graphic {
          position: absolute;
          top: 40px;
          left: 40px;
          width: 100px;
          height: 100px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }
      </style>
    </head>
    <body>
      <div class="graphic">🚀</div>
      <div class="logo">Cortex</div>
      <div class="title">Multi-Network DePIN Orchestration Platform</div>
      <div class="subtitle">Deploy, manage, and optimize workloads across decentralized infrastructure networks with ease</div>
      <div class="badge">cortex.io</div>
    </body>
    </html>
    `;

    // Save the HTML file
    const htmlPath = join(this.outputDir, 'social-card.html');
    await writeFile(htmlPath, socialCardHtml);

    // Create a new page to render the HTML
    const socialPage = await this.browser!.newPage();
    await socialPage.setViewportSize({ width: 1200, height: 630 });
    await socialPage.goto(`file://${htmlPath}`);
    await socialPage.screenshot({ path: join(this.outputDir, 'social-card.png') });
    await socialPage.close();

    console.log('   ✓ Generated: social-card.png');
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  (async () => {
    const generator = new ScreenshotGenerator();
    try {
      await generator.initialize();
      await generator.generateScreenshots();
      await generator.generateDemoAssets();
      console.log('\n🎯 All screenshots and assets generated successfully!');
    } catch (error) {
      console.error('❌ Error generating screenshots:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    } finally {
      await generator.cleanup();
    }
  })();
}

export { ScreenshotGenerator };
