( function ( $, WL ) {
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
					if ( arr.hasOwnProperty( i ) ) {
						transArray.push( WL.util.applyTranslation( arr[ i ], lookup ) );
					}
				}
				return transArray;
			} else if ( typeof value === 'object' ) {
				// Going to have to recurse for each value
				obj = value;
				transObj = {};
				for ( key in obj ) {
					if ( obj.hasOwnProperty( key ) ) {
						transObj[ key ] = WL.util.applyTranslation( obj[ key ], lookup );
					}
				}
				return transObj;
			} else {
				// bool or numeric == A-OK
				return value;
			}
		},
		oneOrMany: function ( val ) {
			if ( $.isArray( val ) ) {
				return val;
			} else {
				return [ val ];
			}
		},
		linkToTitle: function ( title, label ) {
			var url = WL.mediawiki.urlToTitle( title );

			return $( '<a>' ).attr( 'href', url ).text( label || title );
		},
		linkToDiff: function ( revId, label ) {
			var url = WL.mediawiki.urlToDiff( revId );

			return $( '<a>' ).attr( 'target', '_blank' ).attr( 'href', url ).text( label || revId );
		},
		pathJoin: function ( /* path parts */ ) {
			var args = Array.prototype.slice.call( arguments );

			// Split the inputs into a list of path commands.
			var parts = [];
			for ( var i = 0, l = args.length; i < l; i++ ) {
				parts = parts.concat( String( args[ i ] ).split( '/' ) );
			}
			// Interpret the path commands to get the new resolved path.
			var newParts = [];
			for ( i = 0, l = parts.length; i < l; i++ ) {
				var part = parts[ i ];
				// Remove leading and trailing slashes
				// Also remove "." segments
				if ( !part || part === '.' ) { continue; }
				// Interpret ".." to pop the last segment
				if ( part === '..' ) { newParts.pop(); }
				// Push new path segments.
				else { newParts.push( part ); }
			}
			// Preserve the initial slash if there was one.
			if ( parts[ 0 ] === '' ) { newParts.unshift( '' ); }
			// Turn back into a single string path.
			return newParts.join( '/' ) || ( newParts.length ? '/' : '.' );
		}
	};
}( jQuery, wikiLabels ) );
