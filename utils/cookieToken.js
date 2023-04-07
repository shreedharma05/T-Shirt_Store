const cookieToken = (user, res) => {
    const token = user.getJwtToken()

    const options = {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRY * 24 * 60 * 60 * 1000),
        httponly: true
    }
    user.password = undefined
    res.status(200).cookie("token", token, options).json({
        success: true,
        user,
        token
    })
}


module.exports = cookieToken