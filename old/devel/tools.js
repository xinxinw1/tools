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
  
  //// Converters ////
  
  function str(){
    var s = "";
    each(arguments, function (a){
      s += str1(a);
    });
    return s;
  }
  
  function str1(a){
    if (arrp(a) || argp(a)){
      var s = "[";
      if (a.length > 0){
        s += str1(a[0]);
        for (var i = 1; i < a.length; i++){
          s += ", " + str1(a[i]);
        }
      }
      s += "]";
      return s;
    }
    if (strp(a))return "\"" + a + "\"";
    if (fnp(a))return head(a);
    return String(a);
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
  
  function keys(obj){
    var a = [];
    for (var i in obj){
      a.push(i);
    }
    return a;
  }
  
  function vals(obj){
    var a = [];
    for (var i in obj){
      a.push(obj[i]);
    }
    return a;
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
  
  function clone(a){
    if (arrp(a))return map(clone, a);
    return a;
  }
  
  //// Error ////
  
  function err(f, a){
    for (var i = 2; i < arguments.length; i++){
      a = a.replace("$" + (i-1), str(arguments[i]));
    }
    throw "Error: " + head(f) + ": " + a;
  }
  
  //// Other ////
  
  function alert(a){
    var args = arguments;
    if (strp(a)){
      for (var i = 1; i < args.length; i++){
        a = a.replace("$" + i, str(args[i]));
      }
      win.alert(a);
    } else {
      win.alert(apply(str, args));
    }
  }
  
  function apply(f, a){
    return f.apply(this, a);
  }
  
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
    
    parms: parms,
    head: head,
    
    append: append,
    combine: combine,
    keys: keys,
    vals: vals,
    
    each: each,
    reveach: reveach,
    map: map,
    clone: clone,
    
    err: err,
    
    alert: alert,
    apply: apply,
    evl: evl
  }, $);
})(window);
