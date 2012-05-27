// Function \\

TypeFactory.proto.makeFunction = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  // *
  object.properties['*'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var count = env.cast('integer', env.resolve(obj)).getVal();
    var func = env.cast('function', this);
    for(var i=0; i < count; i++) {
      func.invoke(obj, [env.set( TypeFactory.makeInteger(env, i) )]);
    }
    return env.set(TypeFactory.makeInteger(env, count));
  }));
  
  // copy
  object.properties['copy'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    var obj = new GenericObject(env, this.proto);
    obj.isPrimal = !!this.isPrimal;
    obj.dump = this.dump;
    obj.gc = this.gc;
    for(var prop in this.properties) {
      if(prop === 'call' && this.isPrimal) {
        obj.properties['call'] = env.set(obj);
        continue;
      }
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy', [], precScope);
    }
    return env.set(obj);
  }));
  
  return object;
};

TypeFactory.makeFunction = function makeFunction(env, parentScope, code, params) {
  var object = new GenericObject(env, env.proto['function']);
  object.isPrimal = true;
  
  object.gc = function(marked) {
    parentScope.gc(marked);
    GenericObject.prototype.gc.call(this, marked);
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return '{Function}';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.invoke = function(thisvar, args, callingScope) {
    this.env.debug('calling {Function}');
    
    // prepare scope
    var scope = new Scope(parentScope, callingScope);
    for(var i=0; i < args.length; i++) {
      if(!params[i]) break;
      scope.properties[params[i]] = args[i];
    }
    
    // set unused parameters to nil
    for(var j=args.length; j < params.length; j++) {
      scope.properties[ params[j] ] = 0;
    }
    
    // invoke function
    var ret = 0, running = true;
    code.forEach(function(op) {
      if(!running) return;
      if(op.value !== OP_NONE) ret = scope.execute(op);
      if(op.value === OP_RET) running = false;
    });
    
    // gc
    scope.properties['__ferrite-return-pointer'] = ret;
    if(callingScope !== undefined) env.gc(scope);
    
    return ret;
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // call -- copy has no actual call property! -- Yes, it has! (we merely env.set a js-reference to the object)
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
  
  object.invoke = function(thisvar, args, callingScope) {
    this.env.debug('Calling {NativeFunction}');
    var ret = func.apply(env.resolve(thisvar), [callingScope].concat(args));
    return (ret) ? ret : 0;
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // call
  object.properties['call'] = env.set(object);
  
  return object;
};