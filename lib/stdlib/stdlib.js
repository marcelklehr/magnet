var Library = require('./ferrite').Library;

var stdlib = module.exports = [];

// Time \\

var time = new Library('Time');
stdlib.push(time);

TimeObject = function(miliseconds) {
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
}

time.method('now', function() {
  return TimeObject(Date.now());
});

time.method('fromTimestamp', function(timestamp) {
  return TimeObject(timestamp.env.cast('integer', timestamp).getVal());
});