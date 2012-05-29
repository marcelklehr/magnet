/**
 * copyObject(object, [recurse]) -- for all JS Objects
 *
 * Copies all properties and the prototype to a new object
 * Optionally set recurse to array containing the properties, on wich this function should be called recursively
 */
function copyObject(object, recurse) {
  var new_obj = Object.create(Object.getPrototypeOf(object));
  recurse = (recurse) ? recurse : [];
  for(var prop in object) {
    new_obj[prop] = object[prop];
    if(recurse.indexOf(prop) !== -1) new_obj[prop] = copyObject(object[prop]);
  }
  return new_obj;
}

function repeatString(str, times) {
  for(var padding = "", i=0; i < times; i++) {
    padding += str;
  }
  return padding;
}

function isInt(n) {
  return String(parseInt(n)) === String(n) && parseInt(n) >= 0 && isFinite(n);
}

function calcLineNo(source, offset) {
  return offset ? source.substr( 0, offset ).split("\n").length : -1;
};

function getLineExcerpt(source, offset) {
  return source.substr( 0, offset ).split("\n").pop() + source.substr( offset, 250 ).split("\n")[0];
};

function getLineCol(source, offset) {
  return source.substr( 0, offset ).split("\n").pop().length+1
};