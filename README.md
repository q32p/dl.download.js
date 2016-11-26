# dl.download.js

Plagin: dl.download.js

Version: 1.0

Extension for: dl.js

Project: DARTLINE.RU

Tested in browsers: 

Coogle Chrome 54.0.2840.99 m

Firefox 50.0

Note:

Функция для скачивания небольших файлов с вожностью наблюдения прогресса скачивания.

Недостатки:

сырая версия

мониторить прогресс загрузки можно только при скачивании со своего домена в online режиме

demo: http://dartline.ru/demo/download

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
