// Function \\

Primal.protoFunction = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  object.addr = env.set(object);
  
  // *
  object.properties['*'] = Primal.NativeFunction(env, function(myscope, obj) {
    var count = env.cast('integer', env.resolve(obj)).getVal();
    var func = env.cast('function', this);
    for(var i=0; i < count; i++) {
      func.invoke(obj, [Primal.Integer(env, i)]);
    }
    return Primal.Integer(env, count);
  });
  
  // copy
  object.properties['copy'] = Primal.NativeFunction(env, function(myscope) {
    var obj = new GenericObject(env, this.proto);
    obj.isPrimal = !!this.isPrimal;
    obj.dump = this.dump;
    obj.gc = this.gc;
    for(var prop in this.properties) {
      if(prop === 'call' && this.isPrimal) {
        obj.properties['call'] = env.set(obj);
        continue;
      }
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy', [], myscope);
    }
    obj.addr = env.set(obj)
    return obj.addr;
  });
  
  return object.addr;
};

Primal.Function = function makeFunction(env, parentScope, code, params) {
  var object = new GenericObject(env, env.proto['function']);
  object.addr = env.set(object);
  object.isPrimal = true;
  
  object.gc = function(marked) {
    parentScope.gc(marked);
    GenericObject.prototype.gc.call(this, marked);
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return '{Function}';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.invoke = function(thisvar, args, callingScope, metaCall) {
    this.env.debug('calling {Function}');
    
    // prepare scope
    var scope = new Scope(parentScope, callingScope);
    scope.meta = metaCall;
    
    // set args
    for(var i=0; i < args.length; i++) {
      if(!params[i]) break;
      scope.properties[params[i]] = args[i];
    }
    
    // set unused parameters to nil
    for(var j=args.length; j < params.length; j++) {
      scope.properties[ params[j] ] = 0;
    }
    
    // invoke function
    var ret = scope.executeTokenList(code);
    
    // gc
    scope.properties['__ferrite-return-pointer'] = ret;
    if(callingScope !== undefined) env.gc(scope);
    
    return ret.valueOf();
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // call
  object.properties['call'] = object.addr;
  
  return object.addr;
};

// NativeFunction \\

Primal.NativeFunction = function makeNativeFunction(env, func) {
  var object = new GenericObject(env, env.proto['function']);
  object.isPrimal = true;
  object.addr = env.set(object);
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return '{NativeFunction}';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.invoke = function(thisvar, args, callingScope, metaCall) {
    this.env.debug('Calling {NativeFunction}');
    var scope = new Scope(null, callingScope);
    scope.meta = metaCall;
    var ret = func.apply(env.resolve(thisvar), [scope].concat(args));
    return (ret) ? ret : 0;
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // call
  object.properties['call'] = object.addr;
  
  return object.addr;
};