( function ( $, OO, CodeMirror, YAML, revcoder ) {

	var FormBuilder = function () {
		this.$element = $( '<div>' ).addClass( 'form_builder' );

		this.configEditor = new ConfigEditor();
		this.$element.append( this.configEditor.$element );
		this.configEditor.submit.attach( this.handleConfigEditorSubmit.bind( this ) );

		this.formPreview = new FormPreview();
		this.$element.append( this.formPreview.$element );
		this.formPreview.submit.attach( this.handleFormPreviewSubmit.bind( this ) );
	},
        ConfigEditor, FormPreview, LanguageSelector;
	FormBuilder.prototype.handleConfigEditorSubmit = function ( codeEditor ) {
		var config = this.configEditor.json();
		this.formPreview.load( config );
	};
	FormBuilder.prototype.handleFormPreviewSubmit = function ( codeEditor ) {
		alert( 'Label data: ' + JSON.stringify( this.formPreview.getLabelData() ) );
	};

	ConfigEditor = function () {

		this.$element = $( '<div>' ).addClass( 'config_editor' );

		this.codeMirror = new CodeMirror(
		this.$element[0],
			{
				mode: 'yaml',
				lineNumbers: true,
				viewportMargin: Infinity,
				tabSize: 2,
				indentWithTabs: false
			}
		);
		this.codeMirror.setOption( 'extraKeys', {
			Tab: function ( cm ) {
				var spaces = Array( cm.getOption( 'indentUnit' ) + 1 ).join( ' ' );
				cm.replaceSelection( spaces );
			}
		} );

		this.$controls = $( '<div>' ).addClass( 'controls' );
		this.$element.append( this.$controls );

		this.previewButton = new OO.ui.ButtonWidget( {
			label: 'Preview',
			icon: 'expand',
			iconTitle: 'Preview',
			align: 'inline',
			flags: [ 'primary', 'constructive' ]
		} );
		this.previewButton.on( 'click', this.handlePreviewButtonClick.bind( this ) );
		this.$controls.append( this.previewButton.$element );

		// Events
		// FIXME: Use https://api.jquery.com/jQuery.Callbacks/
		this.submit = new Event( this );
	};
	ConfigEditor.prototype.handlePreviewButtonClick = function () {
		// Handles an OO.ui event
		this.submit.notify();
	};
	ConfigEditor.prototype.text = function ( val ) {
		if ( val === undefined ) {
			return this.codeMirror.getValue();
		} else {
			this.codeMirror.setValue( val );
			setTimeout( function () { this.codeMirror.refresh( 0 ); }.bind( this ), 100 );
		}
	};
	ConfigEditor.prototype.json = function () {
		return YAML.eval( this.text() );
	};

	FormPreview = function () {
		this.$element = $( '<div>' ).addClass( 'form_preview' );
		this.config = null;
		this.form = null;

		this.languageSelector = new LanguageSelector();
		this.$element.append(this.languageSelector.$element);
		this.languageSelector.select.attach( this.handleLanguageSelection.bind( this ) );

		this.$formContainer = $( '<div>' ).addClass( 'form_container' );
		this.$element.append( this.$formContainer );

		this.$controls = $( '<div>' ).addClass( 'controls' );
		this.$element.append( this.$controls );

		this.submitButton = new OO.ui.ButtonWidget( {
			label: 'Submit Label',
			align: 'inline',
			disabled: true,
			flags: [ 'primary', 'constructive' ]
		} );
		this.submitButton.on( 'click', this.handleSubmitButtonClick.bind( this ) );
		this.$controls.append( this.submitButton.$element );

		// Events
		// FIXME: Use https://api.jquery.com/jQuery.Callbacks/
		this.submit = new Event( this );
	};
	FormPreview.prototype.handleSubmitButtonClick = function ( e ) {
		this.submit.notify();
	};
	FormPreview.prototype.handleLanguageSelection = function ( _, lang ) {
		// Make sure the submit button is disabled while we try to load the form.
		this.submitButton.setDisabled( true );

		// Clear the container
		this.$formContainer.html( '' );

		// Construct a new form
		this.form = revcoder.Form.fromConfig( this.config, lang );
		this.$formContainer.append( this.form.$element );

		// Enable the submit button now that we're ready
		this.submitButton.setDisabled( false );
	};
	FormPreview.prototype.load = function ( config ) {
		var lang,
			langs = [];
		// Disable the submit button while we load the config
		this.submitButton.setDisabled( true );

		// Cache form
		this.config = config;

		// Load languages into language selector
		for ( lang in config.i18n ) {
			if ( config.i18n.hasOwnProperty( lang ) ) {
				langs.push( lang );
			}
		}
		this.languageSelector.load( langs );

		this.languageSelector.selectLang( langs[0] );
	};
	FormPreview.prototype.getLabelData = function () {
		if ( this.form ) {
			return this.form.getValues();
		} else {
			return null;
		}
	};

	LanguageSelector = function () {
		var layout;
		this.$element = $( '<div>' ).addClass( 'language_selector' );
		this.dropdown = new OO.ui.DropdownWidget( {
			menu: { items: [] }
		} );
		this.dropdown.getMenu().on( 'select', this.handleSelect.bind( this ) );
		layout = new OO.ui.FieldLayout(
			this.dropdown,
			{
				label: 'Select a language'
			}
		);
		this.$element.append( layout.$element );
		// FIXME: Use https://api.jquery.com/jQuery.Callbacks/
		this.select = new Event( this );
	};
	LanguageSelector.prototype.handleSelect = function () {
		this.select.notify( this.dropdown.getMenu().getSelectedItem().getData() );
	};
	LanguageSelector.prototype.load = function ( langs ) {
		var i, lang,
			items = [];
		this.dropdown.getMenu().clearItems();

		for ( i in langs ) {
			if ( langs.hasOwnProperty( i ) ) {
				lang = langs[i];
				items.push( new OO.ui.MenuOptionWidget( { label: lang, data: lang } ) );
			}
		}

		this.dropdown.getMenu().addItems( items );
	};
	LanguageSelector.prototype.selectLang = function ( lang ) {
		var menu = this.dropdown.getMenu();
		menu.selectItem( this.dropdown.getMenu().getItemFromData( lang ) );
	};

	revcoder.FormBuilder = FormBuilder;
} )( jQuery, OO, CodeMirror, YAML, revcoder );
