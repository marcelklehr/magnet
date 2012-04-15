/*** SCOPE ***/

function Scope(parent) {
  this.parent = parent;
  this.pointers = {};
  
  // Scope inheritance
  if(parent) {
    this.global = parent.global;
  }
  // global
  else {
    this.global = {
      heap: [new Nil ], // 0 : nil
      trace: new Trace,
      set: function set(val) {
        return this.heap.push(val) - 1;// return address
      },
      resolve: function resolve(addr) {
        return this.heap[ addr ];
      },
      cast: this.cast
    };
  }
}

Scope.prototype.setPointer = function setPointer(identifier, addr) {
  if(identifier == 'nil') throw new Error('Can\'t assign to nil keyword');
  var idents = identifier.split('.');
  
  // variable not in scope
  if(!this.pointers[idents[0]] && this.parent) return this.parent.setPointer(identifier, addr);
  
  // simple variable
  if(idents.length == 1) return this.pointers[identifier] = addr;
  
  // property access
  var property = idents.shift(); // main variable (get first identifier)
  var addr = this.pointers[ property ];
  
  while(idents.length > 0) {
    obj = this.global.resolve(addr);
    if(obj instanceof mNil) throw new Error('Trying to access "'+identifier+'", but "'+property+'" is nil.');
    
    property = idents.shift();// get properties...
    addr = obj.getPropertyPointer(property);
  }
  return obj.properties[ property ] = addr;
};

Scope.prototype.getPointer = function getPointer(identifier) {
  if(identifier == 'nil') return 0;
  var idents = identifier.split('.');
  
  // simple variable
  var addr = this.pointers[ idents[0] ] | ((this.parent) ? this.parent.getPointer( idents[0] ) : 0);
  
  for(var i=1; i < idents.length; i++) {
    if(addr instanceof Nil) throw new Error('Trying to access "'+identifier+'", but "'+idents[i-1]+'" is nil.');
    addr = this.global.resolve(addr).getPropertyPointer( idents[i] );
  }
  return addr;
};

