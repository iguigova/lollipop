// Sample stack trace:
//
// Error
//     at getCallerInfo (logger.js:10:15)
//     at new Promise (<anonymous>)
//     at node:internal/process/promises:288:13
//     at async_hooks.js:129:31
//     at Object.log (userCode.js:25:10)  <-- We want this one
// ---------------------------------------------------------------------------------------

// Stack trace line patterns
const LINE_PATTERNS = {
    // Matches: "at FunctionName (/path/to/file.js:123:45)"
    full: /^\s*at\s+(?<function>[^\s(]+)\s+\((?<file>[^:]+):(?<line>\d+):(?<column>\d+)\)/,
    
    // Matches: "at /path/to/file.js:123:45"
    simple: /^\s*at\s+(?<file>[^:]+):(?<line>\d+):(?<column>\d+)/
};

// Patterns to filter out internal Node.js and library calls
const LINES_TO_IGNORE = [
    'node_modules',
    'internal/',
    'async_hooks',
    'new Promise',
    'processTicksAndRejections'
];

// Number of stack frames to skip (including the getCallerInfo function itself)
const LINES_TO_SKIP = 1;

export const parseCallerInfo = (stackLine) => {
    const defaultInfo = { 
        fileName: null,
        lineNumber: '0',
        columnNumber: '0',
        functionName: null 
    };
  
    if (!stackLine) return defaultInfo;
    
    const matchFull = stackLine.match(LINE_PATTERNS.full);
    const matchSimple = stackLine.match(LINE_PATTERNS.simple);
    
    if (!matchFull && !matchSimple) return defaultInfo;
  
    const match = matchFull || matchSimple;
    const groups = match.groups;
    
    return {
        fileName: groups.file || defaultInfo.fileName,
        functionName: groups.function || defaultInfo.functionName,
        lineNumber: groups.line || defaultInfo.lineNumber,
        columnNumber: groups.column || defaultInfo.columnNumber
    };
};

export const getCallerInfo = () => {
    const error = new Error();
    Error.captureStackTrace(error, getCallerInfo);
    
    if (!error.stack) return parseCallerInfo(null);
    
  const stackLines = error.stack
    .split('\n')
    .slice(LINES_TO_SKIP) // Skip the first few frames (including this function)
    .filter(line => line.trim() && !LINES_TO_IGNORE.some(pattern => line.includes(pattern)));

  return parseCallerInfo(stackLines[0]);
};

export default getCallerInfo;
