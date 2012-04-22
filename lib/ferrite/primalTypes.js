// Object \\
function GenericObject(env, properties) {
  var that = this;
  this.env = env;
  this.properties = properties | {};
  
  // ==
  this.properties['=='] = env.set(TypeFactory.makeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (that === obj));
  }));
}
GenericObject.prototype.getPropertyPointer = function(property) {
  if(this.properties[property]) return this.properties[property];
  return 0;
  /*
  var seekfunc = this.env.resolve(this.getPropertyPointer('seek'));
  if(seekfunc instanceof Nil) return 0;
  return env.cast('function', seekfunc).invoke([ TypeFactory.makeString(property) ]);*/
};
GenericObject.prototype.setPropertyPointer = function(property, addr) {
  return this.properties[property] = addr;
};
GenericObject.prototype.callMethod = function(property, args) {
  var method = this.env.resolve(this.getPropertyPointer(property));
  args = (args) ? args : [];
  return this.env.cast('function', method).invoke(args);
};
GenericObject.prototype.dump = function() {
  var props = [];
  for(prop in this.properties) {
    props.push(prop+' : '+this.env.resolve(this.properties[prop]).dump());
  }
  return "[\r\n" + props.join(",\r\n") + "\r\n]";
};

// abstract Type \\

function PrimalType() {}
PrimalType.prototype = new GenericObject(new Environment);
PrimalType.prototype.constructor = PrimalType;

PrimalType.prototype.getVal = function() {
  return this.value;
};
PrimalType.prototype.dump = function() {
  return ''+this.getVal();
};

// Bool \\

function PrimalBoolean(env, bool) {
  this.env = env;
  this.value = bool;
  this.properties = {};
  
  // ==
  this.properties['=='] = env.set(TypeFactory.makeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (that === obj));
  }));
  
  // ||
  this.properties['||'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('boolean', obj).getVal();
    var or = bool || val;
   return TypeFactory.makeBoolean(env, or);
  }));
  
  // &&
  this.properties['&&'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('boolean', obj).getVal();
    var or = bool && val;
   return TypeFactory.makeBoolean(env, or);
  }));
  
  // !
  this.properties['!'] = env.set(TypeFactory.makeFunction(env, function() {
    var not = !bool;
    return TypeFactory.makeBoolean(env, not);
  }));
  
  // decide
  this.properties['decide'] = env.set(TypeFactory.makeFunction(env, function() {
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // read
  this.properties['read'] = env.set(TypeFactory.makeFunction(env, function() {
    return TypeFactory.makeString(env, (bool) ? 'true' : 'false');
  }));
}
PrimalBoolean.prototype = new PrimalType;
PrimalBoolean.prototype.constructor = PrimalBoolean;


// String \\

function PrimalString(env, string) {
  this.env = env;
  this.value = string;
  this.properties = {};
  
  // ==
  this.properties['=='] = env.set(TypeFactory.makeFunction(env, function(obj) {
    try {
      var bool = (string == env.cast('string',obj).getVal());
    }catch(e) {
      var bool = false;
    }
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  this.properties['+'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    try {
      var str = string + env.cast('string', obj).getVal();
    }catch(e) {
      var str = string + obj.dump();
    }
    return TypeFactory.makeString(env, str);
  }));
  
  // *
  this.properties['*'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var count = env.cast('integer', obj).getVal();
    var str = '';
    for(var i=0; i < count; i++) {
      str += string;
    }
    return TypeFactory.makeString(env, str);
  }));
  
  // read
  this.setPropertyPointer('read', env.set(
    TypeFactory.makeFunction(env, function() {
      return TypeFactory.makeString(env, string);
    })
  ));
  
  // count
  this.setPropertyPointer('count', env.set(
    TypeFactory.makeFunction(env, function() {
      return TypeFactory.makeInteger(env, string.length);
    })
  ));
  
  // traverse
  this.setPropertyPointer('each', env.set(
    TypeFactory.makeFunction(env, function(func) {
      if(!func) return;
      for(var i=0; i < string.length; i++) {
        func.invoke([ env.set(TypeFactory.makeString(env, string[i])) ]);
      }
      return;
    })
  ));
}
PrimalString.prototype = new PrimalType;
PrimalString.prototype.constructor = PrimalString;

PrimalString.prototype.dump = function() {
  return '"'+this.getVal()+'"';
};


// Integer \\

function PrimalInteger(env, num) {
  var that = this;
  this.env = env;
  this.value = num;
  this.properties = {};
  
  // ==
  this.properties['=='] = env.set(TypeFactory.makeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (that.getVal() == obj.getVal()));
  }));
  
  // >
  this.properties['>'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num > val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // <
  this.properties['<'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num < val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  this.properties['+'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    try {
      var val = env.cast('float', obj).getVal();
      var sum = num + val;
      return (sum % 1 == 0) ? TypeFactory.makeInteger(env, sum) : TypeFactory.makeFloat(env, sum);
    }catch(e) {
      return obj.callMethod('+', [env.set(that)]);
    }
  }));
  
  // -
  this.properties['-'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var sub = num - val;
    return (sub % 1 == 0) ? TypeFactory.makeInteger(env, sub) : TypeFactory.makeFloat(env, sub);
  }));
  
  // /
  this.properties['/'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var div = num / val;
    return (div % 1 == 0) ? TypeFactory.makeInteger(env, div) : TypeFactory.makeFloat(env, div);
  }));
  
  // *
  this.properties['*'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var mul = num * val;
    return (mul % 1 == 0) ? TypeFactory.makeInteger(env, mul) : TypeFactory.makeFloat(env, mul);
  }));
  
  // count
  this.properties['count'] = env.set(TypeFactory.makeFunction(env, function() {
    return TypeFactory.makeInteger(env, num);
  }));
  
  // calc
  this.properties['calc'] = env.set(TypeFactory.makeFunction(env, function() {
    return TypeFactory.makeFloat(env, parseFloat(num));
  }));
  
  // traverse
  this.properties['each'] = env.set(TypeFactory.makeFunction(env, function(func) {
    if(!func) return;
    for(var i=0; i < num; i++) {
      func.invoke([ env.set(TypeFactory.makeInteger(env, i)) ]);
    }
    return;
  }));
  
  // read
  this.properties['read'] = env.set(TypeFactory.makeFunction(env, function() {
    return TypeFactory.makeString(env, ''+num+'');
  }));
}
PrimalInteger.prototype = new PrimalType;
PrimalInteger.prototype.constructor = PrimalInteger;


