// Cortex Server Entry Point
import { Application } from '@nocobase/server';
import { resolve } from 'path';

const app = new Application({
  database: {
    dialect: (process.env.DB_DIALECT || 'postgres') as any,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'cortex',
    password: process.env.DB_PASSWORD || 'cortex123',
    database: process.env.DB_DATABASE || 'cortex',
  },
  plugins: [resolve(__dirname, '../../../plugins/@cortex/plugin-core')],
} as any);

if (require.main === module) {
  app.runAsCLI();
}

export default app;
