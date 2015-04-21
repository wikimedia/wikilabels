/**
 * Implements a simple event-listener system.  Agents can recieve notifications by
 * attach()ing callbacks.  Notifications can then be sent to all callbacks using
 * notify().
 * FIXME: Use https://api.jquery.com/jQuery.Callbacks/
 */
Event = function ( source ) {
	this.source = source;
	this.listeners = [];
}
Event.prototype.attach = function ( callback ) {
	this.listeners.push( callback );
}
Event.prototype.notify = function () {
	var i;
	// The following line gets the arguments passed to this function
	arguments = Array.prototype.slice.call( arguments );

	// This adds the source as the first argument of
	arguments.unshift( this.source );

	for ( i = 0; i < this.listeners.length; i++ ) {
		this.listeners[i].apply( this.source, arguments );
	}
}
