const router = require('express').Router()
const verify = require('./token')
const multer = require('multer')
const User = require('../models/User')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const fileFilter = function(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']

  if(!allowedTypes.includes(file.mimetype)) {
    const error = new Error('wrong file type')
    error.code = 'LIMIT_FILE_TYPES'
    return cb(error, false)
  }

  cb(null, true)
}



const MAX_SIZE = 10000000
const upload = multer({
  dest: './uploads/',
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
})

const FileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/audios')
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const audioUploadMiddleware = multer({storage: FileStorageEngine})

/*const audioUploadMiddleware = multer({
  dest: './uploads/',
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
})*/



router.get('/', verify, (req, res) => {
  res.send(req.user)
  User.findOne({_id: req.user})
})

router.post('/upload', upload.single('file'), async(req, res) => {
  //res.json(req.file.path)
  try {
    await sharp(req.file.path)
    .resize(300, 300)
    .toFile(`../frontend/public/static/${req.file.originalname}`)

    fs.unlink(req.file.path, () => {
      res.json({ file: `/static/${req.file.originalname}`})
    })
  } catch (e) {
    res.status(422).json({ e })
  }
})

router.post('/audioUpload', audioUploadMiddleware.single('file'), (req, res) => {
  res.json(req.file)
})

module.exports = router
