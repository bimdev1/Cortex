import { Migration } from '@nocobase/server';

export default class InitialTablesMigration extends Migration {
  async up() {
    await this.sequelize.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
  }

  async down() {
    // Rollback logic if needed
  }
}
