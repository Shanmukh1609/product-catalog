import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// 1. Create the client instance.
const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://127.0.0.1:6379`
});

// 2. Set up event listeners so we can see what's happening.
redisClient.on('error', (error) => console.error(`Redis Error: ${error}`));
redisClient.on('connect', () => console.log('Redis is connecting...'));
redisClient.on('ready', () => console.log('Redis client is ready.'));
redisClient.on('end', () => console.log('Redis connection closed.'));


// 3. Export the unconnected client. We will connect in our main server file.
export default redisClient;
