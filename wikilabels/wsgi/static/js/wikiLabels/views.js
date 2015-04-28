( function (mw, $, WL) {

	var View = function (taskListData) {
		this.$element = $("<div>").addClass("view");
		this.taskMap = null;
		this.taskList = null;
		this.selectedTaskInfo = null;
		this.load(taskListData);

		this.taskSelected = $.Callbacks();
	};
	View.prototype.load = function (taskListData) {
		var i, taskData;
		this.taskMap = {};
		this.taskList = {};
		for (i = 0; i < taskListData.length; i++) {
			taskData = taskListData[i];
			this.taskList.push( { i: i, data: taskData } );
			this.taskMap[taskData.id] = i;
		}
	};
	View.prototype.show = function (taskId) {
		if (this.taskMap[taskId] === undefined) {
			throw "Could not find data for task_id=" + taskId;
		} else {
			this.present(this.taskMap[taskId]);
		}
	};
	View.prototype.shift = function (delta) {
		var newI;
		if (!this.selectedTaskInfo) {
			throw "No task assigned.  Can't shift().";
		}
		newI = (this.selectedTaskInfo.i + delta) % this.taskList.length;
		this.select(this.taskList[newI]);
	};
	View.prototype.next = function () {
		return this.shift(1);
	};
	View.prototype.prev = function () {
		return this.shift(-1);
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

		this.$element.append($("<pre>").text(jsonString)); // spacing set pprint
	};
	OO.initClass(View);

	var DiffToPrevious = function(taskListData) {
		View.call( this, taskListData );
	};
	DiffToPrevious.prototype.load = function (taskListData) {
		View.prototype.load.call( this, taskListData );
		this.preCacheDiffs();
	};
	DiffToPrevious.prototype.present = function (taskInfo) {
		var query;
		if(taskInfo.diff){
			this.presentDiff(taskInfo.diff);
		} else {
			query = WL.api.getDiff(taskInfo.data['data']['rev_id']);
			query.done( function (diff) {
				taskInfo.diff = diff; // Cache!
				this.presentDiff(diff);
			}.bind(this) );
			query.fail( function (doc) {
				this.$element.html($("<pre>").html(JSON.stringify(doc, null, 2)));
			} );
		}
	};
	DiffToPrevious.prototype.preCacheDiffs = function (index) {
		var query;
		index = index || 0;

		if ( index >= this.taskList.length ) {
			// We're done here
			return null;
		} else if ( this.taskList[index].diff !== undefined ) {
			//Already cached this diff.  Recurse!
			this.preCacheDiffs(index + 1);
		} else {
			//We don't have the diff.  Go get it.
			query = WL.api.getDiff(this.taskList[index].data['data']['rev_id']);
			query.done( function (diff) {
				this.taskList[index].diff = diff;
				// Recurse!
				this.preCacheDiffs(index + 1);
			}.bind(this) );
		}
	};
	DiffToPrevious.prototype.presentDiff = function(diff){
		var table = $("<table>").addClass("diff").html(diff);
		this.$element.html(table);
	};
	OO.inheritClass(DiffToPrevious, View);

	var WorksetCompleted = function () {
		this.$element = $("<div>").addClass("completed");

		this.$message = $("<div>").addClass("message")
		                          .text(WL.i18n("Workset complete!"));
		this.$element.append(this.$message);

		this.newWorkset = new OO.ui.ButtonWidget( {
			label: WL.i18n("Request new workset"),
			classes: [ "new-button" ]
		} );
		this.$element.append(this.handleNewWorksetClick.$element);

		this.newWorksetRequested = $.Callbacks();
	};
	WorksetCompleted.handleNewWorksetClick = function () {
		this.newWorksetRequested.fire();
	};

	WL.views = {
		View: View,
		DiffToPrevious: DiffToPrevious
	};
}(mediaWiki, jQuery, wikiLabels));
