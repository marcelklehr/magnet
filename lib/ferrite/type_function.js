// Function \\

TypeFactory.proto.makeFunction = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  // *
  object.properties['*'] = env.set( TypeFactory.makeNativeFunction(env, function(obj) {
    var count = env.cast('integer', obj).getVal();
    var func = env.cast('function', this).getVal();
    for(var i=0; i < count; i++) {
      func.invoke(obj, [env.set( TypeFactory.makeInteger(env, i) )]);
    }
    return TypeFactory.makeInteger(env, count);
  }));
  
  // copy
  object.properties['copy'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    var obj = new GenericObject(env, this.proto);
    obj.isPrimal = !!this.isPrimal;
    obj.dump = this.dump;
    for(var prop in this.properties) {
      if(prop === 'call') {
        obj.properties['call'] = env.set(obj);
        continue;
      }
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy');
    }
    return obj;
  }));
  
  return env.set(object);
};

TypeFactory.makeFunction = function makeFunction(env, parentScope, code, params) {
  var object = new GenericObject(env, env.proto['function']);
  object.isPrimal = true;
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return '{Function}';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.invoke = function(thisvar, args) {
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
  var object = new GenericObject(env, env.proto['function']);
  object.isPrimal = true;
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return '{NativeFunction}';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.invoke = function(thisvar, args) {
    args = args.map(function(addr) {
      return env.resolve(addr);
    });
    var ret = func.apply(thisvar, args);
    return (ret) ? env.set(ret) : 0;
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call is modified
    return GenericObject.prototype.getPropertyPointer.call(this, property, addr);
  };
  
  // call
  object.properties['call'] = env.set(object);
  
  return object;
};