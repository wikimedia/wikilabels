(function(mw, WL){

  mw.messages.set(); // TODO: Set messages in a way that makes sense

  var i18n = function(key){
    // TODO: use mw.msg here
    var message = WL.config.messages['en'][key];
    if(message === undefined || message === null){
      return "<" + key + ">";
    } else {
      return message;
    }
  };

  WL.i18n = i18n;

})(mediaWiki, wikiLabels);
