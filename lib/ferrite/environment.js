function Environment() {
      this.heap = {length:1, 0:new Nil}; // 0 : nil
      this.trace = new Trace;
      this.gcCounter = 0;
      
      // settings
      this.garbage_collection = true;
      this.gcIntervall = 5000;
      this.debuggerOn = false;
      this.CYCLE_LIMIT = 10;
      
      this.proto = {};
      this.proto['object'] = this.set(TypeFactory.proto.makeObject(this));
      this.proto['boolean'] = this.set(TypeFactory.proto.makeBoolean(this));
      this.proto['function'] = this.set(TypeFactory.proto.makeFunction(this));
      this.proto['float'] = this.set(TypeFactory.proto.makeFloat(this));
      this.proto['integer'] = this.set(TypeFactory.proto.makeInteger(this));
      this.proto['string'] = this.set(TypeFactory.proto.makeString(this));
      
      if(this.debuggerOn) {
        NODE_OP     = 0;

        NODE_ACT    = 'NODE_ACT';

        NODE_EXPR   = 'NODE_EXPR';

        NODE_INT    = 'NODE_INT';
        NODE_FLOAT  = 'NODE_FLOAT';
        NODE_STR    = 'NODE_STR';
        NODE_BOOL   = 'NODE_BOOL';

        NODE_VAR    = 'NODE_VAR';
        NODE_PROP   = 'NODE_PROP';
        NODE_IDENT  = 'NODE_IDENT';

        NODE_FUNC   = 'NODE_FUNC';
        NODE_PARAM  = 'NODE_PARAM';

        NODE_CALL   = 'NODE_CALL';
        NODE_ARG    = 'NODE_ARG';


        OP_NONE     = 'OP_NONE';
        OP_ASSIGN   = 'OP_ASSING';

        OP_EQU      = 'OP_EQU';
        OP_NEQ      = 'OP_NEQ';
        OP_GRT      = 'OP_GRT';
        OP_LOT      = 'OP_LOT';
        OP_GRE      = 'OP_GRE';
        OP_LOE      = 'OP_LOE';

        OP_ADD      = 'OP_ADD';
        OP_SUB      = 'OP_SUB';
        OP_DIV      = 'OP_DIV';
        OP_MUL      = 'OP_MUL';
        OP_NEG      = 'OP_NEG';

        OP_OR       = 'OP_OR';
        OP_AND      = 'OP_AND';
        OP_NOT      = 'OP_NOT';

        OP_CRY      = 'OP_CRY';
        OP_TRACE    = 'OP_TRACE';
        OP_DEBUG    = 'OP_DEBUG';
        OP_RET      = 'OP_RET';
        OP_IFELSE   = 'OP_IFELSE';
      }
}
Environment.prototype.debug = function env_debug() {
  if(this.debuggerOn === true) console.log.apply(console, arguments);
};

Environment.prototype.set = function set(val) {
  // var addr = this.getAddr(val);
  // if(addr != null) return addr;
  this.heap[this.heap.length] = val;this.gcCounter++;
  return this.heap.length++;// return address
};
Environment.prototype.resolve = function resolve(addr) {
  return this.heap[ addr ] || function(){throw new Error('Trying to resolve a pointer to an empty heap entry : '+addr);}();
};
Environment.prototype.getAddr = function getAddr(obj) {
  var addr;
  for(var i=0; i < this.heap.length; i++) {
    var j = this.heap.length-1-i;
    var k = Math.round((this.heap.length-1)/2)-i;
    var l = Math.round((this.heap.length-1)/2)+i;
    if(i > k && j < l) break;
    if(this.heap[i] === obj) {
      addr = i;
      break;
    }else if(this.heap[j] === obj) {
      addr = j;
      break;
    }else if(this.heap[k] === obj) {
      addr = k;
      break;
    }
    else if(this.heap[l] === obj) {
      addr = l;
      break;
    }
  }
  return addr;
};

Environment.prototype.gc = function env_gc(scope) {
  if(this.garbage_collection === false) return;
  if(this.gcCounter < this.gcIntervall) return;
  this.debug('-GC-');
  var marked = [];
  marked.push(0 /* Nil */,
    this.proto['object'],
    this.proto['boolean'],
    this.proto['string'],
    this.proto['integer'],
    this.proto['float']
  ); // don't remove primal prototypes
  for(var proto in this.proto) {
    this.resolve(this.proto[proto]).gc(marked);
  }
  scope.gc(marked);
  this.sweep(marked);
  this.gcCounter = 0;
};

Environment.prototype.sweep = function sweep(marked) {
  this.debug('Env.sweep');
  for(var i=0; i < this.heap.length; i++) {
    if(this.heap[i] == undefined) continue;
    if(marked.indexOf(i) !== -1) continue;
    delete this.heap[i];
  }
};

Environment.prototype.cast = function cast( type, entity, cycle_counter) {
  this.debug('Environment.cast '+type);
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
      }else if(cycle_counter > this.CYCLE_LIMIT) throw new Error('Cyclic dependecies when casting to string.');
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
      }else if(cycle_counter > this.CYCLE_LIMIT) throw new Error('Cyclic dependecies when casting to integer.');
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
      }else if(cycle_counter > this.CYCLE_LIMIT) throw new Error('Cyclic dependecies when casting to float.');
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
      }else if(cycle_counter > this.CYCLE_LIMIT) throw new Error('Cyclic dependecies when casting to function.');
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
      }else if(cycle_counter > this.CYCLE_LIMIT) throw new Error('Cyclic dependecies when casting to boolean.');
      return this.cast('boolean', func, cycle_counter++);
    default:
      throw new Error('Trying to cast to invalid type: '+type);
  }
};