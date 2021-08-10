var mongoose = require('mongoose')

const fcmSchema = new mongoose.Schema({
  idCustomer: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guid: String,
  fcmToken: String,
  deviceType: {
    type: String,
    enum: ['ANDROID','IOS','WEB']
  },
  createdAt: String,
  updatedAt: String
})

module.exports = fcmSchema
