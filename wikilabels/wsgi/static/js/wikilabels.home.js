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
			this.$element.find(".wikilabels-campaigns")
		);
		this.$element.append(this.campaignList.$element);

		this.workspace = new Workspace(this.$element.find(".wikilabels-workspace"));
		this.$element.append(this.workspace.$element);

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

		this.$resizer = $("<div>").addClass(WL.prefix + "resizer");
		this.$element.append(this.$resizer);

		this.$name = $("<div>").addClass(WL.prefix + "name");
		this.$element.append(this.$name);

	};

	var WorksetList = function (worksetListData) {
		this.$element = $("<div>").addClass(WL.prefix + "workset-list");

		this.$container = $("<div>").addClass(WL.prefix + "container");
		this.$element.append(this.$container);

		this.$controls = $("<div>").addClass(WL.prefix + "controls");
		this.$element.append(this.$container);

		this.newButton = OO.ui.ButtonWidget( {
			label: WL.i18n("assign new")
		} );
		this.$control.append(this.newButton.$element);

		this.worksets = [];

		this.load(worksetListData);
	};
	WorksetList.handleWorksetUpdate = function(){
		var i;
		for( i = 0; i < this.worksets.length; i++) {
			if this.worksets[i].completed?  TODO: This.  Here. 
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

		this.updated = $.Callbacks();
	};
	Workset.prototype.load = function (worksetData) {
		this.created = worksetData.created;
		this.updateProgress(worksetData.stats.tasks, worksetData.stats.labeled);
	};
	Workset.prototype.updateProgress = function (tasks, labeled) {
		if ( labeled === tasks ) {
			this.openButton.setLabel("review");
			this.openButton.setFlags( [] );
		} else {
			this.openButton.setLabel("open");
			this.openButton.setFlags( [ "constructive" ] );
		}

		this.progress.setProgress( labeled / tasks );

		this.progress.setText( this.formatProgress(tasks, labeled) );

		this.updated.fire();
	};
	Workset.prototype.formatProgress = function (tasks, labeled) {
		return (new Date(this.reated)).format(WL.i18n("date-format")) + "(" +
		       String(labeled) + "/" + String(tasks) + ")";
	};

	var Workspace = function ($element) {
		if ( $element === undefined || $element.length === 0 ) {
			throw "$element must be a defined element";
		}
		this.$element = $element;

		this.$menu = $("<div>").addClass(WL.prefix + "menu");
		this.$element.append(this.$menu);
		this.fullscreenToggle = new OO.ui.ToggleButtonWidget( {
			label: WL.i18n("fullscreen")
		} );
		this.$menu.append(this.fullscreen.$element);
		this.fullscreenToggle.on('change', this.handleFullscreenChange.bind(this));

		this.tasklist = null;
		this.form = null;
		this.view = null;

		this.$controls = $("<div>").addClass(WL.prefix + "controls");
		this.submitButton = new OO.ui.ButtonWidget( {
			label: WL.i18n("Submit label"),
			align: 'inline',
			flags: [ 'primary', 'constructive' ]
		} );

		this.submitted = $.Callbacks();
	};
	Workspace.prototype.handleSubmitButtonClicked = function (e) {
		this.submitted.fire();
	};
	Workspace.prototype.handleTaskSelected = function (taskId) {
		this.view.load(taskId);
	};
	Workspace.prototype.handleFullscreenChange = function (e) {
		this.fullscreen(this.fullscreenToggle.getValue());
	};
	Workspace.prototype.load = function (tasklist, form, view) {

		this.$element.html(""); // Clears out old elements

		this.tasklist = tasklist;
		this.$element.append(tasklist.$element);
		this.tasklist.taskSelected.add(this.handleTaskSelected.bind(this));

		this.form = form;
		this.$element.append(form.$element);

		this.view = view;
		this.$element.append(view.$element);
	};
	Workspace.prototype.fullscreen = function (fullscreen) {
		if ( fullscreen === undefined) {
			return this.$element.hasClass(WL.prefix + "fullscreen");
		} else if ( fullscreen ) {
			this.$element.addClass(WL.prefix + "fullscreen");
			return this;
		} else {
			this.$element.removeClass(WL.prefix + "fullscreen");
			return this;
		}
	};

	var TaskList = function (taskListData) {
		this.$element = $("<div>").addClass(WL.prefix + "task-list");

		this.$header = $("<div>").addClass(WL.prefix + "header");
		this.$element.append(this.$header);

		this.tasks = [];
		this.$tasks = $("<div>").addClass(WL.prefix + "tasks");
		this.$element.append(this.$tasks);

		this.taskSelected = $.Callbacks();

		this.load(taskListData);
	};
	TaskList.prototype.handleTaskSelected = function (taskId) {
		var i, task;
		for (i = 0; i < this.tasks.length; i++) {
			task = this.tasks[i];
			task.select(false);
		}
		this.taskSelected.fire(taskId);
	};
	TaskList.prototype.load = function (taskListData) {
		var taskData, task, i;

		this.$tasks.html(""); // Just in case there was something in there.
		for (i = 0; i < taskListData.length; i++) {
			taskData = taskListData.tasks[i];

			task = new Task(taskData);
			task.selected.add(this.handleTaskSelected.bind(this));
			this.tasks.push(task);
			this.$tasks.append(task.element);
		}
	};

	var Task = function (taskData) {
		this.$element = $("<div>").addClass(WL.prefix + "task");
		this.$element.click(this.handleClick);

		this.selected = $.Callbacks();
	};
	Task.prototype.handleClick = function (e) {
		if ( !this.disable() ) {
			this.select(true);
		}
	};
	Task.prototype.select = function (select) {
		if ( select === undefined) {
			return this.$element.hasClass(WL.prefix + "selected");
		} else if ( select ) {
			this.$element.addClass(WL.prefix + "selected");
			this.selected.fire();
			return this;
		} else {
			this.$element.removeClass(WL.prefix + "selected");
			return this;
		}
	};
	Task.prototype.disable = function (disable) {
		if ( disable === undefined) {
			return this.$element.hasClass(WL.prefix + "disabled");
		} else if ( disable ) {
			this.$element.addClass(WL.prefix + "disabled");
			return this;
		} else {
			this.$element.removeClass(WL.prefix + "disabled");
			return this;
		}
	};

	WL.Home = Home;

})(mediaWiki, jQuery, OO, wikiLabels);
