( function (mw, $, WL) {

	var API = function () {};
	API.prototype.request = function (data) {
		data['format'] = "json";
		var localPromise = $.Deferred(),
		    ajaxPromise = $.ajax(
			[mw.config.get('wgServer'), mw.config.get('wgScriptPath')].join("") + "/api.php",
			{
				dataType: "jsonp",
				data: data
			}
		);

		ajaxPromise.done(function (doc, status, jqXHR) {
			if (!doc.error) {
				localPromise.resolve(doc);
			} else {
				console.error(doc.error);
				localPromise.reject(doc.error);
			}
		}.bind(this));

		ajaxPromise.fail(function (jqXHR, status, err) {
			var errorData = { code: status, message: err };
			console.error(errorData);
			localPromise.reject(errorData);
		}.bind(this));

		return localPromise;
  };
	API.prototype.diffToPrevious = function(revId){
		var promise = $.Deferred(),
		    query = this.request({
			action: "query",
			prop: "revisions",
			revids: revId,
			rvdiffto: "prev"
		} );
		query.done(function(doc){
			var id, page, i, rev;
			try {
				for (id in doc.query.pages) {
					if (doc.query.pages.hasOwnProperty(id)) {
						page = doc.query.pages[id];
					}
				}
				for (i = 0; i < page.revisions.length; i++) {
					rev = page.revisions[i];
					// Cache the diff
					promise.resolve(rev['diff']['*'] || "");
				}
			} catch(err) {
				promise.reject( {
					code: "api error",
					message: "Could not parse MediaWiki API's response: " + err
				} );
			}
		}.bind(this) );
		query.fail(function(doc){
			promise.reject(doc);
		} );

		return promise;
	};

	wikiLabels.api = new API();
})(mediaWiki, jQuery, wikiLabels);
