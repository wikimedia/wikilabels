( function ( $, OO ) {

	var ifundef = function ( val, then ) {
		if ( val !== undefined && val !== null ) {
			return val;
		} else {
			return then;
		}
	};

	OO.ui.instantiateFromParameters = function ( config, fieldMap ) {
		var className = config.class,
			error, widget;
		fieldMap = fieldMap || {};

		if ( typeof OO.ui[ className ] === 'undefined' ) {
			throw Error( 'Unable to load OO.ui.' + className );
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
		} else if ( className === 'HtmlSnippet' ) {
			widget = new OO.ui.HtmlSnippet( config.content );
		} else {
			widget = new OO.ui[ className ]( config );
			if ( config.name !== undefined ) {
				fieldMap[ config.name ] = widget;
			}
		}
		return widget;
	};

	OO.ui.preprocessConfig = function ( config, fieldMap ) {
		var newItems,
			error = false;
		fieldMap = fieldMap || {};

		if ( config.help && config.help.class ) {
			config.help = OO.ui.instantiateFromParameters( config.help, fieldMap );
		}
		if ( config.label && config.label.class ) {
			config.label = OO.ui.instantiateFromParameters( config.label, fieldMap );
		}
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
				config[ name ] = $( value );
			} else if ( typeof value === 'object' && $.isPlainObject( value ) ) {
				OO.ui.preprocessConfig( value, fieldMap );
			}
		} );

		if ( error ) {
			return error;
		}
	};

	OO.ui.getWidgetValue = function ( widget ) {
		switch ( widget.constructor ) {
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
					return widget.getSelectedItem().getData();
				} else {
					return null;
				}
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
			case OO.ui.ComboboxInputWidget:
				if ( widget.getMenu().getSelectedItem() ) {
					return widget.getMenu().getSelectedItem().getData();
				} else {
					return null;
				}
			case OO.ui.SearchWidget:
				return widget.getQuery().getValue();
			case OO.ui.TextInputWidget:
			case OO.ui.ToggleButtonWidget:
			case OO.ui.ToggleSwitchWidget:
				return widget.getValue();
			default:
				if ( widget.getData ) {
					return widget.getValue();
				} else {
					return null;
				}
		}
	};

	OO.ui.setWidgetValue = function ( widget, value ) {
		switch ( widget.constructor ) {
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
				widget.setData( value );
				break;
			case OO.ui.ButtonOptionWidget:
			case OO.ui.CheckboxInputWidget:
				widget.setSelected( value );
				break;
			case OO.ui.RadioSelectWidget:
				widget.selectItem( widget.getItemFromData( value ) );
				break;
			case OO.ui.ButtonInputWidget:
			case OO.ui.DropdownInputWidget:
			case OO.ui.RadioInputWidget:
				widget.setData( value );
				break;
			case OO.ui.MenuSelectWidget:
			case OO.ui.ButtonSelectWidget:
				widget.selectItem( widget.getItemFromData( value ) );
				break;
			case OO.ui.ComboboxInputWidget:
				widget.getMenu().selectItem( widget.getMenu().getItemFromData( value ) );
				break;
			case OO.ui.SearchWidget:
				widget.getQuery().setValue( value );
				break;
			case OO.ui.TextInputWidget:
			case OO.ui.ToggleButtonWidget:
			case OO.ui.ToggleSwitchWidget:
				widget.setValue( ifundef( value, '' ) );
				break;
			default:
				if ( widget.setValue ) {
					return widget.setValue( value );
				} else {
					return null;
				}
		}
	};

}( jQuery, OO ) );
