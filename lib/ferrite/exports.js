module.exports.TypeFactory = TypeFactory; // interface for creating magnet objects from javascript values

//module.exports.Library = Library;  interface for registering stdlib methods written in javascript

module.exports.interpret = function interpret(code, lib) {
  var b2mb = function(b) {
    return ((b / Math.pow(2, 10))/ Math.pow(2, 10)).toFixed(2) + ' MB';
  };
  console.log('# Node memory usage: ',  b2mb(process.memoryUsage().heapUsed));
  
  var globalScope = new Scope;
  // lib.attach(globalScope); --activate for stdlib support
  
  var opcode = [];
  var err_offsets = new Array();
  var err_lookaheads = new Array();
  var err_count = 0;
  var errors = [];

  if( ( err_count = __parse( code, err_offsets, err_lookaheads, opcode ) ) > 0 ) {
    for( var i = 0; i < err_count; i++ ) {
      var line = code.substr( 0, err_offsets[i] ).split("\n").length;
      errors.push({
        line : line,
        expected : err_lookaheads[i].join(),
        excerpt : code.substr( 0, err_offsets[i] ).split("\n").pop() + code.substr( err_offsets[i], 250 ).split("\n")[0],
        lineindex :  code.substr( 0, err_offsets[i] ).split("\n").pop().length
      });
    }
    return {errors: errors, trace: globalScope.env.trace};
  }
  
  opcode.forEach(function executeToken(node){
    globalScope.execute(node);
  });
  
  console.log('# Heap size: ', globalScope.env.heap.length);
  console.log('# Node memory usage: ', b2mb(process.memoryUsage().heapUsed));
  
  return {errors: errors, trace: globalScope.env.trace};
};