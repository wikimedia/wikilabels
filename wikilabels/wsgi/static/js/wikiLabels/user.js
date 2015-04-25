( function (mw, $, WL) {

	var User = function () {
		this.id = null;
		$(window).focus(this.handleRefocus.bind(this));

		this.statusChange = $.Callbacks();

		this.updateStatus();
	};
	User.prototype.handleRefocus = function (e) {
		this.updateStatus();
	};
	User.prototype.updateStatus = function (callback) {
		callback = callback || function(){};
		var oldId = this.id;
		WL.server.whoami(
			function(doc){
				this.id = doc['user']['id'];
				if ( oldId !== this.id ) {
					this.statusChange.fire();
				}
				callback();
			}.bind(this),
			function(doc){
				this.id = null;
			}.bind(this)
		);
	};
	User.prototype.initiateOAuth = function () {
		var oauthWindow = window.open(
      [WL.config.serverRoot, "auth", "initiate"].join("/"), "OAuth",
		  'height=768,width=1024'
    );
		if (window.focus) {
			oauthWindow.focus();
		}
	};
	User.prototype.authenticated = function () {
		return this.globalId !== null;
	};

	WL.user = new User();

})(mediaWiki, jQuery, wikiLabels);
