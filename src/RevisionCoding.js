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
	var fields, tasks, curTaskIdx;

	function lookup( k ) {
		return mw.msg( 'rvc-' + k );
	}
	// Applying a translation to any level of a form description doc
	function applyTranslation( value, lookup ) {
		var i, l, transList, obj, transObj, key, str;
		if ( typeof value === 'string' ) {
			// If a string, look to see if we need to translate it.
			str = value;
			if ( str.charAt( 0 ) === '<' && str.charAt( str.length - 1 ) === '>' ) {
				// Lookup translation
				return lookup( str.substr( 1, str.length - 2 ) );
			} else {
				// No translation necessary
				return str;
			}
		} else if ( $.isArray( value ) ) {
			// Going to have to recurse for each item
			l = value;
			transList = [];
			for ( i in l ) {
				if ( l.hasOwnProperty( i ) ) {
					transList.push( applyTranslation( l[i], lookup ) );
				}
			}
			return transList;
		} else if ( typeof value === 'object' ) {
			// Going to have to recurse for each value
			obj = value;
			transObj = {};
			for ( key in obj ) {
				if ( obj.hasOwnProperty( key ) ) {
					transObj[ key ] = applyTranslation( obj[key], lookup );
				}
			}
			return transObj;
		} else {
			// bool or numeric == A-OK
			return value;
		}
	}

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
				curTaskIdx >= tasks.length
		);
	}

	function getWorkSet( campId, wsId ) {
		campId = campId || 345;
		wsId = wsId || 222;
		return $.ajax( {
			url: '//ores-test.wmflabs.org/coder/campaigns/' +
				mw.config.get( 'wgDBname' ) + '/' + campId + '/' + wsId + '/',
			dataType: 'jsonp'
		} );
	}

	function showWorkSet( data ) {
		var i, j, field, $icon, className, tooltip, value,
			$bar = $( '.rvc-progress' ).empty();
		tasks = ( data && data.workset.tasks ) || tasks;
		for ( i = 0; i < tasks.length; i++ ) {
			$icon = $( '<div>' );
			tooltip = mw.msg( 'rvc-revision-title', tasks[i].data.rev_id );
			for ( j = 0; j < fields.length; j++ ) {
				field = fields[j].id;
				// FIXME: how to get the labels (values) without doing an API request for each task in this workset?
				// FIXME: type of label values are inconsistent (boolean vs integers):
				// * true/false: https://ores-test.wmflabs.org/coder/campaigns/enwiki/111/222/333/
				// * 1/0: https://ores-test.wmflabs.org/coder/forms/damaging_and_goodfaith
				//
				// idx = tasks[i].fields[ field ];
				// value = fields[j].options[ idx ] && fields[j].options[ idx ].value;
				// tooltip += '\n' + fields[j].label + ' ' + value;
				className = 'rvc-' + field + '-' + value;
				$icon.append( $( '<div>' ).addClass( className ) );
			}
			$icon.attr(
				'title',
				tooltip
			);
			$bar.append( $icon );
		}
		$( '.rvc-progress > div' ).css( 'width', ( 100 / tasks.length ) + '%' );
		$( '.mw-ui-button.rvc-selected' ).removeClass( 'rvc-selected' );
		$( '#rvc-submit' ).prop( 'disabled', true );
		if ( curTaskIdx < tasks.length ) {
			$bar.find( '> div' ).eq( curTaskIdx ).addClass( 'rvc-selected' );
			showDiff( tasks[curTaskIdx].data.rev_id );
		}
	}

	function showDiff( revid ) {
		new mw.Api().get( {
			action: 'query',
			prop: 'revisions',
			rvdiffto: 'prev',
			revids: revid,
			indexpageids: true
		} ).done( function ( data ) {
			var page, pageids = data.query.pageids;
			if ( pageids && pageids[0] ) {
				page = data.query.pages[ pageids[0] ];
				// $( '#firstHeading' ).text( page.title );
				$( '#rvc-diff' ).empty().append(
					page.revisions[0].diff['*']
				);
			} else {
				$( '#rvc-diff' ).empty().text( mw.msg( 'rvc-badpageid' ) );
			}
		} );
	}

	function submit() {
		var campId = 123,
			wsId = 456,
			taskId = 789;
		$( '.mw-ui-button.rvc-selected' ).each( function () {
			var $this = $( this ),
				idxValue = $this.data( 'rvc-value' ),
				field = $this.parent().data( 'rvc-field' );
			if ( field !== undefined && idxValue !== undefined ) {
				if ( !tasks[ curTaskIdx ].fields ) {
					tasks[ curTaskIdx ].fields = {};
				}
				tasks[ curTaskIdx ].fields[ field ] = idxValue;
			}
		} );
		$( '#rvc-submit' ).injectSpinner( 'rvc-submit-spinner' );
		$.ajax( {
			url: '//ores-test.wmflabs.org/coder/campaigns/' +
				mw.config.get( 'wgDBname' ) + '/' + campId + '/' + wsId + '/' + taskId + '/',
			data: {
				label: JSON.stringify( {
					// TODO: use integers consistently for storing labels?
					goodfaith: true,
					damaging: false
				} )
			},
			dataType: 'jsonp'
		} ).always( function () {
			$.removeSpinner( 'rvc-submit-spinner' );
		} ).fail( function () {
			alert( 'An errror occurred! Check the console...' );
		} );
		curTaskIdx++;
		showWorkSet();
		if ( curTaskIdx >= tasks.length ) {
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
			field, i, j, id, val, $feature, $group, key, messages, prefixedMsgs;
		// Reads in messages and sets a prefix for mw.msg to do lookups
		messages = data.i18n[ mw.config.get( 'wgUserLanguage' ) ] || data.i18n.en;
		prefixedMsgs = {};
		for ( key in messages ) {
			if ( messages.hasOwnProperty( key ) ) {
				prefixedMsgs[ 'rvc-' + key ] = messages[ key ];
			}
		}
		mw.messages.set( prefixedMsgs );
		fields = applyTranslation( data.fields, lookup );

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
				.addClass( 'mw-ui-button-group' );
			for ( j = 0; j < field.options.length; j++ ) {
				val = field.options[j].value;
				$group.append(
					$( '<div>' )
						.addClass( 'mw-ui-button' )
						.attr( 'id', 'rvc-' + field.id + '-' + val )
						.attr( 'title', field.options[j].tooltip )
						.text( field.options[j].label )
						.data( 'rvc-value', j )
						.click( toggleSelection )
// 					$( '<input type="radio">' )
// 						.attr( 'name', 'rvc-' + field.id )
// 						.attr( 'id', 'rvc-' + field.id + '-' + val )
// 						.attr( 'title', field.options[j].tooltip ),
// 					$( '<label for="">' )
// 						.text( field.options[j].label )
// 						.attr( 'for', 'rvc-' + field.id + '-' + val )
// 						.data( 'rvc-value', j )
// 						.click( toggleSelection )
				);
			}
			$feature = $( '<div>' )
				.attr( 'title', field.help )
				.append(
					$( '<div>' )
						.text( field.label ),
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
		curTaskIdx = 0;
		getWorkSet()
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
						url: '//ores-test.wmflabs.org/coder/forms/damaging_and_goodfaith',
						dataType: 'jsonp'
					} )
					.done( load );
				} );
			}
		} );
	}

}( mediaWiki, jQuery ) );
