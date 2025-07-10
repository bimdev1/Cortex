import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'computeJobs',
  fields: [
    {
      type: 'string',
      name: 'id',
      primaryKey: true,
    },
    {
      type: 'string',
      name: 'name',
      allowNull: false,
    },
    {
      type: 'text',
      name: 'description',
    },
    {
      type: 'string',
      name: 'status',
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'running', 'completed', 'failed', 'cancelled']]
      }
    },
    {
      type: 'json',
      name: 'configuration',
      defaultValue: {},
    },
    {
      type: 'json',
      name: 'results',
      defaultValue: {},
    },
    {
      type: 'decimal',
      name: 'estimatedCost',
      precision: 10,
      scale: 4,
    },
    {
      type: 'decimal',
      name: 'actualCost',
      precision: 10,
      scale: 4,
    },
    {
      type: 'date',
      name: 'createdAt',
    },
    {
      type: 'date',
      name: 'updatedAt',
    },
    {
      type: 'date',
      name: 'startedAt',
    },
    {
      type: 'date',
      name: 'completedAt',
    },
  ],
});
