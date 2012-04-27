// String \\
TypeFactory.makeString = function makeString(env, string) {
  var object = new GenericObject(env);
  object.isPrimal = true;
  
  object.getVal = function() {
    return string;
  };
  
  object.dump = function() {
    if(this.isPrimal) return '"'+string+'"';
    return GenericObject.prototype.dump.call(this);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'read') this.isPrimal = false; // Deprive primal status if the read property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // ==
  object.properties['=='] = env.set( TypeFactory.makeNativeFunction(env, function(obj) {
    var bool;
    try {
      bool = (string == env.cast('string',obj).getVal());
    }catch(e) {
      bool = false;
    }
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // +
  object.properties['+'] = env.set( TypeFactory.makeNativeFunction(env, function(obj) {
    var str;
    try {
      str = string + env.cast('string', obj).getVal();
    }catch(e) {
      str = string + obj.dump();
    }
    return TypeFactory.makeString(env, str);
  }));
  
  // *
  object.properties['*'] = env.set( TypeFactory.makeNativeFunction(env, function(obj) {
    var count = env.cast('integer', obj).getVal();
    var str = '';
    for(var i=0; i < count; i++) {
      str += string;
    }
    return TypeFactory.makeString(env, str);
  }));
  
  // read
  object.properties['read'] = env.set( TypeFactory.makeNativeFunction(env, function() {
      return TypeFactory.makeString(env, string);
  })
  );
  
  // count
  object.properties['count'] = env.set( TypeFactory.makeNativeFunction(env, function() {
      return TypeFactory.makeInteger(env, string.length);
    })
  );
  
  // traverse
  object.properties['each'] = env.set( TypeFactory.makeNativeFunction(env, function(func) {
      if(!func) return;
      for(var i=0; i < string.length; i++) {
        func.invoke([ env.set(TypeFactory.makeString(env, string[i])) ]);
      }
      return;
  })
  );
  
  return object;
};