var ferrite = require('./ferrite'),
    Library = ferrite.Library,
    Primal = ferrite.Primal;

var stdlib = module.exports = [];

// Time \\

stdlib.push(new Library('Time', function(env, lib) {
  var TimeObject = function(miliseconds) {
    var date = new Date(miliseconds);
    return {
      timestamp: function() { return date.getTime();},
      miliseconds: function() { return date.getMilliseconds();},
      seconds: function() { return date.getSeconds();},
      minutes: function() { return date.getMinutes();},
      hours: function() { return date.getHours();},
      day: function() { return date.getDay();},
      date: function() { return date.getDate();},
      month: function() { return date.getMonth()+1;},
      year: function() { return date.getFullYear();},
    };
  };
  
  this.method('now', function() {
    return TimeObject(Date.now());
  });
  
  this.method('fromTimestamp', function(timestamp) {
    return TimeObject(timestamp.env.cast('integer', timestamp).getVal());
  });
}));

// Timer \\
stdlib.push(new Library('Timer', function(env, lib) {
  
  lib.setPropertyPointer('wait', Primal.NativeFunction(env, function(myscope, milisecs, cb) {
    var milisecs = env.cast('integer', env.resolve(milisecs)).getVal();
    var cb = env.cast('function', env.resolve(cb));
    setTimeout(env.events.block(function() {
      cb.invoke(0, [], myscope);
    }), milisecs);
  }));

  lib.setPropertyPointer('interval', Primal.NativeFunction(env, function(myscope, milisecs, cb) {
    var milisecs = env.cast('integer', env.resolve(milisecs)).getVal();
    var cb = env.cast('function', env.resolve(cb));
    env.events.block();
    setInterval(function() {
      cb.invoke(0, [], myscope, {});
    }, milisecs);
  }));
}));