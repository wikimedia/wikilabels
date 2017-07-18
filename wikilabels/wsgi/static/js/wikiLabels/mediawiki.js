( function ( $, WL ) {

	var MediaWiki = function () {};
	MediaWiki.prototype.initialize = function ( host ) {
		var deferred = $.Deferred();
		this.host = host;

		WL.api.getSiteInfo()
			.done( function ( doc ) {
				this.initializeFromDoc( doc );
				deferred.resolve( this );
			}.bind( this ) )
			.fail( function ( doc ) {
				deferred.reject( doc );
			} );

		return deferred.promise();
	};
	MediaWiki.prototype.initializeFromDoc = function ( doc ) {
		var fallback, i;
		this.dbname = doc.wikiid;
		this.lang = doc.lang;
		this.fallbackChain = [ doc.lang ];
		for ( i = 0; i < doc.fallback.length; i++ ) {
			fallback = doc.fallback[ i ];
			this.fallbackChain.push( fallback.code );
		}

		this.articlepath = doc.articlepath;
		this.script = doc.script;
		this.rtl = doc.rtl;
	};
	MediaWiki.prototype.urlToTitle = function ( title ) {
		return '//' + this.host + this.articlepath.replace( '$1', title );
	};
	MediaWiki.prototype.urlToDiff = function ( revId ) {
		return '//' + this.host + this.script + '?diff=' + revId;
	};

	WL.mediawiki = new MediaWiki();
}( jQuery, wikiLabels ) );
