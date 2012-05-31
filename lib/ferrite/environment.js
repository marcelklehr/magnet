function Environment() {
  var env = this;
  this.heap = {length: 1, 0: null}; // 0 : nil
  this.gcCounter = 0;
  
  this.events = {
    waiting: 0,
    block: function env_blockTermination(cb) {
      var events = this;
      this.waiting++;
      return function() {
        cb.apply(this, arguments);
        events.unblock();
      }
    },
    unblock: function() {
      env.events.waiting--;
      if(env.events.waiting == 0) {
        env.emit('end');
      }
    }
  };
  
  // settings
  this.garbageCollectionOn = true;
  this.gcInterval = 15000;
  this.debuggerOn = false;
  this.CYCLE_LIMIT = 10;
  
  this.proto = {};
  this.proto['object'] = Primal.protoObject(this);
  this.proto['boolean'] = Primal.protoBoolean(this);
  this.proto['function'] = Primal.protoFunction(this);
  this.proto['float'] = Primal.protoFloat(this);
  this.proto['integer'] = Primal.protoInteger(this);
  this.proto['string'] = Primal.protoString(this);
  this.proto['list'] = Primal.protoList(this);
  this.heap[0] = new Nil(this);
  
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
    
    NODE_OBJ    = 'NODE_OBJ';
    NODE_PROPDEF= 'NODE_PROPDEF';
    NODE_LIST   = 'NODE_LIST';


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

    OP_PUTS     = 'OP_PUTS';
    OP_TRACE    = 'OP_TRACE';
    OP_DEBUG    = 'OP_DEBUG';
    OP_RET      = 'OP_RET';
    OP_IFELSE   = 'OP_IFELSE';
  }
}

Environment.prototype = new(require('events').EventEmitter);
Environment.prototype.constructor = Environment;

Environment.prototype.throw = function env_throw(msg, offset, scope) {
  this.emit('error', MagnetError(msg, offset, scope));
};

Environment.prototype.debug = function env_debug() {
  if(this.debuggerOn === true) console.log.apply(console, arguments);
};

Environment.prototype.set = function set(val) {
  this.heap[this.heap.length] = val;
  this.gcCounter++;
  return this.heap.length++;// return address
};
Environment.prototype.resolve = function resolve(addr) {
  if(!this.heap[ addr ]) throw new Error('Trying to resolve a pointer to an empty heap entry : '+addr);
  return this.heap[ addr ];
};
Environment.prototype.getAddr = function getAddr(obj) { // don't use this -- it takes hours!
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
  if(this.garbageCollectionOn === false) return;
  if(this.gcCounter < this.gcInterval) return;
  this.debug('-GC-');
  var marked = [];
  marked.push(0 /* Nil */);
  // don't remove primal prototypes
  for(var proto in this.proto) {
    marked.push(this.proto[proto]);
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
    if(marked.indexOf(i) === -1) delete this.heap[i];
  }
};

Environment.prototype.cast = function cast( type, entity, cyclic) {
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
      if(!cyclic) {
        cyclic = [];
      }else if(cyclic.indexOf(entity) !== -1) throw new Error('Cyclic dependecies when casting to string.');
      cyclic.push(entity);
      return this.cast('string', string, cyclic);
    
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
      if(!cyclic) {
        cyclic = [];
      }else if(cyclic.indexOf(entity) !== -1) throw new Error('Cyclic dependecies when casting to integer.');
      cyclic.push(entity);
      return this.cast('integer', integer, cyclic);
      
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
      if(!cyclic) {
        cyclic = [];
      }else if(cyclic.indexOf(entity) !== -1) throw new Error('Cyclic dependecies when casting to float.');
      cyclic.push(entity);
      return this.cast('float', floatval, cyclic);
    
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
      if(!cyclic) {
        cyclic = [];
      }else if(cyclic.indexOf(entity) !== -1) throw new Error('Cyclic dependecies when casting to function.');
      cyclic.push(entity);
      return this.cast('function', func, cyclic);
    
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
      if(!cyclic) {
        cyclic = [];
      }else if(cyclic.indexOf(entity) !== -1) throw new Error('Cyclic dependecies when casting to boolean.');
      cyclic.push(entity);
      return this.cast('boolean', bool, cyclic);
    
    default:
      throw new Error('Trying to cast to invalid type: '+type);
  }
};