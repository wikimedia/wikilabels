( function ( $ ) {
	if ( window.wikiLabels ) {
		throw 'wikiLabels is already defined!  Exiting.';
	}
	window.wikiLabels = {
		config: {
			serverRoot: '',
			prefix: 'wikilabels-'
		}
	};
}( jQuery ) );
