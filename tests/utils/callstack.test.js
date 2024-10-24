import { getCallerInfo, parseCallerInfo } from '../../dist/utils/callstack.js';

describe('getCallerInfo', () => {
  it('should return caller information from a direct function call', () => {
    const info = getCallerInfo();
    
    // Test for presence of data rather than exact format
    expect(info.fileName).not.toBeNull();
    expect(info.lineNumber).not.toBe('0');
    expect(info.columnNumber).not.toBe('0');
    expect(info.fileName).toContain('.test.js'); // Should point to this test file
  });

  it('should not include internal Node.js calls in the stack', () => {
    const info = getCallerInfo();
    expect(info.fileName).toBeTruthy();
    expect(info.fileName).not.toContain('node:internal');
    expect(info.fileName).not.toContain('node_modules');
  });

  it('should return default values when stack trace is unavailable', () => {
      // Save original Error constructor
      const OriginalError = global.Error;
      
      // Mock Error constructor
      global.Error = function() {
          return {
              stack: undefined
          };
      };
      global.Error.captureStackTrace = () => {};
      
      const info = getCallerInfo();
      
      expect(info).toEqual({
          fileName: null,
          lineNumber: '0',
          columnNumber: '0',
          functionName: null
      });
      
      // Restore original Error
      global.Error = OriginalError;
  });
});

describe('parseCallerInfo', () => {
  it('should parse full stack trace format correctly', () => {
    const stackLine = '    at Function.Module._load (internal/modules/cjs/loader.js:757:27)';
    const info = parseCallerInfo(stackLine);
    
    expect(info).toEqual({
      fileName: 'internal/modules/cjs/loader.js',
      functionName: 'Function.Module._load',
      lineNumber: '757',
      columnNumber: '27'
    });
  });

  it('should parse simple stack trace format correctly', () => {
    const stackLine = '    at /path/to/file.js:10:15';
    const info = parseCallerInfo(stackLine);
    
    expect(info).toEqual({
      fileName: '/path/to/file.js',
      functionName: null,  // No function name in simple format
      lineNumber: '10',
      columnNumber: '15'
    });
  });

  it('should handle invalid stack trace format', () => {
    const stackLine = 'invalid stack trace format';
    const info = parseCallerInfo(stackLine);
    
    expect(info).toEqual({
      fileName: null,
      lineNumber: '0',
      columnNumber: '0',
      functionName: null
    });
  });

  it('should handle null or undefined input', () => {
    expect(parseCallerInfo(null)).toEqual({
      fileName: null,
      lineNumber: '0',
      columnNumber: '0',
      functionName: null
    });

    expect(parseCallerInfo(undefined)).toEqual({
      fileName: null,
      lineNumber: '0',
      columnNumber: '0',
      functionName: null
    });
  });

  it('should return null for functionName in simple format', () => {
    const stackLine = '    at /simple/path.js:1:1';
    const info = parseCallerInfo(stackLine);
    expect(info.functionName).toBeNull();
  });
});

describe('real world scenarios', () => {
  const createNestedCall = (depth) => {
    const nested = (currentDepth) => {
      if (currentDepth === 0) {
        return getCallerInfo();
      }
      return nested(currentDepth - 1);
    };
    return nested(depth);
  };

  it('should handle deeply nested calls', () => {
    const info = createNestedCall(5);
    expect(info.fileName).not.toBeNull();
    expect(info.lineNumber).not.toBe('0');
    expect(info.columnNumber).not.toBe('0');
  });

  it('should handle promises and async/await', async () => {
    const info = await Promise.resolve().then(() => getCallerInfo());
    expect(info.fileName).not.toBeNull();
    expect(info.lineNumber).not.toBe('0');
    expect(info.columnNumber).not.toBe('0');
  });
    
  it('should handle setTimeout', (done) => {
      setTimeout(() => {
          const info = getCallerInfo();
          expect(info.fileName).toContain('test');  // More general check
          expect(info.fileName).not.toBeNull();
          done();
      }, 100);
  }, 1000);  // Shorter timeout
});
