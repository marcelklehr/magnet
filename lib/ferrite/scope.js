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
  GenericObject.prototype.gc.call(this, marked);
  if(this.parent) this.parent.gc(marked);
  if(this.precursor) this.precursor.gc(marked);
};

Scope.prototype.getPropertyPointer = function(identifier) {
  if(identifier == 'nil') return 0;
  if(this.properties[identifier]) return this.properties[identifier];
  if(this.parent) return this.parent.getPropertyPointer(identifier);
  return 0;
};

Scope.prototype.setPropertyPointer = function(identifier, addr, recursive_call) {
  if(identifier == 'nil') throw new Error('Can\'t assign to nil keyword');
  if(this.parent && !this.properties[identifier] && this.parent.properties[identifier]) return this.parent.setPropertyPointer(identifier, addr, 'recursive');
  return this.properties[identifier] = addr;
};

Scope.prototype.execute = function execute( node ) {
  this.env.debug('Scope.execute ', node.type, node.value);
  if( !node )
    return 0;
		
  switch( node.type )
  {
    /*** PRIMAL TYPES ***/
    
    case NODE_BOOL:
      return Primal.Boolean(this.env, node.value);
    
    case NODE_INT:
      return Primal.Integer(this.env, node.value);
    
    case NODE_FLOAT:
      return Primal.Float(this.env, node.value);
    
    case NODE_STR:
      return Primal.String(this.env, node.value);
    
    
    case NODE_OBJ:
      var props = (node.value) ? this.execute(node.value) : [];
      var obj = this.env.resolve(Primal.Object(this.env));
      props.forEach(function(p) {
        obj.setPropertyPointer(p.property, p.pointer);
      });
      return obj.addr;
    
    case NODE_PROPDEF:
      var props = [];
      props.push({
        property:this.execute(node.value), 
        pointer: this.execute(node.children[0])
      });
      if(node.children[1]) props = props.concat(this.execute(node.children[1]));
      return props;
    
    
    case NODE_LIST:
      var list = (node.value) ? this.execute(node.value) : [];
      return Primal.List(this.env, list);
    
    /*** BASICS ***/
    
    case NODE_ACT:
      var actions = [node.value];
      if(node.children[0]) {
        actions = actions.concat(this.execute(node.children[0]));
      }
      return actions;
    
    case NODE_EXPR:
      return this.execute( node.value );
    
    /*** VARIABLE/PROPERTY ACCESS ***/
    
    case NODE_VAR:
      var variable = this.execute(node.value);
      this.env.debug('\tNODE_VAR: <object>.'+variable.property+' : '+this.env.resolve(variable.object).getPropertyPointer(variable.property));
      return this.env.resolve(variable.object).getPropertyPointer(variable.property);
    
    case NODE_PROP:
      var object = (node.value) ? this.execute(node.value) : this.env.set(this); // either: property access | single var (will be converted to prop access of `this.scope`)
      var prop = this.execute(node.children[0]);
      return {object: object, property: prop};
    
    case NODE_IDENT:
      if(node.value.type == NODE_EXPR) {
        var ident = this.env.cast('string', this.env.resolve(this.execute(node.value))).getVal();
      }else{
        var ident = node.value;
      }
      return ident;
    
    /*** Operators ***/
    
    case NODE_OP:
      switch( node.value )
      {
        case OP_NONE:
          break;
        
        case OP_PUTS:
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
          this.env.resolve(variable.object).setPropertyPointer( variable.property, addr );
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
          return obj.callMethod('*', [this.env.set(Primal.Integer(this.env, -1))], this);
      }
      break;
    
    /*** FUNCTIONS ***/
    
    case NODE_FUNC:
      var params = (node.children[0]) ? this.execute(node.children[0]) : [];
      return Primal.Function(this.env, this, this.execute(node.value), params);// env, inheritScope, code, params
      
    case NODE_PARAM:
      var params = [];
      params.push(node.value);
      if(node.children[0]) params = params.concat(this.execute(node.children[0]));
      return params;
    
    case NODE_CALL:
      var identifier = (node.value.type == NODE_VAR) ? this.execute(node.value.value).property : '<Closure>';
      var func =       this.env.resolve(this.execute(node.value));
      var args =       (node.children[0]) ? this.execute(node.children[0]) : [];
      var thisvar =    (node.value.type === NODE_VAR) ? this.execute(node.value.value).object : this.env.set(this);
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