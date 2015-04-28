( function (mw, $, OO, WL) {

	/**
	 * Home
	 *
	 */
	var Home = function ($element) {
		if ( $element === undefined || $element.length === 0 ) {
			throw "$element must be a defined element";
		}
		if ( $element.attr('id') !== WL.config.prefix + "home" ) {
			throw "Expected $element to have id='" + WL.config.prefix + "home'";
		}

		this.$element = $element;
		this.$menu = this.$element.find(".menu");
		if ( this.$menu === undefined || this.$menu.length === 0 ) {
			throw "." + WL.config.prefix + "menu must be a single defined element";
		}

		this.campaignList = new CampaignList();
		this.campaignList.worksetActivated.add(this.handleWorksetActivation.bind(this));
		this.connector = new Connector();

		this.workspace = new WL.Workspace(
			this.$element.find(".workspace")
		);
		this.$element.append(this.workspace.$element);

		WL.user.updateStatus();
		WL.user.statusChanged.add(this.handleUserStatusChange.bind(this));
		this.handleUserStatusChange();
	};
	Home.prototype.handleUserStatusChange = function () {
		if ( WL.user.authenticated() ) {
			this.campaignList.load();
			this.$menu.empty();
			this.$menu.append(this.campaignList.$element);
		} else {
			this.$menu.empty();
			this.$menu.append(this.connector.$element);
		}
	};
	Home.prototype.handleWorksetActivation = function( workset ) {
		this.campaignList.selectWorkset(workset);

		//this.workspace.load(null);
	};

	/**
	 * Connector Widget
	 *
	 *
	 */
	var Connector = function () {
		this.$element = $("<div>").addClass("connector");

		this.button = new OO.ui.ButtonWidget( {
			label: WL.i18n("connect to server"),
			flags: ["primary"]
		} );
		this.$element.append(this.button.$element);
		this.button.on('click', this.handleButtonClick.bind(this));
	};
	Connector.prototype.handleButtonClick = function (e) {
		WL.user.initiateOAuth();
	};

	/**
	 * Campaign List Widget
	 *
	 */
	var CampaignList = function () {
		this.$element = $("<div>").addClass("campaign-list");

		this.$header = $("<h2>").text(WL.i18n("Campaigns"));
		this.$element.append(this.$header);

		this.$container = $("<div>").addClass("container");
		this.$element.append(this.$container);

		this.campaigns = {};
		this.selectedWorkset = null;

		this.worksetActivated = $.Callbacks();
	};
	CampaignList.prototype.handleWorksetActivation = function( workset ) {
		this.worksetActivated.fire( workset );
	};
	CampaignList.prototype.clear = function () {
		this.$container.empty();
		this.campaigns = {};
	};
	CampaignList.prototype.load = function () {
		var query;
		if ( !WL.user.authenticated() ) {
			throw "Cannot load campaign list when user is not authenticated.";
		}
		this.clear();
		query = WL.server.getCampaigns();
		query.done( function (doc) {
			var i, campaign;
			for ( i = 0; i < doc['campaigns'].length; i++) {
				campaign = new Campaign(doc['campaigns'][i]);
				this.push(campaign);
			}
		}.bind(this));
		query.fail( function (doc) {
			this.$element.html(doc.code + ":" + doc.message);
		}.bind(this));

	};
	CampaignList.prototype.push = function (campaign) {
		this.campaigns[campaign.id] = campaign;
		this.$container.append(campaign.$element);
		campaign.worksetActivated.add(this.handleWorksetActivation.bind(this));
	};
	CampaignList.prototype.selectWorkset = function( workset ){
		if(this.selectedWorkset){
			this.selectedWorkset.select(false);
		}
		this.selectedWorkset = workset;
		if(this.selectedWorkset){
			this.selectedWorkset.select(true);
		}
	};

	/**
	 * Campaign Widget
	 *
	 */
	var Campaign = function (campaignData) {
		this.campaignData = campaignData;
		this.id = campaignData['id'];
		this.$element = $("<div>").addClass("campaign");

		this.expander = new OO.ui.ToggleButtonWidget( {
			label: "+",
			value: false,
			classes: [ "expander" ]
		} );
		this.$element.append(this.expander.$element);
		this.expander.on('change', this.handleExpanderChange.bind(this));

		this.$name = $("<div>").addClass("name");
		this.$element.append(this.$name);

		this.worksetList = new WorksetList();
		this.$element.append(this.worksetList.$element);
		this.worksetList.worksetUpdated.add(this.handleWorksetUpdate.bind(this));
		this.worksetList.worksetActivated.add(this.handleWorksetActivation.bind(this));


		this.$controls = $("<div>").addClass("controls");
		this.$element.append(this.$controls);

		this.newButton = new OO.ui.ButtonWidget( {
			label: WL.i18n("request workset"),
			flags: [ "constructive" ]
		} );
		this.$controls.append(this.newButton.$element);
		this.newButton.on('click', this.handleNewButtonClick.bind(this));

		this.expanded = $.Callbacks();
		this.worksetActivated = $.Callbacks();

		this.load(campaignData);
	};
	Campaign.prototype.handleExpanderChange = function ( expanded ) {
		this.expand(expanded);
	};
	Campaign.prototype.handleNewButtonClick = function (e) {
		this.assignNewWorkset();
	};
	Campaign.prototype.handleWorksetActivation = function ( workset ) {
		this.worksetActivated.fire(workset);
	};
	Campaign.prototype.handleWorksetUpdate = function ( workset ) {
		this.updateButtonState();
	};
	Campaign.prototype.assignNewWorkset = function() {
		var query = WL.server.assignWorkset(
			this.campaignData['id']
		);
		query.done( function (doc) {
			console.log(doc); //TODO: Should add a new workset to the list.
		});
		query.fail( function (doc) {
			alert(doc.code + ": " + doc.message);
		});
	};
	Campaign.prototype.updateButtonState = function() {
		if ( this.worksetList.allComplete() ) {
			this.newButton.setDisabled(false);
		} else {
			this.newButton.setDisabled(true);
		}
	};
	Campaign.prototype.load = function (campaignData) {
		var query;
		this.$name.text(campaignData['name']);

		query = WL.server.getUserWorksetList(
			WL.user.id, campaignData['id']
		);
		query.done( function (doc) {
			var i, workset;
			this.worksetList.clear();
			for (i = 0; i < doc['worksets'].length; i++) {
				workset = new Workset(doc['worksets'][i]);
				this.worksetList.push(workset);
			}
			this.updateButtonState();
		}.bind(this) );
	};
	Campaign.prototype.expand = function (expanded) {
		if ( expanded === undefined) {
			return this.$element.hasClass("expanded");
		} else if ( expanded ) {
			this.$element.addClass("expanded");
			this.expander.setLabel("-");
			this.expanded.fire(expanded);
			return this;
		} else {
			this.$element.removeClass("expanded");
			this.expander.setLabel("+");
			return this;
		}
	};

	/**
	 * Workset List Widget
	 *
	 */
	var WorksetList = function () {
		this.$element = $("<div>").addClass("workset-list");

		this.$container = $("<div>").addClass("container");
		this.$element.append(this.$container);

		this.worksets = [];
		this.worksetActivated = $.Callbacks();
		this.worksetUpdated = $.Callbacks();

	};
	WorksetList.prototype.handleWorksetUpdate = function (workset) {
		this.worksetUpdated.fire(workset);
	};
	WorksetList.prototype.handleWorksetActivation = function (workset) {
		this.worksetActivated.fire(workset);
	};
	WorksetList.prototype.push = function (workset) {
		this.$container.append(workset.$element);
		this.worksets.push(workset);
		workset.updated.add(this.handleWorksetUpdate.bind(this));
		workset.activated.add(this.handleWorksetActivation.bind(this));
	};
	WorksetList.prototype.clear = function () {
		// Clear the container
		this.$container.empty();
		this.worksets = [];
	};
	WorksetList.prototype.allComplete = function () {
		var i, workset;
		for ( i = 0; i < this.worksets.length; i++) {
			workset = this.worksets[i];

			if ( !workset.completed ) {
				return false;
			}
		}
		return true;
	};

	/**
	 * Workset Widget
	 *
	 */
	var Workset = function (worksetData) {
		this.id = worksetData['id'];
		this.worksetData = worksetData;
		this.$element = $("<div>").addClass("workset");
		this.$element.click(this.handleClick.bind(this));

		this.openButton = new OO.ui.ButtonWidget( {
			label: "",
			classes: [ 'open-button' ]
		} );
		this.openButton.on('click', this.handleOpenButtonClick.bind(this));
		this.$element.append(this.openButton.$element);

		this.progressContent = $("<span>");
		this.progress = new OO.ui.ProgressBarWidget( {
			progress: 0,
			content: [this.progressContent],
			classes: [ 'progress' ]
		} );
		this.$element.append(this.progress.$element);

		this.completed = false;
		this.updated = $.Callbacks();
		this.activated = $.Callbacks();

		this.load(worksetData);
	};
	Workset.prototype.handleClick = function(e) {
		this.activated.fire(this);
	};
	Workset.prototype.handleOpenButtonClick = function (e) {
		this.activated.fire(this);
	};
	Workset.prototype.load = function (worksetData) {
		this.created = worksetData.created;
		this.updateProgress(worksetData.stats.tasks, worksetData.stats.labeled);
	};
	Workset.prototype.updateProgress = function (tasks, labeled) {
		this.completed = labeled === tasks;
		if ( this.completed ) {
			this.openButton.setLabel("review");
			this.openButton.setFlags( [] );
		} else {
			this.openButton.setLabel("open");
			this.openButton.setFlags(["constructive"]);
		}

		this.progress.setProgress( labeled / tasks );

		this.progressContent.text( this.formatProgress(tasks, labeled) );

		this.updated.fire();
	};
	Workset.prototype.formatProgress = function (tasks, labeled) {
		return (new Date(this.created * 1000)).format(WL.i18n("date-format")) + "  " +
		       "(" + String(labeled) + "/" + String(tasks) + ")";
	};
	Workset.prototype.select = function (selected) {
		if ( selected === undefined) {
			return this.$element.hasClass("selected");
		} else if ( selected ) {
			this.$element.addClass("selected");
			return this;
		} else {
			this.$element.removeClass("selected");
			return this;
		}
	};

	WL.Home = Home;

})(mediaWiki, jQuery, OO, wikiLabels);
