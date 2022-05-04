const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    min: 3,
    max: 255
  },
  thumbnailUrl: {
      type: String,
    },
  userId: {
    type: mongoose.Schema.ObjectId,
      ref: 'User',
  },
  description: {
    type: String
  },
  categories: {
    type: mongoose.Schema.ObjectId,
      ref: 'Category'
  },
  views: {
      type: Number,
      default: 0
  },
  url: {
      type: String
  },
  likes: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Post', postSchema)
