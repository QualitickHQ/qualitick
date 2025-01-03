import { Redis } from "ioredis";

class RedisClient {

    private static _instance: RedisClient | null = null;
    private _redis: Redis;

    private constructor() {
        this._redis = new Redis({
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || ""),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || "") || 0
        });
    }

    public static getInstance(): Redis {
        if (!RedisClient._instance) {
            RedisClient._instance = new RedisClient()
        }

        return RedisClient._instance._redis
    }
}

export const redis = RedisClient.getInstance()
