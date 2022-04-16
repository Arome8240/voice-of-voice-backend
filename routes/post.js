const router = require('express').Router()
const verify = require('./token')
const multer = require('multer')
const User = require('../models/User')
const Post = require('../models/Post')
const sharp = require('sharp')
const formidable = require('formidable')
const path = require('path'), fs = require('fs')
const AWS = require('aws-sdk')

//IMAGE FILTER
const fileFilter = function(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

  if(!allowedTypes.includes(file.mimetype)) {
    const error = new Error('wrong file type')
    error.code = 'LIMIT_FILE_TYPES'
    return cb(error, false)
  }

  cb(null, true)
}

const folder = path.join(__dirname, 'files')

if (!fs.existsSync(folder)) {
  fs.mkdirSync(folder)
}


const MAX_SIZE = 10000000
/*const upload = multer({
  dest: './uploads/',
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
})*/

//AUDIO FILTER
const audioFilter = function(req, file, cb) {
  const allowedTypes = ['audio/mpeg', 'audio/mp4', 'image/gif']

  if(!allowedTypes.includes(file.mimetype)) {
    const error = new Error('wrong file type')
    error.code = 'LIMIT_FILE_TYPES'
    return cb(error, false)
  }

  cb(null, true)
}

const { memoryStorage } = require('multer')
const storage = memoryStorage()
const uploadsA = multer({ storage })
const uploadsImg = multer({ storage })

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

router.get('/', verify, (req, res) => {
  res.send(req.user)
  User.findOne({_id: req.user})
})


//IMAGE UPLOAD ROUTE
router.post('/upload', uploadsImg.single('file'), async(req, res) => {
  const allowedTypes = ['image/jpg', 'image/png', 'image/gif']

  console.log(req.file.mimetype);

  if (req.file.mimetype == 'image/jpg' || 'image/png' || 'image/gif') {
    const filename = req.file.originalname
    const bucketname = 'votaudios'
    const file = req.file.buffer
    const link = await uploadAudioToS3(filename, bucketname, file)
    console.log('File:', link);
    res.status(200).json(link.Location)
  } else if (req.file.mimetype != 'image/jpg' || 'image/png' || 'image/gif') {
    const error = new Error('wrong file type')
    error.code = 'LIMIT_FILE_TYPES'
    res.status(422).json({ error: error.code })
  }
})


//Quasar Upload
router.post('/uploadq', (req, res) => {
  const form = new formidable.IncomingForm()

  form.uploadDir = folder
  console.log(form);
  form.parse(req, (_, fields, files) => {
    console.log('\n-----------')
    console.log('Fields', fields)
    console.log('Received:', Object.keys(files))
    console.log()
    res.send('Thank you')
  })
})

//audioUploadMiddleware.single('file')

//AUDIO UPLOAD ROUTE
router.post('/audioUpload', uploadsA.single('file'), async (req, res, cb) => {

  const filename = req.file.originalname
  const bucketname = 'votaudios'
  const file = req.file.buffer
  const link = await uploadAudioToS3(filename, bucketname, file)
  console.log('FILE: ', link);
  res.json(link.Location)

})


//ADD NEW MESSAGE ROUTE
router.post('/add', (req, res, next) => {
  Post.create(req.body, (error, data) => {
        if (error) {
            return next(error)
        } else {
            res.json(data)
        }
    })
})

module.exports = router
