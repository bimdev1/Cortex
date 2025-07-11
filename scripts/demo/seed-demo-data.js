// Simple JavaScript version of seed-demo-data.ts for validation
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const randomUUID = () => crypto.randomUUID();

class DemoDataSeeder {
  constructor() {
    this.jobs = [];
    this.networks = [];
    this.costData = [];
    console.log('🌱 Initializing Cortex demo data seeder...');
  }

  async seedData() {
    console.log('📊 Generating demo data...');
    
    this.generateNetworkStatus();
    this.generateJobs();
    this.generateCostData();
    
    await this.persistData();
    
    console.log('✅ Demo data seeded successfully!');
    this.printSummary();
  }

  generateNetworkStatus() {
    const networks = [
      {
        name: 'Akash Network',
        network: 'akash',
        connected: true,
        status: 'online',
        latency: 45 + Math.floor(Math.random() * 20),
        availableNodes: 1200 + Math.floor(Math.random() * 300),
        currentPrice: 0.048 + (Math.random() * 0.02),
      },
      {
        name: 'Render Network',
        network: 'render',
        connected: true,
        status: 'online',
        latency: 78 + Math.floor(Math.random() * 25),
        availableNodes: 890 + Math.floor(Math.random() * 200),
        currentPrice: 0.156 + (Math.random() * 0.04),
      },
      {
        name: 'Golem Network',
        network: 'golem',
        connected: Math.random() > 0.3,
        status: Math.random() > 0.8 ? 'degraded' : 'online',
        latency: 120 + Math.floor(Math.random() * 30),
        availableNodes: 650 + Math.floor(Math.random() * 150),
        currentPrice: 0.025 + (Math.random() * 0.01),
      }
    ];

    this.networks = networks.map(network => ({
      ...network,
      lastChecked: new Date().toISOString(),
    }));
  }

  generateJobs() {
    const providers = ['akash', 'render', 'bittensor', 'ionet'];
    const images = [
      'nginx:alpine',
      'node:18-alpine',
      'python:3.9-slim'
    ];

    const jobTemplates = [
      {
        name: 'Web Server Deployment',
        image: 'nginx:alpine',
        cpu: 100,
        memory: '512Mi',
        duration: 3600,
        env: { NODE_ENV: 'production' }
      },
      {
        name: 'Data Processing Pipeline',
        image: 'python:3.9-slim',
        cpu: 500,
        memory: '2Gi',
        duration: 7200,
        env: { PYTHONUNBUFFERED: '1', WORKERS: '4' }
      }
    ];

    // Generate 5 jobs with realistic variety
    for (let i = 0; i < 5; i++) {
      const template = jobTemplates[i % jobTemplates.length];
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const isCompleted = Math.random() > 0.3; // 70% completed
      const isRunning = !isCompleted && Math.random() > 0.5; // 50% of non-completed are running
      
      let status;
      let completedAt;
      let startedAt;
      let actualCost;

      if (isCompleted) {
        status = Math.random() > 0.1 ? 'completed' : 'failed'; // 90% success rate
        startedAt = new Date(createdAt.getTime() + Math.random() * 300000).toISOString(); // Started within 5 min
        completedAt = new Date(createdAt.getTime() + template.duration * 1000 + Math.random() * 600000).toISOString();
        actualCost = template.cpu * 0.00005 * (template.duration / 3600) + Math.random() * 0.001;
      } else if (isRunning) {
        status = 'running';
        startedAt = new Date(createdAt.getTime() + Math.random() * 300000).toISOString();
      } else {
        status = 'pending';
      }

      const job = {
        id: `job-${randomUUID().substring(0, 8)}`,
        name: `${template.name} #${i + 1}`,
        status,
        configuration: {
          provider: providers[Math.floor(Math.random() * providers.length)],
          image: template.image,
          cpu: template.cpu + Math.floor((Math.random() - 0.5) * 100),
          memory: template.memory,
          storage: '1Gi',
          env: template.env,
          duration: template.duration + Math.floor((Math.random() - 0.5) * 1800),
        },
        estimatedCost: template.cpu * 0.00005 * (template.duration / 3600),
        actualCost,
        createdAt: createdAt.toISOString(),
        updatedAt: (completedAt ? new Date(completedAt) : new Date()).toISOString(),
        startedAt,
        completedAt,
      };

      this.jobs.push(job);
    }

    // Sort by creation date (newest first)
    this.jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  generateCostData() {
    // Generate cost data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(12, 0, 0, 0); // Noon each day

      const baseEstimated = 0.2 + Math.random() * 0.3;
      const baseActual = baseEstimated * (0.8 + Math.random() * 0.3); // 80-110% of estimated

      this.costData.push({
        timestamp: date.toISOString(),
        estimated: Math.round(baseEstimated * 1000) / 1000,
        actual: Math.round(baseActual * 1000) / 1000,
      });
    }
  }

  async persistData() {
    // In a real implementation, this would write to the database
    // For demo purposes, we'll write to JSON files that can be imported
    
    const demoDir = path.join(__dirname, '../../storage/demo');
    
    // Ensure demo directory exists
    if (!fs.existsSync(demoDir)) {
      fs.mkdirSync(demoDir, { recursive: true });
    }

    // Write data to JSON files
    fs.writeFileSync(
      path.join(demoDir, 'jobs.json'), 
      JSON.stringify(this.jobs, null, 2)
    );
    
    fs.writeFileSync(
      path.join(demoDir, 'networks.json'), 
      JSON.stringify(this.networks, null, 2)
    );
    
    fs.writeFileSync(
      path.join(demoDir, 'cost-data.json'), 
      JSON.stringify(this.costData, null, 2)
    );

    console.log(`📁 Demo data written to ${demoDir}`);
  }

  printSummary() {
    const statusCounts = this.jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    const totalEstimated = this.jobs.reduce((sum, job) => sum + job.estimatedCost, 0);
    const totalActual = this.jobs.reduce((sum, job) => sum + (job.actualCost || 0), 0);
    const onlineNetworks = this.networks.filter(n => n.connected).length;

    console.log('\n📈 Demo Data Summary:');
    console.log(`   Jobs: ${this.jobs.length} total`);
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`     ${status}: ${count}`);
    });
    console.log(`   Networks: ${onlineNetworks}/${this.networks.length} online`);
    console.log(`   Estimated costs: $${totalEstimated.toFixed(4)}`);
    console.log(`   Actual costs: $${totalActual.toFixed(4)}`);
    console.log(`   Cost data points: ${this.costData.length}`);
    console.log('\n🎯 Ready for demo presentation!');
  }
}

// CLI execution
if (require.main === module) {
  const seeder = new DemoDataSeeder();
  seeder.seedData().catch(error => {
    console.error('❌ Failed to seed demo data:', error);
    process.exit(1);
  });
}

module.exports = { DemoDataSeeder };
