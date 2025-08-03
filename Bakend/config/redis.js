import { createClient } from 'redis';


import dotenv from 'dotenv';
dotenv.config();

const redisClient = createClient({
    username: 'default',
    password:process.env.REDIS_PASS,
    socket: {
        host: 'redis-11036.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 11036
    }
});
redisClient.on('error', (err) => {
  console.error(' Redis Client Error:', err.message);
});

redisClient.on('connect', () => {
  console.log(' Redis connected');
});


export default redisClient;