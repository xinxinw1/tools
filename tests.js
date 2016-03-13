
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

