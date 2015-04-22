( function ( $, OO ) {

	var ifundef = function ( val, then ) {
		if ( val !== undefined && val !== null ) {
			return val;
		} else {
			return then;
		}
	};

	OO.ui.getFieldsValues = function ( fieldMap ) {
		var valueMap = {},
			name;
		for ( name in fieldMap ) {
			if ( fieldMap.hasOwnProperty( name ) ) {
				valueMap[ name ] = OO.ui.getWidgetValue( fieldMap[ name ] );
			}
		}
		return valueMap;
	};

	OO.ui.instantiateFromParameters = function ( config, fieldMap ) {
		var className = config[ 'class' ],
			error, widget;
		fieldMap = fieldMap || {};

		if ( typeof OO.ui[className] === 'undefined' ) {
			throw 'Unable to load OO.ui.' + className;
		}

		error = OO.ui.preprocessConfig( config, fieldMap );

		// Pass out errors
		if ( error ) {
			return error;
		}

		if ( className === 'FieldLayout' ) {
			widget = config.fieldWidget;

			delete config.fieldWidget;
			widget = new OO.ui.FieldLayout( widget, config );
		} else {
			widget = new OO.ui[className]( config );
			if ( config.name !== undefined ) {
				fieldMap[config.name] = widget;
			}
		}
		return widget;
	};

	OO.ui.preprocessConfig = function ( config, fieldMap ) {
		var newItems,
			error = false;
		fieldMap = fieldMap || {};

		if ( config.items ) {
			newItems = [];
			$.each( config.items, function ( index, item ) {
				var newItem = OO.ui.instantiateFromParameters( item, fieldMap );

				if ( newItem.$element ) {
					// A proper OOUI
					newItems.push( newItem );
				} else {
					error = newItem;
				}
			} );

			config.items = newItems;
		}

		if ( config.fieldWidget ) {
			config.fieldWidget = OO.ui.instantiateFromParameters( config.fieldWidget,
			fieldMap );
		}

		$.each( config, function ( name, value ) {
			if ( String( name ).substr( 0, 1 ) === '$' ) {
				config[name] = $( value );
			} else if ( typeof value === 'object' && $.isPlainObject( value ) ) {
				OO.ui.preprocessConfig( value, fieldMap );
			}
		} );

		if ( error ) {
			return error;
		}
	};

	OO.ui.getWidgetValue = function ( widget ) {
		switch ( widget.constructor ){
			case OO.ui.ActionWidget:
			case OO.ui.ButtonGroupWidget:
			case OO.ui.ButtonWidget:
			case OO.ui.DecoratedOptionWidget:
			case OO.ui.DropdownWidget:
			case OO.ui.IconWidget:
			case OO.ui.IndicatorWidget:
			case OO.ui.LabelWidget:
			case OO.ui.MenuOptionWidget:
			case OO.ui.MenuSelectOptionWidget:
			case OO.ui.OutlineControlsWidget:
			case OO.ui.OutlineOptionWidget:
			case OO.ui.OutlineSelectWidget:
			case OO.ui.PopupButtonWidget:
			case OO.ui.PopupWidget:
			case OO.ui.ProgressBarWidget:
			case OO.ui.RadioOptionWidget:
				return widget.getData();
			case OO.ui.ButtonOptionWidget:
			case OO.ui.CheckboxInputWidget:
				return widget.isSelected();
			case OO.ui.RadioSelectWidget:
				if ( widget.getSelectedItem() ) {
					return ifundef(
                        widget.getSelectedItem().getData(),
						widget.getSelectedItem().getValue()
                    );
				} else {
					return null;
				}
				break;
			case OO.ui.ButtonInputWidget:
			case OO.ui.DropdownInputWidget:
			case OO.ui.RadioInputWidget:
				return ifundef( widget.getData(), widget.getValue() );
			case OO.ui.MenuSelectWidget:
			case OO.ui.ButtonSelectWidget:
				if ( widget.getSelectedItem() ) {
					return widget.getSelectedItem().getData();
				} else {
					return null;
				}
				break;
			case OO.ui.ComboboxInputWidget:
				if ( widget.getMenu().getSelectedItem() ) {
					return widget.getMenu().getSelectedItem().getData();
				} else {
					return null;
				}
				break;
			case OO.ui.SearchWidget:
				return widget.getQuery().getValue();
			case OO.ui.TextInputWidget:
			case OO.ui.ToggleButtonWidget:
			case OO.ui.ToggleSwitchWidget:
				return widget.getValue();
		}
	};

} )( jQuery, OO );
