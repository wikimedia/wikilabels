( function (mw, $, WL) {

	var Server = function () {};
	Server.prototype.request = function (relPath, data) {
		var deferred = $.Deferred();

		$.ajax(
			$.merge([WL.config.serverRoot], relPath).join("/"),
			{
				dataType: "jsonp",
				data: data || {}
			}
		)
			.done(function (doc, status, jqXHR) {
				if (!doc.error) {
					deferred.resolve(doc);
				} else {
					console.error(doc.error);
					deferred.reject(doc.error);
				}
			}.bind(this))
			.fail(function (jqXHR, status, err) {
				var errorData = { code: status, message: err };
				console.error(errorData);
				deferred.reject(errorData);
			}.bind(this));

		return deferred.promise();
	};

	Server.prototype.getCampaigns = function () {
		return this.request(
			["campaigns", mw.config.get('wgDBname')]
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
			["campaigns", mw.config.get('wgDBname'), campaignId],
			{ assign: "", workset: "stats"}
		);
	};
	Server.prototype.getWorkset = function (campaignId, worksetId) {
		return this.request(
			["campaigns", mw.config.get('wgDBname'), campaignId, worksetId],
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
			["campaigns", mw.config.get('wgDBname'), campaignId, worksetId, taskId],
			{ label: JSON.stringify(labelData) }
		);
	};

	WL.server = new Server();

})(mediaWiki, jQuery, wikiLabels);
