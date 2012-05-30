// String \\

Primal.protoString = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  object.addr = env.set(object);
  
  // ==
  object.properties['=='] = Primal.NativeFunction(env, function(precScope, obj) {
    var bool;
    try {
      bool = (env.cast('string', this).getVal() == env.cast('string', env.resolve(obj)).getVal());
    }catch(e) {
      bool = false;
    }
    return Primal.Boolean(env, bool);
  });
  
  // *
  object.properties['*'] = Primal.NativeFunction(env, function(precScope, obj) {
    var count = env.cast('integer', env.resolve(obj)).getVal();
    var fragment = env.cast('string', this).getVal();
    var str = '';
    for(var i=0; i < count; i++) {
      str += fragment;
    }
    return Primal.String(env, str);
  });
  
  // count
  object.properties['count'] = Primal.NativeFunction(env, function(precScope) {
      return Primal.Integer(env, env.cast('string', this).getVal().length);
  });
  
  // split
  object.properties['split'] = Primal.NativeFunction(env, function(precScope, seperator) {
    var string = env.cast('string', this).getVal();
    seperator = (seperator) ? env.cast('string', env.resolve(seperator)).getVal() : "";
    var list = string.split(seperator).map(function(piece) {
      return Primal.String(env, piece);
    });
    return Primal.List(env, list);
  });
  
  return object.addr;
};

Primal.String = function makeString(env, string) {
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
  object.properties['read'] = Primal.NativeFunction(env, function(precScope) {
      return Primal.String(env, string);
  });
  
  return object.addr;
};