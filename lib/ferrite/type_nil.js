// Nil \\
function Nil() { this.nil = 0; }

Nil.prototype.dump = function() {
  return 'nil';
};

Nil.prototype.gc = function() {};