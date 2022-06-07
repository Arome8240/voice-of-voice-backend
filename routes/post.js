const router = require('express').Router()
const verify = require('../middleware/token')
const multer = require('multer')
const User = require('../models/User')
const Post = require('../models/Post')
const formidable = require('formidable')
const path = require('path'), fs = require('fs')
const AWS = require('aws-sdk')
const cloudinary = require('cloudinary')

const MAX_SIZE = 10000000

//CONFIGURE CLOUDINARY
cloudinary.config({
  cloud_name: 'dds5vammg',
  api_key: '669427789829754',
  api_secret: 'w1cXYLRWah7trmphi_jvH-vE2Ws'
})

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

router.get('/popular', async (req, res, next) => {
  Post.find()
  .sort('-views')
  .then(posts => {
    res.json({posts})
  })
  .catch(err => {
    res.json({error})
  })
})

//Delete Post
router.delete('/delete/:postId', verify, async (req, res) => {
  //console.log(req.params.postId)
  try {
      const deletePost = await Post.findOne({_id: req.params.postId }).remove()
      const foundPost = await Post.find()
      res.send(foundPost)
    } catch (e) {
      res.status(400).send(e.message)
    }
})

//IMAGE UPLOAD ROUTE
router.post('/upload', upload.single('file'), async (req, res) => {
    res.json(`${process.env.URL}/images/${req.file.originalname}`)
})

router.get('/arome', verify, (req, res) => {
  res.json({
    name: 'Arome.dev',
    user: req.user
  })
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
  //res.send(req.body.postId)
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

//VIEW COUNTER
router.post('/views/add', (req, res) => {
  //console.log(req.body.postId)
  Post.findById(req.body.postId)
  .then(post => {
    console.log(post)
    post.views = post.views + 1
    post.save().then((updatedUser) => {
      res.send(updatedUser)
    })
  })
  .catch(error => {
    res.send(error)
  })
})

//UPDATE POST
router.post('/update', (req, res) => {
  console.log(req.body)
  Post.findById(req.body.postId)
  .then(post => {
    //console.log(post)
    post.title = req.body.title
    post.description = req.body.description
    post.save().then((updatedUser) => {
      res.send(updatedUser)
    })
  })
  .catch(error => {
    res.send(error)
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
