( function ( $, WL ) {
	var View, DiffToPrevious, MultiDiffToPrevious, PageAsOfRevision,
		PrintablePageAsOfRevision, ParsedWikitext,
		WorksetCompleted, RenderedHTML, UnsourcedStatement;

	View = function ( taskListData ) {
		this.$element = $( '<div>' ).addClass( WL.config.prefix + 'view' );

		this.taskMap = null;
		this.tasks = [];
		this.selectedTaskInfo = null;
		this.taskSelected = $.Callbacks();
		this.worksetCompleted = new WorksetCompleted();
		this.worksetCompleted.newWorksetRequested.add( this.handleNewWorksetRequested.bind( this ) );

		this.newWorksetRequested = $.Callbacks();

		this.load( taskListData );
	};
	OO.initClass( View );
	View.prototype.handleNewWorksetRequested = function () {
		this.newWorksetRequested.fire();
	};
	View.prototype.load = function ( taskListData ) {
		var i, taskData, taskInfo;
		this.taskMap = {};
		for ( i = 0; i < taskListData.length; i++ ) {
			taskData = taskListData[ i ];
			taskInfo = { i: i, data: taskData };
			this.tasks.push( taskInfo );
			this.taskMap[ taskData.id ] = i;
		}
	};
	View.prototype.show = function ( taskId ) {
		if ( this.taskMap[ taskId ] === undefined ) {
			throw Error( 'Could not find data for task_id=' + taskId );
		} else {
			this.select( this.tasks[ this.taskMap[ taskId ] ] );
		}
	};
	View.prototype.select = function ( taskInfo ) {
		var oldTaskInfo = this.selectedTaskInfo;
		this.selectedTaskInfo = taskInfo;
		if ( oldTaskInfo !== this.selectedTaskInfo ) {
			this.taskSelected.fire( taskInfo.data.id );
		}
		this.present( this.selectedTaskInfo );
	};
	View.prototype.present = function ( taskInfo ) {
		var jsonString = JSON.stringify( taskInfo, null, 2 );

		this.$element.html( $( '<pre>' ).text( jsonString ) ); // spacing set pprint
	};
	View.prototype.showCompleted = function () {
		this.$element.html( this.worksetCompleted.$element );
	};

	DiffToPrevious = function ( taskListData ) {
		DiffToPrevious.super.call( this, taskListData );
		this.$element.addClass( WL.config.prefix + 'diff-to-previous' );
	};
	OO.inheritClass( DiffToPrevious, View );
	DiffToPrevious.prototype.load = function ( taskListData ) {
		DiffToPrevious.super.prototype.load.call( this, taskListData );
		this.preCacheDiffs();
	};
	DiffToPrevious.prototype.present = function ( taskInfo ) {
		if ( taskInfo.diff ) {
			this.presentDiff( taskInfo.diff );
		} else {
			WL.api.diffToPrevious( taskInfo.data.data.rev_id )
				.done( function ( diff ) {
					this.tasks[ taskInfo.i ].diff = diff; // Cache!
					this.presentDiff( diff );
				}.bind( this ) )
				.fail( function ( doc ) {
					var error = $( '<pre>' ).addClass( 'error' );
					this.$element.html( error.text( JSON.stringify( doc, null, 2 ) ) );
				}.bind( this ) );
		}
	};
	DiffToPrevious.prototype.preCacheDiffs = function ( index ) {
		var query, revId;
		index = index || 0;

		if ( index >= this.tasks.length ) {
			// We're done here
			return null;
		} else if ( this.tasks[ index ].diff !== undefined ) {
			// Already cached this diff.  Recurse!
			this.preCacheDiffs( index + 1 );
		} else {
			// We don't have the diff.  Go get it.
			revId = this.tasks[ index ].data.data.rev_id;
			query = WL.api.diffToPrevious( revId );
			query.done( function ( diff ) {
				console.log( 'pre-caching diff for ' + revId );
				this.tasks[ index ].diff = diff;
				// Recurse!
				this.preCacheDiffs( index + 1 );
			}.bind( this ) );
			query.fail( function () {
				// Recurse!
				this.preCacheDiffs( index + 1 );
			}.bind( this ) );
		}
	};
	DiffToPrevious.prototype.presentDiff = function ( diff ) {
		var diffLink,
			title = WL.util.linkToTitle( diff.title ).addClass( 'title' ),
			description = $( '<div>' ).addClass( 'description' ),
			comment = $( '<div>' ).addClass( 'comment' ),
			direction = $( '#mw-content-text' ).attr( 'dir' ),
			diffTable = ( direction === 'rtl' ?
				$( '<table>' ).addClass( 'diff diff-contentalign-right' ) :
				$( '<table>' ).addClass( 'diff diff-contentalign-left' ) );

		this.$element.empty();

		this.$element.append( title );

		diffLink = WL.util.linkToDiff( diff.revId ).prop( 'outerHTML' );
		description.html( WL.i18n( 'Diff for revision $1', [ diffLink ] ) );
		this.$element.append( description );

		this.$element.append( comment.html( diff.comment ) );

		if ( diff.tableRows ) {
			diffTable.append(
				'<col class=\'diff-marker\' />' +
				'<col class=\'diff-content\' />' +
				'<col class=\'diff-marker\' />' +
				'<col class=\'diff-content\' />'
			);
			diffTable.append( diff.tableRows );
			this.$element.append( diffTable );
		} else {
			this.$element.append(
				$( '<div>' ).addClass( 'no-difference' )
					.text( WL.i18n( 'No difference' ) )
			);
		}
	};

	MultiDiffToPrevious = function ( taskListData ) {
		MultiDiffToPrevious.super.call( this, taskListData );
		this.$element.addClass( WL.config.prefix + 'diff-to-previous' );
		console.log('initially this $element', this)
	};
	OO.inheritClass( MultiDiffToPrevious, View );
	MultiDiffToPrevious.prototype.load = function ( taskListData ) {
		MultiDiffToPrevious.super.prototype.load.call( this, taskListData );
		this.preCacheDiffs();
	};
	MultiDiffToPrevious.prototype.preCacheRevList = function (index, jindex, revIdList, finishedCallback) {
			var query, revId;
			jindex = jindex || 0;
			// console.log('jindex is:', jindex);
			// console.log('revIdList is:', revIdList);
			if ( jindex >= revIdList.length ) {
				// We're done here
				this.tasks[index].diffListComplete = true
				// console.log("Finished callback is:", finishedCallback)
				if (finishedCallback == 'preCache'){
					this.preCacheDiffs(index+1)
				}
				else if (finishedCallback == 'present'){
					this.present(this.tasks[index])
				}
				else {console.error('no finished callback instructions given')}
			} else if ( this.tasks[index].diffList[jindex] !== undefined ) {
				console.log('were in jindex recurse statement');
				// Already cached this diff.  Recurse!
                this.preCacheRevList(index, jindex + 1, revIdList, finishedCallback);
			} else {
				revId = revIdList[jindex].rev_id;
				// console.log('revId is : ', revId);
				query = WL.api.diffToPrevious(revId);
				// console.log('asked for query');
				query.done(function (diff) {
					// Recurse!
					// console.log('pre-caching diff for ', diff.title);
					this.tasks[index].diffList[jindex] = diff;
					this.preCacheRevList(index, jindex + 1, revIdList, finishedCallback);
				}.bind(this));
				query.fail(function () {
					// Recurse!
					console.log('Failed to get diff for revId: ', revId);
					this.tasks[index].diffList.push('Fail');
					this.preCacheRevList(index, jindex + 1, revIdList, finishedCallback);
				}.bind(this));
			};
		};

	MultiDiffToPrevious.prototype.preCacheDiffs = function ( index ) {
		index = index || 0;
		// console.log('In precache diffs with index:', index);
		// console.log('Tasks are,:', this.tasks);
		if ( index >= this.tasks.length ) {
			// We're done here
			return null;
		} else if ( this.tasks[ index ].diffList !== undefined ) {
			// console.log('were in recurse statement');
			// Already cached this diffList.  Recurse!
			this.preCacheDiffs( index + 1 );
		} else {
			// We don't have the diffList.  Go get it.
			this.tasks[index].diffList = [];
			this.tasks[index].diffListComplete = false;
			// console.log('initialized difflist');
			this.preCacheRevList(index, 0, this.tasks[index].data.data, 'preCache');
		};
	};

	MultiDiffToPrevious.prototype.present = function ( taskInfo ) {
		console.log('Present called with taskInfo', taskInfo)
		if ( taskInfo.diffListComplete ) {
			this.presentDiff( taskInfo.diffList );
		} else {
			console.log("Entering Non-cached branch of present:", taskInfo);
			this.preCacheRevList(taskInfo.i, 0, taskInfo.data.data, 'present');
			}
	};

	MultiDiffToPrevious.prototype.presentDiff = function ( diffList ) {
		// console.log('DiffList is:', diffList);
		this.$element.empty();

		for (d=0; d<diffList.length; d++) {
            //loop over diffs
            var diffLink, diff;
            diff = diffList[d]

            // console.log("now appending for:", diff);
			revisionHeader = $('<h3>').text('Revision number '+(d+1)).addClass('revision-header'),
            title = WL.util.linkToTitle(diff.title).addClass('title'),
                description = $('<div>').addClass('description'),
                comment = $('<div>').addClass('comment'),
                direction = $('#mw-content-text').attr('dir'),
                diffTable = (direction === 'rtl' ?
                    $('<table>').addClass('diff diff-contentalign-right') :
                    $('<table>').addClass('diff diff-contentalign-left'));

            this.$element.append(revisionHeader);
            this.$element.append(title);

            diffLink = WL.util.linkToDiff(diff.revId).prop('outerHTML');
            description.html(WL.i18n('Diff for revision $1', [diffLink]));
            this.$element.append(description);

            this.$element.append(comment.html(diff.comment));

            if (diff.tableRows) {
                diffTable.append(
                    '<col class=\'diff-marker\' />' +
                    '<col class=\'diff-content\' />' +
                    '<col class=\'diff-marker\' />' +
                    '<col class=\'diff-content\' />'
                );
                diffTable.append(diff.tableRows);
                this.$element.append(diffTable);
            } else {
                this.$element.append(
                    $('<div>').addClass('no-difference')
                        .text(WL.i18n('No difference'))
                );
            }
            ;
        };
	};

	PageAsOfRevision = function ( taskListData ) {
		PageAsOfRevision.super.call( this, taskListData );
		this.$element.addClass( WL.config.prefix + 'page-as-of-revision' )
			.addClass( 'display-page-html' );
	};
	OO.inheritClass( PageAsOfRevision, View );
	PageAsOfRevision.prototype.present = function ( taskInfo ) {
		if ( taskInfo.title && taskInfo.html ) {
			this.presentPage( taskInfo.title, taskInfo.html );
		} else {
			WL.api.getRevision(
				taskInfo.data.data.rev_id,
				{
					rvprop: 'content',
					rvparse: true
				}
			)
				.done( function ( doc ) {
					this.tasks[ taskInfo.i ].html = doc[ '*' ]; // Cache!
					this.tasks[ taskInfo.i ].title = doc.page.title; // Cache!
					this.presentPage( doc.page.title, doc[ '*' ] );
				}.bind( this ) )
				.fail( function ( doc ) {
					var error = $( '<pre>' ).addClass( 'error' );
					this.$element.html( error.text( JSON.stringify( doc, null, 2 ) ) );
				}.bind( this ) );
		}
	};
	PageAsOfRevision.prototype.presentPage = function ( title, html ) {
		this.$element.html( '' );
		this.$element.append(
			$( '<h1>' ).text( title )
				.attr( 'id', 'firstHeading' )
				.addClass( 'firstHeading' )
		);
		this.$element.append(
			$( '<div>' ).html( html )
				.addClass( 'mw-body-content' )
				.attr( 'id', 'bodyContent' )
		);
	};

	PrintablePageAsOfRevision = function ( taskListData ) {
		PrintablePageAsOfRevision.super.call( this, taskListData );
		this.$element.addClass( WL.config.prefix + 'printable-page-as-of-revision' )
			.addClass( 'display-page-html' );
	};
	OO.inheritClass( PrintablePageAsOfRevision, View );
	PrintablePageAsOfRevision.prototype.present = function ( taskInfo ) {
		this.presentPage(
			'//' + WL.mediawiki.host + '/w/index.php?oldid=' +
			taskInfo.data.data.rev_id + '&printable=yes' );
	};
	PrintablePageAsOfRevision.prototype.presentPage = function ( src ) {
		var iframe = $( '<iframe>' ).attr( 'src', src );
		this.$element.html( '' );
		this.$element.append( iframe );
	};

	ParsedWikitext = function ( taskListData ) {
		ParsedWikitext.super.call( this, taskListData );
		this.$element.addClass( WL.config.prefix + 'parsed-wikitext' )
			.addClass( 'display-page-html' );
	};
	OO.inheritClass( ParsedWikitext, View );
	ParsedWikitext.prototype.present = function ( taskInfo ) {
		if ( taskInfo.html ) {
			this.presentHTML( taskInfo.html );
		} else {
			WL.api.wikitext2HTML( taskInfo.data.data.wikitext )
				.done( function ( html ) {
					this.tasks[ taskInfo.i ].html = html; // Cache!
					this.presentHTML( html );
				}.bind( this ) )
				.fail( function ( doc ) {
					var error = $( '<pre>' ).addClass( 'error' );
					this.$element.html( error.text( JSON.stringify( doc, null, 2 ) ) );
				}.bind( this ) );
		}
	};
	ParsedWikitext.prototype.presentHTML = function ( html ) {
		this.$element.html( html );
	};

	RenderedHTML = function ( taskListData ) {
		RenderedHTML.super.call( this, taskListData );
		this.$element.addClass( WL.config.prefix + 'rendered-html' )
			.addClass( 'display-page-html' );
	};
	OO.inheritClass( RenderedHTML, View );

	RenderedHTML.prototype.present = function ( taskInfo ) {
		var iframe = document.createElement( 'iframe' );
		iframe.srcdoc = taskInfo.data.data.html;
		this.$element.html( iframe );
	};

	UnsourcedStatement = function ( taskListData ) {
		UnsourcedStatement.super.call( this, taskListData );
		this.$element.addClass( WL.config.prefix + 'unsourced-statement' );
	};
	OO.inheritClass( UnsourcedStatement, RenderedHTML );

	UnsourcedStatement.prototype.getHTML = function ( taskData ) {
		var url;
		if ( taskData.html ) {
			return $.Deferred.resolve();
		}

		url = 'https://' + taskData.lang +
			'.wikipedia.org/api/rest_v1/page/html/' +
			taskData.title + '/' + taskData.revision + '/' + taskData.tid;

		return $.get( url, function ( response ) {
			taskData.html = response;
		} );
	};

	UnsourcedStatement.prototype.present = function ( taskInfo ) {
		var $iframe,
			that = this;

		this.getHTML( taskInfo.data.data ).done( function () {
			var taskData = taskInfo.data.data;
			console.log( 'taskData', taskData );
			UnsourcedStatement.super.prototype.present.call( that, taskInfo );
			$iframe = $( 'iframe', that.$element );
			$iframe.on( 'load', function () {
				var contents = $iframe.contents(),
					$section = $( 'section[data-mw-section-id="' +
						taskData.section_index + '"]', contents ),
					$p, text, sentences, $el;

				$( '.mw-ref', contents ).remove();

				$p = $( 'p', $section ).eq( taskData.paragraph_index );
				text = $p.text();
				sentences = text.split( /\.\s+/ );

				// highlight the whole paragraph
				if ( taskData.sentence_index === -1 ) {
					$el = $p;
				} else {
					sentences[ taskData.sentence_index ] =
						'<span>' +
						sentences[ taskData.sentence_index ] +
						'</span>';
					$p.html( sentences.join( '. ' ) );
					$el = $( 'span', $p );
				}

				console.log( $el );
				if ( $el.length ) {
					$el.css( 'background-color', '#ff0' );
					contents.children().animate( {
						scrollTop: $el.offset().top
					}, 1000 );
				}
			} );
		} );
	};

	WorksetCompleted = function () {
		this.$element = $( '<div>' ).addClass( 'completed' );

		this.$message = $( '<div>' ).addClass( 'message' )
			.text( WL.i18n( 'Workset complete!' ) );
		this.$element.append( this.$message );

		this.newWorkset = new OO.ui.ButtonWidget( {
			label: WL.i18n( 'Request new workset' ),
			classes: [ 'new-button' ]
		} );
		this.$element.append( this.newWorkset.$element );
		this.newWorkset.on( 'click', this.handleNewWorksetClick.bind( this ) );

		this.newWorksetRequested = $.Callbacks();
	};
	WorksetCompleted.prototype.handleNewWorksetClick = function () {
		this.newWorksetRequested.fire();
	};

	WL.views = {
		View: View,
		DiffToPrevious: DiffToPrevious,
		MultiDiffToPrevious: MultiDiffToPrevious,
		PageAsOfRevision: PageAsOfRevision,
		PrintablePageAsOfRevision: PrintablePageAsOfRevision,
		ParsedWikitext: ParsedWikitext,
		RenderedHTML: RenderedHTML,
		UnsourcedStatement: UnsourcedStatement
	};
}( jQuery, wikiLabels ) );
