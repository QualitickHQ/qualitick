import { Queue } from "bullmq";

export default class TaskQueue {

    private static _instance: TaskQueue | null = null;
    private _queue: Queue;

    private constructor() {
        this._queue = new Queue(
            "track_queue",
            {
                connection: {
                    host: process.env.REDIS_HOST,
                    port: parseInt(process.env.REDIS_PORT || ""),
                    password: process.env.REDIS_PASSWORD,
                    db: parseInt(process.env.REDIS_DB || "") || 0
                }
            }
        )
    }

    public static getInstance(): Queue {
        if (!TaskQueue._instance) {
            TaskQueue._instance = new TaskQueue()
        }

        return TaskQueue._instance._queue;
    }
}

export const queue = TaskQueue.getInstance()