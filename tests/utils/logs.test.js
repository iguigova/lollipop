import { jest } from '@jest/globals';
import { stdout } from 'process';
import { asyncLog, asyncLogCustom } from '../../dist/utils/logs.js';
import { isWithinMinute, createWithin, MILLISECONDS } from '../../dist/utils/dates.js';

describe('Logs', () => {
  const mockWrite = jest.fn((data, encoding, callback) => callback());
  const originalStdoutWrite = stdout.write;
  
  beforeEach(() => {
    jest.clearAllMocks();
    stdout.write = mockWrite;
  });

  afterAll(() => {
    stdout.write = originalStdoutWrite;
  });

  describe('asyncLog', () => {
    it('should log a message with correct properties', async () => {
      await asyncLog('test message');
  
      // Since setImmediate is used in the queue, we need to wait for the next tick
      await new Promise(resolve => setImmediate(resolve));
  
      // Verify that stdout.write was called
      expect(mockWrite).toHaveBeenCalled();
  
      // Get the actual logged data
      const loggedData = mockWrite.mock.calls[0][0];
      const parsedLog = JSON.parse(loggedData);
  
      expect(parsedLog.message).toBe('test message');
      expect(isWithinMinute(parsedLog.timestamp)).toBe(true);
      expect(parsedLog.source).toMatch(/logs\.test\.js:\d+/);
      expect(parsedLog.severity).toBe(0);
      expect(isWithinMinute(parsedLog.lifespan, createWithin(MILLISECONDS.DAY))).toBe(true);
      expect(parsedLog.tags).toEqual([]);
    });
  
    it('should log a single message correctly', async () => {
      await asyncLog('test message');
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(loggedData.message).toBe('test message');
      expect(isWithinMinute(loggedData.timestamp)).toBe(true);
      expect(loggedData.source).toMatch(/logs\.test\.js:\d+/);
    });

    it('should handle multiple arguments', async () => {
      await asyncLog('hello', 123, { test: true });
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(loggedData.message).toBe('hello 123 {"test":true}');
    });

    it('should handle objects and arrays', async () => {
      const testObj = { name: 'test', value: 42 };
      const testArray = [1, 2, 3];
      
      await asyncLog(testObj, testArray);
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(loggedData.message).toBe('{"name":"test","value":42} [1,2,3]');
    });

    it('should handle undefined and null values', async () => {
      await asyncLog(undefined, null);
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(loggedData.message).toBe('undefined null');
    });
  });

  describe('asyncLogCustom', () => {
    it('should handle custom severity levels', async () => {
      await asyncLogCustom({ message: 'error', severity: 2 });
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(loggedData.severity).toBe(2);
    });

    it('should handle custom tags', async () => {
      await asyncLogCustom({ 
        message: 'tagged message',
        tags: ['error', 'critical']
      });
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(loggedData.tags).toEqual(['error', 'critical']);
    });

    it('should handle custom lifespan', async () => {
      const customLifespan = new Date(Date.now() + 2 * MILLISECONDS.DAY);
      
      await asyncLogCustom({ 
        message: 'custom lifespan',
        lifespan: customLifespan
      });
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(new Date(loggedData.lifespan)).toEqual(customLifespan);
    });

    it('should handle custom source', async () => {
      await asyncLogCustom({ 
        message: 'custom source',
        source: 'CustomModule'
      });
      await new Promise(resolve => setImmediate(resolve));

      const loggedData = JSON.parse(mockWrite.mock.calls[0][0]);
      expect(loggedData.source).toBe('CustomModule');
    });
  });

  describe('Error Handling', () => {
    it('should handle stdout write errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const writeError = new Error('Write failed');
      
      stdout.write = jest.fn((data, encoding, callback) => callback(writeError));
      
      await asyncLog('test message');
      await new Promise(resolve => setImmediate(resolve));
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing queue item:', writeError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing stdout.write', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      stdout.write = undefined;
      
      await asyncLog('test message');
      await new Promise(resolve => setImmediate(resolve));
      
      expect(consoleLogSpy).toHaveBeenCalled();
      consoleLogSpy.mockRestore();
    });
  });

  describe('Queue Behavior', () => {
    it('should process multiple logs in order', async () => {
      const messages = ['first', 'second', 'third'];
      
      await Promise.all(messages.map(msg => asyncLog(msg)));
      await new Promise(resolve => setImmediate(resolve));

      expect(mockWrite).toHaveBeenCalledTimes(3);
      const loggedMessages = mockWrite.mock.calls.map(call => 
        JSON.parse(call[0]).message
      );
      expect(loggedMessages).toEqual(messages);
    });

    it('should warn when queue size limit is reached', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Generate more than 100 log messages (default queue size)
      await Promise.all(Array(101).fill().map((_, i) => 
        asyncLog(`message ${i}`)
      ));
      
      await new Promise(resolve => setImmediate(resolve));
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Queue size \(\d+\) has reached maximum/)
      );
      consoleWarnSpy.mockRestore();
    });
  });
});

