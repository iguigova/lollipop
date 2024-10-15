const createAsyncLog = () => {

  const queue = [];
  let isProcessing = false;

  const processQueue = () => {
    if (queue.length > 0) {
      const item = queue.shift();
      process.stdout.write(item, 'utf8', () => {
        setImmediate(processQueue);
      });
    } else {
      isProcessing = false;
    }
  };

  const enqueue = (data) => {
    queue.push(data);
    if (!isProcessing) {
      isProcessing = true;
      setImmediate(processQueue);
    }
  };

  return (...args) => {
    const output = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ') + '\n';
    
    enqueue(output);
  };
};

const asyncLog = createAsyncLog();

export default asyncLog;

// Usage
// import asyncLog from './asyncLog.js';
// asyncLog('This is an async log message');
// asyncLog('Another message', { key: 'value' });
