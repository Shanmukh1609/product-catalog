import redisClient from "../config/redis-connection.js";

const rateLimiterRedis = async(req,res,next)=>{
    console.log("Rate Limiter Middleware using Redis");
    try{

        const maxRequests = 10; //Max requests allowed
        const windowSizeInSeconds = 60; //Time window in seconds
        const ip = req.ip; //Get the IP address of the client

        const cacheKey =`rate-limit:${ip}`;
        const requests = await redisClient.incr(cacheKey);
        if(requests===1){
            //Set the expiration time for the key
            await redisClient.expire(cacheKey,windowSizeInSeconds);
        }

        if(requests>maxRequests){
            return res.status(429).json({
                success:false,
                message:"Too many requests. Please try again later."
            });
        }

        next();
    }
    catch(err){
        console.error('Error in Rate Limiter Middleware:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}

export default rateLimiterRedis;