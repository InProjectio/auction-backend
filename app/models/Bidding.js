const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const bidingSchema = new mongoose.Schema({
  biddingSeq: Number,
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  entity: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },// nhom du thau
  cost: Number,
  startDate: String,
  endDate: String,
  numberActionDay: Number,
  attackFiles:[String],
  status: { type: String, enum: ['ACCEPT', 'REJECT', 'DISCUSS'] },
  userCreated: { type: mongoose.Schema.Types.ObjectId, ref: 'UserMapping' },
  createdAt: String,
  updatedAt: String,
  updatedAt: String,
  updatedBy: String,
  deletedAt: String,
  textSearch: String,
  transactionHash: String
})

bidingSchema.index({ textSearch: 'text' })

myPlugins.forEach(plugin => bidingSchema.plugin(plugin))

module.exports = bidingSchema