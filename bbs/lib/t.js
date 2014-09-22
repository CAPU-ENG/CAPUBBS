/*
	Copyright (c) 2013 Ivan Kuckir  ( ivan@kuckir.com )

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.
	
	
	History:
	
	22. 10. 2103
		Bug with delay removed.
	
	11. 10. 2013
		Implementing onStart, onStartParams, onUpdate, onUpdateParams, onComplete, onCompleteParams
	
	1. 3. 2013
		Tweener depends on framerate now, not expecting 60 fps 
	
	6. 6. 2012
		First version, addTween with time, delay and transition parameters
*/


var Tweener = 
{
	twns    : [],		// all tweens for object
	looping : false,	// if Tweener is looping
	_ptime  : 0,		// previous time
	def     : {			// default values
		time: 1,
		transition: "easeOutExpo",
		delay: 0,
		onStart: null,
		onStartParams: null,
		onUpdate: null,
		onUpdateParams: null,
		onComplete: null,
		onCompleteParams: null
	}
};


Tweener.addTween = function(o, ps)
{
	var T = Tweener;
	
	var tp = {}, prms = [], tgts = []; 
	for(var p in T.def)  tp[p] = ps[p] ? ps[p] : T.def[p];
	
	for(var p in ps)
	{
		if(T.def[p]) continue;
		prms.push(p);
		tgts.push(ps[p]);
		//bgns.push(o[p]);
		//cngs.push(ps[p]-o[p]);
		
	}
	if(tp.onStart) if(tp.onStartParams) tp.onStart.apply(null, tp.onStartParams);  else tp.onStart();
	
	T.twns.push(new T.Tween(o, tp, prms, tgts));
	T.loop();
}

Tweener.loop = function()
{
	var T = Tweener;
	if(!T.looping)
	{
		T._ptime = new Date().getTime();
		requestAnimFrame(T.step);
	}
	T.looping = true; 
}

Tweener.step = function()
{
	var T = Tweener;
	var ptime = T._ptime;
	T._ptime = new Date().getTime();
	var step = (T._ptime - ptime)*0.001;
	
	for(var i=0; i<T.twns.length; i++)
	{
		var t = T.twns[i];
		
		if(t.tp.delay > 0) t.tp.delay -= step;
		else
		{
			if(t.bgns.length==0)
				for(var j=0; j<t.prms.length; j++)
				{
					t.bgns.push(t.obj[t.prms[j]]);
					t.cngs.push(t.tgts[j]-t.bgns[j]);
				}
				
			t.t += step;
			var dur = t.tp.time;
			for(var j=0; j<t.prms.length; j++)
			{
				if(t.t > dur) t.obj[t.prms[j]] = t.bgns[j]+t.cngs[j]; 
				else t.obj[t.prms[j]] = Tweener.easingFunctions[t.tp.transition] (t.t, t.bgns[j], t.cngs[j], dur);
			}
			if(t.tp.onUpdate) if(t.tp.onUpdateParams) t.tp.onUpdate.apply(null, t.tp.onUpdateParams);  else t.tp.onUpdate();
			if(t.t > dur) 
			{
				T.twns.splice(i--, 1); 
				if(t.tp.onComplete) if(t.tp.onCompleteParams) t.tp.onComplete.apply(null, t.tp.onCompleteParams);  else t.tp.onComplete();
			}
		}
	}
	if(T.twns.length>0) requestAnimFrame(T.step);
	else T.looping = false;
}

/*
	Animation Frame
*/
if(window.requestAnimFrame == null) window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
	 window.webkitRequestAnimationFrame ||
	 window.mozRequestAnimationFrame ||
	 window.oRequestAnimationFrame ||
	 window.msRequestAnimationFrame ||
	 function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
	   window.setTimeout(callback, 1000/60);
	 };
})();


/*
	Tween class
*/
Tweener.Tween = function(obj, tp, prms, tgts)
{
	this.t   = 0;		// current time of tween (0 .. dur)
	this.obj = obj;		// object
	this.tp  = tp;		// tweening parameters

	this.prms = prms;	// parameter (string)
	this.tgts = tgts;
	this.bgns = [];	// starting value
	this.cngs = [];	// change (total during the whole tween)
}


