( function (mw, $, WL) {

	var Server = function () {};
	Server.prototype.request = function (relPath, data) {
		var localPromise = $.Deferred(),
		    ajaxPromise = $.ajax(
			$.merge([WL.config.serverRoot], relPath).join("/"),
			{
				dataType: "jsonp",
				data: data || {}
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

	Server.prototype.getCampaigns = function () {
		return this.request(
			["campaigns", mw.config.get('wgDBName')]
		);
	};
	Server.prototype.whoami = function () {
		return this.request(
			["auth", "whoami"]
		);
	};
	Server.prototype.getUserWorksetList = function (userId, campaignId) {
		return this.request(
			["users", userId, campaignId],
			{ worksets: "stats" }
		);
	};
	Server.prototype.assignWorkset = function (campaignId) {
		return this.request(
			["campaigns", mw.config.get('wgDBName'), campaignId],
			{ assign: "" }
		);
	};
	Server.prototype.getWorkset = function (campaignId, worksetId) {
		return this.request(
			["campaigns", mw.config.get('wgDBName'), campaignId, worksetId],
			{ tasks: "", campaign: "" }
		);
	};
	Server.prototype.getForm = function (formName) {
		return this.request(
			["forms", formName]
		);
	};
	Server.prototype.saveLabel = function (campaignId, worksetId, taskId, labelData) {
		return this.request(
			["campaigns", mw.config.get('wgDBName'), campaignId, worksetId, taskId],
			{ label: JSON.stringify(labelData) }
		);
	};

	WL.server = new Server();

})(mediaWiki, jQuery, wikiLabels);
