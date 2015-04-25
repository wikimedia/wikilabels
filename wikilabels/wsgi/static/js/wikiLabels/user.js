( function (mw, $, WL) {

	var User = function () {
		this.id = null;
		$(window).focus(this.handleRefocus.bind(this));

		this.statusChanged = $.Callbacks();
	};
	User.prototype.handleRefocus = function (e) {
		this.updateStatus();
	};
	User.prototype.updateStatus = function () {
		var oldId = this.id;
		WL.server.whoami(
			function(doc){
				this.id = doc['user']['id'];
				if ( oldId !== this.id ) {
					console.log("Setting user_id to " + this.id)
					this.statusChanged.fire();
				}
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
		return this.id !== null;
	};

	WL.user = new User();

})(mediaWiki, jQuery, wikiLabels);
