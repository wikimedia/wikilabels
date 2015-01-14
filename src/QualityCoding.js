/**
 * Interface for evaluating the quality of revisions
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
			'qc-work-set': 'Work set:',
			'qc-damaging': 'Damaging?',
			'qc-damaging-title': 'Did this edit cause damage to the article?',
			'qc-damaging-yes': 'Yes',
			'qc-damaging-yes-title': 'Yes, this edit is damaging and should be reverted.',
			'qc-damaging-no': 'No',
			'qc-damaging-no-title': 'No, this edit is not damaging and should not be reverted.',
			'qc-damaging-unsure': 'Unsure',
			'qc-damaging-unsure-title': 'It\'s not clear whether this edit damages the article or not.',
			'qc-good-faith': 'Good faith?',
			'qc-good-faith-title': 'Does it appear as though the author of this edit was trying to contribute productively?',
			'qc-good-faith-yes': 'Yes',
			'qc-good-faith-yes-title': 'Yes, this edit appears to have been made in good-faith.',
			'qc-good-faith-no': 'No',
			'qc-good-faith-no-title': 'No, this edit appears to have been made in bad-faith.',
			'qc-good-faith-unsure': 'Unsure',
			'qc-good-faith-unsure-title': 'It\'s not clear whether or not this edit was made in good-faith.',
			'qc-revision-title': 'Revision: $1',
			'qc-submit': 'Submit',
			'qc-dataset-completed': 'You completed this dataset!'
		},
		pt: {
			'qc-work-set': 'Conjunto de trabalho:',
			'qc-damaging': 'Prejudicial?',
			'qc-damaging-title': 'Esta edição prejudicou o artigo?',
			'qc-damaging-yes': 'Sim',
			'qc-damaging-yes-title': 'Sim, esta edição é prejudicial e deveria ser revertida.',
			'qc-damaging-no': 'Não',
			'qc-damaging-no-title': 'Não, esta edição não é prejudicial e não deveria ser revertida.',
			'qc-damaging-unsure': 'Não tenho certeza',
			'qc-damaging-unsure-title': 'Não está claro se esta edição prejudica o artigo ou não.',
			'qc-good-faith': 'De boa fé?',
			'qc-good-faith-title': 'Parece que o autor desta edição estava tentando contribuir produtivamente?',
			'qc-good-faith-yes': 'Sim',
			'qc-good-faith-yes-title': 'Sim, esta edição parece ter sido feita de boa fé.',
			'qc-good-faith-no': 'Não',
			'qc-good-faith-no-title': 'Não, esta edição parece ter sido feita de má fé.',
			'qc-good-faith-unsure': 'Não tenho certeza',
			'qc-good-faith-unsure-title': 'Não está claro se esta edição foi feita de boa fé.',
			'qc-revision-title': 'Revisão: $1\nPrejudicial? $2\nDe boa fé? $3',
			'qc-submit': 'Submeter',
			'qc-dataset-completed': 'Você completou este conjunto de dados!'
		}
	}, fields, workSet, curIdx;

	function toggleSelection( e ) {
		var $target = $( e.target ),
			wasSelected = $target.hasClass( 'qc-selected' );
		$target
			.parent()
				.find( '.qc-selected' )
					.removeClass( 'qc-selected' )
					.end()
				.end();
		if ( !wasSelected ) {
			$target.addClass( 'qc-selected' );
		}
		// The user must select one value for each field
		$( '#qc-submit' ).prop(
			'disabled',
			 $( '.mw-ui-button.qc-selected' ).length !== fields.length
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
				id: Math.floor( Math.random() * 1000000 ),
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
					id: changes[i].revid,
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
			$bar = $( '.qc-progress' ).empty();
		workSet = ws || workSet;
		for ( i = 0; i < workSet.length; i++ ) {
			$icon = $( '<div>' );
			tooltip = mw.msg( 'qc-revision-title', workSet[i].id );
			for ( j = 0; j < fields.length; j++ ) {
				field = fields[j].id;
				idx = workSet[i].fields[ field ];
				value = fields[j].options[ idx ] && fields[j].options[ idx ].value;
				tooltip += '\n' + fields[j].label + ' ' + value;
				className = 'qc-' + field + '-' + value;
				$icon.append( $( '<div>' ).addClass( className ) );
			}
			$icon.attr(
				'title',
				tooltip
			);
			$bar.append( $icon );
		}
		$bar.find( '> div' ).eq( curIdx ).addClass( 'qc-selected' );
		$( '.qc-progress > div' ).css( 'width', ( 100 / workSet.length ) + '%' );
	}

	function loadConfig(){
		return [
			{
				id: 'damaging',
				class: 'revcoding.ui.RadioButtons',
				label: mw.msg( 'qc-damaging' ),
				help: mw.msg( 'qc-damaging-title' ),
				options: [
					{
						label: mw.msg( 'qc-damaging-yes' ),
						tooltip: mw.msg( 'qc-damaging-yes-title' ),
						value: 'yes'
					},
					{
						label: mw.msg( 'qc-damaging-unsure' ),
						tooltip: mw.msg( 'qc-damaging-unsure-title' ),
						value: 'unsure'
					},
					{
						label: mw.msg( 'qc-damaging-no' ),
						tooltip: mw.msg( 'qc-damaging-no-title' ),
						value: 'no'
					}
				]
			},
			{
				id: 'good-faith',
				class: 'revcoding.ui.RadioButtons',
				label: mw.msg( 'qc-good-faith' ),
				help: mw.msg( 'qc-good-faith-title' ),
				options: [
					{
						label: mw.msg( 'qc-good-faith-yes' ),
						tooltip: mw.msg( 'qc-good-faith-yes-title' ),
						value: 'yes'
					},
					{
						label: mw.msg( 'qc-good-faith-unsure' ),
						tooltip: mw.msg( 'qc-good-faith-unsure-title' ),
						value: 'unsure'
					},
					{
						label: mw.msg( 'qc-good-faith-no' ),
						tooltip: mw.msg( 'qc-good-faith-no-title' ),
						value: 'no'
					}
				]
			}
		];
	}

	function submit(){
		$( '.mw-ui-button.qc-selected' ).each( function(){
			var $this = $( this ),
				idxValue = $this.data( 'qc-value' ),
				field = $this.parent().data( 'qc-field' );
			if( field !== undefined && idxValue !== undefined ){
				workSet[ curIdx ].fields[ field ] = idxValue;
			}
		} );
		curIdx++;
		showWorkSet();
		if( curIdx >= workSet.length ){
			alert( mw.msg( 'qc-dataset-completed' ) );
			$( '#qc-submit' ).prop( 'disabled', true );
		} else {
			$( '.diff' ).replaceWith(
				$( '<p class="diff">' ).text( 'TODO: Get/show the diff for revision ' + workSet[ curIdx ].id + '.' )
			);
		}
	}

	function load() {
		var $ui = $( '<div>' )
				.addClass( 'qc-ui' ),
			$submit = $( '<input id="qc-submit" class="mw-ui-button mw-ui-constructive" type="submit">' )
				.prop( 'disabled', true )
				.val( mw.msg( 'qc-submit' ) )
				.click( submit ),
			field, i, j, id, val, $feature, $group;
		// When moving this around, make sure that mw.messages.set is called before mw.msg
		fields = loadConfig();
		$ui.append(
			$( '<div>' )
				.text( mw.msg( 'qc-work-set' ) ),
			$( '<div>' )
				.addClass( 'qc-progress' )
		);
		for ( i = 0; i < fields.length; i++ ) {
			field = fields[i];
			id = field.id;
			$group = $( '<div>' )
				.data( 'qc-field', id )
				// .addClass( 'mw-ui-radio');
				.addClass( 'mw-ui-button-group');
			for ( j = 0; j < field.options.length; j++ ) {
				val = field.options[j].value;
				$group.append(
					$( '<div>' )
						.addClass( 'mw-ui-button')
						.attr( 'id', 'qc-' + field.id + '-' + val )
						.attr( 'title', field.options[j].tooltip )
						.text( field.options[j].label )
						.data( 'qc-value', j )
						.click( toggleSelection )
// 					$( '<input type="radio">' )
// 						.attr( 'name', 'qc-' + field.id )
// 						.attr( 'id', 'qc-' + field.id + '-' + val )
// 						.attr( 'title', field.options[j].tooltip ),
// 					$( '<label for="">' )
// 						.text( field.options[j].label )
// 						.attr( 'for', 'qc-' + field.id + '-' + val )
// 						.data( 'qc-value', j )
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
		$( 'table.diff' ).first().before( $ui );
		curIdx = 0;
		// getRandomSet()
		getRecentChanges()
			.done( showWorkSet );
	}

	if ( mw.util.getParamValue( 'diff' ) !== null ) {
		mw.messages.set( i18n[ mw.config.get( 'wgUserLanguage' ) ] || i18n.en );
		$( load );
	}

}( mediaWiki, jQuery ) );
