(function($, OO){

  var html2text = function(html){
    return $("<div>").html(html).text();
  };

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

    this.meaningSelector = new OO.ui.SemanticMeaningSelector({
      label: meaningsLabel,
      meanings: meanings
    });
    this.meaningSelector.on("add", this.handleSemanticMeaningAdd.bind(this));
    this.$element.append(this.meaningSelector.$element);

    this.semanticMap = {};
    this.$workspace = $("<div>").addClass("workspace");
    this.$element.append(this.$workspace);
  };
  OO.inheritClass( OO.ui.SemanticOperationsSelector, OO.ui.Widget );
  OO.ui.SemanticOperationsSelector.prototype.getValue = function(){
    var valueMap = {}, sos, meaning;
    for( meaning in this.semanticMap ){
      if( this.semanticMap.hasOwnProperty(meaning) ){
        sos = this.semanticMap[meaning];
        valueMap[meaning] = sos.getValue();
      }
    }
    return valueMap;
  };
  OO.ui.SemanticOperationsSelector.prototype.setValue = function(meanings){
    var meaningValue, meaning, sos;
    this.clear();
    for( meaningValue in meanings ){
      if( meanings.hasOwnProperty(meaningValue) ){
        meaning = this.meaningSelector.getDataFor(meaningValue);
        this.addMeaning(meaning, meanings[meaningValue]);
      }
    }
  };
  OO.ui.SemanticOperationsSelector.prototype.handleSemanticMeaningAdd = function() {
    this.addMeaning(this.meaningSelector.getSelected());
  };
  OO.ui.SemanticOperationsSelector.prototype.addMeaning = function(meaning, operations){
    operations = operations || [];
    if ( !meaning ) {
      // TODO: consider alerting
      alert("No meaning selected");
    }else if ( this.semanticMap[meaning.value] !== undefined ){
      alert("Meaning " + meaning.label + " already selected");
    }else{
      var sos = new OO.ui.SyntacticOperationsSelector({
        meaning: meaning,
        objects: this.objects,
        actions: this.actions,
        operations: operations
      });
      this.semanticMap[meaning.value] = sos;
      this.$workspace.append(sos.$element);
      sos.on('close', this.handleCloseSelector.bind(this));
    }

    this.meaningSelector.reset();
  };

  OO.ui.SemanticOperationsSelector.prototype.handleCloseSelector = function(sos){
    this.removeMeaning(sos);
  };
  OO.ui.SemanticOperationsSelector.prototype.removeMeaning = function(sos){
    //remove the select from semanticMap
    sos.$element.remove();
    delete this.semanticMap[sos.meaning.value];
  };
  OO.ui.SemanticOperationsSelector.prototype.clear = function(){
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
   * Contains a semantic meaning -- allows the selection of syntactic
   * operations
   *
   */
  OO.ui.SyntacticOperationsSelector = function(opts){
    OO.ui.SyntacticOperationsSelector.super.apply( this );
    this.meaning = opts.meaning;
    var objects = opts.objects;
    var actions = opts.actions;
    var operations = opts.operations;
    this.operationMap = {};

    this.$element = $("<div>").addClass("syntactic-operations-selector");

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

    this.operationSelector = new OO.ui.OperationSelector({
      objects: objects,
      actions: actions
    });
    this.operationSelector.on('add', this.handleOperationAdd.bind(this));
    this.$element.append(this.operationSelector.$element);

    this.$workspace = $("<div>").addClass("workspace");
    this.$element.append(this.$workspace);

    for(var i=0; i<operations.length; i++){
      var operationValue = operations[i];
      var operation = this.operationSelector.getDataFor(operationValue);
      this.addOperation(operation);
    }
  };
  OO.inheritClass( OO.ui.SyntacticOperationsSelector, OO.ui.Widget );
  OO.ui.SyntacticOperationsSelector.prototype.getValue = function(){
    var key, sop, values = [];
    for( key in this.operationMap ) {
      if( this.operationMap.hasOwnProperty( key ) ){
        sop = this.operationMap[key];
        values.push({
          object: sop.object.value,
          action: sop.action.value
        });
      }
    }
    return values;
  };
  OO.ui.SyntacticOperationsSelector.prototype.clear = function(){
    var key, sop;
    for( key in this.operationMap ) {
      if( this.operationMap.hasOwnProperty( key ) ){
        sop = this.operationMap[key];
        sop.close();
      }
    }
  };
  OO.ui.SyntacticOperationsSelector.prototype.setValue = function(operations){
    var i, key, sop, operationValue, operation;
    for( i = 0; i < operations.length; ++i ) {
      operationValue = operations[i];
      operation = this.operationsSelector.getDataFor(operationValue);
      sop = new OO.ui.SyntacticOperation({
        object: operation.object,
        action: operation.action
      });
      this.operationMap[key] = sop;
    }
  };
  OO.ui.SyntacticOperationsSelector.prototype.handleOperationAdd = function(){
    var operation = this.operationSelector.getSelected();
    if( operation ){
      this.addOperation(operation);
    } else {
      // alert("No operation selected!");  already errored
    }
  };
  OO.ui.SyntacticOperationsSelector.prototype.addOperation = function(operation){
    //check if we already have an instance of this object/action pair
    // if we don't, add it to the workspace
    var key = operation.object.value + "-" + operation.action.value;
    if(this.operationMap[key] === undefined){
      var sop = new OO.ui.SyntacticOperation({
        object: operation.object,
        action: operation.action
      });
      sop.on('close', this.handleObjectActionClose.bind(this));
      this.$workspace.append(sop.$element);
      this.operationMap[key] = sop;
    }else{
      alert("'" + key + "' has already been added.");
    }

  };
  OO.ui.SyntacticOperationsSelector.prototype.handleObjectActionClose = function(sop){
    //remove from operationMap
    var key = sop.object.value + "-" + sop.action.value;
    delete this.operationMap[key];
  };
  OO.ui.SyntacticOperationsSelector.prototype.handleCloserClick = function(){
    this.close();
  };
  OO.ui.SyntacticOperationsSelector.prototype.close = function(){
    //destroy the object and emit an event
    this.$element.remove();
    this.emit('close', this);
  };

  OO.ui.OperationSelector = function(opts){
    OO.ui.OperationSelector.super.apply( this );
    var objects = opts.objects,
        actions = opts.actions,
        objectItems = [],
        actionItems = [];

    this.$element = $("<div>").addClass("object-action-selector");

    // Object menu elements
    this.objectMap = {};
    for(var i=0; i < objects.length; i++){
      var object = objects[i];
      var $objectLabel = $('<span>').attr('title', html2text(object.description));
      this.objectMap[object.value] = object;
      objectItems.push(
        new OO.ui.MenuOptionWidget({ data: object, $label: $objectLabel,
                                     label: object.label })
      );
    }

    this.objects = new OO.ui.DropdownWidget( {
      label: "objects",
      menu: {items: objectItems},
      classes: ['objects']
    } );
    this.$element.append(this.objects.$element);

    // Action menu elements
    this.actionMap = {};
    for(var j=0; j < actions.length; j++){
      var action = actions[j];
      var $actionLabel = $('<span>').attr('title', html2text(action.description));
      this.actionMap[action.value] = action;
      actionItems.push(
        new OO.ui.MenuOptionWidget({ data: action, $label: $actionLabel,
                                     label: action.label})
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
  OO.inheritClass( OO.ui.OperationSelector, OO.ui.Widget );
  OO.ui.OperationSelector.prototype.handleButtonClick = function(){
    this.emit("add");
  };
  OO.ui.OperationSelector.prototype.getSelected = function(){
    if ( !this.objects.getMenu().getSelectedItem() ) {
      alert("No object selected.");
    } else if ( !this.actions.getMenu().getSelectedItem() ) {
      alert("No action selected.");
    } else {
      return {
        object: this.objects.getMenu().getSelectedItem().getData(),
        action: this.actions.getMenu().getSelectedItem().getData()
      };
    }
  };
  OO.ui.OperationSelector.prototype.getDataFor = function(operationValue) {
    return {
      object: this.objectMap[operationValue.object],
      action: this.actionMap[operationValue.action]
    };
  };


  OO.ui.SyntacticOperation = function(opts){
    OO.ui.SyntacticOperation.super.apply( this );
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
  OO.inheritClass( OO.ui.SyntacticOperation, OO.ui.Widget );
  OO.ui.SyntacticOperation.prototype.close = function(){
    this.$element.remove();
    this.emit('close', this);
  };
  OO.ui.SyntacticOperation.prototype.handleCloserClick = function(){
    // TODO: Destroy this and emit an event
    this.close();
  };

})(jQuery, OO);
