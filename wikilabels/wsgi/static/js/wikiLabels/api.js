( function (mw, $, WL) {

	var API = function () {};
	API.prototype.request = function (data) {
		data['format'] = "json";
		var deferred = $.Deferred(),
		    ajaxPromise = $.ajax(
			mw.config.get('wgServer') + mw.util.wikiScript( 'api' ),
			{
				dataType: "jsonp",
				data: data
			}
		);

		ajaxPromise.done(function (doc, status, jqXHR) {
			if (!doc.error) {
				deferred.resolve(doc);
			} else {
				console.error(doc.error);
				deferred.reject(doc.error);
			}
		}.bind(this));

		ajaxPromise.fail(function (jqXHR, status, err) {
			var errorData = { code: status, message: err };
			console.error(errorData);
			deferred.reject(errorData);
		}.bind(this));

		return deferred.promise();
  };
	API.prototype.getRevision = function(revId, params){
		var defaultParams = {
				action: "query",
				prop: "revisions",
				revids: revId
			},
			deferred = $.Deferred();

		this.request($.extend(defaultParams, params || {}))
			.done(function(doc){
				var id, page, includePage, i, rev;
				try {
					if (doc.query.badrevids) {
						deferred.reject( {
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
						deferred.resolve(rev);
					}
				} catch(err) {
					deferred.reject( {
						code: "api error",
						message: "Could not parse MediaWiki API's response: " + err
					} );
				}
			}.bind(this))
			.fail(function(doc){
				deferred.reject(doc);
			}.bind(this));

		return deferred.promise();
	};
	API.prototype.diffTo = function(revId, diffToId){
		var deferred = $.Deferred();

		this.getRevision(diffToId, {'rvdiffto': revId})
			.done(function(doc){
				deferred.resolve(doc['diff']['*'] || "");
			}.bind(this))
			.fail(function(doc){
				deferred.fail(doc);
			}.bind(this));

		return deferred.promise();
	};
	API.prototype.diffToPrevious = function(revId){
		var deferred = $.Deferred();

		this.getRevision(revId, {rvprop: "ids|parsedcomment"})
			.done(function(rev){
				if ( rev.parentid ) {
					this.diffTo(revId, rev.parentid)
						.done(function(tableRows){
							deferred.resolve( {
								revId: rev.revid,
								title: rev.page.title,
								comment: rev.parsedcomment || "",
								tableRows: tableRows
							} );
						}.bind(this))
						.fail(function(doc){
							deferred.reject(doc);
						}.bind(this));
				} else {
					this.getRevision(revId, {rvprop: "content"})
						.done(function(contentRev){
							deferred.resolve( {
								revId: rev.revid,
								title: rev.page.title,
								tableRows: API.creationDiff(contentRev['*'])
							} );
						}.bind(this))
						.fail(function(doc){
							deferred.reject(doc);
						});
				}
			}.bind(this))
			.fail(function(doc){
				deferred.reject(doc);
			}.bind(this));

		return deferred.promise();
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
	API.prototype.wikitext2HTML = function(wikitext, title){
		title = title || 'CURRENT PAGE';
		var params = {
				action: "parse",
				prop: "text",
				title: title,
				text: wikitext.substring(0, 4000),
				contentmode: "wikitext"
			},
			deferred = $.Deferred();

		this.request(params)
			.done(function(doc){
				deferred.resolve(
					doc['parse']['text']['*']
				);
			}.bind(this))
			.fail(function(doc){
				deferred.reject(doc);
			}.bind(this));

		return deferred.promise();
	};



	wikiLabels.api = new API();
})(mediaWiki, jQuery, wikiLabels);
