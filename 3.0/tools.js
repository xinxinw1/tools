/***** Tools 3.0 *****/

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
      case "[object Arguments]": return "args";
      case "[object Function]": return "fn";
      case "[object Undefined]": return "undef";
      case "[object Boolean]": return "bool";
      case "[object RegExp]": return "rgx";
      case "[object Null]": return "null";
      default: return tp;
    }
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
	  return gcls(a) == "[object Array]" || argp(a);
	}
	
	function argp(a){
	  return gcls(a) == "[object Arguments]";
	}
	
	function fnp(a){
	  return gcls(a) == "[object Function]";
	}
	
	function rgxp(a){
	  return gcls(a) == "[object RegExp]";
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
  
  function inp(a){
	  var args = arguments;
    for (var i = 1; i < len(args); i++){
      if (args[i] === a)return true;
    }
    return false;
  }
  
  //// Display ////
  
  var items = [];
  
  function disp(a){
    items = cons(a, items);
    var ret = disp1(a);
    items = cdr(items);
    return ret;
  }
  
  function disp1(a){
    if (arrp(a) || argp(a)){
      if (lsome(a, cdr(items)))return "[...]";
      return "[" + join(map(disp, a), ", ") + "]";
    }
    if (strp(a))return "\"" + a + "\"";
    if (fnp(a))return head(a);
    if (objp(a)){
      if (lsome(a, cdr(items)))return "{...}";
      var r = [];
      for (var i in a){
        r.push(i + ": " + disp(a[i]));
      }
      return "{" + join(r, ", ") + "}";
    }
    return dump(a);
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
  
  function coerce(a, ntp){
    if (type(a) == ntp)return a;
    switch (ntp){
      case "num": return tnum(a);
      case "int": return tint(a);
      case "flt": return tflt(a);
      case "str": return tstr(a);
      default: err(coerce, 'Cannot coerce a = $1 to ntp = $2', a, ntp);
    }
  }
  
  var tnum = Number;
  var tint = parseInt;
  var tflt = parseFloat;
  var tstr = str;
  
  //// Polymorphic ////
  
  function len(a){
    if (arrp(a) || strp(a))return a.length;
    if (objp(a)){
      var n = 0;
      for (var k in a){
        if (a.hasOwnProperty(k))n++;
      }
      return n;
    }
    err(len, 'Cannot get len of a = $1', a);
  }
  
  function pos(x, a, n){
    if (udefp(n))n = 0;
    if (arrp(a)){
      for (var i = n; i < len(a); i++){
        if (a[i] === x)return i;
      }
      return -1;
    }
    if (strp(a)){
      if (strp(x))return a.indexOf(x, n);
      if (rgxp(x))return a.search(x);
      if (arrp(x)){
        var m = -1; // min
        var curr;
        for (var i = 0; i < len(x); i++){
          curr = pos(x[i], a, n);
          if (curr != -1){
            if (m != -1)m = Math.min(m, curr);
            else m = curr;
          }
        }
        return m;
      }
    }
    err(pos, 'Cannot get pos of x = $1 in a = $2', x, a);
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
      if (arrp(x)){
        var arr = []; var k;
        for (var i = 0; i < len(a); i++){
          for (k = 0; k < len(x); k++){
            if (a[i] === x[k]){
              push(arrp(y)?y[k]:y, arr);
              break;
            }
          }
          if (k == len(x))push(a[i], arr);
        }
        return arr;
      }
      var arr = [];
      for (var i = 0; i < len(a); i++){
        push((a[i] === x)?y:a[i], arr);
      }
      return arr;
    }
    err(rpl, 'Cannot rpl x = $1 with y = $2 in a = $3', x, y, a);
  }
  
  function slc(a, n, m){
    if (udefp(m))m = len(a);
    if (n < 0)n = 0;
    if (m < 0)m = 0;
    if (n > len(a))n = len(a);
    if (m > len(a))m = len(a);
    if (n > m)m = n;
    if (strp(a))return a.substring(n, m);
    if (arrp(a))return (argp(a)?copy(a):a).slice(n, m);
    err(slc, 'Cannot slice a = $1 from n = $2 to m = $3', a, n, m);
  }
  
  function poses(x, a){
    if (arrp(a)){
      if (arrp(x)){
        // return sort(apply(add, map(fn(_)poses(_, a), x)))
        var r = [];
        for (var i = 0; i < len(a); i++){
          for (var k = 0; k < len(x); k++){
            if (x[k] === a[i])push(i, r);
          }
        }
        return r;
      }
      var r = [];
      for (var i = 0; i < len(a); i++){
        if (x === a[i])push(i, r);
      }
      return r;
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
      err(poses, 'Cannot get poses of x = $1 in str a = $2', x, a);
    }
    err(poses, 'Cannot get poses of x = $1 in a = $2', x, a);
  }
  
  function add(){
    a = arguments;
    if (len(a) == 0)return 0;
    var b = a[0];
    for (var i = 1; i < len(a); i++){
      b = add2(b, a[i]);
    }
    return b;
  }
  
  function add2(a, b){
    if (nump(a)){
      if (nump(b))return a+b;
      return a+tnum(b);
    }
    if (arrp(a)){
      if (!arrp(b))return tail(a, b);
      return (argp(a)?copy(a):a).concat(b);
    }
    if (strp(a)){
      if (strp(b))return a+b;
      return a+str(b);
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
      err(add2, 'Cannot add obj a = $1 to non-obj b = $2', a, b);
    }
    err(add2, 'Cannot add a = $1 to b = $2', a, b);
  }
  
  function rev(a){
    if (arrp(a))return (argp(a)?copy(a):a).reverse();
    if (strp(a)){
      var s = "";
      for (var i = len(a)-1; i >= 0; i--){
        s += a[i];
      }
      return s;
    }
    err(rev, 'Cannot rev a = $1', a);
  }
  
  // (group (x 3 y 4 z 5) 2) -> ((x 3) (y 4) (z 5))
  function group(a, n){
    if (n == 0)err(group, 'Cannot group a = $1 into groups of n = $2', a, n);
    var arr = [];
    for (var i = 0; i < len(a); i += n){
      push(slc(a, i, i+n), arr);
    }
    return arr;
  }
  
  function rem(x, a){
    if (arrp(a)){
      if (arrp(x)){
        var arr = []; var k;
        for (var i = 0; i < len(a); i++){
          for (k = 0; k < len(x); k++){
            if (a[i] === x[k])break;
          }
          if (k == len(x))push(a[i], arr);
        }
        return arr;
      }
      var arr = [];
      for (var i = 0; i < len(a); i++){
        if (a[i] !== x)push(a[i], arr);
      }
      return arr;
    }
    if (strp(a))return rpl(x, "", a);
    err(rem, 'Cannot rem x = $1 from a = $2', x, a);
  }
  
  function copy(a){
    if (arrp(a)){
      var arr = [];
      for (var i = 0; i < len(a); i++){
        push(a[i], arr);
      }
      return arr;
    }
    if (objp(a)){
      var obj = {};
      for (var i in a){
        obj[i] = a[i];
      }
      return obj;
    }
    return a;
  }
  
  function split(a, x){
    if (strp(a))return a.split(x);
    if (arrp(a)){
      var arr = [];
      var last = 0;
      for (var i = 0; i < len(a); i++){
        if (a[i] === x){
          push(slc(a, last, i), arr);
          last = i+1;
        }
      }
      return push(slc(a, last, len(a)), arr);
    }
    err(split, 'Cannot split a = $1 by x = $2', a, x);
  }
  
  function apd(x, a){
    if (arrp(a)){
      if (arrp(x)){
        for (var i = 0; i < len(x); i++){
          push(x[i], a);
        }
        return a;
      }
      return push(x, a);
    }
    if (objp(a) || fnp(a)){
      if (arrp(x) || objp(x) || fnp(x)){
        for (var i in x){
          a[i] = x[i];
        }
        return a;
      }
      err(apd, 'Cannot append x = $1 to obj or fn a = $2', x, a);
    }
    err(apd, 'Cannot append x = $1 to a = $2', x, a);
  }
  
  function map(f, a){
    if (arrp(a)){
      var arr = [];
      for (var i = 0; i < len(a); i++){
        push(f(a[i]), arr);
      }
      return arr;
    }
    if (objp(a)){
      var obj = {};
      for (var i in a){
        obj[i] = f(a[i]);
      }
      return obj;
    }
    err(map, 'Cannot map f = $1 over a = $2', f, a);
  }
  
  function clone(a){
    if (arrp(a) || objp(a))return map(clone, a);
    return a;
  }
  
  function nof(a, n){
    if (strp(a)){
      var s = "";
      for (var i = n; i >= 1; i--)s += a;
      return s;
    }
    if (arrp(a)){
      var arr = [];
      for (var i = n; i >= 1; i--)apd(a, arr);
      return arr;
    }
    err(nof, 'Cannot make n = $1 of a = $2', n, a);
  }
  
  function has(x, a){
    if (arrp(x)){
      for (var i = 0; i < len(x); i++){
        if (has1(x[i], a))return true;
      }
      return false;
    }
    return has1(x, a);
  }
  
  function has1(x, a){
    if (strp(a)){
      if (strp(x))return pos(x, a) == -1;
      if (rgxp(x))return x.test(a);
      throw err("has1", "Can't find if str a = $1 has x = $2", a, x);
    }
    if (arrp(a)){
      for (var i = 0; i < len(a); i++){
        if (is(a[i], x))return true;
      }
      return false;
    }
    throw err("has1", "Can't find if a = $1 has x = $2", a, x);
  }
  
  //// Array ////
  
  function push(x, a){
    if (argp(a))err(push, 'Cannot push x = $1 onto args arr a = $2', x, a);
    a.push(x);
    return a;
  }
  
  function tail(a, x){
    return push(x, copy(a));
  }
  
  function pop(a){
    if (argp(a))err(pop, 'Cannot pop from args arr a = $1', a);
    return a.pop();
  }
  
  function join(a, x){
    if (udefp(x))x = "";
    return (argp(a)?copy(a):a).join(x);
  }
  
  function ins(a, n, x){
    a.splice(n, 0, x);
    return a;
  }
  
  function del(a, n){
    return a.splice(n, 1)[0];
  }
  
  //// Object ////
  
  function alist(a){
    var arr = [];
    for (var i in a){
      push([i, a[i]], arr);
    }
    return arr;
  }
  
  function alref(a, x, y){
    for (var i = 0; i < len(a); i++){
      if (a[i][0] === x){
        if (udefp(y))return a[i][1];
        return a[i][1] = y;
      }
    }
    if (udefp(y))return false;
    push([x, y], a);
    return y;
  }
  
  function aldel(a, x){
    for (var i = 0; i < len(a); i++){
      if (a[i][0] === x)return del(a, i);
    }
    return false;
  }
  
  function ref(a, x, y){
    if (udefp(y))return a[x];
    return a[x] = y;
  }
  
  function del(a, x){
    var t = a[x];
    delete a[x];
    return t;
  }
  
  function keys(a){
    return map(car, alist(a));
  }
  
  function vals(a){
    return map(cdr, alist(a));
  }
  
  //// String ////
  
  function str(){
    var fn = function (a){
      return strp(a)?a:disp(a);
    };
    return join(map(fn, arguments));
  }
  
  function strf(a){ // string fill
    var args = arguments;
    if (strp(a)){
      for (var i = 1; i < len(args); i++){
        a = rpl("$" + i, disp(args[i]), a);
      }
      return a;
    }
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
  function head(f){
    var name = /function\s*([^\(]*\(([^\)]*)\))/.exec(f.toString())[1];
    return (name[0] == "(")?"function" + name:name;
  }
  
  // http://stackoverflow.com/a/1357494
  // function test(a, b, c) -> ["a", "b", "c"]
  function parms(f){
    var p = /function[^\(]*\(([^\)]*)\)/.exec(f.toString())[1];
    p = p.split(/\s*,\s*/);
    return (p[0] == "")?[]:p;
  }
  
  function self(a){
    return a;
  }
  
  function testfn(a){
    if (fnp(a))return a;
    return function (x){return x === a;};
  }
  
  //// List ////
  
  function lnullp(a){
    return arrp(a) && a.length == 0;
  }
  
  function car(a){
    return !udefp(a[0])?a[0]:[];
  }
  
  function cdr(a){
    return !udefp(a[1])?a[1]:[];
  }
  
  function cons(a, b){
    return [a, b];
  }
  
  function lsome(f, a){
    return lsome1(testfn(f), a);
  }
  
  function lsome1(f, a){
    if (lnullp(a))return false;
    if (f(car(a)))return true;
    return lsome1(f, cdr(a));
  }
  
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
    var arr = a.match(x);
    return nullp(arr)?-1:arr[0];
  }
  
  function mtchs(x, a){
    var arr = a.match(x);
    return nullp(arr)?[]:arr;
  }
  
  //// Error ////
  
  var errfunc = function (subj, data){};
  
  function err(f){
    var s = "Error: ";
    var a = head(f) + ": " + apply(strf, slc(arguments, 1));
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
  
  function last(a){
    return a[len(a)-1];
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
    argp: argp,
    fnp: fnp,
    udefp: udefp,
    nullp: nullp,
    
    is: is,
    inp: inp,
    
    disp: disp,
    dump: dump,
    
    ou: ou,
    out: out,
    alert: alert,
    pr: pr,
    prn: prn,
    al: al,
    
    coerce: coerce,
    tnum: tnum,
    tint: tint,
    tflt: tflt,
    tstr: tstr,
    
    len: len,
    pos: pos,
    rpl: rpl,
    slc: slc,
    poses: poses,
    add: add,
    rev: rev,
    group: group,
    rem: rem,
    copy: copy,
    split: split,
    apd: apd,
    map: map,
    clone: clone,
    nof: nof,
    has: has,
    
    push: push,
    tail: tail,
    pop: pop,
    join: join,
    ins: ins,
    del: del,
    
    alist: alist,
    alref: alref,
    aldel: aldel,
    ref: ref,
    del: del,
    keys: keys,
    vals: vals,
    
    str: str,
    strf: strf,
    
    apply: apply,
    call: call,
    head: head,
    parms: parms,
    self: self,
    testfn: testfn,
    
    lnullp: lnullp,
    car: car,
    cdr: cdr,
    cons: cons,
    lsome: lsome,
    
    elem: elem,
    text: text,
    clear: clear,
    
    mtch: mtch,
    mtchs: mtchs,
    
    err: err,
    errfn: errfn,
    
    pause: pause,
    evl: evl,
    emptyp: emptyp,
    time: time,
    last: last,
  }, $);
  
})(window);
