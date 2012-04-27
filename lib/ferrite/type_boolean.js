// Boolean \\

TypeFactory.makeBoolean = function makeBoolean(env, bool) {
  var object = new GenericObject(env);
  object.isPrimal = true;
  object.getVal = function() {
    return bool;
  };
  object.dump = function() {
    if(this.isPrimal) return (bool) ? 'true' : 'false';
    return GenericObject.prototype.dump.call(this);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'decide') this.isPrimal = false; // Deprive primal status if the decide property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    try {
      var equ = (bool == env.cast('boolean', obj).getVal());
    }catch(e) {
      var equ = false;
    }
    return TypeFactory.makeBoolean(env, equ);
  }));
  
  // ||
  object.properties['||'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('boolean', obj).getVal();
    var or = bool || val;
   return TypeFactory.makeBoolean(env, or);
  }));
  
  // &&
  object.properties['&&'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    var val = env.cast('boolean', obj).getVal();
    var or = bool && val;
   return TypeFactory.makeBoolean(env, or);
  }));
  
  // !
  object.properties['!'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    var not = !bool;
    return TypeFactory.makeBoolean(env, not);
  }));
  
  // decide
  object.properties['decide'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeBoolean(env, bool);
  }));
  
  // read
  object.properties['read'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return TypeFactory.makeString(env, (bool) ? 'true' : 'false');
  }));
  
  return object;
};