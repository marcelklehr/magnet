// Nil \\
function Nil(env) {
  this.env = env;
  this.addr = 0;
  this.properties['=='] = Primal.NativeFunction(env, function(precScope, obj) {
    return Primal.Boolean(env, (obj === 0));
  });
}

Nil.prototype = new GenericObject;
Nil.prototype.constructor = Nil;

Nil.prototype.dump = function() {
  return 'nil';
};

Nil.prototype.gc = function() {
  return;
};

Nil.prototype.getPropertyPointer = function(property) {
  this.env.debug('Nil.getPropertyPointer ', property);
  if(this.properties[property]) return this.properties[property];
  if(this.proto) return this.env.resolve(this.proto).getPropertyPointer(property);
  throw new Error('Trying to get a property of nil.');
  return 0;
};

Nil.prototype.setPropertyPointer = function(property, addr) {
  throw new Error('Trying to set a property of nil.');
};