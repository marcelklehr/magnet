module.exports.Primal = Primal; // interface for creating magnet objects from javascript values

module.exports.Library = Library; // interface for registering stdlib methods written in javascript

// utility
module.exports.repeatString = repeatString;

module.exports.interpret = function interpret(code, libs) {
  code += "\r\n";
  var b2mb = function(b) {
    return ((b / Math.pow(2, 10))/ Math.pow(2, 10)).toFixed(2) + ' MB';
  };
  var startmemory = process.memoryUsage().heapUsed;
  console.time('# Execution time');
  
  var globalScope = new Scope;
  globalScope.meta = {identifier: '<Global>'};
  
  libs = libs ? libs : [];
  libs.forEach(function(lib) {
    lib.attach(globalScope);
  });
  
  var opcode = [];
  var err_offsets = [];
  var err_lookaheads = [];
  var err_count = 0;
  var errors = [];

  if( ( err_count = __parse( code, err_offsets, err_lookaheads, opcode ) ) > 0 ) {
    for( var i = 0; i < err_count; i++ ) {
      var line = calcLineNo(code, err_offsets[i]);
      errors.push({
        line : line,
        col :  getLineCol(code, err_offsets[i]),
        msg : 'Parse Error: unexpected token '+JSON.stringify(code[err_offsets[i]])+' expecting ' + err_lookaheads[i].map(JSON.stringify).join(' or '),
        excerpt : getLineExcerpt(code, err_offsets[i])
      });
    }
    return {errors: errors};
  }
  
  try {
    var ret = globalScope.executeTokenList(opcode); // the returned value
  }catch(e){
    if(!e.scope) thorw e;
    var trace = e.scope.backtrace().map(function(call) {
      return {caller: call.caller, at: calcLineNo(code, call.at)};
    });
    trace.unshift({caller: e.scope.meta.identifier, at: calcLineNo(code, e.offset)});
    return {errors: [{ msg: 'Runtime Error: '+e.message, line: calcLineNo(code, e.offset), col: getLineCol(code, e.offset), excerpt: getLineExcerpt(code, e.offset), backtrace: trace }]};
  };
  
  // post execution notes
  console.timeEnd('# Execution time');
  console.log('# Heap size: ', globalScope.env.heap.length);
  console.log('# Memory usage: ', b2mb(process.memoryUsage().heapUsed - startmemory));
  
  return {errors: errors};
};