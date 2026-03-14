import { env } from "./envVar.js";
import queue from "./messageQueue/queue.js";
import { Worker } from 'bullmq';

export default class MCPClient {
    static instructions;

    constructor(instructions) {
        this.instructions = instructions
    }

    async addJobs() {
        for (let index = 0; index < this.instructions.length; index++) {
            const element = this.instructions[index];
            queue.add('job1', element);
            console.log(`${element} added to the job queue.`)
        }
    }

    async doJobs(){
        const connection = {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
        };
        new Worker('Jobs',async job => {
            console.log(job.data);
            console.log(`${job.data} done`)
          },
          { connection },
        );
    }
}