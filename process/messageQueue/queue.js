import { Queue } from "bullmq";
import { env } from "../envVar.js";

const queue = new Queue('Jobs', {
  connection: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT
  }
});

export default queue