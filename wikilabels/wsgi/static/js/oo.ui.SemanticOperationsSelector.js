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
  OO.ui.SemanticOperationsSelector.prototype.handleSemanticMeaningAdd = function(){
    var meaning = this.semanticMeanings.getData();

    if ( meaning === undefined ) {
      // TODO: consider alerting
      throw "No meaning selected";
    }else if ( this.semanticMap[meaning] !== undefined ){
      throw "Meaning " + meaning + " already selected";
    }else{
      var operationsSelector = new OO.ui.SyntacticOperationsSelector({
        meaning: meaning,
        objects: this.objects,
        actions: this.actions
      });
      this.semanticMap[meaning] = operationsSelector;
      this.$workspace.append(operationsSelector.$element);
      operationsSelector.on('close', this.handleCloseSelector.bind(this));
    }

    this.semanticMeanings.reset();
  };
  OO.ui.SemanticOperationsSelector.prototype.handleCloseSelector = function(sos){
    //remove the select from semanticMap
    delete this.semanticMap[sos.meaning];
  };

  /**
   * Basically just a drop-down box and a button
   *
   */
  OO.ui.SemanticMeaningSelector = function(opts){
    OO.ui.SemanticMeaningSelector.super.apply( this );

    var label = opts.label;
    var meanings = opts.meanings;

    this.$element = $("<div>").addClass("semantic-meaning-selector");

    // Menu elements
    items = [];
    for(var i=0; i < meanings.length; i++){
      var meaning = meanings[i];
      items.push(
        new OO.ui.MenuOptionWidget({ data: meaning, label: meaning })
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
    return this.dropdown.getMenu().getSelectedItem().getData();
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
  OO.ui.SyntacticOperationsSelector.prototype.handleObjectActionAdd = function(){
    //TODO: check if we already have an instance of this object/action pair
    // if we don't, add it to the workspace
    var objectAction = this.objectActions.getData();
    var key = objectAction.object + "-" + objectAction.action;
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
    var key = soa.object + "-" + soa.action;
    delete this.objectActionMap[key];
  };
  OO.ui.SyntacticOperationsSelector.prototype.handleCloserClick = function(){
    //destroy the object and emit an event
    this.$element.remove();
    this.emit('close', this);
  };

  OO.ui.ObjectActionSelector = function(opts){
    OO.ui.ObjectActionSelector.super.apply( this );
    var objects = opts.objects;
    var actions = opts.actions;
    var button_label = opts.button_label;

    this.$element = $("<div>").addClass("object-action-selector");

    // Object menu elements
    object_items = [];
    for(var i=0; i < objects.length; i++){
      var object = objects[i];
      object_items.push(
        new OO.ui.MenuOptionWidget({ data: object, label: object })
      );
    }

    this.objects = new OO.ui.DropdownWidget( {
      label: "objects",
      menu: {items: object_items},
      classes: ['objects']
    } );
    this.$element.append(this.objects.$element);

    // Action menu elements
    action_items = [];
    for(var j=0; j < actions.length; j++){
      var action = actions[j];
      action_items.push(
        new OO.ui.MenuOptionWidget({ data: action, label: action })
      );
    }

    this.actions = new OO.ui.DropdownWidget( {
      label: "actions",
      menu: {items: action_items},
      classes: ['actions']
    } );
    this.$element.append(this.actions.$element);

    // Add button
    this.button = new OO.ui.ButtonWidget( {
        label: button_label,
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

    this.$object = $("<div>").addClass("object").text(this.object);
    this.$element.append(this.$object);
    this.$action = $("<div>").addClass("action").text(this.action);
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
