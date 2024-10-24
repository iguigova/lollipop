import { jest } from '@jest/globals';
import { asyncLog, asyncLogCustom } from '../../dist/utils/logs.js';

describe('Logging System', () => {
  let mockWrite;
  let originalStdoutWrite;
  let logQueue = [];

  beforeEach(() => {
    originalStdoutWrite = process.stdout.write;
    mockWrite = jest.fn((data, encoding, callback) => {
      logQueue.push(data);
      if (callback) callback();
      return true;
    });
    process.stdout.write = mockWrite;
    logQueue = [];
  });

  afterEach(() => {
    process.stdout.write = originalStdoutWrite;
  });

  describe('asyncLog', () => {
    it('should log simple string messages', async () => {
      const message = 'test message';
      await asyncLog(message);
      
      await new Promise(resolve => setImmediate(resolve));
      
      expect(mockWrite).toHaveBeenCalled();
      const loggedData = JSON.parse(logQueue[0]);
      expect(loggedData.message).toBe(message);
    });

    it('should handle multiple arguments', async () => {
      await asyncLog('message', 123, { key: 'value' });
      
      await new Promise(resolve => setImmediate(resolve));
      
      const loggedData = JSON.parse(logQueue[0]);
      expect(loggedData.message).toBe('message 123 {"key":"value"}');
    });

    it('should handle objects', async () => {
      const testObj = { test: 'value' };
      await asyncLog(testObj);
      
      await new Promise(resolve => setImmediate(resolve));
      
      const loggedData = JSON.parse(logQueue[0]);
      expect(loggedData.message).toBe(JSON.stringify(testObj));
    });
  });

  describe('asyncLogCustom', () => {
    it('should handle custom log options', async () => {
      const timestamp = new Date().toISOString();
      const message = 'custom log message';
      const source = 'test-source';
      const severity = 2;
      const tags = ['test', 'custom'];
      
      await asyncLogCustom({
        message,
        timestamp,
        source,
        severity,
        tags
      });
      
      await new Promise(resolve => setImmediate(resolve));
      
      const loggedData = JSON.parse(logQueue[0]);
      expect(loggedData).toMatchObject({
        message,
        timestamp,
        source,
        severity,
        tags
      });
    });

    it('should auto-generate source if not provided', async () => {
      await asyncLogCustom({
        message: 'test'
      });
      
      await new Promise(resolve => setImmediate(resolve));
      
      const loggedData = JSON.parse(logQueue[0]);
      expect(loggedData.source).toContain('logs.test.js');
    });

    it('should set default severity to 0', async () => {
      await asyncLogCustom({
        message: 'test'
      });
      
      await new Promise(resolve => setImmediate(resolve));
      
      const loggedData = JSON.parse(logQueue[0]);
      expect(loggedData.severity).toBe(0);
    });

    it('should handle array messages', async () => {
      await asyncLogCustom({
        message: ['part1', 'part2', { key: 'value' }]
      });
      
      await new Promise(resolve => setImmediate(resolve));
      
      const loggedData = JSON.parse(logQueue[0]);
      expect(loggedData.message).toBe('part1 part2 {"key":"value"}');
    });
  });

  describe('Queue Management', () => {
    it('should process multiple logs in order', async () => {
      const messages = ['first', 'second', 'third'];
      
      for (const msg of messages) {
        await asyncLog(msg);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(logQueue.length).toBe(3);
      messages.forEach((msg, index) => {
        const loggedData = JSON.parse(logQueue[index]);
        expect(loggedData.message).toBe(msg);
      });
    });

    it('should handle queue overflow', async () => {
      const MAX_QUEUE_SIZE = 1000;
      const overflowSize = MAX_QUEUE_SIZE + 10;
      
      const promises = Array(overflowSize).fill().map((_, i) => 
        asyncLog(`message ${i}`)
      );
      
      await Promise.all(promises);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(logQueue.length).toBeLessThanOrEqual(MAX_QUEUE_SIZE);
    });
  });

  describe('Error Handling', () => {
    it('should handle stdout write errors gracefully', async () => {
      process.stdout.write = jest.fn((data, encoding, callback) => {
        callback(new Error('Write error'));
        return false;
      });
      
      const logPromise = asyncLog('test message');
      await expect(logPromise).resolves.toMatchObject({
        message: 'test message',
        severity: 0
      });
    });
  });
});
