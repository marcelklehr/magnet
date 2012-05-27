// Boolean \\

Primal.protoBoolean = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  object.addr = env.set(object);
  
  // ==
  object.properties['=='] = Primal.NativeFunction(env, function(precScope, obj) {
    var equ;
    try {
      equ = (env.cast('boolean', this).getVal() === env.cast('boolean', env.resolve(obj)).getVal());
    }catch(e) {
      equ = false;
    }
    return Primal.Boolean(env, equ);
  });
  
  // ||
  object.properties['||'] = Primal.NativeFunction(env, function(precScope, obj) {
    var or = env.cast('boolean', this).getVal() || env.cast('boolean', env.resolve(obj)).getVal();
    return Primal.Boolean(env, or);
  });
  
  // &&
  object.properties['&&'] = Primal.NativeFunction(env, function(precScope, obj) {
    var or = env.cast('boolean', this).getVal() && env.cast('boolean', env.resolve(obj)).getVal();
   return Primal.Boolean(env, or);
  });
  
  // !
  object.properties['!'] = Primal.NativeFunction(env, function(precScope) {
    var not = !env.cast('boolean', this).getVal();
    return Primal.Boolean(env, not);
  });
  
  // read
  object.properties['read'] = Primal.NativeFunction(env, function(precScope) {
    return Primal.String(env, ( env.cast('boolean', this).getVal() ) ? 'true' : 'false');
  });
  
  
  return object.addr;
};

Primal.Boolean = function makeBoolean(env, bool) {
  var object = new GenericObject(env, env.proto['boolean']);
  object.isPrimal = true;
  object.addr = env.set(object);
  
  object.getVal = function() {
    return bool;
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return (bool) ? 'true' : 'false';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'decide') this.isPrimal = false; // Deprive primal status if the decide property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // decide
  object.properties['decide'] = Primal.NativeFunction(env, function(precScope) {
    return Primal.Boolean(env, bool);
  });
  
  return object.addr;
};