( function () {
	if ( window.wikiLabels ) {
		throw Error( 'wikiLabels is already defined!  Exiting.' );
	}
	window.wikiLabels = {
		config: {
			serverRoot: '',
			prefix: 'wikilabels-'
		}
	};
}() );
