/* COMMENTS WORK?
 *** 
/* /* ///*/ /**/


/**
 * Our print implementation
 */
print =  { val :
  cry val
};

/**
 * Strings
 */
cry 'Strings work! \r\n'
cry "Both string literals work! \r\n"


/**
 * Assigniments
 */
str = 'Variable assigning works.'
cry str

a = b = 'Assignment chaining works'
cry a


/**
 * Scopes and functions
 */
 
 
print2 = { val:
  print(val)
}

print2('Scope inheritance works.')


func = {
  return 'Function return values work.'
  print('should not be visible')
}

print( func() );


{ 
  text = 'Closures and Call chaining works.'
  return { 
    return {
      cry text
    }
  } 
}()()()


/**
 * Control structs
 */

i = 42
if i == 42 {
  cry 'IF clauses work.'
}

if i != 42 {
  cry 'will not be called'
} else {
  cry 'IF-ELSE clauses work.'
}

if true {
  cry 'Native booleans ala true work.'
}


/**
 * Lists
 */

list = 1,2,3,4,5,6,7,8,9
shifted = list.shift()
poped = list.pop()
list.unshift(shifted)
list.push(poped)
if list.#(0) == 1 && list.#(8) == 9 {
  cry 'lists work'
}

/**
 * Our own while implementation
 */

while = { expr body :
  if expr() {
    body()
    while(expr, body)
  }
}

i = 0
while({i < 10}, {
  i = i + 1
});

if i == 10 {
  cry 'While implementation works.'
}

/**
 * Advanced features
 */


5.times({cry '5 times'}) // should display '5 times' five times

'Hello'.split().each({char: cry char})


fork = 'Hello'.fork()
fork.#("+") = {"G'Day"}
cry fork          // should output "Hello"
cry fork+" World" // should output "G'Day"

cry "5+5="+(5+5)
cry "5*5="+(5*5)
cry "5/5="+(5/5)
cry "(5+5)/5="+((5+5)/5)

test = 5+" times"
cry '5+" times" = '+test

/* crazycccc should be a regular function */
crazy = {'hello'}.copy()
crazyccccc = crazy.call.call.call.call.call
debug