module.exports.TypeFactory = TypeFactory; // interface for registering stdlib methods written in javascript

module.exports.Library = Library; // interface for registering stdlib methods written in javascript

module.exports.interpret = function interpret(code, lib) {
  var globalScope = new Scope;
  // lib.attach(globalScope); --activate for stdlib support
  
  var err_offsets = new Array();
  var err_lookaheads = new Array();
  var err_count = 0;
  var errors = [];

  if( ( err_count = __parse( code, err_offsets, err_lookaheads, globalScope ) ) > 0 ) {
    for( var i = 0; i < err_count; i++ ) {
      errors.push({
        line : code.substr( 0, err_offsets[i] ).match( /\n/g ) ? code.substr( 0, err_offsets[i] ).match( /\n/g ).length : 1,
        excerpt : code.substr(0, err_offsets[i] ),
        expected : err_lookaheads[i].join()
      });
    }
  }
  
  return {errors: errors, trace: globalScope.global.trace};
};