const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const entitySchema = new mongoose.Schema({
  entitySeq: Number,
  entityName: String,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  userMaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserMapping' }],
  content: String,
  attackFiles: [String],
  createdAt: String,
  createdBy: String,
  updatedAt: String,
  updatedBy: String,
  textSearch: String,
  transactionHash: String,
  entityType: { type: String, enum: ['BIDDING', 'TENDERER'] },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'] },
  state: { type: String, enum: ['TODO', 'PROCESS', 'DONE'] },
  userCreated: { type: mongoose.Schema.Types.ObjectId, ref: 'UserMapping' }
})

myPlugins.forEach(plugin => entitySchema.plugin(plugin))

entitySchema.index({ textSearch: 'text' })

module.exports = entitySchema