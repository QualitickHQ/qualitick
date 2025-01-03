import { Worker } from 'bullmq';
import { trackInteraction } from './core/tracker';

// Define the worker process
new Worker(
    'track_queue',
    async (job) => {
        const { projectId, organizationId, data } = job.data;
        const { input, output, event, conversation_id, model, urls } = data;

        try {
            await trackInteraction(
                input,
                output,
                event,
                model,
                urls || [],
                conversation_id,
                projectId,
                organizationId
            );

            console.log(`Job ${job.id} completed successfully`);
        } catch (error) {
            console.error('Worker Error:', error);
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || "6379"),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || "0") || 0
        }
    }
);