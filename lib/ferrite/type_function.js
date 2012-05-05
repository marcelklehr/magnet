// Function \\

TypeFactory.proto.makeFunction = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
  object.gc = gcSimple;
  
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
    obj.gc = this.gc;
    for(var prop in this.properties) {
      if(prop === 'call' && this.isPrimal) {
        obj.properties['call'] = env.set(obj);
        continue;
      }
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy');
    }
    return obj;
  }));
  
  return env.set(object);
};

function gcCallable(marked) {
    var marked = marked || [];
    if(this.proto) {
      marked.push(this.proto);
      this.env.resolve(this.proto).gc(marked);
    }
    for(var pointer in this.properties) {
      marked.push(this.properties[pointer]);
      if(this.isPrimal && pointer == 'call') continue;/// Not safe! really
      this.env.resolve(this.properties[pointer]).gc(marked);
    }
  };

TypeFactory.makeFunction = function makeFunction(env, parentScope, code, params) {
  var object = new GenericObject(env, env.proto['function']);
  object.isPrimal = true;
  
  object.gc = gcCallable;
  
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
    return scope.execute(code);
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
  
  object.gc = gcCallable;
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return '{NativeFunction}';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.invoke = function(thisvar, args, callingScope) {
    this.env.debug('Calling {NativeFunction}');
    args = args.map(function(addr) {
      return env.resolve(addr);
    });
    var ret = func.apply(thisvar, args);
    return (ret) ? env.set(ret) : 0;
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'call') this.isPrimal = false; // deprive primal status if call is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // call
  object.properties['call'] = env.set(object);
  
  return object;
};