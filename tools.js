/***** Tools *****/

(function (udf){
  var nodep = typeof process !== "undefined" && cls(process) === '[object process]';
  var webp = !nodep;
  
  if (!nodep){
    var win = window;
    var doc = win.document;
    var glob = win;
  } else {
    var fs = require('fs');
    var glob = global;
  }
  
  var inf = Infinity;
  
  ////// Polyfills //////
  
  Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" && 
      isFinite(value) && 
      Math.floor(value) === value;
  };
  
  ////// Type //////
  
  function cls(a){
    return Object.prototype.toString.call(a);
  }
  
  //// Predicates ////
  
  function nump(a){
    return cls(a) === "[object Number]";
  }
  
  function strp(a){
    return typeof a === "string";
  }
  
  function arrp(a){
    var c = Object.prototype.toString.call(a);
    return c === "[object Array]" ||
           c === "[object Arguments]" ||
           c === "[object HTMLCollection]" ||
           c === "[object NodeList]" ||
           c === "[object NamedNodeMap]" || 
           c === "[object MozNamedAttrMap]";
  }
  
  function arrp_(a){
    return Object.prototype.toString.call(a) === "[object Array]";
  }
  
  function irrp(a){
    var c = cls(a);
    return c === "[object Arguments]" ||
           c === "[object HTMLCollection]" ||
           c === "[object NodeList]" ||
           c === "[object NamedNodeMap]" || 
           c === "[object MozNamedAttrMap]";
  }
  
  function fnp(a){
    return cls(a) === "[object Function]";
  }
  
  function objp(a){
    return cls(a) === "[object Object]";
  }
  
  function rgxp(a){
    return a instanceof RegExp;
  }
  
  function bolp(a){
    return cls(a) === "[object Boolean]";
  }
  
  function trup(a){
    return a === true;
  }
  
  function falp(a){
    return a === false;
  }
  
  function htmp(a){
    return webp && a instanceof Node;
  }
  
  function docp(a){
    return cls(a) === "[object HTMLDocument]";
  }
  
  function winp(a){
    return webp && a instanceof Window;
  }
  
  function txtp(a){
    return cls(a) === "[object Text]";
  }
  
  function errp(a){
    return a instanceof Err;
  }
  
  function udfp(a){
    return a === udf;
  }
  
  function nulp(a){
    return a === null;
  }
  
  ////// Comparison //////
  
  function is(a, b){
    return a === b;
  }
  
  function isn(a, b){
    return a !== b;
  }
  
  function iso(a, b, f){
    if (udfp(f))f = is;
    if (is(a, b))return true;
    if (arrp(a) && arrp(b))return isoArr(a, b, f);
    if (objp(a) && objp(b))return isoObj(a, b, f);
    if (rgxp(a) && rgxp(b))return isoRgx(a, b, f);
    return false;
  }
  
  function deepiso(a, b){
    return iso(a, b, deepiso);
  }
  
  // n = 0: is(a, b)
  // n = 1: iso(a, b)
  function leveliso(a, b, n){
    if (n === 0)return is(a, b);
    return iso(a, b, levelison(n-1));
  }
  
  function levelison(n){
    return function (a, b){
      return leveliso(a, b, n);
    };
  }
  
  function isoArr(a, b, f){
    if (udfp(f))f = is;
    if (len(a) != len(b))return false;
    for (var i = 0; i < len(a); i++){
      if (!f(a[i], b[i]))return false;
    }
    return true;
  }
  
  function isoObj(a, b, f){
    if (udfp(f))f = is;
    for (var i in a){
      if (!f(a[i], b[i]))return false;
    }
    for (var i in b){
      if (!f(a[i], b[i]))return false;
    }
    return true;
  }
  
  function isoRgx(a, b){
    return is(a.source, b.source) &&
           is(a.global, b.global) &&
           is(a.ignoreCase, b.ignoreCase) &&
           is(a.multiline, b.multiline);
  }
  
  // can't be has(a, sli(arguments, 1)); due to recursive deps
  function inp(a){
    var x = arguments;
    // can't be len(x) due to arrp -> irrp -> inp -> len -> arrp
    for (var i = 1; i < x.length; i++){
      if (x[i] === a)return true;
    }
    return false;
  }
  
  ////// Display //////
  
  function dsp(a, dspFn, dspSta){
    if (udfp(dspFn))dspFn = dsp;
    if (udfp(dspSta))dspSta = nil();
    return sta(dspSta, a, function (){
      return dsp1(a, dspFn, dspSta);
    });
  }
  
  function dsp1(a, dsp, dspSta){
    if (tagp(a))return dspTag(a, dsp, dspSta);
    return dspSimp1(a, dsp, dspSta);
  }
  
  function dspSimp(a, dsp, dspSta){
    if (udfp(dsp))dsp = dspSimp;
    if (udfp(dspSta))dspSta = nil();
    return sta(dspSta, a, function (){
      return dspSimp1(a, dsp, dspSta);
    });
  }
  
  function dspSimp1(a, dsp, dspSta){
    if (udfp(a))return "udf";
    if (nulp(a))return "null";
    if (arrp(a) || irrp(a)){
      if (inPrevDsp(a, dspSta))return "[...]";
      return "[" + joi(map(function (a){return dsp(a, dsp, dspSta);}, a), ", ") + "]";
    }
    if (strp(a))return dspStr(a);
    if (fnp(a))return sig(a);
    if (objp(a)){
      if (inPrevDsp(a, dspSta))return "{...}";
      return dspObj(a, dsp, dspSta);
    }
    if (winp(a))return "win";
    if (docp(a))return "doc";
    if (htmp(a)){
      if (txtp(a))return "<txt " + dsp(a.data, dsp, dspSta) + ">";
      if (!udfp(a.tagName)){
        var s = "<" + low(a.tagName);
        var t = atrs(a);
        if (!emp(t))s += " " + dsp(t, dsp, dspSta);
        s += fold(function (s, x){
          return s + " " + dsp(x, dsp, dspSta);
        }, "", a);
        s += ">";
        return s;
      }
    }
    return dmp(a);
  }
  
  // (var to (map [+ "\\" _] #["\\", "\"", "n", "r", "t", "b", "f"]))
  function dspStr(a){
    if (JSON.stringify){
      return JSON.stringify(a);
    } else {
      var fr = ["\\", "\"", "\n", "\r", "\t", "\b", "\f"];
      var to = ["\\\\", "\\\"", "\\n", "\\r", "\\t", "\\b", "\\f"];
      return "\"" + rpl(fr, to, a) + "\"";
    }
  }
  
  // can't use fold because dspObj is used on fns and arrs too
  function dspObj(a, dsp, dspSta){
    var r = [];
    for (var i in a){
      push(i + ": " + dsp(a[i], dsp, dspSta), r);
    }
    return "{" + joi(r, ", ") + "}";
  }
  
  var dspfns = {};
  function setDspFn(t, f){
    dspfns[t] = f;
  }
  
  function inPrevDsp(a, dspSta){
    return hasLis(a, cdr(dspSta));
  }
  
  function dspTag(a, dsp, dspSta){
    var f = dspfns[a.type];
    if (udfp(f))return dspSimp1(a, dsp, dspSta);
    return f(a, dsp, dspSta);
  }
  
  function dmp(a){
    return String(a);
  }
  
  ////// Lisp Type //////
  
  function typ(a){
    return a.type;
  }
  
  function tag(a, x, y){
    return a[x] = y;
  }
  
  function rep(a, x){
    return a[x];
  }
  
  // untag
  function utag(a, x){
    var r = a[x];
    delete a[x];
    return r;
  }
  
  function dat(a){
    return a.data;
  }
  
  function sdat(a, x){
    return a.data = x;
  }
  
  //// Builders ////
  
  function mk(t, o){
    if (udfp(o))return {type: t};
    return app(o, {type: t});
  }
  
  function mkdat(t, d, o){
    if (udfp(o))return {type: t, data: d};
    return app(o, {type: t, data: d});
  }
  
  function mkbui(t){
    return function (a){
      return mkdat(t, a);
    };
  }
  
  //// Predicates ////
  
  function isa(t, a){
    return a.type === t;
  }
  
  function isany(t){
    var a = arguments;
    for (var i = 1; i < a.length; i++){
      if (isa(t, a[i]))return true;
    }
    return false;
  }
  
  function typin(a){
    var tp = typ(a);
    var t = arguments;
    for (var i = 1; i < t.length; i++){
      if (tp === t[i])return true;
    }
    return false;
  }
  
  // return isa(t, a);
  function mkpre(t){
    return function (a){
      return a.type === t;
    };
  }
  
  // !!a to deal with null and undefined inputs
  function tagp(a){
    return !!a && a.type !== udf;
  }
  
  ////// Lists //////
  
  function cons(a, b){
    return {type: "lis", car: a, cdr: b};
  }
  
  function nil(){
    return {type: "nil"};
  }
  
  function car(a){
    return (a.car === udf)?nil():a.car;
  }
  
  function cdr(a){
    return (a.cdr === udf)?nil():a.cdr;
  }
  
  function scar(a, x){
    return a.car = x;
  }
  
  function scdr(a, x){
    return a.cdr = x;
  }
  
  function lis(){
    var a = arguments;
    var r = nil();
    for (var i = a.length-1; i >= 0; i--){
      r = cons(a[i], r);
    }
    return r;
  }
  
  function lisd(){
    var a = arguments;
    if (a.length === 0)return nil();
    var r = a[a.length-1];
    for (var i = a.length-2; i >= 0; i--){
      r = cons(a[i], r);
    }
    return r;
  }
  
  //// cxr ////
  
  function caar(a){
    return car(car(a));
  }
  
  function cadr(a){
    return car(cdr(a));
  }
  
  function cdar(a){
    return cdr(car(a));
  }
  
  function cddr(a){
    return cdr(cdr(a));
  }
  
  //// Simplified Lisp Functions ////
  
  function pushLis(x, a){
    switch (typ(a)){
      case "nil":
        tag(a, "type", "lis");
        tag(a, "car", x);
        tag(a, "cdr", nil());
        return a;
      case "lis":
        scdr(a, cons(car(a), cdr(a)));
        scar(a, x);
        return a;
    }
    err(pushLis, "Can't push x = $1 onto a = $2", x, a);
  }
  
  function popLis(a){
    switch (typ(a)){
      case "nil": return nil();
      case "lis":
        var x = car(a);
        if (nilp(cdr(a))){
          tag(a, "type", "nil");
          utag(a, "car");
          utag(a, "cdr");
        } else {
          scar(a, cadr(a));
          scdr(a, cddr(a));
        }
        return x;
    }
    err(popLis, "Can't pop from a = $1", a);
  }
  
  function isLis(a, b){
    return a === b || nilp(a) && nilp(b);
  }
  
  function jbnLis(a){
    if (fnp(a))return a;
    return function (x){
      return isLis(x, a);
    };
  }
  
  function hasLis(x, a){
    return hasLisFn(jbnLis(x), a);
  }
  
  function hasLisFn(x, a){
    if (nilp(a))return false;
    if (x(car(a)))return a;
    return hasLisFn(x, cdr(a));
  }
  
  //// Predicates ////
  
  var nilp = mkpre("nil");
  var lisp = mkpre("lis");
  
  function atmp(a){
    return !lisp(a);
  }
  
  //// Display Fn ////
  
  setDspFn("nil", function (a){
    return "nil";
  });
  
  setDspFn("lis", dspLis);
  
  function dspLis(a, dsp, dspSta){
    if (inPrevDsp(a, dspSta))return "(...)";
    return "(" + dspLisInner(a, dsp, dspSta) + ")";
  }
  
  function dspLisInner(a, dsp, dspSta, dspLisSta){
    if (udfp(dspLisSta))dspLisSta = nil();
    return sta(dspLisSta, a, function (){
      return dspLisInner1(a, dsp, dspSta, dspLisSta);
    });
  }
  
  // dlis1( '(1 2 3 4 . 5) ) -> "1 2 3 4 . 5"
  function dspLisInner1(a, dsp, dspSta, dspLisSta){
    if (inPrevDsp(a, dspLisSta))return ". (...)";
    if (nilp(cdr(a)))return dsp(car(a), dsp, dspSta);
    if (atmp(cdr(a)))return dsp(car(a), dsp, dspSta) + " . " + dsp(cdr(a), dsp, dspSta);
    return dsp(car(a), dsp, dspSta) + " " + dspLisInner(cdr(a), dsp, dspSta, dspLisSta);
  }
  
  ////// Dynamic vars //////
  
  function sta(a, x, f){
    pushLis(x, a);
    try {
      return f();
    } finally {
      popLis(a);
    }
  }
  
  ////// Output //////
  
  function ou(a){
    if (udfp(a))a = "";
    console.log(a);
  }
  
  function out(){
    ou(apl(stf, arguments));
  }
  
  function alr(a){
    if (udfp(a))a = "";
    win.alert(a);
  }
  
  function al(){
    alr(apl(stf, arguments));
  }
  
  function echo(a){
    if (udfp(a))a = "";
    doc.write(a);
  }
  
  function echol(a){
    if (udfp(a))a = "";
    doc.writeln(a);
  }
  
  ////// Converters //////
  
  function num(a){
    return Number(a);
  }
  
  function tint(a, rdx){
    return parseInt(a, udfp(rdx)?10:rdx);
  }
  
  function tflt(a){
    return parseFloat(a);
  }
  
  function str(){
    return joi(arguments);
  }
  
  function str1(a){
    if (strp(a))return a;
    return dsp(a);
  }
  
  function tarr(a){
    if (arrp(a))return a;
    if (strp(a)){
      var r = [];
      for (var i = 0; i < a.length; i++)r.push(a[i]);
      return r;
    }
    if (objp(a))return foldi(function (r, x, i){
      return push([i, x], r);
    }, [], a);
    err(tarr, "Can't coerce a = $1 to arr", a);
  }
  
  function tfn(a, f){
    if (fnp(a))return a;
    return tfna(a, f);
  }
  
  function tfna(a, f){
    if (f === udf)return function (x){
      return x === a;
    };
    return function (x){
      return f(x, a);
    };
  }
  
  function tobj(a, o){
    if (udfp(o))o = {};
    if (objp(a))return app(a, o);
    if (arrp(a))return fold(function (o, x){
      if (!arrp(x))err(tobj, "Can't coerce a = $1 to obj", a);
      o[prop(x[0])] = x[1];
      return o;
    }, o, a);
    if (strp(a)){
      var o2 = o;
      for (var i = 0; i < len(a); i++){
        o2[i] = a[i];
      }
      return o2;
    }
    err(tobj, "Can't coerce a = $1 to obj", a);
  }
  
  function prop(a){
    if (strp(a) || nump(a))return a;
    err(prop, "Invalid obj prop name a = $1", a);
  }
  
  function htm(a){
    if (htmp(a))return a;
    if (strp(a))return txt(a);
    if (arrp(a))return apl(elm, a);
    if (udfp(a))return txt("");
    return htm(dsp(a));
  }
  
  ////// Sequence //////
  
  //// Items ////
  
  function ref(a){
    return fold(ref1, a, sli(arguments, 1));
  }
  
  function ref1(a, n){
    if (htmp(a))return ref1(kids(a), n);
    return a[n];
  }
  
  function rel(a, n){
    return ref(a, len(a)-1-n);
  }
  
  function set(a, n, x){
    if (htmp(a))return a.replaceChild(x, ref1(a, n));
    return a[n] = x;
  }
  
  function ins(a, n, x){
    if (arrp(a)){
      a.splice(n, 0, x);
      return a;
    }
    if (objp(a)){
      a[n] = x;
      return a;
    }
    if (htmp(a)){
      var b = ref(a, n);
      if (udfp(b))return att(a, x);
      a.insertBefore(x, b);
      return a;
    }
    err(ins, "Can't insert x = $1 into a = $2 at n = $3", x, a, n);
  }
  
  function del(a, n){
    if (arrp(a))return a.splice(n, 1)[0];
    if (objp(a)){
      var t = a[n];
      delete a[n];
      return t;
    }
    if (htmp(a))return a.removeChild(ref(a, n));
    err(del, "Can't delete item n = $1 from a = $2", n, a);
  }
  
  function fst(a){
    if (htmp(a))return a.firstChild;
    if (objp(a)){
      for (var i in a){
        return a[i];
      }
      return udf;
    }
    return a[0];
  }
  
  function fst_(a){
    return a[0];
  }
  
  function las(a){
    if (htmp(a))return a.lastChild;
    return a[len_(a)-1];
  }
  
  function las_(a){
    return a[a.length-1];
  }
  
  //// Apply ////
  
  function apl(f, a){
    return f.apply(this, a);
  }
  
  function map(x, a){
    // (fold #[push (f %2) %1] [] a)
    if (arrp(a))return mapArr(x, a);
    if (objp(a)){
      var f = tfn(x);
      return foldi(function (o, a, i){
        o[i] = f(a);
        return o;
      }, {}, a);
    }
    err(map, "Can't map x = $1 over a = $2", x, a);
  }
  
  function mapArr(x, a){
    return mapArrFn(tfn(x), a);
  }
  
  function mapArrFn(f, a){
    var r = [];
    for (var i = 0; i < a.length; i++)r.push(f(a[i]));
    return r;
  }
  
  // mapapp(x, a)
  
  function pos(x, a, n){
    if (arrp(a))return posArr(x, a, n);
    if (strp(a))return posStr(x, a, n);
    if (objp(a)){
      var f = tfn(x);
      for (var i in a){
        if (f(a[i]))return i;
      }
      return -1;
    }
    if (htmp(a))return pos(x, kids(a), n);
    err(pos, "Can't get pos of x = $1 in a = $2 from n = $3", x, a, n);
  }
  
  function posArr(x, a, n){
    if (udfp(n))n = 0;
    var f = tfn(x);
    for (var i = n; i < len(a); i++){
      if (f(a[i]))return i;
    }
    return -1;
  }
  
  function posStr(x, a, n){
    if (strp(x))return posStrStr(x, a, n);
    if (rgxp(x))return posStrRgx(x, a, n);
    if (arrp(x))return posStrArr(x, a, n);
    err(posStr, "Can't get pos of x = $1 in str a = $2 from n = $3", x, a, n);
  }
  
  function posStrStr(x, a, n){
    return a.indexOf(x, n);
  }
  
  function posStrRgx(x, a, n){
    if (udfp(n))n = 0;
    var p = ((n === 0)?a:sliStr(a, n)).search(x);
    if (p == -1)return p;
    return p+n;
  }
  
  function posStrArr(x, a, n){
    return fold(function (m, i){
      var curr = pos(i, a, n);
      if (curr == -1)return m;
      if (m == -1)return curr;
      return Math.min(m, curr);
    }, -1, x);
  }
  
  function pol(x, a, n){
    if (udfp(n))n = len(a);
    if (arrp(a)){
      var f = tfn(x);
      for (var i = n; i >= 0; i--){
        if (f(a[i]))return i;
      }
      return -1;
    }
    if (strp(a)){
      if (strp(x))return a.lastIndexOf(x, n);
      if (arrp(x))return fold(function (m, i){
        var curr = pol(i, a, n);
        if (curr == -1)return m;
        if (m == -1)return curr;
        return Math.max(m, curr);
      }, -1, x);
    }
    if (htmp(a))return pol(x, kids(a), n);
    err(pol, "Can't get last pos of x = $1 in a = $2 from n = $3", x, a, n);
  }
  
  function pss(x, a){
    if (arrp(a)){
      var f = tfn(x);
      return foldi(function (r, a, i){
        if (f(a))return push(i, r);
        return r;
      }, [], a);
    }
    if (strp(a)){
      if (arrp(x)){
        var r = []; var curr;
        for (var i = 0; i < len(a); i++){
          for (var k = 0; k < len(x); k++){
            curr = x[k];
            for (var v = 0; true; v++){
              if (i+v == len(a) || v == len(curr)){
                push(i, r);
                break;
              }
              if (a[i+v] !== curr[v])break;
            }
          }
        }
        return r;
      }
      if (strp(x)){
        var r = [];
        for (var i = 0; i < len(a); i++){
          for (var v = 0; true; v++){
            if (i+v == len(a) || v == len(x)){
              push(i, r);
              break;
            }
            if (a[i+v] !== x[v])break;
          }
        }
        return r;
      }
    }
    if (objp(a)){
      var f = tfn(x);
      var r = [];
      for (var i in a){
        if (f(a[i]))push(i, r);
      }
      return r;
    }
    if (htmp(a))return pss(x, kids(a));
    err(pss, "Can't get poses of x = $1 in a = $2", x, a);
  }
  
  function has(x, a){
    if (strp(a)){
      if (strp(x) || arrp(x) || rgxp(x))return pos(x, a) != -1;
      err(has, "Can't find if str a = $1 has x = $2", a, x);
    }
    if (arrp(a)){
      var f = tfn(x);
      for (var i = 0; i < a.length; i++){
        if (f(a[i]))return true;
      }
      return false;
    }
    if (objp(a)){
      var f = tfn(x);
      for (var i in a){
        if (f(a[i]))return true;
      }
      return false;
    }
    if (htmp(a))return has(x, kids(a));
    err(has, "Can't find if a = $1 has x = $2", a, x);
  }
  
  function mny(x, a){
    if (strp(a)){
      if (strp(x) || arrp(x) || rgxp(x))return len(pss(x, a)) > 1;
      err(mny, "Can't find if str a = $1 has many x = $2", a, x);
    }
    if (arrp(a)){
      var f = tfn(x);
      var fnd = false;
      for (var i = 0; i < len(a); i++){
        if (f(a[i])){
          if (fnd)return true;
          fnd = true;
        }
      }
      return false;
    }
    if (objp(a)){
      var f = tfn(x);
      var fnd = false;
      for (var i in a){
        if (f(a[i])){
          if (fnd)return true;
          fnd = true;
        }
      }
      return false;
    }
    if (htmp(a))return mny(x, kids(a));
    err(mny, "Can't find if a = $1 has many x = $2", a, x);
  }
  
  function all(x, a){
    if (arrp(a)){
      var f = tfn(x);
      for (var i = 0; i < len(a); i++){
        if (!f(a[i]))return false;
      }
      return true;
    }
    if (objp(a)){
      var f = tfn(x);
      for (var i in a){
        if (!f(a[i]))return false;
      }
      return true;
    }
    if (htmp(a))return all(x, kids(a));
    err(all, "Can't find if all a = $1 is x = $2", a, x);
  }
  
  function keep(x, a){
    if (arrp(a))return mats(tfn(x), a);
    if (objp(a)){
      var f = tfn(x);
      return foldi(function (o, a, i){
        if (f(a))o[i] = a;
        return o;
      }, {}, a);
    }
    err(keep, "Can't keep x = $1 in a = $2", x, a);
  }
  
  function rem(x, a){
    if (arrp(a)){
      var f = tfn(x);
      var r = [];
      for (var i = 0; i < a.length; i++){
        if (!f(a[i]))push(a[i], r);
      }
      return r;
      /*return fold(function (r, i){
        if (f(i))return r;
        return push(i, r);
      }, [], a);*/
    }
    if (strp(a))return rpl(x, "", a);
    if (objp(a)){
      var f = tfn(x);
      return foldi(function (o, a, i){
        if (!f(a))o[i] = a;
        return o;
      }, {}, a);
    }
    err(rem, "Can't rem x = $1 from a = $2", x, a);
  }
  
  // remdup(x, a)
  
  // remove from front
  function remf(x, a){
    if (arrp(a)){
      var f = tfn(x);
      for (var i = 0; i < len(a); i++){
        if (!f(a[i]))return sli(a, i);
      }
      return [];
    }
    if (strp(a)){
      if (strp(x)){
        var i = 0;
        while (i < len(a)){
          if (pos(x, a, i) == i){
            i += len(x);
          } else {
            return sli(a, i);
          }
        }
        return "";
      }
      if (arrp(x)){
        var i = 0; var k;
        while (i < len(a)){
          for (k = 0; k < len(x); k++){
            if (pos(x[k], a, i) == i){
              i += len(x[k]);
              break;
            }
          }
          if (k == len(x)){
            return sli(a, i);
          }
        }
        return "";
      }
    }
    err(remf, "Can't rem x = $1 from the beginning of a = $2", x, a);
  }
  
  function rpl(x, y, a){
    if (strp(a))return rplStr(x, y, a);
    if (arrp(a))return rplArr(x, y, a);
    if (objp(a))return rplObj(x, y, a);
    err(rpl, "Can't rpl x = $1 with y = $2 in a = $3", x, y, a);
  }
  
  function rplStr(x, y, a){
    if (strp(x))return rplStrStr(x, y, a);
    if (rgxp(x))return rplStrRgx(x, y, a);
    if (arrp(x))return rplStrArr(x, y, a);
    err(rplStr, "Can't rpl x = $1 with y = $2 in str a = $3", x, y, a);
  }
  
  function rplStrStr(x, y, a){
    // a.replace(x, y) only replaces first occurrence!
    var s = ""; var i = 0;
    while (i < a.length){
      if (posStrStr(x, a, i) == i){
        s += y;
        i += x.length;
      } else {
        s += a[i];
        i += 1;
      }
    }
    return s;
  }
  
  function rplStrRgx(x, y, a){
    return a.replace(x, y);
  }
  
  function rplStrArr(x, y, a){
    var s = ""; var i = 0; var k;
    while (i < a.length){
      for (k = 0; k < x.length; k++){
        if (posStr(x[k], a, i) == i){
          s += arrp(y)?y[k]:y;
          i += x[k].length;
          break;
        }
      }
      if (k == x.length){
        s += a[i];
        i += 1;
      }
    }
    return s;
  }
  
  function rplArr(x, y, a){
    var f = tfn(x);
    var r = [];
    for (var i = 0; i < a.length; i++){
      r.push(f(a[i])?y:a[i]);
    }
    return r;
  }
  
  function rplObj(x, y, a){
    var f = tfn(x);
    var o = {};
    for (var i in a){
      o[i] = f(a[i])?y:a[i];
    }
    return o;
  }
  
  function mat(x, a){
    if (strp(a)){
      var r = a.match(x);
      return nulp(r)?-1:r[0];
    }
    if (arrp(a)){
      for (var i = 0; i < len(a); i++){
        if (x(a[i]))return a[i];
      }
      return -1;
    }
    if (objp(a)){
      for (var i in a){
        if (x(a[i]))return a[i];
      }
      return -1;
    }
    err(mat, "Can't match x = $1 in a = $2", x, a);
  }
  
  function mats(x, a){
    if (strp(a)){
      var r = a.match(x);
      return nulp(r)?[]:r;
    }
    if (arrp(a))return fold(function (r, i){
      if (x(i))return push(i, r);
      return r;
    }, [], a);
    if (objp(a)){
      var r = [];
      for (var i in a){
        if (x(a[i]))push(a[i], r);
      }
      return r;
    }
    err(mats, "Can't get matches of x = $1 a = $2", x, a);
  }
  
  // fstf(f, a) == mat(f, a)
  // lasf(f, a)
  
  function cnt(x, a){
    if (arrp(a)){
      var f = tfn(x);
      var n = 0;
      for (var i = 0; i < len_(a); i++){
        if (f(a[i]))n++;
      }
      return n;
    }
    if (objp(a)){
      var f = tfn(x);
      var n = 0;
      for (var i in a){
        if (f(a[i]))n++;
      }
      return n;
    }
    err(cnt, "Can't count number of x = $1 in a = $2", x, a);
  }
  
  function best(f, a){
    var m = null;
    for (var i = 0; i < a.length; i++){
      if (m === null){
        m = a[i];
      } else {
        if (f(a[i], m))m = a[i];
      }
    }
    return m;
  }
  
  //// Whole ////
  
  function len(a){
    if (arrp(a) || strp(a) || fnp(a))return a.length;
    if (objp(a)){
      var n = 0;
      for (var k in a){
        if (a.hasOwnProperty(k))n++;
      }
      return n;
    }
    if (htmp(a))return len(kids(a));
    err(len, "Can't get len of a = $1", a);
  }
  
  function len_(a){
    return a.length;
  }
  
  function emp(a){
    if (arrp(a) || strp(a) || fnp(a))return a.length === 0;
    if (objp(a))return len(a) === 0;
    if (nulp(a) || udfp(a))return true;
    if (htmp(a))return !a.hasChildNodes();
    err(emp, "Can't find if a = $1 is empty", a);
  }
  
  function cpy(a){
    if (arrp(a))return cpyArr(a);
    if (objp(a))return cpyObj(a);
    if (htmp(a))return a.cloneNode(false);
    return a;
  }
  
  function cpyArr(a){
    var r = [];
    for (var i = 0; i < a.length; i++){
      r.push(a[i]);
    }
    return r;
  }
  
  function cpyObj(a){
    var o = {};
    for (var i in a){
      o[i] = a[i];
    }
    return o;
  }
  
  function cln(a){
    if (arrp(a) || objp(a))return map(cln, a);
    if (htmp(a))return a.cloneNode(true);
    return a;
  }
  
  function rev(a){
    if (arrp(a))return (irrp(a)?cpy(a):a).reverse();
    if (strp(a))return revStr(a);
    err(rev, "Can't reverse a = $1", a);
  }
  
  function revStr(a){
    var s = "";
    for (var i = a.length-1; i >= 0; i--){
      s += a[i];
    }
    return s;
  }
  
  //// Parts ////
  
  function sli(a, n, m){
    if (strp(a))return sliStr(a, n, m);
    if (arrp(a))return sliArr(a, n, m);
    if (htmp(a))return sli(kids(a), n, m);
    err(sli, "Can't slice a = $1 from n = $2 to m = $3", a, n, m);
  }
  
  function sliStr(a, n, m){
    if (n < 0)n = 0;
    if (!udfp(m) && m < n)m = n;
    return a.substring(n, m);
  }
  
  function sliArr(a, n, m){
    if (n < 0)n = 0;
    if (!udfp(m) && m < n)m = n;
    return (irrp(a)?cpy(a):a).slice(n, m);
  }
  
  function fstn(n, a){
    return sli(a, 0, n);
  }
  
  function lasn(n, a){
    return sli(a, len(a)-n);
  }
  
  function rstn(n, a){
    return sli(a, n);
  }
  
  function rst(a){
    return sli(a, 1);
  }
  
  // but last
  function butn(n, a){
    return sli(a, 0, len(a)-n);
  }
  
  function but(a){
    return butn(1, a);
  }
  
  function mid(a){
    return sli(a, 1, len(a)-1);
  }
  
  function bef(x, a){
    return sli(a, 0, pos(x, a));
  }
  
  function aft(x, a){
    return sli(a, pos(x, a)+1);
  }
  
  //// Group ////
  
  function spl(a, x){
    if (strp(a)){
      if (strp(x) || rgxp(x))return a.split(x);
    }
    if (arrp(a)){
      var f = tfn(x);
      var r = [];
      var last = 0;
      for (var i = 0; i < len(a); i++){
        if (f(a[i])){
          push(sli(a, last, i), r);
          last = i+1;
        }
      }
      return push(sli(a, last, len(a)), r);
    }
    err(spl, "Can't split a = $1 by x = $2", a, x);
  }
  
  // splbut(a, n)
  // splpos(a, i)
  // splbef(a, x)
  
  // (grp (x 3 y 4 z 5) 2) -> ((x 3) (y 4) (z 5))
  function grp(a, n){
    if (n > 0){
      var r = [];
      for (var i = 0; i < len(a); i += n){
        push(sli(a, i, i+n), r);
      }
      return r;
    }
    err(grp, "Can't grp a = $1 into grps of n = $2", a, n);
  }
  
  // grpovr(a, n)
  
  function tup(){
    var a = arguments;
    var r = [];
    if (len(a) > 0){
      var m = apl(Math.min, map(len, a));
      for (var i = 0; i < m; i++){
        push(map(function (x){
          return x[i];
        }, a), r);
      }
    }
    return r;
  }
  
  //// Join ////
  
  function joi(a, x){
    if (udfp(x))x = "";
    return map(str1, a).join(x);
  }
  
  function fla(a, x){
    if (udfp(x))return fold(app2, [], a);
    return fold(function (r, a){
      if (emp(r))return app(r, a);
      return app(r, x, a);
    }, [], a);
  }
  
  function app(){
    var a = arguments;
    if (len(a) == 0)return 0;
    return fold(app2, a);
  }
  
  function app2(a, b){
    if (strp(a))return a+(strp(b)?b:str1(b));
    if (arrp(a)){
      if (!arrp(b))return tail(a, b);
      return (irrp(a)?cpy(a):a).concat(b);
    }
    if (objp(a)){
      if (objp(b) || arrp(b)){
        var obj = {};
        for (var i in a){
          obj[i] = a[i];
        }
        for (var i in b){
          obj[i] = b[i];
        }
        return obj;
      }
    }
    err(app2, "Can't append a = $1 to b = $2", a, b);
  }
  
  function nof(n, a){
    if (strp(a))return nofStr(n, a);
    if (arrp(a))return nofArr(n, a);
    err(nof, "Can't make n = $1 of a = $2", n, a);
  }
  
  function nofStr(n, a){
    var s = "";
    for (var i = n; i >= 1; i--)s += a;
    return s;
  }
  
  function nofArr(n, a){
    var r = [];
    for (var i = n; i >= 1; i--)att(r, a);
    return r;
  }
  
  //// ??? ////
  
  function evry(a, n, m){
    if (udfp(m))m = 0;
    if (arrp(a)){
      var r = [];
      for (var i = m; i < len(a); i += n){
        push(a[i], r);
      }
      return r;
    }
    if (strp(a)){
      var s = "";
      for (var i = m; i < len(a); i += n){
        s += a[i];
      }
      return s;
    }
    err(evry, "Can't get every n = $1 of a = $2 starting at m = $3", n, a, m);
  }
  
  //// Fold / Reduce ////
  
  function fold(f, x, a){
    if (arguments.length >= 3){
      if (arrp(a)){
        var s = x;
        for (var i = 0; i < a.length; i++){
          s = f(s, a[i]);
        }
        return s;
      }
      if (objp(a)){
        var s = x;
        for (var i in a){
          s = f(s, a[i]);
        }
        return s;
      }
      if (htmp(a))return fold(f, x, kids(a));
      err(fold, "Can't fold a = $1 with f = $2 and x = $3", a, f, x);
    }
    // fold1
    // can't use fold because indexes would start at 0
    a = x;
    if (arrp(a)){
      if (a.length === 0)return [];
      var s = a[0];
      for (var i = 1; i < a.length; i++){
        s = f(s, a[i]);
      }
      return s;
    }
    err(fold, "Can't fold a = $1 with f = $2", a, f);
  }
  
  function foldi(f, x, a){
    if (arguments.length >= 3){
      if (arrp(a)){
        var s = x;
        for (var i = 0; i < len(a); i++){
          s = f(s, a[i], i);
        }
        return s;
      }
      if (objp(a)){
        var s = x;
        for (var i in a){
          s = f(s, a[i], i);
        }
        return s;
      }
      if (htmp(a))return foldi(f, x, kids(a));
      err(foldi, "Can't foldi a = $1 with f = $2 and x = $3", a, f, x);
    }
    // foldn1
    a = x;
    if (arrp(a)){
      if (emp(a))return [];
      var s = a[0];
      for (var i = 1; i < len(a); i++){
        s = f(s, a[i], i);
      }
      return s;
    }
    err(foldi, "Can't foldi a = $1 with f = $2", a, f);
  }
  
  function foldr(f, x, a){
    if (arguments.length >= 3){
      if (arrp(a)){
        var s = x;
        for (var i = a.length-1; i >= 0; i--){
          s = f(a[i], s);
        }
        return s;
      }
      if (htmp(a))return foldr(f, x, kids(a));
      err(foldr, "Can't foldr a = $1 with f = $2 and x = $3", a, f, x);
    }
    // foldr1
    // can't use fold because indexes would start at 0
    a = x;
    if (arrp(a)){
      if (emp(a))return [];
      var s = a[a.length-1];
      for (var i = a.length-2; i >= 0; i--){
        s = f(a[i], s);
      }
      return s;
    }
    err(foldr, "Can't foldr a = $1 with f = $2", a, f);
  }
  
  function foldri(f, x, a){
    if (arguments.length >= 3){
      if (arrp(a)){
        var s = x;
        for (var i = len(a)-1; i >= 0; i--){
          s = f(a[i], s, i);
        }
        return s;
      }
      if (htmp(a))return foldri(f, x, kids(a));
      err(foldri, "Can't foldri a = $1 with f = $2 and x = $3", a, f, x);
    }
    // foldn1
    a = x;
    if (arrp(a)){
      if (emp(a))return [];
      var s = a[len(a)-1];
      for (var i = len(a)-2; i >= 0; i--){
        s = f(a[i], s, i);
      }
      return s;
    }
    err(foldri, "Can't foldri a = $1 with f = $2", a, f);
  }
  
  //// Array ////
  
  function head(x, a){
    return ushf(x, cpy(a));
  }
  
  function tail(a, x){
    return push(x, cpy(a));
  }
  
  function arrd(){
    var r = but(arguments);
    return app(r, las(arguments));
  }
  
  //// Other ////
  
  // afta(a, x)
  // befa(a, x)
  // btwa(a, x)
  
  function beg(a){
    var ag = arguments;
    var l = ag.length;
    for (var i = 1; i < l; i++){
      if (beg1(a, ag[i]))return true;
    }
    return false;
  }
  
  function beg1(a, x){
    if (strp(a)){
      if (strp(x)){
        var lx = x.length;
        var la = a.length;
        if (lx > la)return false;
        for (var i = 0; i < lx; i++){
          if (a[i] !== x[i])return false;
        }
        return true;
      }
      return pos(x, a) == 0;
    }
    if (arrp(a) || htmp(a))return fst(a) === x;
    err(beg1, "Can't find if a = $1 begs with x = $2", a, x);
  }
  
  function end(a){
    var ag = arguments;
    var l = ag.length;
    for (var i = 1; i < l; i++){
      if (end1(a, ag[i]))return true;
    }
    return false;
  }
  
  function end1(a, x){
    if (strp(a)){
      if (strp(x)){
        var lx = x.length;
        var la = a.length;
        if (lx > la)return false;
        for (var i = la-1, j = lx-1; j >= 0; i--, j--){
          if (a[i] !== x[j])return false;
        }
        return true;
      }
      var c = pol(x, a);
      if (c !== -1 && c === la-lx)return true;
      return false;
    }
    if (arrp(a) || htmp(a))return las(a) === x;
    err(end1, "Can't find if a = $1 ends with x = $2", a, x);
  }
  
  function bnd(a, x, y){
    return beg1(a, x) && end1(a, y);
  }
  
  ////// Imperative //////
  
  //// Each ////
  
  function each(a, f){
    if (arrp(a)){
      for (var i = 0; i < len(a); i++){
        f(a[i], i);
      }
      return a;
    }
    if (objp(a)){
      for (var i in a){
        f(a[i], i);
      }
      return a;
    }
    if (htmp(a))return each(kids(a), f);
    err(each, "Can't loop through each in a = $1 with f = $2", a, f);
  }
  
  function mkeep(x, a){
    if (arrp(a) || htmp(a)){
      x = tfn(x);
      for (var i = 0; i < len(a); i++){
        if (!x(ref(a, i))){
          del(a, i);
          i--;
        }
      }
      return a;
    }
    if (objp(a)){
      x = tfn(x);
      for (var i in a){
        if (!x(a[i]))del(a, i);
      }
      return a;
    }
    err(mkeep, "Can't mkeep x = $1 in a = $2", x, a);
  }
  
  function mrem(x, a){
    if (arrp(a) || htmp(a)){
      x = tfn(x);
      for (var i = 0; i < len(a); i++){
        if (x(ref(a, i))){
          del(a, i);
          i--;
        }
      }
      return a;
    }
    if (objp(a)){
      x = tfn(x);
      for (var i in a){
        if (x(a[i]))del(a, i);
      }
      return a;
    }
    err(mrem, "Can't mrem x = $1 from a = $2", x, a);
  }
  
  function mrpl(x, y, a){
    if (arrp(a) || htmp(a)){
      x = tfn(x);
      for (var i = 0; i < len(a); i++){
        if (x(ref(a, i)))set(a, i, y);
      }
      return a;
    }
    if (objp(a)){
      x = tfn(x);
      for (var i in a){
        if (x(a[i]))set(a, i, y);
      }
      return a;
    }
    err(mrpl, "Can't mrpl x = $1 with y = $2 in a = $3", x, y, a);
  }
  
  //// Whole ////
  
  function mrev(a){
    if (arrp(a) || htmp(a)){
      var l = len(a);
      for (var i = 0; i < l; i++){
        ins(a, i, del(a, l-1));
      }
      return a;
    }
    err(mrev, "Can't mrev a = $1", a);
  }
  
  function clr(a){
    if (arrp(a) || htmp(a)){
      var l = len(a);
      for (var i = 0; i < l; i++)del(a, 0);
      return a;
    }
    if (objp(a)){
      for (var i in a){
        del(a, i);
      }
      return a;
    }
    err(clr, "Can't clr a = $1", a);
  }
  
  //// Array ////
  
  function push(x, a){
    //if (irrp(a))err(push, "Can't push x = $1 onto uarr a = $2", x, a);
    a.push(x);
    return a;
  }
  
  function pop(a){
    //if (irrp(a))err(pop, "Can't pop from uarr a = $1", a);
    return a.pop();
  }
  
  function ushf(x, a){
    //if (irrp(a))err(ushf, "Can't ushf x = $1 onto args a = $2", x, a);
    a.unshift(x);
    return a;
  }
  
  function shf(a){
    //if (irrp(a))err(shf, "Can't shf from args a = $1", a);
    return a.shift();
  }
  
  //// Other ////
  
  function att1(a, x){
    if (arrp(a)){
      man1(function (x){
        push(x, a);
      })(x);
      return;
    }
    if (objp(a) || fnp(a)){
      if (arrp(x)){
        att1(a, tobj(x));
        return;
      }
      if (objp(x) || fnp(x)){
        for (var i in x){
          a[i] = x[i];
        }
        return;
      }
    }
    if (htmp(a)){
      man1(function (x){
        a.appendChild(htm(x));
      })(x);
      return;
    }
    err(att1, "Can't attach x = $1 to a = $2", x, a);
  }
  
  function att(a){
    each(sli(arguments, 1), function (x){
      att1(a, x);
    });
  }
  
  function det1(a, x){
    if (htmp(a)){
      man1(function (x){
        a.removeChild(x);
      })(x);
      return;
    }
    err(det1, "Can't detach x = $1 from a = $2", x, a);
  }
  
  function det(a){
    each(sli(arguments, 1), function (x){
      det1(a, x);
    });
  }
  
  function loop(a, b, f){
    for (var i = a; i < b; i++){
      f(i);
    }
  }
  
  function repeat(n, f){
    loop(0, n, function (i){f()});
  }
  
  ////// Object and alist //////
  
  function keys(a){
    if (arrp(a))return map(function (x){
      if (!arrp(x))err(keys, "Can't get keyss of a = $1", a);
      return L.car(x);
    }, a);
    var r = [];
    for (var i in a){
      push(i, r);
    }
    return r;
  }
  
  function vals(a){
    if (arrp(a))return map(function (x){
      if (!arrp(x))err(vals, "Can't get valss of a = $1", a);
      return L.cdr(x);
    }, a);
    var r = [];
    for (var i in a){
      push(a[i], r);
    }
    return r;
  }
  
  function okey(a){
    return Object.getOwnPropertyNames(a);
  }
  
  function oval(a){
    return map(function (x){
      return a[x];
    }, okey(a));
  }
  
  function aref(a, x){
    for (var i = 0; i < len(a); i++){
      if (!arrp(a[i]))err(aref, "Can't aref x = $1 in a = $2", x, a);
      if (a[i][0] === x)return a[i][1];
    }
    return udf;
  }
  
  function aset(a, x, y){
    for (var i = 0; i < len(a); i++){
      if (!arrp(a[i]))err(aset, "Can't aset x = $1 in a = $2 to y = $3", x, a, y);
      if (a[i][0] === x)return a[i][1] = y;
    }
    push([x, y], a);
    return y;
  }
  
  function adel(a, x){
    for (var i = 0; i < len(a); i++){
      if (!arrp(a[i]))err(adel, "Can't adel x = $1 in a = $2", x, a);
      if (a[i][0] === x){
        var y = a[i][1];
        del(a, i);
        return y;
      }
    }
    return udf;
  }
  
  function ohas(a, x){
    return a.hasOwnProperty(x);
  }
  
  function oput(a, x, y){
    return a[x] = y;
  }
  
  function orem(a, x){
    var r = a[x];
    delete a[x];
    return r;
  }
  
  // in the functions here, a is a js obj with "scope extensions"
  //   the own props of a is the current scope
  //   a[0] is the scope above the current one
  //   and so on until a[0] is not set (ohas(a, 0) === false)
  //   a[1] is a readonly scope, that is checked
  //     when a[0] is not set
  //     this should be set in the bottom scope
  //   when an item is deleted with odel, it is actually overwritten
  //     with udf, which shadows previous definitions
  
  function oref(a, x){
    if (inp(x, 0, 1, "0", "1"))err(oref, "Can't get x = $1", x)
    if (ohas(a, x))return a[x];
    if (ohas(a, 0))return oref(a[0], x);
    if (ohas(a, 1))return oref(a[1], x);
    return udf;
  }
  
  function oset(a, x, y, top){
    if (top === udf)top = a;
    if (inp(x, 0, 1, "0", "1"))err(oset, "Can't set x = $1", x)
    if (ohas(a, x))return oput(a, x, y);
    if (ohas(a, 0))return oset(a[0], x, y, top);
    return oput(top, x, y);
  }
  
  function osetp(a, x){
    return oref(a, x) !== udf;
  }
  
  function odel(a, x){
    var r = oref(a, x);
    oput(a, x, udf);
    return r;
  }
  
  function oren(a, x, y){
    var r = oref(a, x);
    oput(a, y, r);
    odel(a, x);
    return r;
  }
  
  function getter(o, k, f){
    Object.defineProperty(o, k, {get: f});
  }
  
  function setter(o, k, f){
    Object.defineProperty(o, k, {set: f});
  }
  
  ////// String //////
  
  function low(a){
    return a.toLowerCase();
  }
  
  function upp(a){
    return a.toUpperCase();
  }
  
  function stf(a){ // string fill
    if (len(arguments) == 0)return "";
    if (strp(a))return foldi(function (s, x, i){
      return rpl("$" + i, dsp(x), s);
    }, arguments);
    return dsp(a);
  }
  
  ////// Number //////
  
  function lt(a, b){
    return a < b;
  }
  
  function le(a, b){
    return a <= b;
  }
  
  function gt(a, b){
    return a > b;
  }
  
  function ge(a, b){
    return a >= b;
  }
  
  function compare(cf, af){
    return function (a, b){
      return cf(af(a), af(b));
    };
  }
  
  function max(){
    return best(gt, arguments);
  }
  
  function min(){
    return best(lt, arguments);
  }
  
  function avgcol(){
    var avg = null;
    var n = 0;
    
    function add(a){
      if (avg === null)avg = a;
      else avg = n/(n+1)*avg + a/(n+1);
      n++;
    }
    
    function get(){
      return avg;
    }
    
    function reset(){
      avg = null;
      n = 0;
    }
    
    return {
      add: add,
      get: get,
      reset: reset
    };
  }
  
  function medcol(f){
    if (udfp(f))f = lt;
    
    var arr = [];
    
    function add(a){
      insort(f, a, arr);
    }
    
    function get(){
      if (arr.length === 0)return null;
      var n = (arr.length-1)/2;
      if (Number.isInteger(n))return arr[n];
      return (arr[n-0.5]+arr[n+0.5])/2;
    }
    
    function reset(){
      arr = [];
    }
    
    return {
      add: add,
      get: get,
      reset: reset
    };
  }
  
  function avgcoln(max){
    var arr = [];
    var avg = null;
    var n = 0;
    
    function add(a){
      if (n < max){
        if (avg === null)avg = a;
        else avg = n/(n+1)*avg + a/(n+1);
        n++;
      } else {
        var last = arr.shift();
        avg += (a-last)/n;
      }
      arr.push(a);
    }
    
    function get(){
      return avg;
    }
    
    function reset(){
      avg = null;
      n = 0;
      arr = [];
    }
    
    return {
      add: add,
      get: get,
      reset: reset,
      arr: arr
    };
  }
  
  function numBits(n){
    var i = 0;
    for (i = 0; n !== 0; i++){
      if (n % 2 == 0){
        n = n/2;
      } else {
        n = (n-1)/2;
      }
    }
    return i;
  }
  
  ////// Random //////
  
  function crandBitGen(){
    var maxBytes = 65536;
    var arrayBits = 16;
    var bitsPerByte = 8;
    
    var length = maxBytes/(arrayBits/bitsPerByte);
    var randArr = new Uint16Array(length);
    var randNum = 0;
    var bitsRemaining = 0;
    var i = length-1;
    
    function repopulate(){
      window.crypto.getRandomValues(randArr);
      i = -1;
      next();
    }
    
    function next(){
      i++;
      if (i == length){
        repopulate();
      } else {
        bitsRemaining = arrayBits;
        randNum = randArr[i];
      }
    }
    
    function get(){
      if (bitsRemaining == 0)next();
      //out(randNum);
      var bit = randNum & 1;
      randNum = randNum >>> 1;
      bitsRemaining--;
      return bit;
    }
    
    return {
      get: get
    };
  }
  
  var crandBitGenerator = crandBitGen();
  
  // result is 0 or 1
  function crandBit(){
    return crandBitGenerator.get();
  }
  
  // result is int in [0, 2^pow)
  function crandPowTwo(pow){
    var n = 0;
    for (var i = pow-1; i >= 0; i--){
      n = n*2 + crandBit();
    }
    return n;
  }
  
  // result is int in [0, max]
  function crandUpTo(max){
    var b = numBits(max);
    var n;
    do {
      n = crandPowTwo(b);
    } while (n > max);
    return n;
  }
  
  // result is int in [min, max]
  function crand(min, max){
    return min + crandUpTo(max-min);
  }
  
  // Math.random() gives float in [0, 1)
  // result is int in [0, max]
  function mrandUpTo(max){
    return Math.floor(Math.random()*(max+1));
  }
  
  // result is 0 or 1
  function mrandBit(){
    return mrandUpTo(1);
  }
  
  // result is int in [min, max]
  function mrand(min, max){
    return min + mrandUpTo(max-min);
  }
  
  // result is int in [min, max]
  function rand(min, max){
    if (window.crypto)return crand(min, max);
    return mrand(min, max);
  }
  
  // result is 0 or 1
  function randBit(){
    if (window.crypto)return crandBit();
    return mrandBit();
  }
  
  ////// Function //////
  
  function call(a){
    return apl(a, sliArr(arguments, 1));
  }
  
  function orig(f){
    if (!udfp(f.forig))return f.forig;
    return f;
  }
  
  function worig(forig, fnew){
    if (!udfp(forig.forig))forig = forig.forig;
    fnew.forig = forig;
    return fnew;
  }
  
  // function test(a, b, c) -> "test"
  function nam(a){
    a = orig(a);
    var n = cap(/function\s*([^\(]*)\(([^\)]*)\)/, dmp(a));
    return (n[0] == "")?"function":n;
  }
  
  // function test(a, b, c) -> "test(a, b, c)"
  function sig(a){
    a = orig(a);
    var n = cap(/function\s*([^\(]*\(([^\)]*)\))/, dmp(a));
    return (n[0] == "(")?"function" + n:n;
  }
  
  // http://stackoverflow.com/a/1357494
  // function test(a, b, c) -> ["a", "b", "c"]
  function prms(a){
    a = orig(a);
    var p = cap(/function[^\(]*\(([^\)]*)\)/, dmp(a));
    p = spl(p, /\s*,\s*/);
    return (p[0] == "")?[]:p;
  }
  
  // combine/compose
  function cmb(a, b){
    return worig(b, function (){
      return a(apl(b, arguments));
    });
  }
  
  function negf(a){
    return function (){
      return !apl(a, arguments);
    };
  }
  
  function man1(f){
    return function (a){
      var r = arrp(a)?a:arguments;
      each(r, f);
    };
  }
  
  function man2(f){
    return function (a, b){
      if (objp(a)){
        for (var i in a){
          f(i, a[i]);
        }
      } else {
        f(a, b);
      }
    };
  }
  
  function everyn(f, n){
    var curr = 1;
    
    function check(){
      if (curr >= n){
        f();
        curr = 1;
      } else {
        curr++;
      }
    }
    
    function setn(n2){
      n = n2;
    }
    
    function reset(){
      curr = 1;
    }
    
    return {
      check: check,
      setn: setn,
      reset: reset
    };
  }
  
  //// Memoization ////
  
  function mem(f){
    var m = {};
    
    function get(a){
      if (!udfp(m[a]))return m[a];
      return m[a] = f(a);
    }
    
    return get;
  }
  
  //// Range ////
  
  // build array of ints from a to b
  function range(a, b){
    var r = [];
    for (var i = a; i <= b; i++){
      r.push(i);
    }
    return r;
  }
  
  //// Sorting ////
  
  function insort(f, x, a){
    for (var i = 0; i < a.length; i++){
      if (!f(a[i], x)){
        ins(a, i, x);
        return;
      }
    }
    push(x, a);
  }
  
  function insortasc(x, a){
    insort(lt, x, a);
  }
  
  //// Reference ////
  
  function self(a){
    return a;
  }
  
  //// Gensym ////
  
  var gsn = 0;

  function gs(){
    return gsn++;
  }
  
  ////// DOM //////
  
  /* Note: these functions won't work in Node.js */
  
  function $(a){
    return doc.getElementById(a);
  }
  
  function elms(a){
    return doc.getElementsByTagName(a);
  }
  
  function elm(a, oc){
    var e = elm1(a);
    if (udfp(oc))return e;
    if (objp(oc)){
      satr(e, oc);
      att(e, sli(arguments, 2));
      return e;
    }
    att(e, sli(arguments, 1));
    return e;
  }
  
  function elm1(a){
    return doc.createElement(a);
  }
  
  function txt(a){
    return doc.createTextNode(a);
  }
  
  function atrs(a){
    var o = {};
    each(a.attributes, function (x){
      if (x.specified)o[x.name] = x.value;
    });
    each(keys(a), function (x){
      if (beg(x, "on") && !nulp(a[x]))o[x] = a[x];
    });
    return o;
  }
  
  function satr(a, x, y){
    man2(function (x, y){
      if (beg(x, "on"))a[x] = y;
      else a.setAttribute(x, y);
    })(x, y);
  }
  
  function ratr(a, x){
    man1(function (x){
      if (beg(x, "on"))a[x] = null;
      else a.removeAttribute(x);
    })(x);
  }
  
  function kids(a){
    return cpy(a.childNodes);
  }
  
  function cont(x){
    clr(x);
    att(x, sli(arguments, 1));
  }
  
  function top(a){
    a.scrollTop = 0;
  }
  
  function bot(a){
    a.scrollTop = a.scrollHeight;
  }
  
  function foc(a){
    a.focus();
  }
  
  function atth(a, x){
    a.innerHTML += x;
  }
  
  function seth(a, x){
    a.innerHTML = x;
    return a;
  }
  
  // var h = his($("test"));
  // h.add("hey");
  // $("test").value = "";
  function his(a){
    var hs = [];
    var p = 0;
    var tmp = "";
    
    function add(o){
      push(o, hs);
      p = len(hs);
    }
    
    function pre(){
      if (p > 0){
        if (p == len(hs))tmp = a.value;
        p--;
        a.value = hs[p];
      }
    }
    
    function nex(){
      if (p <= len(hs)-1){
        p++;
        a.value = (p == len(hs))?tmp:hs[p];
      }
    }
    
    a.onkeydown = function (e){
      var c = udfp(e.key)?e.keyCode:e.key;
      if (inp(c, "ArrowUp", "Up", 38)){
        pre();
        return false;
      }
      if (inp(c, "ArrowDown", "Down", 40)){
        nex();
        return false;
      }
      return true;
    };
    
    return {add: add};
  }
  
  function stysheet(){
    att(document.body, elm('style'));
    return las(document.styleSheets);
  }
  
  function sty(){
    var style = stysheet();
    var rules = style.cssRules?style.cssRules:style.rules;
    
    var n = 0;
    
    function push(rule){
      style.insertRule(rule, 0);
      n++;
    }
    
    function get(i){
      return rules[n-1-i];
    }
    
    function has(i){
      return !udfp(get(i));
    }
    
    function set(i, rule){
      if (has(i))del(i);
      ins(i, rule);
    }
    
    function ins(i, rule){
      style.insertRule(rule, n-i);
      n++;
    }
    
    function del(i){
      style.deleteRule(n-1-i);
      n--;
    }
    
    return {
      push: push,
      get: get,
      has: has,
      set: set,
      ins: ins,
      del: del,
      style: style,
      get length(){return n;}
    };
  }
  
  ////// File //////
  
  /* Note: these functions only work in Node.js */
  
  function rea(a){
    return fs.readFileSync(a, {encoding: "utf8"});
  }
  
  function lns(a){
    return spl(rea(a), /\n\r|\n|\r/g);
  }
  
  // todo: wri(["a", "b", "c"], a)
  function wri(x, a){
    return fs.writeFileSync(a, x);
  }
  
  ////// Regex //////
  
  // mat and mats in sequence apply section
  
  function cap(x, a){
    return x.exec(a)[1];
  }
  
  function caps(x, a){
    return slc(x.exec(a), 1);
  }
  
  ////// Time //////
  
  function currtim(){
    if (typeof performance != 'undefined'){
      return performance.now();
    }
    return (new Date()).getTime();
  }
  
  function tim1(f){
    var t1, t2;
    
    t1 = currtim();
    f();
    t2 = currtim();
    
    return t2-t1;
  }
  
  function tim(f){
    var args = sli(arguments, 1);
    return tim1(function (){f.apply(this, args)});
  }
  
  function ntim(n, f){
    var args = sli(arguments, 2);
    return tim(function (){for (var i = n; i >= 1; i--)f.apply(this, args)});
  }
  
  function calltim(f){
    var args = sli(arguments, 1);
    var t1, t2, ret;
    
    t1 = currtim();
    ret = f.apply(this, args);
    t2 = currtim();
    
    return [ret, t2-t1];
  }
  
  function calltim1(f){
    var t1, t2, ret;
    
    t1 = currtim();
    ret = f();
    t2 = currtim();
    
    return [ret, t2-t1];
  }
  
  function calltim(f){
    var args = sli(arguments, 1);
    return calltim1(function (){return f.apply(this, args)});
  }
  
  var JSMAXINT = 9007199254740991;
  // returns speed of exectution in ms/run
  function autotim1(f){
    var n = 1, t;
    while (true){
      t = ntim(n, f);
      if (t >= 1000)return t/n;
      if (t >= 100)n *= 2;
      else n *= 10;
      if (n > JSMAXINT)return t/n;
    }
  }
  
  function autotim(f){
    var args = sli(arguments, 1);
    return autotim1(function (){return f.apply(this, args)});
  }
  
  function spd(){
    return map(autotim1, arguments);
  }
  
  function timer(){
    var t1 = currtim();
    
    function time(){
      return currtim()-t1;
    }
    
    return {time: time};
  }
  
  function lat(f, n){
    if (udfp(n))n = 0;
    return setTimeout(f, n);
  }
  
  function itr(f, n){
    if (udfp(n))n = 0;
    return setInterval(f, n);
  }
  
  function stp(a){
    return clearTimeout(a);
  }
  
  function pau(t){
    var d = currtim();
    var c;
    do c = currtim();
    while (c-d < t);
  }
  
  ////// Checkers //////
  
  function chkeven(a){
    if (len(a) % 2 != 0)err(chkeven, "a = $1 must have even length", a);
  }
  
  ////// Debug //////
  
  // cnts([1, 2, 1, 3, 4, 5, 5, 6])
  // -> [[1, 2], [2, 1], [3, 1], [4, 1], [5, 2], [6, 1]]
  function cnts(a){
    var r = []; var found;
    for (var i = 0; i < a.length; i++){
      for (var j = 0; j < r.length; j++){
        if (r[j][0] === a[i]){
          r[j][1]++;
          found = true;
          break;
        }
      }
      if (!found)r.push([a[i], 1]);
      else found = false;
    }
    return r;
  }
  
  ////// Class /////
  
  // http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
  function mkclass(sup, con){
    con.prototype = Object.create(sup.prototype);
    con.prototype.constructor = con;
    return con;
  }
  
  function setstatic(cls, name, val){
    cls.prototype[name] = val;
  }
  
  function setmethod(cls, fn){
    cls.prototype[fn.name] = fn;
  }
  
  ////// Error //////
  
  function mkerr(con){
    var E = mkclass(Error, function E(){
      this.context = this.constructor;
      con.apply(this, arguments);
      setStack(this, this.context);
    });
    setstatic(E, 'name', con.name);
    setmethod(E, function toString(){
      return this.name + ": " + this.message;
    });
    return E;
  }
  
  function setStack(obj, fn){
    if (Error.captureStackTrace){
      Error.captureStackTrace(obj, fn);
    } else {
      var err = new Error();
      obj.stack = err.stack;
    }
  }
  
  function dspStack(e){
    if (Error.captureStackTrace){
      return e.stack;
    }
    return e.toString() + "\n" + e.stack;
  }
  
  Err = mkerr(function Error(fn, sig, text, data){
    if (udfp(data))data = {};
    if (!udfp(fn))this.context = fn;
    this.sig = sig;
    this.text = text;
    this.data = data;
    this.message = this.sig + ": " + this.text;
  });
  
  function err(f){
    throw new Err(err, sig(f), apl(stf, sli(arguments, 1)));
  }
  
  function errData(f, o){
    throw new Err(errData, sig(f), apl(stf, sli(arguments, 2)), o);
  }
  
  ////// Other //////
  
  function do1(){
    return arguments[0];
  }
  
  function exit(){
    return process.exit();
  }
  
  // global eval
  function evl(a){
    return (glob.execScript || function (a){
      return glob["eval"].call(glob, a);
    })(a);
  }
  
  function change(name){
    if (udfp(name))name = "T";
    win.$ = old$;
    win[name] = $;
  }
  
  ////// Object exposure //////
  
  att($, {
    webp: webp,
    nodep: nodep,
    udf: udf,
    win: webp?win:{},
    doc: webp?doc:{},
    glob: glob,
    inf: inf,
    
    cls: cls,
    typ: typ,
    
    nump: nump,
    strp: strp,
    arrp: arrp,
    arrp_: arrp_,
    irrp: irrp,
    fnp: fnp,
    objp: objp,
    rgxp: rgxp,
    bolp: bolp,
    trup: trup,
    falp: falp,
    htmp: htmp,
    docp: docp,
    winp: winp,
    txtp: txtp,
    errp: errp,
    udfp: udfp,
    nulp: nulp,
    
    is: is,
    isn: isn,
    iso: iso,
    deepiso: deepiso,
    leveliso: leveliso,
    levelison: levelison,
    isoArr: isoArr,
    isoObj: isoObj,
    isoRgx: isoRgx,
    
    inp: inp,
    
    dsp: dsp,
    dspSimp: dspSimp,
    dspStr: dspStr,
    dspObj: dspObj,
    setDspFn: setDspFn,
    inPrevDsp: inPrevDsp,
    dspTag: dspTag,
    dmp: dmp,
    
    typ: typ,
    tag: tag,
    rep: rep,
    utag: utag,
    dat: dat,
    sdat: sdat,
    
    mk: mk,
    mkdat: mkdat,
    mkbui: mkbui,
    
    isa: isa,
    isany: isany,
    typin: typin,
    mkpre: mkpre,
    tagp: tagp,
    
    car: car,
    cdr: cdr,
    cons: cons,
    nil: nil,
    scar: scar,
    scdr: scdr,
    lis: lis,
    lisd: lisd,
    
    caar: caar,
    cadr: cadr,
    cdar: cdar,
    cddr: cddr,
    
    nilp: nilp,
    lisp: lisp,
    atmp: atmp,
    
    sta: sta,
    
    dspLis: dspLis,
    
    ou: ou,
    out: out,
    alr: alr,
    al: al,
    echo: echo,
    echol: echol,
    
    num: num,
    tint: tint,
    tflt: tflt,
    str: str,
    tarr: tarr,
    tfn: tfn,
    tfna: tfna,
    tobj: tobj,
    htm: htm,
    
    ref: ref,
    rel: rel,
    set: set,
    ins: ins,
    del: del,
    fst: fst,
    fst_: fst_,
    las: las,
    las_: las_,
    
    apl: apl,
    map: map,
    mapArr: mapArr,
    mapArrFn: mapArrFn,
    pos: pos,
    posArr: posArr,
    posStr: posStr,
    posStrStr: posStrStr,
    posStrRgx: posStrRgx,
    posStrArr: posStrArr,
    pol: pol,
    pss: pss,
    has: has,
    mny: mny,
    all: all,
    keep: keep,
    rem: rem,
    remf: remf,
    rpl: rpl,
    rplStr: rplStr,
    rplStrStr: rplStrStr,
    rplStrRgx: rplStrRgx,
    rplStrArr: rplStrArr,
    rplArr: rplArr,
    rplObj: rplObj,
    mat: mat,
    mats: mats,
    cnt: cnt,
    best: best,
    
    len: len,
    len_: len_,
    emp: emp,
    cpy: cpy,
    cpyArr: cpyArr,
    cpyObj: cpyObj,
    cln: cln,
    rev: rev,
    revStr: revStr,
    
    sli: sli,
    sliStr: sliStr,
    sliArr: sliArr,
    fstn: fstn,
    lasn: lasn,
    rstn: rstn,
    rst: rst,
    butn: butn,
    but: but,
    mid: mid,
    bef: bef,
    aft: aft,
    
    spl: spl,
    grp: grp,
    tup: tup,
    
    joi: joi,
    fla: fla,
    app: app,
    app2: app2,
    nof: nof,
    nofStr: nofStr,
    nofArr: nofArr,
    
    evry: evry,
    
    fold: fold,
    foldi: foldi,
    foldr: foldr,
    foldri: foldri,
    
    head: head,
    tail: tail,
    arrd: arrd,
    
    beg: beg,
    end: end,
    bnd: bnd,
    
    each: each,
    mkeep: mkeep,
    mrem: mrem,
    mrpl: mrpl,
    
    mrev: mrev,
    clr: clr,
    
    push: push,
    pop: pop,
    ushf: ushf,
    shf: shf,
    
    att1: att1,
    att: att,
    det1: det1,
    det: det,
    
    loop: loop,
    repeat: repeat,
    
    keys: keys,
    vals: vals,
    okey: okey,
    oval: oval,
    aref: aref,
    aset: aset,
    adel: adel,
    ohas: ohas,
    oput: oput,
    orem: orem,
    oref: oref,
    oset: oset,
    osetp: osetp,
    odel: odel,
    oren: oren,
    getter: getter,
    setter: setter,
    
    low: low,
    upp: upp,
    stf: stf,
    
    lt: lt,
    le: le,
    gt: gt,
    ge: ge,
    compare: compare,
    max: max,
    min: min,
    avgcol: avgcol,
    medcol: medcol,
    avgcoln: avgcoln,
    numBits: numBits,
    
    crandBit: crandBit,
    crand: crand,
    mrand: mrand,
    mrandBit: mrandBit,
    rand: rand,
    randBit: randBit,
    
    call: call,
    orig: orig,
    worig: worig,
    nam: nam,
    sig: sig,
    prms: prms,
    cmb: cmb,
    negf: negf,
    man1: man1,
    man2: man2,
    everyn: everyn,
    
    mem: mem,
    
    range: range,
    
    insort: insort,
    insortasc: insortasc,
    
    self: self,
    
    gs: gs,
    
    elms: elms,
    elm: elm,
    txt: txt,
    atrs: atrs,
    satr: satr,
    ratr: ratr,
    kids: kids,
    cont: cont,
    top: top,
    bot: bot,
    foc: foc,
    atth: atth,
    seth: seth,
    his: his,
    sty: sty,
    
    rea: rea,
    lns: lns,
    wri: wri,
    
    cap: cap,
    caps: caps,
    
    currtim: currtim,
    tim1: tim1,
    tim: tim,
    ntim: ntim,
    calltim1: calltim1,
    calltim: calltim,
    autotim1: autotim1,
    autotim: autotim,
    spd: spd,
    timer: timer,
    lat: lat,
    itr: itr,
    stp: stp,
    pau: pau,
    
    chkeven: chkeven,
    
    cnts: cnts,
    
    mkclass: mkclass,
    setstatic: setstatic,
    setmethod: setmethod,
    
    mkerr: mkerr,
    setStack: setStack,
    dspStack: dspStack,
    
    Err: Err,
    err: err,
    errData: errData,
    
    do1: do1,
    exit: exit,
    evl: evl,
    change: change
  });
  
  if (webp){
    var old$ = win.$;
    win.$ = $;
  }
  
  if (nodep){
    module.exports = $;
  }
  
  ////// Testing //////
  
  
  
})();
