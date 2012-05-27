// Integer \\

Primal.protoInteger = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  object.addr = env.set(object);
  
  // ==
  object.properties['=='] = Primal.NativeFunction(env, function(precScope, obj) {
    return Primal.Boolean(env, (env.cast('float', this).getVal() == env.cast('float', env.resolve(obj)).getVal()));
  });
  
  // >
  object.properties['>'] = Primal.NativeFunction(env, function(precScope, obj) {
    var bool = env.cast('float', this).getVal() > env.cast('float', env.resolve(obj)).getVal();
    return Primal.Boolean(env, bool);
  });
  
  // <
  object.properties['<'] = Primal.NativeFunction(env, function(precScope, obj) {
    var bool = env.cast('float', this).getVal() < env.cast('float', env.resolve(obj)).getVal();
    return Primal.Boolean(env, bool);
  });
  
  // +
  object.properties['+'] = Primal.NativeFunction(env, function(precScope, obj) {
    try {
      var sum = env.cast('float', this).getVal() + env.cast('float', env.resolve(obj)).getVal();
      return (sum % 1 === 0) ? Primal.Integer(env, sum) : Primal.Float(env, sum);
    }catch(e) {
      return env.resolve(obj).callMethod('+', [this.addr], precScope);
    }
  });
  
  // -
  object.properties['-'] = Primal.NativeFunction(env, function(precScope, obj) {
    var sub = env.cast('float', this).getVal() - env.cast('float', env.resolve(obj)).getVal();
    return (sub % 1 === 0) ? Primal.Integer(env, sub) : Primal.Float(env, sub);
  });
  
  // /
  object.properties['/'] = Primal.NativeFunction(env, function(precScope, obj) {
    var div = env.cast('float', this).getVal() / env.cast('float', env.resolve(obj)).getVal();
    return (div % 1 === 0) ? Primal.Integer(env, div) : Primal.Float(env, div);
  });
  
  // *
  object.properties['*'] = Primal.NativeFunction(env, function(precScope, obj) {
    try {
      var mul = env.cast('float', this).getVal() * env.cast('float', env.resolve(obj)).getVal();
      return (mul % 1 === 0) ? Primal.Integer(env, mul) : Primal.Float(env, mul);
    }catch(e){
      return obj.callMethod('*', [this.addr], precScope);
    }
  });
  
  // calc
  object.properties['calc'] = Primal.NativeFunction(env, function(precScope) {
    return Primal.Float(env, parseFloat(env.cast('integer', this).getVal()));
  });
  
  // loop
  object.properties['times'] = Primal.NativeFunction(env, function(precScope, func) {
    if(!func) return;
    func = env.resolve(func);
    var num = env.cast('integer', this).getVal();
    for(var i=1; i <= num; i++) {
      var element = Primal.Integer(env, i);
      func.invoke(this.addr, [ element ], precScope);
    }
    return;
  });
  
  // read
  object.properties['read'] = Primal.NativeFunction(env, function(precScope) {
    return Primal.String(env, ''+env.cast('integer', this).getVal()+'');
  });
  
  return object.addr;
};

Primal.Integer = function makeInteger(env, num) {
  var object = new GenericObject(env, env.proto['integer']);
  object.isPrimal = true;
  object.addr = env.set(object);
  
  object.getVal = function() {
    return num;
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return num+'';
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'count') this.isPrimal = false; // Deprive primal status if the count property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // count
  object.properties['count'] = Primal.NativeFunction(env, function(precScope) {
    return Primal.Integer(env, num);
  });
  
  return object.addr;
};