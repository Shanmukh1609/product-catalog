import express from "express";
import redis from "redis";
import dotenv from "dotenv";
import redisClient from "./config/redis-connection.js";
import router from "./routes/product-routes.js";
import rateLimiterRedis from "./middleware/rateLimiterRedis.js";
import logger from "./utils/logger.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


//Connecting to redis Client.

//
const startServer = async () => {
    try {
        logger.info("Attempting to connect to Redis...");
        
        // 1. Connect to Redis and wait for it to finish.
        await redisClient.connect();
        
        logger.info("Redis connection successful.");

        // 2. Only now, after the connection is ready, start the server.
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        logger.error("Fatal: Could not connect to Redis. Application will not start.", error);
        process.exit(1); // Exit if Redis isn't available.
    }
};

// --- Start the Application ---
startServer();

// app.use(rateLimiterRedis);


// NEW: Endpoint to get a product with caching.
app.use('/products',router);

//Rate Limiter Middleware can be added here.

// app.listen(PORT,()=>{
//   logger.info(`Product Catalog Service is running on port ${PORT}`);
// })