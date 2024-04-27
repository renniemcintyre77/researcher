import { Redis } from "ioredis";
import { RedisCache } from "@langchain/community/caches/ioredis";
declare class ChatCache {
    private static instance;
    private constructor();
    static getInstance(client: Redis): RedisCache;
}
declare const redisClient: Redis;
export { redisClient as RedisClient, ChatCache };
