( function ( $, WL ) {

	var User = function () {
		this.id = null;
		$( window ).focus( this.handleRefocus.bind( this ) );

		this.statusChanged = $.Callbacks();

		this.updateStatus();
	};
	User.prototype.handleRefocus = function () {
		this.updateStatus();
	};
	User.prototype.updateStatus = function () {
		var oldId = this.id, deferred = $.Deferred();

		WL.server.whoami()
			.done( function ( doc ) {
				this.id = doc.user.id;
				if ( oldId !== this.id ) {
					console.log( 'Setting user_id to ' + this.id );
					this.statusChanged.fire();
				}
				deferred.resolve( true );
			}.bind( this ) )
			.fail( function () {
				this.id = null;
				deferred.reject( false );
			}.bind( this ) );

		return deferred.promise();
	};
	User.prototype.initiateOAuth = function () {
		var oauthWindow = window.open(
			WL.server.absPath( 'auth', 'initiate' ), 'OAuth',
			'height=768,width=1024'
		);
		if ( window.focus ) {
			oauthWindow.focus();
		}
	};
	User.prototype.authenticated = function () {
		return this.id !== null;
	};

	WL.User = User;

}( jQuery, wikiLabels ) );
