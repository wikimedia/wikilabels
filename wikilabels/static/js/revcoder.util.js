( function ($, revcoder) {
	revcoder.applyTranslation = function ( value, lookup ) {
		var str, arr, transArray, i, obj, transObj, key;
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
				if ( arr.hasOwnProperty(i) ) {
					transArray.push( revcoder.applyTranslation( arr[i], lookup ) );
				}
			}
			return transArray;
		} else if ( typeof value === 'object' ) {
			// Going to have to recurse for each value
			obj = value;
			transObj = {};
			for ( key in obj ) {
				if ( obj.hasOwnProperty( key ) ) {
					transObj[ key ] = revcoder.applyTranslation( obj[key], lookup );
				}
			}
			return transObj;
		} else {
			// bool or numeric == A-OK
			return value;
		}
	};
})(jQuery, revcoder);
