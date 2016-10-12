var udf = $.udf;

QUnit.assert.same = function (act, exp, messcfn, mess){
  var cfn = $.udf;
  if ($.fnp(messcfn))cfn = messcfn;
  else mess = messcfn;
  if ($.udfp(cfn))cfn = $.is;
  if ($.udfp(mess))mess = "comparing " + $.dspSimp(act) + " with " + $.dspSimp(exp) + " using " + $.dspSimp(cfn);
  this.pushResult({
    result: cfn(act, exp),
    actual: act,
    expected: exp,
    message: mess
  });
};

QUnit.assert.diff = function (act, notexp, messcfn, mess){
  var cfn = $.udf;
  if ($.fnp(messcfn))cfn = messcfn;
  else mess = messcfn;
  if ($.udfp(cfn))cfn = $.is;
  if ($.udfp(mess))mess = "diffing comparing " + $.dspSimp(act) + " with " + $.dspSimp(exp) + " using " + $.dspSimp(cfn);
  this.pushResult({
    result: !cfn(act, notexp),
    actual: act,
    expected: notexp,
    message: mess,
    negative: true
  });
};

QUnit.assert.iso = function (act, exp, mess){
  this.same(act, exp, $.iso, mess);
}

QUnit.assert.leveliso = function (act, exp, n, mess){
  this.same(act, exp, $.levelison(n), mess);
}

QUnit.assert.true = function (a, m){
  this.same(a, true, m);
}

QUnit.assert.false = function (a, m){
  this.same(a, false, m);
}

QUnit.assert.type = function (a, t, m){
  this.same(L.typ(a), t, m);
}

QUnit.assert.data = function (a, d, m){
  this.same(L.dat(a), d, m);
}

QUnit.assert.samewpre = function (pre, arr, cfn){
  $.chkeven(arr);
  for (var i = 0; i < arr.length; i += 2){
    this.same(pre(arr[i]), arr[i+1], cfn);
  }
}

QUnit.assert.diffwpre = function (pre, arr, cfn){
  $.chkeven(arr);
  for (var i = 0; i < arr.length; i += 2){
    this.diff(pre(arr[i]), arr[i+1], cfn);
  }
}

QUnit.assert.truewpre = function (pre, arr){
  for (var i = 0; i < arr.length; i++){
    this.true(pre(arr[i]));
  }
}

QUnit.assert.falsewpre = function (pre, arr){
  for (var i = 0; i < arr.length; i++){
    this.false(pre(arr[i]));
  }
}

QUnit.assert.allsame = function (arr, cfn){
  this.samewpre($.self, arr, cfn);
}

QUnit.assert.alldiff = function (arr, cfn){
  this.diffwpre($.self, arr, cfn);
}

QUnit.assert.testspd = function (fn, s){
  this.same($.tim1(fn), s, $.le, 'testing speed less than or equal to ' + s);
};

function genRandHash(total, randfn){
  var arr = {};
  for (var i = 1; i <= total; i++){
    var num = randfn();
    if (arr[num] === undefined)arr[num] = 1;
    else arr[num]++;
  }
  return arr;
}

QUnit.assert.testWithin = function (a, x, maxerr, mess){
  var err = Math.abs((a-x)/x*100);
  this.true(err <= maxerr, mess + ": " + err + " < " + maxerr);
}

QUnit.assert.testRangeWithin = function (obj, x, maxerr){
  for (var i in obj){
    this.testWithin(obj[i], x, maxerr, "check percentErr for " + i);
  }
}

QUnit.assert.testRandHash = function (values, entries, maxerr, fn){
  if (fn === undefined)fn = $.randBit;
  var expectedEntriesInEach = entries/values;
  var obj = genRandHash(entries, fn);
  this.testRangeWithin(obj, expectedEntriesInEach, maxerr);
  $.out(obj);
}

QUnit.assert.testRandHashRange = function (start, end, numentries, maxerr, randfn){
  if (randfn === undefined)randfn = $.rand;
  this.testRandHash(end-start+1, numentries, maxerr, function (){
    return randfn(start, end);
  });
}
