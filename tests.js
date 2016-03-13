
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
  assert.same(c.getavg(), udf);
  c.add(5);
  assert.same(c.getavg(), 5);
  c.add(4);
  assert.same(c.getavg(), 4.5);
  c.add(3);
  assert.same(c.getavg(), 4);
  c.reset();
  assert.same(c.getavg(), udf);
  c.add(5);
  assert.same(c.getavg(), 5);
  c.add(4);
  assert.same(c.getavg(), 4.5);
  c.add(3);
  assert.same(c.getavg(), 4);
});

QUnit.test("everyn", function (assert){
  var a = 1;
  
  var f = function (){
    a++;
  };
  
  var v = $.everyn(3, f);
  
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
  
  var a = 1;
  
  var v = $.everyn(0, f);
  
  assert.same(a, 1);
  v.check();
  assert.same(a, 2);
  v.check();
  assert.same(a, 3);
});
