(function(mw, WL){

  mw.messages.set(); // TODO: Set messages in a way that makes sense

  var i18n = function(key){
    // TODO: use mw.msg here
    return WL.config.messages['en'][key];
  };

  WL.i18n = i18n;

})(mediaWiki, wikiLabels);
