import { defineCollection } from '@nocobase/database';

export default defineCollection({
  name: 'users',
  fields: [
    {
      type: 'string',
      name: 'id',
      primaryKey: true,
    },
    {
      type: 'string',
      name: 'email',
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    {
      type: 'string',
      name: 'username',
      allowNull: false,
      unique: true,
    },
    {
      type: 'string',
      name: 'firstName',
    },
    {
      type: 'string',
      name: 'lastName',
    },
    {
      type: 'string',
      name: 'role',
      defaultValue: 'user',
      validate: {
        isIn: [['admin', 'user', 'viewer']]
      }
    },
    {
      type: 'boolean',
      name: 'active',
      defaultValue: true,
    },
    {
      type: 'json',
      name: 'preferences',
      defaultValue: {},
    },
    {
      type: 'date',
      name: 'lastLoginAt',
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
