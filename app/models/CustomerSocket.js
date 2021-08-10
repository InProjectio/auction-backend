var mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const customerSocketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  idSocket: String,
  channel: String,
})

myPlugins.forEach(plugin => customerSocketSchema.plugin(plugin))

module.exports = customerSocketSchema