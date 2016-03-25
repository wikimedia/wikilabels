(function($, OO){

  var html2text = function(html){
    return $("<div>").html(html).text();
  };

  var Workspace = function(opts){
    this.emptyMessage = opts.emptyMessage || "";
    this.$element = $("<div>").addClass("workspace");
    this.empty(true);
  };
  Workspace.prototype.empty = function(setEmpty){
    if( setEmpty === undefined ){
      return this.$element.hasClass('empty');
    }else{
      if( setEmpty ){
        this.$element.addClass('empty');
        this.$element.html(this.emptyMessage);
        this.items = {};
      }else{
        this.$element.removeClass('empty');
        this.$element.html("");
      }
    }

  };
  Workspace.prototype.add = function(name, $subElement){
    if( this.empty() ){
      this.empty(false);
    }
    this.$element.append($subElement);
    this.items[name] = $subElement;
  };
  Workspace.prototype.remove = function(name){
    var $subElement = this.items[name];
    if( !$subElement ){
      console.log("Sub element " + name + " not found -- can't be removed.");
    } else {
      $subElement.remove();
      delete this.items[name];
      if( Object.keys(this.items).length === 0){
        this.empty(true);
      }
    }
  };

  /**
   * Basically just a drop-down box and a button
   *
   */
  OO.ui.SemanticsSelector = function(opts){
    OO.ui.SemanticsSelector.super.apply( this );
    var meaningsLabel = opts.meaningsLabel;
    var meanings = opts.meanings;
    var emptyMessage = opts.emptyMessage;

    this.$element = $("<div>").addClass("semantics-selector");

    this.meaningSelector = new OO.ui.SemanticMeaningSelector({
      label: meaningsLabel,
      meanings: meanings
    });
    this.meaningSelector.on("add", this.handleSemanticMeaningAdd.bind(this));
    this.$element.append(this.meaningSelector.$element);

    this.semanticMap = {};
    this.workspace = new Workspace({emptyMessage: emptyMessage});
    this.$element.append(this.workspace.$element);
  };
  OO.inheritClass( OO.ui.SemanticsSelector, OO.ui.Widget );
  OO.ui.SemanticsSelector.prototype.getValue = function(){
    var valueList = [], meaning;
    for( meaning in this.semanticMap ){
      if( this.semanticMap.hasOwnProperty(meaning) ){
        valueList.push(meaning);
      }
    }
    if ( valueList.length > 0 ){
      return valueList;
    }else{
      return null;
    }
  };
  OO.ui.SemanticsSelector.prototype.setValue = function(meanings){
    meanings = meanings || [];
    var meaningValue, sm;
    this.clear();
    for(var i=0; i < meanings.length; i++){
      sm = this.meaningSelector.getDataFor(meanings[i]);
      this.addMeaning(sm);
    }
  };
  OO.ui.SemanticsSelector.prototype.handleSemanticMeaningAdd = function() {
    this.addMeaning(this.meaningSelector.getSelected());
  };
  OO.ui.SemanticsSelector.prototype.addMeaning = function(meaning){
    if ( !meaning ) {
      // TODO: consider alerting
      alert("No meaning selected");
    }else if ( this.semanticMap[meaning.value] !== undefined ){
      alert("Meaning " + meaning.label + " already selected");
    }else{
      var sm = new OO.ui.SemanticMeaning({meaning: meaning});
      this.semanticMap[meaning.value] = sm;
      this.workspace.add(meaning.value, sm.$element);
      sm.on('close', this.handleCloseSelector.bind(this));
    }

    this.meaningSelector.reset();
  };

  OO.ui.SemanticsSelector.prototype.handleCloseSelector = function(sm){
    this.removeMeaning(sm);
  };
  OO.ui.SemanticsSelector.prototype.removeMeaning = function(sm){
    //remove the select from semanticMap
    this.workspace.remove(sm.meaning.value);
    delete this.semanticMap[sm.meaning.value];
  };
  OO.ui.SemanticsSelector.prototype.clear = function(){
    for(var meaningValue in this.semanticMap){
      if ( this.semanticMap.hasOwnProperty(meaningValue) ){
        this.removeMeaning(this.semanticMap[meaningValue]);
      }
    }
    this.meaningSelector.reset();
  };

  /**
   * Basically just a drop-down box and a button
   *
   */
  OO.ui.SemanticMeaningSelector = function(opts){
    OO.ui.SemanticMeaningSelector.super.apply( this );
    var label = opts.label,
        meanings = opts.meanings,
        items = [];
    this.meaningData = {};

    this.$element = $("<div>").addClass("semantic-meaning-selector");

    // Menu elements
    for(var i=0; i < meanings.length; i++){
      var meaning = meanings[i];
      var $label = $('<span>').attr('title', html2text(meaning.description));
      this.meaningData[meaning.value] = meaning;
      items.push(
        new OO.ui.MenuOptionWidget({ data: meaning, $label: $label,
                                     label: meaning.label})
      );
    }

    this.dropdown = new OO.ui.DropdownWidget( {
      label: label,
      menu: {items: items},
      classes: ['meanings']
    } );
    this.$element.append(this.dropdown.$element);

    this.button = new OO.ui.ButtonWidget( {
        flags: ['constructive', 'primary'],
        icon: 'add',
        classes: ['add']
    } );
    this.$element.append(this.button.$element);
    this.button.on('click', this.handleButtonClick.bind(this));

  };
  OO.inheritClass( OO.ui.SemanticMeaningSelector, OO.ui.Widget );
  OO.ui.SemanticMeaningSelector.prototype.handleButtonClick = function(){
    this.emit('add');
  };
  OO.ui.SemanticMeaningSelector.prototype.getSelected = function(){
    if( this.dropdown.getMenu().getSelectedItem() ){
      return this.dropdown.getMenu().getSelectedItem().getData();
    }else{
      return null;
    }
  };
  OO.ui.SemanticMeaningSelector.prototype.getDataFor = function(meaningValue){
    return this.meaningData[meaningValue];
  };
  OO.ui.SemanticMeaningSelector.prototype.reset = function(){
    this.dropdown.getMenu().selectItem(); // This should deselect and reset
  };

  /**
   * Contains a semantic meaning
   *
   */
  OO.ui.SemanticMeaning = function(opts){
    OO.ui.SemanticMeaning.super.apply( this );
    this.meaning = opts.meaning;

    this.$element = $("<div>").addClass("semantic-meaning");

    this.closer = new OO.ui.ButtonWidget({
      icon: "remove",
      framed: false,
      flags: "destructive",
      classes: ["closer"]
    });
    this.$element.append(this.closer.$element);
    this.closer.on('click', this.handleCloserClick.bind(this));

    this.$title = $("<div>").addClass("title").text(this.meaning.label);
    this.$element.append(this.$title);
    this.$description = $("<div>").addClass("description").html(this.meaning.description);
    this.$element.append(this.$description);
  };
  OO.inheritClass( OO.ui.SemanticMeaning, OO.ui.Widget );
  OO.ui.SemanticMeaning.prototype.handleCloserClick = function(){
    this.close();
  };
  OO.ui.SemanticMeaning.prototype.close = function(){
    //destroy the object and emit an event
    this.$element.remove();
    this.emit('close', this);
  };
})(jQuery, OO);
