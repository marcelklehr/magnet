function Environment() {
      this.heap = [new Nil ]; // 0 : nil
      this.trace = new Trace;
      
      this.proto = {};
      this.proto['object'] = TypeFactory.proto.makeObject(this);
      this.proto['boolean'] = TypeFactory.proto.makeBoolean(this);
      this.proto['function'] = TypeFactory.proto.makeFunction(this);
      this.proto['float'] = TypeFactory.proto.makeFloat(this);
      this.proto['integer'] = TypeFactory.proto.makeInteger(this);
      this.proto['string'] = TypeFactory.proto.makeString(this);
}
Environment.prototype.set = function set(val) {
  return this.heap.push(val) - 1;// return address
};
Environment.prototype.resolve = function resolve(addr) {
  return this.heap[ addr ];
};

Environment.prototype.cast = function cast( type, entity, cycle_counter) {
  if(entity instanceof Nil) throw new Error('Trying to cast nil to '+type);
  if(!(entity instanceof GenericObject)) {
    console.log('Casting to '+type+': ', entity);
    throw new Error('Trying to cast a non-entity to '+type+'. This is typically some internal bug.');
  }
  
  switch( type ) {
    case 'string':
      try {
        var string = this.resolve(entity.callMethod('read'));
      }catch(e){
        // throw e;
        throw new Error('Trying to cast a non-readable to a string. ('+e.message+')');
      }
      
      // returns primal string
      if(string.isPrimal) {
        return string;
      }
      
      // returns itself
      if(string === entity) {
        throw new Error('Readable returns itself when casting to string.');
      }
      
      // returns an object
      if(!cycle_counter) {
        cycle_counter = 0;
      }else if(cycle_counter > 30) throw new Error('Cyclic dependecies when casting to string.');
      return this.cast('string', string, cycle_counter++);
    
    case 'integer':
      try {
        var integer = this.resolve(entity.callMethod('count'));
      }catch(e){
        throw new Error('Trying to cast a non-countable to a integer. ('+e.message+')');
      }
      
      // returns primal integer
      if(integer.isPrimal) {
        return integer;
      }
      
      // returns itself
      if(integer === entity) {
        throw new Error('Countable returns itself when casting to integer.');
      }
      
      // returns an object
      if(!cycle_counter) {
        cycle_counter = 0;
      }else if(cycle_counter > 30) throw new Error('Cyclic dependecies when casting to integer.');
      return this.cast('integer', integer, cycle_counter++);
      
    case 'float':
      try {
        var floatval = this.resolve(entity.callMethod('calc'));
      }catch(e){
        try {
          var floatval = this.cast('float', this.cast('integer', entity));
        }catch(e2) { throw new Error('Trying to cast a non-calculatable and non-countable to float. ('+e.message+')'); }
      }
      
      // returns primal float
      if(floatval.isPrimal) {
        return floatval;
      }
      
      // returns itself
      if(floatval === entity) {
        throw new Error('Countable returns itself when casting to float.');
      }
      
      // returns anobject
      if(!cycle_counter) {
        cycle_counter = 0;
      }else if(cycle_counter > 30) throw new Error('Cyclic dependecies when casting to float.');
      return this.cast('float', floatval, cycle_counter++);
    
    case 'function':
      var func = this.resolve(entity.getPropertyPointer('call'));
      if(func instanceof Nil) throw new Error('Trying to cast a non-callable to function.');
      
      // is primal function
      if(func.isPrimal) {
        return func;
      }
      
      // is itself
      if(func === entity) {
        throw new Error('Callable returns itself when casting to function.');
      }
      
      // is an object
      if(!cycle_counter) {
        cycle_counter = 0;
      }else if(cycle_counter > 30) throw new Error('Cyclic dependecies when casting to function.');
      return this.cast('function', func, cycle_counter++);
    
    case 'boolean':
      try {
        var bool = this.resolve(entity.callMethod('decide'));
      }catch(e){
        throw new Error('Trying to cast a non-decidable to a boolean. ('+e.message+')');
      }
      
      // is primal function
      if(bool.isPrimal) {
        return bool;
      }
      
      // is itself
      if(bool === entity) {
        throw new Error('Decidable returns itself when casting to boolean.');
      }
      
      // is an object
      if(!cycle_counter) {
        cycle_counter = 0;
      }else if(cycle_counter > 30) throw new Error('Cyclic dependecies when casting to boolean.');
      return this.cast('boolean', func, cycle_counter++);
    default:
      throw new Error('Trying to cast to invalid type: '+type);
  }
};