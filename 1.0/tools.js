/***** Tools 1.0 *****/

(function (window, undefined){
  function $(id){
    return document.getElementById(id);
  }
  
  function addAttributes(obj1, obj2){
    for (var a in obj1){
      obj2[a] = obj1[a];
    }
    
    return obj2;
  }
  
  window.$ = addAttributes({
    addAttributes: addAttributes
  }, $);
})(window);
