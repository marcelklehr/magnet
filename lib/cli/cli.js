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
  console.log('\r\n');
  
  console.log(process.argv[2]+':'+err.line);
  console.log('\t'+err.excerpt);
  
  var padding = ferrite.repeatString(' ', err.col-1);
  console.log('\t'+padding + '^');
  
  console.log('Parse Error in line ' + err.line + ', unexpected token '+JSON.stringify(err.excerpt[err.col-1])+'\r\nexpecting ' + err.expected) ;
});

if(program.errors.length > 1) {
  console.log('__');
  program.trace.backtrace();
}
