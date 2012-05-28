var ferrite = require('../ferrite'),
    fs      = require('fs');

/* Interpret a file from the command line*/

try {
  var file = fs.realpathSync(process.argv[2]);
  var str = fs.readFileSync(file, 'utf8');
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
  
  console.log(' '+file+':'+err.line+'> Parse Error: unexpected token '+JSON.stringify(err.excerpt[err.col-1])+' expecting ' + err.expected.map(JSON.stringify).join(' or '));
  
  var padding = ferrite.repeatString(' ', err.col-1);
  console.log('\t'+err.excerpt);
  console.log('\t'+padding + '^');
});

if(program.errors.length > 1) {
  console.log('__');
  program.trace.backtrace();
}
