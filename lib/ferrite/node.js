/*** NODE ***/

function Node(type, val, children) {
  var node = this;
  
  this.type = type;
  this.value = val;
  this.children = [];
  
  if(children) {
    children.forEach(function(child) {
      node.children.push(child);
    });
  }
}

/*** TOKENS ***/

var NODE_OP     = 0;

var NODE_ACT    = 1;

var NODE_EXPR   = 2;

var NODE_NUM    = 3;

var NODE_STR    = 4;

var NODE_VAR    = 5;
var NODE_IDENT  = 6;

var NODE_FUNC   = 7;
var NODE_PARAM  = 8;

var NODE_CALL   = 9;
var NODE_ARG    = 10;


var OP_NONE     = -100;
var OP_ASSIGN   = 100;

var OP_EQU      = 101;
var OP_NEQ      = 102;
var OP_GRT      = 103;
var OP_LOT      = 104;
var OP_GRE      = 105;
var OP_LOE      = 106;
var OP_ADD      = 107;
var OP_SUB      = 108;
var OP_DIV      = 109;
var OP_MUL      = 110;
var OP_NEG      = 111;

var OP_CRY      = 112;
var OP_DEBUG    = 113;
var OP_RET      = 114;
var OP_IFELSE   = 115;