var mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const conversationMessage = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userType: String,
  message: String,
  messageTime: String,
  messageType: { type: String, enum: ['TEXT', 'IMAGE', 'VIDEO', 'SOUND', 'OPTIONS', 'FILE'] },
  deletedAt: String
})

myPlugins.forEach(plugin => conversationMessage.plugin(plugin))

module.exports = conversationMessage