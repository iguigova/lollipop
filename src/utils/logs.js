import { stdout } from 'process';
import { getCallerInfo } from './callstack.js';
import { createQueue } from './queue.js';

const DEFAULT_ENCODING = 'utf8';

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

const enqueueLog = createQueue(
  async (data) => await safeWrite(data + '\n'),
  100
);

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
  const error = new Error();
  Error.captureStackTrace(error, asyncLog);
  options.stack = error.stack;
  
  const logMessage = createLogMessage(options);
  await enqueueLog(JSON.stringify(logMessage));
  return logMessage;
};

export const asyncLog = async (...args) => asyncLogCustom({ message: args });

export default asyncLog;
