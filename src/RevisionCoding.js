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
	var i18n = {
		en: {
			'rvc-work-set': 'Work set:',
			'rvc-damaging': 'Damaging?',
			'rvc-damaging-title': 'Did this edit cause damage to the article?',
			'rvc-damaging-yes': 'Yes',
			'rvc-damaging-yes-title': 'Yes, this edit is damaging and should be reverted.',
			'rvc-damaging-no': 'No',
			'rvc-damaging-no-title': 'No, this edit is not damaging and should not be reverted.',
			'rvc-damaging-unsure': 'Unsure',
			'rvc-damaging-unsure-title': 'It\'s not clear whether this edit damages the article or not.',
			'rvc-good-faith': 'Good faith?',
			'rvc-good-faith-title': 'Does it appear as though the author of this edit was trying to contribute productively?',
			'rvc-good-faith-yes': 'Yes',
			'rvc-good-faith-yes-title': 'Yes, this edit appears to have been made in good-faith.',
			'rvc-good-faith-no': 'No',
			'rvc-good-faith-no-title': 'No, this edit appears to have been made in bad-faith.',
			'rvc-good-faith-unsure': 'Unsure',
			'rvc-good-faith-unsure-title': 'It\'s not clear whether or not this edit was made in good-faith.',
			'rvc-revision-title': 'Revision: $1',
			'rvc-submit': 'Submit',
			'rvc-dataset-completed': 'You completed this dataset!'
		},
		pt: {
			'rvc-work-set': 'Conjunto de trabalho:',
			'rvc-damaging': 'Prejudicial?',
			'rvc-damaging-title': 'Esta edição prejudicou o artigo?',
			'rvc-damaging-yes': 'Sim',
			'rvc-damaging-yes-title': 'Sim, esta edição é prejudicial e deveria ser revertida.',
			'rvc-damaging-no': 'Não',
			'rvc-damaging-no-title': 'Não, esta edição não é prejudicial e não deveria ser revertida.',
			'rvc-damaging-unsure': 'Não tenho certeza',
			'rvc-damaging-unsure-title': 'Não está claro se esta edição prejudica o artigo ou não.',
			'rvc-good-faith': 'De boa fé?',
			'rvc-good-faith-title': 'Parece que o autor desta edição estava tentando contribuir produtivamente?',
			'rvc-good-faith-yes': 'Sim',
			'rvc-good-faith-yes-title': 'Sim, esta edição parece ter sido feita de boa fé.',
			'rvc-good-faith-no': 'Não',
			'rvc-good-faith-no-title': 'Não, esta edição parece ter sido feita de má fé.',
			'rvc-good-faith-unsure': 'Não tenho certeza',
			'rvc-good-faith-unsure-title': 'Não está claro se esta edição foi feita de boa fé.',
			'rvc-revision-title': 'Revisão: $1',
			'rvc-submit': 'Submeter',
			'rvc-dataset-completed': 'Você completou este conjunto de dados!'
		}
	}, fields, workSet, curIdx;

	function loadConfig(){
		return [
			{
				id: 'damaging',
				class: 'revcoding.ui.RadioButtons',
				label: mw.msg( 'rvc-damaging' ),
				help: mw.msg( 'rvc-damaging-title' ),
				options: [
					{
						label: mw.msg( 'rvc-damaging-yes' ),
						tooltip: mw.msg( 'rvc-damaging-yes-title' ),
						value: 'yes'
					},
					{
						label: mw.msg( 'rvc-damaging-unsure' ),
						tooltip: mw.msg( 'rvc-damaging-unsure-title' ),
						value: 'unsure'
					},
					{
						label: mw.msg( 'rvc-damaging-no' ),
						tooltip: mw.msg( 'rvc-damaging-no-title' ),
						value: 'no'
					}
				]
			},
			{
				id: 'good-faith',
				class: 'revcoding.ui.RadioButtons',
				label: mw.msg( 'rvc-good-faith' ),
				help: mw.msg( 'rvc-good-faith-title' ),
				options: [
					{
						label: mw.msg( 'rvc-good-faith-yes' ),
						tooltip: mw.msg( 'rvc-good-faith-yes-title' ),
						value: 'yes'
					},
					{
						label: mw.msg( 'rvc-good-faith-unsure' ),
						tooltip: mw.msg( 'rvc-good-faith-unsure-title' ),
						value: 'unsure'
					},
					{
						label: mw.msg( 'rvc-good-faith-no' ),
						tooltip: mw.msg( 'rvc-good-faith-no-title' ),
						value: 'no'
					}
				]
			}
		];
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
			$( '#firstHeading' ).text( page.title );
			$( '.diff tbody' ).empty().append(
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
					0: 'yes',
					1: 'maybe',
					2: 'no'
				}[ workSet[ curIdx ].fields.damaging ],
			gfaith: {
					0: 'yes',
					1: 'maybe',
					2: 'no'
				}[ workSet[ curIdx ].fields['good-faith'] ],
			wiki: mw.config.get( 'wgDBname' ),
			comment: location.origin +
				mw.util.getUrl( 'User:' + mw.config.get( 'wgUserName' ) )
		};
		$( '#rvc-submit' ).injectSpinner( 'rvc-submit-spinner' );
		$.ajax( {
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

	function load() {
		var $ui = $( '<div>' )
				.addClass( 'rvc-ui' ),
			$submit = $( '<input id="rvc-submit" class="mw-ui-button mw-ui-constructive" type="submit">' )
				.prop( 'disabled', true )
				.val( mw.msg( 'rvc-submit' ) )
				.click( submit ),
			field, i, j, id, val, $feature, $group;
		// When moving this around, make sure that mw.messages.set is called before mw.msg
		fields = loadConfig();
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
		$ui.append( $submit );
		$( 'table.diff' )
			.first()
				.nextAll()
					.remove()
					.end()
				.before( $ui );
		curIdx = 0;
		// getRandomSet()
		getRecentChanges()
			.done( showWorkSet );
	}

	if ( mw.util.getParamValue( 'diff' ) !== null ) {
		mw.messages.set( i18n[ mw.config.get( 'wgUserLanguage' ) ] || i18n.en );
		$.when(
			$.ready,
			mw.loader.using( [
				'mediawiki.api',
				'jquery.spinner'
			] )
		).then( load );
	}

}( mediaWiki, jQuery ) );
