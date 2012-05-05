// String \\

TypeFactory.proto.makeString = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  object.gc = gcSimple;
  
  // ==
  object.properties['=='] = env.set( TypeFactory.makeNativeFunction(env, function(obj) {
    var bool;
    try {
      bool = (env.cast('string', this).getVal() == env.cast('string', obj).getVal());
    }catch(e) {
      bool = false;
    }
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  object.properties['+'] = env.set( TypeFactory.makeNativeFunction(env, function(obj) {
    var str;
    try {
      str = env.cast('string', this).getVal() + env.cast('string', obj).getVal();
    }catch(e) {
      str = env.cast('string', this).getVal() + obj.dump();
    }
    return TypeFactory.makeString(env, str);
  }));
  
  // *
  object.properties['*'] = env.set( TypeFactory.makeNativeFunction(env, function(obj) {
    var count = env.cast('integer', obj).getVal();
    var fragment = env.cast('string', this).getVal();
    var str = '';
    for(var i=0; i < count; i++) {
      str += fragment;
    }
    return TypeFactory.makeString(env, str);
  }));
  
  // count
  object.properties['count'] = env.set( TypeFactory.makeNativeFunction(env, function() {
      return TypeFactory.makeInteger(env, env.cast('string', this).getVal().length);
  }));
  
  // traverse
  object.properties['each'] = env.set( TypeFactory.makeNativeFunction(env, function(func) {
      if(!func) return;
      var string = env.cast('string', this).getVal();
      for(var i=0; i < string.length; i++) {
        func.invoke(TypeFactory.makeInteger(env, string[i]), [ env.set(TypeFactory.makeString(env, string[i])) ]);
      }
      return;
  }));
  
  return env.set(object);
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
  object.properties['read'] = env.set( TypeFactory.makeNativeFunction(env, function() {
      return TypeFactory.makeString(env, string);
  }));
  
  return object;
};