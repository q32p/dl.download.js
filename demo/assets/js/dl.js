(function(scope){
/* node.js or browser */
var gl = (scope.window === undefined) ? scope.global : scope.window; 
is_object = gl.is_object = function(v){return v === null ? 0 : ((typeof v) == 'object');},
is_array = gl.is_array = function(v){return ( v instanceof Array );},
is_number = gl.is_number = function(v){return (typeof v) == 'number';},
is_numeric = gl.is_numeric = function(v){return (!isNaN(parseFloat(v)) && isFinite(v));},
is_func = gl.is_func = function(v){return (typeof v) == 'function';},
is_string = gl.is_string = function(v){return (typeof v) == 'string';},
is_scalar = gl.is_scalar = function(v){return (/string|number|boolean/).test(typeof v);},
is_empty = gl.is_empty = function(m){
	if(!is_object(m))return !m;
	if(is_array(m))return m.length < 1;
	for(var k in m)return 0;
	return 1;
},

dl = gl.dl = is_object(scope.module)?(module.exports = {}):{},

merge = dl.merge = function(b,l){
	var a = b;
	if(is_array(a)){l = intval(l);}else{a = arguments; l = 0;}
	var t,i,j = a.length;
	for(i = j - 1; i > -1; i--){
	    if((t = a[i]) !== undefined)break;
	}
	if(l < 0 || !is_object(t) || is_array(t))return t;
	l--;
	var d = {},i,k;
	for(i = 0; i < j; i++){
		if(!is_object(t = a[i]) || is_array(t))continue;
		for(k in t)d[k] = merge([ d[k], t[k] ],l);
	}
    return d;
},
compare = dl.compare = function(d,s){
    if(d === s)return 1;
    var a = is_object(d), b = is_object(s);
	if(a){if(b){for(var k in d){if(!compare(d[k],s[k]))return 0;}return 1;}return 0;}
	if(b)return 0;
	return d == s;
},
intval = (function(z){
	function g(m){
		function f(n,d){ var t = typeof n;
			return t == 'number' ? n : (t == 'boolean' ? (n ? 1 : 0) : (t == 'string' ? ( isNaN(n = m(n)) ? d||0 : n ) : d||0 ) );
		}
		return function(v,d,n,a){return (v = f(v,d)) < (a||0) && n !== undefined ? n : v;};
	}
	z.floatval = g(parseFloat)
	return z.intval = g(parseInt);
})(gl),
objectval = gl.objectval = function(v,d){return is_object(v) ? v : (d === undefined ? {} : d);},
arrayval = gl.arrayval = function(v,d){return is_array(v) ? v : (d === undefined ? (v === undefined ? [] : [ v ]) : d);},
unarray = gl.unarray = function(s){
	if(!is_object(s))return s;
	var d = {};
	if(is_array(s)){for(var i = 0; i < s.length; i++)d[i] = unarray(s[i]);return d;}
	for(var k in s)d[k] = unarray(s[k]);
	return d;
},
clone = dl.clone = function(s,l,a){
    if(!is_object(s))return s;
	if(is_array(s))return array_clone(s,l,a);
	if((l = intval(l)) < 0)return s;
    var d = {}, k, v;
    l--;
    if(is_vector(a)){
        for(var i = 0; i < a.length; i++){
            k = a[i];
            if( (v = s[k]) === undefined)continue;
			if(!is_object(v)){d[k] = v;continue;}
			if(is_vector(v)){d[k] = array_clone(v,l,a);continue;}
            d[k] = clone(v,l,a);
        }
        return d;
    }
    for(k in s){
		if(!is_object(v = s[k])){d[k] = v;continue;}
        if(is_vector(v)){d[k] = array_clone(v,l,a);continue;}
        d[k] = clone(v,l,a);
    }
    return d; 
},
array_clone = gl.array_clone = function(s,l,a){
	if( (l = intval(l)) < 0)return s;
    var d = [];
    if(l){l--;for(var i = 0; i < s.length; i++)d.push(clone(s[i],l,a));return d;}
    for(var i = 0; i < s.length; i++)d.push(s[i]);
    return d;
},
object_rewrite = gl.object_rewrite = function(d,s){
    var k;
    if(!is_object(d))d = {};
    for(k in d)delete d[k];
    if(!is_object(s))return d;
    for(k in s)d[k] = s[k];
    return d;
},
// dst,src,nocopy,copy
object_sync = gl.object_sync = function(d,s,a,b){
    if(!is_object(d))d = {};
    if(d === s || !is_object(s))return d;
    if(is_string(a))a = [ a ];
    var k,i,t = 0;
    if(is_vector(a)){ t = {};
        for(i = 0; i < a.length; i++){
            if(d[k = a[i]] === undefined)continue;
			t[k] = d[k];
        }     
    }
	if(is_string(b))b = [ b ];
    if(is_vector(b)){
        for(i = 0; i < b.length; i++){
            if(s[k = b[i]] === undefined)continue;
			d[k] = s[k];
        }
    }else for(k in s)d[k] = s[k];
	if(t){for(k in t)d[k] = t[k]; return d;}
    if(is_object(a)){for(k in a)d[k] = a[k];}
    return d;
},
srorage_set = gl.srorage_set = function(s,a,v){
    if(!is_object(v))return s[a] = v;
    var d = s[a];
    if(d === v)return d;
    if(!is_object(d))d = s[a] = {};
    var k,w;
    for(k in v){
		if(!is_object(w = v[k])){d[k] = w;continue;}
		if(is_vector(w)){d[k] = w;continue;}
        srorage_set(d,k,w);        
    }
    return d;
},
Timeout = dl.Timeout = function(o){
	var s = this,c,r = function(){var a = o.callback;if(is_func(a))a();};
	o = s.options = objectval(o);
    s.run = function(d){
		if(is_func(c))c();
		if((d = intval(d,0,intval(o.delay),1)) < 1){r();return;}
		var z = 0;
		c = function(){z = 1;};
		setTimeout(function(){if(z)return;r();},d);
	};
	s.force = function(){if(is_func(c))c();r();};
	s.cancel = function(){if(is_func(c))c();};
},
Interval = dl.Interval = (function(){
	var d = 500, m = 25;
	return function(o){
		var s = this, i = s.i = 0, v, c = 1,
		r = function(){
			if(c)return;
			var a = intval(v,intval(o.delay,d),m,m), f = o.callback;
			if(is_func(f))f(i);
			t.run(a);
			i++;
			s.i = i;
		},
		t = new Timeout({delay:d,callback:r}),
		o = s.options = objectval(o),
		p = function(a){t.cancel(); v = a; i = s.i = 0; c = 0;};
		s.run = function(a){p(a); r();};
		s.next = function(a){p(a); t.run(intval(a,intval(o.delay,d),m,m));};
		s.cancel = function(){c = 1; t.cancel();};
	};
})(),
Counter = dl.Counter = (function(){
	var d = 500, m = 25;
	return function(o){
		var s = this, i = s.i = 0, v,
		r = function(){
			if(i < 1)return;
			var a = intval(v,intval(o.delay,d),m,m), f = o.callback;
			if(is_func(f))f(i);
			t.run(a);
			i--;
			s.i = i;
		},
		t = new Timeout({delay:d,callback:r}),
		o = s.options = objectval(o),
		p = function(a,w){t.cancel(); v = a; i = s.i = intval(w,intval(o.count),0);};
		s.run = function(a,w){p(a); r();};
		s.next = function(a,w){p(a); t.run(intval(a,intval(o.delay,d),m,m));};
		s.cancel = function(){w = 0; t.cancel();};
	};
})(),
Storage = dl.Storage = function(o){
	function setter(d){
		var f = o.setter;
		if(is_func(f))f(d);
	}
	function getter(){
		var f = o.getter;
		return is_func(f) ? f() : {};
	}
	var s = this, d = {}, a = [], p = {},
	r = s.reset = function(w){
		d = objectval(w); a = [];
		var b = [];
		for(var k in d){
			if(d[k] !== p[k])b.push(k);
			p[k] = d[k];
			a.push(k);
		}
		return b;
	},
	c = s.setItem = function(k,v){
		if(v === undefined)v = null;
		if(v === null){
			if(d[k] === undefined)return;
			delete d[k];
			a.removeOf(k);
		}else{
			d[k] = v;
			a.setOf(k);
		}
		setter(d);
	};
	o = s.options = objectval(o);
	r(getter());
	s.clear = function(){ a = []; setter(d = {});};
	s.__defineSetter__('length', function(l){
		l = intval(l,a.length,0);
		while(a.length > l)delete d[a.pop()];
		return a.length;
	});
	s.__defineGetter__('length', function(){return a.length;});
	s.key = function(i){return a[i];};
	s.getItem = function(k){return d[k];};
	s.removeItem = function(k){c(k,null);};
},
proto = function(t,p,f){t.prototype[p] = t.prototype[p] || f;};
/* prototype */
proto(Array,'clone',function(l,a){return array_clone(this,l,a);});
proto(Array,'indexOf',function(v){for(var i = 0; i < this.length; i++){if(this[i] === v)return i;}return -1;});
proto(Array,'removeOf',function(v){
    var i = this.length - 1, s = 0;
    while(i > -1){if(this[i] === v){this.splice(i,1);s = 1;}i--;}
    return s;
});
proto(Array,'setOf',function(v){if(this.indexOf(v) > -1)return 0;this.push(v);return 1;});
proto(Array,'pushBy',function(a,s){
    if(!is_object(s))return 0;
	var i,e = 0;
    if(is_vector(s)){for(i = 0; i < s.length; i++)e = this.pushBy(a,s[i])||e; return e;}
    if(!is_vector(a))a = [ a ];
    var k,j,b,o = is_object(s);
    for(i = 0; i < this.length; i++){
		b = this[i]; e = 1;
        for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (o ? s[k] : s)){e = 0;break;}}
        if(e)return this[i] = s;
    }
    this.push(s);
    return 1;
});
proto(Array,'removeBy',function(a,s){
    var i,e = 0;
    if(is_vector(s)){for(i = s.length - 1;  i > -1; i--)e = this.removeBy(a,s[i])||e;return e;}
    if(!is_vector(a))a = [ a ];
	var k,j,b,c,o = is_object(s);
    for(var i = this.length - 1;  i > -1; i--){
		b = this[i]; c = 0;
        for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (o ? s[k] : s)){c = 1;break;}}
        if(c)continue;
        this.splice(i,1);
        e = 1;
    }
    return e;
});
proto(Array,'getBy',function(a,s){
	var i,b,j,c,o = is_object(s), d = [];
	if(!is_vector(a))a = [ a ];
    if(is_vector(s)){	
		var t = [],v,h;
		for(i = 0;  i < this.length; i++)t.push(this[i]);
		for(i = 0;  i < s.length; i++){
			v = s[i]
			for(h = 0; h < t.length; h++){
				b = t[h]; c = 0;
				for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (is_object(v) ? v[k] : v)){c = 1;break;}}
				if(c)continue;
				d.concat(t.splice(h,1));
			}
		}
		return d;
    }
    for(i = 0; i < this.length; i++){
		b = this[i]; c = 0;
		for(j = 0; j < a.length; j++){if(b[ k = a[j] ] != (o ? s[k] : s)){c = 1;break;}}
		if(c)continue;
		d.push(b);
    }
	return d;
});
proto(Array,'resetAll',function(s){
	var v,k,i;
	if(is_object(s)){
		for(i = 0; i < this.length; i++){
			if( !is_object(v = this[i]) )v = this[i] = {};
			for(k in s)v[k] = s[k];
		}
		return this;
	}
    for(i = 0; i < this.length; i++)this[i] = s;
	return this;
});
proto(String,'fromJSON',function(){
	try{ return JSON.parse(this); }catch(e){}
	return null;
});
proto(Array,'syncBy',function(key,s,nocopy,ret,copy){
    if(this === s || !is_object(s))return 0;
	var i;
	if(!is_vector(key))key = [ key ];
    if(is_array(s)){
		var t = [];
		for(i = 0; i < this.length; i++)t.push(this[i]);			
        for(i = 0; i < s.length; i++)t.removeBy(key, this.syncBy(key,s[i],nocopy,0,copy) );
		if(ret)return t;
		for(i = 0; i < t.length; i++)this.removeBy(key,t[i]);
        return t;
    }
    var k,j,b,m,o = is_object(s);
    for(i = 0; i < this.length; i++){
		m = this[i];
        b = 1;
        for(j = 0; j < key.length; j++){
            if(m[k = key[j]] != (o ? s[k] : s)){b = 0;break;}
        }
        if(b)return this[i] = object_sync(this[i],s,nocopy,copy);
    }
    this.push(s);
    return s;
});

