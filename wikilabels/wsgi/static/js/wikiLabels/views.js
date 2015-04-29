( function (mw, $, WL) {

	var View = function (taskListData) {
		this.$element = $("<div>").addClass("view");

		this.taskMap = null;
		this.tasks = [];
		this.selectedTaskInfo = null;
		this.taskSelected = $.Callbacks();

		this.load(taskListData);
	};
	OO.initClass(View);
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

	var DiffToPrevious = function(taskListData) {
		DiffToPrevious.super.call( this, taskListData );
	};
	OO.inheritClass(DiffToPrevious, View);
	DiffToPrevious.prototype.load = function (taskListData) {
		DiffToPrevious.super.prototype.load.call( this, taskListData );
		this.preCacheDiffs();
	};
	DiffToPrevious.prototype.present = function (taskInfo) {
		var query;
		console.log(JSON.stringify(taskInfo).length);
		if(taskInfo.diff){
			this.presentDiff(taskInfo.diff);
		} else {
			query = WL.api.diffToPrevious(taskInfo.data['data']['rev_id']);
			query.done( function (diff) {
				this.tasks[taskInfo.i].diff = diff; // Cache!
				this.presentDiff(diff);
			}.bind(this) );
			query.fail( function (doc) {
				this.$element.html($("<pre>").html(JSON.stringify(doc, null, 2)));
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
		var table = $("<table>").addClass("diff").html(diff);
		this.$element.html(table);
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


function Foo() {};
Foo.prototype.hello = function(){return "foo";};

function Bar() {
    Foo.call( this );
}
Bar.prototype.hello = function(){return "bar";};

OO.inheritClass( Foo, Bar );

b = new Bar();
b.hello();
