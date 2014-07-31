/***** Tools Devel *****/

(function (win, udf){
  var doc = win.document;
  var inf = Infinity;
  
  ////// Type //////
  
  function cls(a){
    return Object.prototype.toString.call(a);
  }
  
  function typ(a){
    if (a instanceof Node)return "htm";
    if (a instanceof Err)return "err";
    var tp = cls(a);
    switch (tp){
      case "[object Object]": return "obj";
      case "[object String]": return "str";
      case "[object Number]": return "num";
      case "[object Array]": return "arr";
      case "[object Arguments]":
      case "[object HTMLCollection]":
      case "[object NodeList]": 
      case "[object NamedNodeMap]":
      case "[object MozNamedAttrMap]": return "irr";
      case "[object Function]": return "fn";
      case "[object Undefined]": return "udf";
      case "[object Boolean]": return "bol";
      case "[object RegExp]": return "rgx";
      case "[object Null]": return "nul";
      case "[object Window]": return "win";
      case "[object HTMLDocument]": return "doc";
      case "[object Text]": return "txt";
    }
    return tp;
  }
  
  //// Predicates ////
  
  function nump(a){
    return cls(a) === "[object Number]";
  }
  
  /*function strp(a){
    return cls(a) === "[object String]";
  }*/
  
  function strp(a){
    return typeof a === "string";
  }
  
  /*function arrp(a){
    return cls(a) === "[object Array]" || irrp(a);
  }
  
  // immutable array
  function irrp(a){
    return inp(cls(a), "[object Arguments]",
                       "[object HTMLCollection]",
                       "[object NodeList]",
                       "[object NamedNodeMap]",
                       "[object MozNamedAttrMap]");
  }*/
  
  function arrp(a){
    var c = cls(a);
    return c === "[object Array]" ||
           c === "[object Arguments]" ||
           c === "[object HTMLCollection]" ||
           c === "[object NodeList]" ||
           c === "[object NamedNodeMap]" || 
           c === "[object MozNamedAttrMap]";
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
    return cls(a) === "[object RegExp]";
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
    return a instanceof Node;
  }
  
  function docp(a){
    return cls(a) === "[object HTMLDocument]";
  }
  
  function winp(a){
    return cls(a) === "[object Window]";
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
  
  function iso(a, b){
    if (is(a, b))return true;
    if (arrp(a) && arrp(b))return iarr(a, b);
    if (rgxp(a) && rgxp(b))return irgx(a, b);
    // todo: isoobj(a, b)
    return false;
  }
  
  function iarr(a, b){
    if (len(a) != len(b))return false;
    for (var i = 0; i < len(a); i++){
      if (!is(a[i], b[i]))return false;
    }
    return true;
  }
  
  function irgx(a, b){
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
  
  ////// Dynamic vars //////
  
  function dyn(a, x, f){
    L.psh(x, a);
    var r = f();
    L.pop(a);
    return r;
  }
  
  ////// Display /////
  
  var ds = [];
  function dsp(a){
    return dyn(ds, a, function (){
      return dsp1(a);
    });
  }
  
  function dsp1(a){
    if (udfp(a))return "udf";
    if (nulp(a))return "null";
    if (arrp(a) || irrp(a)){
      if (L.has(a, L.cdr(ds)))return "[...]";
      return "[" + joi(map(dsp, a), ", ") + "]";
    }
    if (strp(a))return dstr(a);
    if (fnp(a))return sig(a);
    if (objp(a)){
      if (L.has(a, L.cdr(ds)))return "{...}";
      return dobj(a);
    }
    if (winp(a))return "win";
    if (docp(a))return "doc";
    if (htmp(a)){
      if (txtp(a))return "<txt " + dsp(a.data) + ">";
      if (!udfp(a.tagName)){
        var s = "<" + low(a.tagName);
        var t = atts(a);
        if (!emp(t))s += " " + dsp(t);
        s += rdc(function (s, x){
          return s + " " + dsp(x);
        }, "", a);
        s += ">";
        return s;
      }
    }
    return dmp(a);
  }
  
  // (var to (map [+ "\\" _] #["\\", "\"", "n", "r", "t", "b", "f"]))
  function dstr(a){
    var fr = ["\\", "\"", "\n", "\r", "\t", "\b", "\f"];
    var to = ["\\\\", "\\\"", "\\n", "\\r", "\\t", "\\b", "\\f"];
    return "\"" + rpl(fr, to, a) + "\"";
  }
  
  // can't use rdc because dobj is used on fns and arrs too
  function dobj(a){
    var r = [];
    for (var i in a){
      psh(i + ": " + dsp(a[i]), r);
    }
    return "{" + joi(r, ", ") + "}";
  }
  
  function dmp(a){
    return String(a);
  }
  
  ////// Output /////

  function ou(a){
    doc.write(a);
  }
  
  function out(a){
    doc.writeln(a);
  }
  
  function alr(a){
    win.alert(a);
  }
  
  function pr(a){
    ou(apl(stf, arguments));
  }
  
  function prn(a){
    out(apl(stf, arguments));
  }
  
  function al(a){
    alr(apl(stf, arguments));
  }
  
  ////// Converters //////
  
  function num(a){
    return Number(a);
  }
  
  function tint(a){
    return parseInt(a);
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
    if (strp(a))return rdc(function (r, x){
      return psh(x, r);
    }, [], a);
    if (objp(a))return rdc(function (r, x, i){
      return psh([i, x], r);
    }, [], a);
    err(tarr, "Can't coerce a = $1 to arr", a);
  }
  
  function tfn(a){
    if (fnp(a))return a;
    return function (x){
      return x === a;
    };
  }
  
  function tobj(a, o){
    if (udfp(o))o = {};
    if (objp(a))return app(a, o);
    if (arrp(a))return rdc(function (o, x){
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
    err(prop, "Invalsid obj prop name a = $1", a);
  }
  
  function htm(a){
    if (htmp(a))return a;
    if (strp(a))return txt(a);
    if (arrp(a))return apl(elm, a);
    err(htm, "Can't coerce a = $1 to htm", a);
  }
  
  ////// Add //////
  
  ////// Sequence //////
  
  //// Items ////
  
  function ref(a){
    return rdc(ref1, a, sli(arguments, 1));
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
      if (udfp(b))return att(x, a);
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
    return a[0];
  }
  
  function las(a){
    if (htmp(a))return a.lastChild;
    return a[len(a)-1];
  }
  
  //// Apply ////
  
  function apl(f, a){
    return f.apply(this, a);
  }
  
  function map(x, a){
    // (rdc #[psh (f %2) %1] [] a)
    if (arrp(a)){
      x = tfn(x);
      return rdc(function (r, a){
        return psh(x(a), r);
      }, [], a);
    }
    if (objp(a)){
      x = tfn(x);
      return rdc(function (o, a, i){
        o[i] = x(a);
        return o;
      }, {}, a);
    }
    err(map, "Can't map x = $1 over a = $2", x, a);
  }
  
  function pos(x, a, n){
    if (udfp(n))n = 0;
    if (arrp(a)){
      x = tfn(x);
      for (var i = n; i < len(a); i++){
        if (x(a[i]))return i;
      }
      return -1;
    }
    if (strp(a)){
      if (strp(x))return a.indexOf(x, n);
      if (rgxp(x))return a.search(x);
      if (arrp(x))return rdc(function (m, i){
        var curr = pos(i, a, n);
        if (curr == -1)return m;
        if (m == -1)return curr;
        return Math.min(m, curr);
      }, -1, x);
    }
    if (objp(a)){
      x = tfn(x);
      for (var i in a){
        if (x(a[i]))return i;
      }
      return -1;
    }
    if (htmp(a))return pos(x, kids(a), n);
    err(pos, "Can't get pos of x = $1 in a = $2 from n = $3", x, a, n);
  }
  
  function pol(x, a, n){
    if (udfp(n))n = len(a);
    if (arrp(a)){
      x = tfn(x);
      for (var i = n; i >= 0; i--){
        if (x(a[i]))return i;
      }
      return -1;
    }
    if (strp(a)){
      if (strp(x))return a.lastIndexOf(x, n);
      if (arrp(x))return rdc(function (m, i){
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
      x = tfn(x);
      return rdc(function (r, a, i){
        if (x(a))return psh(i, r);
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
                psh(i, r);
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
              psh(i, r);
              break;
            }
            if (a[i+v] !== x[v])break;
          }
        }
        return r;
      }
    }
    if (objp(a)){
      x = tfn(x);
      var r = [];
      for (var i in a){
        if (x(a[i]))psh(i, r);
      }
      return r;
    }
    if (htmp(a))return pss(x, kids(a));
    err(pss, "Can't get poses of x = $1 in a = $2", x, a);
  }
  
  function has(x, a){
    if (strp(a)){
      if (strp(x) || arrp(x))return pos(x, a) != -1;
      if (rgxp(x))return x.test(a);
      err(has, "Can't find if str a = $1 has x = $2", a, x);
    }
    if (arrp(a)){
      x = tfn(x);
      for (var i = 0; i < len(a); i++){
        if (x(a[i]))return true;
      }
      return false;
    }
    if (objp(a)){
      x = tfn(x);
      for (var i in a){
        if (x(a[i]))return true;
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
      x = tfn(x);
      var fnd = false;
      for (var i = 0; i < len(a); i++){
        if (x(a[i])){
          if (fnd)return true;
          fnd = true;
        }
      }
      return false;
    }
    if (objp(a)){
      x = tfn(x);
      var fnd = false;
      for (var i in a){
        if (x(a[i])){
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
      x = tfn(x);
      for (var i = 0; i < len(a); i++){
        if (!x(a[i]))return false;
      }
      return true;
    }
    if (objp(a)){
      x = tfn(x);
      for (var i in a){
        if (!x(a[i]))return false;
      }
      return true;
    }
    if (htmp(a))return all(x, kids(a));
    err(all, "Can't find if all a = $1 is x = $2", a, x);
  }
  
  function kep(x, a){
    if (arrp(a)){
      x = tfn(x);
      return rdc(function (r, i){
        if (x(i))return psh(i, r);
        return r;
      }, [], a);
    }
    if (objp(a)){
      x = tfn(x);
      return rdc(function (o, a, i){
        if (x(a))o[i] = a;
        return o;
      }, {}, a);
    }
    err(kep, "Can't kep x = $1 in a = $2", x, a);
  }
  
  function rem(x, a){
    if (arrp(a)){
      x = tfn(x);
      return rdc(function (r, i){
        if (x(i))return r;
        return psh(i, r);
      }, [], a);
    }
    if (strp(a))return rpl(x, "", a);
    if (objp(a)){
      x = tfn(x);
      return rdc(function (o, a, i){
        if (!x(a))o[i] = a;
        return o;
      }, {}, a);
    }
    err(rem, "Can't rem x = $1 from a = $2", x, a);
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
    if (arrp(a)){
      x = tfn(x);
      return rdc(function (r, a){
        return psh(x(a)?y:a, r);
      }, [], a);
    }
    if (objp(a)){
      x = tfn(x);
      return rdc(function (o, a, i){
        o[i] = x(a)?y:a;
        return o;
      }, {}, a);
    }
    err(rpl, "Can't rpl x = $1 with y = $2 in a = $3", x, y, a);
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
  
  /*function len(a){
    try {
      return a.length;
    } catch (e){
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
  }*/
  
  function emp(a){
    if (arrp(a) || strp(a) || fnp(a) || objp(a))return len(a) == 0;
    if (nulp(a) || udfp(a))return true;
    if (htmp(a))return !a.hasChildNodes();
    err(emp, "Can't find if a = $1 is empty", a);
  }
  
  function cpy(a){
    if (arrp(a) || objp(a))return map(self, a);
    if (htmp(a))return a.cloneNode(false);
    return a;
  }
  
  function cln(a){
    if (arrp(a) || objp(a))return map(cln, a);
    if (htmp(a))return a.cloneNode(true);
    return a;
  }
  
  function rev(a){
    if (arrp(a))return (irrp(a)?cpy(a):a).reverse();
    if (strp(a)){
      var s = "";
      for (var i = len(a)-1; i >= 0; i--){
        s += a[i];
      }
      return s;
    }
    err(rev, "Can't rev a = $1", a);
  }
  
  //// Parts ////
  
  function sli(a, n, m){
    if (n < 0)n = 0;
    if (!udfp(m) && m < n)m = n;
    if (strp(a))return a.substring(n, m);
    if (arrp(a))return (irrp(a)?cpy(a):a).slice(n, m);
    if (htmp(a))return sli(kids(a), n, m);
    err(sli, "Can't slice a = $1 from n = $2 to m = $3", a, n, m);
  }
  
  function fstn(n, a){
    return sli(a, 0, n);
  }
  
  function lasn(n, a){
    return sli(a, len(a)-n);
  }
  
  function nrst(n, a){
    return sli(a, n);
  }
  
  function rst(a){
    return sli(a, 1);
  }
  
  // but last
  function nbut(n, a){
    return sli(a, 0, len(a)-n);
  }
  
  function but(a){
    return nbut(1, a);
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
      var r = [];
      var last = 0;
      for (var i = 0; i < len(a); i++){
        if (a[i] === x){
          psh(sli(a, last, i), r);
          last = i+1;
        }
      }
      return psh(sli(a, last, len(a)), r);
    }
    err(spl, "Can't split a = $1 by x = $2", a, x);
  }
  
  // (grp (x 3 y 4 z 5) 2) -> ((x 3) (y 4) (z 5))
  function grp(a, n){
    if (n > 0){
      var r = [];
      for (var i = 0; i < len(a); i += n){
        psh(sli(a, i, i+n), r);
      }
      return r;
    }
    err(grp, "Can't grp a = $1 into grps of n = $2", a, n);
  }
  
  function tup(){
    var a = arguments;
    var r = [];
    if (len(a) > 0){
      var m = apl(Math.min, map(len, a));
      for (var i = 0; i < m; i++){
        psh(map(function (x){
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
    if (udfp(x))return rdc(app2, [], a);
    return rdc(function (r, a){
      if (emp(r))return app(r, a);
      return app(r, x, a);
    }, [], a);
  }
  
  function app(){
    var a = arguments;
    if (len(a) == 0)return 0;
    return rdc1(app2, a);
  }
  
  function app2(a, b){
    if (strp(a))return a+(strp(b)?b:str1(b));
    if (arrp(a)){
      if (!arrp(b))return tai(a, b);
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
    if (strp(a)){
      var s = "";
      for (var i = n; i >= 1; i--)s += a;
      return s;
    }
    if (arrp(a)){
      var r = [];
      for (var i = n; i >= 1; i--)att(a, r);
      return r;
    }
    err(nof, "Can't make n = $1 of a = $2", n, a);
  }
  
  //// Reduce ////
  
  function rdc(f, x, a){
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
    if (htmp(a))return rdc(f, x, kids(a));
    err(rdc, "Can't rdc a = $1 with f = $2 and x = $3", a, f, x);
  }
  
  // can't use rdc because indexes would start at 0
  function rdc1(f, a){
    if (arrp(a)){
      if (emp(a))return [];
      var s = a[0];
      for (var i = 1; i < len(a); i++){
        s = f(s, a[i], i);
      }
      return s;
    }
    err(rdc1, "Can't rdc a = $1 with f = $2", a, f);
  }
  
  function rdn(f, x, a){
    if (arrp(a)){
      var s = x;
      for (var i = 0; i < len(a); i++){
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
    if (htmp(a))return rdn(f, x, kids(a));
    err(rdc, "Can't rdc a = $1 with f = $2 and x = $3", a, f, x);
  }
  
  function rdn1(f, a){
    if (arrp(a)){
      if (emp(a))return [];
      var s = a[0];
      for (var i = 1; i < len(a); i++){
        s = f(s, a[i]);
      }
      return s;
    }
    err(rdc1, "Can't rdc a = $1 with f = $2", a, f);
  }
  
  //// Array ////
  
  function hea(a, x){
    return ush(x, cpy(a));
  }
  
  function tai(a, x){
    return psh(x, cpy(a));
  }
  
  //// Other ////
  
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
        for (var i = la, j = lx; j >= 0; i--, j--){
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
    err(each, "Can't loop through all in a = $1 with f = $2", a, f);
  }
  
  function mkep(x, a){
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
    err(mkep, "Can't mkep x = $1 in a = $2", x, a);
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
  
  function psh(x, a){
    if (irrp(a))err(psh, "Can't psh x = $1 onto uarr a = $2", x, a);
    a.push(x);
    return a;
  }
  
  function pop(a){
    if (irrp(a))err(pop, "Can't pop from uarr a = $1", a);
    return a.pop();
  }
  
  function ush(x, a){
    if (irrp(a))err(ush, "Can't ush x = $1 onto args a = $2", x, a);
    a.unshift(x);
    return a;
  }
  
  function shf(a){
    if (irrp(a))err(shf, "Can't shf from args a = $1", a);
    return a.shift();
  }
  
  //// Other ////
  
  function att(x, a){
    if (arrp(a)){
      man1(function (x){
        psh(x, a);
      })(x);
      return a;
    }
    if (objp(a) || fnp(a)){
      if (arrp(x))return att(tobj(x), a);
      if (objp(x) || fnp(x)){
        for (var i in x){
          a[i] = x[i];
        }
        return a;
      }
    }
    if (htmp(a)){
      man1(function (x){
        a.appendChild(htm(x));
      })(x);
      return a;
    }
    err(att, "Can't attach x = $1 to a = $2", x, a);
  }
  
  ////// Object and Alist //////
  
  function keys(a){
    if (arrp(a))return map(function (x){
      if (!arrp(x))err(keys, "Can't get keyss of a = $1", a);
      return L.car(x);
    }, a);
    var r = [];
    for (var i in a){
      psh(i, r);
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
      psh(a[i], r);
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
    psh([x, y], a);
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
  
  ////// String //////
  
  function low(a){
    return a.toLowerCase();
  }
  
  function upp(a){
    return a.toUpperCase();
  }
  
  function stf(a){ // string fill
    if (strp(a))return rdc1(function (a, s, i){
      return rpl("$" + i, dsp(s), a);
    }, arguments);
    return dsp(a);
  }
  
  ////// Function //////
  
  function cal(a){
    return apl(a, sli(arguments, 1));
  }
  
  // function test(a, b, c) -> "test(a, b, c)"
  function sig(a){
    var n = cap(/function\s*([^\(]*\(([^\)]*)\))/, dmp(a));
    return (n[0] == "(")?"function" + n:n;
  }
  
  // http://stackoverflow.com/a/1357494
  // function test(a, b, c) -> ["a", "b", "c"]
  function prms(a){
    var p = cap(/function[^\(]*\(([^\)]*)\)/, dmp(a));
    p = spl(p, /\s*,\s*/);
    return (p[0] == "")?[]:p;
  }
  
  // compose
  function cmps(a, b){
    return function (){
      return a(apl(b, arguments));
    };
  }
  
  function man1(f){
    return function (a){
      if (!arrp(a))r = arguments;
      each(r, function (x){
        f(x);
      });
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
  
  //// Reference ////
  
  function self(a){
    return a;
  }
  
  ////// List //////
  
  var L = (function (){
    //// Predicates ////
    
    function nilp(a){
      return a.length == 0;
    }
    
    //// Basic ////
    
    function car(a){
      return !udfp(a[0])?a[0]:[];
    }
    
    function cdr(a){
      return !udfp(a[1])?a[1]:[];
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
    
    function psh(x, a){
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
      psh: psh,
      pop: pop
    };
  })();
  
  ////// DOM //////
  
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
      satt(e, oc);
      return att(sli(arguments, 2), e);
    }
    return att(sli(arguments, 1), e);
  }
  
  function elm1(a){
    return doc.createElement(a);
  }
  
  function txt(a){
    return doc.createTextNode(a);
  }
  
  function atts(a){
    var o = {};
    each(a.attributes, function (x){
      if (x.specified)o[x.name] = x.valsue;
    });
    each(keys(a), function (x){
      if (beg(x, "on") && !nulp(a[x]))o[x] = a[x];
    });
    return o;
  }
  
  function satt(a, x, y){
    man2(function (x, y){
      if (beg(x, "on"))a[x] = y;
      else a.setAttribute(x, y);
    })(x, y);
    return a;
  }
  
  function ratt(a, x){
    man1(function (x){
      if (beg(x, "on"))a[x] = null;
      else a.removeAttribute(x);
    })(x);
    return a;
  }
  
  function kids(a){
    return cpy(a.childNodes);
  }
  
  function cont(x){
    var a = sli(arguments, 1);
    clr(x);
    each(a, function (a){
      return att(htm(a), x);
    });
    return x;
  }
  
  function top(a){
    a.scrollTop = 0;
    return a;
  }
  
  function bot(a){
    a.scrollTop = a.scrollHeight;
    return a;
  }
  
  function foc(a){
    a.focus();
    return a;
  }
  
  function atth(x, a){
    a.innerHTML += x;
    return a;
  }
  
  function seth(a, x){
    a.innerHTML = x;
    return a;
  }
  
  ////// Regex //////
  
  function mat(x, a){
    var r = a.match(x);
    return nulp(r)?-1:r[0];
  }
  
  function mats(x, a){
    var r = a.match(x);
    return nulp(r)?[]:r;
  }
  
  function cap(x, a){
    return x.exec(a)[1];
  }
  
  function caps(x, a){
    return slc(x.exec(a), 1);
  }
  
  ////// Time //////
  
  function tim(){
    return (new Date()).getTime();
  }
  
  function lat(f, n){
    if (udfp(n))n = 0;
    return setTimeout(f, n);
  }
  
  function itr(f, n){
    if (udfp(n))n = 0;
    return setIntervals(f, n);
  }
  
  function stp(a){
    return clearTimeout(a);
  }
  
  function pau(t){
    var d = tim();
    var c;
    do c = tim();
    while (c-d < t);
  }
  
  ////// Speed tests //////
  
  function spd(a, b, n){
    var ta, tb;
    
    ta = spd2(a, n);
    tb = spd2(b, n);
    
    al("a: $1 | b: $2", ta, tb);
  }
  
  function spd2(f, n){
    var t1, t2, i;
    
    t1 = tim();
    for (i = 1; i <= n; i++)f();
    t2 = tim();
    
    return t2-t1;
  }
  
  ////// Error //////
  
  function Err(f, a){
    this.f = f;
    this.s = sig(f);
    this.a = a;
  }
  
  Err.prototype.toString = function (){
    return "Error: " + this.s + ": " + this.a;
  };
  
  var ef = function (e){};
  
  function err(f){
    var e = new Err(f, apl(stf, sli(arguments, 1)));
    ef(e);
    throw e.toString();
  }
  
  function efn(f){
    if (udfp(f))return ef;
    return ef = f;
  }
  
  ////// Other //////
  
  // global evals
  function evl(a){
    (win.execScript || function (a){
      win["evals"].call(win, a);
    })(a);
  }
  
  ////// Object exposure //////
  
  win.$ = att({
    win: win,
    udf: udf,
    doc: doc,
    inf: inf,
    
    cls: cls,
    typ: typ,
    
    nump: nump,
    strp: strp,
    arrp: arrp,
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
    iso: iso,
    inp: inp,
    
    dyn: dyn,
    
    dsp: dsp,
    dstr: dstr,
    dobj: dobj,
    dmp: dmp,
    
    ou: ou,
    out: out,
    alr: alr,
    pr: pr,
    prn: prn,
    al: al,
    
    num: num,
    tint: tint,
    tflt: tflt,
    str: str,
    tarr: tarr,
    tfn: tfn,
    tobj: tobj,
    htm: htm,
    
    ref: ref,
    rel: rel,
    set: set,
    ins: ins,
    del: del,
    fst: fst,
    las: las,
    
    apl: apl,
    map: map,
    pos: pos,
    pol: pol,
    pss: pss,
    has: has,
    mny: mny,
    all: all,
    kep: kep,
    rem: rem,
    rpl: rpl,
    
    len: len,
    emp: emp,
    cpy: cpy,
    cln: cln,
    rev: rev,
    
    sli: sli,
    fstn: fstn,
    lasn: lasn,
    nrst: nrst,
    rst: rst,
    nbut: nbut,
    but: but,
    mid: mid,
    bef: bef,
    aft: aft,
    
    spl: spl,
    grp: grp,
    tup: tup,
    
    hea: hea,
    tai: tai,
    
    joi: joi,
    fla: fla,
    app: app,
    app2: app2,
    nof: nof,
    
    rdc: rdc,
    rdc1: rdc1,
    rdn: rdn,
    rdn1: rdn1,
    
    beg: beg,
    end: end,
    bnd: bnd,
    
    each: each,
    mkep: mkep,
    mrem: mrem,
    mrpl: mrpl,
    
    mrev: mrev,
    clr: clr,
    
    psh: psh,
    pop: pop,
    ush: ush,
    shf: shf,
    
    att: att,
    
    keys: keys,
    vals: vals,
    okey: okey,
    oval: oval,
    aref: aref,
    aset: aset,
    adel: adel,
    
    low: low,
    upp: upp,
    stf: stf,
    
    cal: cal,
    sig: sig,
    prms: prms,
    cmps: cmps,
    man1: man1,
    man2: man2,
    
    self: self,
    
    L: L,
    
    elms: elms,
    elm: elm,
    txt: txt,
    atts: atts,
    satt: satt,
    ratt: ratt,
    kids: kids,
    cont: cont,
    top: top,
    bot: bot,
    foc: foc,
    atth: atth,
    seth: seth,
    
    mat: mat,
    mats: mats,
    cap: cap,
    caps: caps,
    
    tim: tim,
    lat: lat,
    itr: itr,
    stp: stp,
    pau: pau,
    
    spd: spd,
    
    Err: Err,
    err: err,
    efn: efn,
    
    evl: evl,
  }, $);
  
  ////// Testing //////
  
  /*var a = [2, 3];
  var b = {a: 3, b: 4, c: 5};
  b["c"] = b;
  a[2] = b;
  a[1] = a;
  var c = [1, b, a];
  c[3] = c;*/
  
  /*var a = {a: 2, b: 3, c: 4, d: 5, e: 6};
  var b = cpy(a);
  a.a = 3;
  b.e = 10;*/
  
  /*var a = {a: 1, b: 2, c: 3};
  var b = {a: 1, b: 2, c: 3, d: a, e: 5};
  var c = cpy(b);
  var d = cln(b);
  alr(dsp(b));
  b.a = 5;
  a.c = 10;
  alr(dsp(c));
  alr(dsp(d));*/
  
  /*var a = [1, 2, 3, 4, 5];
  alr(dsp(psh(10, a)));
  alr(dsp(a));
  alr(dsp(pop(a)));
  alr(dsp(a));*/
  
  //alr(dsp(rpl("10", "hey", "$1 $1 $10 $0 10")));
  //paus(3000);
  //err(err, 'This is a really weird error! $1 $2', stf, [1, 2, 3]);
  
  /*function test(){
    evals("var a = 5;");
    evl("var b = 6;");
  }
  
  test();
  //alr(dsp(a));
  alr(dsp(b));*/
  
  //al("test: $1 | b: $2", "bwejiowej", {a: 1, b: 2, c: 3});
  
  //al(cal(txt, "div"));
  
  
})(window);
