var $window = $(window), $body = $('body'), $document = $(document);
(function($){
	dl.create = function(s){
		s = objectval(s);
		var d = document.createElement(s.name || 'x'), e = $(d);
		if(is_string(s.src))d.src = s.src;
		if(is_object(s.attr))e.attr(s.attr);
		if(is_object(s.css))e.css(s.css);
		if(is_string(s.html))e.html(s.html);
		if(is_string(s.text))e.text(s.text);
		if(is_string(s['class']))e.addClass(s['class']);
		return e;
	}; 
	$.fn.less = function(){
		if(!is_object(less))return;
		less.render($(this).text(),function(e,s){
			$body.append(dl.create({name:'style',text:s.css}));
		});
	};
	$("script[type='text/less']").less();
})(jQuery);

var app = angular.module('app', [ ]);
app.config([function(){}]);
app.controller('ScopeCtrl',function($scope){});

app.run(['$rootScope',function($rootScope){
	$rootScope['if'] = function(v,thenV,elseV){return v ? thenV : (elseV === undefined ? '' : elseV);};
	$rootScope['int'] = intval;
	var apply = function(){
		$rootScope.$apply();
	}, loader = $rootScope.loader = function(options){
		options = objectval(options);
		var s = { src: objectval(options.src), loading: 0 }, c, 
		dst = s.dst = {percent:0,offset:0,total:0,k:0};
		cancel = s.cancel = function(){
			if(is_func(c))c();
			s.loading = 0;
			dst.percent = dst.offset = 0;
			dst.total = 0;			
		}, 
		runOptions = {}, args = [], callback = function(success,filename,url){
			args = arguments;
			if(s.loading)delayt.run(runOptions.delay);
			return success;
		},
		progress = function(e){
			if(!s.loading)return;
			console.log( 'Получено с сервера ' + e.loaded + ' байт' + 
			(e.lengthComputable ? (' из ' + e.total) : '. Общий объем неизвестен' ) );
			
			var 
			lengthComputable = dst.lengthComputable = e.lengthComputable,
			offset = dst.offset = e.loaded,
			total = dst.total = lengthComputable ? e.total : ( 10000 + offset ),
			k = dst.k = offset / total;
			dst.percent = (100 * k).toFixed(2);
			apply();
			var cb = options.progress;
			if(is_func(cb))cb(e);
		}, 
		callb = function(success,filename,url){
			console.log('Файл "' + filename + '" ' + (success ? 'успешно' : 'не') + ' скачен!');
			var cb = options.callback;
			if(is_func(cb))cb.apply(null,arguments);
			s.loading = 0;
			apply();
		},
		delayt = new dl.Timeout({
			callback: function(){callb.apply(null,args);}
		}),
		waitt = new dl.Timeout({ 
			callback: function(){ s.loading = 1;} 
		});	
		s.run = function(options){
			runOptions = objectval(options);
			cancel();
			dst.total = 10000;
			var src = objectval(s.src);
			waitt.run(runOptions.wait);
			c = dl.download(src.url, callback, progress, src.name);
		};
		return s;
	};


	
	

}]);