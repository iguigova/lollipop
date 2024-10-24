import { jest } from '@jest/globals';
import { createQueue } from '../../dist/utils/queue.js';

// Mock console.warn for testing
global.console.warn = jest.fn();

describe('createQueue', () => {
  beforeEach(() => {
    // Clear console.warn mock before each test
    console.warn.mockClear();
    // Reset Jest timers
    jest.useRealTimers();
  });

  it('should create a queue with a processor function', () => {
    const processor = jest.fn();
    const enqueue = createQueue(processor);
    expect(typeof enqueue).toBe('function');
  });

  it('should throw error if processor is not a function', () => {
    expect(() => createQueue('not a function')).toThrow('Processor must be a function');
    expect(() => createQueue(null)).toThrow('Processor must be a function');
    expect(() => createQueue(undefined)).toThrow('Processor must be a function');
  });

  it('should process items in order', async () => {
    const processed = [];
    const processor = jest.fn(item => processed.push(item));
    const enqueue = createQueue(processor);

    await Promise.all([
      enqueue('first'),
      enqueue('second'),
      enqueue('third')
    ]);

    // Wait for next tick to allow queue processing
    await new Promise(resolve => setImmediate(resolve));

    expect(processed).toEqual(['first', 'second', 'third']);
    expect(processor).toHaveBeenCalledTimes(3);
  });

  it('should handle async processors', async () => {
    const processed = [];
    const processor = jest.fn(async item => {
      await new Promise(resolve => setTimeout(resolve, 10));
      processed.push(item);
    });

    const enqueue = createQueue(processor);

    await Promise.all([
      enqueue('first'),
      enqueue('second')
    ]);

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(processed).toEqual(['first', 'second']);
    expect(processor).toHaveBeenCalledTimes(2);
  });

  it('should respect maxQueueSize', async () => {
    const processed = [];
    const processor = jest.fn(item => processed.push(item));
    const maxQueueSize = 2;
    const enqueue = createQueue(processor, maxQueueSize);

    // Enqueue more items than maxQueueSize
    await Promise.all([
      enqueue('first'),
      enqueue('second'),
      enqueue('third')
    ]);

    // Wait for next tick
    await new Promise(resolve => setImmediate(resolve));

    // Should have warned about queue size
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('Queue size')
    );

    // Should only process the most recent maxQueueSize items
    expect(processed).toEqual(['second', 'third']);
  });

 it('should continue processing after error', async () => {
    const processed = [];
    const processor = jest.fn(async (item) => {
      if (item === 'error') {
        throw new Error('Test error');
      }
      await new Promise(resolve => setTimeout(resolve, 10)); // Small delay to ensure async processing
      processed.push(item);
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const enqueue = createQueue(processor);

    // Enqueue items
    await enqueue('first');
    await enqueue('error');
    await enqueue('third');

    // Wait for all processing to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(processed).toEqual(['first', 'third']);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing queue item:',
      expect.any(Error)
    );

    // Clean up spy
    consoleErrorSpy.mockRestore();
  });

  it('should handle concurrent enqueue operations', async () => {
    const processed = [];
    const processor = jest.fn(async item => {
      await new Promise(resolve => setTimeout(resolve, 10));
      processed.push(item);
    });

    const enqueue = createQueue(processor);

    // Simulate concurrent operations
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(enqueue(`item${i}`));
    }

    await Promise.all(promises);

    // Wait for processing to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check items were processed in order
    expect(processed).toEqual([
      'item0',
      'item1',
      'item2',
      'item3',
      'item4'
    ]);
  });
});
