( function (mw, $, OO, WL) {
	var Workspace = function ($element) {
		if ( $element === undefined || $element.length === 0 ) {
			throw "$element must be a defined element";
		}
		this.$element = $element;

		this.$menu = $("<div>").addClass(WL.config.prefix + "menu");
		this.$element.append(this.$menu);
		this.fullscreenToggle = new OO.ui.ToggleButtonWidget( {
			label: WL.i18n("fullscreen")
		} );
		this.$menu.append(this.fullscreen.$element);
		this.fullscreenToggle.on('change', this.handleFullscreenChange.bind(this));

		this.taskList = null;
		this.form = null;
		this.view = null;

		this.$controls = $("<div>").addClass(WL.config.prefix + "controls");
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
	Workspace.prototype.loadWorkset = function (worksetId) {
		var query = WL.server.getWorkset(worksetId);
		query.done(function(doc) {
			var formQuery;
			try{
				this.view = WL.views[doc['campaign']['view']](doc['tasks']);
			}catch(err){
				alert("Could not load view '" + doc['campaign']['view'] + "': " + err);
				this.view = WL.views.View(doc['tasks']);
			}

			this.taskList = new TaskList(doc['tasks']);

			formQuery = WL.server.getForm(doc['campaign']['form']);
			formQuery.done(function(formDoc){
				try{
					this.form = WL.Form.fromConfig(formDoc['form']);
				}catch(err){
					alert(
						"Could not load form '" + doc['campaign']['form'] + "': " + err
					);
				}
				this.load();
			}.bind(this));
			formQuery.fail(function(errorDoc){
				alert(
					"Could not load form '" + doc['campaign']['form'] + "': " +
					JSON.stringify(errorDoc)
				);
			}.bind(this));


		}.bind(this) );
	};
	Workspace.prototype.load = function (taskList, form, view) {

		this.$element.empty(); // Clears out old elements

		this.taskList = taskList;
		this.$element.append(taskList.$element);
		this.taskList.taskSelected.add(this.handleTaskSelected.bind(this));

		this.form = form;
		this.$element.append(form.$element);

		this.view = view;
		this.$element.append(view.$element);
	};
	Workspace.prototype.fullscreen = function (fullscreen) {
		if ( fullscreen === undefined) {
			return this.$element.hasClass(WL.config.prefix + "fullscreen");
		} else if ( fullscreen ) {
			this.$element.addClass(WL.config.prefix + "fullscreen");
			return this;
		} else {
			this.$element.removeClass(WL.config.prefix + "fullscreen");
			return this;
		}
	};

	var TaskList = function (taskListData) {
		this.$element = $("<div>").addClass(WL.config.prefix + "task-list");

		this.$header = $("<div>").addClass(WL.config.prefix + "header");
		this.$element.append(this.$header);

		this.tasks = [];
		this.$tasks = $("<div>").addClass(WL.config.prefix + "tasks");
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

		this.$tasks.empty(); // Just in case there was something in there.
		for (i = 0; i < taskListData.length; i++) {
			taskData = taskListData.tasks[i];

			task = new Task(taskData);
			task.selected.add(this.handleTaskSelected.bind(this));
			this.tasks.push(task);
			this.$tasks.append(task.$element);
		}
	};

	var Task = function (taskData) {
		this.$element = $("<div>").addClass(WL.config.prefix + "task");
		this.$element.click(this.handleClick);

		this.selected = $.Callbacks();
    this.activated = $.Callbacks();

    this.load(taskData);
	};
	Task.prototype.handleClick = function (e) {
		if ( !this.disable() ) {
			this.activated.fire(this);
		}
	};
  Task.prototype.load = function(taskData) {
    this.taskId = taskData.id;
    this.taskData = taskData['task_data'];
    this.labels = taskData['labels'];
  };
	Task.prototype.select = function (selected) {
		if ( selected === undefined) {
			return this.$element.hasClass(WL.config.prefix + "selected");
		} else if ( selected ) {
			this.$element.addClass(WL.config.prefix + "selected");
			this.selected.fire();
			return this;
		} else {
			this.$element.removeClass(WL.config.prefix + "selected");
			return this;
		}
	};
	Task.prototype.disable = function (disabled) {
		if ( disabled === undefined) {
			return this.$element.hasClass(WL.config.prefix + "disabled");
		} else if ( disabled ) {
			this.$element.addClass(WL.config.prefix + "disabled");
			return this;
		} else {
			this.$element.removeClass(WL.config.prefix + "disabled");
			return this;
		}
	};

	wikiLabels.Workspace = Workspace;
})(mediaWiki, jQuery, OO, wikiLabels);
