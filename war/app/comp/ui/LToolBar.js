
/**
 * BannertHandler Object  
 */
App.LToolBar = function ()
{
	var renderMode = 0;	// 0:home, 1:list, 2:tile
	
	var flowList = { items:
		[
		{name:'lists-home-menu', config:{hidden:false}, items:
			[
			{name:'listEdit', ac:'App.Button', label:'Edit List', config:{type:'link' },
				style:'float:right;padding-top:4px;padding-left:18px;'},
			{name:'listShare', ac:'App.Button', label:'Share', config:{type:'link' },
				style:'float:right;padding-top:4px;padding-left:12px;font-color:black'}
			]
		},
		
		{name:'lists-menu', config:{hidden:true}, items:
			[
			{name:'listNew', ac:'App.Button', label:'Create New List', info:'Create a new Top Ten List',
				style:'float:right;padding-top:4px;padding-left:10px;', config:{type:'link'} },
			{name:'listReload', ac:'App.Button', label:'Reload', info:'Reload all lists',
				style:'float:right;padding-top:4px;padding-right:12px;', config:{type:'link'} }				
			]
		},
		
		{name:'lists-tile-menu', config:{hidden:true}, items:
			[
			{name:'tileEdit', ac:'App.Button', label:'Edit Tile', info:'Edit Tile Details',
				style:'float:right;padding-top:4px;padding-left:8px;', config:{type:'link'} }
			]
		},
		
		{html:'div', style:'float:left;padding-top:10px;padding-left:3px;' } 
		]
	};
	
	var myId = undefined;
	var myComp = undefined;
	var firstTimeLoad = true;
	
	// all lists
	var allListsArray;

	// current list and tile
	var currentListId = undefined;
	var currentTileId = undefined;
	
	var editMode = true;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * parentList:
	 * 
	 * config:
	 * name: 'imageUrl' is the URL for image for that banner
	 * 
	 * items: 
	 * list of action Atom objects
	 *  
	 */  
	this.createUI = function ( parentList, allConfig )
	{
		// first time cause a load all lists (if any from db)
		if ( firstTimeLoad ) {
			this.handleEvent ( {cmd:'loadAllDB'} );
			firstTimeLoad = false;
		}

		myId = this.compId;
		myComp = this;
		var menuId = 'menu-' + myId;
		
		// create begin html markup
		var html = showMenu ( myId, flowList, false );
		var retHtml = 
		'<div id="' + myId + '" class="container" '+
			'style="font-size:90%;padding-left:8px;padding-bottom:4px;background-color:rgba(232,232,232,0.9);">' +
			'<div class="row" >'+
				'<div id="' + menuId + '" class="col-md-8 col-md-offset-2" >' +
				html +
				'</div>'+
			'</div>'+
		'</div>' ;
			
		return retHtml;
	}
	
	/**
	 * Sets render mode to: 'home', 'list', 'tile'
	 */
	this.renderView = function ( mode )
	{
		renderMode = mode;
		this.refresh();
	}
	
	/**
	 * Refresh this toolbar
	 */
	this.refresh = function () 
	{
		showMenu ( myId, flowList, true );
	}
	
	/**
	 * Shows and hides the toolbar 
	 */
	this.show = function ( show )
	{
		if ( show ) {
			$('#' + myId).fadeIn();
		}
		else {
			$('#' + myId).hide ();
		}
	}
	
	// is toolbar visible
	this.isVisible = function ()
	{
		return $('#' + myId).is(":visible"); 
	}
	
	/**
	 * Sets edit mode to true / false (default == true )
	 */
	this.setEditMode = function ( edit )
	{
		if ( edit != undefined )
			editMode = edit;
	}

	/*
	 * Set selected list id
	 */
	this.setSelectedListId = function ( selListId ) 
	{
		currentListId = selListId;
		// If selected current list, then there is no selected current tile 
		currentTileId = undefined;
	}
	
	/**
	 * Selected Tile Id
	 */
	this.setSelectedTileId = function ( selTileId ) 
	{
		currentTileId = selTileId;
	}
	
	/**
	 * Get current list in focus
	 */
	this.getCurrentList = function ()
	{
		return lookupList (currentListId);
	}
	
	/**
	 * Get current list in focus
	 */
	this.getCurrentTile = function ()
	{
		if ( currentTileId ) {
			return lookupCard (currentListId, currentTileId);
		}
	}	
	
	/**
	 * Find card in a list
	 */
	this.findCard = function ( listId, cardId ) 
	{
		return lookupCard (listId, cardId );
	}
	
	/**
	 * Get list by id
	 */
	this.getListById = function ( listId )
	{
		return lookupList ( listId );
	}
	
	/**
	 * Find card from lists 
	 */
	function lookupCard ( listId, cardId ) 
	{
		var i, j;
		
		if ( newlySharedList && newlySharedList.id == listId ) {
			for ( j=0; j<newlySharedList.items.length; j++ ) {
				if ( newlySharedList.items[j].id == cardId ) {
					return newlySharedList.items[j];
				}
			}
			return undefined;
		}
		
		if (!allListsArray ) return;
		for (i=0; i<allListsArray.length; i++ ) {
			var list = allListsArray [ i ];
			if ( listId == list.id || listId == list.fId ) {
				for ( j=0; j<list.items.length; j++ ) {
					if ( list.items[j].id == cardId ) {
						return list.items[j];
					}
				}
			}
		}
	}
	
	/**
	 * find a list by id
	 */
	function lookupList ( listId ) 
	{
		if ( newlySharedList && newlySharedList.id == listId ) {
			return newlySharedList;
		}
		if ( allListsArray && allListsArray.length>0 ) {
			for (i=0; i<allListsArray.length; i++ ) {
				if ( allListsArray[i].id == listId ) {
					return allListsArray[i];
				}
			}
		}
	}

	// newly shared list
	var newlySharedList = undefined;
	
	/**
	 * Add new shared list to lists registry
	 */
	this.setNewSharedList = function ( list )
	{
		if ( list ) {
			list.shared = true;		
			newlySharedList = list;
		}
		else {
			newlySharedList = undefined;
		}
	}
	
	/**
	 * Gets newly shared list (if exists)
	 */
	this.getNewSharedList = function ()
	{
		return newlySharedList;
	}
		
	/**
	 * Handle custom event
	 */
	this.handleEvent = function ( event )
	{
		// just logged in get simple html (without lists)
		if ( event.cmd == 'login') {
			var html = showMenu ( myId, flowList, true )
			
			// IF LOGOUT: reload home to reflect demo page
			if ( !SA.getUserAuth () ) {
				SA.fireEvent ( 'home', {cmd:'showAll'} );
			}
			else {
				myComp.handleEvent ( {cmd:'loadAllDB'} );
			}
		}
		// just added/updated one list
		else if ( event.cmd == 'addList' ) {
			var respData = event.data.respData;
			var homeComp = SA.lookupComponent ( 'home');
			updateChangedList ( respData, true );
			homeComp.addNewList ( respData );
			showMenu ( myId, flowList, true );
		}
		else if ( event.cmd == 'delList' ) {
			var respData = event.data.respData;
			var curList = lookupList ( currentListId );
			deleteList ( curList.id );
			var homeComp = SA.lookupComponent ( 'home');
			homeComp.deleteList ( respData );			
			showMenu ( myId, flowList, true );
		}
		else if ( event.cmd == 'reloadList' ) {
			var respData = event.data.respData;
			updateChangedList ( respData, false );			
			SA.fireEvent ( 'home', {cmd:'refreshList', data: respData} );
		}
		else if ( event.cmd == 'addTile' ) {
			var tileObj = event.data.respData;
			// get list rel to tile
			var tileList = getListWithTile ( tileObj, false );
    		// refresh list UI notify 'home' to load one list
    		SA.fireEvent ( 'home', {cmd:'refreshList', data: tileList, tileId:tileObj.id} );
    		
    		// refresh tile UI
			var lmgr = SA.lookupComponent ( 'listsManager' );
			lmgr.notifyChanged ( tileObj.listId, tileObj.id );
			var banner = SA.lookupComponent ( 'appBanner' );
			banner.resetContent ( tileObj.id, lmgr.getItemHtml (this, tileObj) );
		}
		else if ( event.cmd == 'delTile' ) {
			var tileObj = event.data.respData;
			// get list rel to tile
			var tileList = getListWithTile ( tileObj, true );
    		// notify 'home' to load one list
    		SA.fireEvent ( 'home', {cmd:'refreshList', data: tileList, tileId:tileObj.id} );
		}		
		// Server: reload all lists and update html
		else if ( event.cmd == 'loadAllDB' ) {
			App.util.startWorking();
			
			// check chareId
			var paramObj = getParamPassedParam ();
			if ( paramObj.id ) {
				SA.server.get("/rs/ttlist", {fId:paramObj.id}, loadAllResult );
				//console.debug ( 'id=' + paramObj.id );				
			}
			else {
				// load all lists once
			    SA.server.get("/rs/ttlist", {}, loadAllResult);
			}
		}
		// Server: load single list
		else if ( event.cmd == 'loadListDB' ) {
			loadListFromServer ( event.listId );
		}
		// check if reset landing URL was intended
		else if ( event.cmd == 'checkResetUrl' ) {
			var paramObj = getParamPassedParam ();
			if ( paramObj.reset ) {
				// log the user out
				SA.deleteUserAuth();
				SA.fireEvent ( 'feedbackDialogs', {cmd:'passwordReset', data:paramObj.reset} );
			}
		}
	}
	
	/**
	 * Set toolbar's title
	 */
	this.setTitle = function ( title )
	{
		var $tbTitle = $( '#tb-title' );
		var clsName = SA.localCss (this, 'tb-title' );
		$tbTitle.addClass ( myComp, clsName);
		$tbTitle.html ( title );
	}
	
	/**
	 * Get passed ID as param
	 */
	function getParamPassedParam ()
	{
		var paramObj = {};
		if ( location.search ) {
			//?id=5631698557468672
			var idx = location.search.indexOf ('id=');
			if ( idx >= 0 ) {
				paramObj.id = location.search.substring (idx+3 );
			}
			else {
				//?reset=xxxxxxx
				idx = location.search.indexOf ('reset=');
				if ( idx >= 0 ) {
					paramObj.reset = location.search.substring (idx+6 );				
				}
			}
		}
		return paramObj;
	}
	
	/**
	 * Refresh the lists with tile because it changed
	 */
	this.refreshListData = function ( tileData )
	{
		var tileList = getListWithTile ( tileData, false );
	}
	
	/**
	 * Return all lists array
	 */
	this.getAllListsArray = function ()
	{
		return allListsArray;
	}
	
	/**
	 * Delete list object
	 */
	function deleteList ( listId )
	{
		var idx;
		if ( allListsArray && allListsArray.length>0 ) {
			for (i=0; i<allListsArray.length; i++ ) {
				if ( allListsArray[i].id == listId ) {
					idx = i;
					break;
				}
			}
		}
		if ( idx ) {
			allListsArray.splice (idx, 1);
		}
	}
	
	/**
	 * Update changes list
	 */
	function updateChangedList ( changedList, isAdd )
	{
		if ( isAdd ) {
			allListsArray.push ( changedList )
		}
		else {
			for (i=0; i<allListsArray.length; i++ ) {
				if ( allListsArray[i].id == changedList.id) {
					changedList.items = allListsArray[i].items;
					allListsArray[i] = changedList;
				}
			}
		}
	}
	
	/** 
	 * First load data result after logging in 
	 */
	function loadAllResult ( respStr )
    {
    	var respObj = jQuery.parseJSON( respStr );
    	var shareList;
    	
    	if ( respObj.shareList ) {
    		shareList = respObj.shareList.respData;
    		tagNewSharedList ( shareList );
    	}
    	
    	if ( respObj.status == 'ERROR' ) {
    		// delete user auth 
    		SA.deleteUserAuth ();
    		
    		// fire login event to app banner
			SA.fireEvent("appBanner", {cmd:'postLogin'} );
			
    		SA.fireEvent ( 'home', {cmd:'showAll', data: allListsArray, share: shareList} );
    	}
    	else if ( respObj.status == 'OK' ) {
    		allListsArray = respObj.respData;
    		
    		// FIRST TIME! NO LISTS attribute (make link orange)
    		if ( allListsArray.length == 0 ) {
    			$('#listNew').css("color", "orange");
    		}
    		 
    		// LOAD: individual lists detail from server
    		for ( i=0; i<allListsArray.length; i++ ) {
    			var list = allListsArray [i];
    			loadListFromServer ( list.id, list.fId );
    		}
    		
    		// notify 'home' to load all lists
    		SA.fireEvent ( 'home', {cmd:'showAll', data: allListsArray, share: shareList} );    		
    	} 
    }
	
	/**
	 * Tag list as new shared list
	 */
	function tagNewSharedList ( shareList )
	{
		var list = shareList.list;
		list.nshare = true;
		if ( list.items ) {
			for (i=0; i<list.items.length; i++ ) {
				list.items[i].nshare = true;
			}
		}
	}
	
	/**
	 * Loads a list from server
	 */
	function loadListFromServer ( listId, listfId ) 
	{
		var obj = {id: listId};
		if ( listfId ) {
			obj.fId = listfId;
		}
		 SA.server.get("/rs/ttlist", obj, loadSingleResult);
	}
	
	/** 
	 * Get single list resut
	 */
	function loadSingleResult ( respStr )
    {
    	var respObj = jQuery.parseJSON( respStr );
    	
    	if ( respObj.status == 'ERROR' ) {
    		// delete user auth 
    		SA.deleteUserAuth ();
    		
    		// fire login event to app banner
			SA.fireEvent("appBanner", {cmd:'postLogin'} );
    	}
    	else if ( respObj.status == 'OK' ||  respObj.status == 'WARNING' ) {
    		// get single list back
    		var ldata = respObj.respData;
    		
    		if ( respObj.error == 'NOT_FOUND' ) {
    			ldata.title = 'Shared list not found! ';
    		}
    		
    		// merge into array of lists
    		var i;
    		for ( i=0; i<allListsArray.length; i++ ) {
    			if ( ldata.id  == allListsArray[i].id ) {
    				allListsArray[i] = ldata;
    				break;
    			}
    			else if ( ldata.id  == allListsArray[i].fId ) {
    				allListsArray[i].shared = true;
    				allListsArray[i] = ldata;
    				break;
    			} 
    		}
    		
    		// notify 'home' to load all lists
    		SA.fireEvent ( 'home', {cmd:'refreshList', data: ldata, source:'lsr'} );
    		
    		// redraw the menu
    		//showMenu (myId, flowList, true );
    	}
    }
	
	/**
	 * Get new list with updated tile data 
	 */
	function getListWithTile ( tileResp, remove ) 
	{
		if ( tileResp.listId ) {
			
			// see if list id exisis in one of out lists
			var i;
			for ( i=0; i<allListsArray.length; i++ ) {
				var list = allListsArray [i];
				if ( list.id == tileResp.listId ) {
					if ( !list.items ) {
						list.items = new Array();
					}
					var j;
					for ( j=0; j<list.items.length; j++) {
						// if same id, update (or remove)
						if ( list.items[j].id == tileResp.id ) {
							if ( remove ) 
								list.items.splice (j, 1);	// remove
							else
								list.items[j] = tileResp;	// update
							return list;
						}
					}
					// else add new
					list.items.push ( tileResp );
					return list;
				}
			}
		}
	}
	
	/**
	 * Render list and return HTML. This call removes the html and not only does display:none
	 */
	function showMenu ( compId, flowList, refreshHtml ) 
	{
		var html = '';
		if ( SA.getUserAuth () ) {
			
			if ( editMode == true ) {
				// If there are lists, change menu  
				if ( renderMode == 0) {	// Home mode
					flowList.items[0].config.hidden = true;
					flowList.items[1].config.hidden = false;
					flowList.items[2].config.hidden = true;
				}
				else if ( renderMode == 1 ) {
					flowList.items[0].config.hidden = false;
					flowList.items[1].config.hidden = true;
					flowList.items[2].config.hidden = true;
				}
				else {
					flowList.items[0].config.hidden = true;
					flowList.items[1].config.hidden = true;
					flowList.items[2].config.hidden = false;
				}
				html = SA.listCreateUI ( compId, flowList, {}, false );
			}
			
			if ( refreshHtml ) {
				$('#menu-' + myId).html ( html );
			}
		}
		else {
			// Not logged in: just load simple demo page 
			$('#menu-' + myId).html ( '' );
		}
		return html;
	}
	
	/** 
	 * show dialog
	 */
	function showDialog ( newDlgName )
	{
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			currentDlg.showDialog (false);
		}
		currentDlgName = newDlgName;
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			currentDlg.showDialog (true);
		}
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
		var id = this.id;
		var thisComp = this;

		//$('#listShare').css ( 'color', '#383838' );
		//$('#listShare').css ( 'font-weight', 'bold' );
		
		// NOTE: Fastclick causes multiple events to be fired
		
		$( '#listNew' ).click ( function (event) {
			if ( acceptEvent (event) ) {
				var listDlgsComp = SA.getCompByIdOrName ( 'listDialogs' );
				var elist = {};
				// Form (dialog) title
				elist.config = { title:'Create New List' };	
				elist.listStyle = 'asc';
				listDlgsComp.showDialog ( 'newlist-dlg', elist );
				listDlgsComp.showElement ( 'newlist-dlg', 'listDelete', false );				
			}
		});
		
		$( '#listReload').click ( function (event) {
			if ( acceptEvent (event) ) {
				myComp.handleEvent ( {cmd:'loadAllDB'} );
			}
		});
		
		$( '#listShare' ).click ( function (event) {
			if ( acceptEvent (event) ) {
				var listObj = lookupList (currentListId);
				var shareDlgsComp = SA.getCompByIdOrName ( 'shareDialogs' );
				shareDlgsComp.showDialog ( listObj.id, listObj.title );
			}
		});
		
		$( '#listEdit' ).click ( function (event) {
			if ( acceptEvent (event) ) {
				var listObj = lookupList (currentListId);
				var elist = {};
				// Form (dialog) title
				elist.config = { title:'Edit List' };	
				elist.id = listObj.id;
				elist.listTitle = listObj.title;
				elist.listDesc = listObj.description;
				elist.listStyle = listObj.style;
				var listDlgsComp = SA.getCompByIdOrName ( 'listDialogs' );
				listDlgsComp.showElement ( 'newlist-dlg', 'listDelete', true );								
				listDlgsComp.showDialog ( 'newlist-dlg', elist );
			}								
		});
		
		$( '#tileEdit' ).click ( function (event) {
			if ( acceptEvent (event) ) {
				var itemsDlg = SA.lookupComponent ( 'itemsDialogs' );
				itemsDlg.performAction ( -1, 
						{ cmd: 'edit', config: {listId:currentListId, cardId:currentTileId } } );
			}
		});
	}
	
	// Accept event if return true
	var lastTimeStamp = 0;
	function acceptEvent ( event ) {
		var yes = event.timeStamp - lastTimeStamp > 1;
		lastTimeStamp =  event.timeStamp;
		return yes;
	}
};
