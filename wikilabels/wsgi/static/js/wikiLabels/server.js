( function ($, WL) {
  
	WL.server = {
		getCampaigns: function () {
			throw "getCampaigns not implemented";
		},
		whoami: function () {
			throw "whoami not implemented";
		},
		getUserWorksetList: function (campaignId) {
			throw "GetWorksetList not implemented";
		},
		assignWorkset: function (campaignId) {
			throw "assignWorkset us not implemented";
		},
		getTaskList: function (worksetId) {
			throw "getTaskList not implemented";
		},
		saveLabel: function (taskId, labelData) {
			throw "saveLabel not implemented";
		}
	};

})(jQuery, wikiLabels);
