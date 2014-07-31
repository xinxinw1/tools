/***** Tools Devel *****/

(function (win, udef){
  var doc = win.document;
  var inf = Infinity;
  
  //// Type ////
  
  function gcls(a){
    return Object.prototype.toString.call(a);
  }
  
  function type(a){
    var tp = gcls(a);
    switch (tp){
      case "[object Object]": return "obj";
      case "[object String]": return "str";
      case "[object Number]": return "num";
      case "[object Array]": return "arr";
      case "[object Arguments]":
      case "[object HTMLCollection]":
      case "[object NodeList]": return "uarr";
      case "[object Function]": return "fn";
      case "[object Undefined]": return "undef";
      case "[object Boolean]": return "bool";
      case "[object RegExp]": return "rgx";
      case "[object Null]": return "null";
    }
    if (a instanceof Node)return "htm";
    return tp;
  }
  
  //// Predicates ////
  
  function objp(a){
    return gcls(a) == "[object Object]";
  }
  
  function strp(a){
    return gcls(a) == "[object String]";
  }
  
  function nump(a){
    return gcls(a) == "[object Number]";
  }
  
  function arrp(a){
    return gcls(a) == "[object Array]" || uarrp(a);
  }
  
  function uarrp(a){
    return inp(gcls(a), "[object Arguments]",
                        "[object HTMLCollection]",
                        "[object NodeList]");
  }
  
  function fnp(a){
    return gcls(a) == "[object Function]";
  }
  
  function rgxp(a){
    return gcls(a) == "[object RegExp]";
  }
  
  function htmp(a){
    return a instanceof Node;
  }
  
  function udefp(a){
    return a === udef;
  }
  
  function nullp(a){
    return a === null;
  }
  
  //// Comparison ////
  
  function is(a, b){
    return a === b;
  }
  
  function iso(a, b){
    if (is(a, b))return true;
    if (arrp(a) && arrp(b))return isoarr(a, b);
    if (rgxp(a) && rgxp(b))return isorgx(a, b);
    // todo: isoobj(a, b)
    return false;
  }
  
  function isoarr(a, b){
    if (len(a) != len(b))return false;
    for (var i = 0; i < len(a); i++){
      if (!is(a[i], b[i]))return false;
    }
    return true;
  }
  
  function isorgx(a, b){
    return is(a.source, b.source) &&
           is(a.global, b.global) &&
           is(a.ignoreCase, b.ignoreCase) &&
           is(a.multiline, b.multiline);
  }
  
  // can't be has(a, slc(arguments, 1)); due to recursive deps
  function inp(a){
    var x = arguments;
    // can't be len(x) due to arrp -> uarrp -> inp -> len -> arrp
    for (var i = 1; i < x.length; i++){
      if (x[i] === a)return true;
    }
    return false;
  }
  
  //// Dynamic vars ////
  
  function dyn(a, x, f){
    L.push(x, a);
    var r = f();
    L.pop(a);
    return r;
  }
  
  //// Display ////
  
  var items = [];
  function disp(a){
    return dyn(items, a, function (){
      return disp1(a);
    });
  }
  
  function disp1(a){
    if (arrp(a) || uarrp(a)){
      if (L.has(a, L.cdr(items)))return "[...]";
      return "[" + join(map(disp, a), ", ") + "]";
    }
    if (strp(a))return dispstr(a);
    if (fnp(a))return sig(a);
    if (objp(a)){
      if (L.has(a, L.cdr(items)))return "{...}";
      var r = [];
      for (var i in a){
        push(i + ": " + disp(a[i]), r);
      }
      return "{" + join(r, ", ") + "}";
    }
    return dump(a);
  }
  
  // (var to (map [+ "\\" _] #["\\", "\"", "n", "r", "t", "b", "f"]))
  function dispstr(a){
    var fr = ["\\", "\"", "\n", "\r", "\t", "\b", "\f"];
    var to = ["\\\\", "\\\"", "\\n", "\\r", "\\t", "\\b", "\\f"];
    return "\"" + rpl(fr, to, a) + "\"";
  }
  
  function dump(a){
    return String(a);
  }
  
  //// Output ////

  function ou(a){
    doc.write(a);
  }
  
  function out(a){
    doc.writeln(a);
  }
  
  function alert(a){
    win.alert(a);
  }
  
  function pr(a){
    ou(apply(strf, arguments));
  }
  
  function prn(a){
    out(apply(strf, arguments));
  }
  
  function al(a){
    alert(apply(strf, arguments));
  }
  
  //// Converters ////
  
  function num(a){
    return Number(a);
  }
  
  var tint = parseInt;
  var tflt = parseFloat;
  
  function str(){
    return join(arguments);
  }
  
  function str1(a){
    if (strp(a))return a;
    return disp(a);
  }
  
  function tarr(a){
    if (arrp(a))return a;
    if (strp(a))return reduc(function (r, x){
      return push(x, r);
    }, [], a);
    if (objp(a)){
      var r = [];
      for (var i in a){
        push([i, a[i]], r);
      }
      return r;
    }
    err(tarr, "Can't coerce a = $1 to arr", a);
  }
  
  function tobj(a){
    if (objp(a))return a;
    if (arrp(a))return reduc(function (o, x){
      if (!arrp(x))err(tobj, "Can't coerce a = $1 to obj", a);
      o[prop(x[0])] = x[1];
      return o;
    }, {}, a);
    if (strp(a)){
      var o = {};
      for (var i = 0; i < len(a); i++){
        o[i] = a[i];
      }
      return o;
    }
    err(tobj, "Can't coerce a = $1 to obj", a);
  }
  
  function prop(a){
    if (strp(a) || nump(a))return a;
    err(prop, "Invalid obj prop name a = $1", a);
  }
  
  //// Polymorphic ////
  
  function len(a){
    if (arrp(a) || strp(a) || fnp(a))return a.length;
    if (objp(a)){
      var n = 0;
      for (var k in a){
        if (a.hasOwnProperty(k))n++;
      }
      return n;
    }
    err(len, "Can't get len of a = $1", a);
  }
  
  function ref(a){
    return reduc(ref1, a, slc(arguments, 1));
  }
  
  function ref1(a, n){
    return a[n];
  }
  
  function set(a, n, x){
    return a[n] = x;
  }
  
  function pos(x, a, n){
    if (udefp(n))n = 0;
    if (arrp(a)){
      x = testfn(x);
      for (var i = n; i < len(a); i++){
        if (x(a[i]))return i;
      }
      return -1;
    }
    if (strp(a)){
      if (strp(x))return a.indexOf(x, n);
      if (rgxp(x))return a.search(x);
      if (arrp(x))return reduc(function (m, i){
        var curr = pos(i, a, n);
        if (curr == -1)return m;
        if (m == -1)return curr;
        return Math.min(m, curr);
      }, -1, x);
    }
    if (objp(a)){
      x = testfn(x);
      for (var i in a){
        if (x(a[i]))return i;
      }
      return -1;
    }
    err(pos, "Can't get pos of x = $1 in a = $2 from n = $3", x, a, n);
  }
  
  function posl(x, a, n){
    if (udefp(n))n = len(a);
    if (arrp(a)){
      x = testfn(x);
      for (var i = n; i >= 0; i--){
        if (x(a[i]))return i;
      }
      return -1;
    }
    if (strp(a)){
      if (strp(x))return a.lastIndexOf(x, n);
      if (arrp(x))return reduc(function (m, i){
        var curr = posl(i, a, n);
        if (curr == -1)return m;
        if (m == -1)return curr;
        return Math.max(m, curr);
      }, -1, x);
    }
    err(posl, "Can't get last pos of x = $1 in a = $2 from n = $3", x, a, n);
  }
  
  function rpl(x, y, a){
    if (strp(a)){
      // a.replace(x, y) only replaces first occurrence!
      if (strp(x)){
        var s = ""; var i = 0;
        while (i < len(a)){
          if (pos(x, a, i) == i){
            s += y;
            i += len(x);
          } else {
            s += a[i];
            i += 1;
          }
        }
        return s;
      }
      if (rgxp(x))return a.replace(x, y);
      if (arrp(x)){
        var s = ""; var i = 0; var k;
        while (i < len(a)){
          for (k = 0; k < len(x); k++){
            if (pos(x[k], a, i) == i){
              s += arrp(y)?y[k]:y;
              i += len(x[k]);
              break;
            }
          }
          if (k == len(x)){
            s += a[i];
            i += 1;
          }
        }
        return s;
      }
    }
    if (arrp(a))return reduc(function (r, i){
      return push(is(i, x)?y:i, r);
    }, [], a);
    if (objp(a))return reduc(function (o, a, i){
      return push([i, is(a, x)?y:a], o);
    }, {}, a);
    err(rpl, "Can't rpl x = $1 with y = $2 in a = $3", x, y, a);
  }
  
  function slc(a, n, m){
    if (udefp(m))m = len(a);
    if (n < 0)n = 0;
    if (m < 0)m = 0;
    if (n > len(a))n = len(a);
    if (m > len(a))m = len(a);
    if (n > m)m = n;
    if (strp(a))return a.substring(n, m);
    if (arrp(a))return (uarrp(a)?copy(a):a).slice(n, m);
    err(slc, "Can't slice a = $1 from n = $2 to m = $3", a, n, m);
  }
  
  function poss(x, a){
    if (arrp(a)){
      x = testfn(x);
      return reduc(function (r, a, i){
        if (x(a))return push(i, r);
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
      x = testfn(x);
      var r = [];
      for (var i in a){
        if (x(a[i]))push(i, r);
      }
      return r;
    }
    err(poss, "Can't get poses of x = $1 in a = $2", x, a);
  }
  
  function add(){
    var a = arguments;
    if (len(a) == 0)return 0;
    return reduc1(add2, a);
  }
  
  function add2(a, b){
    if (nump(a))return a+(nump(b)?b:tnum(b));
    if (strp(a))return a+(strp(b)?b:str1(b));
    if (arrp(a)){
      if (!arrp(b))return tail(a, b);
      return (uarrp(a)?copy(a):a).concat(b);
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
    if (fnp(a) && fnp(b)){
      return function (){
        return a(apply(b, arguments));
      };
    }
    err(add2, "Can't add a = $1 to b = $2", a, b);
  }
  
  function rev(a){
    if (arrp(a))return (uarrp(a)?copy(a):a).reverse();
    if (strp(a)){
      var s = "";
      for (var i = len(a)-1; i >= 0; i--){
        s += a[i];
      }
      return s;
    }
    err(rev, "Can't rev a = $1", a);
  }
  
  // (grp (x 3 y 4 z 5) 2) -> ((x 3) (y 4) (z 5))
  function grp(a, n){
    if (n == 0)err(grp, "Can't grp a = $1 into grps of n = $2", a, n);
    var r = [];
    for (var i = 0; i < len(a); i += n){
      push(slc(a, i, i+n), r);
    }
    return r;
  }
  
  function rem(x, a){
    if (arrp(a)){
      x = testfn(x);
      return reduc(function (r, i){
        if (x(i))return r;
        return push(i, r);
      }, [], a);
    }
    if (strp(a))return rpl(x, "", a);
    if (objp(a)){
      x = testfn(x);
      return reduc(function (o, a, i){
        if (x(a))return o;
        return push([i, a], o);
      }, {}, a);
    }
    err(rem, "Can't rem x = $1 from a = $2", x, a);
  }
  
  function copy(a){
    if (arrp(a) || objp(a))return map(self, a);
    return a;
  }
  
  function splt(a, x){
    if (strp(a)){
      if (strp(x) || rgxp(x))return a.split(x);
    }
    if (arrp(a)){
      var r = []
      var last = 0;
      for (var i = 0; i < len(a); i++){
        if (a[i] === x){
          push(slc(a, last, i), r);
          last = i+1;
        }
      }
      return push(slc(a, last, len(a)), r);
    }
    err(splt, "Can't split a = $1 by x = $2", a, x);
  }
  
  function apd(x, a){
    if (arrp(a)){
      if (arrp(x))return reduc(function (a, i){
        return push(i, a);
      }, a, x);
      return push(x, a);
    }
    if (objp(a) || fnp(a)){
      if (arrp(x))return apd(tobj(x), a);
      if (objp(x) || fnp(x)){
        for (var i in x){
          a[i] = x[i];
        }
        return a;
      }
    }
    err(apd, "Can't append x = $1 to a = $2", x, a);
  }
  
  function map(f, a){
    // (reduc #[push (f %2) %1] [] a)
    if (arrp(a))return reduc(function (r, i){
      return push(f(i), r);
    }, [], a);
    if (objp(a)){
      var o = {};
      for (var i in a){
        o[i] = f(a[i]);
      }
      return o;
    }
    err(map, "Can't map f = $1 over a = $2", f, a);
  }
  
  function clon(a){
    if (arrp(a) || objp(a))return map(clon, a);
    return a;
  }
  
  function nof(n, a){
    if (strp(a)){
      var s = "";
      for (var i = n; i >= 1; i--)s += a;
      return s;
    }
    if (arrp(a)){
      var r = [];
      for (var i = n; i >= 1; i--)apd(a, r);
      return r;
    }
    err(nof, "Can't make n = $1 of a = $2", n, a);
  }
  
  function has(x, a){
    if (strp(a)){
      if (strp(x) || arrp(x))return pos(x, a) != -1;
      if (rgxp(x))return x.test(a);
      err(has, "Can't find if str a = $1 has x = $2", a, x);
    }
    if (arrp(a)){
      x = testfn(x);
      for (var i = 0; i < len(a); i++){
        if (x(a[i]))return true;
      }
      return false;
    }
    if (objp(a)){
      for (var i in a){
        if (x(a[i]))return true;
      }
      return false;
    }
    err(has, "Can't find if a = $1 has x = $2", a, x);
  }
  
  function beg(a, x){
    if (arrp(a))return pos(x, a) == 0;
    return pos(slc(arguments, 1), a) == 0;
  }
  
  function end(a){
    var x = slc(arguments, 1);
    var curr;
    for (var i = 0; i < len(x); i++){
      curr = posl(x[i], a);
      if (curr != -1 && curr == len(a)-len(x[i]))return true;
    }
    return false;
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
    err(ins, "Can't insert x = $1 into a = $2 at n = $3", x, a, n);
  }
  
  function del(a, n){
    if (arrp(a))return a.splice(n, 1)[0];
    if (objp(a)){
      var t = a[n];
      delete a[n];
      return t;
    }
    err(del, "Can't delete item n = $1 from a = $2", n, a);
  }
  
  function fst(a){
    return a[0];
  }
  
  function nlas(n, a){
    return a[len(a)-1-n];
  }
  
  function las(a){
    return nlas(0, a);
  }
  
  function fstn(n, a){
    return slc(a, 0, n);
  }
  
  function blas(n, a){
    return slc(a, 0, len(a)-n);
  }
  
  function blas1(a){
    return blas(1, a);
  }
  
  function ncdr(n, a){
    return slc(a, n);
  }
  
  function cdr(a){
    return ncdr(1, a);
  }
  
  function push(x, a){
    if (arrp(a)){
      if (uarrp(a))err(push, "Can't push x = $1 onto uarr a = $2", x, a);
      a.push(x);
      return a;
    }
    if (objp(a)){
      a[x[0]] = x[1];
      return a;
    }
    err(push, "Can't push x = $1 onto a = $2", x, a);
  }
  
  function reduc(f, x, a){
    if (arrp(a)){
      if (len(a) == 0)return x;
      var s = x;
      for (var i = 0; i < len(a); i++){
        s = f(s, a[i], i);
      }
      return s;
    }
    if (objp(a)){
      if (len(a) == 0)return x;
      var s = x;
      for (var i in a){
        s = f(s, a[i], i);
      }
      return s;
    }
    err(reduc, "Can't reduc a = $1 with f = $2 and x = $3", a, f, x);
  }
  
  //// Array ////
  
  function pop(a){
    if (uarrp(a))err(pop, "Can't pop from uarr a = $1", a);
    return a.pop();
  }
  
  function ushf(x, a){
    if (uarrp(a))err(ushf, "Can't ushf x = $1 onto args a = $2", x, a);
    a.unshift(x);
    return a;
  }
  
  function shf(a){
    if (uarrp(a))err(shf, "Can't shf from args a = $1", a);
    return a.shift();
  }
  
  function head(a, x){
    return ushf(x, copy(a));
  }
  
  function tail(a, x){
    return push(x, copy(a));
  }
  
  function join(a, x){
    if (udefp(x))x = "";
    return map(str1, a).join(x);
  }
  
  function reduc1(f, a){
    if (len(a) == 0)return [];
    var s = a[0];
    for (var i = 1; i < len(a); i++){
      s = f(s, a[i], i);
    }
    return s;
  }
  
  //// Object and Alist ////
  
  function keys(a){
    if (objp(a))return map(L.car, tarr(a));
    if (arrp(a))return map(function (x){
      if (!arrp(x))err(keys, "Can't get keys of a = $1", a);
      return L.car(x);
    }, a);
    err(keys, "Can't get keys of a = $1");
  }
  
  function vals(a){
    if (objp(a))return map(L.cdr, tarr(a));
    if (arrp(a))return map(function (x){
      if (!arrp(x))err(vals, "Can't get vals of a = $1", a);
      return L.cdr(x);
    }, a);
    err(vals, "Can't get vals of a = $1");
  }
  
  function alref(a, x){
    for (var i = 0; i < len(a); i++){
      if (!arrp(a[i]))err(alref, "Can't alref x = $1 in a = $2", x, a);
      if (a[i][0] === x)return a[i][1];
    }
    return udef;
  }
  
  function alset(a, x, y){
    for (var i = 0; i < len(a); i++){
      if (!arrp(a[i]))err(alset, "Can't alset x = $1 in a = $2 to y = $3", x, a, y);
      if (a[i][0] === x)return a[i][1] = y;
    }
    push([x, y], a);
    return y;
  }
  
  function aldel(a, x){
    for (var i = 0; i < len(a); i++){
      if (!arrp(a[i]))err(aldel, "Can't aldel x = $1 in a = $2", x, a);
      if (a[i][0] === x){
        var y = a[i][1];
        del(a, i);
        return y;
      }
    }
    return udef;
  }
  
  //// String ////
  
  function strf(a){ // string fill
    if (strp(a))return reduc1(function (a, s, i){
      return rpl("$" + i, disp(s), a);
    }, arguments);
    return disp(a);
  }
  
  //// Function ////
  
  function apply(f, a){
    return f.apply(this, a);
  }
  
  function call(f){
    return apply(f, slc(arguments, 1));
  }
  
  // function test(a, b, c) -> "test(a, b, c)"
  function sig(f){
    var name = /function\s*([^\(]*\(([^\)]*)\))/.exec(dump(f))[1];
    return (name[0] == "(")?"function" + name:name;
  }
  
  // http://stackoverflow.com/a/1357494
  // function test(a, b, c) -> ["a", "b", "c"]
  function prms(f){
    var p = /function[^\(]*\(([^\)]*)\)/.exec(dump(f))[1];
    p = splt(p, /\s*,\s*/);
    return (p[0] == "")?[]:p;
  }
  
  function self(a){
    return a;
  }
  
  function testfn(a){
    if (fnp(a))return a;
    return function (x){
      return x === a;
    };
  }
  
  //// List ////
  
  var L = (function (){
    //// Predicates ////
    
    function nilp(a){
      return arrp(a) && len(a) == 0;
    }
    
    //// Basic ////
    
    function car(a){
      return !udefp(a[0])?a[0]:[];
    }
    
    function cdr(a){
      return !udefp(a[1])?a[1]:[];
    }
    
    function cons(a, b){
      return [a, b];
    }
    
    //// car and cdr extensions ////
    
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
    
    //// General ////
    
    function has(x, a){
      if (nilp(a))return false;
      if (is(car(a), x))return true;
      return has(x, cdr(a));
    }
    
    function is(a, b){
      return a === b || nilp(a) && nilp(b);
    }
    
    function push(x, a){
      if (nilp(a)){
        a[1] = [];
        a[0] = x;
        return a;
      }
      a[1] = cons(a[0], a[1]);
      a[0] = x;
      return a;
    }
    
    function pop(a){
      var x = car(a);
      if (nilp(cdr(a))){
        a.pop();
        a.pop();
      } else {
        a[0] = cadr(a);
        a[1] = cddr(a);
      }
      return x;
    }
    
    //// Object exposure ////
    
    return {
      nilp: nilp,
      
      car: car,
      cdr: cdr,
      cons: cons,
      
      caar: caar,
      cdar: cdar,
      cadr: cadr,
      cddr: cddr,
      
      has: has,
      is: is,
      push: push,
      pop: pop
    };
  })();
  
  //// DOM functions ////
  
  function $(a){
    return doc.getElementById(a);
  }
  
  function elem(a){
    return doc.createElement(a);
  }
  
  function text(a){
    return doc.createTextNode(a);
  }
  
  function clear(a){
    while (a.hasChildNodes()){
      a.removeChild(a.firstChild);
    }
  }
  
  //// Regex ////
  
  function mtch(x, a){
    var r = a.match(x);
    return nullp(r)?-1:r[0];
  }
  
  function mtchs(x, a){
    var r = a.match(x);
    return nullp(r)?[]:r;
  }
  
  //// Speed tests ////
  
  function speed(a, b, n){
    var ta, tb;
    
    ta = speed2(a, n);
    tb = speed2(b, n);
    
    al("a: $1 | b: $2", ta, tb);
  }
  
  function speed2(f, n){
    var t1, t2, i;
    
    t1 = time();
    for (i = 1; i <= n; i++)f();
    t2 = time();
    
    return t2-t1;
  }
  
  //// Error ////
  
  var errfunc = function (subj, data){};
  
  function err(f){
    var s = "Error: ";
    var a = sig(f) + ": " + apply(strf, slc(arguments, 1));
    errfunc(s, a);
    throw s + a;
  }
  
  function errfn(f){
    if (udefp(f))return errfunc;
    return errfunc = f;
  }
  
  //// Other ////
  
  function pause(t){
    var date = new Date();
    var curr;
    do {
      curr = new Date();
    } while (curr - date < t);
  }
  
  // global eval
  function evl(a){
    (win.execScript || function (a){
      win["eval"].call(win, a);
    })(a);
  }
  
  function emptyp(a){
    return inp(a, undef, "", null, "null");
  }
  
  function time(){
    return (new Date()).getTime();
  }
  
  //// Object exposure ////
  
  win.$ = apd({
    doc: doc,
    inf: inf,
    
    gcls: gcls,
    type: type,
    
    objp: objp,
    strp: strp,
    nump: nump,
    arrp: arrp,
    uarrp: uarrp,
    fnp: fnp,
    rgxp: rgxp,
    htmp: htmp,
    udefp: udefp,
    nullp: nullp,
    
    is: is,
    iso: iso,
    inp: inp,
    
    dyn: dyn,
    
    disp: disp,
    dump: dump,
    
    ou: ou,
    out: out,
    alert: alert,
    pr: pr,
    prn: prn,
    al: al,
    
    num: num,
    tint: tint,
    tflt: tflt,
    str: str,
    tarr: tarr,
    tobj: tobj,
    
    len: len,
    ref: ref,
    set: set,
    pos: pos,
    posl: posl,
    rpl: rpl,
    slc: slc,
    poss: poss,
    add: add,
    add2: add2,
    rev: rev,
    grp: grp,
    rem: rem,
    copy: copy,
    splt: splt,
    apd: apd,
    map: map,
    clon: clon,
    nof: nof,
    has: has,
    beg: beg,
    end: end,
    ins: ins,
    del: del,
    fst: fst,
    nlas: nlas,
    las: las,
    fstn: fstn,
    blas: blas,
    blas1: blas1,
    ncdr: ncdr,
    cdr: cdr,
    push: push,
    reduc: reduc,
    
    pop: pop,
    ushf: ushf,
    shf: shf,
    head: head,
    tail: tail,
    join: join,
    reduc1: reduc1,
    
    keys: keys,
    vals: vals,
    alref: alref,
    alset: alset,
    aldel: aldel,
    
    strf: strf,
    
    apply: apply,
    call: call,
    sig: sig,
    prms: prms,
    self: self,
    
    L: L,
    
    elem: elem,
    text: text,
    clear: clear,
    
    mtch: mtch,
    mtchs: mtchs,
    
    speed: speed,
    
    err: err,
    errfn: errfn,
    
    pause: pause,
    evl: evl,
    emptyp: emptyp,
    time: time
  }, $);
  
  //// Testing ////
  
  /*var a = [2, 3];
  var b = {a: 3, b: 4, c: 5};
  b["c"] = b;
  a[2] = b;
  a[1] = a;
  var c = [1, b, a];
  c[3] = c;*/
  
  /*var a = {a: 2, b: 3, c: 4, d: 5, e: 6};
  var b = copy(a);
  a.a = 3;
  b.e = 10;*/
  
  /*var a = {a: 1, b: 2, c: 3};
  var b = {a: 1, b: 2, c: 3, d: a, e: 5};
  var c = copy(b);
  var d = clon(b);
  alert(disp(b));
  b.a = 5;
  a.c = 10;
  alert(disp(c));
  alert(disp(d));*/
  
  /*var a = [1, 2, 3, 4, 5];
  alert(disp(push(10, a)));
  alert(disp(a));
  alert(disp(pop(a)));
  alert(disp(a));*/
  
  //alert(disp(rpl("10", "hey", "$1 $1 $10 $0 10")));
  //pause(3000);
  //err(err, 'This is a really weird error! $1 $2', strf, [1, 2, 3]);
  
  /*function test(){
    eval("var a = 5;");
    evl("var b = 6;");
  }
  
  test();
  //alert(disp(a));
  alert(disp(b));*/
  
  //al("test: $1 | b: $2", "bwejiowej", {a: 1, b: 2, c: 3});
  
  //al(call(text, "div"));
  
})(window);
