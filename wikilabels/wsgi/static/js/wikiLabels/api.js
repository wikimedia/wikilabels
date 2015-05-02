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
	API.prototype.getRevision = function(revId, params){
		var defaultParams = {
				action: "query",
				prop: "revisions",
				revids: revId
			},
			promise = $.Deferred();

		this.request($.extend(defaultParams, params || {}))
			.done(function(doc){
				var id, page, includePage, i, rev;
				try {
					if (doc.query.badrevids) {
						promise.reject( {
							code: "revision not found",
							message: "Could not get metadata for rev_id=" + revId
						} );
						return;
					}
					for (id in doc.query.pages) {
						if (doc.query.pages.hasOwnProperty(id)) {
							page = doc.query.pages[id];
						}
					}
					includePage = $.extend({}, page);
					delete includePage['revisions'];
					for (i = 0; i < page.revisions.length; i++) {
						rev = page.revisions[i];
						rev['page'] = includePage;
						// Cache the diff
						promise.resolve(rev);
					}
				} catch(err) {
					promise.reject( {
						code: "api error",
						message: "Could not parse MediaWiki API's response: " + err
					} );
				}
			}.bind(this))
			.fail(function(doc){
				promise.reject(doc);
			}.bind(this));

		return promise;
	};
	API.prototype.diffTo = function(revId, diffToId){
		var promise = $.Deferred();

		this.getRevision(diffToId, {'rvdiffto': revId})
			.done(function(doc){
				promise.resolve(doc['diff']['*'] || "");
			}.bind(this))
			.fail(function(doc){
				promise.fail(doc);
			}.bind(this));

		return promise;
	};
	API.prototype.diffToPrevious = function(revId){
		var promise = $.Deferred();

		this.getRevision(revId, {rvprop: "ids|comment"})
			.done(function(rev){
				if ( rev.parentid ) {
					this.diffTo(revId, rev.parentid)
						.done(function(tableRows){
							promise.resolve( {
								revId: rev.revid,
								title: rev.page.title,
								comment: rev.comment || "",
								tableRows: tableRows
							} );
						}.bind(this))
						.fail(function(doc){
							promise.reject(doc);
						}.bind(this));
				} else {
					this.getRevision(revId, {rvprop: "content"})
						.done(function(contentRev){
							promise.resolve( {
								revId: rev.revid,
								title: rev.page.title,
								tableRows: API.creationDiff(contentRev['*'])
							} );
						}.bind(this))
						.fail(function(doc){
							promise.reject(doc);
						});
				}
			}.bind(this))
			.fail(function(doc){
				promise.reject(doc);
			}.bind(this));

		return promise;
	};
	API.creationDiff = function(content){
		return '<tr>\n' +
				'<td colspan="2" class="diff-lineno">Line 1:</td>\n' +
				'<td colspan="2" class="diff-lineno">Line 1:</td>\n' +
			'</tr>\n' +
			'<tr>\n' +
				'<td colspan="2" class="diff-empty">&#160;</td>\n' +
				'<td class="diff-marker">+</td>\n' +
				'<td class="diff-addedline"><div>' + content + '</div></td>' +
			'</tr>';
	};



	wikiLabels.api = new API();
})(mediaWiki, jQuery, wikiLabels);
