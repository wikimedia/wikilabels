(function(mw, WL){

  //mw.messages.set(); TODO: Set messages in a way that makes sense

  var format = function(str, args){

    return str.replace(
      /\$[0-9]+/,
      function(m){return args[parseInt(m.substring(1), 10)-1] || m;}
    );
  };

  var i18n = function(key, args){
    // TODO: use mw.msg here
    var message = WL.config.messages['en'][key];
    if(message === undefined || message === null){
      return "<" + key + ">";
    } else {
      return format(message, args);
    }
  };

  WL.i18n = i18n;

})(mediaWiki, wikiLabels);
