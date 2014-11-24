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
			'qc-icon-title': 'Revision: $1\nDamaging? $2\nGood-faith? $3',
			'qc-submit': 'Submit',
			'qc-not-implemented': 'This feature is not implemented yet.'
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
			'qc-icon-title': 'Revisão: $1\nPrejudicial? $2\nDe boa fé? $3',
			'qc-submit': 'Submeter',
			'qc-not-implemented': 'Este recurso ainda não está implementado.'
		}
	};
	function notImplemented() {
		alert( 'Not implemented yet!' );
	}
	// FIXME: Remove this by something real
	function getRandomSet( size, done ) {
		var i, rev, list = [];
		size = size || 100;
		done = done || 70;
		for ( i = 0; i < size; i++ ) {
			rev = { id: Math.floor( Math.random() * 1000000 ) };
			if ( i <= done ) {
				// TODO:
				// * Should an 'undefined' value mean 'unknown'?
				//   In that case, this can continue being a boolean
				// * Or one should explicitly set a value (e.g. 0) to mean 'unknown'?
				//   Then use -1, 0 and 1 as possible values.
				rev.damaging = Math.floor( Math.random() * 2 ) === 1;
				rev.goodFaith = Math.floor( Math.random() * 2 ) === 1;
				// Assume good faith (if the edit is good)
				rev.goodFaith = rev.goodFaith || !rev.damaging;
			}
			list.push( rev );
		}
		return list;
	}
	function addRandomExamples() {
		var i, isDamaging, isGoodFaith, $icon,
			$bar = $( '.qc-progress' ),
			randomSet = getRandomSet();
		for ( i = 0; i < randomSet.length; i++ ) {
			$icon = $( '<div>' );
			isDamaging = randomSet[i].damaging;
			isGoodFaith = randomSet[i].goodFaith;
			if ( isDamaging === undefined ) {
				$icon.addClass( 'qc-damaging-unsure' );
			} else {
				$icon.toggleClass( 'qc-damaging', isDamaging );
			}
			if ( isGoodFaith === undefined ) {
				$icon.addClass( 'qc-good-faith-unsure' );
			} else {
				$icon.toggleClass( 'qc-good-faith', isGoodFaith );
			}
			$icon.attr(
				'title',
				mw.msg(
					'qc-icon-title',
					randomSet[i].id,
					( isDamaging ? mw.msg( 'qc-damaging-yes' ) : mw.msg( 'qc-damaging-no' ) ),
					( isGoodFaith ? mw.msg( 'qc-good-faith-yes' ) : mw.msg( 'qc-good-faith-no' ) )
				)
			);
			$bar.append( $icon );
		}
		$( '.qc-progress div' ).css( 'width', ( 100 / randomSet.length ) + '%' );
	}

	function load() {
		var $ui = $( '<div>' )
				.addClass( 'qc-ui' ),
			$bar = $( '<div>' )
				.addClass( 'qc-progress' ),
			$damaging = $( '<div>' )
				.attr( 'title', mw.msg( 'qc-damaging-title' ) )
				.append(
					$( '<div>' )
						.text( mw.msg( 'qc-damaging' ) ),
					$( '<div>' )
						.addClass( 'mw-ui-button-group')
						.append(
							$( '<div>' )
								.addClass( 'mw-ui-button')
								.attr( 'title', mw.msg( 'qc-damaging-yes-title' ) )
								.text( mw.msg( 'qc-damaging-yes' ) )
								.click( notImplemented ),
							$( '<div>' )
								.addClass( 'mw-ui-button')
								.attr( 'title', mw.msg( 'qc-damaging-no-title' ) )
								.text( mw.msg( 'qc-damaging-no' ) )
								.click( notImplemented ),
							$( '<div>' )
								.addClass( 'mw-ui-button')
								.attr( 'title', mw.msg( 'qc-damaging-unsure-title' ) )
								.text( mw.msg( 'qc-damaging-unsure' ) )
								.click( notImplemented )
						)
				),
			$goodFaith = $( '<div>' )
				.attr( 'title', mw.msg( 'qc-good-faith-title' ) )
				.append(
					$( '<div>' )
						.text( mw.msg( 'qc-good-faith' ) ),
					$( '<div>' )
						.addClass( 'mw-ui-button-group')
						.append(
							$( '<div>' )
								.addClass( 'mw-ui-button')
								.attr( 'title', mw.msg( 'qc-good-faith-yes-title' ) )
								.text( mw.msg( 'qc-good-faith-yes' ) )
								.click( notImplemented ),
							$( '<div>' )
								.addClass( 'mw-ui-button')
								.attr( 'title', mw.msg( 'qc-good-faith-no-title' ) )
								.text( mw.msg( 'qc-good-faith-no' ) )
								.click( notImplemented ),
							$( '<div>' )
								.addClass( 'mw-ui-button')
								.attr( 'title', mw.msg( 'qc-good-faith-unsure-title' ) )
								.text( mw.msg( 'qc-good-faith-unsure' ) )
								.click( notImplemented )
						)
				),
			$submit = $( '<input class="mw-ui-button mw-ui-constructive" type="submit">' )
				.val( mw.msg( 'qc-submit' ) )
				.click( notImplemented );
		$ui.append(
			$( '<div>' )
				.text( mw.msg( 'qc-work-set' ) ),
			$bar,
			$damaging,
			'<div style="clear:both"></div>',
			$goodFaith,
			'<div style="clear:both"></div>',
			$submit
		);
		$( 'table.diff' ).first().before( $ui );
		addRandomExamples();
	}

	if ( mw.util.getParamValue( 'diff' ) !== null ) {
		mw.messages.set( i18n[ mw.config.get( 'wgUserLanguage' ) ] || i18n.en );
		$( load );
	}

}( mediaWiki, jQuery ) );
