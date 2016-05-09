/***** Tools Iterator *****/

(function (udf){
  if (typeof window !== 'undefined'){
    var $ = window.$;
  } else {
    var $ = require('./tools.js');
  }
  
  var udfp = $.udfp;
  var timer = $.timer;
  var max = $.max;
  var everyn = $.everyn;
  
  function itr(f, n){
    if (udfp(n))n = 0; // n = ms/run
    
    var runner;
    var needreset = true;
    var timr;
    var runs;
    var isstarted = false;
    
    function run(){
      if (needreset){
        runs = 0;
        timr = timer();
        needreset = false;
      }
      //console.log("behind: " + (timr.time()-(runs*n)));
      f();
      runs++;
      runner = setTimeout(run, max((runs*n)-timr.time(), 0));
    }
    
    var onstart = function (){};
    var onstop = function (){};
    
    function started(){
      return isstarted;
    }
    
    function start(){
      if (!started()){
        onstart();
        isstarted = true;
        run();
      }
    }
    
    function stop(){
      if (started()){
        clearTimeout(runner);
        runner = udf;
        needreset = true;
        isstarted = false;
        onstop();
      }
    }
    
    function startstop(){
      if (!started())start();
      else stop();
    }
    
    function interval(n2){
      n = n2;
      needreset = true;
    }
    
    return {
      start: start,
      stop: stop,
      startstop: startstop,
      started: started,
      set onstart(f){onstart = f},
      set onstop(f){onstop = f;},
      interval: interval
    }
  }
  
  function itrspeed(f, s){
    if (udfp(s))s = 50; // s = runs/sec
    
    var runner = itr(f);
    
    function speed(s){
      runner.interval(Math.round(1000/s));
    }
    
    speed(s);
    
    return {
      start: runner.start,
      stop: runner.stop,
      startstop: runner.startstop,
      started: runner.started,
      set onstart(f){runner.onstart = f},
      set onstop(f){runner.onstop = f;},
      speed: speed
    };
  }
  
  function itrrefresh(f, s, r){
    if (udfp(s))s = 50; // s = runs/sec
    if (udfp(r))r = 1; // r = refs/sec
    
    var runner = itrspeed(run, s);
    
    var onstart = function (){};
    var onstop = function (){};
    
    runner.onstart = function (){
      onstart();
    };
    
    runner.onstop = function (){
      refresher.reset();
      onstop();
    };
    
    function run(){
      f();
      refresher.check();
    }
    
    var refresher = everyn(refresh);
    
    var onrefresh = function (state){};
    
    function refresh(){
       onrefresh();
    }
    
    function refspeed(r2){
      r = r2;
      updateRefresher();
    }
    
    function speed(s2){
      s = s2;
      updateRefresher();
      runner.speed(s2);
    }
    
    function getSpeed(){
      return s;
    }
    
    function getRefspeed(){
      return r;
    }
    
    function updateRefresher(){
      var runsPerRef = Math.round(s/r);
      refresher.setn(runsPerRef);
      //console.log("runsPerRef " + runsPerRef);
    }
    
    updateRefresher();
    
    return {
      set onstart(f){onstart = f;},
      set onstop(f){onstop = f;},
      set onrefresh(f){onrefresh = f;},
      start: runner.start,
      stop: runner.stop,
      startstop: runner.startstop,
      started: runner.started,
      speed: speed,
      refresh: refresh,
      refspeed: refspeed,
      getSpeed: getSpeed,
      getRefspeed: getRefspeed,
      runner: runner
    };
  }
  
  $.att($, {
    itr: itr,
    itrspeed: itrspeed,
    itrrefresh: itrrefresh
  });
  
  if ($.nodep){
    module.exports = $;
  }
})();
