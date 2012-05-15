// String \\

TypeFactory.proto.makeString = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  // ==
  object.properties['=='] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var bool;
    try {
      bool = (env.cast('string', this).getVal() == env.cast('string', env.resolve(obj)).getVal());
    }catch(e) {
      bool = false;
    }
    return env.set(TypeFactory.makeBoolean(env, bool));
  }));
  
  // +
  object.properties['+'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var str;
    str = env.cast('string', this).getVal() + env.cast('string', env.resolve(obj)).getVal();
    return env.set(TypeFactory.makeString(env, str));
  }));
  
  // *
  object.properties['*'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var count = env.cast('integer', env.resolve(obj)).getVal();
    var fragment = env.cast('string', this).getVal();
    var str = '';
    for(var i=0; i < count; i++) {
      str += fragment;
    }
    return env.set(TypeFactory.makeString(env, str));
  }));
  
  // count
  object.properties['count'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope) {
      return env.set(TypeFactory.makeInteger(env, env.cast('string', this).getVal().length));
  }));
  
  // traverse
  object.properties['each'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, func) {
      if(!func) return;
      func = env.resolve(func);
      var string = env.cast('string', this).getVal();
      for(var i=0; i < string.length; i++) {
        var element = env.set(TypeFactory.makeInteger(env, string[i]));
        func.invoke(element, [ element ], precScope);
      }
      return;
  }));
  
  return object;
};

TypeFactory.makeString = function makeString(env, string) {
  var object = new GenericObject(env, env.proto['string']);
  object.isPrimal = true;
  
  object.getVal = function() {
    return string;
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return '"'+string+'"';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'read') this.isPrimal = false; // Deprive primal status if the read property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // read
  object.properties['read'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope) {
      return env.set(TypeFactory.makeString(env, string));
  }));
  
  return object;
};