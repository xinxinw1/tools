/***** Tools 1.2 *****/

(function (window, undefined){
  function $(a){
    return document.getElementById(a);
  }
  
  function addAttributes(obj1, obj2){
    for (var a in obj1){
      obj2[a] = obj1[a];
    }
    
    return obj2;
  }
  
  function clearChildren(node){
    while (node.hasChildNodes()){
      node.removeChild(node.firstChild);
    }
  }
  
  function newElem(name){
    return document.createElement(name);
  }
  
  function newTextNode(text){
    return document.createTextNode(text);
  }
  
  function globalEval(data){
		(window.execScript || function (data){
      window["eval"].call(window, data);
    })(data);
	}
	
	function isStr(a){
	  return Object.prototype.toString.call(a) == "[object String]";
	}
	
	function isArr(a){
	  if (Array.isArray){
	    return Array.isArray(a);
	  } else {
	    return Object.prototype.toString.call(a) == "[object Array]";
	  }
	}
	
	function isArgs(a){
	  return Object.prototype.toString.call(a) == "[object Arguments]";
	}
	
	function isFunc(a){
	  return Object.prototype.toString.call(a) == "[object Function]";
	}
	
	function isFalse(a){
    return a === false;
  }
  
  function toStr(a){
    if (isArr(a) || isArgs(a)){
      var str = "[";
      if (a.length > 0){
        str += toStr(a[0]);
        for (var i = 1; i < a.length; i++){
          str = str + ", " + toStr(a[i]);
        }
      }
      str += "]";
      return str;
    } else if (isStr(a)){
      return "\"" + a + "\"";
    } else if (a === null){
      return "null";
    } else {
      return String(a);
    }
  }
  
  function cloneArr(a){
    if (isArr(a)){
      var a2 = [];
      for (var i = 0; i < a.length; i++){
        a2[i] = cloneArr(a[i]);
      }
      return a2;
    } else {
      return a;
    }
  }
  
  // http://stackoverflow.com/a/1357494
  function getParams(f){
    var params = /function[^\(]*\(([^\)]*)\)/.exec(f.toString())[1];
    params = params.split(/\s*,\s*/);
    if (params[0] == "")return [];
    return params;
  }
  
  function getFuncName(f){
    return /function\s*([^\(]*\(([^\)]*)\))/.exec(f.toString())[1];
  }
  
  window.$ = addAttributes({
    addAttributes: addAttributes,
    clearChildren: clearChildren,
    newElem: newElem,
    newTextNode: newTextNode,
    globalEval: globalEval,
    isStr: isStr,
    isArr: isArr,
    isArgs: isArgs,
    isFunc: isFunc,
    isFalse: isFalse,
    toStr: toStr,
    cloneArr: cloneArr,
    getParams: getParams,
    getFuncName: getFuncName
  }, $);
})(window);
