
/**
 * Button Action component
 */
App.ListsPage_1 = function ()
{	
	// specify if the component contains state or not
	this.stateful = true;
	
	// local vars
	var myId, myInst;
	var localCss;
	var numberOfLists
	
	//var lastPageId;
	var listsManager, currentList, currentTile, lastTileId, ltoolBar, appBanner;
	var demoList = undefined;
	
	// caching newly shared list and html
	var newlySharedLPanel = undefined;
	
	this.css = { items: 
		[
        /* Everything else */
        {name: '@media (min-width: 481px)', items: 
            [
            {name:'.my-gallery', value:'margin-left:0px;margin-right:0px;' }
            ]  
        },

        /* Mobile sizes */
        {name: '@media (max-width: 480px)', items: 
            [
            {name:'.my-gallery', value:'margin-left:0px;margin-right:0px;' }
            ]
        }		 
		]
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * flow: expect child lists of slides
	 */
	this.createUI = function ( flowList, allConfig )
	{
		// the id is set by the system (either compId or name)
		myId = this.compId;
		myInst = this;
		
		// create lists manager component
		listsManager = SA.createComponent ( 'listsManager', 'App.ListsManager');
		ltoolBar = SA.lookupComponent ( 'ltoolBar' );	
		appBanner = SA.lookupComponent ( 'appBanner' );
		
		localCss = SA.localCss ( this, 'my-gallery');
		
		var html = '';
		
		// non-intro allow lists to be shown on lists page
		if ( flowList.config.introMode != true ) {
			// save demo list
			demoList = flowList.demoList;
			ltoolBar.show ( true );
			if ( flowList.shareList ) {
				ltoolBar.setNewSharedList ( flowList.shareList );
			}
			html += createListsHtml ( myId, flowList, true );
		}
		// Intro Mode allows a simple demo list (not lists)
		else {
			demoList =  flowList.items[0];
			// hide toolbar
			ltoolBar.show ( false );
			if ( flowList.shareList ) {	// share or just demo
				html = getShareHtml ( myId, myInst, 0, flowList.shareList);
			}
			else {
				appBanner.showAbout ( false );			
				html = getDemoHtml (myId, myInst, localCss);
			}
		}
		return html;
	}
	
	/**
	 * Get demo page html
	 */
	this.demoPageHtml = function ()
	{
		return getDemoHtml (myId, myInst, localCss );
	}
	
	function getShareHtml (compId, compInst, tabIdx, list)
	{
		var header = '<div id="' + compId + '" class="' + localCss + '">';
		var tabsHtml = getTopTBHtml ( compId, compInst, tabIdx);
		var lhtml = html = listsManager.getListHtml ( compInst, list, false, false  );
		return header + tabsHtml + lhtml + '</div>';
	}
	
	function getDemoHtml (compId, compInst, localCss)
	{
		var header = '<div id="' + compId + '" class="' + localCss + '">';
		var lhtml = SA.createUI ( compId, demoList );
		return header + lhtml + '</div>';
	}
	
	function getTopTBHtml (compId, myComp, index )
	{
		var topTB = { name:'topTB', lc:'App.TopTB', config:{selIdx:index, listener:myComp} };
		var html = SA.createUI ( compId, topTB );
		return html;
	}
	
	// create html for all lists
	function createListsHtml ( compId, flowList, retHtml ) 
	{
		var listsPanelArray = getAllLists ( flowList );
		var header = '<div id="' + compId + '" class="' + localCss + '">';
		var content =  '';
		var part;
		
		for ( i=0; i<listsPanelArray.length; i++ ) {
			part = SA.createUI ( compId, listsPanelArray[i] );
			content += part;
		}
		var html = header + content + '</div>';
		
		if ( retHtml ) { 
			return html;
		}
		else {
			$ ( '#' + myId ).html ( html );
		}
	}
	
	// get all lists (yours and fiends)
	function getAllLists ( flowList )
	{
		numberOfLists = 0;
		var yourLists = getListsPanel ( flowList, 'My Lists', false);
		// remember number of lists
		numberOfLists = yourLists.items.length;
		
		var sharedLists = getListsPanel ( flowList, "Friends' Lists", true);
		
		// Newly shared list
		if ( !newlySharedLPanel ) {
			if ( flowList.shareList ) {
				var tile = descCardFromList(flowList.shareList, true) ;
				if ( tile ) {
					var newlyShared = { items: [ tile ] };
					newlySharedLPanel = getListsPanel ( newlyShared, '', true);
					if ( !newlySharedLPanel.items || newlySharedLPanel.items.length == 0)
						newlySharedLPanel = undefined;
				}
			}
		}
		
		if (newlySharedLPanel ) {
			sharedLists.items.splice (0, 0, 
					newlySharedLPanel.items[0], newlySharedLPanel.items[1] );
		}
		
		// if already have shared panel, return
		if ( sharedLists.items && sharedLists.items.length>0 )
			return [sharedLists, yourLists];
		else 
			return [yourLists];
	}
	
	// Gets all lists in one panel
	function getListsPanel ( flowList, listsName, shared )
	{
		var dispList = {lc:'App.CardPanel', 
			config: {title:listsName, 
			desc:'', id:-1, editMode:false}, items: 
				[
				{lc:'App.Card', config:{id:-1, listId: 100, ttitle: ' ', 
					stitle:'No lists found!', info: ' ' }}			                                         
				]
		};
		
		if ( flowList.items.length > 0 )
			dispList.items = [];
		
		var userAuth = SA.getUserAuth();

		for ( j=0; j<flowList.items.length; j++  ) {
			// single list card
			var ttlist = flowList.items[j];
			
			// filter out shared==true or false
			var mine = isMyObject ( userAuth, ttlist.userId, ttlist.fUserId );
			if ( (shared==true && mine==true) || 
					(shared==false && mine==false) )
				continue;
			
			// choose cover to list
			var uobj = App.util.pickListCover (ttlist);
			var desc = '';
			var viewList = '';
			if ( uobj.mediaUrl ) { 
				viewList = ' (view list here) ';
			}
			if ( ttlist.description ) {
				desc = ttlist.description;
			}
			desc += viewList;
			
			var card = {lc:'App.Card', config:{id:-1, listId: ttlist.id, ttitle: ttlist.title, 
				stitle: desc, imageUrl:uobj.imageUrl, mediaUrl:uobj.mediaUrl, 
				info: '', listener:myInst },
				shared:ttlist.shared, user:ttlist.user, maxComm:ttlist.maxComm };

			if ( ttlist.nshare == true ) {
				var tileTb = { name:'nshare-tb', lc:'App.TopTB', config:{listener:myInst, tileMode:true} };
				dispList.items.push (tileTb);
			}
			
			dispList.items.push ( card );
		}
		return dispList;
	}
	
	/**
	 * Return true if the user is not the owner of the object
	 */
	function isMyObject ( userAuth, userId, fUserId )
	{
		if ( fUserId ) {
			return false;
		}
		else if ( userId ) {
			return userAuth.respData.email == userId;
		}
		return true;
	}
	
	/**
	 * Action performed on a card
	 */
	this.actionPerformed = function ( event )
	{
		// Either: show intro command
		if ( event.cmd ) {
			if ( event.cmd=='showIntro' ) {
				appBanner.showNextPage ( "About Us", "About-us", demoHtml );
			}
			else if ( event.cmd=='shareAdd' ) {
				var data = {};
				var newShare = ltoolBar.getNewSharedList ();
				data.fId = newShare.id;
				data.fUserId = newShare.userId;
				data.title = 'Please wait..';
				SA.server.set ("/rs/ttlist", data, addShareSuccess);
			}
			else if ( event.cmd=='shareRem' ) {
				newlySharedLPanel = undefined;
				ltoolBar.setNewSharedList ( undefined );
				SA.fireEvent ( 'home', {cmd:'refresh', clearShare:true} );
			}
			return;			
		}
		
		// Or: show tiles or lists
		var config = event.config;		
		
		// show a Tile
		if ( config.listId  && config.id > 0 ) {
			// don't click tile twice
			if ( lastTileId != config.id ) { 
				var item = ltoolBar.findCard (config.listId , config.id );
				if (  item) {
					ltoolBar.setSelectedTileId ( config.id  );
					currentTile = item;
					var html = listsManager.getItemHtml ( myInst, item );
					appBanner.showNextPage ( item.title, config.id, html );	
				}
			}
		}
		// show a List
		else {
			var list = ltoolBar.getListById ( config.listId );
			if ( list ) {
				ltoolBar.setSelectedListId ( config.listId);
				currentList = list;
				var html = listsManager.getListHtml ( myInst, list );				
				appBanner.showNextPage ( list.title, config.listId, html, 
						list.shared==true || list.fId!=undefined);
			}
		}
	}
	
	/**
	 * Add share successful 
	 */
	function addShareSuccess ( respStr )
	{
		var respObj = jQuery.parseJSON( respStr );
		if ( respObj.status == 'OK') {

			var newShare = ltoolBar.getNewSharedList ();

			var addedList = respObj.respData;
			addedList.title = newShare.title;
			addedList.description = newShare.description;
			addedList.items = newShare.items;
			
			// add new list 
			newlySharedLPanel = undefined;
			ltoolBar.setNewSharedList ( undefined );			
			SA.fireEvent( 'ltoolBar', {cmd:'addList', data:respObj} );
		}
		else {
			//showMessage ( 'listMsg', respObj.message, false)			 
		}
	}
	
	/**
	 * Add new page to the end
	 */
	this.addList = function ( uniqueId, listObj )
	{
		var ltoolBar = SA.lookupComponent ( 'ltoolBar' );
		var allLists = ltoolBar.getAllListsArray ();
		var view = { items: allLists };
		createListsHtml ( myId, view, false );
		numberOfLists = allLists.length;
	}
	
	/**
	 * Remove a page (need to select previous page)
	 */
	this.delList = function ( listId )
	{
		var ltoolBar = SA.lookupComponent ( 'ltoolBar' );
		var allLists = ltoolBar.getAllListsArray ();
		var view = { items: allLists };
		createListsHtml ( myId, view, false );
		numberOfLists = allLists.length;
	}
	
	/**
	 * List changed: Reset content of a page with pageId and new html
	 */
	this.resetPage = function ( listData, tileId )
	{
		var ltoolBar = SA.lookupComponent ( 'ltoolBar' );
		var allLists = ltoolBar.getAllListsArray ();
		var view = { items: allLists };
		createListsHtml (myId,  view, false );
		
		var lmgr = SA.lookupComponent ( 'listsManager' );
		lmgr.notifyChanged ( listData.id, tileId );
		
		appBanner.resetContent ( listData.id, lmgr.getListHtml (this, listData) );
	}
	
	/*
	 * get list card desc from list
	 */ 
	function descCardFromList ( ttlist, newShare )
	{
		if  (!ttlist.items) { 
			return undefined;
		}
		var uobj = App.util.pickListCover (ttlist );
		var card = {lc:'App.Card', id:ttlist.id, title: ttlist.title, 
			description:ttlist.description, mediaId:uobj.mediaId, mediaUrl:uobj.mediaUrl, 
			info: '', listener:myInst, user:ttlist.user, userId:ttlist.userId, nshare:ttlist.nshare };
		return card;
	}
	
	/**
	 * Go to next page
	 */
	this.nextPage = function ()
	{
		$('#'+myId).carousel( 'next' );
	}
	
	/**
	 * Goto prev page
	 */
	this.prevPage = function ()
	{
		$('#'+myId).carousel( 'prev' );
	}
	
	/**
	 * Show the specific page by idx
	 */
	this.showPage = function ( idx )
	{
		if ( idx<0 || idx >= numberOfLists) {
			idx = numberOfLists -1;
		}
		// TODO: Show page
	}
	
	/**
	 * Set a carousel listener
	 */
	this.setListener = function ( l ) 
	{
		listener = l;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
	}
}
