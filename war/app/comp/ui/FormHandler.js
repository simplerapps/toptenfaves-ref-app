
/**
 * Create data entry form handler
 */
App.FormHandler = function ()
{
	// create new instance every time referenced in list
	this.stateful = true;
	
	// form listener
	var formListener ;
	
	// components in this form
	var compsList = new Array ();
	
	// define my form id
	var myId ;
	
	// my current flow list
	var myFlowList;
	
	// local css names
	var formCss ;
	var headerCss;
	
	// my comp
	var thisComp ;
	var title ;
	var pageStyle ;
	
	// comp trigger action
	var triggeringComp ;
	
	this.css = { items: 
		[
			/* Everything else */
			{name: '@media (min-width: 481px)', items: 
				[
				{name:'.header', value:'padding:0px;font-size:135%;margin:0 0 0 0;'},				 
				{name:'.form', value:'width:90%;padding:15px;font-size:110%;'}				 
				]
			},
			 
			/* Mobile sizes */
			{name: '@media (max-width: 480px)', items: 
				[
				{name:'.header', value:'padding:0px;font-size:130%;margin:0 0 0 0;'},			 				 
				{name:'.form', value:'width:98%;padding-top:12px;padding-bottom:5px;font-size:85%;'}
				]
			}
		]
	};	
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * items:
	 * All Action Atom objects in a list will be placed in form
	 * html elements will be static elements on form
	 * 
	 * config:
	 * listener: the listener component
	 * title: login form title
	 * 
	 */
	this.createUI = function ( flowList, allConfig )
	{
		myFlowList = flowList;
		thisComp = this;
		formListener = SA.getConfigValue ( flowList, 'listener' );
		
		if ( !flowList.items )
			return;
		
		// get form ID
		myId = this.compId;
		if ( flowList.name ) {
			myId = flowList.name;
		}
		
		// local form css
		formCss = SA.localCss ( this, 'form' );
		headerCss = SA.localCss ( this, 'header' );
		
		// page style ?
		pageStyle = SA.getConfigValue ( flowList, 'pageStyle', false );
		
		// col-md-8 col-md-offset-2
		
		var retHtml;
		if ( pageStyle ) {
			retHtml =
			'<div id="' + myId + '" class="container col-md-8 col-md-offset-2" >'  +
				createFormUI ( flowList ) + 
			'</div>'; 
		}
		else {
			retHtml =
			'<div id="' + myId + '" class="container ' + formCss + '" >'  +
				createFormUI ( flowList ) + 
			'</div>';
		}
		return retHtml;
	}
	
	/**
	 * Updates form data
	 */
	this.updateForm = function ( dataObj )
	{
		// merge my data list + data obj
		SA.utils.mergeList(myFlowList, dataObj);
		var retHtml = createFormUI ( myFlowList );
		
		// update ui
		$( '#' + myId ).html (retHtml);
	}
	
	/**
	 * Creates form UI 
	 */
	function createFormUI ( flowList )
	{
		compsList = new Array ();
		var atomList = flowList.items;

		// set div.id == compId, this way you can always lookup component instance from divId
		var divId = this.compId;
		title = SA.getConfigValue ( flowList, 'title', 'Form Title Goes Here' );
		
		var titleLine = '';
		if ( !pageStyle ) {
			titleLine = 
			'<div class="panel-heading" style="border-bottom:0px;">' + 
				'<p class="' + headerCss + '" >' + title + '</p>' + 
			'</div>' ;
			
		}
		
		var retHtml = 
		'<div class="panel panel-default" style="margin-bottom:0px;border-width:0px;background-color:transparent;">' +		
			titleLine +			 		
			'<div style="padding-top:10px" />' +
			'<div class="row">' +
				'<div class="col-md-12">' +
			  	    '<div>' + 
					   '<form class="form-horizontal" action="" method="post">' ;
				  		   //'<div style="padding-bottom:15px;" />' ;
				  
		// now add all the buttons inside
		var j = 0;
		for ( j=0; j<atomList.length; j++ ) {
			var lobj = atomList [j];
			
			// if not atom component, just render  
			if ( !lobj.ac ) {
				retHtml += SA.listCreateUI ( lobj.compId, lobj, undefined, true );
				continue;
			}
			
			// get atom comp
			var atomComp = SA.getAtomComponent ( lobj.name, lobj.ac );
			compsList.push ( atomComp );
			
			// if button implements setActionListener method, call it and asso my self with it
			if ( atomComp.setActionListener ) 
				atomComp.setActionListener ( thisComp );
				
			// get html
			var html = atomComp.createUI ( lobj, null );
			
			retHtml += html;
		}
		retHtml += '</form></div></div></div></div>';

		return retHtml;
	}
	
	/**
	 * show / hide form element
	 */
	this.showElement= function ( elementName, show ) 
	{
		if ( !show ) {
			$ ('#' + elementName).hide ();
		}
		else { 
			$ ('#' + elementName).show ();
		}
	}
	
	/**
	 * Component that gets notified about form events
	 */
	this.addFormListener = function ( listener )
	{
		formListener = listener;
	}
	
	/**
	 * Set or reset waiting (when action is being perform)
	 */
	this.setWaiting = function ( isWaiting )
	{
		if ( triggeringComp && triggeringComp.setWaiting ) {
			triggeringComp.setWaiting ( isWaiting );
		}
		if ( isWaiting) {
			$('#' + myId).find(':input').prop('disabled', true);
		}
		else {
			$('#' + myId).find(':input').prop('disabled', false);
		}
	}
	
	/**
	 * The child components call this when an action is performed (i.e. key press)
	 */
	this.performAction = function ( compId, actionAtom, actionComp )
	{
		//console.log ( "action performed ");
		
		// notify form listener 
		if ( formListener ) {
			if ( formListener.notifySubmit ) {
				triggeringComp = actionComp;
				
				// get data objects from form
				var dataObj = this.getFormData( compsList );

				// pass to listener
				formListener.notifySubmit (actionAtom, myFlowList.items, dataObj );
			}
		}
	}
	
	/**
	 * Gets form data from all child components 
	 */
	this.getFormData = function ( compsList )
	{
		var data = {};
		
		for (i=0; i<compsList.length; i++ ) {
			
			var c = compsList [i];
			// component need a name to be placed on form
			if ( c.getName && c.getValue ) {
				var name = c.getName();
				var value = c.getValue();
				if ( value && value != '' ) {
					data [ name ] = value ;
				}
			}
		}
		return data;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
	}
}
