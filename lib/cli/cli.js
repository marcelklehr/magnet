var ferrite = require('../ferrite'),
    stdlib  = require('../stdlib');
    fs      = require('fs');

/* Interpret a file from the command line*/

try {
  var file = fs.realpathSync(process.argv[2]);
  var str = fs.readFileSync(file, 'utf8');
} catch(e) {
  console.log('No or invalid input file');
  process.exit(1);
}

var program = ferrite.interpret(str, stdlib)

program.errors.forEach(function(err) {
  console.log('\r\n');
  var padding = ferrite.repeatString(' ', err.col-1);
  
  console.log(file+':'+err.line);
  console.log('\t'+err.excerpt);
  console.log('\t'+padding + '^');
  console.log(err.msg);
  if(err.backtrace) {
    err.backtrace.forEach(function(call) {
      console.log('  at '+call.caller+' (line '+call.at+')');
    });
  }
});