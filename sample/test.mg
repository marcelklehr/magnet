/* COMMENTS WORK?
 *** 
/* /* ///*/ /**/


/**
 * Our print implementation
 */
print = { val ::
  puts val
};

/**
 * Strings
 */
puts 'Strings work! \r\n'
puts "Both string literals work! \r\n"


/**
 * Assigniments
 */
str = 'Variable assigning works.'
puts str

a = b = 'Assignment chaining works'
puts a


/**
 * Scopes and functions
 */
 
 
print2 = { val ::
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
      puts text
    }
  } 
}()()()


/**
 * Control structs
 */

i = 42
if i == 42 {
  puts 'IF clauses work.'
}

if i != 42 {
  puts 'IF-ELSE does NOT work!?'
} else {
  puts 'IF-ELSE clauses work.'
}

if i != 42 {
  puts 'will not be called'
} else if i != 42 {
  puts 'ELSEIF does NOT work!?'
} else {
  puts 'ELSEIF works.'
}

if true {
  puts 'Native booleans ala true work.'
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
  puts 'Lists work.'
}

/**
 * Our own while implementation
 */

while = { expr body ::
  if expr() {
    body()
    while(expr, body)
  }
  return
}

i = 0
while({i < 10}, {
  i = i + 1
});

if i == 10 {
  puts 'While implementation works.'
}

/**
 * Advanced features
 */


5.times({puts '5 times'}) // should display '5 times' five times

'Hello'.split().each({char :: puts char})

puts "5+5=#{ 5+5 }"
puts "5*5=#{ 5*5 }"
puts "5/5=#{ 5/5 }"
puts "(5+5)/5=#{ (5+5)/5 }"

test = "#{5} times"
puts '"\#{5} times" = #{ test }'

/* crazycccc should be a regular function */
crazy = {'hello'}.copy()
crazyccccc = crazy.call.call.call.call.call
debug