
export const createQueue = (processor, maxQueueSize = 100) => {
    if (typeof processor !== 'function') {
        throw new TypeError('Processor must be a function');
    }
    
    let queue = [];
    let isProcessing = false;
    
    const processQueue = async () => {
        try {
            while (queue.length > 0) {
                const item = queue[0]; // Peek at the first item
                try {
                    await processor(item);
                } catch (error) {
                    console.error('Error processing queue item:', error);
                }
                queue.shift(); // Remove the item after processing (or error)
            }
        } finally {
            isProcessing = false;
        }
    };
    
    const enqueue = async (item) => {
        return new Promise((resolve) => {
            queue.push(item);
            
            if (queue.length >= maxQueueSize) {
                console.warn(`Queue size (${queue.length}) has reached maximum. Oldest items discarded.`);
                queue.splice(0, queue.length - maxQueueSize);
            }
            
            if (!isProcessing) {
                isProcessing = true;
                setImmediate(async () => {
                    await processQueue();
                    resolve(item);
                });
            } else {
                resolve(item);
            }
        });
    };
    
    return enqueue;
};

export default createQueue;
