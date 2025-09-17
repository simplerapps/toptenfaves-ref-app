/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.Home = function ()
{
	/**
	 * My flow object for the home page is declared to define the view. It is using javascript array of 
	 * objects that can contain other array of objects, etc.
	 * 
	 */
	this.flow = { items: 
		[
		{html:'div', id:'lists-content' },

		// load all lists dialogs 
		{name:'listDialogs', lc:'App.ListDialogs'  },
		
		// load all items UI dialogs
		{name:'itemsDialogs', lc:'App.ItemsDialogs' },
		
		// load all share dialogs
		{name:'shareDialogs', lc:'App.ShareDialogs' },
		
		// load feedback dialogs
		{name:'feedbackDialogs', lc:'App.Feedback' }				
		]
	};
	
	var lastShowAllEvent = undefined;
	var myInst = undefined;
	var myId = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 *  
	 */
	this.createUI = function ( parentList, config )
	{
		myInst = this;
		myId = this.compId;
		var html = SA.listCreateUI ( this.compId, this.flow, config, true );
		html += SA.createHtmlEnd (this.flow);
		return html;
	}
		
	/**
	 * Called to handle events specific for this component
	 */
	this.handleEvent = function ( event )
	{
		// refresh / redraw home component
		if ( event.cmd == 'refresh' ) {
			
			if ( event.clearShare == true ) {
				lastShowAllEvent.share = undefined;
			}
			myInst.handleEvent ( lastShowAllEvent );
		}
		// load all lists
		else if ( event.cmd == 'showAll' ) {
			// do not allow to do this many times
			if ( !allowLoadAllEvent(event) ) {
	        	// stop spinner
	    		App.util.stopWorking();
				return;
			}
			lastShowAllEvent = event;
			
			var listsView =  { name:'listsPage', lc:'App.ListsPage_1', config:{}, items:[] };
			var allLists = event.data;	
			if ( allLists ) {	// Logged in: Real data 
				listsView.items = allLists;
				listsView.demoList = getDemoView (); 
			}
			else {	// Not logged in: Demo page 
				var lview = getDemoView (); 
				listsView.items.push (lview);
				listsView.config.introMode = true;
			}
			// if share passed, add to listView
			if ( event.share ) {
				listsView.shareList = event.share.list ;					
			}
			
			var html = SA.createUI ( this.compId, listsView, null, true );
			$( '#lists-content' ).html ( html );
			
			// add me as listsPage listener
			var comp = SA.lookupComponent ( 'listsPage' );
			comp.setListener ( this );
			
        	// stop spinner
    		App.util.stopWorking();
		}
		// refresh and redraw a list
		else if ( event.cmd == 'refreshList' ) {
			var listData = event.data;
			var listsPage = SA.lookupComponent ( 'listsPage');
			listsPage.resetPage ( listData, event.tileId, event.deleted );
		}
		// show single list 
		else if ( event.cmd == 'show' ) {
			var idx = event.idx;
			var listsPage = SA.lookupComponent ( 'listsPage');
			listsPage.showPage ( idx );
		}
	}
	
	/**
	 * Adds new list to this home page. This is done via method call because other rendering might rely on it
	 * so it needs to be done synchronously 
	 */
	this.addNewList = function ( newList ) 
	{
		var listsPage = SA.lookupComponent ( 'listsPage');
		listsPage.addList ( newList.id, newList );
	}
	
	/**
	 * Delete the list 
	 */
	this.deleteList = function ( delList )
	{
		var listsPage = SA.lookupComponent ( 'listsPage');
		listsPage.delList ( delList.id );
	}
	
	// get single list object (or html)
	// !!!IMPORTANT SHOULD BE REMOVED (try use the methods in ListsPage)
	function getListView ( idx, listObj, retHtml )
	{
		var cardsPanel = {lc:'App.CardPanel', 
				config:{title:listObj.title, desc:listObj.description, id:listObj.id}, items: [] };
		
		// add all cards comps to cardsPanel
		getCardsData (cardsPanel, listObj);
		
		if ( !retHtml ) {
			return cardsPanel;
		}
		else {
			var html = SA.listCreateUI ( this.compId, cardsPanel, null, true );
			return html;
		}
	}
	
	// Gets a demo list view
	function getDemoView ( shareObj )
	{
		var compName = 'App.CardPanel';
		//if ( $(window).width() < 500 && App.util.isMobileApp() ) {
			//compName = 'App.ImagesPanel';
		//}
		
		// APP LINK: https://itunes.apple.com/us/app/share10/id1053770041?mt=8
		var appLink = '';
		if ( !App.util.isMobileApp() ) {
			appLink = '<p><b>NOTE: The mobile app "Share10" is available for <a href="https://itunes.apple.com/us/app/share10/id1053770041?mt=8">download here.</a></b></p>';
		}

		var cards = {lc:compName, config: {title:'<b>"Share 10"</b> is an app for sharing lists of up to ten important things to you in any category. <b>"Share 10" is also called S10.</b>' +
			appLink, titleStyle:'color:#808080;margin-bottom:10px;font-size:140%', desc:'', id:100, editMode:false }, items: 
			[
			{lc:'App.Card', config:{id:-1, listId: 100, ttitle: '', 
				stitle:'', imageUrl:'app/res/img/share10-pic.jpg', info: ' ' }},
				
			{lc:'App.Card', config:{id:-1, listId: 100, ttitle: 'Some examples..', 
				stitle:'Best shaved ice places, favorite lunch spots, top bargains, '+ 
					'worse world leaders, best soccer videos, list of interview questions, etc.. '+
				'<br><br>It is really whatever you want it to be! ', 
				imageUrl:'', info: ' ' }},
				
			{lc:'App.Card', config:{id:-1, listId: 100, ttitle: 'Share your list with anyone you like!', 
				stitle:'', info: '' }},

			{lc:'App.Card', config:{id:-1, listId: 100, ttitle: 'Think high quality content!', 
				stitle:'', info: '' }},
								
			{lc:'App.Card', style:'background-color:#A8A8A8;color:#F9F9F9', config:{id:-1, listId: 100, 
				ttitle: '<b>About This App</b>',   
				info:'  ', 
				stitle: '<br>"Share 10" is an example of a "Universal Application" that is made to work on many popular mobile devices and browsers.'+ 
				'<p>This entire app is developed with the Simpler Apps Framework <a href="http://simpler-apps.com" target="_blank">(simpler-apps.com)</a>. ' +
				'It is constructed with about 20 components called Adaptive Web Components (AMCs).' +
				'<p style="font-size:80%;color:#E0E0E0;font-family:monospace;">'+
				'Copyright (c) 2015-2016 HQ APPS Consulting. All rights reserved.</p>' +
				'<a href="app/res/text/EULA.html" target="_blank">End User License Agreement</a>'  
			}}
			]
		};
		return cards;
	}
	
	// get simulated cards html
	function getCardsData ( cardsPanel, listObj ) 
	{
		var items = listObj.items;
		if ( items && items.length > 0 ) {
			var i = 0;
			for (i=0; i<items.length; i++ ) {
				var card = items [i];
				cardsPanel.items.push ( {lc:'App.Card', 
					config:{
						id: card.id,
						listId: card.listId,
						ttitle: card.title, 
						stitle:card.stitle, 
						info: card.info,
						lname: card.lname,
						link: card.link,
						imageUrl: SA.server.getMediaUrl(card.mediaId)
					}} );
			}
		}
	}
	
	// Slide page right or left
	function slidePage ( slideRight ) 
	{
		var comp = SA.lookupComponent ( 'listsPage' );  
		if ( slideRight )
			comp.nextPage ();
		else 
			comp.prevPage ();
	}
	
	/**
	 * After compoent is loaded in page  
	 */
	this.postLoad = function ()
	{		
	}
	
	var lastEventTime = 0;
	function getUniqueEvent ( event ) 
	{
		if ( lastEventTime < event.timeStamp ) {
			lastEventTime = event.timeStamp;
			return event;
		}
	}
	
	// TODO: We need to add timestamp to every event
	var lastLoadAllTime = 0;
	function allowLoadAllEvent ( event )
	{
		var now = new Date().getTime();
		var allow = (now - lastLoadAllTime) > 600;
		lastLoadAllTime = now;
		return allow;
	}
}
