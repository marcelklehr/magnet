var ferrite = require('./ferrite');

/* Interpret a file from the command line*/

try {
  var str = require('fs').readFileSync(process.argv[2], 'utf8');
} catch(e) {
  console.log('No or invalid input file');
  process.exit(1);
}

//var stdlib = new ferrite.Library;
// define stdlib
// ...

var program = ferrite.interpret(str/*, stdlib*/);

program.errors.forEach(function(err) {
  console.log('__');
  console.log('# Parse Error in line ' + err.line + ', expecting \"' + err.expected + '\"') ;
  
  var pointer = '# '+process.argv[2]+':'+err.line+':'+err.lineindex+'> ';
  console.log(pointer + err.excerpt);
  
  var index = err.lineindex + pointer.length;
  var padding = repeatString(' ', index);
  console.log(padding + '^');
});

if(program.errors.length > 1) {
  console.log('__');
  program.trace.backtrace();
}
