const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const userSchema = new mongoose.Schema({
  user_id: Number,
  username: String,
  email: String,
  password: String,
  fullname: String,
  intro: String,
  session_token: String,
  email_otp: String,
  firebaseToken: String,
  role: { type: String, enum: ['inner', 'outsource'], default: 'inner' },
  status: { type: String, enum: ['a', 'd'] },
  public_key: String,
  avatar_url: String,
  create_at: String,
  update_at: String,
})

myPlugins.forEach(plugin => userSchema.plugin(plugin))

module.exports = userSchema