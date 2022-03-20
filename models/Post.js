const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  thumbnailUrl: {
      type: String,
      default: 'no-photo.jpg'
    },
  userId: {
    type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
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
  date: {
    type: Date,
    default: Date.now
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
})

VideoSchema.index({ title: 'text' })

PostSchema.virtual('dislikes', {
  ref: 'Feeling',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
  count: true,
  match: { type: 'dislike' }
})

PostSchema.virtual('likes', {
  ref: 'Feeling',
  localField: '_id',
  foreignField: 'videoId',
  justOne: false,
  count: true,
  match: { type: 'like' }
})

module.exports = mongoose.model('Post', PostSchema)
