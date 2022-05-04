const router = require('express').Router()
const verify = require('./token')
const multer = require('multer')
const User = require('../models/User')
const Post = require('../models/Post')
const formidable = require('formidable')
const path = require('path'), fs = require('fs')
const AWS = require('aws-sdk')

const MAX_SIZE = 10000000

//UPLOAD AUDIO
const Audiostorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/audios')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const uploadAudio = multer({storage: Audiostorage})

//UPLOAD IMAGE
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const upload = multer({storage: storage})

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

router.post('/uploadq', async(req, res, next) => {
  var form = new formidable.IncomingForm({uploadDir: `${__dirname}/../uploads`});
  form.parse(req, function (err, fields, files) {
    //var oldpath = 
    if (err) {
      next(err)
      return
    }
    res.json({files: files.fileToUpload})
  })
})

//IMAGE UPLOAD ROUTE
router.post('/upload', upload.single('file'), async (req, res) => {
    res.json(`${process.env.URL}/images/${req.file.originalname}`)
})


//audioUploadMiddleware.single('file')

//AUDIO UPLOAD ROUTE
router.post('/audioUpload', uploadAudio.single('file'), async (req, res, cb) => {

  res.json(`${process.env.URL}/audios/${req.file.originalname}`)

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
