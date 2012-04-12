print =  { val:
  cry val;
};


// Scope Inheritance

print2 = { val:
  print(val);
};

print2('Scope inheritance works.');


// Return

func = {
  return 'Function return values work.';
  print('should not be visible');
};

print( func() );


// Call chaining

{ return { return {cry 'Call chaining works.'} } }()()();


// Assignment chaining

a = b = 'Assignment chaining works';
print(a);


// IF-ELSE clauses

i = 42;
if i == 42 {
  cry 'IF clauses work.'
};

if i != 42 {
  cry 'will not be called'
};
else {
  cry 'IF-ELSE clauses work.'
};

// WHILE IMPLEMENTATION

while = { expr body :
  if expr() {
    body();
    while(expr, body);
  };
};

i = 0;
while({return i < 10}, {
  i = i + 1;
});
if i == 10 cry 'While implementation works.';