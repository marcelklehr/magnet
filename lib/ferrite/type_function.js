// Function \\

TypeFactory.makeFunction = function makeFunction(env, parentScope, code, params) {
  var object = new GenericObject(env);
  object.isPrimal = true;
  
  object.dump = function() {
    if(this.isPrimal) return '{Function}';
    return GenericObject.prototype.dump.call(this);
  };
  
  object.invoke = function(args) {
    // console.log('calling {Function}');
    
    // prepare scope
    var scope = new Scope(parentScope);
    for(var i=0; i < args.length; i++) {
      if(!params[i]) break;
      scope.setPropertyPointer(params[i], args[i]);
    }
    
    // set unused parameters to nil
    for(var j=args.length; j < params.length; j++) {
      scope.setPropertyPointer(params[j], 0);
    }
    
    // invoke function
    return scope.execute(code);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // call -- copy has no actual call property!
  object.properties['call'] = env.set(object);
  
  return object;
};

// NativeFunction \\

TypeFactory.makeNativeFunction = function makeNativeFunction(env, func) {
  var object = new GenericObject(env);
  object.isPrimal = true;
  
  object.dump = function() {
    if(this.isPrimal) return '{NativeFunction}';
    return GenericObject.prototype.dump.call(this);
  };
  
  object.invoke = function(args) {
    args = args.map(function(addr) {
      return env.resolve(addr);
    });
    var ret = func.apply(null, args);
    return (ret) ? env.set(ret) : 0;
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call is modified
    return GenericObject.prototype.getPropertyPointer.call(this, property, addr);
  };
  
  /*/ == -- causes recursion
  this.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (object === obj));
  }));/**/
  
  // call
  object.properties['call'] = env.set(object);
  
  return object;
};