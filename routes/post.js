const express = require('express');
const router = require('express').Router()
const verify = require('./token')
const multer = require('multer')
const User = require('../models/User')
const sharp = require('sharp')
const fs = require('fs')
const path = require('path')
//const aws = require('aws-sdk')

/*aws.config.update({
  AWSAccessKeyId: 'AKIATLWVXTEP3TWAGQ5I',
  AWSSecretKey: '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'
})*/

/*const SESConfig = {
    accessKeyId: 'AKIATLWVXTEP7FJHOMYR',
    accessSecretKey: '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',
    region: "us-east-1",
}
aws.config.update(SESConfig);*/

//Access Key ID: AKIATLWVXTEP7FJHOMYR
//Secret Access Key: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

const app = express()

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

router.get('/', verify, (req, res) => {
  res.send(req.user)
  User.findOne({_id: req.user})
})

router.post('/upload', upload.single('file'), async(req, res) => {
  try {
    const buffer = await sharp(req.file.path)
    .resize(300)
    .toBuffer()

    /*const s3res = await s3.upload({
      Bucket: 'vot',
      Key: `${now}-${req.file.originalname}`,
      Body: buffer,
      ACL: 'public-read'
    }).promise()*/

    fs.unlink(req.file.path, () => {
      res.json({ file: s3res.Location})
    })
  } catch (e) {
    res.status(422).json({ e })
  }
})


app.use(function(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_TYPES') {
    res.status(442).json({ error: 'only images are allowed'})
    return
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(442)
    .json({ error: `Too large. Max size is ${MAX_SIZE / 1000}kb`})
    return
  }
})

module.exports = router
