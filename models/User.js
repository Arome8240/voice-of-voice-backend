const mongoose = require('mongoose')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024
  },
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('User', UserSchema)
