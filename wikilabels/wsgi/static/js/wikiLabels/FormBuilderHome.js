( function ($, WL) {

	var FormBuilderHome = function (host) {
			WL.mediawiki.initialize(host)
				.done(function() {
					$('html').attr('lang', wikiLabels.mediawiki.lang);
					$('#mw-content-text').attr('lang', wikiLabels.mediawiki.lang);
					if (wikiLabels.mediawiki.rtl) {
						$('html').attr('dir', 'rtl');
						$('#mw-content-text').attr('dir', 'rtl');
						$('#mw-content-text').addClass('mw-content-rtl');
					} else {
						$('html').attr('dir', 'ltr');
						$('#mw-content-text').attr('dir', 'ltr');
						$('#mw-content-text').addClass('mw-content-ltr');
					}
					wikiLabels.formBuilder = new wikiLabels.FormBuilder();
					wikiLabels.formBuilder.configEditor.text(
						$("#preload_and_delete_me").val());
					$("#preload_and_delete_me").remove()
					$('body').append(wikiLabels.formBuilder.$element)
				} )
				.fail(function(doc) {
					alert(JSON.stringify(doc));
				} );
	}

	WL.FormBuilderHome = FormBuilderHome;
})(jQuery, wikiLabels);
