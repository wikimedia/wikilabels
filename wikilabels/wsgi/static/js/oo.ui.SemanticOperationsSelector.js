(function($, OO){

  /**
   * Basically just a drop-down box and a button
   *
   */
  OO.ui.SemanticOperationsSelector = function(opts){
    OO.ui.SemanticOperationsSelector.super.apply( this );
    var meaningsLabel = opts.meaningsLabel;
    var meanings = opts.meanings;
    this.objects = opts.objects;
    this.actions = opts.actions;

    this.$element = $("<div>").addClass("semantic-operations-selector");

    this.semanticMeanings = new OO.ui.SemanticMeaningSelector({
      label: meaningsLabel,
      meanings: meanings
    });
    this.semanticMeanings.on("add", this.handleSemanticMeaningAdd.bind(this));
    this.$element.append(this.semanticMeanings.$element);

    this.semanticMap = {};
    this.$workspace = $("<div>").addClass("workspace");
    this.$element.append(this.$workspace);
  };
  OO.inheritClass( OO.ui.SemanticOperationsSelector, OO.ui.Widget );
  OO.ui.SemanticOperationsSelector.prototype.getData = function(){
    var valueMap = {}, sos, meaning;
    for( meaning in this.semanticMap ){
      if( this.semanticMap.hasOwnProperty(meaning) ){
        sos = this.semanticMap[meaning];
        valueMap[meaning] = sos.getData();
      }
    }
    return valueMap;
  };
  OO.ui.SemanticOperationsSelector.prototype.handleSemanticMeaningAdd = function(){
    var meaning = this.semanticMeanings.getData();

    if ( !meaning ) {
      // TODO: consider alerting
      alert("No meaning selected");
    }else if ( this.semanticMap[meaning.value] !== undefined ){
      alert("Meaning " + meaning.label + " already selected");
    }else{
      var operationsSelector = new OO.ui.SyntacticOperationsSelector({
        meaning: meaning.label,
        objects: this.objects,
        actions: this.actions
      });
      this.semanticMap[meaning.value] = operationsSelector;
      this.$workspace.append(operationsSelector.$element);
      operationsSelector.on('close', this.handleCloseSelector.bind(this));
    }

    this.semanticMeanings.reset();
  };
  OO.ui.SemanticOperationsSelector.prototype.handleCloseSelector = function(sos){
    //remove the select from semanticMap
    delete this.semanticMap[sos.meaning.value];
  };

  /**
   * Basically just a drop-down box and a button
   *
   */
  OO.ui.SemanticMeaningSelector = function(opts){
    OO.ui.SemanticMeaningSelector.super.apply( this );
    var label = opts.label;
    var meanings = opts.meanings;
    var items = [];

    this.$element = $("<div>").addClass("semantic-meaning-selector");

    // Menu elements
    for(var i=0; i < meanings.length; i++){
      var meaning = meanings[i];
      items.push(
        new OO.ui.MenuOptionWidget({ data: meaning, label: meaning.label })
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
  OO.ui.SemanticMeaningSelector.prototype.getData = function(){
    if( this.dropdown.getMenu().getSelectedItem() ){
      return this.dropdown.getMenu().getSelectedItem().getData();
    }else{
      return null
    }
  };
  OO.ui.SemanticMeaningSelector.prototype.reset = function(){
    this.dropdown.getMenu().selectItem(); // This should deselect and reset
  };

  /**
   * Contains a semantic meaning -- allows the selection of syntactic
   * operations
   *
   */
  OO.ui.SyntacticOperationsSelector = function(opts){
    OO.ui.SyntacticOperationsSelector.super.apply( this );
    this.meaning = opts.meaning;
    var objects = opts.objects;
    var actions = opts.actions;

    this.$element = $("<div>").addClass("syntactic-operations-selector");

    this.closer = new OO.ui.ButtonWidget({
      icon: "remove",
      framed: false,
      flags: "destructive",
      classes: ["closer"]
    });
    this.$element.append(this.closer.$element);
    this.closer.on('click', this.handleCloserClick.bind(this));

    this.$title = $("<div>").addClass("title").text(this.meaning);
    this.$element.append(this.$title);

    this.objectActions = new OO.ui.ObjectActionSelector({
      objects: objects,
      actions: actions
    });
    this.objectActions.on('add', this.handleObjectActionAdd.bind(this));
    this.$element.append(this.objectActions.$element);

    this.objectActionMap = {};
    this.$workspace = $("<div>").addClass("workspace");
    this.$element.append(this.$workspace);
  };
  OO.inheritClass( OO.ui.SyntacticOperationsSelector, OO.ui.Widget );
  OO.ui.SyntacticOperationsSelector.prototype.getData = function(){
    var key, soa, values = [];
    for( key in this.objectActionMap ) {
      if( this.objectActionMap.hasOwnProperty( key ) ){
        soa = this.objectActionMap[key];
        values.push({
          object: soa.object.value,
          action: soa.action.value
        });
      }
    }
    return values;
  };
  OO.ui.SyntacticOperationsSelector.prototype.handleObjectActionAdd = function(){
    //check if we already have an instance of this object/action pair
    // if we don't, add it to the workspace
    var objectAction = this.objectActions.getData();
    var key = objectAction.object.value + "-" + objectAction.action.value;
    if(this.objectActionMap[key] === undefined){
      var data = this.objectActions.getData();
      var soa = new OO.ui.SyntacticObjectAction({
        object: data.object,
        action: data.action
      });
      soa.on('close', this.handleObjectActionClose.bind(this));
      this.$workspace.append(soa.$element);
      this.objectActionMap[key] = soa;
    }else{
      alert("'" + key + "' has already been added.");
    }

  };
  OO.ui.SyntacticOperationsSelector.prototype.handleObjectActionClose = function(soa){
    //remove from objectActionMap
    var key = soa.object.value + "-" + soa.action.value;
    delete this.objectActionMap[key];
  };
  OO.ui.SyntacticOperationsSelector.prototype.handleCloserClick = function(){
    //destroy the object and emit an event
    this.$element.remove();
    this.emit('close', this);
  };

  OO.ui.ObjectActionSelector = function(opts){
    OO.ui.ObjectActionSelector.super.apply( this );
    var objects = opts.objects,
        actions = opts.actions,
        objectItems = [],
        actionItems = [];

    this.$element = $("<div>").addClass("object-action-selector");

    // Object menu elements
    for(var i=0; i < objects.length; i++){
      var object = objects[i];
      objectItems.push(
        new OO.ui.MenuOptionWidget({ data: object, label: object.label })
      );
    }

    this.objects = new OO.ui.DropdownWidget( {
      label: "objects",
      menu: {items: objectItems},
      classes: ['objects']
    } );
    this.$element.append(this.objects.$element);

    // Action menu elements
    for(var j=0; j < actions.length; j++){
      var action = actions[j];
      actionItems.push(
        new OO.ui.MenuOptionWidget({ data: action, label: action.label })
      );
    }

    this.actions = new OO.ui.DropdownWidget( {
      label: "actions",
      menu: {items: actionItems},
      classes: ['actions']
    } );
    this.$element.append(this.actions.$element);

    // Add button
    this.button = new OO.ui.ButtonWidget( {
        icon: 'add',
        flags: 'constructive',
        classes: ['add']
    } );
    this.$element.append(this.button.$element);
    this.button.on('click', this.handleButtonClick.bind(this));
  };
  OO.inheritClass( OO.ui.ObjectActionSelector, OO.ui.Widget );
  OO.ui.ObjectActionSelector.prototype.handleButtonClick = function(){
    this.emit("add");
  };
  OO.ui.ObjectActionSelector.prototype.getData = function(){
    return {
      object: this.objects.getMenu().getSelectedItem().getData(),
      action: this.actions.getMenu().getSelectedItem().getData()
    };
  };

  OO.ui.SyntacticObjectAction = function(opts){
    OO.ui.SyntacticObjectAction.super.apply( this );
    this.object = opts.object;
    this.action = opts.action;

    this.$element = $("<div>").addClass("object-action");

    this.$object = $("<div>").addClass("object").text(this.object.label);
    this.$element.append(this.$object);
    this.$action = $("<div>").addClass("action").text(this.action.label);
    this.$element.append(this.$action);

    this.closer = new OO.ui.ButtonWidget({
      icon: "remove",
      framed: false,
      flags: 'destructive',
      classes: ["closer"]
    });
    this.$element.append(this.closer.$element);
    this.closer.on('click', this.handleCloserClick.bind(this));
  };
  OO.inheritClass( OO.ui.SyntacticObjectAction, OO.ui.Widget );
  OO.ui.SyntacticObjectAction.prototype.handleCloserClick = function(){
    // TODO: Destroy this and emit an event
    this.$element.remove();
    this.emit('close', this);
  };

})(jQuery, OO);