(function(){
var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, reg = /[-[\]{}()*+?.,\\^$|#\s]/g;
//экранирование спец.символов в регулярном выражении
dl.regesc = function(s){return is_scalar(s) ? String(s).replace(reg,"\\$&") : '';};
proto(String,'trim',function(){return this.replace(rtrim,'');});
proto(String,'regesc',function(){return this.replace(reg,"\\$&");});
})();

/* dateFormat */
var dateFormat = dl.dateFormat = function(){var token=/d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,timezone=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,timezoneClip=/[^-+\dA-Z]/g,pad=function(val,len){val=String(val);len=len||2;while(val.length<len)val="0"+val;return val;};return function(date,mask,utc){var dF=dateFormat;if(arguments.length==1&&Object.prototype.toString.call(date)=="[object String]"&&!/\d/.test(date)){mask=date;date=undefined;}
date=date?new Date(date):new Date;if(isNaN(date))throw SyntaxError("invalid date");mask=String(dF.masks[mask]||mask||dF.masks["default"]);if(mask.slice(0,4)=="UTC:"){mask=mask.slice(4);utc=true;}
var _=utc?"getUTC":"get",d=date[_+"Date"](),D=date[_+"Day"](),m=date[_+"Month"](),y=date[_+"FullYear"](),H=date[_+"Hours"](),M=date[_+"Minutes"](),s=date[_+"Seconds"](),L=date[_+"Milliseconds"](),o=utc?0:date.getTimezoneOffset(),flags={d:d,dd:pad(d),ddd:dF.i18n.dayNames[D],dddd:dF.i18n.dayNames[D+7],m:m+1,mm:pad(m+1),mmm:dF.i18n.monthNames[m],mmmm:dF.i18n.monthNames[m+12],yy:String(y).slice(2),yyyy:y,h:H%12||12,hh:pad(H%12||12),H:H,HH:pad(H),M:M,MM:pad(M),s:s,ss:pad(s),l:pad(L,3),L:pad(L>99?Math.round(L/10):L),t:H<12?"a":"p",tt:H<12?"am":"pm",T:H<12?"A":"P",TT:H<12?"AM":"PM",Z:utc?"UTC":(String(date).match(timezone)||[""]).pop().replace(timezoneClip,""),o:(o>0?"-":"+")+pad(Math.floor(Math.abs(o)/60)*100+Math.abs(o)%60,4),S:["th","st","nd","rd"][d%10>3?0:(d%100-d%10!=10)*d%10]};return mask.replace(token,function($0){return $0 in flags?flags[$0]:$0.slice(1,$0.length-1);});};}();dateFormat.masks={"default":"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",mediumDate:"mmm d, yyyy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",shortTime:"h:MM TT",mediumTime:"h:MM:ss TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:ss",isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"};dateFormat.i18n={dayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"]};
proto(Date,'format',function(mask,utc){return dateFormat(this,mask,utc);});


})(this);
