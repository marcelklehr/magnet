// Float \\

TypeFactory.proto.makeFloat = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (env.cast('float', this).getVal() == env.cast('float', obj).getVal()));
  }));
  
  // >
  object.properties['>'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var bool = env.cast('float', this).getVal() > env.cast('float', obj).getVal();
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // <
  object.properties['<'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var bool = env.cast('float', this).getVal() < env.cast('float', obj).getVal();
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  object.properties['+'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    try {
      var sum = env.cast('float', this).getVal() + env.cast('float', obj).getVal();
      return TypeFactory.makeInteger(env, sum);
    }catch(e) {
      return obj.callMethod('+', [env.set(object)]);
    }
  }));
  
  // -
  object.properties['-'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var sub = env.cast('float', this).getVal() - env.cast('float', obj).getVal();
    return TypeFactory.makeFloat(env, sub);
  }));
  
  // /
  object.properties['/'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var div = env.cast('float', this).getVal() / env.cast('float', obj).getVal();
    return (div % 1 === 0) ? TypeFactory.makeInteger(env, div) : TypeFactory.makeFloat(env, div);
  }));
  
  // *
  object.properties['*'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var mul = env.cast('float', this).getVal() * env.cast('float', obj).getVal();
    return (mul % 1 === 0) ? TypeFactory.makeInteger(env, mul) : TypeFactory.makeFloat(env, mul);
  }));
  
  // read
  object.properties['read'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeString(env, ''+env.cast('float', this).getVal()+'');
  }));
  
  return env.set(object);
};

TypeFactory.makeFloat = function makeFloat(env, num) {
  var object = new GenericObject(env, env.proto['float']);
  object.isPrimal = true;
  
  object.getVal = function() {
    return num;
  };
  
  object.dump = function() {
    if(this.isPrimal) return ''+num;
    return GenericObject.prototype.dump.call(this);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'calc') this.isPrimal = false; // Deprive primal status if the calc property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // calc
  object.properties['calc'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeFloat(env, num);
  }));
  
  return object;
};