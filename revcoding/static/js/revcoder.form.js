( function ($, OO, revcoder) {

  var Form = function(fieldset, fieldMap){
    this.fieldMap = fieldMap;

    this.$element = $("<div>").addClass("revcoder-form");
    this.$element.append(fieldset.$element);
  };
  Form.prototype.getValues = function(){
		var valueMap = {};
		for ( var name in this.fieldMap ) {
			if ( this.fieldMap.hasOwnProperty(name) ) {
				valueMap[name] = OO.ui.getWidgetValue(this.fieldMap[name]);
			}
		}
		return valueMap;
  };
  Form.fromConfig = function(config, lang){
    var i18n = function(key){
      try{
        var message = config.i18n[lang][key];
        if(message === undefined){
          return "<" + key + ">";
        }else{
          return message
        }
      }catch(err){
        return "<" + key + ">";
      }
    };

		// Create a new fieldset & load the translated fields
		var fieldset = new OO.ui.FieldsetLayout( {
			label: revcoder.applyTranslation(config.title, i18n)
		} );
		var fieldMap = {};
		for (var i in config.fields) {
			if ( config.fields.hasOwnProperty(i) ) {
				var fieldDoc = revcoder.applyTranslation(config.fields[i], i18n);
				var field = OO.ui.instantiateFromParameters(fieldDoc, fieldMap);
				fieldset.addItems([field]);
			}
		}

    return new Form(fieldset, fieldMap);
  };


  revcoder.Form = Form;
})(jQuery, OO, revcoder);
