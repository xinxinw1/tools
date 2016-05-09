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

QUnit.assert.true = function (a){
  this.same(a, true);
}

QUnit.assert.false = function (a){
  this.same(a, false);
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