// Float \\

function PrimalFloat(env, num) {
  var that = this;
  this.env = env;
  this.value = num;
  this.properties = {};
  
  // ==
  this.properties['=='] = env.set(TypeFactory.makeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (that.getVal() == obj.getVal()));
  }));
  
  // >
  this.properties['>'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num > val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // <
  this.properties['<'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num < val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  this.properties['+'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    try {
      var val = env.cast('float', obj).getVal();
      var sum = num + val;
      return TypeFactory.makeInteger(env, sum);
    }catch(e) {
      return obj.callMethod('+', [env.set(that)]);
    }
  }));
  
  // -
  this.properties['-'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var sub = num - val;
    return TypeFactory.makeFloat(env, sub);
  }));
  
  // /
  this.properties['/'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var div = num / val;
    return (div % 1 == 0) ? TypeFactory.makeInteger(env, div) : TypeFactory.makeFloat(env, div);
  }));
  
  // *
  this.properties['*'] = env.set(TypeFactory.makeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var mul = num * val;
    return (mul % 1 == 0) ? TypeFactory.makeInteger(env, mul) : TypeFactory.makeFloat(env, mul);
  }));
  
  // calc
  this.properties['calc'] = env.set(TypeFactory.makeFunction(env, function() {
    return TypeFactory.makeFloat(env, num);
  }));
  
  // read
  this.properties['read'] = env.set(TypeFactory.makeFunction(env, function() {
    return TypeFactory.makeString(env, ''+num+'');
  }));
}
PrimalFloat.prototype = new PrimalType;
PrimalFloat.prototype.constructor = PrimalFloat;


// Function \\

function PrimalFunction(env, inheritScope, code, params) {
  var that = this;
  this.env = env;
  this.properties = {};
  
  this.parentScope = inheritScope;
  this.params = params;
  this.code = code;
  
  /*/ == --Causes recursion...
  this.properties['=='] = (new GenericObject(new Environment)).properties['=='];*/
  
  // call
  this.properties['call'] = env.set(this);
}
PrimalFunction.prototype = new PrimalType;
PrimalFunction.prototype.constructor = PrimalFunction;

PrimalFunction.prototype.invoke = function(args) {
  var env = this.env;
  // console.log('calling {Function}');
  // native function
  if(!this.parentScope) {
    args = args.map(function(addr) {
      return env.resolve(addr);
    });
    var ret = this.nativeCode.apply(null, args);
    return (ret) ? env.set(ret) : 0;
  }
  
  // normal function
  // prepare scope
  var scope = new Scope(this.parentScope);
  for(var i=0; i < args.length; i++) {
    if(!this.params[i]) break;
    scope.setPropertyPointer(this.params[i], args[i]);
  }
  
  // set unused parameters to nil
  for(var i=args.length; i < this.params.length; i++) {
    scope.setPropertyPointer(this.params[i], 0);
  }
  
  // invoke function
  return scope.execute(this.code);
};

PrimalFunction.prototype.dump = function() {
  return '{Function}';
};

// Nil \\
function Nil() { this.nil = 0; }

Nil.prototype.dump = function() {
  return 'nil';
};