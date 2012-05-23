// String \\

TypeFactory.proto.makeList = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  
/*
- sort(func) -> this
- shift() -> obj
- unshift(obj) -> ?
- slice(???) -> list
*/
  
  // count
  object.properties['count'] = env.set( TypeFactory.makeNativeFunction(env, function PrimalList_count(precScope) {
    var count = 0;
    for(var prop in this.properties) if(isInt(prop)) count++;
    return env.set(TypeFactory.makeInteger(env, count));
  }));
  
  // push
  object.properties['push'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope /* , obj...*/) {
    var thisobj = this;
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    
    var index = this.length;
    args.forEach(function(obj) {
      thisobj.setPropertyPointer(index++, obj);
    });
    this.length += args.length;
    return env.set(this);
  }));
  
  // pop
  object.properties['pop'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, obj) {
    var last = PrimalList_count.call(this, precScope)-1;
    var addr = this.getPropertyPointer(last);
    delete this.properties[last];
    return addr;
  }));
  
  // join
  object.properties['join'] = env.set( TypeFactory.makeNativeFunction(env, function PrimalList_count(precScope, seperator) {
    seperator = (seperator !== 0 && seperator !== undefined) ? env.resolve(seperator) : '';
    var joined = '';
    for(var prop in this.properties) {
      if(!isInt(prop)) continue;
      joined += env.cast('string', env.resolve(this.getPropertyPointer(prop))).getVal() + seperator;
    }
    if(joined.length > seperator.length) joined = joined.substr(0, joined.length - seperator.length);
    return env.set(TypeFactory.makeString(env, joined));
  }));
  
  // map
  object.properties['map'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, iteratorfunc) {
      var thisaddr = env.set(this);
      var newlist = TypeFactory.makeList(env);
      var i = 0;
      for(var prop in this.properties) {
        if(!isInt(prop)) continue;
        var bool = iteratorfunc.invoke(thisaddr, [ this.properties[prop], env.set(TypeFactory.makeInteger(prop)) ], precScope);
        if(env.cast('bool', env.resolve(bool)).getVal() !== true) newlist[i++] = this.properties[prop];
      }
      return env.set(newlist);
  }));
  
  return object;
};

TypeFactory.makeList = function makeList(env, list) {
  var object = new GenericObject(env, env.proto['list']);
  object.isPrimal = true;
  object.length = 0;
  
  list.forEach(function(addr, i) {
    object.setPropertyPointer(i, addr);
  });
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) {
      var dump = [];
      for(var prop in this.properties) if(isInt(prop)) dump.push(this.env.resolve(this.properties[prop]).dump());
      return '<'+dump.join(', ')+'>';
    }
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'each') this.isPrimal = false; // Deprive primal status if the read property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // each
  object.properties['each'] = env.set( TypeFactory.makeNativeFunction(env, function(precScope, iteratorfunc) {
      var thisaddr = env.set(this);
      for(var prop in this.properties) if(isInt(prop)) iteratorfunc.invoke(thisaddr, [this.properties[prop], env.set(TypeFactory.makeInteger(prop))], precScope);
      return thisaddr;
  }));
  
  return object;
};