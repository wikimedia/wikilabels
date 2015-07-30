( function (mw, $, WL) {

	var View = function (taskListData) {
		this.$element = $("<div>").addClass(WL.config.prefix + "view");

		this.taskMap = null;
		this.tasks = [];
		this.selectedTaskInfo = null;
		this.taskSelected = $.Callbacks();
		this.worksetCompleted = new WorksetCompleted();
		this.worksetCompleted.newWorksetRequested.add(this.handleNewWorksetRequested.bind(this));

		this.newWorksetRequested = $.Callbacks();

		this.load(taskListData);
	};
	OO.initClass(View);
	View.prototype.handleNewWorksetRequested = function ( ) {
		this.newWorksetRequested.fire();
	};
	View.prototype.load = function (taskListData) {
		var i, taskData, taskInfo;
		this.taskMap = {};
		for (i = 0; i < taskListData.length; i++) {
			taskData = taskListData[i];
			taskInfo = { i: i, data: taskData };
			this.tasks.push(taskInfo);
			this.taskMap[taskData.id] = i;
		}
	};
	View.prototype.show = function (taskId) {
		if (this.taskMap[taskId] === undefined) {
			throw "Could not find data for task_id=" + taskId;
		} else {
			this.select(this.tasks[this.taskMap[taskId]]);
		}
	};
	View.prototype.select = function (taskInfo) {
		var oldTaskInfo = this.selectedTaskInfo;
		this.selectedTaskInfo = taskInfo;
		if (oldTaskInfo !== this.selectedTaskInfo) {
			this.taskSelected.fire(taskInfo.data.id);
		}
		this.present(this.selectedTaskInfo);
	};
	View.prototype.present = function (taskInfo) {
		var jsonString = JSON.stringify(taskInfo, null, 2);

		this.$element.html($("<pre>").text(jsonString)); // spacing set pprint
	};
	View.prototype.showCompleted = function () {
		this.$element.html(this.worksetCompleted.$element);
	};

	var DiffToPrevious = function(taskListData) {
		DiffToPrevious.super.call( this, taskListData );
		this.$element.addClass(WL.config.prefix + "diff-to-previous");
	};
	OO.inheritClass(DiffToPrevious, View);
	DiffToPrevious.prototype.load = function (taskListData) {
		DiffToPrevious.super.prototype.load.call( this, taskListData );
		this.preCacheDiffs();
	};
	DiffToPrevious.prototype.present = function (taskInfo) {
		if(taskInfo.diff){
			this.presentDiff(taskInfo.diff);
		} else {
			WL.api.diffToPrevious(taskInfo.data['data']['rev_id'])
				.done( function (diff) {
					this.tasks[taskInfo.i].diff = diff; // Cache!
					this.presentDiff(diff);
				}.bind(this) )
				.fail( function (doc) {
					var error = $("<pre>").addClass("error");
					this.$element.html(error.text(JSON.stringify(doc, null, 2)));
				}.bind(this) );
		}
	};
	DiffToPrevious.prototype.preCacheDiffs = function (index) {
		var query, revId;
		index = index || 0;

		if ( index >= this.tasks.length ) {
			// We're done here
			return null;
		} else if ( this.tasks[index].diff !== undefined ) {
			//Already cached this diff.  Recurse!
			this.preCacheDiffs(index + 1);
		} else {
			//We don't have the diff.  Go get it.
			revId = this.tasks[index].data['data']['rev_id'];
			query = WL.api.diffToPrevious(revId);
			query.done( function (diff) {
				console.log("pre-caching diff for " + revId);
				this.tasks[index].diff = diff;
				// Recurse!
				this.preCacheDiffs(index + 1);
			}.bind(this) );
			query.fail( function (doc) {
				// Recurse!
				this.preCacheDiffs(index + 1);
			}.bind(this) );
		}
	};
	DiffToPrevious.prototype.presentDiff = function(diff){
		var diffLink,
			title = WL.util.linkToTitle(diff.title).addClass("title"),
			description = $("<div>").addClass("description"),
			comment = $("<div>").addClass("comment"),
			direction = $("#mw-content-text").attr("dir"),
			diffTable = (direction == 'rtl' ?
				$("<table>").addClass("diff diff-contentalign-right") :
				$("<table>").addClass("diff diff-contentalign-left"));

		this.$element.empty();

		this.$element.append(title);


		diffLink = WL.util.linkToDiff(diff.revId).prop('outerHTML');
		description.html(WL.i18n("Diff for revision $1", [diffLink]));
		this.$element.append(description);

		this.$element.append(comment.html(diff.comment));

		if (diff.tableRows) {
			diffTable.append(
				"<col class='diff-marker' />" +
				"<col class='diff-content' />" +
				"<col class='diff-marker' />" +
				"<col class='diff-content' />"
			);
			diffTable.append(diff.tableRows);
			this.$element.append(diffTable);
		} else {
			this.$element.append(
				$("<div>").addClass("no-difference")
				          .text(WL.i18n("No difference"))
			);
		}
	};

	var WorksetCompleted = function () {
		this.$element = $("<div>").addClass("completed");

		this.$message = $("<div>").addClass("message")
		                          .text(WL.i18n("Workset complete!"));
		this.$element.append(this.$message);

		this.newWorkset = new OO.ui.ButtonWidget( {
			label: WL.i18n("Request new workset"),
			classes: [ "new-button" ]
		} );
		this.$element.append(this.newWorkset.$element);
		this.newWorkset.on('click', this.handleNewWorksetClick.bind(this));

		this.newWorksetRequested = $.Callbacks();
	};
	WorksetCompleted.prototype.handleNewWorksetClick = function () {
		this.newWorksetRequested.fire();
	};

	WL.views = {
		View: View,
		DiffToPrevious: DiffToPrevious
	};
}(mediaWiki, jQuery, wikiLabels));
