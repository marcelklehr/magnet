// String \\

TypeFactory.proto.makeString = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  object.addr = env.set(object);
  
  // ==
  object.properties['=='] = TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var bool;
    try {
      bool = (env.cast('string', this).getVal() == env.cast('string', env.resolve(obj)).getVal());
    }catch(e) {
      bool = false;
    }
    return TypeFactory.makeBoolean(env, bool);
  });
  
  // +
  object.properties['+'] = TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var str;
    str = env.cast('string', this).getVal() + env.cast('string', env.resolve(obj)).getVal();
    return TypeFactory.makeString(env, str);
  });
  
  // *
  object.properties['*'] = TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var count = env.cast('integer', env.resolve(obj)).getVal();
    var fragment = env.cast('string', this).getVal();
    var str = '';
    for(var i=0; i < count; i++) {
      str += fragment;
    }
    return TypeFactory.makeString(env, str);
  });
  
  // count
  object.properties['count'] = TypeFactory.makeNativeFunction(env, function(precScope) {
      return TypeFactory.makeInteger(env, env.cast('string', this).getVal().length);
  });
  
  // split
  object.properties['split'] = TypeFactory.makeNativeFunction(env, function(precScope, seperator) {
    var string = env.cast('string', this).getVal();
    seperator = (seperator) ? env.cast('string', env.resolve(seperator)).getVal() : "";
    var list = string.split(seperator).map(function(piece) {
      return TypeFactory.makeString(env, piece);
    });
    return TypeFactory.makeList(env, list);
  });
  
  return object.addr;
};

TypeFactory.makeString = function makeString(env, string) {
  var object = new GenericObject(env, env.proto['string']);
  object.isPrimal = true;
  object.addr = env.set(object);
  
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
  object.properties['read'] = TypeFactory.makeNativeFunction(env, function(precScope) {
      return TypeFactory.makeString(env, string);
  });
  
  return object.addr;
};