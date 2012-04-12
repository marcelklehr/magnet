/*** BACKTRACE ***/

function Trace() { }

Trace.prototype = [];

Trace.prototype.log = function log(str, data) {
  this.push([str, data]);
};

Trace.prototype.backtrace = function backtrace() {
  console.log('# Backtrace');
  this.forEach(function(log) {
    if(log[1])  return console.log('    '+log[0], log[1]);
    console.log('    '+log[0]);
  });
};