// Integer \\
TypeFactory.makeInteger = function makeInteger(env, num) {
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
    if(this.isPrimal && property == 'count') this.isPrimal = false; // Deprive primal status if the count property is modified
    return GenericObject.prototype.getPropertyPointer.call(this, property, addr);
  };
  
  // ==
  this.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (num == obj.getVal()));
  }));
  
  // >
  this.properties['>'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num > val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // <
  this.properties['<'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var bool = num < val;
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  this.properties['+'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    try {
      var val = env.cast('float', obj).getVal();
      var sum = num + val;
      return (sum % 1 == 0) ? TypeFactory.makeInteger(env, sum) : TypeFactory.makeFloat(env, sum);
    }catch(e) {
      return obj.callMethod('+', [env.set(object)]);
    }
  }));
  
  // -
  this.properties['-'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var sub = num - val;
    return (sub % 1 == 0) ? TypeFactory.makeInteger(env, sub) : TypeFactory.makeFloat(env, sub);
  }));
  
  // /
  this.properties['/'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var div = num / val;
    return (div % 1 == 0) ? TypeFactory.makeInteger(env, div) : TypeFactory.makeFloat(env, div);
  }));
  
  // *
  this.properties['*'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('float', obj).getVal();
    var mul = num * val;
    return (mul % 1 == 0) ? TypeFactory.makeInteger(env, mul) : TypeFactory.makeFloat(env, mul);
  }));
  
  // count
  this.properties['count'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeInteger(env, num);
  }));
  
  // calc
  this.properties['calc'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeFloat(env, parseFloat(num));
  }));
  
  // traverse
  this.properties['each'] = env.set(TypeFactory.makeNativeFunction(env, function(func) {
    if(!func) return;
    for(var i=0; i < num; i++) {
      func.invoke([ env.set(TypeFactory.makeInteger(env, i)) ]);
    }
    return;
  }));
  
  // read
  this.properties['read'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeString(env, ''+num+'');
  }));
}