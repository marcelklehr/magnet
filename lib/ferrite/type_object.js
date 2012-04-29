var TypeFactory = {proto:{}};


// Prototype \\

TypeFactory.proto.makeObject = function(env) {
  var object = new GenericObject(env);
  
  // ==
  object.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (this === obj));
  }));
  
  // fork
  object.properties['fork'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    return new GenericObject(env, env.set(this));
  }));
  
  // copy
  object.properties['copy'] = env.set(TypeFactory.makeNativeFunction(env, function() {
    var obj = new GenericObject(env, this.proto);
    obj.isPrimal = !!this.isPrimal;
    obj.dump = this.dump;
    for(var prop in this.properties) {
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy');
    }
    return obj;
  }));
  
  // mixin
  object.properties['mixin'] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    for(var prop in obj.properties) {
      this.setPropertyPointer(prop, obj.properties[prop]);
    }
    return this;
  }));
  
  return env.set(object);
};

// TypeFactory \\

TypeFactory.makeObject = function makeObject(env, properties) {
  var obj = new GenericObject(env, enf.proto['object']);
  
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
GenericObject.prototype.getPropertyPointer = function(property) {
  this.env.debug('GenericObject.getPropertyPointer ', property);
  if(this.properties[property]) return this.properties[property];
  if(this.proto) return this.env.resolve(this.proto).getPropertyPointer(property);
  return 0;
};
GenericObject.prototype.setPropertyPointer = function(property, addr) {
  return this.properties[property] = addr;
};
GenericObject.prototype.callMethod = function(property, args) {
  var method = this.env.resolve(this.getPropertyPointer(property));
  args = (args) ? args : [];
  return this.env.cast('function', method).invoke(this, args);
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