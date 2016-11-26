/*
    Plagin: dl.download.js
    Version: 1.0
	Extension for: dl.js
    Used extensions: none
    Author: Absalyamov Amir Nailevich
	Email: mr.amirka@ya.ru
	Websites: 
		dartline.ru
		vk.com/mr.amirka
    Date: 2016-11-26T01:27:00+03:00
    Location: St. Petersburg
    Project: DARTLINE.RU
	Tested in browsers:
		Coogle Chrome 54.0.2840.99 m 
		Firefox 50.0
	Note: 
		Функция для скачивания небольших файлов с вожностью наблюдения прогресса скачивания.
	Недостатки:
		сырая версия
		мониторить прогресс загрузки можно только при скачивании со своего домена в online режиме
	examples:
	
//variables initialization
var url = 'assets/files/nwjs-v0.12.3-win-ia32.zip';
function callback(success,filename,url){
	console.log('Файл "' + filename + '" ' + (success ? 'успешно' : 'не') + ' скачен!');
	return success;
}
function progress(e){
	console.log( 'Получено с сервера ' + e.loaded + ' байт' + 
	(e.lengthComputable ? (' из ' + e.total) : '. Общий объем неизвестен' ) );
}

//function to execute
dl.download(url,callback,progress);
//or
dl.download({
	url: url,
	callback: callback,
	progress: progress
});
	
*/

(function(gl){
	var 
	is_object = gl.is_object = function(v){return v === null ? 0 : ((typeof v) == 'object');},
	is_func = gl.is_func = function(v){return (typeof v) == 'function';},
	dl = gl.dl = is_object(gl.dl) ? gl.dl : {},
	UNSENT = 0, // начальное состояние
	OPENED = 1, // вызван open
	HEADERS_RECEIVED = 2, // получены заголовки
	LOADING = 3, // загружается тело (получен очередной пакет данных)
	DONE = 4, // запрос завершён
	re = /([*|\:"<>?/])/gim, //регулярное выражение для исключения ненужных символов
	save = dl.save = function(url,filename){
		var link = document.createElement('a'), body = document.body;
		link.href = url;
		link.download = filename;
		link.target = '_blank';
		link.style = 'display:none;';
		
		/* fix for Firefox gecko */
		body.appendChild(link);
		link.click();
		body.removeChild(link);
	},
	download = dl.download = function(url,callback,progress,name){
		if(is_object(url)){
			callback = url.callback;
			progress = url.progress;
			name = url.name;
			url = url.url;
		}
		
		/* если имя для файла не указано, то оно извлекается из url */
		var xhr, urlparts = url.split('/'), filename = (name || urlparts[ urlparts.length - 1 ] || 'unknown')
		.replace(re,'') // удаление запрещенных символов из имени файла
		.substr(0,200), // сокращение слишком большого названия
		hostname = gl.location.hostname, cancel = function(){
			if(!xhr)return;
			xhr.onreadystatechange = xhr.onprogress = undefined;
			xhr.abort();
			xhr = undefined;
		};
		/* если наблюдения за прогрессом нет, либо скачиваем в offline режиме,
		либо скачиваем из другого домена, то скачиваем быстро */
		if(!is_func(progress) || !hostname || (url.indexOf('://') > -1)&&(url.indexOf(hostname) < 0)){
			var success = 1;
			if(is_func(callback))success = callback(success,filename,url);
			if(success)save(url,filename);
			return cancel;
		}	
		xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = "arraybuffer";
		xhr.onreadystatechange = function(){
			if(xhr.readyState == DONE)done(xhr,filename,callback);
		};
		xhr.onprogress = progress;
		xhr.send();
		return cancel;
	};
	function done(xhr,filename,callback){
		var success = xhr.status == 200;
		if(success){
			var type = xhr.getResponseHeader('Content-Type'),
			response = xhr.response,
			blob = new Blob([ response ], {type:type}), url = URL.createObjectURL(blob);		
		}
		if(is_func(callback))success = callback(success,filename,url) && success;
		if(success)save(url,filename);
	}

})(window);


