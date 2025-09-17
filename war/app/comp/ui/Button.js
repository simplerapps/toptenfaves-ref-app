
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.Button = function ()
{	
	// specify if the component contains state or not
	this.stateful = false;
	
	// state variables
	this.actionListener = undefined;
	this.selected = false;

	var myAtomObj = undefined;
	var listenerComp = undefined;
	var divId = undefined;
	
	// CSS defined here for button component
	this.css = {
	}; 
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: link | button  (create a link, default is button)
	 * glyphicon: glyphicon name to use with text (default none)
	 * theme: blank, color  (default color)
	 * listener: action listener component (default none)
	 * 
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myAtomObj = atomObj;
		
		var gicon = SA.getConfig (atomObj, 'glyphicon' );
		
		var type = SA.getConfig (atomObj, 'type', 'button');
		var linkStyle = ( type == 'link' );
		
		var theme = SA.getConfig (atomObj, 'theme', 'color');
		var thcls = ( theme == 'blank' )? 'btn-default' : 'btn-success';
		
		// set global listener comp
		if ( !listenerComp )
			listenerComp = SA.getConfig (atomObj, 'listener' );
		
		var defaultButton = SA.getConfig (atomObj, 'defButton', false);
		defaultButton = true;
		
		var label = atomObj.label;
		if ( !label ) {
			label = 'No Label';
		}
		var tooltip = '';
		if ( atomObj.info ) {
			tooltip = 'title="' + atomObj.info + '"';
		}
		
		var style = '';
		if ( atomObj.style ) {
			style = atomObj.style;
		}
		
		var giconCss = '';
		if ( gicon ) {
			giconCss = 'glyphicon ' + gicon;
		}
		
		// set div.id == compId (or name if exists), this way you can always lookup component instance from divId
		divId = this.compId;
		if ( atomObj.name )
			divId = atomObj.name;
		
		var retHtml = '';
		
		if ( linkStyle ) {
			style = (style=='')? 'float:left;padding:8px;padding-left:0px' : style ;
			
			retHtml = '<div style=""' + tooltip + '><a id="' + divId + 
			'" href="#" style="' + style + '">'+ label +'</a></div>';
		}
		else {
			style = (style=='')? 'margin-right:8px;' : style;
			
			var spanId = divId + '-span';
			
			if ( defaultButton ) {
				retHtml = '<button id="' + divId + '" ' + tooltip + ' style="' + style + 
					'" class="btn ' + thcls + '">'+
					'<span id="' + spanId + '" class="' + giconCss + '"></span>' + ' '+ label+'</button>'
			}
			else {
				retHtml = '<div id="' + divId + '" ' + tooltip + ' style="' + style + 
					'" class="btn ' + thcls + '">'+
					'<span id="' + spanId + '" class="' + giconCss + '"></span>' + ' '+ label+'</div>'
			}
		}
		return retHtml;
	}
	
	this.setWaiting = function ( isWaiting ) 
	{
		if ( isWaiting ) {
			$ ('#' + divId+'-span').addClass ( 
				'glyphicon glyphicon-refresh glyphicon-refresh-animate' );
		}
        else {
            $ ('#' + divId+'-span').removeClass ( 
            	'glyphicon glyphicon-refresh glyphicon-refresh-animate' );
        }
	}
	
	this.getName = function()
	{
		return this.atomObj.name;
	}
	
	/**
	 * If defined it will allow this component to be an action listener
	 */
	this.setActionListener = function ( listener )
	{
		listenerComp = listener;
	}
	
	/**
	 * Adds an action listener
	 */
	this.showSelected = function ( selected )
	{
		this.selected = selected;
		var id = this.id;
		
		if ( selected ) {
		    $("#" + id).addClass ( 'active' );
		}
		else {
		    $("#" + id).removeClass ( 'active' );
		}
	}
	
	/**
	 * Fire event to this action (click button, etc.)
	 */
	this.triggerEvent = function ( eventName )
	{
		var id = this.id;
		var select = $( "#" + id );
		if ( select )
			select.trigger( eventName );
	}
	
	var lastTimeStamp = 0;
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		//var atomObj = this.atomObj;
		var divId = this.id;		// id can be compId or name (if provided)
		var compId = this.compId;	// compId
		var myComp = this;
		
		var vdiv = $("#" + divId);
		
		$('body').on('click', "#" + divId, function (e) {
			
			e.preventDefault();
			// prevent multi events
			if ( e.timeStamp - lastTimeStamp < 4 ) {
				return;
			}
			lastTimeStamp = e.timeStamp;
			
		    // if compId set in tlist, fire local link
		    if ( myAtomObj.tlist && myAtomObj.tlist.indexOf ('#compId:')==0 ) {
		    	// fire a click event to that component
		    	SA.events.fireEvent( myAtomObj.tlist.substring(8), 'click');
		    	return;
		    }
			
			// get div.id as compId
			var compId = divId;
			
		    // fire event
		    if ( listenerComp ) {
		    	listenerComp.performAction ( compId, myAtomObj, myComp );
		    }
		    
		    //check for ilist and tlist. If found, add the ilist as tlist child
		    if ( myAtomObj.tlist ) {		    	
				// load the ilist
				var ilist = SA.comps.getList ( myAtomObj.ilist )
				
				// now load the component's target list
				var tlist = SA.comps.getList ( myAtomObj.tlist );
				
				var html = '';
				
				// no list component at tlist just render ilist into div
				if ( !tlist.lc ) {
					html = SA.listCreateUI ( this.compId, ilist );
					if ( html )
						$('#' + tlist.name ).html ( html );
				}
				else {
					if ( ilist ) {
						if ( !tlist.items ) 
							tlist.items = new Array();
						
						tlist.items.push ( ilist );
					}
					// now render the tlist with ilist as its child (if exists) 
					var html = SA.listCreateUI ( compId, tlist );
					if ( html ) 	// if return value, set it
						tdiv.html ( html );
				}
		    }
		    
		    // show that is component is selected (no need to do this for button)
		    //thisComp.showSelected ( compId, true);
		});
	}
}
