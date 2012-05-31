var ferrite = require('../ferrite'),
    stdlib  = require('../stdlib');
    fs      = require('fs'),
    b2mb = function(b) {
      return ((b / Math.pow(2, 10))/ Math.pow(2, 10)).toFixed(2) + ' MB';
    };

try {
  var file = fs.realpathSync(process.argv[2]);
  var str = fs.readFileSync(file, 'utf8');
} catch(e) {
  console.log('No or invalid input file');
  process.exit(1);
}

fs.watch(file,function(){});// block node from terminating

var startmemory = process.memoryUsage().heapUsed;
console.time('# Execution time');

ferrite.interpret(str, stdlib, function(errors, env){
  errors.forEach(function(err) {
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
  
  // post execution notes
  console.timeEnd('# Execution time');
  console.log('# Heap size: ', env.heap.length);
  console.log('# Memory usage: ', b2mb(process.memoryUsage().heapUsed - startmemory));
  
  process.exit();// terminate process
});