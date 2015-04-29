( function ( $, OO, WL ) {

	var Form = function ( fieldset, fieldMap ) {
		this.fieldMap = fieldMap;

		this.$element = $( '<div>' ).addClass( WL.config.prefix + 'form' );

		this.$fieldset = $('<div>').addClass( 'fieldset' );
		this.$element.append(this.$fieldset);
		this.$fieldset.append( fieldset.$element );

		this.$controls = $( '<div>' ).addClass( 'controls' );
		this.$element.append( this.$controls );

		this.submitLabel = new OO.ui.ButtonWidget( {
			label: WL.i18n('Submit label'),
			align: 'inline',
			flags: [ 'primary', 'constructive' ]
		} );
		this.submitLabel.on( 'click', this.handleSubmitLabelClick.bind( this ) );
		this.$controls.append( this.submitLabel.$element );

		this.submitted = $.Callbacks();
	};
	Form.prototype.handleSubmitLabelClick = function () {
		this.submitted.fire();
	};
	Form.prototype.getValues = function () {
		var name, valueMap = {};
		for ( name in this.fieldMap ) {
			if ( this.fieldMap.hasOwnProperty( name ) ) {
				valueMap[name] = OO.ui.getWidgetValue( this.fieldMap[name] );
			}
		}
		return valueMap;
	};
	Form.prototype.setValues = function(valueMap) {
		var name;
		for ( name in this.fieldMap ) {
			if ( this.fieldMap.hasOwnProperty( name ) ) {
				 OO.ui.setWidgetValue( this.fieldMap[name], valueMap[name] );
			}
		}
		return valueMap;
	};
	Form.fromConfig = function ( config, lang ) {
		var i, fieldset, fieldDoc, field, fieldMap,
			i18n = function ( key ) {
				var message;
				try {
					message = config.i18n[lang][key];
					if ( message === undefined ) {
						return '<' + key + '>';
					} else {
						return message;
					}
				} catch ( err ) {
					return '<' + key + '>';
				}
			};

		// Create a new fieldset & load the translated fields
		fieldset = new OO.ui.FieldsetLayout( {
			label: WL.util.applyTranslation( config.title, i18n )
		} );
		fieldMap = {};
		for ( i in config.fields ) {
			if ( config.fields.hasOwnProperty( i ) ) {
				fieldDoc = WL.util.applyTranslation( config.fields[i], i18n );
				field = OO.ui.instantiateFromParameters( fieldDoc, fieldMap );
				fieldset.addItems( [ field ] );
			}
		}

		return new Form( fieldset, fieldMap );
	};

	WL.Form = Form;
} )( jQuery, OO, wikiLabels );
