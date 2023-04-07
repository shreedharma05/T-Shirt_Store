const BigPromise = require('../middlewares/bigPromise')

exports.home = BigPromise(async (req, res) => {
    // const db = await dbconnect()
    res.status(200).json({
        success: true,
        greeting: `Hello from Backend`
    })
})

exports.homeDummy = async (req, res) => {
    try {
        // const db = await dbconnect()
        res.status(200).json({
            success: true,
            greeting: `This is from another dummy route`
        })
    } catch (error) {
       console.log(error); 
    }
   
}