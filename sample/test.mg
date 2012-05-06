print =  { val :
  cry val
};

cry 'Strings work! \r\n'
cry "Both string literals work! \r\n"


str = 'Variable assigning works.'
cry str



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




a = b = 'Assignment chaining works'
print(a)

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

cry '--Advanced Features--'

5.each({cry '5 times'})

'Hello'.each({char: cry char})

fork = 'Hello'.fork()
fork.#("+") = {"G'Day"}
cry fork
cry fork+" World"


crazy = {'hello'}.copy()
crazyccccc = crazy.call.call.call.call.call
debug