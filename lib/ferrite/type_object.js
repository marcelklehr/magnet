var TypeFactory = {};

TypeFactory.makeObject = function makeObject(env, properties) {
  var obj = new GenericObject(env);
  
  if(properties) {
    for(prop in properties) {
      obj.properties[prop] = env.set(properties[prop]);
    }
  }
  return obj;
}

// Object \\

function GenericObject(env, properties) {
  var that = this;
  this.env = env;
  this.properties = (properties) ? properties : {};
  this.isPrimal = false;
  
  /*/ == -- causes recursion
  this.properties['=='] = env.set(TypeFactory.makeNativeFunction(env, function(obj) {
    return TypeFactory.makeBoolean(env, (that === obj));
  })); */
}
GenericObject.prototype.getPropertyPointer = function(property) {
  if(this.properties[property]) return this.properties[property];
  return 0;
};
GenericObject.prototype.setPropertyPointer = function(property, addr) {
  return this.properties[property] = addr;
};
GenericObject.prototype.callMethod = function(property, args) {
  var method = this.env.resolve(this.getPropertyPointer(property));
  args = (args) ? args : [];
  return this.env.cast('function', method).invoke(args);
};
GenericObject.prototype.dump = function() {
  var props = [];
  for(prop in this.properties) {
    props.push(prop+' : '+this.env.resolve(this.properties[prop]).dump());
  }
  return "[\r\n" + props.join(",\r\n") + "\r\n]";
};