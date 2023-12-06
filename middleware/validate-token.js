const jwt = require('jsonwebtoken');

const validateToken = (req, res, next) => {
    try {
        var authHeader = req.headers["authorization"];
        var token = authHeader.split(" ")[1];
    } catch (error) {}

    if (!token) {
        // res.json({status:false, message:"You're not authorized to use this endpoint"});
        res.status(401).json({message:"You're not authorized to use this endpoint"});
        res.end();
    } else {
        jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
            let today = new Date();
            if (err) {
                // res.json({status:false, message:"An error occured while checking your authorization"});
                res.status(500).json({message:"An error occured while checking your authorization"});
                res.end();
            } else if (user.iat*1000 >= today.getTime()-86400000*10) {
                req.account = user.idaccount;
                next();
            } else {
                // res.json({status:false, message:"The provided access token has expired"});
                res.status(403).json({message:"The provided access token has expired"});
                res.end();
            }
        });
    }
}

module.exports = validateToken;