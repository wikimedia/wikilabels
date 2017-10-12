( function ( $, OO, WL ) {
	var Labeler, Connector, CampaignList, Campaign, WorksetList, Workset;

	/**
	 * Labeler
	 *
	 */
	Labeler = function ( $element ) {
		var i, instance, labelerBaseID = '#' + WL.config.prefix + 'labeler';
		if ( $element === undefined || $element.length === 0 ) {
			throw Error( '$element must be a defined element' );
		}
		if ( WL.Labeler.instances ) {
			for ( i = 0; i < WL.Labeler.instances.length; i++ ) {
				instance = WL.Labeler.instances[ i ];
				if ( instance.$element.is( labelerBaseID ) ) {
					throw Error( 'Labeler is already loaded on top of ' + $element.attr( 'id' ) );
				}
			}
		}

		this.$element = $element;
		WL.Labeler.instances.push( this );

		this.$menu = $( labelerBaseID + ' > .wikilabels-menu' );
		if ( this.$menu === undefined || this.$menu.length !== 1 ) {
			throw Error( '#' + WL.config.prefix + 'labeler > .wikilabels-menu must be a single defined element' );
		}

		this.campaignList = new CampaignList();
		this.campaignList.worksetActivated.add( this.handleWorksetActivation.bind( this ) );
		this.connector = new Connector();

		this.workspace = new WL.Workspace(
			this.$element.find( '.wikilabels-workspace' )
		);
		this.$element.append( this.workspace.$element );
		this.workspace.labelSaved.add( this.handleLabelSaved.bind( this ) );
		this.workspace.newWorksetRequested.add( this.handleNewWorksetRequested.bind( this ) );

		WL.user.updateStatus();
		WL.user.statusChanged.add( this.handleUserStatusChange.bind( this ) );
		this.handleUserStatusChange();
	};
	Labeler.instances = [];
	Labeler.prototype.handleUserStatusChange = function () {
		if ( WL.user.authenticated() ) {
			this.campaignList.load();
			this.$menu.empty();
			this.$menu.append( this.campaignList.$element );
		} else {
			this.$menu.empty();
			this.$menu.append( this.connector.$element );
		}
	};
	Labeler.prototype.handleWorksetActivation = function ( campaign, workset ) {
		this.campaignList.selectWorkset( workset );

		this.workspace.loadWorkset( campaign.id, workset.id );
	};
	Labeler.prototype.handleLabelSaved = function ( campaignId, worksetId, tasks, labels ) {
		var campaign, workset;
		campaign = this.campaignList.get( campaignId );
		workset = campaign.worksetList.get( worksetId );
		workset.updateProgress( tasks, labels );
		campaign.updateButtonState();
	};
	Labeler.prototype.handleNewWorksetRequested = function () {
		var campaign = this.campaignList.get( this.workspace.campaignId );
		campaign.assignNewWorkset();
	};

	/**
	 * Connector Widget
	 *
	 *
	 */
	Connector = function () {
		this.$element = $( '<div>' ).addClass( 'connector' );

		this.button = new OO.ui.ButtonWidget( {
			label: WL.i18n( 'connect to server' ),
			flags: [ 'progressive' ]
		} );
		this.$element.append( this.button.$element );
		this.button.on( 'click', this.handleButtonClick.bind( this ) );
	};
	Connector.prototype.handleButtonClick = function () {
		WL.user.initiateOAuth();
	};

	/**
	 * Campaign List Widget
	 *
	 */
	CampaignList = function () {
		this.$element = $( '<div>' ).addClass( 'campaign-list' );

		this.$header = $( '<h2>' ).html( WL.i18n( 'Campaigns', [ '/stats/' + WL.mediawiki.dbname + '/' ] ) );
		this.$element.append( this.$header );

		this.$container = $( '<div>' ).addClass( 'container' );
		this.$element.append( this.$container );

		this.campaigns = {};
		this.selectedWorkset = null;

		this.worksetActivated = $.Callbacks();
	};
	CampaignList.prototype.handleWorksetActivation = function ( campaign, workset ) {
		this.worksetActivated.fire( campaign, workset );
	};
	CampaignList.prototype.get = function ( campaignId ) {
		return this.campaigns[ campaignId ];
	};
	CampaignList.prototype.clear = function () {
		this.$container.empty();
		this.campaigns = {};
	};
	CampaignList.prototype.load = function () {
		var query;
		if ( !WL.user.authenticated() ) {
			throw Error( 'Cannot load campaign list when user is not authenticated.' );
		}
		this.clear();
		query = WL.server.getCampaigns();
		query.done( function ( doc ) {
			var i, campaign;
			for ( i = 0; i < doc.campaigns.length; i++ ) {
				campaign = new Campaign( doc.campaigns[ i ] );
				this.push( campaign );
			}
		}.bind( this ) );
		query.fail( function ( doc ) {
			this.$element.html( doc.code + ':' + doc.message );
		}.bind( this ) );

	};
	CampaignList.prototype.push = function ( campaign ) {
		this.campaigns[ campaign.id ] = campaign;
		this.$container.append( campaign.$element );
		campaign.worksetActivated.add( this.handleWorksetActivation.bind( this ) );
	};
	CampaignList.prototype.selectWorkset = function ( workset ) {
		if ( this.selectedWorkset ) {
			this.selectedWorkset.select( false );
		}
		this.selectedWorkset = workset;
		if ( this.selectedWorkset ) {
			this.selectedWorkset.select( true );
		}
	};

	/**
	 * Campaign Widget
	 *
	 */
	Campaign = function ( campaignData ) {
		this.$element = $( '<div>' ).addClass( 'campaign' );

		this.expander = new OO.ui.ToggleButtonWidget( {
			label: '+',
			value: false,
			classes: [ 'expander' ]
		} );
		this.$element.append( this.expander.$element );
		this.expander.on( 'change', this.handleExpanderChange.bind( this ) );

		this.$name = $( '<div>' ).addClass( 'name' );
		this.$element.append( this.$name );

		this.worksetList = new WorksetList();
		this.$element.append( this.worksetList.$element );
		this.worksetList.worksetActivated.add( this.handleWorksetActivation.bind( this ) );

		this.$controls = $( '<div>' ).addClass( 'controls' );
		this.$element.append( this.$controls );

		this.newButton = new OO.ui.ButtonWidget( {
			label: WL.i18n( 'request workset' )
		} );
		this.$controls.append( this.newButton.$element );
		this.newButton.on( 'click', this.handleNewButtonClick.bind( this ) );

		this.expanded = $.Callbacks();
		this.worksetActivated = $.Callbacks();

		this.load( campaignData );
	};
	Campaign.prototype.handleExpanderChange = function ( expanded ) {
		this.expand( expanded );
	};
	Campaign.prototype.handleNewButtonClick = function () {
		this.assignNewWorkset();
	};
	Campaign.prototype.handleWorksetActivation = function ( workset ) {
		this.worksetActivated.fire( this, workset );
	};
	Campaign.prototype.assignNewWorkset = function () {
		WL.server.assignWorkset( this.id )
			.done( function ( doc ) {
				var workset = new Workset( doc.workset );
				this.worksetList.push( workset );
				this.worksetActivated.fire( this, workset );
			}.bind( this ) )
			.fail( function ( doc ) {
				alert( doc.code + ': ' + doc.message );
			} );
	};
	Campaign.prototype.updateButtonState = function () {
		if ( this.worksetList.complete() ) {
			this.newButton.setDisabled( false );
		} else {
			this.newButton.setDisabled( true );
		}
	};
	Campaign.prototype.load = function ( campaignData ) {
		this.id = campaignData.id;
		this.$name.text( campaignData.name );

		WL.server.getUserWorksetList(
			WL.user.id, campaignData.id
		)
			.done( function ( doc ) {
				var i, workset;
				this.worksetList.clear();
				for ( i = 0; i < doc.worksets.length; i++ ) {
					workset = new Workset( doc.worksets[ i ] );
					this.worksetList.push( workset );
				}
				this.updateButtonState();
			}.bind( this ) )
			.fail( function ( doc ) {
				alert( WL.i18n( 'Could not load workset list: $1', [ JSON.stringify( doc ) ] ) );
			} );
	};
	Campaign.prototype.expand = function ( expanded ) {
		if ( expanded === undefined ) {
			return this.$element.hasClass( 'expanded' );
		} else if ( expanded ) {
			this.$element.addClass( 'expanded' );
			this.expander.setLabel( '-' );
			this.expanded.fire( expanded );
			return this;
		} else {
			this.$element.removeClass( 'expanded' );
			this.expander.setLabel( '+' );
			return this;
		}
	};

	/**
	 * Workset List Widget
	 *
	 */
	WorksetList = function () {
		this.$element = $( '<div>' ).addClass( 'workset-list' );

		this.$container = $( '<div>' ).addClass( 'container' );
		this.$element.append( this.$container );

		this.worksets = {};
		this.worksetActivated = $.Callbacks();

	};
	WorksetList.prototype.handleWorksetActivation = function ( workset ) {
		this.worksetActivated.fire( workset );
	};
	WorksetList.prototype.push = function ( workset ) {
		this.$container.append( workset.$element );
		this.worksets[ workset.id ] = workset;
		workset.activated.add( this.handleWorksetActivation.bind( this ) );
	};
	WorksetList.prototype.get = function ( worksetId ) {
		return this.worksets[ worksetId ];
	};
	WorksetList.prototype.clear = function () {
		// Clear the container
		this.$container.empty();
		this.worksets = {};
	};
	WorksetList.prototype.complete = function () {
		var key, workset;
		for ( key in this.worksets ) {
			if ( this.worksets.hasOwnProperty( key ) ) {
				workset = this.worksets[ key ];

				if ( !workset.completed ) {
					return false;
				}
			}
		}
		return true;
	};

	/**
	 * Workset Widget
	 *
	 */
	Workset = function ( worksetData ) {
		this.$element = $( '<div>' ).addClass( 'workset' );
		this.$element.click( this.handleClick.bind( this ) );

		this.$controls = $( '<div>' ).addClass( 'controls' );
		this.$element.append( this.$controls );

		this.openButton = new OO.ui.ButtonWidget( {
			label: WL.i18n( 'open' ),
			classes: [ 'button', 'open' ],
			flags: [ 'constructive' ]
		} );
		this.openButton.on( 'click', this.handleButtonClick.bind( this ) );

		this.reviewButton = new OO.ui.ButtonWidget( {
			label: WL.i18n( 'review' ),
			classes: [ 'button', 'review' ],
			flags: [ 'constructive' ],
			framed: false
		} );
		this.reviewButton.on( 'click', this.handleButtonClick.bind( this ) );

		this.progressContent = $( '<span>' );
		this.progress = new OO.ui.ProgressBarWidget( {
			progress: 0,
			content: [ this.progressContent ],
			classes: [ 'progress' ]
		} );
		this.$element.append( this.progress.$element );

		this.completed = false;
		this.activated = $.Callbacks();

		this.load( worksetData );
	};
	Workset.prototype.handleClick = function () {
		this.activated.fire( this );
	};
	Workset.prototype.handleButtonClick = function () {
		this.activated.fire( this );
	};
	Workset.prototype.load = function ( worksetData ) {
		this.id = worksetData.id;
		this.campaignId = worksetData.campaign_id;
		this.created = worksetData.created;
		this.updateProgress( worksetData.stats.tasks, worksetData.stats.labeled );
	};
	Workset.prototype.updateProgress = function ( tasks, labeled ) {
		var percent = ( ( labeled / tasks ) || 0 ) * 100;

		this.completed = labeled === tasks;

		if ( this.completed ) {
			this.$controls.html( this.reviewButton.$element );
		} else {
			this.$controls.html( this.openButton.$element );
		}

		this.progress.setProgress( percent );

		this.progressContent.text( this.formatProgress( tasks, labeled ) );
	};
	Workset.prototype.formatProgress = function ( tasks, labeled ) {
		return ( new Date( this.created * 1000 ) ).format( WL.i18n( 'date-format' ) ) + '  ' +
			'(' + String( labeled ) + '/' + String( tasks ) + ')';
	};
	Workset.prototype.select = function ( selected ) {
		if ( selected === undefined ) {
			return this.$element.hasClass( 'selected' );
		} else if ( selected ) {
			this.$element.addClass( 'selected' );
			return this;
		} else {
			this.$element.removeClass( 'selected' );
			return this;
		}
	};

	WL.Labeler = Labeler;

}( jQuery, OO, wikiLabels ) );
