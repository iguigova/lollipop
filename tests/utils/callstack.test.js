import { getCallerInfo } from '../../dist/utils/callstack.js';

describe('CallStack', () => {
  describe('getCallerInfo', () => {
    it('should parse a basic stack trace correctly', () => {
      const mockStack = `Error
    at Module.foo (/path/to/test.js:10:15)
    at Object.<anonymous> (/path/to/source.js:5:10)`;
      
      const result = getCallerInfo(mockStack);
      
      expect(result).toEqual({
        fileName: 'test.js',
        lineNumber: '10'
      });
    });

    it('should handle stack trace without provided stack parameter', () => {
      const result = getCallerInfo();
      
      expect(result).toHaveProperty('fileName');
      expect(result).toHaveProperty('lineNumber');
    });

    it('should handle malformed stack traces gracefully', () => {
      const mockStack = `Error
    some malformed stack trace
    that doesn't match the pattern`;
      
      const result = getCallerInfo(mockStack);
      
      expect(result).toEqual({
        fileName: undefined,
        lineNumber: undefined
      });
    });

    it('should handle empty stack traces', () => {
      const result = getCallerInfo('');

      expect(result.fileName).toBe('callstack.js');      
      expect(result).toHaveProperty('lineNumber');
    });

    it('should extract info from nested function calls', () => {
      const firstLevel = () => secondLevel();
      const secondLevel = () => getCallerInfo();
      
      const result = firstLevel();
      expect(result.fileName).toBe('callstack.js');
      expect(result).toHaveProperty('lineNumber');
    });

    it('should handle anonymous functions', () => {
      const mockStack = `Error
    at /path/to/test.js:10:15
    at /path/to/source.js:5:10`;
      
      const result = getCallerInfo(mockStack);
      
      expect(result).toEqual({
        fileName: 'test.js',
        lineNumber: '10'
      });
    });
  });

  describe('Stack Generation', () => {
    it('should get correct info from real function calls', () => {
      const getStack = () => getCallerInfo();
      
      const result = getStack();
      
      expect(result).toHaveProperty('fileName');
      expect(typeof result.fileName).toBe('string');
      expect(result).toHaveProperty('lineNumber');
      expect(typeof result.lineNumber).toBe('string');
    });
    
    it('should handle null or undefined stack parameter', () => {
      expect(() => getCallerInfo(null)).not.toThrow();
      expect(() => getCallerInfo(undefined)).not.toThrow();
    });
  });
});
