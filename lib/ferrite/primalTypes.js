// Object \\
function GenericObject(global, properties) {
  this.properties = {};
  if(properties) this.properties = properties;
}
GenericObject.prototype.getPropertyPointer = function(property) {
  if(this.properties[property]) return this.properties[property];
  
  var seekfunc = global.resolve(this.getPropertyPointer('seek'));
  if(seekfunc instanceof Nil) return 0;
  return global.cast('function', seekfunc).invoke([ TypeFactory.makeString(property) ]);
};
GenericObject.prototype.setPropertyPointer = function(property, addr) {
  return this.properties[property] = addr;
};

// abstract Type \\
function PrimalType() {}
PrimalType.prototype = new GenericObject;
PrimalType.prototype.constructor = PrimalType;

PrimalType.prototype.getVal = function() {
  return this.value;
};

// Bool \\
function PrimalBoolean(global, bool) {
  this.value = bool;
  this.properties = {};
  
  // decide
  this.properties['decide'] = global.set(TypeFactory.makeFunction(global, function() {
    return TypeFactory.makeBoolean(global, bool);
  }));
  
  // read
  this.properties['read'] = global.set(TypeFactory.makeFunction(global, function() {
    return TypeFactory.makeString(global, (bool) ? 'true' : 'false');
  }));
}
PrimalBoolean.prototype = new PrimalType;
PrimalBoolean.prototype.constructor = PrimalBoolean;

// String \\
function PrimalString(global, string) {
  this.value = string;
  this.properties = {};
  
  // read
  this.setPropertyPointer('read', global.set(
    TypeFactory.makeFunction(global, function() {
      return TypeFactory.makeString(global, string);
    })
  ));
  
  // count
  this.setPropertyPointer('count', global.set(
    TypeFactory.makeFunction(global, function() {
      return TypeFactory.makeInteger(global, string.length);
    })
  ));
  
  // traverse
  this.setPropertyPointer('each', global.set(
    TypeFactory.makeFunction(global, function(func) {
      if(!func) return;
      for(var i=0; i < string.length; i++) {
        func.invoke([ TypeFactory.makeString(global, string[i]) ]);
      }
      return;
    })
  ));
}
PrimalString.prototype = new PrimalType;
PrimalString.prototype.constructor = PrimalString;

// Integer \\
function PrimalInteger(global, num) {
  this.value = num;
  this.properties = {};
  
  // count
  this.properties['count'] = global.set(TypeFactory.makeFunction(global, function() {
    return TypeFactory.makeInteger(global, num);
  }));
  
  // calc
  this.properties['calc'] = global.set(TypeFactory.makeFunction(global, function() {
    return TypeFactory.makeFloat(global, parseFloat(num));
  }));
  
  // traverse
  this.properties['each'] = global.set(TypeFactory.makeFunction(global, function(func) {
    if(!func) return;
    for(var i=0; i < num; i++) {
      func.invoke([ TypeFactory.makeInteger(global, i) ]);
    }
    return;
  }));
  
  // read
  this.properties['read'] = global.set(TypeFactory.makeFunction(global, function() {
    return TypeFactory.makeString(global, ''+num+'');
  }));
}
PrimalInteger.prototype = new PrimalType;
PrimalInteger.prototype.constructor = PrimalInteger;

// Float \\
function PrimalFloat(global, num) {
  this.value = num;
  this.properties = {};
  
  // calc
  this.properties['calc'] = global.set(TypeFactory.makeFunction(global, function() {
    return TypeFactory.makeFloat(global, num);
  }));
  
  // read
  this.properties['read'] = global.set(TypeFactory.makeFunction(global, function() {
    return TypeFactory.makeString(global, ''+num+'');
  }));
}
PrimalFloat.prototype = new PrimalType;
PrimalFloat.prototype.constructor = PrimalFloat;

// Function \\
function PrimalFunction(global, inheritScope, code, params) {
  this.global = global;
  this.properties = {};
  
  this.parentScope = inheritScope;
  this.params = params;
  this.code = code;
  
  // call
  this.properties['call'] = global.set(this);
}
PrimalFunction.prototype = new PrimalType;
PrimalFunction.prototype.constructor = PrimalFunction;

PrimalFunction.prototype.invoke = function(args) {
  var global = this.global;
  // native function
  if(!this.parentScope) {
    args = args.map(function(addr) {
      return global.resolve(addr);
    });
    var ret = this.nativeCode.apply(null, args);
    return (ret) ? global.set(ret) : 0;
  }
  
  // normal function
  // prepare scope
  var scope = new Scope(this.parentScope);
  for(var i=0; i < args.length; i++) {
    if(!this.params[i]) break;
    scope.setPointer(this.params[i], args[i]);
  }
  
  // set unused parameters to nil
  for(var i=args.length; i < this.params.length; i++) {
    scope.setPointer(this.params[i], 0);
  }
  
  // invoke function
  return scope.execute(this.code);
};

// Nil \\
function Nil() { this.nil = 0; }