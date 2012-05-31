module.exports.Primal = Primal; // interface for creating magnet objects from javascript values

module.exports.Library = Library; // interface for registering stdlib methods written in javascript

// utility
module.exports.repeatString = repeatString;

module.exports.interpret = function interpret(code, libs, cb) {
  code += "\r\n";
  
  var nativeScope = new Scope;
  nativeScope.meta = {identifier: '<Native>'};
  
  var globalScope = new Scope(nativeScope, nativeScope);
  globalScope.meta = {identifier: '<Global>'};
  
  var env = globalScope.env;
  
  libs = libs ? libs : [];
  libs.forEach(function(lib) {
    lib.attach(nativeScope);
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
    return cb(errors, globalScope.env);
  }
  
  globalScope.env.on('end', function() {
    cb([], globalScope.env);
  });
  
  globalScope.env.on('error', function(err) {
    var trace = e.scope.backtrace().map(function(call) {
      return {caller: call.caller, at: call.at ? calcLineNo(code, call.at) : '<native>'};
    });
    trace.unshift({caller: e.scope.meta.identifier, at: calcLineNo(code, e.offset)});
    cb([{
      msg: 'Runtime Error: '+e.message,
      line: calcLineNo(code, e.offset),
      col: getLineCol(code, e.offset),
      excerpt: getLineExcerpt(code, e.offset),
      backtrace: trace 
    }], globalScope.env);
  });
  
  var ret = globalScope.executeTokenList(opcode); // the returned value
  if(env.events.waiting == 0) env.emit('end');
};