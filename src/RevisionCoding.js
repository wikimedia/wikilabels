/**
 * Interface for evaluating revisions
 *
 * @author: Helder (https://github.com/he7d3r)
 * @license: CC BY-SA 3.0 <https://creativecommons.org/licenses/by-sa/3.0/>
 * Based on mockups by Aaron Halfaker
 * https://meta.wikimedia.org/wiki/Research_talk:Revision_scoring_as_a_service?oldid=10266386#Revision_handcoding_.28mockups.29
 */
( function ( mw, $ ) {
	'use strict';
	var i18n, config, fields, workSet, curIdx;

	function toggleSelection( e ) {
		var $target = $( e.target ),
			wasSelected = $target.hasClass( 'rvc-selected' );
		$target
			.parent()
				.find( '.rvc-selected' )
					.removeClass( 'rvc-selected' )
					.end()
				.end();
		if ( !wasSelected ) {
			$target.addClass( 'rvc-selected' );
		}
		// The user must select one value for each field
		$( '#rvc-submit' ).prop(
			'disabled',
			 $( '.mw-ui-button.rvc-selected' ).length !== fields.length ||
			 curIdx >= workSet.length
		);
	}
/*
	function getRandomSet( size, done ) {
		var i, j, rev,
			apiDeferred = $.Deferred(),
			list = [];
		size = size || 100;
		done = done || 70;
		curIdx = done + 1;
		for ( i = 0; i < size; i++ ) {
			rev = {
				revid: Math.floor( Math.random() * 1000000 ),
				pageid: Math.floor( Math.random() * 1000000 ),
				// One key for each of the things we want to predict (vandalism, good-faith, quality, etc)
				fields: {}
			};
			if ( i <= done ) {
				// TODO:
				// * Should an 'undefined' value mean 'unknown'?
				//   In that case, this could be a boolean
				// * Or one should explicitly set a value (e.g. 0) to mean 'unknown'?
				//   In case there are just three possibilities, we could use -1, 0 and 1 instead of 0, 1 and 2?
				// FIXME: these names should not be hardcoded
				// TODO: Should we hardcode common sense such as "not damaging implies good faith"?
				for ( j = 0; j < fields.length; j++ ) {
					// Classes from 0 to (N-1), where N is the number of options for this field
					rev.fields[ fields[j].id ] = Math.floor( Math.random() * fields[j].options.length );
				}
			}
			list.push( rev );
		}
		apiDeferred.resolve( list );
		return apiDeferred.promise();
	}
*/
	function getRecentChanges( options ) {
		var apiDeferred = $.Deferred(),
			defaultOptions = {
				action: 'query',
				list: 'recentchanges',
				rctype: 'edit|new',
				rclimit: 50
			},
			params = $.extend( {}, defaultOptions, options );
		new mw.Api().get( params ).done( function( data ){
			var i,
				list = [],
				changes = data.query.recentchanges;
			for( i = 0; i < changes.length; i++ ){
				list.push( {
					revid: changes[i].revid,
					pageid: changes[i].pageid,
					// One key for each of the things we want to predict (vandalism, good-faith, quality, etc)
					fields: {}
				} );
			}
			apiDeferred.resolve( list );
		} )
		.fail( function(){
			// TODO: Reject and pass some error info?
			apiDeferred.resolve( [] );
		} );
		return apiDeferred.promise();
	}

	function showWorkSet( ws ){
		var i, j, field, idx, $icon, className, tooltip, value,
			$bar = $( '.rvc-progress' ).empty();
		workSet = ws || workSet;
		for ( i = 0; i < workSet.length; i++ ) {
			$icon = $( '<div>' );
			tooltip = mw.msg( 'rvc-revision-title', workSet[i].revid );
			for ( j = 0; j < fields.length; j++ ) {
				field = fields[j].id;
				idx = workSet[i].fields[ field ];
				value = fields[j].options[ idx ] && fields[j].options[ idx ].value;
				tooltip += '\n' + fields[j].label + ' ' + value;
				className = 'rvc-' + field + '-' + value;
				$icon.append( $( '<div>' ).addClass( className ) );
			}
			$icon.attr(
				'title',
				tooltip
			);
			$bar.append( $icon );
		}
		$( '.rvc-progress > div' ).css( 'width', ( 100 / workSet.length ) + '%' );
		$( '.mw-ui-button.rvc-selected' ).removeClass( 'rvc-selected' );
		$( '#rvc-submit' ).prop( 'disabled', true );
		if( curIdx < workSet.length ){
			$bar.find( '> div' ).eq( curIdx ).addClass( 'rvc-selected' );
			showDiff( workSet[ curIdx ].revid );
		}
	}

	function showDiff( revid ){
		new mw.Api().get( {
			action: 'query',
			prop: 'revisions',
			rvdiffto: 'prev',
			revids: revid,
			indexpageids: true
		} ).done( function( data ){
			var page = data.query.pages[ data.query.pageids[0] ];
			// $( '#firstHeading' ).text( page.title );
			$( '#rvc-diff' ).empty().append(
				page.revisions[0].diff['*']
			);
		} );
	}

	function submit(){
		var revData;
		$( '.mw-ui-button.rvc-selected' ).each( function(){
			var $this = $( this ),
				idxValue = $this.data( 'rvc-value' ),
				field = $this.parent().data( 'rvc-field' );
			if( field !== undefined && idxValue !== undefined ){
				workSet[ curIdx ].fields[ field ] = idxValue;
			}
		} );
		// FIXME: Generalize the API provided by the tool on Labs,
		// to deal with arbitrary number of fields (columns?)
		revData = {
			action: 'save',
			rev: workSet[ curIdx ].revid,
			page: workSet[ curIdx ].pageid,
			// FIXME: This number changes between wikis
			// FIXME: Authenticate using OAuth
			user: mw.config.get( 'wgUserId' ),
			// FIXME: This is just a hack to map our values to
			// the ones currently accepted by the tool
			score: {
					0: 'no',
					1: 'yes'
				}[ workSet[ curIdx ].fields.damaging ],
			gfaith: {
					0: 'no',
					1: 'yes'
				}[ workSet[ curIdx ].fields['good-faith'] ],
			wiki: mw.config.get( 'wgDBname' ),
			comment: location.origin +
				mw.util.getUrl( 'User:' + mw.config.get( 'wgUserName' ) )
		};
		$( '#rvc-submit' ).injectSpinner( 'rvc-submit-spinner' );
		$.ajax( {
			// See the saved data on http://ores-test.wmflabs.org/table
			url: '//ores-test.wmflabs.org/save',
			data: revData,
			dataType: 'jsonp'
		} ).always( function(){
			$.removeSpinner( 'rvc-submit-spinner' );
		} ).fail( function(){
			console.log( arguments );
			alert( 'An errror occurred! Check the console...' );
		} );
		curIdx++;
		showWorkSet();
		if( curIdx >= workSet.length ){
			alert( mw.msg( 'rvc-dataset-completed' ) );
			$( '#rvc-submit' ).prop( 'disabled', true );
		}
	}

	function load( data ) {
		var $ui = $( '#rvc-ui' ).empty(),
			// FIXME: Migrate to OOjs UI (http://livingstyleguide.wmflabs.org/wiki/OOjs_UI)
			$submit = $( '<input id="rvc-submit" class="mw-ui-button mw-ui-constructive" type="submit">' )
				.prop( 'disabled', true )
				.click( submit ),
			field, i, j, id, val, $feature, $group;
		fields = data.form.fields;
		i18n = data.form.i18n;
		mw.messages.set( i18n[ mw.config.get( 'wgUserLanguage' ) ] || i18n.en );

		$submit.val( mw.msg( 'rvc-submit' ) );
		$ui.append(
			$( '<div>' )
				.text( mw.msg( 'rvc-work-set' ) ),
			$( '<div>' )
				.addClass( 'rvc-progress' )
		);
		for ( i = 0; i < fields.length; i++ ) {
			field = fields[i];
			id = field.id;
			$group = $( '<div>' )
				.data( 'rvc-field', id )
				// .addClass( 'mw-ui-radio');
				.addClass( 'mw-ui-button-group');
			for ( j = 0; j < field.options.length; j++ ) {
				val = field.options[j].value;
				$group.append(
					$( '<div>' )
						.addClass( 'mw-ui-button')
						.attr( 'id', 'rvc-' + field.id + '-' + val )
						.attr( 'title', mw.msg( field.options[j].tooltip ) )
						.text( mw.msg( field.options[j].label ) )
						.data( 'rvc-value', j )
						.click( toggleSelection )
// 					$( '<input type="radio">' )
// 						.attr( 'name', 'rvc-' + field.id )
// 						.attr( 'id', 'rvc-' + field.id + '-' + val )
// 						.attr( 'title', mw.msg( field.options[j].tooltip ) ),
// 					$( '<label for="">' )
// 						.text( mw.msg( field.options[j].label ) )
// 						.attr( 'for', 'rvc-' + field.id + '-' + val )
// 						.data( 'rvc-value', j )
// 						.click( toggleSelection )
				);
			}
			$feature = $( '<div>' )
				.attr( 'title', mw.msg( field.help ) )
				.append(
					$( '<div>' )
						.text( mw.msg( field.label ) ),
					$group
				);
			$ui.append( $feature, '<div style="clear:both"></div>' );
		}
		$ui.append( $submit )
			.append(
				'<table class="diff diff-contentalign-left">' +
				'<colgroup><col class="diff-marker">' +
				'<col class="diff-content">' +
				'<col class="diff-marker">' +
				'<col class="diff-content">' +
				'</colgroup><tbody id="rvc-diff"></tbody></table>'
			);
		curIdx = 0;
		// getRandomSet()
		getRecentChanges()
			.done( showWorkSet );
	}

	if ( $.inArray( mw.config.get( 'wgAction' ), [ 'view', 'purge' ] ) !== -1 ) {
		$( function () {
			if ( $( '#rvc-ui' ).length !== 0 ) {
				mw.loader.using( [
					'mediawiki.api',
					'jquery.spinner',
					// TODO: Load this only when necessary
					// (e.g. if the user will be required to click on some button before the first diff appears)
					'mediawiki.action.history.diff'
				] ).done( function () {
					$.ajax(
					{
						'url': '//ores-test.wmflabs.org/coder/forms/damaging_and_goodfaith',
						'dataType': 'jsonp'
					} )
					.done( load );
				} );
			}
		} );
	}

}( mediaWiki, jQuery ) );
