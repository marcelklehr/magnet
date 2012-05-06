// Boolean \\

TypeFactory.proto.makeBoolean = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var equ;
    try {
      equ = (env.cast('boolean', this).getVal() === env.cast('boolean', obj).getVal());
    }catch(e) {
      equ = false;
    }
    return TypeFactory.makeBoolean(env, equ);
  }));
  
  // ||
  object.properties['||'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var or = env.cast('boolean', this).getVal() || env.cast('boolean', obj).getVal();
    return TypeFactory.makeBoolean(env, or);
  }));
  
  // &&
  object.properties['&&'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var or = env.cast('boolean', this).getVal() && env.cast('boolean', obj).getVal();
   return TypeFactory.makeBoolean(env, or);
  }));
  
  // !
  object.properties['!'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    var not = !env.cast('boolean', this).getVal();
    return TypeFactory.makeBoolean(env, not);
  }));
  
  // read
  object.properties['read'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return TypeFactory.makeString(env, ( env.cast('boolean', this).getVal() ) ? 'true' : 'false');
  }));
  
  return object;
};

TypeFactory.makeBoolean = function makeBoolean(env, bool) {
  var object = new GenericObject(env, env.proto['boolean']);
  object.isPrimal = true;
  
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
  object.properties['decide'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  return object;
};