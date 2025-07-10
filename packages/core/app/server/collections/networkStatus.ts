import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'networkStatus',
  fields: [
    {
      type: 'string',
      name: 'id',
      primaryKey: true,
    },
    {
      type: 'string',
      name: 'networkName',
      allowNull: false,
      unique: true,
    },
    {
      type: 'string',
      name: 'status',
      defaultValue: 'unknown',
      validate: {
        isIn: [['online', 'offline', 'degraded', 'unknown']]
      }
    },
    {
      type: 'integer',
      name: 'latency',
      comment: 'Network latency in milliseconds',
    },
    {
      type: 'decimal',
      name: 'currentPrice',
      precision: 10,
      scale: 6,
    },
    {
      type: 'integer',
      name: 'availableNodes',
      defaultValue: 0,
    },
    {
      type: 'json',
      name: 'metadata',
      defaultValue: {},
    },
    {
      type: 'date',
      name: 'lastChecked',
    },
    {
      type: 'date',
      name: 'createdAt',
    },
    {
      type: 'date',
      name: 'updatedAt',
    },
  ],
});
