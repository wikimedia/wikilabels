( function () {
	var Messages = function () {};
	Messages.prototype.set = function (_) {
		//throw 'Messages.set not implemented';
	};

  var Config = function () {
    this.obj = {
      'wgDBname': 'enwiki',
      'wgServer': '//en.wikipedia.org',
			'wgArticlePath': '/wiki/$1',
      'wgScriptPath': '/w',
			'wgUserLanguage': 'en'
    };
  };
  Config.prototype.get = function(key){
    return this.obj[key];
  };

	var util = {
		wikiScript: function(){return "/w/api.php";},
		getUrl: function(title){return "//en.wikipedia.org/wiki/" + title;}
	};

	window.mediaWiki = {
		messages: new Messages(),
		msg: function (key) {throw 'msg not implemented';},
    config: new Config(),
		util: util
	};
})();
