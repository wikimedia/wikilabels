( function ( $, WL ) {

	var Home = function ( host ) {
		WL.mediawiki.initialize( host )
			.done( function () {
				WL.user = new WL.User();
				WL.user.updateStatus()
					.done( function () {
						$( 'html' ).attr( 'lang', wikiLabels.mediawiki.lang );
						$( '#mw-content-text' ).attr( 'lang', wikiLabels.mediawiki.lang );
						if ( wikiLabels.mediawiki.rtl ) {
							$( 'html' ).attr( 'dir', 'rtl' );
							$( '#mw-content-text' ).attr( 'dir', 'rtl' );
							$( '#mw-content-text' ).addClass( 'mw-content-rtl' );
						} else {
							$( 'html' ).attr( 'dir', 'ltr' );
							$( '#mw-content-text' ).attr( 'dir', 'ltr' );
							$( '#mw-content-text' ).addClass( 'mw-content-ltr' );
						}
						wikiLabels.labeler = new wikiLabels.Labeler( $( '#wikilabels-labeler' ) );
					} )
					.fail( function () {
						WL.user.initiateOAuth();
					} );
			} )
			.fail( function ( doc ) {
				alert( JSON.stringify( doc ) );
			} );

	};

	WL.Home = Home;
}( jQuery, wikiLabels ) );
