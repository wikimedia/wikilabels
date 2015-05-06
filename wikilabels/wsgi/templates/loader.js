(function(mw, $){
	$(function(){
		// Check if we should try to load Wiki Labels
		if($('#wikilabels-home').length){
			mw.loader.load( '{{ css_path|safe }}', 'text/css' );
			mw.loader.using(
				[
					'oojs',
					'oojs-ui',
					'json',
					'mediawiki.action.history.diff',
					'mediawiki.util',
					'mediawiki.language'
				],
				function(){
					$.getScript(
						'{{ js_path|safe }}',
						function(){
							wikiLabels.config.update( {
								serverRoot: '{{ server_root|safe }}'
							} );
							wikiLabels.home = new wikiLabels.Home($('#wikilabels-home'));
						}
					);
				}
			);
		}
	});
}(mediaWiki, jQuery));
