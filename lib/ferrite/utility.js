/**
 * copyObject(object, [recurse]) -- for all JS Objects
 *
 * Copies all properties (including __proto__) to a new object
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