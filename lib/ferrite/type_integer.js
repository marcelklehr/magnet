// Integer \\

TypeFactory.proto.makeInteger = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    return env.set( TypeFactory.makeBoolean(env, (env.cast('float', this).getVal() == env.cast('float', env.resolve(obj)).getVal())) );
  }));
  
  // >
  object.properties['>'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var bool = env.cast('float', this).getVal() > env.cast('float', env.resolve(obj)).getVal();
    return env.set(TypeFactory.makeBoolean(env, bool));
  }));
  
  // <
  object.properties['<'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var bool = env.cast('float', this).getVal() < env.cast('float', env.resolve(obj)).getVal();
    return env.set(TypeFactory.makeBoolean(env, bool));
  }));
  
  // +
  object.properties['+'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    try {
      var sum = env.cast('float', this).getVal() + env.cast('float', env.resolve(obj)).getVal();
      return env.set( (sum % 1 === 0) ? TypeFactory.makeInteger(env, sum) : TypeFactory.makeFloat(env, sum) );
    }catch(e) {
      return env.resolve(obj).callMethod('+', [env.set(this)], precScope);
    }
  }));
  
  // -
  object.properties['-'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var sub = env.cast('float', this).getVal() - env.cast('float', env.resolve(obj)).getVal();
    return env.set( (sub % 1 === 0) ? TypeFactory.makeInteger(env, sub) : TypeFactory.makeFloat(env, sub) );
  }));
  
  // /
  object.properties['/'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var div = env.cast('float', this).getVal() / env.cast('float', env.resolve(obj)).getVal();
    return env.set( (div % 1 === 0) ? TypeFactory.makeInteger(env, div) : TypeFactory.makeFloat(env, div) );
  }));
  
  // *
  object.properties['*'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    try {
      var mul = env.cast('float', this).getVal() * env.cast('float', env.resolve(obj)).getVal();
      return env.set( (mul % 1 === 0) ? TypeFactory.makeInteger(env, mul) : TypeFactory.makeFloat(env, mul) );
    }catch(e){
      return obj.callMethod('*', [env.set(this)], precScope);
    }
  }));
  
  // calc
  object.properties['calc'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return env.set(TypeFactory.makeFloat(env, parseFloat(env.cast('integer', this).getVal())));
  }));
  
  // loop
  object.properties['times'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, func) {
    if(!func) return;
    func = env.resolve(func);
    var this_addr = env.set(this);
    var num = env.cast('integer', this).getVal();
    for(var i=1; i <= num; i++) {
      var element = env.set(TypeFactory.makeInteger(env, i));
      func.invoke(this_addr, [ element ], precScope);
    }
    return;
  }));
  
  // read
  object.properties['read'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return env.set(TypeFactory.makeString(env, ''+env.cast('integer', this).getVal()+''));
  }));
  
  return object;
};

TypeFactory.makeInteger = function makeInteger(env, num) {
  var object = new GenericObject(env, env.proto['integer']);
  object.isPrimal = true;
  
  object.getVal = function() {
    return num;
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return num+'';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'count') this.isPrimal = false; // Deprive primal status if the count property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // count
  object.properties['count'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return env.set(TypeFactory.makeInteger(env, num));
  }));
  
  return object;
};