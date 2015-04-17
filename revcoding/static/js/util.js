
function applyTranslation( value, lookup ) {
	var i, l, transArray, obj, transObj, key, str;
	if ( typeof value === 'string' ) {
		// If a string, look to see if we need to translate it.
		var str = value;
		if ( str.charAt( 0 ) === '<' && str.charAt( str.length - 1 ) === '>' ) {
			// Lookup translation
			return lookup( str.substr( 1, str.length - 2 ) );
		} else {
			// No translation necessary
			return str;
		}
	} else if ( $.isArray( value ) ) {
		// Going to have to recurse for each item
		var arr = value;
		var transArray = [];
		for (var i in arr ) {
			if ( arr.hasOwnProperty(i) ){
				transArray.push( applyTranslation( arr[i], lookup ) );
			}
		}
		return transArray;
	} else if ( typeof value === 'object' ) {
		// Going to have to recurse for each value
		var obj = value;
		var transObj = {};
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

ifundef = function(val, then){
	if(val !== undefined && val !== null){
		return val
	}else{
		return then
	}
}

OO.ui.instantiateFromParameters = function( config, fieldMap ) {
	fieldMap = fieldMap || {}
	var className = config['class'];

	if ( typeof OO.ui[className] === 'undefined' ) {
		throw "Unable to load OO.ui." + className;
	}

	error = OO.ui.preprocessConfig( config, fieldMap );

	// Pass out errors
	if ( error ) {
		return error;
	}

	var widget
	if ( className === 'FieldLayout' ) {
		widget = config.fieldWidget

		delete config['fieldWidget']
		return new OO.ui.FieldLayout( widget, config );
	} else {
		widget = new OO.ui[className]( config );
		if( config.name !== undefined) {
			fieldMap[config.name] = widget
		}
		return widget
	}


}

OO.ui.preprocessConfig = function( config, fieldMap ) {
	fieldMap = fieldMap || {}
	var error = false,
		newItems = [];

	if ( config.items ) {
		newItems = [];
		$.each( config.items, function( index, item ) {
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

	$.each( config, function( name, value ) {
		if ( String(name).substr( 0, 1 ) === '$' ) {
			config[name] = $( value );
		} else if ( typeof value === 'object' && $.isPlainObject( value ) ) {
			OO.ui.preprocessConfig( value, fieldMap );
		}
	} );

	if ( error ) {
		return error;
	}
}

/*
OO.ui.getFormData = function(element, cache){
	var cache = cache || {}
	switch(element.constructor){
		case OO.ui.FormLayout:
		case OO.ui.Fieldset:
			var items = element.getItems()
			for(var i in items){
				cache = OO.ui.getFormData(items[i], cache)
			}
			break
		case OO.ui.FieldLayout:
			cache = OO.ui.getFormData(element.getField(), cache)
			break
		case OO.ui.Widget:
			cache = OO.ui.getWidgetValue(element, cache)
			break
	}
	return cache
}
*/

OO.ui.getWidgetValue = function(widget){
	switch(widget.constructor){
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
			return widget.getData()
			break
		case OO.ui.ButtonOptionWidget:
		case OO.ui.CheckboxInputWidget:
			return widget.isSelected()
			break
		case OO.ui.RadioSelectWidget:
			if( widget.getSelectedItem() ){
				return ifundef(widget.getSelectedItem().getData(),
				               widget.getSelectedItem().getValue())
			}else{
				return null
			}
			break
		case OO.ui.ButtonInputWidget:
		case OO.ui.DropdownInputWidget:
		case OO.ui.RadioInputWidget:
			return ifundef( widget.getData(), widget.getValue() )
			break
		case OO.ui.MenuSelectWidget:
		case OO.ui.ButtonSelectWidget:
			if( widget.getSelectedItem() ){
				return widget.getSelectedItem().getData()
			}else{
				return null
			}
		case OO.ui.ComboboxInputWidget:
			if( widget.getMenu().getSelectedItem() ){
				return widget.getMenu().getSelectedItem().getData()
			}else{
				return null
			}
			break
		case OO.ui.SearchWidget:
			return widget.getQuery().getValue()
			break
		case OO.ui.TextInputWidget:
		case OO.ui.ToggleButtonWidget:
		case OO.ui.ToggleSwitchWidget:
			return widget.getValue()
			break
	}
}

OO.ui.getFieldsValues = function( fieldMap ){
	var valueMap = {}
	for(var name in fieldMap){
		if( fieldMap.hasOwnProperty(name) ){
			valueMap[name] = OO.ui.getWidgetValue(fieldMap[name])
		}
	}
	return valueMap
}
