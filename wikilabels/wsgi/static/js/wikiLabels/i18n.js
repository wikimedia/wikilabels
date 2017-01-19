( function (WL) {

	var format = function (str, args) {

		return str.replace(
		/\$[0-9]+/,
		function (m) { return args[parseInt(m.substring(1), 10) - 1] || m;}
		);
	};

	var I18N = function (messages, langChain) {
		this.messages = messages;
		this.langChain = langChain;
	};
	I18N.prototype.get = function (key, args) {
		var messages = this.messages || WL.config.messages,
		    langChain = this.langChain || WL.mediawiki.fallbackChain;

		for (i = 0; i < langChain.length; i++) {
			lang = langChain[i];

			if (messages[lang] && messages[lang][key]) {
				return format(messages[lang][key], args);
			}
		}
		return "<" + format(key, args) + ">";
	};

	WL.I18N = I18N;

	var i18n = new WL.I18N();
	WL.i18n = i18n.get.bind(i18n)

})(wikiLabels);
