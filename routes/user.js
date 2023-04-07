const express = require('express')
const router = express.Router()
const {
    signup, 
    signin, 
    signout, 
    forgotpassword, 
    passwordReset, 
    userDashboard, 
    changePassword, 
    updateUserDetails, 
    adminAllUsers, 
    managerAllUsers,
    admingetOneuser,
    adminUpdateOneuser,
    adminDeleteOneuser
} = require('../controllers/userController')
const { isLoggedIn, customRole } = require('../middlewares/user')


router.route('/signup').post(signup)

router.route('/signin').post(signin)

router.route('/signout').get(signout)

router.route('/forgotpassword').post(forgotpassword)

router.route('/password/reset/:forgotToken').put(passwordReset)

router.route('/userdashboard').get(isLoggedIn, userDashboard)

router.route('/password/update').put(isLoggedIn, changePassword)

router.route('/userdashboard/update').put(isLoggedIn, updateUserDetails)

router.route('/admin/users').get(isLoggedIn, customRole('admin'), adminAllUsers)

router
    .route('/admin/user/:id')
    .get(isLoggedIn, customRole('admin'), admingetOneuser)
    .put(isLoggedIn, customRole('admin'), adminUpdateOneuser)
    .delete(isLoggedIn, customRole('admin'), adminDeleteOneuser)

router.route('/manager/users').get(isLoggedIn, customRole('manager'), managerAllUsers)
module.exports = router