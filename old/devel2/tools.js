/***** Tools Devel *****/

(function (win, undef){
  //// DOM functions ////
  
  var doc = win.document;
  
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
  
  //// Type ////
  
  function type(a){
    return Object.prototype.toString.call(a);
  }
  
  //// Predicates (is... functions) ////
  
  function objp(a){
	  return type(a) == "[object Object]";
	}
  
  function strp(a){
	  return type(a) == "[object String]";
	}
	
	function nump(a){
	  return type(a) == "[object Number]";
	}
	
	function arrp(a){
	  if (Array.isArray)return Array.isArray(a);
	  return type(a) == "[object Array]";
	}
	
	function argp(a){
	  return type(a) == "[object Arguments]";
	}
	
	function fnp(a){
	  return type(a) == "[object Function]";
	}
	
	function undefp(a){
    return type(a) == "[object Undefined]";
  }
  
  function falsep(a){
    return a === false;
  }
  
  function inp(a){
    for (var i = 1; i < arguments.length; i++){
      if (arguments[i] === a)return true;
    }
    return false;
  }
  
  function emptyp(a){
    return inp(a, "", null, "null");
  }
  
  //// Strings ////
  
  function str(){
    var s = "";
    each(arguments, function (a){
      s += str1(a);
    });
    return s;
  }
  
  var items = [];
  
  function str1(a){
    items = cons(a, items);
    var ret = str2(a);
    items = cdr(items);
    return ret;
  }
  
  function str2(a){
    if (arrp(a) || argp(a)){
      if (some(a, cdr(items)))return "[...]";
      return "[" + join(a, ", ", str1) + "]";
    }
    if (strp(a))return "\"" + a + "\"";
    if (fnp(a))return head(a);
    if (objp(a)){
      if (some(a, cdr(items)))return "{...}";
      var r = [];
      for (var i in a){
        r.push(i + ": " + str1(a[i]));
      }
      return "{" + join(r, ", ") + "}";
    }
    return String(a);
  }
  
  function strf(a){ // string fill
    var args = arguments;
    if (strp(a)){
      for (var i = 1; i < args.length; i++){
        a = a.replace("$" + i, str(args[i]));
      }
      return a;
    }
    return apply(str, args);
  }
  
  //// Function reflect ////
  
  // http://stackoverflow.com/a/1357494
  // function test(a, b, c) -> ["a", "b", "c"]
  function parms(f){
    var p = /function[^\(]*\(([^\)]*)\)/.exec(f.toString())[1];
    p = p.split(/\s*,\s*/);
    return (p[0] == "")?[]:p;
  }
  
  // function test(a, b, c) -> "test(a, b, c)"
  function head(f){
    var name = /function\s*([^\(]*\(([^\)]*)\))/.exec(f.toString())[1];
    return (name[0] == "(")?"function" + name:name;
  }
  
  //// Objects ////
	
	function append(o1, o2){
    for (var a in o1){
      o2[a] = o1[a];
    }
    return o2;
  }
  
  function combine(){
    var obj = {};
    each(arguments, function (a){
      for (var i in a){
        obj[i] = a[i];
      }
    });
    return obj;
  }
  
  function assoc(obj){
    var r = [];
    for (var i in a){
      r.push([i, a[i]]);
    }
    return r;
  }
  
  function keys(obj){
    return map(car, assoc(obj));
  }
  
  function vals(obj){
    return map(cdr, assoc(obj));
  }
  
  //// Arrays ////
  
  function each(a, f){
    for (var i = 0; i < a.length; i++){
      f(a[i]);
    }
  }
  
  function reveach(a, f){
    for (var i = a.length-1; i >= 0; i--){
      f(a[i]);
    }
  }
  
  function map(f, a){
    var a2 = [];
    for (var i = 0; i < a.length; i++){
      a2[i] = f(a[i]);
    }
    return a2;
  }
  
  function slice(a, n, m){
    if (m === undef)m = a.length;
    var r = [];
    for (var i = n; i < m; i++){
      r.push(a[i]);
    }
    return r;
  }
  
  function join(a, sep, fn){
    if (sep === undef)sep = ", ";
    if (fn === undef)fn = self;
    var s = "";
    if (a.length > 0){
      s += fn(a[0]);
      for (var i = 1; i < a.length; i++){
        s += sep + fn(a[i]);
      }
    }
    return s;
  }
  
  function copy(a){
    return map(self, a);
  }
  
  function clone(a){
    if (arrp(a))return map(clone, a);
    return a;
  }
  
  //// Lists ////
  
  function car(a){
    return (a[0] !== undef)?a[0]:[];
  }
  
  function cdr(a){
    return (a[1] !== undef)?a[1]:[];
  }
  
  function cons(a, b){
    return [a, b];
  }
  
  function nullp(a){
    return $.arrp(a) && a.length == 0;
  }
  
  function testfn(a){
    if (fnp(a))return a;
    return function (x){return x === a;};
  }
  
  function some(f, a){
    return some1(testfn(f), a);
  }
  
  function some1(f, a){
    if (nullp(a))return false;
    if (f(car(a)))return true;
    return some1(f, cdr(a));
  }
    
  
  //// Functions ////
  
  function self(a){
    return a;
  }
  
  function apply(f, a){
    return f.apply(this, a);
  }
  
  //// Error ////
  
  function err(f, a){
    a = apply(strf, slice(arguments, 1));
    throw "Error: " + head(f) + ": " + a;
  }
  
  //// Output ////
  
  function alert(){
    win.alert(apply(strf, arguments));
  }
  
  function pr(){
	  doc.write(apply(strf, arguments));
	}
	
	function prn(){
	  doc.writeln(apply(strf, arguments));
	}
  
  //// Other ////
  
  function pause(t){
    var date = new Date();
    var curr;
    do {
      curr = new Date();
    } while (curr - date < t);
  }
  
  function evl(a){
		(win.execScript || function (a){
      win["eval"].call(win, a);
    })(a);
	}
	
	//// Object exposure ////
  
  win.$ = append({
    elem: elem,
    text: text,
    clear: clear,
    
    objp: objp,
    strp: strp,
    nump: nump,
    arrp: arrp,
    argp: argp,
    fnp: fnp,
    undefp: undefp,
    falsep: falsep,
    inp: inp,
    emptyp: emptyp,
    
    str: str,
    strf: strf,
    
    parms: parms,
    head: head,
    
    append: append,
    combine: combine,
    keys: keys,
    vals: vals,
    
    each: each,
    reveach: reveach,
    map: map,
    slice: slice,
    copy: copy,
    clone: clone,
    
    self: self,
    apply: apply,
    
    err: err,
    
    alert: alert,
    pr: pr,
    prn: prn,
    
    pause: pause,
    evl: evl
  }, $);
})(window);
