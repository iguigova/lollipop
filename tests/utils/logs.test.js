import { jest } from '@jest/globals';
import { stdout } from 'process';
import { asyncLog } from '../../dist/utils/logs.js';
import { isWithinMinute, createWithin, MILLISECONDS } from '../../dist/utils/dates.js';

describe('asyncLog', () => {
  const mockWrite = jest.fn((data, encoding, callback) => {
    callback();
  });

  beforeAll(() => {
    stdout.write = mockWrite;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

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
});

