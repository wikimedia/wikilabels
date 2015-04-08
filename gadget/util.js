
function applyTranslation( value, lookup ) {
	var i, l, transArray, obj, transObj, key, str;
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
		arr = value;
		transArray = [];
		for ( i in arr ) {
			if ( arr.hasOwnProperty( i ) ) {
				transArray.push( applyTranslation( arr[i], lookup ) );
			}
		}
		return transArray;
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

OO.ui.instantiateFromParameters = function( config ) {
	var className = config['class'];

	if ( typeof OO.ui[className] === 'undefined' ) {
		throw "Unable to load OO.ui." + className;
	}

	error = OO.ui.preprocessConfig( config );

	// Pass out errors
	if ( error ) {
		return error;
	}

	if ( className === 'FieldLayout' ) {
		var widget = config.fieldWidget

		delete config['fieldWidget']
		return new OO.ui.FieldLayout( widget, config );
	} else {
		return new OO.ui[className]( config );
	}
}

OO.ui.preprocessConfig = function( config ) {
	var error = false,
		newItems = [];

	if ( config.items ) {
		newItems = [];
		$.each( config.items, function( index, item ) {
			var newItem = OO.ui.instantiateFromParameters( item );

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
		config.fieldWidget = OO.ui.instantiateFromParameters( config.fieldWidget );
	}

	$.each( config, function( name, value ) {
		if ( String(name).substr( 0, 1 ) === '$' ) {
			config[name] = $( value );
		} else if ( typeof value === 'object' && $.isPlainObject( value ) ) {
			OO.ui.preprocessConfig( value );
		}
	} );

	if ( error ) {
		return error;
	}
}
