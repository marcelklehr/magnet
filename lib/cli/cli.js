var ferrite = require('./ferrite');

/* Interpret a file from the command line*/

try {
  var str = require('fs').readFileSync(process.argv[2], 'utf8');
} catch(e) {
  console.log('No or invalid input file');
  process.exit(1);
}

var stdlib = new ferrite.Library;
// define stdlib
// ...

var program = ferrite.interpret(str, stdlib);

program.errors.forEach(function(err) {
  console.log('__');
  console.log('# Parse error in line ' + err.line + ' near "' + err.excerpt + '\", expecting \"' + err.expected + '\"') ;
});

if(program.errors.length > 1) {
  console.log('__');
  program.trace.backtrace();
}
