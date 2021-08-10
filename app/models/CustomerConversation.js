var mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const customerConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  latestMessage: String,
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  numberOfUnreadMessages: {
    type:Number,
    default: 0
  },
  userType: {
    type: String,
    enum: ['BIDDING', 'TENDERER']
  },
  createdAt: String,
  updatedAt: String
})

myPlugins.forEach(plugin => customerConversationSchema.plugin(plugin))

module.exports = customerConversationSchema