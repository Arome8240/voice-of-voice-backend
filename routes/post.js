const router = require('express').Router()
const verify = require('./token')

router.get('/', verify, (req, res) => {
  res.send(req.user)
  User.findOne({_id: req.user})
})

module.exports = router
