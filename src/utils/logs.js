import { stdout } from 'process';
import { getCallerInfo } from './callstack.js';

const MAX_QUEUE_SIZE = 100;
const DEFAULT_ENCODING = 'utf8';

const queue = [];
let isProcessing = false;

const safeWrite = (data, encoding = DEFAULT_ENCODING) => 
      new Promise((resolve, reject) => {
          if (!stdout?.write || typeof stdout.write !== 'function') {
              console.log(data);
              resolve();
          }
          
          stdout.write(data, encoding, (error) => 
              error ? reject(error) : resolve()
          );
      });

const processQueue = async () => {
    try {
        while (queue.length > 0) {
            await safeWrite(queue.shift());
        }
    } catch (error) {
        console.error('Error writing to stdout:', error);
    } finally {
        isProcessing = false;
    }
};

const truncateQueue = () => {
    if (queue.length >= MAX_QUEUE_SIZE) {
        console.warn(`Log queue size (${queue.length}) has reached maximum. Oldest logs discarded.`);
        queue.splice(0, queue.length - MAX_QUEUE_SIZE);
    }
};

const enqueue = (data) => new Promise((resolve) => {
    queue.push(data);
    truncateQueue();
    
    if (!isProcessing) {
        isProcessing = true;
        setImmediate(async () => {
            await processQueue();
            resolve();
        });
    } else {
        resolve();
    }
});

const formatMessage = (...args) => args
      .map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
      .join(' ');

const createLogMessage = ({
    message,
    timestamp = new Date().toISOString(),
    stack,
    source,
    severity = 0,
    lifespan = new Date(Date.now() + 24 * 60 * 60 * 1000),
    tags = []
}) => {
    const { fileName, lineNumber } = getCallerInfo(stack);
    
    return {
        message: formatMessage(message),
        timestamp,
        source: source || `${fileName}:${lineNumber}`,
        severity: +severity,
        lifespan: lifespan instanceof Date ? lifespan.toISOString() : new Date(lifespan).toISOString(),
        tags
    };
};

export const asyncLogCustom = async (options = {}) => {
    const error = new Error()
    Error.captureStackTrace(error, asyncLog);
    options.stack = error.stack;
    
    const logMessage = createLogMessage(options);

    await enqueue(JSON.stringify(logMessage) + '\n');

    return logMessage;
};

export const asyncLog = async (...args) => asyncLogCustom({ message: args });

const handleShutdown = async () => {
  console.log('SIGTERM received. Flushing logs...');
  await new Promise(resolve => {
    const interval = setInterval(() => {
      if (queue.length === 0) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
  process.exit(0);
};

process.once('SIGTERM', handleShutdown);

export default asyncLog;
