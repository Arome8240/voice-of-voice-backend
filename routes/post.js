const router = require('express').Router()
const verify = require('./token')
const multer = require('multer')
const User = require('../models/User')
const Post = require('../models/Post')
const formidable = require('formidable')
const path = require('path'), fs = require('fs')
const AWS = require('aws-sdk')

const MAX_SIZE = 10000000

const { memoryStorage } = require('multer')
const storage = memoryStorage()
const uploadsA = multer({ storage })
const uploadsImg = multer({ storage })

const upload = multer({
  dest: '../uploads/'
})

//S3 API KEYS
const s3 = new AWS.S3({
  accessKeyId: 'AKIATLWVXTEPR4EZEP5A',
  secretAccessKey: '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'
})

//IMAGE UPLOAD TO S3 BUCKET
const uploadImageToS3 = (filename, bucketname, file) => {

  return new Promise((resolve, reject) => {
    const params = {
      Key: filename,
      Bucket: bucketname,
      Body: file,
      ContentType: 'image/jpeg, image/png, image/gif',
      ACL: 'public-read'
    }

    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}


//Audio Uploading to S3 Bucket
const uploadAudioToS3 = (filename, bucketname, file) => {

  return new Promise((resolve, reject) => {
    const params = {
      Key: filename,
      Bucket: bucketname,
      Body: file,
      ACL: 'public-read'
    }

    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const bucket = 'votaudios'

/*router.get('/', verify, (req, res) => {
  res.send(req.user)
  User.findOne({_id: req.user})
})*/

router.get('/', async (req, res, next) => {
  try {
    const foundPost = await Post.find()
    res.json(foundPost)
  } catch (e) {
    res.status(400).send(e.message)
  }
})

//IMAGE UPLOAD ROUTE
router.post('/upload', upload.single('file'), async (req, res) => {
  
  //res.json({file: req.file})

  const filename = req.file.originalname
  const bucketname = 'votaudios'
  const file = req.file.buffer
  const link = await uploadAudioToS3(filename, bucketname, file)
  console.log('FILE: ', link);
  res.json(link.Location)
})


//audioUploadMiddleware.single('file')

//AUDIO UPLOAD ROUTE
router.post('/audioUpload', uploadsA.single('file'), async (req, res, cb) => {

  console.log(req.file)

  const filename = req.file.originalname
  const bucketname = 'votaudios'
  const file = req.file.buffer
  const link = await uploadAudioToS3(filename, bucketname, file)
  console.log('FILE: ', link);
  res.json(link.Location)

})


//ADD NEW MESSAGE ROUTE
router.post('/add', async (req, res, next) => {
  const post = new Post({
      title: req.body.title,
      description: req.body.description,
      thumbnailUrl: req.body.thumbnailUrl,
      url: req.body.url
    })

    try {
      const savedPost = await post.save()
      res.send(savedPost)
    } catch (e) {
      res.status(400).send(e.message)
    }
})

//LIKE POST
router.put('/like', verify, (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {
    $push:{likes:req.user._id}
  }, {
    new: true
  }).exec((err, result) => {
    if (err) {
      res.status(422).json({error: err})
    } else {
      res.json(result)
    }
  })
})

//UNLIKE POST
router.put('/unlike', verify, (req, res) => {
  Post.findByIdAndUpdate(req.body.postId, {
    $pull:{likes:req.user._id}
  }, {
    new: true
  }).exec((err, result) => {
    if (err) {
      res.status(422).json({error: err})
    } else {
      res.json(result)
    }
  })
})

module.exports = router
