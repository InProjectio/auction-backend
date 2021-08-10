var mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const conversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: String,
  subTitle: String,
  status: { type: String, enum: ['ACTIVE', 'INACTIVE', 'CLOSE'] },
  customerConversations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CustomerConversation' }],
  latestCustomerConveration: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerConversation' },
  biddingEntity: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },
  tendererEntity: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' },
  currentDate: String,
  createdAt: String,
  updatedAt: String
})

myPlugins.forEach(plugin => conversationSchema.plugin(plugin))

module.exports = conversationSchema