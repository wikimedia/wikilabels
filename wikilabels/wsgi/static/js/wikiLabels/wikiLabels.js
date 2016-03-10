(function($){
	if (window.wikiLabels) {
		throw "wikiLabels is already defined!  Exiting.";
	}
	window.wikiLabels = {
		config: {
			serverRoot: "//ores.wmflabs.org/labels",
			prefix: "wikilabels-"
		}
	};
})(jQuery);
