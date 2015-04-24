( function (mw, $, WL) {

	var User = function () {
		this.globalId = null;
		$(window).focus(this.handleRefocus.bind(this));

		this.statusChange = $.Callbacks();

    this.updateStatus()
	};
	User.prototype.handleRefocus = function (e) {
		this.updateStatus();
	};
	User.prototype.updateStatus = function () {
		var oldId = this.globalId;
		try {
			this.globalId = WL.server.whoami()['global_id'];
		} catch (err) {
			console.log("Could not retrieve global_id: " + err);
			this.globalId = null;
		}
		if ( oldId !== this.globalId ) {
			this.statusChange.fire();
		}
	};
	User.prototype.initiateOAuth = function () {
		var oauthWindow = window.open(
      WL.serverRoot + "/auth/initiate", "OAuth",
		  'height=768,width=1024'
    );
		if (window.focus) {
			oauthWindow.focus();
		}
	};
	User.prototype.authenticated = function () {
		return this.globalId !== null;
	};

})(mediaWiki, jQuery, wikiLabels);
