( function (mw, $, OO, WL) {
	var Workspace = function ($element) {
		if ( $element === undefined || $element.length === 0 ) {
			throw '$element must be a defined element';
		}
		this.$element = $element;
		this.$element.hide();
		this.campaignId = null;
		this.worksetId = null;
		this.taskList = null;
		this.form = null;
		this.view = null;

		this.$parent = $element.parent();

		this.$menu = $('<div>').addClass( 'wikilabels-menu' );
		this.$element.append(this.$menu);
		this.fullscreenToggle = new OO.ui.ToggleButtonWidget( {
			label: WL.i18n('fullscreen'),
			classes: ['fullscreen']
		} );
		this.$menu.append(this.fullscreenToggle.$element);
		this.fullscreenToggle.on('change', this.handleFullscreenChange.bind(this));

		this.$container = $('<div>').addClass('container');
		this.$element.append(this.$container);

		this.labelSaved = $.Callbacks();
		this.newWorksetRequested = $.Callbacks();

	};
	Workspace.prototype.handleFormSubmission = function ( labelData ) {
		this.saveLabel(labelData);
	};
	Workspace.prototype.handleFormAbandon = function () {
		this.abandonLabel();
	};
	Workspace.prototype.handleTaskSelection = function (task) {
		if (task) {
			this.view.show(task.id);
			this.form.setValues(task.label.data);
			this.form.show();
		}
	};
	Workspace.prototype.handleFullscreenChange = function (e) {
		this.fullscreen(this.fullscreenToggle.getValue());
	};
	Workspace.prototype.handleNewWorksetRequested = function () {
		this.newWorksetRequested.fire();
	};
	Workspace.prototype.loadWorkset = function (campaignId, worksetId) {
		var taskList, form, view,
		    query = WL.server.getWorkset(campaignId, worksetId);
		this.clear();
		this.$element.show();
		query.done( function (doc) {
			var formQuery;

			// Use this when debugging to make sure that errors in view construction
			// are reported with a full stack trace.  Otherwise, keep it commented
			// out.
			try {
				view = new WL.views[doc['campaign']['view']](doc['tasks']);
			} catch (err) {
				console.error(err.stack);
				alert('Could not load view "' + doc['campaign']['view'] + '": ' + err +
				      '\nUsing simple task viewer.');
				view = new WL.views.View(doc['tasks']);
			}

			taskList = new TaskList(doc['tasks']);

			formQuery = WL.server.getForm(doc['campaign']['form']);
			formQuery.done( function (formDoc) {
				try {
					form = WL.Form.fromConfig(formDoc['form'], mw.language.getFallbackLanguageChain());
					this.load(campaignId, worksetId, taskList, form, view);
				} catch (err) {
					console.error(err.stack);
					alert(
						'Could not load form "' + doc['campaign']['form'] + '": \n' + err
					);
				}
			}.bind(this));
			formQuery.fail( function (errorDoc) {
				alert(
					'Could not load form "' + doc['campaign']['form'] + '": \n' +
					JSON.stringify(errorDoc, null, 2)
				);
			}.bind(this) );
		}.bind(this) );
	};
	Workspace.prototype.load = function (campaignId, worksetId, taskList, form, view) {
		var firstTask;
		this.clear();

		this.campaignId = campaignId;
		this.worksetId = worksetId;

		this.taskList = taskList;
		this.$container.append(taskList.$element);
		this.taskList.taskSelected.add(this.handleTaskSelection.bind(this));

		this.form = form;
		this.$container.append(form.$element);
		this.form.submitted.add(this.handleFormSubmission.bind(this));
		this.form.abandoned.add(this.handleFormAbandon.bind(this));

		this.view = view;
		this.$container.append(view.$element);
		this.view.newWorksetRequested.add(this.handleNewWorksetRequested.bind(this));

		this.fullscreenToggle.setDisabled(false);

		firstTask = this.taskList.selectByIndex(0);
		this.view.show(firstTask.id);
	};
	Workspace.prototype.saveLabel = function (labelData) {
		var fieldName,
		    fieldsMissingValues,
		    task = this.taskList.selectedTask;

		if ( !task ) {
			alert("Can't save label.  No task is selected!");
		}

		WL.server.saveLabel(this.campaignId, this.worksetId, task.id, labelData)
			.done( function (doc) {
				var tasks, labels;
				task.label.load(doc['label']);

				tasks = this.taskList.length();
				labels = this.taskList.labeled();

				this.labelSaved.fire(this.campaignId, this.worksetId, tasks, labels);

				if ( this.taskList.last() && this.taskList.complete() ) {
					this.taskList.select(null);
					this.form.clear();
					this.form.hide();
					this.view.showCompleted();
				} else {
					this.taskList.next();
				}
				$.removeSpinner( WL.config.prefix + 'submit-spinner' );
			}.bind(this));

	};
	Workspace.prototype.abandonLabel = function () {
		var fieldName,
		    fieldsMissingValues,
		    task = this.taskList.selectedTask;

		if ( !task ) {
			alert("Can't abandon task.  No task is selected!");
		}

		WL.server.abandonLabel(this.campaignId, this.worksetId, task.id)
			.done( function (doc) {
				var tasks, labels;
				// TODO: Fix API response
				task.label.load({'data': true}, 'abandoned');

				tasks = this.taskList.length();
				labels = this.taskList.labeled();

				// Let's assume it's saved
				this.labelSaved.fire(this.campaignId, this.worksetId, tasks, labels);

				if ( this.taskList.last() && this.taskList.complete() ) {
					this.taskList.select(null);
					this.form.clear();
					this.form.hide();
					this.view.showCompleted();
				} else {
					this.taskList.next();
				}
				$.removeSpinner( WL.config.prefix + 'abandon-spinner' );
			}.bind(this));

	};
	Workspace.prototype.fullscreen = function (fullscreen) {
		if ( fullscreen === undefined) {
			return this.$element.hasClass('fullscreen');
		} else if ( fullscreen ) {
			$('body').append(this.$element);
			this.$element.addClass('fullscreen');
			return this;
		} else {
			this.$parent.append(this.$element);
			this.$element.removeClass('fullscreen');
			return this;
		}
	};
	Workspace.prototype.clear = function () {
		this.$container.empty();
		this.fullscreenToggle.setDisabled(true);
	};

	var TaskList = function (taskListData) {
		this.$element = $('<div>').addClass('task-list');

		this.$header = $('<div>').addClass('header').text(WL.i18n("Workset"));
		this.$element.append(this.$header);

		this.tasks = null;
		this.$tasks = $('<div>').addClass('tasks');
		this.$element.append(this.$tasks);
		this.$tasksTable = $('<table>').addClass('table');
		this.$tasks.append(this.$tasksTable);
		this.$tasksRow = $('<tr>').addClass('row');
		this.$tasksTable.append(this.$tasksRow);

		this.selectedTaskInfo = null;
		this.taskSelected = $.Callbacks();

		this.load(taskListData);
	};
	TaskList.prototype.handleTaskActivation = function (task) {
		this.select(task);
	};
	TaskList.prototype.load = function (taskListData) {
		var taskData, task, i;

		this.$tasksRow.empty(); // Just in case there was something in there.
		this.tasks = [];
		for (i = 0; i < taskListData.length; i++) {
			taskData = taskListData[i];

			task = new Task(i, taskData);
			task.activated.add(this.handleTaskActivation.bind(this));
			this.tasks.push(task);
			this.$tasksRow.append(task.$element);
		}
	};
	TaskList.prototype.select = function (task) {
		if (this.selectedTask) {
			this.selectedTask.select(false);
		}
		if (task) {
			task.select(true);
		}
		this.selectedTask = task;
		this.taskSelected.fire(task);
	};
	TaskList.prototype.selectByIndex = function (index) {
		if (index >= this.tasks.length) {
			throw "Could not select task. Index " + index + " out of bounds.";
		}
		this.select(this.tasks[index]);
		return this.tasks[index];
	};
	TaskList.prototype.shift = function (delta) {
		var newI;
		if (!this.selectedTask) {
			throw "No task assigned.  Can't shift().";
		}
		newI = (this.selectedTask.i + delta) % this.tasks.length;
		this.select(this.tasks[newI]);
	};
	TaskList.prototype.next = function () {
		return this.shift(1);
	};
	TaskList.prototype.prev = function () {
		return this.shift(-1);
	};
	TaskList.prototype.last = function () {
		if ( this.selectedTask ) {
			return this.selectedTask.i === this.tasks.length - 1;
		} else {
			throw "No task selected";
		}
	};
	TaskList.prototype.labeled = function () {
		var i, task,
		    labeledTasks = 0;

		for (i = 0; i < this.tasks.length; i++) {
			task = this.tasks[i];
			labeledTasks += task.complete();
		}
		return labeledTasks;
	};
	TaskList.prototype.complete = function () {
		var i, task;
		for (i = 0; i < this.tasks.length; i++) {
			task = this.tasks[i];
			if (!task.complete()) {
				return false;
			}
		}
		return true;
	};
	TaskList.prototype.length = function () {
		return this.tasks.length;
	};

	var Task = function (i, taskData) {
		this.$element = $('<td>').addClass( 'task');
		this.$element.click(this.handleClick.bind(this));

		this.i = i;
		this.selected = $.Callbacks();
		this.activated = $.Callbacks();

		this.load(taskData);
	};
	Task.prototype.handleClick = function (e) {
		if ( !this.disable() ) {
			this.activated.fire(this);
		}
	};
	Task.prototype.load = function (taskData) {
		this.$element.empty();
		this.id = taskData.id;
		this.data = taskData['task_data'];
		this.label = new Label(taskData['labels'][0]);
		this.$element.append(this.label.$element);
	};
	Task.prototype.select = function (selected) {
		if ( selected === undefined) {
			return this.$element.hasClass('selected');
		} else if ( selected ) {
			this.$element.addClass('selected');
			this.selected.fire();
			return this;
		} else {
			this.$element.removeClass('selected');
			return this;
		}
	};
	Task.prototype.setWidth = function (width) {
		this.$element.css('width', width);
	};
	Task.prototype.disable = function (disabled) {
		if ( disabled === undefined) {
			return this.$element.hasClass('disabled');
		} else if ( disabled ) {
			this.$element.addClass('disabled');
			return this;
		} else {
			this.$element.removeClass('disabled');
			return this;
		}
	};
	Task.prototype.complete = function () {
		return this.label.complete();
	};

	var Label = function (labelData) {
		this.$element = $("<div>").addClass("label");
		this.timestamp = null;
		this.data = null;

		this.load(labelData);
	};
	Label.prototype.load = function (labelData, className) {
		labelData = labelData || {};
		this.timestamp = labelData['timestamp'];
		this.data = labelData['data'];
		this.complete(this.data !== undefined && this.data !== null, className);
	};
	Label.prototype.complete = function (completed, className) {
		if ( className === undefined ) {
			var className = 'completed';
		}

		if ( completed === undefined ) {
			return this.$element.hasClass(className);
		} else if ( completed ) {
			this.$element.addClass(className);
			return this;
		} else {
			this.$element.removeClass(className);
			return this;
		}
	};

	wikiLabels.Workspace = Workspace;
})(mediaWiki, jQuery, OO, wikiLabels);
