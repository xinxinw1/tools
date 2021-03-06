
QUnit.test('Predicates', function (A){
  A.true($.nump(1));
  A.false($.nump("0"));
  
  A.true($.strp("hey"));
  A.false($.strp(0));
  
  A.true($.arrp([]));
  A.false($.arrp(0));
  
  A.true($.arrp_([]));
  
  A.false($.irrp([]));
  
  A.true($.fnp(function (){}));
  A.false($.fnp([]));
  
});

QUnit.test('Comparison', function (A){
  A.true($.is(0, 0));
  A.false($.is([], []));
  
  A.true($.isn(0, 1));
  
});


QUnit.test('leveliso', function (assert){
  var a = [1, 2, 3];
  var b = [1, 2, 3];
  assert.false($.leveliso(a, b, 0));
  assert.true($.leveliso(a, b, 1));
  assert.true($.leveliso(a, b, 2));
  
  var a = [[1], [2], [3]];
  var b = [[1], [2], [3]];
  assert.false($.leveliso(a, b, 0));
  assert.false($.leveliso(a, b, 1));
  assert.true($.leveliso(a, b, 2));
  assert.true($.leveliso(a, b, 3));
  
  var a = [[[1]], [[2]], [[2]]];
  var b = [[[1]], [[2]], [[2]]];
  assert.false($.leveliso(a, b, 0));
  assert.false($.leveliso(a, b, 1));
  assert.false($.leveliso(a, b, 2));
  assert.true($.leveliso(a, b, 3));
  assert.true($.leveliso(a, b, 4));
});

QUnit.test("best", function (assert){
  var f1 = function (a, b){return a.length > b.length;};
  var f2 = function (a, b){return a.length < b.length;};
  var a = ["a", "bdf", "efw", "a", "", "fwefwefew"];
  assert.same($.best(f1, a), "fwefwefew");
  assert.same($.best(f2, a), "");
  
  assert.same($.best(f1, []), null);
});


QUnit.test("max", function (assert){
  assert.same($.max(1, 2, 5, 3, 2), 5);
  assert.same($.max(1), 1);
  assert.same($.max(), null);
});

QUnit.test("avgcol", function (assert){
  var c = $.avgcol();
  assert.same(c.get(), null);
  c.add(5);
  assert.same(c.get(), 5);
  c.add(4);
  assert.same(c.get(), 4.5);
  c.add(3);
  assert.same(c.get(), 4);
  c.reset();
  assert.same(c.get(), null);
  c.add(5);
  assert.same(c.get(), 5);
  c.add(4);
  assert.same(c.get(), 4.5);
  c.add(3);
  assert.same(c.get(), 4);
});

QUnit.test("everyn", function (assert){
  var a = 1;
  
  var f = function (){
    a++;
  };
  
  var v = $.everyn(f, 3);
  
  assert.same(a, 1);
  v.check();
  assert.same(a, 1);
  v.check();
  assert.same(a, 1);
  v.check();
  assert.same(a, 2);
  v.check();
  assert.same(a, 2);
  v.check();
  assert.same(a, 2);
  v.check();
  assert.same(a, 3);
  v.check();
  assert.same(a, 3);
  v.reset();
  assert.same(a, 3);
  v.check();
  assert.same(a, 3);
  v.check();
  assert.same(a, 3);
  v.check();
  assert.same(a, 4);
  v.check();
  assert.same(a, 4);
  v.setn(2);
  v.check();
  assert.same(a, 5);
  v.check();
  assert.same(a, 5);
  v.check();
  assert.same(a, 6);
  
  var a = 1;
  
  var v = $.everyn(f, 0);
  
  assert.same(a, 1);
  v.check();
  assert.same(a, 2);
  v.check();
  assert.same(a, 3);
});

QUnit.test("mem", function (assert){
  var called = false;
  
  function func(a){
    called = true;
    return a + 2;
  }
  
  var mfunc = $.mem(func);
  
  called = false;
  assert.same(mfunc(3), 5);
  assert.true(called);
  
  called = false;
  assert.same(mfunc(3), 5);
  assert.false(called);
  
  called = false;
  assert.same(mfunc(4), 6);
  assert.true(called);
});

QUnit.test("insort", function (assert){
  var a, f;
  
  a = [];
  
  function getlength(a){return a.length;}
  
  f = $.compare($.gt, getlength);
  
  $.insort(f, "test", a);
  assert.same(a, ["test"], $.iso);
  $.insort(f, "abcd", a);
  assert.same(a, ["abcd", "test"], $.iso);
  $.insort(f, "a", a);
  assert.same(a, ["abcd", "test", "a"], $.iso);
  $.insort(f, "wefef", a);
  assert.same(a, ["wefef", "abcd", "test", "a"], $.iso);
  
  a = [];
  f = $.compare($.ge, getlength);
  
  $.insort(f, "test", a);
  assert.same(a, ["test"], $.iso);
  $.insort(f, "abcd", a);
  assert.same(a, ["test", "abcd"], $.iso);
  $.insort(f, "a", a);
  assert.same(a, ["test", "abcd", "a"], $.iso);
  $.insort(f, "wefef", a);
  assert.same(a, ["wefef", "test", "abcd", "a"], $.iso);
  
  a = [];
  $.insortasc(3, a);
  assert.same(a, [3], $.iso);
  $.insortasc(2, a);
  assert.same(a, [2, 3], $.iso);
  $.insortasc(3, a);
  assert.same(a, [2, 3, 3], $.iso);
  $.insortasc(5, a);
  assert.same(a, [2, 3, 3, 5], $.iso);
  $.insortasc(1, a);
  assert.same(a, [1, 2, 3, 3, 5], $.iso);
  
});

QUnit.test("medcol", function (assert){
  var c;
  
  c = $.medcol();
  assert.same(c.get(), null);
  c.add(2);
  assert.same(c.get(), 2);
  c.add(3);
  assert.same(c.get(), 2.5);
  c.add(3);
  assert.same(c.get(), 3);
  c.add(-5);
  assert.same(c.get(), 2.5);
  c.add(200);
  assert.same(c.get(), 3);
  
});

QUnit.test("numBits", function (assert){
  assert.same($.numBits(0), 0);
  assert.same($.numBits(1), 1);
  assert.same($.numBits(2), 2);
  assert.same($.numBits(3), 2);
  assert.same($.numBits(4), 3);
  assert.same($.numBits(5), 3);
  assert.same($.numBits(6), 3);
  assert.same($.numBits(7), 3);
  assert.same($.numBits(8), 4);
  assert.same($.numBits(4294967295), 32);
});


QUnit.test("crandBit", function (assert){
  assert.testRandHash(2, 100000, 1, $.crandBit);
});

QUnit.test("mrandBit", function (assert){
  assert.testRandHash(2, 100000, 1, $.mrandBit);
});

QUnit.test("mrand", function (assert){
  assert.testRandHashRange(0, 1, 10000, 5, $.mrand);
  assert.testRandHashRange(1, 100, 100000, 15, $.mrand);
  assert.testRandHashRange(1, 1000, 100000, 50, $.mrand);
  assert.testRandHashRange(1000000, 1000100, 100000, 15, $.mrand);
});

QUnit.test("crand", function (assert){
  assert.testRandHashRange(0, 1, 10000, 5, $.crand);
  assert.testRandHashRange(1, 100, 100000, 15, $.crand);
  assert.testRandHashRange(1, 1000, 100000, 50, $.crand);
  assert.testRandHashRange(1000000, 1000100, 100000, 15, $.crand);
});

QUnit.test("rand", function (assert){
  assert.testRandHashRange(0, 1, 10000, 5, $.rand);
});
