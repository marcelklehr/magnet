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
  if(this.length == 0) return console.log('    empty');
};

function MagnetError(msg, offset, scope) {
  this.message = msg;
  this.offset = offset;
  this.scope = scope;
};

MagnetError.prototype = new Error;
MagnetError.prototype.constructor = MagnetError;