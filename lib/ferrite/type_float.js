// Float \\

Primal.protoFloat = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  object.addr = env.set(object);
  
  // ==
  object.properties['=='] = Primal.NativeFunction(env, function(myscope, obj) {
    return Primal.Boolean(env, (env.cast('float', this).getVal() == env.cast('float', env.resolve(obj)).getVal()));
  });
  
  // >
  object.properties['>'] = Primal.NativeFunction(env, function(myscope, obj) {
    var bool = env.cast('float', this).getVal() > env.cast('float', env.resolve(obj)).getVal();
    return Primal.Boolean(env, bool);
  });
  
  // <
  object.properties['<'] = Primal.NativeFunction(env, function(myscope, obj) {
    var bool = env.cast('float', this).getVal() < env.cast('float', env.resolve(obj)).getVal();
    return Primal.Boolean(env, bool);
  });
  
  // +
  object.properties['+'] = Primal.NativeFunction(env, function(myscope, obj) {
    try {
      var sum = env.cast('float', this).getVal() + env.cast('float', env.resolve(obj)).getVal();
      return Primal.Integer(env, sum);
    }catch(e) {
      return env.resolve(obj).callMethod('+', [object.addr], myscope);
    }
  });
  
  // -
  object.properties['-'] = Primal.NativeFunction(env, function(myscope, obj) {
    var sub = env.cast('float', this).getVal() - env.cast('float', env.resolve(obj)).getVal();
    return Primal.Float(env, sub);
  });
  
  // /
  object.properties['/'] = Primal.NativeFunction(env, function(myscope, obj) {
    var div = env.cast('float', this).getVal() / env.cast('float', env.resolve(obj)).getVal();
    return (div % 1 === 0) ? Primal.Integer(env, div) : Primal.Float(env, div);
  });
  
  // *
  object.properties['*'] = Primal.NativeFunction(env, function(myscope, obj) {
    var mul = env.cast('float', this).getVal() * env.cast('float', env.resolve(obj)).getVal();
    return (mul % 1 === 0) ? Primal.Integer(env, mul) : Primal.Float(env, mul);
  });
  
  // read
  object.properties['read'] = Primal.NativeFunction(env, function(myscope) {
    return Primal.String(env, ''+env.cast('float', this).getVal()+'');
  });
  
  return object.addr;
};

Primal.Float = function makeFloat(env, num) {
  var object = new GenericObject(env, env.proto['float']);
  object.isPrimal = true;
  object.addr = env.set(object);
  
  object.getVal = function() {
    return num;
  };
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) return ''+num;
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'calc') this.isPrimal = false; // Deprive primal status if the calc property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // calc
  object.properties['calc'] = Primal.NativeFunction(env, function(myscope) {
    return Primal.Float(env, num);
  });
  
  return object.addr;
};