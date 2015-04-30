( function (mw, $, WL) {
	WL.util = {
		applyTranslation: function ( value, lookup ) {
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
						transArray.push( WL.util.applyTranslation( arr[i], lookup ) );
					}
				}
				return transArray;
			} else if ( typeof value === 'object' ) {
				// Going to have to recurse for each value
				obj = value;
				transObj = {};
				for ( key in obj ) {
					if ( obj.hasOwnProperty( key ) ) {
						transObj[ key ] = WL.util.applyTranslation( obj[key], lookup );
					}
				}
				return transObj;
			} else {
				// bool or numeric == A-OK
				return value;
			}
		},
		oneOrMany: function (val) {
			if ($.isArray(val)) {
				return val;
			} else {
				return [val];
			}
		},
		linkToTitle: function(title, label){
			var url = mw.config.get('wgServer') +
			          mw.config.get('wgArticlePath').replace("$1", title);

			return $("<a>").attr('href', url).text(label || title);
		},
		linkToDiff: function(revId, label){
			var url = mw.config.get('wgServer') +
			          mw.config.get('wgArticlePath').replace("$1", "?diff=" + revId);

			return $("<a>").attr('href', url).text(label || revId);
		}
	};
})(mediaWiki, jQuery, wikiLabels);
