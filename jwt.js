const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req,res,next)=>{
    const authorization = req.headers.authorization
    if(!authorization){
        return res.status(401).json({error: "No authorization"})
    }
    //Extract the token from the Authorization header
    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({error: "Access denied. No token provided"});

    try {
        //Verify the token
        const decodedPayload = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decodedPayload; // Here user is the payload we provided while signing the token
        next();
        
    } catch (error) {
        return next(error)
    }
}

//function to generate the token
const generateToken = (payload)=>{
     return jwt.sign({payload}, process.env.JWT_SECRET);
    
}
module.exports = { jwtAuthMiddleware, generateToken };