// String \\

Primal.protoList = function(env) {
  var object = new GenericObject(env, env.proto['object']);
  object.addr = env.set(object);
  
/*
- sort(func) -> this
- slice(???) -> list
*/
  
  // copy
  object.properties['copy'] = Primal.NativeFunction(env, function(precScope) {
    var obj = new GenericObject(env, this.proto);
    obj.isPrimal = !!this.isPrimal;
    obj.dump = this.dump;
    obj.gc = this.gc;
    obj.length = this.length;
    for(var prop in this.properties) {
      obj.properties[prop] = env.resolve(this.properties[prop]).callMethod('copy', [], precScope);
    }
    obj.addr = env.set(obj);
    return obj.addr;
  });
  
  // count
  object.properties['count'] = Primal.NativeFunction(env, function PrimalList_count(precScope) {
    return Primal.Integer(env, this.length);
  });
  
  // push
  object.properties['push'] = Primal.NativeFunction(env, function(precScope /* , obj...*/) {
    var thisobj = this;
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    
    var index = this.length;
    args.forEach(function(obj) {
      thisobj.setPropertyPointer(index++, obj);
    });
    this.length += args.length;
    return this.addr;
  });
  
  // pop
  object.properties['pop'] = Primal.NativeFunction(env, function(precScope) {
    var last = (this.length > 0) ? this.length-1 : 0;
    var addr = this.getPropertyPointer(last);
    delete this.properties[last];
    this.length--;
    return addr;
  });
  
  // shift
  object.properties['shift'] = Primal.NativeFunction(env, function(precScope) {
    var addr = this.getPropertyPointer(0);
    for(var prop in this.properties) {
      if(!isInt(prop)) continue;
      if(parseInt(prop) == 0) continue;
      this.setPropertyPointer(parseInt(prop)-1, this.getPropertyPointer(prop));
      delete this.properties[prop];
    }
    this.length--;
    return addr;
  });
  
  // unshift
  object.properties['unshift'] = Primal.NativeFunction(env, function(precScope /*, objects */) {
    var thisobj = this;
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    
    // shift current properties
    for(var prop=this.length-1; prop >= 0; prop--) {
      this.setPropertyPointer(parseInt(prop)+args.length, this.getPropertyPointer(prop));
    }
    
    args.forEach(function(addr, i) {
      thisobj.setPropertyPointer(i, addr);
    });
    this.length += args.length;
    return this.addr;
  });
  
  // join
  object.properties['join'] = Primal.NativeFunction(env, function PrimalList_count(precScope, seperator) {
    seperator = (seperator) ? env.cast('string', env.resolve(seperator)).getVal() : '';
    var joined = '';
    for(var prop in this.properties) {
      if(!isInt(prop)) continue;
      joined += env.cast('string', env.resolve(this.getPropertyPointer(prop))).getVal() + seperator;
    }
    if(joined.length > seperator.length) joined = joined.substr(0, joined.length - seperator.length);
    return Primal.String(env, joined);
  });
  
  // map
  object.properties['map'] = Primal.NativeFunction(env, function(precScope, iteratorfunc) {
      var newlist = env.resolve(Primal.List(env));
      var i = 0;
      for(var prop in this.properties) {
        if(!isInt(prop)) continue;
        var bool = iteratorfunc.invoke(this.addr, [ this.properties[prop], Primal.Integer(prop) ], precScope);
        if(env.cast('bool', env.resolve(bool)).getVal() !== true) newlist[i++] = this.properties[prop];
      }
      return newlist.addr;
  });
  
  return object.addr;
};

Primal.List = function makeList(env, list) {
  var object = new GenericObject(env, env.proto['list']);
  object.isPrimal = true;
  object.addr = env.set(object);
  object.length = list.length;
  
  list.forEach(function(addr, i) {
    object.setPropertyPointer(i, addr);
  });
  
  object.dump = function(level, cyclic) {
    if(this.isPrimal) {
      level = (level) ? level : 1;
      cyclic = (cyclic) ? cyclic : [];
      cyclic.push(this);
      
      var padding = repeatString('\t', level);
      
      var dump = [];
      for(var prop in this.properties) {
        if(isInt(prop)) {
          var obj = this.env.resolve(this.properties[prop]);
          if(cyclic.indexOf(obj) !== -1) {
            dump.push('Cyclic');
            continue;
          }
          dump.push(obj.dump(level+1, copyObject(cyclic)));
        }
      }
      return '<\r\n'+padding+dump.join(', \r\n'+padding)+'\r\n'+repeatString('\t', level-1)+'>';
    }
    return GenericObject.prototype.dump.call(this, level, cyclic);
  };
  
  object.setPropertyPointer = function(property, addr) {
    if(this.isPrimal && property == 'each') this.isPrimal = false; // Deprive primal status if the read property is modified
    return GenericObject.prototype.setPropertyPointer.call(this, property, addr);
  };
  
  // each
  object.properties['each'] = Primal.NativeFunction(env, function(precScope, iteratorfunc) {
      iteratorfunc = env.resolve(iteratorfunc);
      for(var prop in this.properties) {
        if(!isInt(prop)) continue;
        iteratorfunc.invoke(this.addr, [this.properties[prop], Primal.Integer(env, prop)], precScope);
      }
      return this.addr;
  });
  
  return object.addr;
};