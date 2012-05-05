/*** SCOPE ***/

function Scope(parent, precursor) {
  this.parent = parent;// definition scope
  this.precursor = precursor;// calling scope
  this.properties = {};
  
  // Environement inheritance
  if(parent) {
    this.env = parent.env;
  }
  // global
  else {
    this.env = new Environment;
  }
  
  this.env.debug('New Scope');
}

Scope.prototype = new GenericObject(new Environment);
Scope.prototype.constructor = Scope;

Scope.prototype.gc = function(marked) {
  if(this.env.garbage_collection === false) return;
  this.env.debug('-GC-');
  var non_recursive_call = (marked == undefined);
  marked = marked || [];
  for(var pointer in this.properties) {
    marked.push(this.properties[pointer]);
    this.env.resolve(this.properties[pointer]).gc(marked);
  }
  if(this.precursor) this.precursor.gc(marked);
  if(non_recursive_call) this.env.sweep(marked);
};

Scope.prototype.getPropertyPointer = function(identifier) {
  if(identifier == 'nil') return 0;
  if(this.properties[identifier]) return this.properties[identifier];
  if(this.parent) return this.parent.getPropertyPointer(identifier);
  return 0;
};

Scope.prototype.setPropertyPointer = function(identifier, addr, recursive_call) {
  if(identifier == 'nil') throw new Error('Can\'t assign to nil keyword');
  if(this.parent && !this.properties[identifier] && this.parent.properties[identifier]) {
    this.parent.setPropertyPointer(identifier, addr, 'recursive');
  }else {
    this.properties[identifier] = addr;
  }
  if(!recursive_call) this.gc();
  return addr;
};

