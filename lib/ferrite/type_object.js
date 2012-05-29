var Primal = {};


// Prototype \\

Primal.protoObject = function(env) {
  var object = new GenericObject(env);
  object.addr = env.set(object);
  
  // ==
  object.properties['=='] = Primal.NativeFunction(env, function(precScope, obj) {
    return Primal.Boolean(env, (this === env.resolve(obj)));
  });
  
  // fork
  object.properties['fork'] = Primal.NativeFunction(env, function(precScope) {
    var object = new GenericObject(env, env.set(this));
    object.addr = env.set(object);
    return object.addr;
  });
  
  // copy
  object.properties['copy'] = Primal.NativeFunction(env, function(precScope) {
    var obj = new GenericObject(env, this.proto);
    obj.isPrimal = !!this.isPrimal;
    obj.dump = this.dump;
    for(var prop in this.properties) {
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy', [], precScope);
    }
    
    obj.addr = env.set(obj);
    return obj.addr;
  });
  
  // mixin
  object.properties['mixin'] = Primal.NativeFunction(env, function(precScope, obj) {
    obj = env.resolve(obj);
    for(var prop in obj.properties) {
      this.setPropertyPointer(prop, obj.properties[prop]);
    }
    return this.addr;
  });
  
  return object.addr;
};

// Primal \\

Primal.Object = function makeObject(env, properties) {
  var obj = new GenericObject(env, env.proto['object']);
  obj.addr = env.set(obj);
  
  if(properties) {
    for(var prop in properties) {
      obj.properties[prop] = env.set(properties[prop]);
    }
  }
  
  return obj.addr;
};

// The root magnet Object \\

function GenericObject(env, proto, properties) {
  this.env = env;
  this.proto = proto;
  this.properties = (properties) ? properties : {};
  
  this.addr = -1;
  this.isPrimal = false;
}
GenericObject.prototype.gc = function(marked) {
  if(this.proto && marked.indexOf(this.proto) === -1) { // don't remove prototype
    marked.push(this.proto);
    this.env.resolve(this.proto).gc(marked);
  }
  for(var pointer in this.properties) {
    if(marked.indexOf(this.properties[pointer]) !== -1) continue; // filter cycles and doubles
    marked.push(this.properties[pointer]);
    this.env.resolve(this.properties[pointer]).gc(marked);
  }
};
GenericObject.prototype.getPropertyPointer = function(property) {
  this.env.debug('GenericObject.getPropertyPointer ', property);
  if(this.properties[property]) return this.properties[property];
  if(this.proto) return this.env.resolve(this.proto).getPropertyPointer(property);
  return 0;
};
GenericObject.prototype.setPropertyPointer = function(property, addr) {
  this.env.debug('GenericObject.getPropertyPointer ', property, addr);
  return this.properties[property] = addr;
};
GenericObject.prototype.callMethod = function(property, args, precScope) {
  args = (args) ? args : [];
  try {
    var method = this.env.resolve(this.getPropertyPointer(property));
    method = this.env.cast('function', method);
  }catch(e){ throw new MagnetError('Trying to call an non-existent method: "'+property+'"');}
  return method.invoke(this.env.set(this), args, precScope);
};
GenericObject.prototype.dump = function(level, cyclic) {
  this.env.debug('GenericObject.dump ', level);
  
  level = (level) ? level : 1;
  var padding = repeatString('\t', level);
  
  cyclic = (cyclic) ? cyclic : [];
  cyclic.push(this);
  
  var props = [];
  for(var prop in this.properties) {
    var obj = this.env.resolve(this.properties[prop]);
    if(cyclic.indexOf(obj) !== -1) {
      props.push(prop+' : '+'Cyclic');
      continue;
    }
    props.push(prop+' : '+obj.dump(level+1, copyObject(cyclic)));
  }
  return "[\r\n"+padding + props.join(",\r\n"+padding) + "\r\n"+repeatString('\t', level-1)+"]";
};