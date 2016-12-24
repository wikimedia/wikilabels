( function () {
	var Messages = function () {};
	Messages.prototype.set = function (_) {
		// throw 'Messages.set not implemented';
	};

	var Config = function () {
		this.obj = {
		'wgDBname': '{{ db_name|safe }}',
		'wgServer': '//{{ wiki_path|safe }}',
		'wgArticlePath': '/wiki/$1',
		'wgScriptPath': '/w',
		'wgUserLanguage': '{{ lang_code|safe }}'
		};
	};
	Config.prototype.get = function(key){
		return this.obj[key];
	};

	var util = {
		wikiScript: function(){return "/w/api.php";},
		getUrl: function(title){return "//{{ wiki_path|safe }}/wiki/" + title;}
	};

	window.mediaWiki = {
		messages: new Messages(),
		msg: function (key) {throw 'msg not implemented';},
		config: new Config(),
		util: util,
		language: {getFallbackLanguageChain: function(){return ['{{ lang_code|safe }}', 'en'];}}
	};
})();
