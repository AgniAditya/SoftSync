import RedisServer from "redis-server";
import { env } from "../envVar.js";

const runRedisServer = async () => {
    const redis = new RedisServer(env.REDIS_PORT)

    redis.open((err) => {
        if (err !== null) {
            console.log(err.message)
        }
    });
}

export default runRedisServer