Scope.prototype.execute = function execute( node ) {
  this.env.debug('Scope.execute ', node.type, node.value);
  if( !node )
    return 0;
		
  switch( node.type )
  {
    /*** PRIMAL TYPES ***/
    
    case NODE_BOOL:
      return this.env.set(TypeFactory.makeBoolean(this.env, node.value));
    
    case NODE_INT:
      return this.env.set(TypeFactory.makeInteger(this.env, node.value));
    
    case NODE_FLOAT:
      return this.env.set(TypeFactory.makeFloat(this.env, node.value));
    
    case NODE_STR:
      return this.env.set(TypeFactory.makeString(this.env, node.value));
    
    /*** BASICS ***/
    
    case NODE_ACT:
      var ret = this.execute( node.value ); // addr
      if(node.value.value === OP_RET || !node.children[0]) return ret;
      if(node.children[0]) {
        return this.execute(node.children[0]);
      }
      break;
    
    case NODE_EXPR:
      return this.execute( node.value );
      
    case NODE_VAR:
      var variable = this.execute(node.value);
      this.env.debug('\tNODE_VAR: <object>.'+variable.property+' : '+variable.object.getPropertyPointer(variable.property));
      return variable.object.getPropertyPointer(variable.property);
    
    case NODE_PROP:
      var object = (node.value) ? this.env.resolve(this.execute(node.value)) : this; // either: property access | single var (will be converted to prop access of `this.scope`)
      var prop = this.execute(node.children[0]);
      return {object: object, property: prop};
    
    case NODE_IDENT:
      if(node.value.type == NODE_EXPR) {
        var ident = this.env.cast('string', this.env.resolve(this.execute(node.value))).getVal();
      }else{
        var ident = node.value;
      }
      return ident;
    
    /* Operstors */
    
    case NODE_OP:
      switch( node.value )
      {
        case OP_NONE:
          break;
        
        case OP_CRY:
          var addr = this.execute(node.children[0]);
          console.log( this.env.cast('string', this.env.resolve(addr) ).getVal() );
          return addr;
        
        case OP_TRACE:
          this.env.trace.backtrace();
          break;
        
        case OP_DEBUG:
          console.log('# current scope:');
          console.log(this.dump());
          break;
        
        case OP_RET:
          if(node.children[0]) return this.execute(node.children[0]);
          break;
        
        case OP_ASSIGN:
          var that = this;
          var variable = this.execute(node.children[0]);
          var addr = this.execute(node.children[1]);
          variable.object.setPropertyPointer( variable.property, addr );
          this.env.trace.log( 'assignment: <object>.'+variable.property+' -> '+ this.env.resolve( addr ).dump() );
          return addr;
        
        case OP_IFELSE:
          if( this.env.cast('boolean', this.env.resolve(this.execute( node.children[0] ))).getVal() ) {
            return this.execute(node.children[1].value);
          }else if(node.children[2]) { // if an else block exists...
            return this.execute(node.children[2].value);
          }
          break;
        
      /* Comparison Operators */
        case OP_EQU:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('==', [this.execute( node.children[1] )], this);
        
        case OP_NEQ:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return this.env.resolve( obj.callMethod( '==' , [this.execute( node.children[1] )], this) ).callMethod('!', [], this);
        
        case OP_GRT:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('>', [this.execute( node.children[1] )], this);
        
        case OP_LOT:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('<', [this.execute( node.children[1] )], this);
        
        case OP_GRE:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return this.env.resolve( obj.callMethod('<', [this.execute( node.children[1] )], this)).callMethod('!',[], this);
          
        case OP_LOE:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return this.env.resolve( obj.callMethod('>', [this.execute( node.children[1] )], this)).callMethod('!', [], this);
      
      /* Boolean Operators */
        case OP_OR:
          console.log(node.children[0].value);
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('||', [this.execute( node.children[1] )], this);
        case OP_AND:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('&&', [this.execute( node.children[1] )], this );
        case OP_NOT:
          var obj = this.env.resolve(this.execute( node.children[0] ) );
          return obj.callMethod('!', [], this);

      /* Arithmetic Operatos */
        case OP_ADD:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('+', [this.execute( node.children[1] )], this);
        case OP_SUB:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('-', [this.execute( node.children[1] )], this);
        case OP_DIV:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('/', [this.execute( node.children[1] )], this);
        case OP_MUL:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('*', [this.execute( node.children[1] )], this);
        case OP_NEG:
          var obj = this.env.resolve(this.execute( node.children[0] ));
          return obj.callMethod('*', [this.env.set(TypeFactory.makeInteger(this.env, -1))], this);
      }
      break;
    
    /*** FUNCTIONS ***/
    
    case NODE_FUNC:
      var params = (node.children[0]) ? this.execute(node.children[0]) : [];
      var func = TypeFactory.makeFunction(this.env, this, node.value, params);// env, inheritScope, code, params
      return this.env.set(func);
      
    case NODE_PARAM:
      var params = [];
      params.push(node.value);
      if(node.children[0]) params = params.concat(this.execute(node.children[0]));
      return params;
    
    case NODE_CALL:
      var identifier = (node.value.type == NODE_VAR) ? this.execute(node.value.value).property : '<Closure>';
      var func =       this.env.resolve(this.execute(node.value));
      var args =       (node.children[0]) ? this.execute(node.children[0]) : [];
      var thisvar =    (node.value.type === NODE_VAR) ? this.execute(node.value.value).object : this;
      if(func instanceof Nil) throw new Error('Trying to call a non-existent function. (identifier: "'+identifier+'")');
      
      // invoke function
      var ret = this.env.cast('function', func).invoke(thisvar, args, this /*callingScope*/);
      this.env.debug('---');
      if(ret != 0) {
        this.env.trace.log( 'function return value: '+identifier+' ( '+args.join(' , ')+' ) -> ' , this.env.resolve(ret).dump() );
        return ret;// addr
      }
      break;
    
    case NODE_ARG:
      var args = [];
      args.push(this.execute(node.value));
      if(node.children[0]) args = args.concat(this.execute(node.children[0]));
      return args;
    
    default:
      throw new Error('Unrecognised token: ', node);
  }
  
  return 0;
};