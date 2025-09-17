/**
 * ItemsDialogs 
 */
App.ItemsDialogs = function ()
{
	this.css = { items: 
		[
		]
	};
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'newitem-dlg', lc:'App.Dialog', config:{pageStyle:true}, items:
			 [
			 {name:'newitem-form', lc:'App.FormHandler', 
				 	config:{title:'List Tile', listener:this}, items:   
				 [
				 {name:'id', ac:'App.Variable'},
				 {name:'listId', ac:'App.Variable' },
				 //{html:'div', style:'height:80px;'},
				 
				 {name:'tileMsg', ac:'App.Message' },
				 {html:'div', style:'height:5px;'},				 
				 
				 {name:'tileTitle', ac:'App.TextField', info:'Title (required)', required:true, pattern:'text' },
				 {name:'tileSTitle', ac:'App.TextField', info:'Subtitle', required:false, pattern:'text' },
				 
				 {name:'tileImage', ac:'App.UploadBrowser', info:'Photo name', required:false, pattern:'text' },
				 
				 {name:'tileInfo', ac:'App.TextArea', info:'More information', 
					 required:false, pattern:'text' },

				 {name:'tileLName', ac:'App.TextField', info:'Link name as appears on page', required:false, pattern:'text' },
				 {name:'tileLink', ac:'App.TextField', info:'Link actual URL', required:false, pattern:'text' },
				 
				 {html:'div', style:'height:10px;'},

				 {cmd:'cmdSaveTile', ac:'App.Button', label:'Save Changes', config:{theme:'color',defButton:true}},
				 {cmd:'cmdCancelTile', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				 {html:'div', style:'height:8px;'},

				 {name:'tileDelete', cmd:'showDelTile', ac:'App.Button', label:'Click to Delete Tile', 
					 config:{type:'link'} },
				 
				 {html:'div', style:'height:10px;'}
				 ]
			 }
			 ]
		}, 
		{name:'confirm-delete-item', lc:'App.Dialog', items:
			[
			{name:'delitem-form', lc:'App.FormHandler', 
				config:{title:'Are you sure?', listener:this}, items: 
				[
				{html:'div', style:'height:6px;'},
				{name:'id', ac:'App.Variable'},
				{name:'delMessage', html:'p', style:'font-size:110%', value:'Are you sure you want to delete?'},
				{html:'div', style:'height:6px;'},
				
			    {cmd:'cmdDelTile', ac:'App.Button', label:'Delete', config:{theme:'color'}},
			    {cmd:'cmdDelCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				]
			}
			]
		}
		]
	};

	// other state
    var compId;
    var currentDlgName;
    var curDelListId;

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		var html =  _createUI ( compId, flowList, config );
		return html;
	}
	
	/**
	 * Show a dialog with name
	 */
	this.showDialog = function ( dialogName, newTitle )
	{
		showDlg ( newTitle, dialogName );
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdSaveTile' ) {
			if ( validate ( 'tileMsg', atomList, dataObj ) ) {
				currentDlg.setWaiting ( true );
				var form = getForm ( dataObj );
				if ( dataObj.id ) { // edit
					SA.server.putForm ("/rs/ttitem", form, postSuccess);
				}
				else { // new
					SA.server.postForm ("/rs/ttitem", form, postSuccess);
				}
			}
		}
		else if ( actionAtom.cmd == 'cmdCancelTile' ) {
			currentDlg.showDialog (false, 'List Tile', 'appBanner');
		}
		else if ( actionAtom.cmd == 'showDelTile' ) {
			currentDlg.showDialog (false, '', 'appBanner');
			var form = SA.comps.getCompByIdOrName('delitem-form');
			form.updateForm ( {
				'delMessage':'Delete Tile "' + dataObj.tileTitle + '" ?',
				'id':dataObj.id } );
			curDelListId = dataObj.listId;
			showDlg ( '', 'confirm-delete-item' );
		}
		else if ( actionAtom.cmd == 'cmdDelTile' ) {
			currentDlg.setWaiting ( true );
			SA.server.del ("/rs/ttitem", {id: dataObj.id}, delSuccess);
		}
		else if ( actionAtom.cmd == 'cmdDelCancel' ) {
			currentDlg.showDialog (false, 'List Tile', 'appBanner');
		}
	}
	
	/**
	 * getItemsToolBar called by editor object
	 */
	this.getItemsToolBar = function ( cardCompId, cardAtomObj, newButton ) 
	{
		var flowlist = 
		{name:'newitem-edit', items:[] };
		
		var listId = cardAtomObj.config.listId ;
		var cardId = cardAtomObj.config.id;
				
		// new button
		if ( newButton == true ) {
			flowlist.items.push ( {name:'item-new-' + cardCompId, cmd:'new', ac:'App.Button', 
				label:'Add Tile', config:{theme:'blank', listId:listId, cardId:cardId} } );
		} // edit 
		else {
			flowlist.items.push ( {name:'item-edit-' + cardCompId, cmd:'edit', ac:'App.Button', 
				label:'Edit', config:{type:'link', listId:listId, cardId:cardId} } ); 
		}
		var html = SA.listCreateUI ( this.compId, flowlist, null, true );
		
		// add action listeners
		var editBt = SA.comps.getCompByIdOrName ( 'item-edit-' + cardCompId );
		if ( editBt )
			editBt.setActionListener ( this );
		var newBt = SA.comps.getCompByIdOrName ( 'item-new-' + cardCompId );
		if ( newBt )
			newBt.setActionListener ( this );
		
		return html;
	}
	
	/**
	 * Called when clicking on action buttons
	 */
	this.performAction = function ( compId, atomObj )
	{
		var tbcomp = SA.lookupComponent ( 'ltoolBar');
		
		// update form list with data before showing the dialog
		var formComp = SA.lookupComponent ('newitem-form');
		
		// for edit user listId and cardId
		if ( atomObj.cmd == 'edit' ) {
			var cardDat = tbcomp.findCard ( atomObj.config.listId, atomObj.config.cardId );
			var dlist = {};
			dlist.id = cardDat.id;
			dlist.listId = cardDat.listId;
			dlist.tileTitle = cardDat.title;
			title = cardDat.title;
			dlist.tileSTitle = cardDat.stitle;
			if ( cardDat.mediaId ) {
				dlist.tileImage = SA.server.getMediaUrl (cardDat.mediaId);
			}
			else if ( cardDat.mediaUrl ) {
				dlist.tileImage = cardDat.mediaUrl;
			}
			dlist.tileInfo = cardDat.info;
			dlist.tileLName = cardDat.lname;
			dlist.tileLink = cardDat.link;
			formComp.updateForm ( dlist );
			formComp.showElement ( 'tileDelete', true );
			// show dlg
			showDlg ( dlist.tileTitle, 'newitem-dlg' );
			// hide toolbar
			tbcomp.show ( false );
		}
		else { // new 
			var nlist = {};
			nlist.listId = atomObj.config.listId;
			formComp.updateForm ( nlist );
			formComp.showElement ( 'tileDelete', false );

			// show new item dialog
			showDlg ( 'New Tile', 'newitem-dlg' );
			// hide toolbar
			tbcomp.show ( false );			
		}
	}
	
	/**
	 * Convert object to form
	 */
	function getForm ( obj ) 
	{
		var form = new FormData();
		if ( obj.tileTitle)
			form.append ( 'title',  obj.tileTitle);
		if ( obj.tileSTitle )
			form.append ( 'stitle',  obj.tileSTitle);
		if ( obj.tileInfo )
			form.append ( 'info', obj.tileInfo);
		if ( obj.tileLName )
			form.append ( 'lname', obj.tileLName);
		if ( obj.tileLink )
			form.append ( 'link', obj.tileLink);
		if ( obj.listId )
			form.append ( 'listId', obj.listId );
		if (obj.id )
			form.append ( 'id', obj.id );

		// get tile media 
		if ( obj.tileImage ) {
			// if string assume URL, otherwise a file type
			if ( typeof obj.tileImage == "string" )
				form.append ( 'mediaUrl', obj.tileImage );
			else	
				form.append ( 'image', obj.tileImage );
		}

		return form;
	}
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		data.tileTitle = App.util.safeHtml (data.tileTitle);
		data.tileSTitle = App.util.safeHtml (data.tileSTitle);
		data.tileInfo = App.util.safeHtml (data.tileInfo);
		data.tileLName = App.util.safeHtml (data.tileLName);
		data.tileLink = App.util.safeHtml (data.tileLink);
		return true;
	}
	
	function showDlg ( title, newDlgName, noToolbar )
	{
		currentDlgName = newDlgName;
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			currentDlg.showDialog (true, title, 'appBanner' );
		}
	}
	
	function postSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		
		// card created
		if ( respObj.status == 'OK') {

			// fire login event to appBanner and ribbonBar
			var event = {};
			event.cmd = 'addTile';
			event.data = respObj;
			SA.events.fireEvent("ltoolBar", event );
			currentDlg.showDialog (false, 'List Tile', 'appBanner');
		}
		else {
			showMessage ( 'listMsg', respObj.message, false)			 
		}
		// remove waiting 
		currentDlg.setWaiting ( false );
	}
	
	function delSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		
		// card created
		if ( respObj.status == 'OK') {

			// fire login event to appBanner and ribbonBar
			var event = {};
			event.cmd = 'delTile';
			respObj.respData.listId = curDelListId;
			event.data = respObj;
			SA.events.fireEvent("ltoolBar", event );
			currentDlg.showDialog (false, 'List Tile', 'appBanner');
		}
		else {
			showMessage ( 'listMsg', respObj.message, false)			 
		}
		// remove waiting 
		currentDlg.setWaiting ( false );
	}
	
	function _createUI ( compId, flowlist, config )
	{
		var html = '';
		html += SA.listCreateUI ( this.compId, flowlist, config, true );
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

