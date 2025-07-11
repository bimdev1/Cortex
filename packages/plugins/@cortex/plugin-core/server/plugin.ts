import { Plugin } from '@nocobase/server';
import { JobService } from './services/jobService';
import { NetworkService } from './services/networkService';

export class CorePlugin extends Plugin {
  jobService!: JobService;
  networkService!: NetworkService;

  async afterAdd() {}

  async beforeLoad() {}

  async load() {
    // Initialize services
    this.jobService = new JobService();
    this.networkService = new NetworkService();

    // Register health check route
    this.app.resource({
      name: 'plugin-core',
      actions: {
        health: async (ctx) => {
          ctx.body = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              job: 'ready',
              network: 'ready',
            },
          };
        },
      },
    });
  }

  async install() {}

  async afterEnable() {}

  async afterDisable() {}

  async remove() {}
}

export default CorePlugin;
