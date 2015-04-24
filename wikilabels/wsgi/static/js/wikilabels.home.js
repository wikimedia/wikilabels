( function (mw, $, OO, WL) {

	var Home = function ($element) {
		if ( $element === undefined || $element.length === 0 ) {
			throw "$element must be a defined element";
		}
		if ( this.$element.attr('id') !== WL.prefix + "home" ) {
			throw "Expected $element to have id='wikilabels-home'";
		}

		this.$element = $element;

		this.campaignList = new CampaignList(
			this.$element.find("." + WL.prefix + "campaigns")
		);
		this.$element.append(this.campaignList.$element);

		this.workspace = new WL.Workspace(
			this.$element.find("." + WL.prefix + "workspace")
			);
		this.$element.append(this.workspace.$element);

		this.user = new WL.User();
	};

	var CampaignList = function ($element) {
		if ( $element === undefined || $element.length === 0 ) {
			throw "$element must be a defined element";
		}

		this.$element = $element;
		this.$element.html(""); // Clears the "Install the gadget" button

	};

	var Campaign = function () {
		this.$element = $("<div>").addClass(WL.prefix + "campaign");

		this.$expander = $("<div>").addClass(WL.prefix + "expander");
		this.$element.append(this.$expander);

		this.$name = $("<div>").addClass(WL.prefix + "name");
		this.$element.append(this.$name);

		this.$controls = $("<div>").addClass(WL.prefix + "controls");
		this.$element.append(this.$controls);

		this.newButton = OO.ui.ButtonWidget( {
			label: WL.i18n("assign new")
		} );
		this.$control.append(this.newButton.$element);
		this.newButton.on('click', this.handleNewButtonClick.bind(this));
	};

	var WorksetList = function (worksetListData) {
		this.$element = $("<div>").addClass(WL.prefix + "workset-list");

		this.$container = $("<div>").addClass(WL.prefix + "container");
		this.$element.append(this.$container);

		this.worksets = [];
		this.worksetActivated = $.Callbacks();

		this.load(worksetListData);
	};
	WorksetList.handleWorksetActivated = function (workset) {
		this.worksetActivated.fire(this, workset);
	};
	WorksetList.handleWorksetUpdate = function (workset) {
		var i;
		if ( workset.completed && this.allCompleted() ) {
			this.newButton.setDisabled(false);
		} else {
			this.newButton.setDisabled(true);
		}
	};
	WorksetList.prototype.push = function (workset) {
		this.$container.append(workset.$element);
		this.worksets.push(workset);
		workset.updated.add(this.handleWorksetUpdate.bind(this));
	};
	WorksetList.prototype.clear = function () {
		// Clear the container
		this.$container.html("");
		this.worksets = [];
	};
	WorksetList.prototype.load = function (worksetListData) {
		var i, worksetData, workset;

		// Make sure we're clear
		this.clear();

		// Add all of the worksets
		for ( i = 0; i < worksetListData.length; i++ ) {
			worksetData = worksetListData[i];

			workset = new Workset(worksetData);
			this.push(workset);
		}
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

	var Workset = function (worksetData) {
		this.$element = $("<div>").addClass(WL.prefix + "workset");

		this.progress = new OO.ui.ProgressBarWidget( {
			progress: 0,
			text: ""
		} );

		this.openButton = new OO.ui.ButtonWidget( {
			label: "",
			align: 'inline'
		} );
		this.openButton.on('click', this.handleOpenButtonClick.bind(this));

		this.completed = false;
		this.updated = $.Callbacks();
		this.activated = $.Callbacks();

		this.load(worksetData);
	};
	Workset.prototype.handleOpenButtonClick = function(e){
		this.activated.fire();
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

		this.progress.setText( this.formatProgress(tasks, labeled) );

		this.updated.fire();
	};
	Workset.prototype.formatProgress = function (tasks, labeled) {
		return (new Date(this.reated)).format(WL.i18n("date-format")) + "(" +
		       String(labeled) + "/" + String(tasks) + ")";
	};
	Workset.prototype.select = function (selected) {
		if ( selected === undefined) {
			return this.$element.hasClass(WL.prefix + "selected");
		} else if ( selected ) {
			this.$element.addClass(WL.prefix + "selected");
			this.selected.fire();
			return this;
		} else {
			this.$element.removeClass(WL.prefix + "selected");
			return this;
		}
	};

	WL.Home = Home;

})(mediaWiki, jQuery, OO, wikiLabels);
