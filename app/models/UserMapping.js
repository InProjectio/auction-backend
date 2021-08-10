const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const userMapingSchema = new mongoose.Schema({
  mappingSeq: Number,
  email: { type: String, index: true, lowercase: true, trim: true },
  phone: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  roleType: { type: String, enum: ['OWNER', 'PROFILE', 'EMPLOYEE'] },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'] },
  state: { type: String, enum: ['ACCEPT', 'UNVERIFY', 'REJECT', 'PENDING'] },
  enties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }],
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  position: mongoose.Schema.Types.Mixed,
  detail: String,
  attackFiles: [String],
  sourceType: { type: String, enum: ['INVITE', 'REQUEST'] },
  createdAt: String,
  updatedAt: String,
  updatedAt: String,
  updatedBy: String,
  deletedAt: String,
  textSearch: String,
})

userMapingSchema.index({ textSearch: 'text' })

myPlugins.forEach(plugin => userMapingSchema.plugin(plugin))

module.exports = userMapingSchema