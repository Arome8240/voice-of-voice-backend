const router = require('express').Router()
const User = require('../models/User.js')
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken')
const cors = require('cors');

router.post('/register', async (req, res) => {
  //Cors resolved
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader( "Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH, OPTIONS" );

  //Hash password
  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(req.body.password, salt)

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword
  })
  try {
    const savedUser = await user.save()
    res.send(savedUser)
  } catch (e) {
    res.status(400).send(e.message)
  }
})

router.post('/login', async (req, res) => {
  const user = await User.findOne({email: req.body.email})
  if (!user) return res.status(400).send('Email is not found.')
  const validPass = await bcrypt.compare(req.body.password, user.password)
  if (!validPass) return res.status(400).send('Invalid password')

  const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET)
  //res.header('auth-token', token).send(token)
  res.status(200).json(token)
})

router.get('/user', (req, res, next) => {
  let token = req.headers.token
  jwt.verify(token, process.env.TOKEN_SECRET,(err, decoded) => {
    if(err) return res.status(401).json({
      title: 'unauthorized'
    })
    User.findOne({_id: decoded._id}, (err, user) => {
      if (err) return console.log(err)
      return res.status(200).json({
        user: {
          username: user.username,
          email: user.email
        }
      })
    })
  })
})

module.exports = router
