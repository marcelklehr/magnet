var TypeFactory = {proto:{}};


// Prototype \\

TypeFactory.proto.makeObject = function(env) {
  var object = new GenericObject(env);
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    return TypeFactory.makeBoolean(env, (this === obj));
  }));
  
  // fork
  object.properties['fork'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    return new GenericObject(env, env.set(this));
  }));
  
  // copy
  object.properties['copy'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope) {
    var obj = new GenericObject(env, this.proto);
    obj.isPrimal = !!this.isPrimal;
    obj.dump = this.dump;
    for(var prop in this.properties) {
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy', [], precScope);
    }
    return obj;
  }));
  
  // mixin
  object.properties['mixin'] = env.set(TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    for(var prop in obj.properties) {
      this.setPropertyPointer(prop, obj.properties[prop]);
    }
    return this;
  }));
  
  return object;
};

// TypeFactory \\

TypeFactory.makeObject = function makeObject(env, properties) {
  var obj = new GenericObject(env, env.proto['object']);
  
  if(properties) {
    for(var prop in properties) {
      obj.properties[prop] = env.set(properties[prop]);
    }
  }
  return obj;
};

// The root magnet Object \\

function GenericObject(env, proto, properties) {
  var that = this;
  this.env = env;
  this.proto = proto;
  this.properties = (properties) ? properties : {};
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
  var method = this.env.resolve(this.getPropertyPointer(property));
  args = (args) ? args : [];
  return this.env.cast('function', method).invoke(this, args, precScope);
};
GenericObject.prototype.dump = function(level, cyclic) {
  this.env.debug('GenericObject.dump ', level);
  
  var level = (level) ? level : 1;
  var padding = repeatString('\t', level);
  
  cyclic = (cyclic) ? cyclic : [];
  cyclic.push(this);
  
  var props = [];
  for(var prop in this.properties) {
    var obj = this.env.resolve(this.properties[prop]);
    if(cyclic.indexOf(obj) !== -1) {
      props.push(prop+' : '+'<Cyclic>');
      continue;
    }
    props.push(prop+' : '+obj.dump(level+1, copyObject(cyclic)));
  }
  return "[\r\n"+padding + props.join(",\r\n"+padding) + "\r\n"+repeatString('\t', level-1)+"]";
};