( function (mw, $, WL) {

	var Server = function () {};
	Server.prototype.request = function (relPath, data, success, error) {
		return $.ajax(
			$.merge([WL.config.serverRoot], relPath).join("/"),
			{
				dataType: "jsonp",
				data: data,
				success: function (doc, status, jqXHR) {
					if (!doc.error) {
						success(doc);
					} else {
						console.error(doc.error);
						error(doc.error);
					}
				}.bind(this),
				error: function (jqXHR, status, err) {
					var errorData = { code: status, message: err };
					console.error(errorData);
					error(errorData);
				}.bind(this)
			}
		);
	};
	Server.prototype.getCampaigns = function (success, error) {
		return this.request(
			["campaigns", mw.config.get('wgDBName')],
			{},
			success, error
		);
	};
	Server.prototype.whoami = function (success, error) {
		return this.request(
			["auth", "whoami"],
			{},
			success, error
		);
	};
	Server.prototype.getUserWorksetList = function (userId, campaignId, success, error) {
		return this.request(
			["users", userId, campaignId],
			{ worksets: "stats" },
			success, error
		);
	};
	Server.prototype.assignWorkset = function (campaignId, success, error) {
		return this.request(
			["campaigns", mw.config.get('wgDBName'), campaignId],
			{ assign: "" },
			success, error
		);
	};
	Server.prototype.getTaskList = function (campaignId, worksetId, success, error) {
		return this.request(
			["campaigns", mw.config.get('wgDBName'), campaignId, worksetId],
			{ tasks: "" },
			success, error
		);
	};
	Server.prototype.saveLabel = function (campaignId, worksetId, taskId, labelData, success, error) {
		return this.request(
			["campaigns", mw.config.get('wgDBName'), campaignId, worksetId, taskId],
			{ label: JSON.stringify(labelData) },
			success, error
		);
	};

	WL.server = new Server();

})(mediaWiki, jQuery, wikiLabels);
