/**
Implements a simple event-listener system.  Agents can recieve notifications by
attach()ing callbacks.  Notifcations can then be sent to all callbacks using
notify().
*/
Event = function(source){
		this.source = source
		this.listeners = []
}
Event.prototype.attach = function(callback){
		this.listeners.push(callback)
}
Event.prototype.notify = function(){
  // The following line gets the arguments passed to this function
  arguments = Array.prototype.slice.call(arguments)

  // This adds the source as the first argument of
  arguments.unshift(this.source)

  for(var i in this.listeners){
    if( this.listeners.hasOwnProperty(i) ){
      this.listeners[i].apply(this.source, arguments)
    }
  }
}
