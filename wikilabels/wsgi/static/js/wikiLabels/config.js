( function ($, WL) {
	var Config = function(obj) {
		Config.prototype.update.call(this, obj);
	};
	Config.prototype.update = function (update) {
		$.extend(this, update, true); // Deep merge
	};
	WL.config = new Config(WL.config || {});
}(jQuery, wikiLabels));
