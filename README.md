# Javascript Tools

This is a huge set of tools functions for doing common tasks like getting the length of an item, getting a slice of an item, replacing x with y in a, etc. This module works in both web js and Node.js.

## How to use in HTML

1. Go to https://github.com/xinxinw1/tools/releases and download the zip of the latest release.
2. Extract `tools.js` to your project directory.
3. Add `<script src="tools.js"></script>` to your html file.
4. Run `$.al("Hello World! | Array: $1 | String: $2 | Object: $3", [1, 2, 3], "hey", {a: 3, b: "test", c: [3, 4, 5]});` to make sure it works.

See http://xinxinw1.github.io/tools/ for a demo.

## How to use in Node.js

1. Go to https://github.com/xinxinw1/tools/releases and download the zip of the latest release.
2. Extract `tools.js` to your project directory.
3. Run `$ = require("./tools.js")` in node
4. Run `$.prn("Hello World! | Array: $1 | String: $2 | Object: $3", [1, 2, 3], "hey", {a: 3, b: "test", c: [3, 4, 5]});` to make sure it works.

## Run tests

1. `npm install`
2. `grunt`

OR

1. `node-qunit-phantomjs index.html`

## Function reference

```
Note: This is an incomplete reference, so some functions exist, but aren't documented yet

Note 2: These are all accessed by $.<insert name>

win               window
doc               window.document
inf               Infinity

### Type

cls(a)            Object.prototype.toString.call(a);
typ(a)            a short type name for a

### Predicates

nump(a)           is a a number, 
strp(a)             string,
arrp(a)             array,
irrp(a)             immutable array,
fnp(a)              function,
objp(a)             object,
rgxp(a)             regex,
bolp(a)             boolean,
trup(a)             true,
falp(a)             false,
htmp(a)             an html element,
docp(a)             an html document,
winp(a)             an html window,
txtp(a)             an html text node,
errp(a)             a $.Err object
udfp(a)             undefined,
nulp(a)             or null

### Comparison

is(a, b)          a === b;
iso(a, b)         is(a, b) or a and b have the same elements
inp(a, ...x)      is a one of x

### Dynamic vars

sta(a, x, f)      a = [x, a]; f(); a = a[1]; dynamically stack x onto a

### Display

dsp(a)            formats a for printing

### Output

out(a)            console.log(a);
prn(a, ...args)   out(apl(stf, arguments)); (see below for apl and stf)
alr(a)            win.alert(a);
al(a, ...args)    alr(apl(stf, arguments));
echo(a)           doc.write(a)
echol(a)          doc.writeln(a)

### Converters

num(a)            Number(a)
tint(a, rdx)      converts a to an int using radix rdx (default 10)
tflt(a)           parseFloat(a)
str(...a)         joins arguments into a string
tarr(a)           converts a to an array
tfn(a)            makes a function that tests whether the input is === a
tobj(a)           converts a to an object
htm(a)            converts a to an html element

### Sequence

#### Items

ref(a, i)         get the ith element of a
ref(a, ...args)   run ref(a, i) on each element of args
fst(a)            get first element of a
las(a)            get last element of a

#### Apply

apl(f, a)         f.apply(this, a);
map(x, a)         map function x over a
pos(x, a, n)      get the position of x in a starting at n (n = 0 by default)
pol(x, a, n)      pos starting from end of a
has(x, a)         does a have x in it?
mny(x, a)         does a have more than 1 x in it?
all(x, a)         each item in a is x?
keep(x, a)        copy a with non x's removed
rem(x, a)         copy a with x removed (cut)
remf(x, a)        copy a with x removed from front of a
rpl(x, y, a)      copy a with x replaced with y
mat(x, a)         get the first match of function or regex x in a
mats(x, a)        get all the matches of function or regex x in a
cnt(x, a)         count the number of times x occurs in a

#### Whole

len(a)            get length of a
emp(a)            is a empty
cpy(a)            copy a
cln(a)            deep copy
rev(a)            copy a with items reversed

#### Parts

sli(a, n, m)      get slice of a from n (inclusive)
                    to m (not inclusive)
fstn(n, a)        first n items in a
lasn(n, a)        last n
rstn(n, a)        sli(a, n)
rst(a)            sli(a, 1)
butn(n, a)        get all except for the last n items
but(a)            butn(1, a)

#### Group

spl(a, x)         split a by x
grp(a, n)         group a into groups of n
tup(...a)         generalized pair

#### Join

joi(a, x)         join array a into a string with x between 
                    every two elements (default x = "")
fla(a, x)         flattens the 2 (or more) d array a with x
                    between every two elements
fla(a)            flattens the 2 (or more) d array
app(...a)         appends all its arguments together
nof(n, a)         append a to itself n times

#### Fold / Reduce

fold(f, x, a)     fold(function (a, x){return a+x;}, 0, [1, 2, 3])
                  -> (((0+1)+2)+3)
fold(f, a)        fold(function (a, x){return a+x;}, [1, 2, 3])
                  -> ((1+2)+3)
foldr(f, x, a)    foldr(function (x, a){return x+a;}, 0, [1, 2, 3])
                  -> (1+(2+(3+0)))
foldr(f, a)       analogous to fold(f, a)

#### Array

hea(a, x)         copy array a with length+1 and make the first
                    element x
tai(a, x)         copy with length+1 and set last element to x

### Imperative

A number of modifying versions of the functional functions earlier
See source code for details

#### Array

psh(x, a)         a.push(x)
pop(a)            a.pop()
ush(x, a)         a.unshift(x)
shf(a)            a.shift()

#### Other

att(x, a)         attach x to a; add elements of x to end of a

### Object and alist

keys(a)           get keys of object a
vals(a)           get vals of object a
okey(a)           Object.getOwnPropertyNames(a)
oval(a)           get values using okey(a)

aref(a, x)        get item x from association list a
aset(a, x, y)     set x to y in alist a
adel(a, x)        delete x from alist a

ohas(a, x)        a.hasOwnProperty(x)
oput(a, x, y)     a[x] = y
orem(a, x)        delete a[x] and return old a[x]

oref(a, x)        get x in a; if a[0] is an object, looks there recursively
oset(a, x, y)     set x to y in a; if x isn't in a, recursively set x in a[0]
osetp(a, x)       oref(a, x) !== udf
odel(a, x)        shadow a[x] with undefined; return old a[x]
oren(a, x, y)     rename x to y in a

### String

low(a)            a.toLowerCase()
upp(a)            a.toUpperCase()
stf(a, ...args)   string fill; replaces every occurence of "$1" with 
                    dsp() of the 1st item in args and similarly for 
                    the rest of the args

### Function

sig(a)            get the "signature" of function a; $.sig($.sig) -> "sig(a)"
prms(a)           get parameters of function a; $.prms($.map) -> ["x", "a"]

### List

A few simple Lisp functions to implement $.sta()
See source code for details

### DOM

$(a)              doc.getElementById(a)
elm(a, o, ...c)   make html element with tag name a, attributes o, and
                    children c
txt(a)            doc.createTextNode(a)
top(a)            scroll to the top of a
bot(a)            scroll to the bottom of a

### File

rea(a)            gets the contents of the file a as a string
lns(a)            gets the lines of the file a as an array
wri(x, a)         writes x to a

### Regex

cap(x, a)         return first capturing group from finding x in a
caps(x, a)        return all capturing groups

### Time

tim()             get current time in milliseconds after unix epoch

### Speed tests

spd(a, b, n)      alert the time it takes to run a n times and to run b n times

### Debug

cnts(a)           count the number of times each element in a occurs

### Error

err(f, a, ...x)   returns an error formatted with stf(a, ...x)

### Other

rnd(min, max)     random number from min to max inclusive
do1(...a)         return the 1st argument after running the rest
exit()            exit Node.js
```
