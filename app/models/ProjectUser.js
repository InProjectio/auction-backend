const { Schema } = require('mongoose');

const ProjectUserSchema = new Schema(
  {
    project_id: Number,
    user_id: Number,
    role: { type: String, enum: ['ASSIGNEE', 'VIEWER'], default: 'ASSIGNEE' },
    is_owner: { type: String, enum: ['y', 'n'], default: 'n' },
    is_accepted: { type: String, enum: ['y', 'n'], default: 'n' },
    txhash: String
  },
  {
    timestamps: {
      createdAt: 'create_at',
      updatedAt: 'update_at',
    },
  }
);

module.exports = ProjectUserSchema
