// Float \\

TypeFactory.proto.makeFloat = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    return env.set(TypeFactory.makeBoolean(env, (env.cast('float', this).getVal() == env.cast('float', env.resolve(obj)).getVal())));
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
      return env.set(TypeFactory.makeInteger(env, sum));
    }catch(e) {
      return env.resolve(obj).callMethod('+', [env.set(object)], precScope);
    }
  }));
  
  // -
  object.properties['-'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var sub = env.cast('float', this).getVal() - env.cast('float', env.resolve(obj)).getVal();
    return env.set(TypeFactory.makeFloat(env, sub));
  }));
  
  // /
  object.properties['/'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var div = env.cast('float', this).getVal() / env.cast('float', env.resolve(obj)).getVal();
    return env.set( (div % 1 === 0) ? TypeFactory.makeInteger(env, div) : TypeFactory.makeFloat(env, div) );
  }));
  
  // *
  object.properties['*'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var mul = env.cast('float', this).getVal() * env.cast('float', env.resolve(obj)).getVal();
    return env.set( (mul % 1 === 0) ? TypeFactory.makeInteger(env, mul) : TypeFactory.makeFloat(env, mul) );
  }));
  
  // read
  object.properties['read'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return env.set( TypeFactory.makeString(env, ''+env.cast('float', this).getVal()+'') );
  }));
  
  return object;
};

TypeFactory.makeFloat = function makeFloat(env, num) {
  var object = new GenericObject(env, env.proto['float']);
  object.isPrimal = true;
  
  object.getVal = function() {
    return num;
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return ''+num;
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'calc') this.isPrimal = false; // Deprive primal status if the calc property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // calc
  object.properties['calc'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return env.set(TypeFactory.makeFloat(env, num));
  }));
  
  return object;
};