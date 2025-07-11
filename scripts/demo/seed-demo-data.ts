const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const randomUUID = () => crypto.randomUUID();

interface MockJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  configuration: {
    provider: string;
    image: string;
    cpu: number;
    memory: string;
    storage?: string;
    env?: Record<string, string>;
    duration: number;
  };
  estimatedCost: number;
  actualCost?: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface MockNetworkStatus {
  name: string;
  network: string;
  connected: boolean;
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  availableNodes: number;
  currentPrice: number;
  lastChecked: string;
}

interface MockCostData {
  timestamp: string;
  estimated: number;
  actual: number;
}

class DemoDataSeeder {
  private jobs: MockJob[] = [];
  private networks: MockNetworkStatus[] = [];
  private costData: MockCostData[] = [];

  constructor() {
    console.log('🌱 Initializing Cortex demo data seeder...');
  }

  async seedData(): Promise<void> {
    console.log('📊 Generating demo data...');
    
    this.generateNetworkStatus();
    this.generateJobs();
    this.generateCostData();
    
    await this.persistData();
    
    console.log('✅ Demo data seeded successfully!');
    this.printSummary();
  }

  private generateNetworkStatus(): void {
    const networks = [
      {
        name: 'Akash Network',
        network: 'akash',
        connected: true,
        status: 'online' as const,
        latency: 45 + Math.floor(Math.random() * 20),
        availableNodes: 1200 + Math.floor(Math.random() * 300),
        currentPrice: 0.048 + (Math.random() * 0.02),
      },
      {
        name: 'Render Network',
        network: 'render',
        connected: true,
        status: 'online' as const,
        latency: 78 + Math.floor(Math.random() * 25),
        availableNodes: 890 + Math.floor(Math.random() * 200),
        currentPrice: 0.156 + (Math.random() * 0.04),
      },
      {
        name: 'Golem Network',
        network: 'golem',
        connected: Math.random() > 0.3,
        status: Math.random() > 0.8 ? 'degraded' as const : 'online' as const,
        latency: 120 + Math.floor(Math.random() * 30),
        availableNodes: 650 + Math.floor(Math.random() * 150),
        currentPrice: 0.025 + (Math.random() * 0.01),
      },
      {
        name: 'Bittensor',
        network: 'bittensor',
        connected: true,
        status: 'online' as const,
        latency: 52 + Math.floor(Math.random() * 18),
        availableNodes: 420 + Math.floor(Math.random() * 100),
        currentPrice: 0.087 + (Math.random() * 0.03),
      },
      {
        name: 'io.net',
        network: 'ionet',
        connected: true,
        status: 'online' as const,
        latency: 61 + Math.floor(Math.random() * 22),
        availableNodes: 780 + Math.floor(Math.random() * 180),
        currentPrice: 0.074 + (Math.random() * 0.025),
      },
    ];

    this.networks = networks.map(network => ({
      ...network,
      lastChecked: new Date().toISOString(),
    }));
  }

  private generateJobs(): void {
    const providers = ['akash', 'render', 'bittensor', 'ionet'];
    const images = [
      'nginx:alpine',
      'node:18-alpine',
      'python:3.9-slim',
      'postgres:15-alpine',
      'redis:7-alpine',
      'jupyter/scipy-notebook:latest',
      'tensorflow/tensorflow:latest-gpu',
      'pytorch/pytorch:latest',
    ];

    const jobTemplates = [
      {
        name: 'Web Server Deployment',
        image: 'nginx:alpine',
        cpu: 100,
        memory: '512Mi',
        duration: 3600,
        env: { NODE_ENV: 'production' } as Record<string, string>,
      },
      {
        name: 'Data Processing Pipeline',
        image: 'python:3.9-slim',
        cpu: 500,
        memory: '2Gi',
        duration: 7200,
        env: { PYTHONUNBUFFERED: '1', WORKERS: '4' } as Record<string, string>,
      },
      {
        name: 'Machine Learning Training',
        image: 'tensorflow/tensorflow:latest-gpu',
        cpu: 1000,
        memory: '4Gi',
        duration: 14400,
        env: { CUDA_VISIBLE_DEVICES: '0', BATCH_SIZE: '32' } as Record<string, string>,
      },
      {
        name: 'Database Migration',
        image: 'postgres:15-alpine',
        cpu: 200,
        memory: '1Gi',
        duration: 1800,
        env: { POSTGRES_DB: 'migration_db' } as Record<string, string>,
      },
      {
        name: 'API Microservice',
        image: 'node:18-alpine',
        cpu: 300,
        memory: '1Gi',
        duration: 10800,
        env: { NODE_ENV: 'production', PORT: '3000' } as Record<string, string>,
      },
    ];

    // Generate 8 jobs with realistic variety
    for (let i = 0; i < 8; i++) {
      const template = jobTemplates[i % jobTemplates.length];
      const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
      const isCompleted = Math.random() > 0.3; // 70% completed
      const isRunning = !isCompleted && Math.random() > 0.5; // 50% of non-completed are running
      
      let status: MockJob['status'];
      let completedAt: string | undefined;
      let startedAt: string | undefined;
      let actualCost: number | undefined;

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

      const job: MockJob = {
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

  private generateCostData(): void {
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

  private async persistData(): Promise<void> {
    // In a real implementation, this would write to the database
    // For demo purposes, we'll write to JSON files that can be imported
    
    const fs = require('fs');
    const path = require('path');
    
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

  private printSummary(): void {
    const statusCounts = this.jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

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
