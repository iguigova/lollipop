
const STACK_LINE_PARSER_PATTERN = /\/([^\/]+\.js):(\d+):/;

export const getCallerInfo = (stack) => {
    const defaultCallerInfo = { fileName: undefined, lineNumber: undefined };
    
    const stackLines = (stack || new Error().stack)
          .split('\n')
          .slice(1);

    if (!stackLines || !stackLines[0]) return defaultCallerInfo; 
    
    const match = stackLines[0].match(STACK_LINE_PARSER_PATTERN);

    if (!match) return defaultCallerInfo;
    
    return { fileName: match[1], lineNumber: match[2] };
};

export default getCallerInfo;
