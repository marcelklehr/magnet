print =  { val :
  cry val
};

// Strings

cry 'Strings work! \r\n';
cry "Both string literals work! \r\n";

// Variables
str = 'Variable assigning works.'
cry str
//str.each({ char :
//  cry char
//})

// Scope Inheritance
print2 = { val:
  print(val)
}

print2('Scope inheritance works.')


// Return

func = {
  return 'Function return values work.'
  print('should not be visible')
}

print( func() )


// Call chaining

{ return { {cry 'Closures and Call chaining works.'} } }()()()


// Comments

{//comment!![}]38'

// !"§$%&/()=?`²³{[]}\

  print('Comments work.')// { cry 'fooo' }(); cry 'This is a code comment! You shouldn't see this!'
}()

// Assignment chaining

a = b = 'Assignment chaining works'
print(a)

// IF-ELSE clauses

i = 42
if i == 42 {
  cry 'IF clauses work.'
}

if i != 42 {
  cry 'will not be called'
} else {
  cry 'IF-ELSE clauses work.'
}

// WHILE IMPLEMENTATION

while = { expr body :
  if expr() {
    body()
    while(expr, body)
  }
}

// if true {
  // cry 'Function calls for if-expressions work.'
// }

while({i < 10}, {
  i = i + 1;
})

if i == 10 {
  cry 'While implementation works.'
}
