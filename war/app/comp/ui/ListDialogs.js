/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 * 
 *  1- Its "css" to define local css classes
 *  2- Its "flow" to define the view declaratively    
 *  3- Other Imperative code to control the behavior and action of the page
 *  
 */
App.ListDialogs = function ()
{
	/**
	 * The CSS class names are unique to this class. For example if another class has the name 'rounded'
	 * it would be a different name because the names are distinguished based on unique class component type id
	 * that are assigned automatically at object creation time. 
	 * CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	 * 
	 */
	this.css = { items: 
		[
		]
	};
	
	/**
	 * Login flow list
	 */
	this.flow = { items: 
		[
		{name:'newlist-dlg', lc:'App.Dialog', items:
			 [
			 {name:'newlist-form', lc:'App.FormHandler', 
				 	config:{title:'Top Ten List', listener:this}, items: 
				 [
				 {name:'listMsg', ac:'App.Message' },
				 {name:'id', ac:'App.Variable' },
				 {html:'div', style:'height:12px;'},
				 {name:'listTitle', ac:'App.TextField', info:'List Title', required:true, pattern:'text' },
				 {name:'listDesc', ac:'App.TextArea', info:'List Description (optional)', 
					 required:false, pattern:'text' },

				 {html:'div', style:'height:6px;'},
				 {cmd:'cmdCreateList', ac:'App.Button', label:'Save Changes', config:{theme:'color', defButton:true}},
				 {cmd:'cmdCancelList', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				 {html:'div', style:'height:6px;'},				 
				 {name:'listDelete', cmd:'showDelList', ac:'App.Button', label:'Click to Delete List', 
					 config:{type:'link'} },
				 {html:'div', style:'height:10px;'}
				 ]
			 }
			 ]
		},
		/*
		{name:'sharelist-dlg', lc:'App.Dialog', items:
			 [
			 {name:'sharelist-form', lc:'App.FormHandler', 
				 	config:{title:'Share Your List', listener:this}, items: 
				 [
				 //{name:'listMsg', ac:'App.Message' },
				 //{name:'id', ac:'App.Variable' },
				 {html:'div', style:'height:12px;'}, 
				 {html:'p', style:'font-size:110%', 
					 value:"Copy message below and paste into a Text Message or Email and send it to your friends!" },
				 
				 {name:'shareLink', ac:'App.TextArea', info:'', 
					 required:true, pattern:'text', config:{rows:5, style:'background-color:#F0F0F0'} }, 

				 {html:'div', style:'height:6px;'},

				 //{cmd:'cmdShareList', ac:'App.Button', label:'DONE', config:{theme:'color'}},
				 {cmd:'cmdCancelShare', ac:'App.Button', label:'DONE', config:{theme:'color'} },
				 {html:'div', style:'height:6px;'}		 
				 ]
			 }
			 ]
		},
		*/
		{name:'confirm-delete-list', lc:'App.Dialog', items:
			[
			{name:'dellist-form', lc:'App.FormHandler', 
				config:{title:'Are you sure?', listener:this}, items: 
				[
				{html:'div', style:'height:6px;'},
				{name:'id', ac:'App.Variable'},
				{name:'delMessage', html:'p', style:'font-size:110%', value:'Are you sure you want to delete?'},
				{html:'div', style:'height:6px;'},
				
			    {cmd:'cmdDelList', ac:'App.Button', label:'Delete', config:{theme:'color'}},
			    {cmd:'cmdDelListCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
			    {html:'div', style:'height:16px;'},
				]
			}
			]
		}		
		]
	};

	// other state
    var compId = undefined;
    var currentDlgName = undefined;

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		compId = this.compId;
		var html =  _createUI ( compId, this.flow, config );
		return html;
	}
	
	/**
	 * Show a dialog with name
	 */
	this.showDialog = function ( dialogName, newForm )
	{
		showDlg ( dialogName, newForm );
	}
	
	/**
	 * Show element on dialog name form
	 */
	this.showElement = function ( dlgName, name, show )
	{
		var dlg = SA.lookupComponent ( dlgName );
		if ( dlg ) {
			dlg.showElement (name, show);
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdCreateList' ) {
			if ( validate ( 'listMsg', atomList, dataObj ) ) {
				var data = {};
				data.id = dataObj.id;
				data.title = App.util.safeHtml(dataObj.listTitle);
				data.description = App.util.safeHtml(dataObj.listDesc);
				data.style = dataObj.listStyle;
				
				if ( data.id && data.id > 0 ) 
					SA.server.set ("/rs/ttlist", data, updateSuccess);
				else 
					SA.server.set ("/rs/ttlist", data, addSuccess);
			}
		}
		else if ( actionAtom.cmd == 'cmdCancelList' ) {
			currentDlg.showDialog (false);
		}
		else if ( actionAtom.cmd == 'cmdDelListCancel' ) {
			currentDlg.showDialog (false);
		}
		else if ( actionAtom.cmd == 'cmdCancelShare' ) {
			currentDlg.showDialog (false);
		}
		
		else if ( actionAtom.cmd == 'showDelList' ) {
			currentDlg.showDialog (false, '', 'appBanner');
			var tbComp = SA.getCompByIdOrName ( 'ltoolBar' );
			var curList = tbComp.getCurrentList ();
			if ( curList ) {
				var valsObj = {'delMessage':'Delete entire list "' + curList.title +'" ?', 'id':curList.id };
				showDlg ('confirm-delete-list',  valsObj );				
			}
		}
		else if ( actionAtom.cmd == 'cmdDelList' ) {
			currentDlg.setWaiting ( true );
			SA.server.del ("/rs/ttlist", {id: dataObj.id}, delSuccess);
		}		
	}
	
	/**
	 * Delete shared list dialog
	 */
	this.deleteSharedList = function ( listId ) 
	{
		var valsObj = {'delMessage':'Delete shared list ?', id:listId };
		showDlg ('confirm-delete-list',  valsObj );
	}
	
	/*
	 * Validate function
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		return true;
	}
	
	/*
	 * General show dialog function 
	 */
	function showDlg ( newDlgName, newForm )
	{
		currentDlgName = newDlgName;
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			if ( newForm ) {
				currentDlg.updateForm (newForm );
			}
			currentDlg.showDialog (true);
		}
	}
	
	function delSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			SA.events.fireEvent("ltoolBar", {cmd:'delList', data:respObj} );
			// close dlg and go back
			currentDlg.showDialog (false);
			var banner = SA.lookupComponent ( 'appBanner' );
			banner.showPrevious ();
		}
		else {
			showMessage ( 'listMsg', respObj.message, false)			 
		}
	}	
	
	function addSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			SA.events.fireEvent("ltoolBar", {cmd:'addList', data:respObj} );
			currentDlg.showDialog (false);
		}
		else {
			showMessage ( 'listMsg', respObj.message, false)			 
		}
	}
	
	function updateSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {
			SA.events.fireEvent("ltoolBar", {cmd:'reloadList', data:respObj} );
			currentDlg.showDialog (false);
		}
		else {
			showMessage ( 'listMsg', respObj.message, false)			 
		}
	}
	
	function _createUI ( compId, flowlist, config )
	{
		var html = SA.listCreateUI ( compId, flowlist, config, true );
		return html;
	}
	
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
		
		if ( !success ) {
			shakeWindow ();
		}
	}
	
	/**
	 * Shake window because of error
	 */
	function shakeWindow ()
	{
		var id = currentDlg.compId;		
		var div = $( '#'+ id );		  
		var l = 25;  
		for( var i = 0; i < 4; i++ ) {  
			$( div ).animate( { 'margin-left': "+=" + ( l = -l ) + 'px' }, 50);
		}
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
	}
}

