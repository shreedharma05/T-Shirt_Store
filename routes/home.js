const express = require('express')
const router = express.Router()

// Import controller
const { home, homeDummy } = require('../controllers/homeController')

router.route('/').get(home)
router.route('/dummy').get(homeDummy)

// Export routes
module.exports = router