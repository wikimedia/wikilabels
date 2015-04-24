(function(mw, WL){
  var messages = {
    en: {
      'Review': 'Review',
      'Workset': 'Workset',
      'Submit': 'Submit',
      'workset': 'workset',
      'workset-completed': 'You have completed this workset!'
    },
    pt: {

    },
    tr: {

    },
    az: {

    },
    fa: {

    }
  };

  mw.messages.set(); // TODO: Set messages in a way that makes sense

  var i18n = function(key){
    // TODO: use mw.msg here
    return messages['en'][key];
  };

  WL.i18n = i18n;

})(mediaWiki, wikiLabels);
