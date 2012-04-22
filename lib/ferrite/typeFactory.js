var TypeFactory = {};

// Object \\
TypeFactory.makeObject = function makeObject(env, properties) {
  var obj = new GenericObject(env);
  
  if(properties) {
    for(prop in properties) {
      obj.properties[prop] = env.set(properties[prop]);
    }
  }
  return obj;
}

// String \\
TypeFactory.makeBoolean = function makeBoolean(env, bool) {
  return new PrimalBoolean(env, bool);
}

// String \\
TypeFactory.makeString = function makeString(env, string) {
  return new PrimalString(env, string);
}

// Integer \\
TypeFactory.makeInteger = function makeInteger(env, num) {
  return new PrimalInteger(env, num);
}

// Float \\
TypeFactory.makeFloat = function makeFloat(env, num) {
  return new PrimalFloat(env, num);
};

// Function \\

TypeFactory.makeFunction = function makeFunction(env, func) {
  var primal = new PrimalFunction(env);
  // try {console.log(func.toSource());}catch(e){console.log(e);}
  primal.nativeCode = func;
  return primal;
};