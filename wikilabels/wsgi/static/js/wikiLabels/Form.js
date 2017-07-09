( function ( $, OO, WL ) {

	var Form = function ( fieldset, fieldMap ) {
		this.fieldMap = fieldMap;

		this.$element = $( '<div>' ).addClass( WL.config.prefix + 'form' );
		this.$fieldset = $( '<div>' ).addClass( 'fieldset' );
		this.$element.append( this.$fieldset );
		this.$fieldset.append( fieldset.$element );

		this.$controls = $( '<div>' ).addClass( 'controls' );
		this.$element.append( this.$controls );

		var licenseDir = $( 'html' ).attr( 'dir' ) === 'ltr' ? 'right' : 'left';
		this.$element.append( '<div id="license" align=' + licenseDir + '><small>' + WL.i18n( 'License' ) + '</small></div>' );
		this.abandonButton = new OO.ui.ButtonWidget( {
			label: WL.i18n( 'Abandon' ),
			align: 'inline',
			classes: [ 'abandon' ],
			flags: [ 'primary', 'destructive' ]
		} );
		this.$controls.append( this.abandonButton.$element );
		this.abandonButton.on( 'click', this.handleAbandonClick.bind( this, this.abandonButton.$element ) );

		this.abandoned = $.Callbacks();

		this.submitButton = new OO.ui.ButtonWidget( {
			label: WL.i18n( 'Save' ),
			align: 'inline',
			classes: [ 'save' ],
			flags: [ 'primary', 'progressive' ]
		} );
		this.$controls.append( this.submitButton.$element );
		this.submitButton.on( 'click', this.handleSubmitClick.bind( this, this.submitButton.$element ) );

		this.submitted = $.Callbacks();
	};
	Form.prototype.handleSubmitClick = function ( button ) {
		$( button ).injectSpinner( WL.config.prefix + 'submit-spinner' );
		this.submit();
	};
	Form.prototype.handleAbandonClick = function ( button ) {
		var confirmed = confirm( WL.i18n( 'Are you sure that you want to abandon this task?' ) );
		if ( !confirmed ) {
			return;
		}
		$( button ).injectSpinner( WL.config.prefix + 'abandon-spinner' );
		this.abandon();
	};
	Form.prototype.getValues = function () {
		var name, valueMap = {};
		for ( name in this.fieldMap ) {
			if ( this.fieldMap.hasOwnProperty( name ) ) {
				valueMap[ name ] = OO.ui.getWidgetValue( this.fieldMap[ name ] );
			}
		}
		return valueMap;
	};
	Form.prototype.setValues = function ( valueMap ) {
		var name;
		valueMap = valueMap || {};
		for ( name in this.fieldMap ) {
			if ( this.fieldMap.hasOwnProperty( name ) ) {
				 OO.ui.setWidgetValue( this.fieldMap[ name ], valueMap[ name ] );
			}
		}
		return valueMap;
	};
	Form.prototype.clear = function () {
		this.setValues( null );
	};
	Form.prototype.hide = function () {
		this.$element.hide();
	};
	Form.prototype.show = function () {
		this.$element.show();
	};
	Form.prototype.submit = function () {
		var fieldName,
		    labelData = this.getValues();

		// TODO: This is hacky.  Constraints should be specified in the form config
		for ( fieldName in labelData ) {
			if ( labelData.hasOwnProperty( fieldName ) && labelData[ fieldName ] === null ) {
				if ( !confirm( WL.i18n( '\'$1\' not completed. Submit anyway?', [ fieldName ] ) ) ) {
					return;
				}
			}
		}

		this.submitted.fire( labelData );
	};
	Form.prototype.abandon = function () {
		this.abandoned.fire();
	};
	Form.fromConfig = function ( config, langChain ) {
		var i, fieldset, fieldDoc, field, fieldMap,
		    i18n = new WL.I18N( config.i18n, WL.util.oneOrMany( langChain ) );

		// Create a new fieldset & load the translated fields
		fieldset = new OO.ui.FieldsetLayout( {
			// label: WL.util.applyTranslation( config.title, i18n )
		} );
		fieldMap = {};
		for ( i in config.fields ) {
			if ( config.fields.hasOwnProperty( i ) ) {
				fieldDoc = WL.util.applyTranslation(
					config.fields[ i ], i18n.get.bind( i18n ) );
				field = OO.ui.instantiateFromParameters( fieldDoc, fieldMap );
				fieldset.addItems( [ field ] );
			}
		}
		return new Form( fieldset, fieldMap );
	};

	WL.Form = Form;
}( jQuery, OO, wikiLabels ) );