Scope.prototype.cast = function cast( type, entity, cycle_counter) {
  if(entity instanceof Nil) throw new Error('Trying to cast nil to '+type);
  if(!(entity instanceof GenericObject)) { console.log('Casting to '+type+': ', entity); throw new Error('Trying to cast a non-entity to '+type+'. This is typically some internal bug.');}
  
  switch( type ) {
    case 'string':
      var readfunc = this.global.resolve(entity.getPropertyPointer('read'));
      if(readfunc instanceof Nil) throw new Error('Trying to cast a non-readable to a string.');
      
      var string = this.global.resolve( this.cast('function', readfunc).invoke([]) );
      
      // returns primal string
      if(string instanceof PrimalString) {
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
      var countfunc = this.global.resolve(entity.getPropertyPointer('count'));
      if(countfunc instanceof Nil) throw new Error('Trying to cast a non-countable to integer.');
      
      var integer = this.global.resolve( this.cast('function', countfunc).invoke([]) );
      
      // returns primal integer
      if(integer instanceof PrimalInteger) {
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
      var calcfunc = this.global.resolve(entity.getPropertyPointer('calc'));
      if(calcfunc instanceof Nil) throw new Error('Trying to cast a non-countable to float.');
      
      var floatval = this.global.resolve( this.cast('function', calcfunc).invoke([]) );
      
      // returns primal integer
      if(floatval instanceof PrimalInteger) {
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
      var func = this.global.resolve(entity.getPropertyPointer('call'));
      if(func instanceof Nil) throw new Error('Trying to cast a non-callable to function.');
      
      // is primal function
      if(func instanceof PrimalFunction) {
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
      var decidefunc = this.global.resolve(entity.getPropertyPointer('decide'));
      if(decidefunc instanceof Nil) throw new Error('Trying to cast a non-decidable to boolean.');
      
      var bool = this.global.resolve( this.cast('function', calcfunc).invoke([]) );
      
      // is primal function
      if(bool instanceof PrimalBoolean) {
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
  }
}

Scope.prototype.execute = function execute( node ) {
  // console.log('# execute', node.type, node.value);
  if( !node )
    return 0;
		
  switch( node.type )
  {
    /*** PRIMITIVES ***/
    
    case NODE_INT:
      return this.global.set(new PrimalInteger(this.global, node.value));
    
    case NODE_FLOAT:
      return this.global.set(new PrimalFloat(this.global, node.value));
    
    case NODE_STR:
      return this.global.set(new PrimalString(this.global, node.value));
    
    /*** BASICS ***/
    
    case NODE_ACT:
      var ret = this.execute( node.value ); // addr
      if(node.value.value === OP_RET || !node.children[0]) return ret;
      if(node.children[0]) {
        return this.execute(node.children[0]);
      }
      break;
    
    case NODE_EXPR:
      return this.global.set( this.execute( node.value ) );
    
    case NODE_VAR:
      return this.getPointer( this.execute(node.value) );
    
    case NODE_IDENT:
      if(!node.children[0]) return node.value;
      return node.value+'.'+this.execute(node.children[0]);
    
    /* Operstors */
    
    case NODE_OP:
      switch( node.value )
      {
        case OP_NONE:
          break;
        
        case OP_CRY:
          var val = this.global.resolve( this.execute(node.children[0]) );
          console.log( this.cast('string', val ).getVal() );
          return val;
        
        case OP_TRACE:
          this.global.trace.backtrace();
          break;
        
        case OP_DEBUG:
          var dump = {};
          for(var variable in this.pointers) {
            dump[variable] = this.global.heap[ this.pointers[variable] ];
          }
          console.log('# current scope:', dump);
          break;
        
        case OP_RET:
          if(node.children[0]) return this.execute(node.children[0]);
          break;
        
        case OP_ASSIGN:
          var that = this;
          var identifier = this.execute(node.children[0]);
          var addr = this.execute(node.children[1]);
          this.setPointer( identifier, addr );
          this.global.trace.log( 'assignment: '+identifier+' ->', this.global.resolve(  addr  ) );
          return addr;
        
        case OP_IFELSE:
          if( this.cast('bool', this.execute(node.children[0])).getVal() ) {
            return this.execute(node.children[1].value);
          }else if(node.children[2]) { // if an else block exists...
            return this.execute(node.children[2].value);
          }
          break;
        
      /* Comparison Operators */
        case OP_EQU:
          return this.execute( node.children[0] ) == this.execute( node.children[1] );
        case OP_NEQ:
          return this.execute( node.children[0] ) != this.execute( node.children[1] );
        case OP_GRT:
          return this.execute( node.children[0] ) > this.execute( node.children[1] );
        case OP_LOT:
          return this.execute( node.children[0] ) < this.execute( node.children[1] );
        case OP_GRE:
          return this.execute( node.children[0] ) >= this.execute( node.children[1] );
        case OP_LOE:
          return this.execute( node.children[0] ) <= this.execute( node.children[1] );

      /* Arithmetic Operatos */
        case OP_ADD:
          return this.execute( node.children[0] ) + this.execute( node.children[1] );
        case OP_SUB:
          return this.execute( node.children[0] ) - this.execute( node.children[1] );
        case OP_DIV:
          return this.execute( node.children[0] ) / this.execute( node.children[1] );
        case OP_MUL:
          return this.execute( node.children[0] ) * this.execute( node.children[1] );
        case OP_NEG:
          return this.execute( node.children[0] ) * -1;
      }
      break;
    
    /*** FUNCTIONS ***/
    
    case NODE_FUNC:
      var params = (node.children[0]) ? this.execute(node.children[0]) : [];
      var func = new PrimalFunction(this.global, this, node.value, params);// global, inheritScope, code, params
      return this.global.set(func);
      
    case NODE_PARAM:
      var params = [];
      params.push(node.value);
      if(node.children[0]) params = params.concat(this.execute(node.children[0]));
      return params;
    
    case NODE_CALL:
      var identifier = this.execute(node.value.value);
      var func =       this.global.resolve(this.execute(node.value));
      var args =       (node.children[0]) ? this.execute(node.children[0]) : [];
      if(!func) throw new Error('Trying to call a non-existent function. (identifier: "'+identifier+'")');
      
      // invoke function
      var ret = this.cast('function', func).invoke(args);
      if(ret != 0) {
        this.global.trace.log( 'function call: '+identifier+' ( '+args.join(' , ')+' ) -> ' , this.global.resolve(ret) );
        return ret;// addr
      }
      this.global.trace.log( 'function call: '+identifier+' ( '+args.join(' , ')+' ) ' );
      break;
    
    case NODE_ARG:
      var args = [];
      args.push(this.execute(node.value));
      if(node.children[0]) args = args.concat(this.execute(node.children[0]));
      return args;
  }
  
  return 0;
};