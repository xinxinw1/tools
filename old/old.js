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

function slice(a, n, m){
  if (m === undef)m = a.length;
  var r = [];
  for (var i = n; i < m; i++){
    r.push(a[i]);
  }
  return r;
}

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

function keys(a){
  var arr = [];
  for (var i in a){
    push(i, arr);
  }
  return arr;
}

function vals(a){
  var arr = [];
  for (var i in a){
    push(a[i], arr);
  }
  return arr;
}

var errfunc = function (subj, data){};

function err(f){
  throw "Error: " + head(f) + ": " + apply(strf, slc(arguments, 1));
}

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
  err(rem, "Can't rem x = $1 from a = $2", x, a);
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
    err(has1, "Can't find if str a = $1 has x = $2", a, x);
  }
  if (arrp(a)){
    for (var i = 0; i < len(a); i++){
      if (is(a[i], x))return true;
    }
    return false;
  }
  err(has1, "Can't find if a = $1 has x = $2", a, x);
}

function join(a, x){
  var s = "";
  if (len(a) > 0){
    s += str1(a[0]);
    for (var i = 1; i < len(a); i++){
      s += x + str1(a[i]);
    }
  }
  return s;
}

function reduc(f, x, a){
  if (udefp(a))return reduc1(f, x);
  return reduc1(f, head(a, x));
}

function reduc1(f, a){
  if (len(a) == 0)return f();
  if (len(a) == 1)return f(a[0]);
  var s = a[0];
  for (var i = 1; i < len(a); i++){
    s = f(s, a[i]);
  }
  return s;
}

function tarr(a){
  if (strp(a)){
    var r = [];
    for (var i = 0; i < len(a); i++){
      push(a[i], r);
    }
    return r;
  }
}

function tobj(a){
  if (arrp(a)){
    var o = {};
    for (var i = 0; i < len(a); i++){
      o[prop(a[i][0])] = a[i][1];
    }
    return o;
  }
}

function pos(x, a, n){
  if (strp(a)){
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
}

function posl(x, a, n){
  if (strp(a)){
    if (arrp(x)){
      var m = -1; // max
      var curr;
      for (var i = 0; i < len(x); i++){
        curr = posl(x[i], a, n);
        if (curr != -1){
          if (m != -1)m = Math.max(m, curr);
          else m = curr;
        }
      }
      return m;
    }
  }
}

function rpl(x, y, a){
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
}

function poss(x, a){
  if (arrp(a)){
    if (arrp(x)){
      // return sort(apply(add, map(fn(_)poss(_, a), x)))
      var r = [];
      for (var i = 0; i < len(a); i++){
        for (var k = 0; k < len(x); k++){
          if (x[k] === a[i])push(i, r);
        }
      }
      return r;
    }
  }
}

function poss(x, a){
  if (arrp(a)){
    if (arrp(x)){
      // return sort(apply(add, map(fn(_)poss(_, a), x)))
      var r = [];
      for (var i = 0; i < len(a); i++){
        if (has(a[i], x))push(i, r);
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
  }
  err(poss, "Can't get poses of x = $1 in a = $2", x, a);
}

function split(a, x){
  if (arrp(a)){
    var last = 0;
    var r = reduc(function (r, s, i){
      if (s === x){
        last = i+1;
        return push(slc(a, last, i), r);
      }
      return r;
    }, [], a);
    return push(slc(a, last, len(a)), r);
  }
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

function apd(x, a){
  if (arrp(a)){
    if (arrp(x)){
      for (var i = 0; i < len(x); i++){
        push(x[i], a);
      }
      return a;
    }
  }
}

function map(f, a){
  if (arrp(a)){
    var r = [];
    for (var i = 0; i < len(a); i++){
      push(f(a[i]), r);
    }
    return r;
  }
}

function rpl(x, y, a){
  if (arrp(a)){
    if (arrp(x)){
      return reduc(function (r, i){
        var k = pos(i, x);
        if (k == -1)return push(i, r);
        return push(arrp(y)?y[k]:y, r);
      }, [], a);
    }
  }
}

function poss(x, a){
  if (arrp(a)){
    if (arrp(x)){
      // (sort (apply + (map #[poss _ a] x)))
      return reduc(function (r, a, i){
        if (has(a, x))return push(i, r);
        return r;
      }, [], a);
    }
  }
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

function emptyp(a){
  return inp(a, udef, "", null, "null");
}

function psh(x, a){
  if (arrp(a)){
    if (irrp(a))err(psh, "Can't push x = $1 onto uarr a = $2", x, a);
    a.push(x);
    return a;
  }
  if (objp(a)){
    a[x[0]] = x[1];
    return a;
  }
  err(psh, "Can't push x = $1 onto a = $2", x, a);
}

function nam(a){
  return doc.getElementsByName(a);
}

function dobj(a){
  var r = [];
  for (var i in a){
    psh(i + ": " + dsp(a[i]), r);
  }
  return "{" + join(r, ", ") + "}";
}

function dsp1(a){
  if (objp(a)){
    if (L.has(a, L.cdr(ds)))return "{...}";
    return "{" + join(map(function (x){
      return x[0] + ": " + dsp(x[1]);
    }, tarr(a)), ", ") + "}";
  }
}

function dobj(a){
  return "{" + rdc(function (s, x, i){
    if (s == "")return i + " " + dsp(x);
    return s + " " + i + " " + dsp(x);
  }, "", a) + "}";
}

function att(x, a){
  if (arrp(a)){
    if (arrp(x))return rdc(function (a, i){
      return psh(i, a);
    }, a, x);
    return psh(x, a);
  }
}

// slow when called many times
function beg(a){
  var x = sli(arguments, 1);
  if (strp(a))return pos(x, a) == 0;
  if (arrp(a) || htmp(a))return has(fst(a), x);
  err(beg, "Can't find if a = $1 begs with x = $2", a, x);
}

// slow when called many times
function end(a){
  var x = sli(arguments, 1);
  if (strp(a)){
    var c;
    for (var i = 0; i < len(x); i++){
      c = pol(x[i], a);
      if (c != -1 && c == len(a)-len(x[i]))return true;
    }
    return false;
  }
  if (arrp(a) || htmp(a))return has(las(a), x);
  err(end, "Can't find if a = $1 ends with x = $2", a, x);
}

function sli(a, n, m){
  if (udfp(m))m = len(a);
  if (n < 0)n = 0;
  if (m < 0)m = 0;
  if (n > len(a))n = len(a);
  if (m > len(a))m = len(a);
  if (n > m)m = n;
  if (strp(a))return a.substring(n, m);
  if (arrp(a))return (irrp(a)?cpy(a):a).slice(n, m);
  if (htmp(a))return sli(kids(a), n, m);
  err(sli, "Can't slice a = $1 from n = $2 to m = $3", a, n, m);
}