Tweener.easingFunctions = 
{
	/*
		t - current time of tween
		b - starting value of property
		c - change needed in value
		d - total duration of tween
	*/
    easeNone: function(t, b, c, d) {
        return c*t/d + b;
    },    
    easeInQuad: function(t, b, c, d) {
        return c*(t/=d)*t + b;
    },    
    easeOutQuad: function(t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
    },    
    easeInOutQuad: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 *((--t)*(t-2) - 1) + b;
    },    
    easeInCubic: function(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    },    
    easeOutCubic: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
    },    
    easeInOutCubic: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
    },    
    easeOutInCubic: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeOutCubic(t*2, b, c/2, d);
        return Tweener.easingFunctions.easeInCubic((t*2)-d, b+c/2, c/2, d);
    },    
    easeInQuart: function(t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
    },    
    easeOutQuart: function(t, b, c, d) {
        return -c *((t=t/d-1)*t*t*t - 1) + b;
    },    
    easeInOutQuart: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 *((t-=2)*t*t*t - 2) + b;
    },    
    easeOutInQuart: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeOutQuart(t*2, b, c/2, d);
        return Tweener.easingFunctions.easeInQuart((t*2)-d, b+c/2, c/2, d);
    },    
    easeInQuint: function(t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
    },    
    easeOutQuint: function(t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
    },    
    easeInOutQuint: function(t, b, c, d) {
        if((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
    },    
    easeOutInQuint: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeOutQuint(t*2, b, c/2, d);
        return Tweener.easingFunctions.easeInQuint((t*2)-d, b+c/2, c/2, d);
    },    
    easeInSine: function(t, b, c, d) {
        return -c * Math.cos(t/d *(Math.PI/2)) + c + b;
    },    
    easeOutSine: function(t, b, c, d) {
        return c * Math.sin(t/d *(Math.PI/2)) + b;
    },    
    easeInOutSine: function(t, b, c, d) {
        return -c/2 *(Math.cos(Math.PI*t/d) - 1) + b;
    },    
    easeOutInSine: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeOutSine(t*2, b, c/2, d);
        return Tweener.easingFunctions.easeInSine((t*2)-d, b+c/2, c/2, d);
    },    
    easeInExpo: function(t, b, c, d) {
        return(t==0) ? b : c * Math.pow(2, 10 *(t/d - 1)) + b - c * 0.001;
    },    
    easeOutExpo: function(t, b, c, d) {
        return(t==d) ? b+c : c * 1.001 *(-Math.pow(2, -10 * t/d) + 1) + b;
    },    
    easeInOutExpo: function(t, b, c, d) {
        if(t==0) return b;
        if(t==d) return b+c;
        if((t/=d/2) < 1) return c/2 * Math.pow(2, 10 *(t - 1)) + b - c * 0.0005;
        return c/2 * 1.0005 *(-Math.pow(2, -10 * --t) + 2) + b;
    },    
    easeOutInExpo: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeOutExpo(t*2, b, c/2, d);
        return Tweener.easingFunctions.easeInExpo((t*2)-d, b+c/2, c/2, d);
    },    
    easeInCirc: function(t, b, c, d) {
        return -c *(Math.sqrt(1 -(t/=d)*t) - 1) + b;
    },    
    easeOutCirc: function(t, b, c, d) {
        return c * Math.sqrt(1 -(t=t/d-1)*t) + b;
    },    
    easeInOutCirc: function(t, b, c, d) {
        if((t/=d/2) < 1) return -c/2 *(Math.sqrt(1 - t*t) - 1) + b;
        return c/2 *(Math.sqrt(1 -(t-=2)*t) + 1) + b;
    },    
    easeOutInCirc: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeOutCirc(t*2, b, c/2, d);
        return Tweener.easingFunctions.easeInCirc((t*2)-d, b+c/2, c/2, d);
    },    
    easeInElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
    },    
    easeOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d)==1) return b+c;  if(!p) p=d*.3;
        if(!a || a < Math.abs(c)) { a=c; s=p/4; } else s = p/(2*Math.PI) * Math.asin(c/a);
        return(a*Math.pow(2,-10*t) * Math.sin((t*d-s)*(2*Math.PI)/p ) + c + b);
    },    
    easeInOutElastic: function(t, b, c, d, a, p) {
        var s;
        if(t==0) return b;  if((t/=d/2)==2) return b+c;  if(!p) p=d*(.3*1.5);
        if(!a || a < Math.abs(c)) { a=c; s=p/4; }       else s = p/(2*Math.PI) * Math.asin(c/a);
        if(t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    },    
    easeOutInElastic: function(t, b, c, d, a, p) {
        if(t < d/2) return Tweener.easingFunctions.easeOutElastic(t*2, b, c/2, d, a, p);
        return Tweener.easingFunctions.easeInElastic((t*2)-d, b+c/2, c/2, d, a, p);
    },    
    easeInBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
    },    
    easeOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
    },    
    easeInOutBack: function(t, b, c, d, s) {
        if(s == undefined) s = 1.70158;
        if((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
    },    
    easeOutInBack: function(t, b, c, d, s) {
        if(t < d/2) return Tweener.easingFunctions.easeOutBack(t*2, b, c/2, d, s);
        return Tweener.easingFunctions.easeInBack((t*2)-d, b+c/2, c/2, d, s);
    },    
    easeInBounce: function(t, b, c, d) {
        return c - Tweener.easingFunctions.easeOutBounce(d-t, 0, c, d) + b;
    },    
    easeOutBounce: function(t, b, c, d) {
        if((t/=d) <(1/2.75)) {
            return c*(7.5625*t*t) + b;
        } else if(t <(2/2.75)) {
            return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if(t <(2.5/2.75)) {
            return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
            return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
    },    
    easeInOutBounce: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeInBounce(t*2, 0, c, d) * .5 + b;
        else return Tweener.easingFunctions.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
    },    
    easeOutInBounce: function(t, b, c, d) {
        if(t < d/2) return Tweener.easingFunctions.easeOutBounce(t*2, b, c/2, d);
        return Tweener.easingFunctions.easeInBounce((t*2)-d, b+c/2, c/2, d);
    }
};
Tweener.easingFunctions.linear = Tweener.easingFunctions.easeNone;