import { jest } from '@jest/globals';
import fs from 'fs/promises';
import zlib from 'zlib';
import { serveStaticFile } from '../../utils/files.mjs';

jest.mock('zlib', () => ({
  gzip: jest.fn((data, callback) => {
    // Simulate gzip compression by returning a different buffer
    const compressed = Buffer.from(data).toString('base64');
    callback(null, Buffer.from(compressed));
  })
}));

describe('serveStaticFile', () => {
  let req, res;
  let readFileSpy;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      writeHead: jest.fn(),
      end: jest.fn()
    };
    readFileSpy = jest.spyOn(fs, 'readFile');
  });

  afterEach(() => {
    jest.clearAllMocks();
    readFileSpy.mockRestore();
  });

  test('serves file with correct MIME type', async () => {
    const mockData = 'file content';
    readFileSpy.mockResolvedValue(mockData);

    await serveStaticFile(req, res, 'test.html');

    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
      'Content-Type': 'text/html'
    }));
    expect(res.end).toHaveBeenCalledWith(mockData);
  });

  test('compresses file if gzip is accepted', async () => {
    const mockData = 'file content';
    readFileSpy.mockResolvedValue(mockData);
    req.headers['accept-encoding'] = 'gzip';

    await serveStaticFile(req, res, 'test.js');

    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({
      'Content-Type': 'application/javascript',
      'Content-Encoding': 'gzip'
    }));
    
    // Check that res.end was called with a Buffer
    expect(res.end).toHaveBeenCalledWith(expect.any(Buffer));
    
    // Check that the buffer sent to res.end is different from the original data
    const sentData = res.end.mock.calls[0][0];
    expect(Buffer.compare(Buffer.from(mockData), sentData)).not.toBe(0);
  });

  test('returns 404 for non-existent file', async () => {
    readFileSpy.mockRejectedValue({ code: 'ENOENT' });

    await serveStaticFile(req, res, 'nonexistent.file');

    expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'text/plain' });
    expect(res.end).toHaveBeenCalledWith('404 Not Found');
  });

  test('returns 500 for server errors', async () => {
    readFileSpy.mockRejectedValue(new Error('Some error'));

    await serveStaticFile(req, res, 'error.file');

    expect(res.writeHead).toHaveBeenCalledWith(500, { 'Content-Type': 'text/plain' });
    expect(res.end).toHaveBeenCalledWith('500 Internal Server Error');
  });
});
