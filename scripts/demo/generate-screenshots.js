// Simple JavaScript version of generate-screenshots.ts for validation
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

class ScreenshotGenerator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.outputDir = path.join(__dirname, '../../storage/screenshots');
    console.log('📸 Initializing Cortex screenshot generator...');
  }

  async initialize() {
    console.log('🚀 Launching browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();
    
    // Set viewport for consistent screenshots
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Ensure output directory exists
    await fsPromises.mkdir(this.outputDir, { recursive: true });
  }

  async generateScreenshots() {
    if (!this.page) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const baseUrl = 'http://localhost:13000';
    
    const screenshots = [
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
      }
    ];

    console.log(`📷 Generating ${screenshots.length} screenshots...`);

    for (const config of screenshots) {
      try {
        await this.captureScreenshot(config);
      } catch (error) {
        console.error(`❌ Failed to capture ${config.name}:`, error.message);
      }
    }

    console.log('✅ Screenshot generation completed!');
  }

  async captureScreenshot(config) {
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
        height: config.height 
      });
    }

    // Take screenshot
    const screenshotOptions = {
      path: path.join(this.outputDir, `${config.name}.png`),
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

  async generateDemoAssets() {
    console.log('🎨 Generating additional demo assets...');

    // Create a simple logo placeholder
    await this.generateLogo();
    
    // Generate social media cards
    await this.generateSocialCards();
  }

  async generateLogo() {
    // Create a simple SVG logo
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

    await fsPromises.writeFile(path.join(this.outputDir, 'logo.svg'), logoSvg);
    console.log('   ✓ Generated: logo.svg');
  }

  async generateSocialCards() {
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
      </style>
    </head>
    <body>
      <div class="logo">Cortex</div>
      <div class="title">Multi-Network DePIN Orchestration Platform</div>
      <div class="subtitle">Deploy, manage, and optimize workloads across decentralized infrastructure networks with ease</div>
      <div class="badge">cortex.io</div>
    </body>
    </html>
    `;

    // Save the HTML file
    const htmlPath = path.join(this.outputDir, 'social-card.html');
    await fsPromises.writeFile(htmlPath, socialCardHtml);

    // Create a new page to render the HTML
    const socialPage = await this.browser.newPage();
    await socialPage.setViewportSize({ width: 1200, height: 630 });
    await socialPage.goto(`file://${htmlPath}`);
    await socialPage.screenshot({ path: path.join(this.outputDir, 'social-card.png') });
    await socialPage.close();

    console.log('   ✓ Generated: social-card.png');
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI execution
if (require.main === module) {
  (async () => {
    const generator = new ScreenshotGenerator();
    try {
      await generator.initialize();
      await generator.generateScreenshots();
      await generator.generateDemoAssets();
      console.log('\n🎯 All screenshots and assets generated successfully!');
    } catch (error) {
      console.error('❌ Error generating screenshots:', error);
      process.exit(1);
    } finally {
      await generator.cleanup();
    }
  })();
}

module.exports = { ScreenshotGenerator };
