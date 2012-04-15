TypeFactory = {};

// Object \\
TypeFactory.makeObject = function makeObject(global, properties) {
  var obj = new GenericObject(global);
  
  if(properties) {
    for(prop in properties) {
      obj.properties[prop] = global.set(properties[prop]);
    }
  }
  return obj;
}

// String \\
TypeFactory.makeBoolean = function makeBoolean(global, bool) {
  return new PrimalBoolean(global, bool);
}

// String \\
TypeFactory.makeString = function makeString(global, string) {
  return new PrimalString(global, string);
}

// Integer \\
TypeFactory.makeInteger = function makeInteger(global, num) {
  return new PrimalInteger(global, num);
}

// Float \\
TypeFactory.makeFloat = function makeFloat(global, num) {
  return new PrimalFloat(global, num);
}

// Function \\

TypeFactory.makeFunction = function makeFunction(global, func) {
  var primal = new PrimalFunction(global);
  // try {console.log(func.toSource());}catch(e){console.log(e);}
  primal.nativeCode = func;
  return primal;
}