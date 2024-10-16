import { jest } from '@jest/globals';
import asyncLog from '../../dist/utils/logs.js';

// Helper function to wait for a short period
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('asyncLog', () => {
  let mockStdout;
  let originalStdout;

  beforeEach(() => {
    originalStdout = process.stdout.write;
    mockStdout = jest.fn((data, encoding, callback) => {
      if (callback) callback();
    });
    process.stdout.write = mockStdout;
  });

  afterEach(() => {
    process.stdout.write = originalStdout;
  });

  test('should log a single message', async () => {
    asyncLog('Test message');
    await wait(50);
    expect(mockStdout).toHaveBeenCalledWith('Test message\n', 'utf8', expect.any(Function));
  });

  test('should log multiple arguments', async () => {
    asyncLog('Message 1', 'Message 2', 3);
    await wait(50);
    expect(mockStdout).toHaveBeenCalledWith('Message 1 Message 2 3\n', 'utf8', expect.any(Function));
  });

  test('should stringify objects', async () => {
    const testObj = { key: 'value' };
    asyncLog('Object:', testObj);
    await wait(50);
    expect(mockStdout).toHaveBeenCalledWith('Object: {"key":"value"}\n', 'utf8', expect.any(Function));
  });

  test('should handle multiple log calls', async () => {
    asyncLog('First log');
    asyncLog('Second log');
    await wait(100);
    expect(mockStdout).toHaveBeenCalledTimes(2);
    expect(mockStdout).toHaveBeenNthCalledWith(1, 'First log\n', 'utf8', expect.any(Function));
    expect(mockStdout).toHaveBeenNthCalledWith(2, 'Second log\n', 'utf8', expect.any(Function));
  });
});
