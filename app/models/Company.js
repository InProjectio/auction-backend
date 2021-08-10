const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const companySchema = new mongoose.Schema({
  companySeq: Number,
  companyName: String,
  shortName: String,
  nationalName: String,// ten quoc te
  businessType: String, 
  taxCode: String,
  registrationAddress: String,
  tradingAddress: String,
  phone: String,
  fax: String,
  email: String, 
  website: String,
  foundDing: String, // ngay thanh lap
  numEmployee: Number,
  representName: String,
  representPosition: String,
  representAddress: String,
  careers:[String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['VERIFY', 'UNVERIFY'] },
  enties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Entity' }],
  userMaps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserMapping' }],
  packages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  textSearch: String,
  createdAt: String,
  createdBy: String,
  updatedAt: String,
  updatedBy: String,
  deletedAt: String,
  founding: String,
  logo: String,
  transactionHash: String
})

companySchema.index({ textSearch: 'text' })

myPlugins.forEach(plugin => companySchema.plugin(plugin))

module.exports = companySchema