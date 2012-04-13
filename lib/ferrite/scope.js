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
      heap: [null, ], // 0 : nil
      trace: new Trace,
      set: function set(val) {
        return this.heap.push(val) - 1;// return address
      },
      resolve: function resolve(addr) {
        return this.heap[ addr ];
      }
    };
  }
}

Scope.prototype.setPointer = function setPointer(identifier, addr) {
  if(!this.pointers[identifier] && this.parent) return this.parent.setPointer(identifier, addr);
  this.pointers[identifier] = addr;
};

Scope.prototype.getPointer = function getPointer(identifier) {
  if(identifier == 'nil') return 0;
  return this.pointers[identifier] | ((this.parent) ? this.parent.getPointer(identifier) : 0);
};

Scope.prototype.execute = function execute( node ) {
  if( !node )
    return 0;
		
  switch( node.type )
  {
    /*** PRIMITIVES ***/
    
    case NODE_NUM:
      return node.value; //{type: '_number_', value: new Number( node.value )};
    
    case NODE_STR:
      return node.value; //{type: '_string_', text: node.value};
    
    /*** BASICS ***/
    
    case NODE_ACT:
      var ret;
      ret = this.execute( node.value );
      if(node.value.value === OP_RET || !node.children[0]) return {type: '_return_', value: ret};
      if(node.children[0]) {
        ret = this.execute(node.children[0]);
        if(ret != 0 && ret.type === '_return_') return ret;
      }
      break;
    
    case NODE_EXPR:
      return this.execute( node.value );
    
    case NODE_VAR:
      return this.global.resolve( this.getPointer(node.value) );
    
    case NODE_IDENT:
      return node.value;
    
    /* Operstors */
    
    case NODE_OP:
      switch( node.value )
      {
        case OP_NONE:
          break;
        
        case OP_CRY:
          var expr = node.children[0];
          var val = this.execute(expr);
          console.log( val );
          return val;
        
        case OP_DEBUG:
          var dump = {};
          for(var variable in this.pointers) {
            dump[variable] = this.global.heap[ this.pointers[variable] ];
          }
          console.log('# current scope:', dump);
          break;
        
        case OP_RET:
          var expr = node.children[0];
          if(expr) return this.execute(node.children[0]);
          break;
        
        case OP_ASSIGN:
          var that = this;
          var identifier = node.children[0];
          var getAddr = function(node) {
            if(node.children[1].type == NODE_VAR) { // variable
              return that.getPointer(node.children[1].value);
            }else
            if(node.children[1].value == OP_ASSIGN) { // chained assignment
              return getAddr(node.children[1]);
            }else{
              return that.global.set( that.execute(node.children[1]) );
            }
          };
          var addr = getAddr(node);
          this.setPointer( identifier, addr );
          this.global.trace.log( 'assignment: '+identifier+' ->', this.global.resolve(  addr  ) );
          return this.global.resolve(  addr  );
        
        case OP_IFELSE:
          if(this.execute(node.children[0])) {
            if(node.children[1].type === NODE_FUNC) return this.execute(node.children[1].value);
            this.execute(node.children[1]);
          }else if(node.children[2]) {// if an else block exists...
            if(node.children[2].type === NODE_FUNC) return this.execute(node.children[2].value);
            this.execute(node.children[2]);
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
      var func = {type: '_function_', inheritScope: this, code: node.value, params: []};
      if(node.children[0]) func.params = this.execute(node.children[0]);
      return func;
      
    case NODE_PARAM:
      var params = [];
      params.push(node.value);
      if(node.children[0]) params = params.concat(this.execute(node.children[0]));
      return params;
    
    case NODE_CALL:
      var identifier = node.value.value;
      var func =       this.execute(node.value);
      var args =       (node.children[0]) ? this.execute(node.children[0]) : [];
      if(!func) throw new Error('Trying to call a non-existent function. (identifier: "'+identifier+'")');
      if(func.type !== '_function_') throw new Error('Trying to call a non-function. (identifier: "'+identifier+'")');
      
      // prepare scope
      var scope = new Scope(func.inheritScope);
      for(var i=0; i < args.length; i++) {
        scope.setPointer(func.params[i], this.global.set(args[i]));
      }
      
      // invoke function
      var ret = scope.execute(func.code);
      if(ret != 0 && ret.type === '_return_') {
        this.global.trace.log( 'function call: '+identifier+' ( '+args.join(' , ')+' ) -> ' , ret.value );
        return ret.value;
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