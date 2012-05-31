/*** LIBRARY ***/

function Library(name, constructor) {
  this.name = name;
  this.methods = {};
  this.properties = {};
  this.constructor = constructor;
}

Library.prototype.attach = function(scope) {
  var lib = this;
  var env = scope.env;
  var obj = env.resolve(Primal.Object(env));
  this.constructor.call({
    method: function(name, func) {
      if(!(typeof(func) == "function")) throw new Error('Trying to pass a non-function to Library.method of '+this.name+'.');
      obj.setPropertyPointer(name, lib.transcript(env, func));
    },
    property: function(name, val) {
      obj.setPropertyPointer(name, lib.transcript(env, val))
    }
  }, env, obj);
  scope.setPropertyPointer(this.name, obj.addr);
};

Library.prototype.transcript = function(env, val) {
  var pointer = 0;
  switch(typeof(val)) {
  case "number":
    pointer = Primal.Float(env, val);
    if(val % 1 == 0) pointer = Primal.Integer(env, val);
    break;
  case "boolean":
    pointer = Primal.Boolean(env, val);
    break;
  case "string":
    pointer = Primal.String(env, val);
    break;
  case "function":
    var lib = this;
    pointer = Primal.NativeFunction(env, function() {
      var args = [].slice.call(arguments);
      args.shift(); // myscope
      args = args.map(this.env.resolve.bind(this.env));
      return lib.transcript(this.env, val.apply(this, args));
    });
    break;
  case "object":
    pointer = this.transcriptObject(env, val);
    break;
  }
  return pointer;
}

Library.prototype.transcriptObject = function(env, jsObject) {
  var pobj = Primal.Object(env);
  var obj = env.resolve(pobj);
  for(var prop in jsObject) {
    var val = jsObject[prop];
    obj.setPropertyPointer(prop, this.transcript(env, val));
  }
  return pobj;
}