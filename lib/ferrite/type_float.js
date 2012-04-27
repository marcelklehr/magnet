// Float \\
TypeFactory.makeFloat = function makeFloat(env, num) {
  var object = new GenericObject(env);
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
    return GenericObject.prototype.getPropertyPointer.call(this, property, addr);
  };
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (num == obj.getVal()));
  }));
  
  // >
  object.properties['>'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num > val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // <
  object.properties['<'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num < val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  object.properties['+'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    try {
      var val = env.cast('float', obj).getVal();
      var sum = num + val;
      return TypeFactory.makeInteger(env, sum);
    }catch(e) {
      return obj.callMethod('+', [env.set(object)]);
    }
  }));
  
  // -
  object.properties['-'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var sub = num - val;
    return TypeFactory.makeFloat(env, sub);
  }));
  
  // /
  object.properties['/'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var div = num / val;
    return (div % 1 == 0) ? TypeFactory.makeInteger(env, div) : TypeFactory.makeFloat(env, div);
  }));
  
  // *
  object.properties['*'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var mul = num * val;
    return (mul % 1 == 0) ? TypeFactory.makeInteger(env, mul) : TypeFactory.makeFloat(env, mul);
  }));
  
  // calc
  object.properties['calc'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeFloat(env, num);
  }));
  
  // read
  object.properties['read'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeString(env, ''+num+'');
  }));
  
  return object;
};