variable = 10

def hello():
    print("Hello World!")

import os

class A:
    def __init__(self, foo):
        self.foo = foo

class B(A):
    def __init__(self, foo):
        super(foo)

    def increment(self, n):
        return n + 1

test = B('foo')
test2 = B(5)
test3 = B(55)

test2.increment(2)

if __name__ == "__main__":
    hello()
