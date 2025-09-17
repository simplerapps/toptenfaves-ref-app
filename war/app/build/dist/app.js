// Create an instance of the application
App = {};

/**
 * Object for main application
 */
App.MainApp = function ()
{
	var initialized = false;
	var compId;
	var lastTimeStamp = 0;
	
    // Application Global Styles
    this.css =  { items:
    	[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.form-group', value:'margin-bottom:15px'},				 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.form-group', value:'margin-bottom:8px'},				 
			]
		}    	 
    	]
    };
    	
    /**
     * Flow section of the main app  (very similar to the HTML div tags of main app structure). 
     * 
     * The flow list definition defines the Model of the application. The List and Atom components define the view (UI) of the application
	 */
    var flowObj = { items: 
    	[
    	// load loading component first
    	{name:'loading', ac:'App.Loading'},
    	
    	// Upper section Banner and toolbar
    	{html:'div', style:"width:100%;z-index:500;position:fixed;", items:
    		[
	    	{name:'appBanner', lc:'App.AppBannerS',
	    		config: { 'imageUrl':'app/res/img/share10.png' }, items: 
	    			[
	    			{name:'home-action', ac:'App.Button', ilist:'home', tlist:'frontPage',
	    				cmd:'view', label:'Home' },
	    			{name:'login-action', ac:'App.Button', ilist:'login', tlist:'frontPage',
	    				cmd:'view', label:'Sign In' }
	    			]
	    	},
	    	
	    	// toolbar
	    	{name:'ltoolBar', lc:'App.LToolBar' },
    		]
    	},
    	
    	// Render target (Old way. New way will store into hidden divs specific to components)
    	{name:'pages', items: 
    		[
  	    	{name:'home', lc:'App.Home', config:{hidden:true} },
  	    	{name:'login', lc:'App.Login', config:{hidden:true} }
    		]
    	},
    	
    	// Actual page content
    	{html:'div', class:'container', style:'padding-left:0px; padding-right:0px;padding-top:95px;', 
    		items:
    		[
	 		{name:'frontPage', stylex:'' },
	   		{name:'midPage', stylex:'' },   
	   		{name:'backPage', stylex:'' },
	   		{name:'lastPage', stylex:'' }
    		]
    	}
    	]
    };
    
    // do initial server settings here
    //SA.setAppConfig ( {appName:'Share10app', hostName:'https://ea3-dot-toptenfaves.appspot.com'} );
    SA.setAppConfig ( {appName:'Share10app', hostName:'http://localhost:8888'} );
    
    // change links behavior in the SPA
    $( document ).on(  
	    "click",
	    "a",
	    function( event ) {
	    	
	    	// if event has target and mobile, show in sep. window
	    	if ( event.target.target &&  event.target.target.length > 0 ) {
	    		
	    		if ( SA.utils.isMobileDevice() ) {
	    			
	    			console.debug ('intercept click' );

			        // Stop the default behavior of the browser, which
			        // is to change the URL of the page.
			        event.preventDefault();
		
			        
			        // Manually change the location of the page to stay in
			        // "Standalone" mode and change the URL at the same time.
			        //location.href = $( event.target ).attr( "href" );
			        
			        // hack to close login dialog (if open) when showing a URL in page
			        var loginComp = SA.lookupComponent ('login');
			        if ( loginComp ) {
			        	loginComp.closeDialogs();
			        }
			        
			        // link URL in frame
			        var comp = SA.createComponent ( 'ttf-frame', 'App.LinkFrame' );
			        var html = comp.createUI ('', {srcUrl:event.target.href} );
			        
			        var banner = SA.lookupComponent ( "appBanner" );
			        banner.showNextPage ( event.target.innerText, 'link-page', html, true, true );
	    		}
	    	}
	    }
	);
    
	/**
	 * This method creates the UI based  
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		compId = this.compId;
		var html = SA.createUI ( this.compId, flowObj );
		
		//check reset landing url
		SA.fireEvent( 'ltoolBar', {cmd:'checkResetUrl'} );
		return html;
	}
	
	this.postLoad = function ()
	{
	}
}

// create app main instance for  
App.main = new App.MainApp();


var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('page', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('page');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	/*
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
        */
    }
};

app.initialize();
;/**
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
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 * 
 *  1- Its "css" to define local css classes
 *  2- Its "flow" to define the view declaratively    
 *  3- Other Imperative code to control the behavior and action of the page
 *  
 */
App.Login = function ()
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
	
    var compId = undefined;
    var currentDlgName = 'login-dlg';
    var currentDlg = undefined;
    var lastErrDivId = undefined;

	/**
	 * Login flow list
	 */
	this.flow = { items: 
		[
		 {name:'login-dlg', lc:'App.Dialog', items:
			 [
			 {name:'login-form', lc:'App.FormHandler', 
				 	config:{title:'Please Sign In', listener:this}, items: 
				 [
				 {name:'lgMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},
				 {name:'lgEmail', ac:'App.TextField', info:'Email address', required:true, pattern:'email' },
				 //{html:'div', style:'height:4px;'},
				 {name:'lgPassword', ac:'App.TextField', info:'Password', required:true, pattern:'text',
					 config:{type:'password'}},

				 {html:'div', style:'height:10px;'},
				  
				 {cmd:'cmdLogin', ac:'App.Button', label:'Sign In', config:{theme:'color'} },
				 {cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:25px;'},

				 {cmd:'cmdShowCreate', ac:'App.Button', label:'Create new account', 
					 config:{type:'link'}, style:'float:left;font-size:110%;margin-bottom:10px;' },
				 {cmd:'cmdShowForgot', ac:'App.Button', label:'Forgot password?', 
				     config:{type:'link'}, style:'float:right;font-size:110%;margin-bottom:10px;' },
				     
			 	 ]}
			]
		},
		{name:'forgot-pass-dlg', label:'Forgot My Password', lc:'App.Dialog', items:
			 [
			 {name:'forgot-pass-form', lc:'App.FormHandler', 
				 	config:{title:'I Forgot my Password', listener:this}, items: 
				 [
				 {name:'fgMsg', ac:'App.Message' },
				 {html:'div', style:'height:15px;'},
				  
				 {html:'p', value:'Enter your registered email address, and we will email you a reset password link:'},
				 {name:'fgEmail', ac:'App.TextField', info:'Email address',
					 required:true, pattern:'email'},				 
					 {html:'div', style:'height:10px;'},
					 
				 {cmd:'cmdEmailPass', ac:'App.Button', label:'Send'},
				 {cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				 {html:'div', style:'height:25px;'}
				 ]
			 }
			 ]
		},
		{name:'create-acct-dlg', label:'Create New Account', lc:'App.Dialog', items:
			 [
			 {name:'create-acct-form', lc:'App.FormHandler', 
				 	config:{title:'Create New Account', listener:this}, items: 
				 [
				 {name:'crMsg', ac:'App.Message' },				  
				 {name:'crMsg', html:'span', class:'errmsg', value:'' },
				 {html:'div', style:'height:12px;'},
				  
				 {name:'crName', ac:'App.TextField', info:'Name: First Last ', 
					 required:true, pattern:'text' },
				/*
				 {name:'crLastName', ac:'App.TextField', info:'Last Name',
					 required:false, pattern:'text' },
				*/

				 {name:'crEmail', ac:'App.TextField', info:'Email address',
					 required:true, pattern:'email' },
				 
				 {name:'crPassword', ac:'App.TextField', info:'Password', config:{type:'password'},
						 required:true, pattern:'text' },
				/*
				 {name:'crPassword2', ac:'App.TextField', info:'Re-type Password', config:{type:'password'},
					 required:true, pattern:'text' },
				*/
					 
				 {html:'div', style:'height:10px;'},
				 {html:'div', style:'font-size:90%;', value:'By clicking "Create Account" below, you agree to ' + 
					 '<a href="app/res/text/EULA.html" target="_blank">HQ APPS Consulting User Agreement</a>'},
				 {html:'div', style:'height:10px;'},

				 {cmd:'cmdCreateAcct', ac:'App.Button', label:'Create Account'},
				 {cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				 {html:'div', style:'height:12px;'},
				 
				 {cmd:'cmdShowLogin', ac:'App.Button', label:'I already have an account', 
					 style:'font-size:120%', config:{type:'link'} },
				 {html:'div', style:'height:12px;'}
				 ]
			 }
			 ]
		}
		]
	};

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		// if logged in, log out
		if ( SA.getUserAuth () ) {
			// log out
			SA.deleteUserAuth();
			
			// fire login event to app banner
			SA.events.fireEvent("appBanner", {cmd:'postLogin'} );
			
			return '';
		}
		else { 
			// Show login dialog (i.e. dialogs, etc)
			compId = this.compId;
			
			// init state
		    currentDlgName = 'login-dlg';
		    currentDlg = undefined;
		    
			var html =  _createUI ( compId, this.flow, config );

			// show login dialog 
			var userName = SA.getAppData ( 'userName' );
			showDialog ( currentDlgName, userName );
			
			return html;
		}
	}	
	
	/**
	 * Create actual UI
	 */
	function _createUI ( compId, flowlist, config )
	{
		var html = '';
		html += SA.listCreateUI ( this.compId, flowlist, config, true );
		return html;
	}
	
	/**
	 * If dialogs are open close them
	 */
	this.closeDialogs = function ()
	{
		if (currentDlg) {
			currentDlg.showDialog (false);
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdShowCreate' ) {
			showDialog ( 'create-acct-dlg' );			
		}
		else if ( actionAtom.cmd == 'cmdShowForgot' ) {
			var userName = SA.getAppData ( 'userName' );
			showDialog ( 'forgot-pass-dlg', userName );	
		}
		else if ( actionAtom.cmd == 'cmdShowLogin' ) {
			showDialog ( 'login-dlg' );			
		}
		else if ( actionAtom.cmd == 'cmdCancel' ) {
			currentDlg.showDialog (false);
		}
		else { 
			// Login command
			if ( actionAtom.cmd == 'cmdLogin' ) {
				lastErrDivId = 'lgMsg';
				if ( validate ( 'lgMsg', atomList, dataObj )  ) {
					var data = {};
					data.email = dataObj.lgEmail;
					data.authToken = dataObj.lgPassword;
					currentDlg.setWaiting (true);
					SA.server.get("/rs/user", data, postSuccess);
				}
			}
			// Create Account command			
			else if ( actionAtom.cmd == 'cmdCreateAcct' ) {
				lastErrDivId = 'crMsg';				
				if ( validate ( 'crMsg', atomList, dataObj ) ) {
					var data = {};
					data.firstName = getName (dataObj.crName, true);
					data.lastName = getName (dataObj.crName, false);
					data.email = dataObj.crEmail;
					data.authToken = dataObj.crPassword;
					currentDlg.setWaiting (true);
					SA.server.set ("/rs/user", data, postSuccess);
				}		
			}
			// Change password command						
			else if ( actionAtom.cmd == 'cmdEmailPass' ) {
				lastErrDivId = 'fgMsg';
				if ( validate ( 'fgMsg', atomList, dataObj ) ) {
					var data = {};
					data.msg = "EMAIL-ME-RESET-PASSWORD";
					data.userId = dataObj.fgEmail;
					currentDlg.setWaiting (true);
					SA.server.set ("/rs/feedback", data, resetResult);					
				}
			}
		}
	}
	
	/**
	 * Parse name from First Last name string (cap first letter of name)
	 */
	function getName ( name, getFirst )
	{
		var idx = name.indexOf ( ' ' );
		var ret = name;
		if ( getFirst == true ) {
			if (idx > 0 )  {
				ret = name.substring (0, idx);
			}
		}
		else {
			ret = '';
			if ( idx > 0 ) { 
				ret = name.substring (idx);
			}
		}
		ret = ret.trim ();
		if ( ret.length > 0 ) {
			return ret[0].toUpperCase() + ret.substr(1);
		}
		return ret;
	}
	
	/**
	 * Validate login form
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if (data.crPassword && data.crPassword.length<6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );			
			return false;
		}
		else {
			$( '#'+divId ).html ( "" );
			ret = true;
		}
		return true;
	}
	
	function showDialog ( newDlgName, newEmail )
	{
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			currentDlg.showDialog (false);
		}
		currentDlgName = newDlgName;
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			if ( !newEmail || newEmail.length==0 )
				newEmail = '';
			currentDlg.updateForm ({lgMsg:'', lgEmail:newEmail, fgEmail:newEmail, lgPassword:''});
			currentDlg.showDialog (true);
		}
	}
	
	function resetResult ( respStr )
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false);
	}
	
	/**
	 * Called from outside process to handle login success
	 */
	this.successLogin = function ( respStr )
	{
		postSuccess ( respStr )
	}
	
	/*
	 * postSuccess
	 */
	function postSuccess ( respStr )
	{
		//alert(xhr.getResponseHeader("Set-Cookie"));
		
		var respObj = jQuery.parseJSON( respStr );
		
		// login success
		if ( respObj.status == 'OK') {
			showMessage ( lastErrDivId, "Successful", true);
			
			// set auth to user info
			SA.setUserAuth ( respObj );
			
			// set username in app data
			SA.setAppData ( 'userName', respObj.respData.email );
			
			// fire login event to appBanner and ltoolBar (post login will allow loading content)
			SA.fireEvent('appBanner', {cmd:'postLogin'} );
			
			// fire load all lists message after login
			//SA.fireEvent ('ltoolBar', {cmd:'loadAllDB'} );

			// close current dialog
			if ( currentDlg)
				currentDlg.showDialog (false);
		}
		else {
			if ( respObj.error == 'USERNAME_EXISTS' ) {
				showMessage ( lastErrDivId, "Username already exists!", false);
			}
			else {
				showMessage ( lastErrDivId, "Authentication failure!", false);
			}
			currentDlg.setWaiting (false);
				
		}
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
}

;
/**
 * Display card of information
 */
App.util = function ()
{
	/**
	 * Open url in new window
	 */
	this.openUrlInWindow = function ( url )
	{
		window.open(url,'_system');
	}
	
	/**
	 * Return true if URL is TTF image URL
	 */
	this.isImageUrl = function ( url )
	{
		return url.indexOf ( '/media/' ) > 0;
	}
	
	/**
	 * Choose suitable media list cover, return object {mediaId, imageUrl, mediaUrl);
	 */
	this.pickListCover = function ( ttlist )
	{
		var obj = {};
		// get from children
		if ( ttlist.items && ttlist.items.length>0 ) {
			for (i=0; i<ttlist.items.length; i++ ) {
				if ( ttlist.items[i].mediaUrl ) {
					obj.mediaUrl = ttlist.items[i].mediaUrl;
					break; 
				}
			}
			for (i=0; i<ttlist.items.length; i++ ) {
				if ( ttlist.items[i].mediaId ) {
					obj.mediaId = ttlist.items[i].mediaId;
					break; 
				}
			}
		}
		// or from the parent
		else {
			obj.mediaId = ttlist.mediaId;
			obj.mediaUrl = ttlist.mediaUrl;
		}
		if ( obj.mediaId ) { 
			obj.imageUrl = SA.server.getMediaUrl (obj.mediaId);
		}
		return obj;
	}

	/**
	 * Gets YouTube embed-able html 
	 */
	this.getYouTubeHtml = function  ( videoUrl )
	{
		var idx = videoUrl.lastIndexOf ( '=' );
		if ( idx < 0 ) {
			idx = videoUrl.lastIndexOf ( '/' );
		}
		var vidId = videoUrl.substring ( idx+1 );
		
		var height = '350';
		if ( $( window ).width() < 500 ) {
			height = '250';
		}
		var embedHtml = '<iframe width="100%" height="' + height + '" src="https://www.youtube.com/embed/' + 
			vidId + '" frameborder="0" allowfullscreen></iframe>';
		return embedHtml;
	}
	
	/**
	 * Get friendly time
	 */
	this.getFriendlyTime = function ( timeMs )
	{
		var timeNowMs = new Date().getTime();
		var diffSec = (timeNowMs - timeMs) / 1000;
		if ( diffSec < 60 ) {
			return Math.round(diffSec) + ' seconds ago';
		}
		else if ( diffSec < 3600 ) {
			return Math.round(diffSec/60) + ' minutes ago';
		}
		else if ( diffSec < 86400 ) {
			return Math.round(diffSec/3600) + ' hours ago';
		}
		else if ( diffSec < 604800 ) {
			return Math.round(diffSec/86400) + ' days ago';
		}
		else {
			return Math.round(diffSec/604800) + ' weeks ago';
		}
	}
	
	/**
	 * Gets user name info for logged in user
	 */
	this.getMyNameInfo = function ()
	{
		var auth = SA.getUserAuth ();
		var name = '';
		
		if (auth ) {
			auth = auth.respData;
			if (auth.firstName) {
				name += auth.firstName;
				if ( auth.lastName ) {
					name += ' ' + auth.lastName;
				}
			}
			if ( name.length < 3 ) {
				var idx = auth.email.indexOf ('@');
				if (idx > 0 ) {
					name = auth.email.stubstring (0, idx);
				}
			}
		}
		return name;
	}
	
	/**
	 * Return true if running as mobile app
	 */
	this.isMobileApp = function ()
	{
		var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
		if ( app ) {
			return true;
		} else {
		    return false;
		}  
	}	
	
	/**
	 * Strip tags from input string
	 */
	this.safeHtml = function (input) 
	{
		var strippedText = undefined;
		if ( input ) {
			strippedText = input.replace(/<\/?[^>]+(>|$)/g, "");
		}
		return strippedText;
	}
	
	/**
	 * Start loading 
	 */
	this.startWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.start();
	}
	
	/**
	 * Start loading 
	 */
	this.stopWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.stop();
	}	
}
App.util = new App.util();
;/**

 * BannertHandler Object  
 */
App.AppBannerS = function ()
{
	// if stateful then a new component instance is created every time it is declared in a list. 
	// Otherwise (default == false) one component inatance is used for all lists regardless of how many times
	// it is declared. If you use instance variable (or state) then stateful should set == true
	this.stateful = true;
	
	// stylesheets for this component
	this.css = { items: 
		[
        /* Everything else */
        {name: '@media (min-width: 481px)', items: 
            [
            {name:'.banner', value:'height:70px;padding-left:10px;' },				 
            {name:'.logo', value:'float:left;' },				 
            {name:'.login', value:'color:#C8C8C8;font-size:110%;padding-left:20px;padding-right:2px;padding-top:32px;float:right;cursor:pointer;'},
            {name:'.about', value:'color:silver;font-size:110%;padding-left:20px;padding-right:2px;padding-top:32px;float:right;cursor:pointer;'},            
            {name:'.title', value:'color:#D0D0D0;font-size:150%;padding-left:0px;padding-top:25px;'},  
            {name:'.brand', value:'float:left;padding-top:20px;padding-left:0px;padding-bottom:10px;width:120px;'},
            {name:'.back', value:'float:left;padding-top:20px;padding-left:0px;padding-bottom:10px;width:60px;'}
            ]
        },

        /* Mobile sizes */
        {name: '@media (max-width: 480px)', items: 
            [
            {name:'.banner', value:'height:70px;padding-left:5px;' },				 
            {name:'.logo', value:'float:left;' },				 				 
            {name:'.login', value:'color:#C8C8C8;padding-top:39px;padding-left:0px;padding-right:0px;padding-bottom:0px;float:right;cursor:pointer;'},
            {name:'.about', value:'color:silver;padding-top:39px;padding-left:0px;padding-right:15px;padding-bottom:0px;float:right;cursor:pointer;'},
            {name:'.title', value:'color:#D0D0D0;font-size:115%;padding-left:0px;padding-top:30px;'},  
            {name:'.brand', value:'float:left;padding-left:4px;padding-top:28px;width:110px;padding-bottom:0px'},
            {name:'.back', value:'float:left;padding-top:25px;padding-left:12px;padding-bottom:10px;width:50px;'}
            ]
        }
		]
	};
	
	// passed actions map object keyed by action name 
	var actionsMap, actNameLogo, actNameYou ;
	
	// label sign in and sign out
	var signInLabel, signOutLabel, myInstance;
	var curTitle, imageUrl, backImgUrl;
	
	// local css
	var lbrand, llogin, lbanner, llogo, ltitle, lback, labout, rload;
	var myId;
	
	// nextPage values
	var initialLoad = false;

	// page level: 0=home, 1=list, 2=item
	var pageLevel = 0;
	var titleTwo;
	var homeId, backId;
	var aboutId;
	
	// pages array to keep info about pages such as div name, etc.  
	var pages = 
		[
	    {name:'frontPage', ypos:0, tbshown:true },
	    {name:'midPage', ypos:0, tbshown:true },
	    {name:'backPage', ypos:0, tbshown:true },
	    {name:'lastPage', ypos:0, tbshown:true }
		];
	
	// define login atom onj
	var loginAtomObj = {name:'', ac:'App.LoginComp', config:{label:'Sign In', loggedIn:false} };
	
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
		// Do some validation here
		imageUrl = SA.getConfigValue ( parentList, 'imageUrl');
		if ( !imageUrl )
			return;
		
		backImgUrl = 'app/res/img/backicon-wt.png';
		
		myId = this.id;
		myInstance = this;
		
		// local css cls
		llogin = SA.localCss (this, 'login');	
		lbanner= SA.localCss (this, 'banner');
		llogo  = SA.localCss (this, 'logo' );
		ltitle = SA.localCss (this, 'title' );
		lbrand = SA.localCss (this, 'brand');
		lback  = SA.localCss (this, 'back' );
		olayCss= SA.localCss (this, 'overlay' );
		labout = SA.localCss (this, 'about' );
		rload = SA.localCss (this, 'reload');
		
		// get all sub-actions list
		actionsList = parentList.items;
		if (actionsList.length < 2 ) {
			alert ( "Need at least 2 action atoms for AppBanner to load ");
			return;
		}
		actNameLogo = actionsList [0].name;
		actNameYou = actionsList [1].name;
		
		actionsMap = {};
		actionsMap [actNameLogo] =  actionsList [0];
		actionsMap [actNameYou] =  actionsList [1];

		// get label
		if ( actionsList [1].label ) {
			var label = actionsList [1].label;
			loginAtomObj.config.label = label;
		}
		loginAtomObj.name = actNameYou;	// set login comp name (to == passed value)
		
		homeId = 'home-' + myId;
		backId = 'back-' + myId;
		
		var html = 
		'<div style="background-color:rgba(77, 128, 102, 0.95);">' +
			'<div id="' + myId + '" class="container ' + lbanner + '">' +
				'<div id="' + homeId + '">' + 
					getHomeBanner() +
				'</div>' + 
				'<div id="' + backId + '">' + 
					getBackBanner() +
				'</div>' + 				
		'</div></div>';	
		
		// fire event to be fired after dom initialized
		//SA.events.fireEvent(actNameLogo, 'click');
		
		return html;
	}
	
	/**
	 * Show / hide about 
	 */
	this.showAbout = function ( show )
	{
		if ( show )
			$( '#about-us' ).show();
		else 
			$( '#about-us' ).hide ();
	}
	
	/**
	 * Renders banner and update the DOM
	 */
	function getHomeBanner ()
	{
		// get login html
		var loginHtml = getLoginHtml ( loginAtomObj );
		var titleId = homeId + '-title';
		var leftId = homeId + '-left';
			
		var yourMenu = '<div id="' + actNameYou + '" class="' + llogin + '" >' + loginHtml + '</div>';
		var aboutMenu = '<div id="about-us" class="' + labout + '" >About</div>';			
		
		//var logoButton =  '<img id="' + leftId + '" src="' + imageUrl + '" class="' + lbrand +'" />';
		logoButton = 
		'<div id="' + leftId + '" >' + 
			'<img src="' + imageUrl + '" class="' + lbrand +'" />' +
			//'<img src="res/img/reload-wt.png" class="' + rload +'" />' +
		'</div>';
		
		// create begin html markup
		var html = 
		'<div class="row" >' + 
			'<div class="col-md-8 col-md-offset-2" >'+
				'<div id="toolbar" class="" >' +
				
			    	// logo
					'<div id="logo" class="' + llogo + '" >' + 
						'<a id="' + actNameLogo + '" + class="" href="#" >'+
							logoButton + 
						'</a>' +
					'</div>' +
					
					// your menu
					yourMenu +
					
					// about menu
					aboutMenu +
					
				'</div>' + 
			'</div>' + 
		'</div>' ; 
		
		return html;
	}
	
	/**
	 * Renders banner and update the DOM
	 */
	function getBackBanner ()
	{
		// get login html
		var loginHtml = getLoginHtml ( loginAtomObj );
		var titleId = backId + '-title';
		var leftId = backId + '-left';
			
		var yourMenu = '<div id="' + actNameYou + '" class="' + llogin + '" >' + loginHtml + '</div>';	
		var aboutMenu = '<div id="' + actNameYou + '" class="' + llogin + '" >' + loginHtml + '</div>';
		
		var titleLine = '<div id="' + titleId + '" class="' + ltitle + '"></div>';
		var logoButton =  '<img id="' + leftId + '" src="' + backImgUrl + '" class="' + lback +'" />';
		
		// create begin html markup
		var html = 
		'<div class="row" >' + 
			'<div class="col-md-8 col-md-offset-2" >'+
				'<div id="toolbar" class="" >' +
				
			    	// logo
					'<div id="logo" class="' + llogo + '" >' + 
						'<a id="' + actNameLogo + '" + class="" href="#" >'+
							logoButton + 
						'</a>' +
					'</div>' +
					
					// title line
					titleLine + 
					
				'</div>' + 
			'</div>' + 
		'</div>' ; 
		
		return html;
	}	
			
	/**
	 * Call to handle event 
	 */
	this.handleEvent = function ( event )
	{
		// request to show in login mode (user can be logged in or out at this point)
		// If logged out the html will say Sign In 
		if ( event.cmd == 'postLogin' ) {
			var loginHtml = getLoginHtml ( loginAtomObj );
			$( '#'+loginAtomObj.name ).html ( loginHtml );
						
			// fire event for login / logout (event not used yet)
			SA.fireEvent( 'ltoolBar', {cmd:'login'} );
			
			// if logged in, show about link
			if ( SA.getUserAuth () ) {
				myInstance.showAbout ( true );
			}
			else {
				myInstance.showAbout ( false );
			}
		}
	}
	
	/**
	 * Resets html content
	 */
	this.resetContent = function ( dataId, newHtml )
	{
		for ( i=0; i<pages.length; i++ ) {
			if ( dataId == pages [i].dataId ) {
				var $div = $( '#' + pages [i].name );
				$div.html ( newHtml );
			}
		}
	}
	
	/**
	 * Show previous page
	 */
	this.showPrevious = function ()
	{
		$( '#' + backId + '-left' ).click ();
	}
	
	/**
	 * Trim title to smaller number of chars
	 */
	function setTitle ( title )
	{
		if ( !title ) return;
		var ntitle = title;
		if ( title.length > 40 ) {
			var idx = title.lastIndexOf ( ' ' );
			if ( idx > 0 ) {
				title = title.substring (0, idx);
			}
			ntitle = title + ' ..'
		}
		
		var screenWidth = $( window ).width();
		
		var lenPix = (ntitle.length * 9);
		var leftPadding = (screenWidth/2) - (lenPix/2);
		
		// adjust left img position
		var logoXpos = $('#'+ backId + '-left').offset().left;
		logoXpos -= 5; 
		if ( logoXpos<0 ) logoXpos = 0;
		
		leftPadding -= logoXpos;
		
		var sel = $('#' + backId + '-title' );

		//sel.css ( "width", width );
		sel.css ( "margin-left", leftPadding + 4);
		sel.html ( ntitle );
	}
	
	/**
	 * Sets the left banner image from Nav to back
	 */
	function refreshBanner () 
	{
		if ( pageLevel  > 0 ) {
			$('#'+homeId).hide();
			$('#'+backId).show();				
		}
		else {
			$('#'+homeId).show();
			$('#'+backId).hide();			
		}
	}

	/**
	 * Get html for Login component
	 */
	function getLoginHtml ( curStateLogin )
	{
		// create login comp ui
		var loginComp = SA.getAtomComponent ( loginAtomObj.name, loginAtomObj.ac );
		var loginHtml = loginComp.createUI ( loginAtomObj, null );
		return loginHtml;
	}
	
	/**
	 * The child components call this when an action is performed by passing the "Action" object. 
	 * The component will then render its view into the DOM for the target list name (i.e. tlist.name) 
	 * which maps to the DOM element id
	 */
	this.loadPage = function ( actionAtom, replaceBg )
	{
		// load the ilist
		var ilist = SA.getList ( actionAtom.ilist )
		
		// now load the component's target list
		var tlist = SA.getList ( actionAtom.tlist );
		
		// get the html UI from ilist
		var uiHtml = SA.listCreateUI ( this.compId, ilist );
		
		if ( replaceBg ) {
			// map new ui to tlist name ( div id )
			var $tdiv = $('#' + tlist.name );
			var winWidth = $(window).width();

			// Is sliding panels, do all the below items
			if ( allowSlide(winWidth) ) {
				$tdiv.css( 'position', 'fixed' );
				$tdiv.css( 'overflow-y', 'scroll' );
				$tdiv.css( '-webkit-overflow-scrolling', 'touch' ); 
				$tdiv.css( 'height', '100%'  );
				$tdiv.css( 'top', '0px' );
				$tdiv.css( 'padding-top', '80px' ); 
				$tdiv.css( 'width', '100%' );
			}  

			$tdiv.html ( uiHtml );
			
			// save main html   
			$tdiv.show ();
		}
	}
	
	/**
	 * GO BACK: Slide panel right (go left)
	 */
	function slideRight ( $prev, $next, clear )
	{
		var winWidth = $(window).width();		
		if ( !allowSlide(winWidth) ) {
			if (clear ) {
				$next.html ('');
			}
			$next.hide();
			$prev.fadeIn ('fast');
			return;
		}		
		var nleft =  winWidth+'px';
		$next.css('width', winWidth+'px' );
		
		$prev.show();
		
 		$next.animate({"left":nleft}, "fast", function() {
			if (clear ) {
				$next.html ('');
			}
		});
	}
	
	/**
	 * GO NEXT: Slide panel left (go right)
	 */
	function slideLeft ( $prev, $next )
	{
		var winWidth = $(window).width();
		if ( !allowSlide(winWidth) ) {
			$prev.hide();
			$next.fadeIn ('fast');
			scrollToYPos (0);			
			return;
		}
		var zindex = 10 * pageLevel;
		$next.css( {'z-index': zindex} );
		
		// next div attributes 
		var top = 80 ;	// banner and tb
		$next.css( 'position', 'fixed' );
		$next.css( 'overflow-y', 'scroll' );
		$next.css( '-webkit-overflow-scrolling', 'touch' ); 						
		$next.css( 'top', '0px' );
		$next.css( 'padding-top', top+'px' ); 		
		$next.css( 'height', '100%'  );
		
		var nleft = winWidth; 
		$next.css('left', nleft+'px');
		$next.css('width', winWidth+'px' );
        
        // show next div
		$next.show();
		// hide panel before slide reduces flicker 
		$prev.hide();	
		
		//window.scrollTo (0, 0);
		
		$next.animate({"left":"0px"}, "fast", function() {
			//hide prev
			//$prev.hide();
		});
	}
	
	/**
	 * return true is allowed slide affect
	 */
	function allowSlide ( winWidth )
	{
		return winWidth < 500 && App.util.isMobileApp();
	}
	
	var lastDataId = 0;
	
	/**
	 * Show page html (as next page and then user can go back)
	 */
	this.showNextPage = function ( title, dataId, pageHtml, noEdit, noToolbar ) 
	{
		// do not allow the same page twice
		if ( lastDataId == dataId ) 
			return;
		
		// TODO: hack for edit mode (only allow edit mode at level == 2 
		if ( pageLevel == pages.length-2 ) {
			var str = dataId.toString();
			if ( str.indexOf ('-') <= 0  )
				return;
		}
		pageLevel++;
		lastDataId = dataId;
		
		// save title
		// save title
		var tbComp = SA.lookupComponent ( 'ltoolBar');
		pages [pageLevel].title = title;
		pages [pageLevel].dataId = dataId;
		// Get current page TB state
		pages [pageLevel-1].tbshown = tbComp.isVisible ();
	
		var $p0 = $('#' + pages [pageLevel-1].name );
		var $p1 = $('#' + pages [pageLevel].name );
		//var $p1 = $('#page-content');
		
		// get scroll top Y position
		pages[pageLevel].ypos = $(window).scrollTop();
			
		$p1.hide();
		$p1.html ( pageHtml );
		
		//document.location.href="#top";		
		slideLeft ( $p0, $p1 );
		
		// repaint banner
		refreshBanner ();
		
		var editMode = (noEdit!=undefined)? !noEdit : undefined;

		// repaint toolbar
		var ltoolBar = SA.lookupComponent ( 'ltoolBar' );
		ltoolBar.setEditMode ( editMode );
		ltoolBar.renderView ( pageLevel );
		
		// set new title
		setTitle ( title );
	}

	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
		// initial banner refresh
		refreshBanner();

		// click back
		$( '#' + backId + '-left' ).click ( function (event) {
			if ( pageLevel == 0 ) 
				return;
			
			lastDataId = 0;
			pageLevel--;
			refreshBanner();
			
			var wasVisible = pages [pageLevel].tbshown;
			if ( wasVisible ) {
				var ltoolBar = SA.lookupComponent ( 'ltoolBar');
				if ( pageLevel == 0 ) 
					ltoolBar.setEditMode (true);
				ltoolBar.show ( true );
				ltoolBar.renderView ( pageLevel );
			}

			setTitle ( pages[pageLevel].title );
			
			var $p0 = $('#' + pages [pageLevel].name );
			var $p1 = $('#' + pages [pageLevel+1].name );
			//var $p1 = $('#page-content');
			
			//var clear = ( pageLevel == pages.length-2 );
			var clear = true;
			
			//$p0.fadeIn ('slow');
			
			slideRight ( $p0, $p1, clear );
			
			// back to oroginal position
			var scrollYPos = pages[pageLevel+1].ypos;
			scrollToYPos ( scrollYPos );
		});
		
		$( '#about-us' ).click ( function (event) {
			var lpage = SA.lookupComponent ('listsPage');
			var html = lpage.demoPageHtml ();
			myInstance.showNextPage ('About Us   ', 'about-us', html, true, true );
			var tbcomp = SA.lookupComponent ( 'ltoolBar');
			tbcomp.show ( false );			
		});
		
		// LOGOUT: Click on your name, for for now just log out
		$( '#'+actNameYou ).click ( function (event) {
			myInstance.loadPage ( actionsMap [actNameYou], false );
		});

		// goto home page for first time
		if ( !initialLoad ) {
			myInstance.loadPage ( actionsMap [actNameLogo], true );
			initialLoad = true;
		}
	}
	
	/**
	 * Scroll page for mobile and browsers
	 */
	function scrollToYPos ( ypos )
	{
		if ( SA.utils.isMobileDevice() ) {
			window.scrollTo (0, ypos);
		}
		else {
			$('html, body').animate({
			    scrollTop: ypos,
			    scrollLeft: 0
			}, 0);
		}
	}
	
};
;
/**
 * Button Action Atom component. Action atoms components cause code execution in the system. Can thought off as the 
 * Mini Catalyst Controllers that alter the system's state. The acton button operates as the following:
 * 
 */
App.BtnCircle = function ()
{	
	// specify if the component contains state or not
	this.stateful = false;

	// create a button delegate
	var button = new App.Button();
	
	var myId = undefined;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items:
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.round', value:'display:block;width:15px;height:15px;border: 1px solid #f5f5f5;'+
				'border-radius: 50%;box-shadow: 0 0 1px gray;float:left;'},
			{name:'.round:hover', value:'background: #F0F0F0;' },
			{name:'.selected', value:'background: #F0F0F0;'}
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.round', value:'display:block;width:10px;height:10px;border: 1px solid #f5f5f5;'+
				'border-radius: 50%;background: #ffffff;'+
				'box-shadow: 0 0 1px gray;float:left;'},
			{name:'.round:hover', value:'background: #262626;' },
			{name:'.selected', value:'background: #F0F0F0;'}
			]
		}		 
		]			
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config:
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		var label = atomObj.label;
		if ( !label )
			label = 'none';

		myId = this.compId;
		if ( atomObj.name ) {
			myId = atomObj.name;
		}
		
		var cls1 = SA.localCss ( this, "round");
		var cls2 = SA.localCss ( this, "round:hover");
		
		var html = 
		'<a id="' +myId + '" href="#" class=" btnCircle '+ cls1 + ' ' + cls2 + '"></a>';
		return html;
	}
	
	this.getName = function()
	{
		return button.getName();
	}
	
	/**
	 * If defined it will allow this component to be an action listener
	 */
	this.setActionListener = function ( listenerComp )
	{
		button.setActionListener (listenerComp);
	}
	
	/**
	 * Adds an action listener
	 */
	this.select = function ( select, id )
	{
		var selCls = SA.localCss ( this, "selected");
		var $id = $ ('#'+id ); 
		var hasCls = $id.hasClass ( selCls );
		
		if ( select ) {
			if ( ! hasCls ) {
				$id.addClass ( selCls ); 
			}
		}
		else {
			if ( hasCls ) {
				$id.removeClass ( selCls ); 
			}
		}
	}
	
	/**
	 * Fire event to this action (click button, etc.)
	 */
	this.triggerEvent = function ( eventName )
	{
		button.triggerEvent ( eventName );
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		button.postLoad();
	}
}
;
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
;
/**
 * Display card of information
 */
App.Card = function ()
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	
	// remember value entered
	var myId = undefined;
	var myIdTb = undefined;
	var comId = undefined;
	var remShareId = undefined;
	var dummyCard = false;
	var atomObj = undefined;
	var listener = undefined;
	var comments = undefined;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	// stylesheets for this component
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[ 
			{name:'.card', value:'margin-bottom:40px; border: 1px solid #E0E0E0;padding:10px;background-color:#fff' },			 
			{name:'.title', value:'font-size:160%;margin-top:4px;margin-bottom:4px;'},
			{name:'.parag', value:'font-size:120%;margin-top:4px;margin-bottom:6px;'}
			]
		},
		  
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.card', value:'margin-bottom:18px; border: 1px solid #E0E0E0;padding:5px;background-color:#fff' },			 
			{name:'.title', value:'font-size:130%;margin-bottom:2px;'},
			{name:'.parag', value:'font-size:100%;margin-top:4px;margin-bottom:4px;'}			
			]
		}
		]
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * imageUrl: url for image
	 */
	this.createUI = function ( atomObject, config )
	{
		var cardCss = SA.localCss ( this, 'card');
		var titleCss = SA.localCss ( this, 'title');
		var paragCss = SA.localCss ( this, 'parag' );
		
		listener = SA.getConfig ( atomObject, 'listener' );

		var editMode = SA.getConfig ( atomObject, 'editMode', true);
		var zoomMode = SA.getConfig ( atomObject, 'zoomMode', false);
		var nshare = SA.getConfig  (atomObject, 'nshare', false);
		var maxComm = SA.getConfig ( atomObject, 'maxComm', 0 );
		
		var style = atomObject.style;

		atomObj = atomObject;
		
		myId = this.compId;
		comId = 'com-' + myId;
		myIdTb = myId + '-tb';
		
		var retHtml = '';
		
		if (  config.dummy ) {
			
			dummyCard = true;
			var itemsToolbar = getItemsToolbar ( myId, atomObj, true );
			
			retHtml += 
			'<div id="' + myId + '" class="">' +
				'<div><div style="float:left;margin-bottom:30px;" id="' + myIdTb + '">' + itemsToolbar + '</div></div>' +
			'</div>';
		}
		else {
			var itemsToolbar = '';
			var styleStr = '';
			if ( style ) {
				styleStr = ' style="' + style + '"' ;
			}
			
			// figure out name (if not current user)
			var ownerName = '';
			if ( atomObject.user ) {
				ownerName = 
				'<div oid="' + myId + '" style="padding-top:5px;padding-bottom:25px;">' + 
					'<div style="float:left;color:gray;">By: ' + atomObject.user + '</div>' + 
				'</div>';
			}

			// figure out last modified time string
			var lastMod = '';
    		if ( config.timeMs && config.timeMs>0 ) {
    			var dateStr = App.util.getFriendlyTime ( config.timeMs );
    			if ( isRecent (config.timeMs) )
    				lastMod = '<p style="font-size:80%;margin-top:0px;color:#4D97B1"><b>Modified: ' + dateStr + '</b></p>'; 
    			else
        			lastMod = '<p style="font-size:80%;margin-top:0px;color:gray" >Modified: ' + dateStr + '</p>'; 
    		}
			
			retHtml += 
			'<div id="' + myId + '"' + styleStr + ' class="' + cardCss + '" >' ;

				if ( editMode ) {
					retHtml += '<div><div style="float:right;" id="' + myIdTb + '">' + itemsToolbar + '</div></div>' ;
				}

				// if owner then it is not my list
	        	if ( ownerName ) {	
		        	if ( config.ttitle ) {
		        		retHtml += '<p style="margin-bottom:0px;" class="' + titleCss + '" >' + config.ttitle + '</p>';
		        		retHtml += lastMod;
		        	}
	        		retHtml += ownerName;
	        	}
	        	// my list
	        	else {
		        	if ( config.ttitle ) {
		        		retHtml += '<p class="' + titleCss + '" >' + config.ttitle  + '</p>';
		        		retHtml += lastMod;		        		
		        	}
	        	}
	        	if ( config.stitle ) {
	        		retHtml += '<p class="' + paragCss + '" >' + config.stitle  + '</p>';
	        	}
	        	
	        	// embed video as first preference
	        	if ( config.mediaUrl ) {
	        		retHtml += App.util.getYouTubeHtml ( config.mediaUrl );
	        	}
	        	else if ( config.imageUrl ) {
	        		retHtml +='<img width="100%" class="img-responsive" style="margin-bottom:10px" src="' + 
	        			config.imageUrl + '"></a>' ;
	        	}
	        	
				if ( config.info ) {
					retHtml += '<p>' + config.info + '</p>' ;
				}
				if ( config.lname && config.link ) {
					retHtml += '<p><a href="' + config.link +'" target="ttfaves-link">' + 
						config.lname + '</a></p>'; 
				}
				if ( nshare!=true && atomObj.config.listId && atomObj.config.id > 0) {
					var commHtml = getCommentsHtml (false, atomObj.config.listId, 
							atomObj.config.id, maxComm, myId);
					retHtml += '<div id="' + comId + '" >' + commHtml + '</div>';
				}
				
			retHtml += '</div>';
			
			// ZOOM: add comments at the end
			// TODO: Almost there (the html does not get cached)
			/*
			if ( zoomMode == true ) {
				var detailHtml = getCommentsHtml (true, atomObj.config.listId, 
						atomObj.config.id, maxComm, myId);
				retHtml += detailHtml;
			}
			*/
		}
        	
		return retHtml;
	}
	
	/*
	 * Return true is recent (less than week old)
	 */
	function isRecent ( timeMs )
	{
		var d = new Date();
		var n = d.getTime();
		//return (n - timeMs) < 604800000;
		return (n - timeMs) < (3 * 86400000); // less than 3 days
	}
	
	/**
	 * Update comments display (called from other components)
	 */
	this.redrawComments = function ( cardCompId, summaryHtml ) 
	{
		$('#com-' + cardCompId).html ( summaryHtml );
	}
	
	/**
	 * Comments updated notification by Comments component  
	 */
	this.commentsUpdated = function ( newComments )
	{
		console.debug ( 'comm updated' );
		comments = newComments;
	}
	
	/**
	 * get comments html report 
	 */
	function getCommentsHtml ( zoom, listId, itemId, maxComments, cardCompId )
	{
		// every comments list will create a new comp instance that will be used ro generate
		// the unique ids for divs for this card
		var commentsList = { lc:'App.Comments', 
			config:{zoomMode: zoom, listId: listId, itemId: itemId, maxComm:maxComments,
				cardCompId:cardCompId },
			data: []
		};
		var html = SA.createUI ( myId, commentsList );
		return html;
	}
	
	/**
	 * Get toolbar
	 */
	function getItemsToolbar (myId, atomObj, newButton)
	{
		var comp = SA.lookupComponent ( 'itemsDialogs' );
		if ( comp ) {
			return comp.getItemsToolBar( myId, atomObj, newButton );
		}
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		var lastTimeStamp = new Date().getTime(); 

		$ ('#' + myIdTb ).show();
		
		// Tap on comment
		$('#' + comId ).on ( 'tap', function(event) {
			//console.debug ( 'tap comp' );

			if ( acceptEvent (event) ) {
				var atom = atomObj;
				//console.debug ( 'comment tap');
			}
		});
		
		// Tap on Tile
		$('#' + myId ).on ( 'tap', function(event) {
			if ( acceptEvent (event) ) {
				//console.debug ( 'tap tile' );				
				var atom = atomObj;
				if ( listener && listener.actionPerformed ) {
					listener.actionPerformed ( atomObj );
				}
			}
		});
		
		// swipe right
		$('#' + myId ).on( "swiperight", function( event ) {
			if ( acceptEvent (event) ) {
				//console.debug ( 'swipe r' );			
				var banner = SA.lookupComponent ( 'appBanner');
				banner.showPrevious ();
			}
		});
		
		// Accept event if return true
		function acceptEvent ( event ) {
			var yes = event.timeStamp - lastTimeStamp > 500;
			//console.debug ( event.timeStamp - lastTimeStamp );
			lastTimeStamp =  event.timeStamp;
			return yes;
		}
	}
}

;
/**
 * Panel to contain multiple display Cards
 */
App.CardPanel = function ()
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.title', value:'color:#606060;margin-top:10px;margin-bottom:0px;font-size:250%' }			 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.title', value:'color:#606060;margin-top:5px;margin-bottom:0px;font-size:180%' }	 
			]
		},
		{name:'.share-bt', value:'float:right;color:#A0A0A0;background-color:#F8F8F8;font-size:80%;padding:8px;'}
		]
	};
	
	var myListId = undefined;
	var myTitle = undefined;
	var rmShareId = undefined;
	var flShareId = undefined;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * items:
	 * All children are expected to be Card atom components
	 */
	this.createUI = function ( listObj, config )
	{
		var divId = this.compId;
		rmShareId = divId + 'rmShare';
		flShareId = divId + 'flShare';
		
		var addTile = SA.getConfig (listObj, 'addTile' );
		var heightpx = SA.getConfig (listObj, 'height' );
		var titleStyle = SA.getConfig (listObj, 'titleStyle', '' );		
		var height = '';
		
		if ( heightpx ) {
			height = 'height:' + heightpx;
		}
		myListId = config.id;
		
		if ( !listObj.items )
			return undefined;
		
		var cardsList = listObj.items;
		
		// Add 'Add Tile' button at the end
		if ( addTile==true && listObj.items.length < 10 ) {
			listObj.items.push ( {lc:'App.Card', 
				config:{
					dummy: true,
					listId: myListId 
				} } 
			);
		}
		
		var cssTitle = SA.localCss (this, 'title');
		var cssShareBt = SA.localCss (this, 'share-bt' );

		myTitle = SA.getConfigValue ( listObj, 'title', '');
		
		var desc = SA.getConfigValue ( listObj, 'desc', ' ');
		var editMode = SA.getConfigValue ( listObj, 'editMode', true);
		
		var shareLink = getShareMailTo();
		var ownerName = '';
		
		// if user passed, add user as owner
		if ( listObj.user ) {
			var isauth = SA.getUserAuth (); 
			ownerName = '<div oid="' + divId + '" style="padding-top:5px;padding-bottom:5px;">' + 
				'<div style="float:left;color:gray;padding-bottom:5px;">By: ' + listObj.user + '</div>';
				if (isauth) {
					ownerName += 
					'<div id="' +rmShareId +'" class="' + cssShareBt + '">Delete</div>' +
					'<div id="' +flShareId +'" class="' + cssShareBt + '">Complain</div>';					
				}
			ownerName += '</div>';			
		}
		
		var retHtml = 
		'<div class="container-fluid" style="padding-top:5px;padding-right:6px;padding-left:6px;background-color:#F0F0F0;'+height+'" >' + 
			shareLink + 
			'<div class="row" >'+
				'<div class="container col-md-8 col-md-offset-2" >'+
					'<div style="margin-bottom:20px">'+
						'<p  class="'+ cssTitle + '" style="' + titleStyle + '" >' + myTitle + '</p>'+
						'<p style="margin-bottom:5px">' + desc + '</p>'+
						ownerName + 
					'</div>'+
				'</div>'+  
			'</div>'+
			'<div class="row">'+
      	  		'<div class="container col-md-8 col-md-offset-2" >'+
      	  			'<div >';
		
		var i = 0;
		for ( i=0; i<cardsList.length; i++ ) {
			
			var lobj = cardsList [i];
			
			// if not atom component (i.e. html, lc, etc; just render and continue)
			if ( !lobj.ac ) {
				lobj.config.editMode = editMode;
				retHtml += SA.listCreateUI ( lobj.compId, lobj, undefined, true );  
				continue;
			}
			
			// get atom comp
			var atomComp = SA.getAtomComponent ( lobj.name, lobj.ac );
			
			// get html
			var html = atomComp.createUI ( lobj, null );
			
			retHtml += html;
		}
		
		retHtml += '</div></div></div></div>';	
		
		// test sharing
		/*
		retHtml += '<button onclick="window.plugins.socialsharing.share(\'Message only\')">message only</button>';
		retHtml += '<br><br><br>';
		*/
		
		return retHtml;
	}
	
	/**
	 * Share link for this list
	 */
	function getShareMailTo () 
	{
		/*
		var id = 'share-' + myListId;
		var subject = 'I am sharing my Share10 list name: ' + myTitle;
		var body = 'To access my list %20%22' +myTitle+ '%20%22 simply click the link: ' + window.location.origin + '/list/' + myListId + 
			'%0D%0ANote: you can also copy the above link into a text message and send it to your friends.' + 
			'%0D%0A%0D%0ASent from Top10Faves!';
		
		var html = '<a style="display:none" target="_blank" id="' + id + '" href="mailto:?subject=' +
			subject + '&body=' + body + '"></a>';
		return html;
		*/
		return '';
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		// Tap on comment
		$('#' + rmShareId ).on ( 'tap', function(event) {
			var ldlg = SA.lookupComponent ( 'listDialogs' );
			ldlg.deleteSharedList ( myListId );
		});
		
		$('#' + flShareId ).on ( 'tap', function(event) {
			var ldlg = SA.lookupComponent ( 'feedbackDialogs' );
			ldlg.showFeedbackDlg ( myListId );
		});
	}	
}
;/**
 * BannertHandler Object  
 */
App.Comments = function ()
{
	this.css = { items: 
		[
		// Everything else 
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.title', 
				value:'font-size:100%;width:100%;background-color:#F8F8F8;padding-top:5px;padding-bottom:5px;'}
			]
		},
		 
		// Mobile sizes 
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.title', 
				value:'font-size:95%;width:100%;background-color:#F8F8F8;'}
			]
		}
		]
	};
	
	/**
	 * Login flow list
	 */
	this.flow = { items: 
		[
		{name:'newcomm-dlg', lc:'App.Dialog', items:
			 [
			 {name:'newcomm-form', lc:'App.FormHandler', 
				 	config:{title:'Comments', listener:this}, items:   
				 [
				 {name:'itemId', ac:'App.Variable'},
				 {name:'listId', ac:'App.Variable'},
				 {name:'card', ac:'App.Variable'},
				 
				 {name:'maxComm', ac:'App.Variable'},
				 
				 {name:'prevComments', html:'p', style:'font-size:95%', value:''},
				 
				 //{html:'div', style:'height:20px;'},  
				 
				 {name:'commText', ac:'App.TextArea', info:'Your comment', 
					 required:true, pattern:'text', config:{rows:2} },
				 
				 {html:'div', style:'height:2px;'},

				 {cmd:'cmdPostComm', ac:'App.Button', label:'Post', config:{theme:'color',defButton:true}},
				 {cmd:'cmdCancelComm', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:8px;'},
				 ]
			 }
			 ]
		}
		]
	};
	
	var myId, myInst;
	var addId, comRepId, cardCompId;
	var listener, configObj ;
	var ltoolBar;
	var clTitle;
	
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
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
		
		addId = 'add-' + myId;
		comRepId = 'rep-' + myId;
		
		configObj = list.config;
		ltoolBar = SA.lookupComponent ( 'ltoolBar' );
		
		// get class for title
		clTitle = SA.localCss (myInst, 'title' );

		var zoomMode = SA.getConfig (list, 'zoomMode');
		var maxComm = SA.getConfig (list, 'maxComm', 0 );
		cardCompId = SA.getConfig ( list, 'cardCompId' );
		
		var commentsHtml = '';
		// get detail 
		if ( zoomMode == true ) {
			commentsHtml = getCommentsHtml (); 
		} 
		// get summary
		else {
			SA.listCreateUI ( myId, this.flow );
			
			// allow dialog to get created
			commentsHtml = getSummaryHtml ( maxComm, list.data );			
		}
		//console.debug ( 'data: ' + data );

		var html = '<div id="' + myId + '">' + commentsHtml + '</div>';
		return html;
	}
	
	/*
	 * get comments summary html
	 */
	function getSummaryHtml  ( count, data ) 
	{
		var maxComm = count;
		if ( data && data.length> 0 ) {
			maxComm = data.length;
		}
		var numCommStr = '';
		if ( maxComm && maxComm>0 ) {
			numCommStr = maxComm + ' Comments' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		}
		
		var addDivId = 'add-' + myId;
		var sumDivId = 'sum-' + myId;
		var html = 
			'<div id="' + addDivId + '" class="' + clTitle + '"><div id="' + sumDivId + '" >' + 
				summaryHtml ( count, data ) + 
			'</div></div>';
		
		var retHtml = '<div id="' + myId + '">' + html + '</div>';
		return retHtml;
	}
	
	/**
	 * Gets comments detail
	 */
	function getCommentsHtml ()
	{
		// load comments and async. add to comRepId
		var html = '<div id="' + comRepId + '"  ></div>';
		loadComments ( false, comRepId, true );
		return html;
	}
	
	/**
	 * Just return the summary line
	 */
	function summaryHtml ( count, data )
	{
		var maxComm = count;
		if ( data && data.length> 0 ) {
			maxComm = data.length;
		}
		var numCommStr = '';
		if ( maxComm && maxComm>0 ) {
			numCommStr = maxComm + ' Comments' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		}
		var html = numCommStr + 'Add Comment';
		return html;
	}

	/**
	 * Redraw summary 
	 */
	function redrawSummary (comDivId, count, data )
	{
		var html = getSummaryHtml ( count, data );
		var sumDivId = '#sum-' + comDivId;
		$ (sumDivId).html ( html );
	}
	
	/**
	 * Action performed by button clicks
	 */
	this.performAction = function ( shareActionName )
	{
		//console.debug ( 'action perf: ' + event );
		if ( listener && listener.actionPerformed ) {
			listener.actionPerformed ( {cmd:shareActionName})
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdPostComm' ) {
			if ( validate ( 'commMsg', atomList, dataObj ) ) {
				var form = new FormData();
				var card = dataObj.card;
				var nameInfo = App.util.getMyNameInfo();
				form.append ( 'comment', App.util.safeHtml(dataObj.commText) );
				form.append ( 'listId', card.listId );
				form.append ( 'itemId', card.id );
				form.append ( 'commentor', nameInfo );

				if ( dataObj.id ) { // edit
					SA.server.putForm ("/rs/ttitem", form, postSuccess);
				}
				else { // add new comment
					// set max comments
					var maxComm = 1;
					//var card = ltoolBar.findCard(dataObj.listId, dataObj.itemId);
					if ( card.maxComm ) {
						maxComm = card.maxComm + 1;
					}
					card.maxComm = maxComm;
					form.append ('maxComm', maxComm);

					if ( !card.comments ) {
						card.comments = [];
					}
					var timeMs = new Date().getTime();
					var commObj = {comment:dataObj.commText, commentor:nameInfo, timeMs:timeMs}; 
					card.comments.push ( commObj );
					// redraw comments summary 
					redrawSummary ( card.comDivId, maxComm, undefined );
					
					SA.server.postForm ("/rs/comment", form, postSuccess);
				}
			}
		}
		// hide dialog
		hideDialog ();
	}
	
	/**
	 * Post success
	 */
	function postSuccess (respStr)
	{
	}
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			return false;
		}
		return true;
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog ( title, dialogName )
	{
		var dlg = SA.lookupComponent ( dialogName );
		if ( dlg ) {
			dlg.showDialog (true, title, 'appBanner' );
		}
		return dlg;
	}
	
	function hideDialog ()
	{
		var dlg = SA.lookupComponent ( 'newcomm-dlg' );
		dlg.showDialog (false, 'Comments', 'appBanner');
	}
	
	/**
	 * Gets comments html
	 */
	function getCommListHtml ( commentsArray )
	{
		var html = '<div>';
		for ( i=0; i<commentsArray.length; i++ ) {
			var comm = commentsArray [i];
			var commStr = 
			'<div style="float:left;font-size:95%;width:100%;margin-bottom:10px;background-color:#f8f8f8;" >' + 
				'<div style="float:left;width:14%;padding-right:8px;"><img class="img-responsive" src="app/res/img/unknown.png" /></div>'+
				'<div style="float:left;width:80%;"><b>' + comm.commentor + '</b> .. ' + comm.comment +
				'<br><div style="color:#66A3C2">' + App.util.getFriendlyTime(comm.timeMs) + '</div></div>' + 
			'</div>';
			
			html += commStr;
		}
		html += '</div>';
		return html;
	}
	
	function loadComments ( showDlg, setDivId, forceLoad )
	{
		var itemId = configObj.itemId;
		var listId = configObj.listId;
		var card = ltoolBar.findCard( listId, itemId );
		var comDivId = myId;
		
		// Tap on comments
		var commListHtml = '';
		card.comDivId = comDivId;
		// if comments already there show them
		if ( card.comments && card.comments.length>0 ) {
			commListHtml = getCommListHtml ( card.comments )
		}
		// if there are comments load them
		else if ( card.maxComm && card.maxComm > 0) {	
			commListHtml = "Loading comments .."
			SA.server.get("/rs/comment", {listId:listId, itemId:itemId}, commentsLoaded );
		}
		var data = {itemId:itemId, listId:listId, card:card,
				prevComments:commListHtml };
		var form = SA.lookupComponent ('newcomm-form');
		form.updateForm (data);
		
		if ( showDlg == true ) {
			showDialog ( '', "newcomm-dlg" );
		}
		
		/**
		 * Comments loaded and set in form
		 */
		function commentsLoaded (respStr )
	    {
	    	var respObj = jQuery.parseJSON( respStr );
	    	card.comments = respObj.respData;
	    	
	    	var html = getCommListHtml ( card.comments );
	    	$ ('#'+setDivId ).html ( html );
		}
	}
	
	this.postLoad = function ()
	{
		// Tap on comments
		$('#' + addId ).on ( 'tap', function() {
			loadComments ( true, 'prevComments', false );
		});
	}
};
;/**
 * Button Action component
 */
App.Dialog = function ()
{	
	// specify if the component contains state or not
	this.stateful = true;
	
	// store obj-based templ here
	this.htmlTempl = undefined;
	
	var dispWidth = $(window).width() ;
	
	this.css = { items: 
		[
			/* Everything else */
			{name: '@media (min-width: 481px)', items: 
				[
				{name:'.dlg', value:'width:520px;position:absolute; '+
					'top:6%;left:45%;margin-top:-30px;margin-left:-200px;padding:20px;' }
				]
			},
			 
			/* Mobile sizes */
			{name: '@media (max-width: 480px)', items:
				[
				{name:'.dlg', value:'width:100%;position:absolute; '+
					'top:6%;margin-top:-30px;padding:10px;margin-left:0px' }
					//'top:5%;left:49%;margin-top:-30px;margin-left:-170px;padding:20px;' }
				]
			}			
		]
	};	
	
	var dlgId = undefined; 
	var pageId = undefined;
	var isPageStyle = undefined;
	var myFlowList = undefined;
	var dlgFormComp = undefined;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * flow: Optional expect child list of content of dialog
	 * 
	 */
	this.createUI = function ( flowList, allConfig )
	{
		var pageConfig = SA.getConfigValue ( flowList, 'pageStyle', false );
		
		// get is page style (full page or dialog)
		var isMobile = SA.utils.isMobileDevice();
		isMobile = true;
		isPageStyle = pageConfig && isMobile;
		
		// The dlgId initialized in DOM, if already there simply show it ( If NOT in DOM create one)
		if ( dlgId ) {
			return '';
		}
		
		// initialize dlgId
		dlgId = this.compId;
		pageId = dlgId + '-page';
		
		myFlowList = flowList;
		
		// fihure out title
		var title = flowList.label;
		if ( !title ) {
			title = 'No title provided in label field';
		}
		
		// content stored here
		var content = '';
		if ( flowList.items &&  flowList.items.length>0 ) {
			content = SA.listCreateUI ( this.compId, flowList.items[0], {'pageStyle':isPageStyle} );
		}
		
		// local css cls
		var ldlgcss = SA.localCss (this, 'dlg');
		//var larrow = SA.localCss (this, 'arrow');

		var retHtml = '<div class="modal fade" id="'+ dlgId + '" tabindex="-1" role="dialog" aria-labelledby="" aria-hidden="true">'+
		//'<img src="res/img/arrow-left.png" class="' +larrow +'" >' +
	
		'<div class="modal-dialog ' + ldlgcss + '" >' +
			'<div id="' + pageId + '" class="modal-content">' +
				'<div class="modal-body" style="height:100%;width:100%;" >'+
					content +  
				'</div>'+
			'</div>'+
		  '</div>'+
	    '</div>';

		var $pid = $('#page');
		
		// Create an element with id == flowList.name ( or eq divElementId )
		$("#page").append("<div id='" + flowList.name + "'></div>" );

		// Now append the dlg html inside the div set the html value
		$( "#"+flowList.name ).html ( retHtml );

		return undefined;
	}
	
	/**
	 * Make dialog and contents wait for processing
	 */
	this.setWaiting = function ( isWaiting )
	{
		 var form = getDialogForm();
		 if ( form ) {
			 form.setWaiting ( isWaiting );
		 }
	}
	
	/**
	 * Show and hide dialog
	 */
	this.showDialog = function ( show, title, bannerName, noToolbar  )
	{
		if ( isPageStyle ) {
			var appBanner = SA.lookupComponent ( bannerName );
			if ( show ) 
				appBanner.showNextPage ( title, pageId, $('#'+pageId).html(), undefined, noToolbar );
			else
				appBanner.showPrevious ();
		}
		else {
			if ( show ) 
				$('#'+dlgId).modal({ show: show  });
			else 
				$('#'+dlgId).modal('hide');
		}
	}
	
	/**
	 * Update the form with new one (used for edit mode)
	 */
	this.updateForm = function ( valuesObj )  
	{
		 var form = getDialogForm();
		 if ( form ) {
			 form.updateForm ( valuesObj )
		 }
	}
	
	/**
	 * Show and hide form element
	 */
	this.showElement = function ( name, show)
	{ 
		 var form = getDialogForm();
		 if ( form ) {
			 form.showElement ( name, show );
		 }
	}
	
	/**
	 * Gets the underlaying dialog form 
	 */
	function getDialogForm ()
	{
		if ( !dlgFormComp ) {
			 var formName = myFlowList.items[0].name;
			 dlgFormComp = SA.comps.getCompByIdOrName(formName);
		}
		return dlgFormComp;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{ 
	}
}
;
/**
 * Text Area component
 */
App.EnumField = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	var divId = undefined;
	var idsArray = new Array ();
	var clickCls = undefined;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
		/* Everything else 
		{name: '@media (min-width: 481px)', items: 
			[
			]
		},
		 
		// Mobile sizes 
		{name: '@media (max-width: 480px)', items: 
			[
			]
		},
		*/
		]
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: 'password', 'text'
	 * 
	 * child list: atom fields:
	 * info: info inside field
	 * label: label outside field
	 */
	this.createUI = function ( atomObj, config )
	{
		this.atomObj = atomObj;		
		divId = this.compId;
		
		var placeHolder = '';
		
		var type = SA.getConfigValue (atomObj, 'type', 'text');
		var typeStr = 'type="' + type + '"';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			placeHolder = 'placeholder="' + atomObj.info + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		var values = atomObj.values;
		if ( !values || values.length == 0 ) {
			alert ( "Invalid State: expected 'values' array with name value objects");
		}
		
		fieldValue = atomObj.value;
		if ( !fieldValue ) {
			fieldValue = '';
		}
		// class to handle click event
		clickCls = makeId ( 'clkgrp');
		
		// UI created here (Remember! use id will allow the postLoad notification)
		var html =
		'<div id="'+ divId + '" class="form-group" >'+
		  '<div class="col-md-12">' + 
			'<div class="btn-group">';
			
		for ( i=0; i<values.length; i++ ) {
			var valObj = values [i];
			var cls = (valObj.name==fieldValue || valObj.value==fieldValue)? 'active' : '';
			cls += ' ' +clickCls;
			
			var id = makeId(valObj.name);
			idsArray.push ( id )
			html += '<button type="button" class="btn btn-default ' + cls + '" id="' + id + '">' + 
				valObj.value + '</button>';
		}
		html += '</div></div></div>';  
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	/**
	 * Make id from divId + idVal
	 */
	function makeId ( idVal )
	{
		return idVal + '-' + divId ;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		return fieldValue;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return this.atomObj.name;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		// handler to the click group class
		$('.' + clickCls).click ( function() {
			fieldValue = $(this).attr ( "id" ); 
		    $(this).addClass ( 'active' );
		    deSelectIds ( fieldValue );
		});
	}
	
	/**
	 * Go through list and make one id active
	 */
	function deSelectIds ( butId )
	{
		for ( i=0; i<idsArray.length; i++ ) {
			if ( idsArray[i] != butId ) {
				var $id = $( '#'+ idsArray[i] );
				if ( $id.hasClass ('active'))
					$id.removeClass ( 'active' );				
			}
		}
	}
}

;/**
 * BannertHandler Object  
 */
App.Feedback = function ()
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
		{name:'feedback-dlg', lc:'App.Dialog', items:
			 [
			 {name:'feedback-form', lc:'App.FormHandler', 
				 	config:{title:'Complain About List Content', listener:this}, items:   
				 [
				 {name:'relItemId', ac:'App.Variable'},
				 
				 {name:'feedMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},  
				 
				 {name:'feedText', ac:'App.TextArea', info:'Tell us your complaint message', 
					 required:true, pattern:'text', config:{rows:3} },
				 
				 {html:'div', style:'height:10px;'},

				 {cmd:'cmdPostFeed', ac:'App.Button', label:'Send Complaint', config:{theme:'color',defButton:true}},
				 {cmd:'cmdCancelFeed', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:15px;'},
				 ]
			 }
			 ]
		},
		{name:'password-reset-dlg', lc:'App.Dialog', items:
			 [
			 {name:'password-reset-form', lc:'App.FormHandler', 
				 	config:{title:'Reset Your Password', listener:this}, items: 
				 [
				 {name:'lgrMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},
				 
				 {name:'passToken', ac:'App.Variable'},
				 
				 //{html:'div', style:'height:4px;'},
				 {name:'lgrPassword1', ac:'App.TextField', info:'New Password', required:true, pattern:'text',
					 config:{type:'password'}},
					 
				 {name:'lgrPassword2', ac:'App.TextField', info:'Re-type New Password', required:true, pattern:'text',
					 config:{type:'password'}},

				 {html:'div', style:'height:10px;'},
				  
				 {cmd:'cmdResetLogin', ac:'App.Button', label:'Save Password', config:{theme:'color'} },
				 {cmd:'cmdResetCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },				 

				 {html:'div', style:'height:25px;'},
			 	 ]}
			]
		}		
		]
	};
	
	var myId, myInst;
	var curListId;
	var currentDlg;
	var initialized = false;
	
	/**
	 * This method creates the UI based on the lists provided
	 */  
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Show feedback dialog
	 */
	this.showFeedbackDlg = function ( listId )
	{
		if ( !initialized ) {
			SA.createUI (myId, flowList);
			initialized = true;
		}
		curListId = listId;
		showDialog ( 'feedback-dlg', {} );
	}
	
	/**
	 * Shows display dialog
	 */
	this.showResetDialog = function ( passToken)
	{
		if ( !initialized ) {
			SA.createUI (myId, flowList);
			initialized = true;
		}
		showDialog ('password-reset-dlg', {passToken: passToken} );
	}

	/**
	 * Action performed by button clicks
	 */
	this.performAction = function ( shareActionName )
	{
		//console.debug ( 'action perf: ' + event );
		if ( listener && listener.actionPerformed ) {
			listener.actionPerformed ( {cmd:shareActionName})
		}
	}
	
	/**
	 * Sent by SA.fireEvent
	 */
	this.handleEvent = function (event )
	{
		// Called from other components to show reset dialog
		if ( event.cmd == 'passwordReset' ) {
			myInst.showResetDialog ( event.data );
			App.util.stopWorking();
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( action, atomList, dataObj )
	{
		if ( action.cmd == 'cmdPostFeed' ) {
			if ( validate ( 'feedMsg', atomList, dataObj ) ) {
				var form = new FormData();
				form.append ( 'msg', App.util.safeHtml(dataObj.feedText) );
				form.append ( 'relItemId', curListId );
				currentDlg.setWaiting (true);
				SA.server.postForm ("/rs/feedback", form, postFBSuccess);
			}
		}
		else if ( action.cmd == 'cmdResetLogin' ) {
			if ( validatePass ( 'lgrMsg', atomList, dataObj ) ) {
				var data = {};
				data.email = dataObj.passToken;
				data.authToken = dataObj.lgrPassword1;
				data.resetPassword = "true";
				currentDlg.setWaiting (true);
				SA.server.set ("/rs/user", data, postResetSuccess);
			}
		}
		else if ( action.cmd == 'cmdCancelFeed' ) {
			// hide dialog
			hideDialogFeedback ();
		}
		else if ( action.cmd == 'cmdResetCancel' ) {
			hideDialogReset ();
		}
	}
	
	/**
	 * Post success
	 */
	function postFBSuccess (respStr)
	{
		// hide dialog
		hideDialogFeedback ();
	}
	
	/**
	 * Post success
	 */
	function postResetSuccess (respStr)
	{
		var respObj = jQuery.parseJSON( respStr );
		
		if ( respObj.status == 'OK') {
			// hide dialog
			hideDialogReset ();
			SA.deleteUserAuth();
			SA.setAppData ( 'userName', '' );			
			window.location.href = "/";
		}
		else {
			showMessage ( 'lgrMsg', "Reset failed, can be caused by invalid or expired reset URL!", false);
		}
		currentDlg.setWaiting (false);
	}
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, 'Message cannot be empty!', false );
			return false;
		}
		return true;
	}
	
	/**
	 * validatePass
	 */
	function validatePass ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if ( data.lgrPassword1 != data.lgrPassword2 ) {
			showMessage ( divId, "Passwords do not match!", false );	
			return false;
		}
		else if ( data.lgrPassword1.length < 6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );	
			return false;
		}
		return true;
	}

	/*
	 * Shows a messaage 
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.lookupComponent ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog ( dialogName, newForm )
	{
		currentDlg = SA.lookupComponent ( dialogName );
		if ( currentDlg ) {
			if ( newForm )
				currentDlg.updateForm ( newForm );
			currentDlg.showDialog (true );
		}
		return currentDlg;
	}
	
	function hideDialogFeedback ()
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false );
	}
	
	function hideDialogReset ()
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false );
	}	
};
;
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
;
/**
 * Button Action component
 */
App.HSlider = function ()
{	
	// specify if the component contains state or not
	this.stateful = true;
	
	// local vars
	var myId ;
	var localCss;
	var numberItems;
	var lastPageId;
	
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
		
		localCss = SA.localCss ( this, 'my-gallery');
		
		var html = 
		'<div id="' +myId + '" class="' + localCss + '">';
		
		numberItems = 0;
		
		if ( flowList.items ) {
			for ( j=0; j<flowList.items.length; j++  ) {  
			
				// single carousel page
				var ttlist = flowList.items[j];
				var listHtml = SA.listCreateUI ( this.compId, ttlist );
				lastPageId = 'page-' + ttlist.config.id;
				
				html += '<div id="' + lastPageId + '" >' + listHtml + '</div>';
			}
			numberItems = flowList.items.length;
		}
		html += '</div>' ;
		
		return html;
	}	
	
	/**
	 * Add new page to the end
	 */
	this.addPage = function ( uniqueId, pageHtml )
	{
		// Add a slide
		//var html = '<div id="page-' + uniqueId + '" class="slick-side slick-active" >' + pageHtml + '</html>';
		var html = '<div id="page-' + uniqueId + '" >' + pageHtml + '</html>';
		var $comp = $( '.'+localCss );
		//$comp.slick ( {infinite: true} );
		
		//$('.your-element').slick('slickAdd',
		$comp.slick ( 'slickAdd', html );
		//$comp.find ( ".slick-track" ).append ( html );
		$comp.slick ( 'slickGoTo', numberItems );
		
		numberItems++;
	}
	
	/**
	 * Remove a page (need to select previous page)
	 */
	this.delPage = function ( uniqueId )
	{
		var sel = $('#page-' + uniqueId);
		sel.remove();
		numberItems--;
	}
	
	/**
	 * Reset content of a page with pageId and new html
	 */
	this.resetPage = function ( pageId, newHtml )
	{
		$('#page-' + pageId).html ( newHtml );
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
		if ( idx<0 || idx >= numberItems) {
			idx = numberItems -1;
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
		$('.'+localCss).slick ({
			infinite: false,
			touchThreshold: 5,
			arrows: false,
			mobileFirst: true,
			respondTo: 'min'
        });

		var lastIndex = -1;
		$('.'+localCss).on('afterChange', function(slider,slide) {
			// pass slide event to listener
			var index = slide.currentSlide;
			if ( listener && listener.slideEvent ) {
				if ( index != lastIndex ) {
					listener.slideEvent ( index );
					lastIndex = index;
				}
			}
		});
	}
}
;/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 */
App.ImagesPanel = function ()
{
	this.flow = { items: 
		[
		]
	};
	
	var myInst = undefined;
	var myId = undefined;
	var divId = undefined;
	var phId = undefined;
	var foId = undefined;
	var onlyOnce = true;
	var parentList = undefined;
	
	// images 
	var images = [ 'share10-pic.jpg', 'IMG_2835.jpg' ];  
	var imageIdx = 0;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 *  
	 */
	this.createUI = function ( flowList, config )
	{
		myInst = this;
		myId = this.compId;
		divId = 'ip-' + myId;
		phId  = 'ph-' + myId;
		foId  = 'fo-' + myId;
		
		var winWidth = $(window).width();
		
		var html = '<div id="' + divId + '" style="width:' + winWidth +'px" >' +
			 nextImageHtml() +
		'</div><div id="' + phId + '" ></div><div id="' + foId + '" ></div>';
		
		return html;
	}

	/**
	 * Show textHtml message centered on page as top layer
	 */
	function showMessage ( textHtml )
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var textWidth = winWidth - (winWidth/2) + 70;
		var top = (winHeight / 2) - 40;
		var left = (winWidth - textWidth) / 2;
		var nstyle = 'position:absolute;top:' + top + 
			'px;left:' + left + 'px;z-index:20;width:' + textWidth + 'px';
		var html = '<div style="' + nstyle + '" >' + textHtml + '</div>';
		
		$('#'+phId).html ( html );
	}
	
	/**
	 * Show textHtml message centered on page as top layer
	 */
	function showFooter ( textHtml )
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		var top = winHeight - 90;
		var nstyle = 'position:absolute;top:' + top + 'px;left:20px;z-index:20;width:90%';
		var html = '<div style="' + nstyle + '" >' + textHtml + '</div>';
		
		$('#'+foId).html ( html );
	}	
	
	/**
	 * Gets next image html
	 */
	function nextImageHtml ()
	{
		if ( imageIdx >= images.length ) {
			imageIdx = 0;
		}
		var winWidth = $( window ).width();
		var imgWidth = winWidth + 200 ;
		
		var html = '<img  id="' + myId + '" src="app/res/img/' + images[imageIdx] + 
			'" style="float:left;width:' + imgWidth + 'px;"  />'
		imageIdx++;
		
		return html;
	}
		
	/**
	 * Starting timer for background operation
	 */
	function startTimer ()
	{
		setTimeout(handler, 1000);
		
		function handler ()
		{
			console.log ( 'timer handler invoked ' );
			
			var $divId = $( '#' + divId );
			$divId.css( {position: 'absolute'} );
			$divId.animate({ top: "-100px",}, 8000 );
			
			$divId.animate({ left: "-200px",}, 8000, function() 
			{
				$divId.fadeOut('fast', function(){
					var imgHtml = nextImageHtml ();
					$divId.html( imgHtml ).fadeIn('fast', function() {
					});
					$divId.css( {position: 'absolute'} );
					$divId.css( {top: '0px'} );
					$divId.css( {left: '0px'} );		
				});				
			});
		}
	}
	
	/**
	 * Timer to show messages
	 */
	function startTextTimer ()
	{
		//console.debug ( 'text timer');		
		setTimeout(textHandler, 1000);

		function textHandler ()
		{
			console.debug ( 'text timer handler');		
			showMessage ( '<div style="color:white;font-weight:bold;font-size:130%;">Ten (or less) most important things to you in any category!</div>' +
					'<div style="color:white;font-size:130%;">Think high quality! Share it with your friends.</div>'	);
			
			var footer = '<div style="color:#F0F0F0;font-size:90%;"><b>Share 10</b> is an example of a "Universal Application" developed with the <a href="http://simpler-apps.com" target="_blank">Simpler Apps Framework</a>. ' +
			'<p style="font-size:80%;color:#C8C8C8;font-family:monospace">' +
			'Copyright (c) 2015 HQ APPS Consulting. All rights reserved.</p></div>';
			  
			showFooter ( footer );
		}
	}
		
	/**
	 * After component is loaded in page  
	 */
	this.postLoad = function ()
	{
		//console.debug ( 'pl introPage');

		// start timer after loading page
		startTimer();
		
		if ( onlyOnce ) {
			startTextTimer ();
			onlyOnce = false;
		}
		
		// Accept event if return true
		var lastTimeStamp = 0;
		function acceptEvent ( event ) {
			var yes = event.timeStamp - lastTimeStamp > 1;
			lastTimeStamp =  event.timeStamp;
			return yes;
		}
	}
}


;/**
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

;
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
;
/**
 * Shows a link in a frame
 */
App.LinkFrame = function ()
{	
	var myId ;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObject, config )
	{
		var html = '';
		
		var srcUrl = config.srcUrl;
		if (!srcUrl) srcUrl = '';
		
		myId = this.compId;
		
		// header
		html += '<iframe style="width:100%; height:700px; border:0px;margin-top:-10px;" src="' +srcUrl + 
		'" id="' + myId + '"></iframe>';
		
		return html;
	}
	
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{

	}
}

;/**
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

;
/**
 * Lists template and memeory manager
 */
App.ListsManager = function ()
{
	var htmlCache = {};
	var compId = 20000;
	
	/**
	 * Gets cached html for full list object
	 */
	this.getListHtml = function ( listener, listObj, editMode, addTile ) 
	{
		var html = htmlCache [ listObj.id ];
		if ( !html ) {
			if ( editMode == undefined )
				editMode = true;
			if ( addTile == undefined ) {
				addTile = listObj.fId == undefined;
				if ( listObj.nshare == true )
					addTile = false;
			}
			var view = getListView ( listener, listObj, editMode, addTile );
			html = SA.createUI ( compId, view );			
			htmlCache [ listObj.id ] = html;  
		}
		return html;
	}
	
	/**
	 * Gets cached html for full list object
	 */
	this.getItemHtml = function ( listener, itemObj ) 
	{
		var html = htmlCache [ itemObj.id ];
		if ( !html ) {
			var view = getItemView ( listener, itemObj, true, true );
			html = SA.createUI ( compId, view );			
			htmlCache [ itemObj.id ] = html;  
		}
		return html;
	}

	
	/**
	 * Notify that the list or item has changed to delete cache asso with it 
	 */
	this.notifyChanged = function ( listId, itemId )
	{
		if ( listId && htmlCache[listId]!=undefined ) {
			delete htmlCache[listId];
		}
		if ( itemId && htmlCache[itemId]!=undefined ) {
			delete htmlCache[itemId];
		}
	}
	
	/**
	 * Gets list model 
	 */
	function getListView ( listener, listObj, editMode, addTile  ) 
	{
		var cards = {lc:'App.CardPanel', user:listObj.user, config: {title:listObj.title, 
			desc:listObj.description, id:listObj.id, editMode:editMode, addTile:addTile, 
			maxComm:listObj.maxComm }, 
			items: [] };
		
		if ( listObj.items ) {
			for ( i=0; i<listObj.items.length; i++ ) {
				var item =  listObj.items [ i ];
				var card = getItemView ( listener, item, false, false );
				cards.items.push ( card );
			}
		}
		return cards;
	}
	
	/**
	 * Gets item model 
	 */
	function getItemView ( listener, item, zoom, edit ) 
	{
		var imageUrl = undefined;
		if ( item.mediaId ) {
			imageUrl = SA.server.getMediaUrl( item.mediaId);
		}		
		var card = {lc:'App.Card', config:{id:item.id, listId: item.listId, ttitle: item.title, stitle: item.stitle, 
			imageUrl:imageUrl, mediaUrl:item.mediaUrl, info: item.info, lname: item.lname, link: item.link, editMode: edit, zoomMode: zoom,
			listener:listener, nshare:item.nshare, maxComm:item.maxComm, timeMs:item.timeMs}  };

		if ( zoom == true) {
			var cards = {lc:'App.CardPanel', config: {editMode:edit, addTile:false, height:'1000px' }, items: [] };		
			cards.items.push ( card );
			return cards;
		}
		return card;
	}
}

;
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
;
/**
 * Text Area component
 */
App.Loading = function () 
{		
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	// Application Global Styles
    this.css =  { items:
    	[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[			 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[				 
			]
		}
		]
    };
    
    var myId = undefined;
    
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObj, config )
	{
		myId = 'load-' + this.compId;
		var html = getIconHtml();
		
		// Create an element with id == flowList.name ( or eq divElementId )
		var $etc = $("#page-etc");
		if ( !$etc.length  ) {
			$etc = $('<div id="page-etc" />').appendTo('body');
			$etc.append ( html );
		}
		return '';
	}
	
	/**
	 * Show icon centered in page
	 */
	function getIconHtml ()
	{
		var winWidth = $(window).width();
		var winHeight = $(window).height();
		
		var divHeight = 50;
		var top = winHeight/2 - divHeight/2 - 20;
		
		var divWidth = 80;
		var left = winWidth/2 - divWidth/2 + 20;
		var imgWidth = divWidth /3;
		
		var nstyle = 'display:none;border-radius:10%;position:fixed;top:' + top + 
			'px;left:' + left + 'px;z-index:1000;width:' + divWidth + 'px;height:' + divHeight + 'px';
		
		var html = '<div id="' + myId + '" style="' + nstyle + '" >' + 
			'<img src="app/res/img/loading.gif" width="' + imgWidth +'" /></div>';
		return html;
	}
	
	/**
	 * start animation 
	 */
	this.start = function ()
	{
		var $myId = $('#'+myId);
		$myId.show ();
	}
	
	/**
	 * Stop animation 
	 */
	this.stop = function ()
	{
		var $myId = $('#'+myId);
		$myId.hide ();
	}
}

;
/**
 * Login component 
 */
App.LoginComp = function ()
{	
	var defLoginLabel = 'Sign In';
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		var loginLabel = SA.getConfigValue ( atomObj, 'label', defLoginLabel);
		
		if ( isLoggedIn() ) {
			return 'Sign out';			
		}
		else {
			return loginLabel;
		}
	}	
	
	function isLoggedIn ()
	{
		var auth = SA.getUserAuth ();
		if ( auth && auth.status == 'OK' )
			return true;
		return false;
	}
}
;
/**
 * Message component for displaying messages in the UI 
 */
App.Message = function ()
{
	// local css classes
	this.css = { items: 
		[
		{name: '.errmsg', value: 'padding:0px;font-weight:normal;color:#FF9900;font-size:120%;' },
		{name: '.okmsg', value: 'padding:0px;font-weight:normal;color:#00CC00;font-size:120%;' }		
		]
	};
	
    var cssErrMsg = undefined;
    var cssOkMsg = undefined;
    var myId = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myId = atomObj.name;
		
		cssErrMsg = SA.localCss (this, 'errmsg');
		cssOkMsg = SA.localCss (this, 'okmsg');
		
		return '<div class="' + cssErrMsg + '" id="' + myId + '" ></div>'; 
	}	
	
	/**
	 * show message method called from ouside object
	 */
	this.showMessage = function ( msg, success )
	{
		var $div = $( '#'+myId );
		
		if ( !success ) {
			$( $div ).removeClass ( cssOkMsg );
			$( $div ).addClass ( cssErrMsg );			
			$( $div ).html (  msg );
		}
		else {
			$( $div ).removeClass ( cssErrMsg );
			$( $div ).addClass ( cssOkMsg );			
			$( $div ).html (  msg );			
		}
	}
}
;/**
 * Page flipper component that will slide content back and forth 
 */
App.PageFlipper = function ()
{
	// stylesheets for this component
	this.css = { items: 
		[
        /* Everything else */
        {name: '@media (min-width: 481px)', items: 
            [
            {name:'fcls', value:'width:500px;height:400px;background-color:#f9f9f9;'}
            ]
        },

        /* Mobile sizes */
        {name: '@media (max-width: 480px)', items: 
            [
            {name:'fcls', value:'width:100%;height:400px;background-color:#f9f9f9;'}             
            ]
        }
		]
	};
	
	var myId,  myComp, butNext, butPrev;
	var pageIdx = 0; // start before first page
	var pageIdx   = 0;
	var maxPages  = 0;
		
	// pages array to keep info about pages such as div name, etc.  
	var pagesArray = new Array();
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * Optional configuration:
	 * 
	 * // Based on images
	 * config: {
	 *    pages: [
	 *		{title:'page1', img:'app/res/img/image1.jpg'},    	
	 *		{title:'page2', img:'app/res/img/image2.jpg'}    	
	 *    ]
	 * }
	 */  
	this.createUI = function ( listObj, allConfig )
	{
		myId = this.compId;
		myComp = this;
		var pages;
		
		if ( listObj.config && listObj.config.pages ) {
			pages = listObj.config.pages;
		}
		if ( pages ) {
			for (i=0; i<pages.length; i++ ) {
				var id = 'pf-'+ i + '-';
				var p = { name:id+myId, id:i, title:pages[i].title, html:getImgHtml(pages[i].img) };
				pagesArray.push ( p );
			}
			maxPages = pages.length;
		}
		var fcls = SA.localCss (this, 'fcls');
		
		var html = '<div id="' + myId + '" class="' + fcls +'" >';
		for ( i=0; i<maxPages; i++ ) {
			html += '<div id="' + pagesArray[i].name + '" style="display:none" ></div>';
		}
		html += '</div>';
		
		SA.fireEvent (myId, {cmd:'refresh'} );
		
		return html;
	}
	
	/**
	 * Handle custom event
	 */
	this.handleEvent = function ( event )
	{
		//console.debug ('handle event: ' + event.cmd );
		if ( event.cmd == 'refresh' ) {
			myComp.showNext();
		}
	}
		
	/**
	 * Get img html from path
	 */
	function getImgHtml ( imgPath )
	{
		return '<img src="' + imgPath + '" width="100%" />';
	}

	/**
	 * GO BACK: Slide panel right (go left)
	 */
	function slideRight ( $prev, $next, clear )
	{
		var winWidth = $(window).width();		
		if ( !allowSlide(winWidth) ) {
			if (clear ) {
				$next.html ('');
			}
			$next.hide();
			$prev.fadeIn ('slow');
			return;
		}		
		var nleft =  winWidth+'px';
		$next.css('width', winWidth+'px' );
		
		$prev.show();
		
 		$next.animate({"left":nleft}, "fast", function() {
			if (clear ) {
				$next.html ('');
			}
		});
	}
	
	/**
	 * GO NEXT: Slide panel left (go right)
	 */
	function slideLeft ( $prev, $next )
	{
		var winWidth = ($prev)? $prev.width() : $(window).width();
		var prevLeft = ($prev)? $prev.position().left : 0;
		if ( !allowSlide(winWidth) ) {
			$prev.hide();
			$next.fadeIn ('slow');
			document.location.href="#top";			
			return;
		}
		var zindex = 10 * pageIdx;
		$next.css( {'z-index': zindex} );
		
		// next div attributes 
		//var top = 0 ;	// banner and tb
		$next.css( 'position', 'fixed' );
		$next.css( 'overflow-y', 'scroll' );
		$next.css( '-webkit-overflow-scrolling', 'touch' ); 						
		//$next.css( 'top', 0+'px' );
		$next.css( 'padding-top', top+'px' ); 		
		$next.css( 'height', '100%'  );
		
		var nleft = winWidth; 
		$next.css('left', nleft+'px');
		$next.css('width', winWidth+'px' );
        
        // show next div
		$next.show();
		// hide panel before slide reduces flicker 
		if ($prev) {
			$prev.hide();
		}
		
		$next.animate({"left":prevLeft+'px'}, "fast", function() {
			//hide prev
			//$prev.hide();
		});
	}
	
	/**
	 * Show next page (wraps around) of data already set in slider
	 */
	this.showNext = function ()
	{		
		if ( pageIdx >= maxPages ) {
			pageIdx = 0;
		}
		myComp.showNextPage ( pagesArray[pageIdx].id,  
				pagesArray[pageIdx].title, pagesArray[pageIdx].html );
	}
	
	/**
	 * Shows previous page
	 */
	this.showPrevious = function ()
	{
		if ( pageIdx == 1 ) {
			pageIdx = maxPages;
			return;
		}
		lastDataId = 0;
		pageIdx--;
		
		var $p0 = $('#' + pagesArray [pageIdx-1].name );
		var $p1 = $('#' + pagesArray [pageIdx].name );
		
		var clear = true;
		
		slideRight ( $p0, $p1, clear );
		
		// back to oroginal position
		//var scrollYPos = pagesArray[pageIdx].ypos;
		//scrollToYPos ( scrollYPos );
	}
	
	/**
	 * Show page html (as next page and then user can go back)
	 */
	this.showNextPage = function ( dataId, title, pageHtml ) 
	{
		if ( pageIdx == 0 ) {
			clearAllHtml ();
			var $fp = $('#' + pagesArray [0].name );
			$fp.html ( pageHtml);
			$fp.fadeIn ('fast');
			pageIdx++;
			return;
		}
		lastDataId = dataId;
		
		pagesArray [pageIdx].title = title;
		pagesArray [pageIdx].dataId = dataId;
		// Get current page TB state
	
		var $p0 = $('#' + pagesArray [pageIdx-1].name );
		var $p1 = $('#' + pagesArray [pageIdx].name );
		
		// get scroll top Y position
		//pagesArray[pageIdx].ypos = $(window).scrollTop();
			
		$p1.hide();
		$p1.html ( pageHtml );
		
		//document.location.href="#top";		
		slideLeft ( $p0, $p1 );
		pageIdx++;
	}
	
	/**
	 * Clear all html from pages
	 */
	function clearAllHtml ()
	{
		for (i=0; i<pagesArray.length; i++ ) {
			$('#'+pagesArray[i].name).hide();
		}
	}
	
	/**
	 * return true is allowed slide affect
	 */
	function allowSlide ( winWidth )
	{
		//return winWidth < 500 && SA.utils.isMobileDevice();
		return true;
	}

	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
		console.debug ( 'post load' );
		// Next page
		$('#' + myId ).on( "swipeleft", function( event ) {
			//console.log ( '<-- swipe' );
			if ( !accept (event) ) return;
			//console.log ( '<-- swipe ts: ' + event.timeStamp );
			myComp.showNext ();
		});
		
		// Prev page
		$('#' + myId ).on( "swiperight", function( event ) {
			//console.log ( 'swipe -->' );
			if ( !accept (event) ) return;			
			//console.log ( 'swipe --> ts: ' + event.timeStamp );
			myComp.showPrevious();
		});	
		
		$('#' + myId ).on ( 'tap', function(event) {
			if ( !accept (event) ) return;
			//console.log ( 'tap ts: ' + event.timeStamp);			
		});		
		
		// accept event
		var lastTime = 0;
		function accept (event ){
			var ret = event.timeStamp > lastTime;
			lastTime = event.timeStamp;
			return ret;
		}		
	}
	
	/**
	 * Scroll page for mobile and browsers
	 */
	function scrollToYPos ( ypos )
	{
		if ( SA.utils.isMobileDevice() ) {
			window.scrollTo (0, ypos);
		}
		else {
			$('html, body').animate({
			    scrollTop: ypos,
			    scrollLeft: 0
			}, 0);
		}
	}
};
;
/**
 * Text Area component
 */
App.ShareComp = function () 
{		
	// remember value entered
	var fieldValue = '';
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
        /* Everything else */
        {name: '@media (min-width: 481px)', items: 
            [
            {name:'.im-style', value:'width:65px;' },
            {name:'.im-div', value:'float:left;padding-right:20px;'}
            ]
        },

        /* Mobile sizes */
        {name: '@media (max-width: 480px)', items: 
            [
            {name:'.im-style', value:'width:50px;' },
            {name:'.im-div', value:'float:left;padding-right:15px;'}
            ]
        }
		]
	};
	
	var imgCls, imgdCls;
	var myId;
	var fbId, mailId, twId;
	var urlsMap = {};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObj, config )
	{
		if ( !atomObj.value  ) {
			return;
		}
		imgCls = SA.localCss (this, 'im-style');
		imgdCls = SA.localCss (this, 'im-div' );
		myId = this.compId;
		fbId = 'fb-' + myId;
		mailId = 'mail-' + myId;
		twId = 'tw-' + myId;
		
		html = makeListShareText ( atomObj.value  );
		return html;
	}
	
	/**
	 * Make share list text
	 */
	function makeListShareText ( content )
	{
		var html = 
		'<div id="' + myId + '" >' +
			getImgLink ( mailId, 'icon_mail.jpg', 'Email', "mailto:?subject=Check%20out%20how%20ridiculously%20responsive%20these%20social%20buttons%20are&amp;body=http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%2Findex.html" ) + 
			getImgLink ( fbId, 'icon_fb.jpg', 'Facebook', 'http://www.facebook.com' ) + 
			getImgLink ( twId, 'icon_twitter.jpg', 'Twitter', 'http://www.google.com' ) + 
		'</div>';
		
		/*
		var html =  
		'<div><ul>'+
		  '<li>'+
		    '<a href="mailto:?subject=Check%20out%20how%20ridiculously%20responsive%20these%20social%20buttons%20are&amp;body=http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%2Findex.html" target="share-email">'+
		    'Email</a></li>'+
		  '<li>'+
		    '<a href="https://www.facebook.com/sharer/sharer.php?u=http://kurtnoble.com/labs/rrssb/index.html" target="_blank">'+
		    'Facebook</a></li>'+  
		  '<li class="rrssb-twitter">'+
		    '<a href="https://twitter.com/intent/tweet?text=Ridiculously%20Responsive%20Social%20Sharing%20Buttons%20by%20%40dbox%20and%20%40joshuatuscan%3A%20http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%20%7C%20http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%2Fmedia%2Frrssb-preview.png" target="_blank">'+
		    'Twitter</a></li></ul></div>';
		*/
		return html;
	}
	
	function getImgLink ( divId, imgName, linkName, url )
	{
		urlsMap [divId] = url;
		
		var html = 
		'<div id="' + divId + '" class="' + imgdCls + '" >'+
			'<img class="' + imgCls + '" src="res/img/'+ imgName +'" />' +
			'<div style="font-size:90%;text-align:center;padding:3px;">' + linkName + '</div>'+
		'</div>';
		return html;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		$('#'+fbId).on ( 'tap', function (event) {
			//window.open( urlsMap[fbId], '_system');
			console.debug ( 'fb click: ' + urlsMap[fbId]);
			App.util.openUrlInWindow ( urlsMap[fbId] );
		});
		
		$('#'+twId).on ( 'tap', function (event) {
			console.debug ( 'tw click: ' + urlsMap[twId]);
			App.util.openUrlInWindow ( urlsMap[twId] );
		});

		$('#'+mailId).on ( 'tap', function (event) {
			console.debug ( 'mail click: ' + urlsMap[mailId]);
			App.util.openUrlInWindow ( urlsMap[mailId] );			
		});
	}
}

;/**
 * ItemsDialogs 
 */
App.ShareDialogs = function ()
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
		{name:'sharelist-dlg', lc:'App.Dialog', items:
			 [
			 {name:'sharelist-form', lc:'App.FormHandler', 
				 	config:{title:'Share Your List', listener:this}, items: 
				 [
				 {html:'div', style:'height:8px;'},

				 {html:'p', style:'font-size:110%', 
					 value:"Copy message below and paste into a Text Message or Email and send it to your friends!" },
				 
				 {name:'shareHtml', ac:'App.TextArea', info:'', 
					 required:true, pattern:'text', config:{rows:5, style:'background-color:#F0F0F0'} }, 
					 
				 {html:'div', style:'height:12px;'},

				 {cmd:'cmdCancelShare', ac:'App.Button', label:'Done', config:{theme:'clear'} },
				 {html:'div', style:'height:10px;'}		
				 ]
			 }
			 ]
		}]
	};

	// other state
    var compId;
    var currentDlgName;

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		compId = this.compId;
		var html =  SA.listCreateUI ( compId, flowList, config, true );
		return html;
	}
	
	/**
	 * Show a dialog with name
	 */
	this.showDialog = function ( listId, listTitle )
	{
		if ( App.util.isMobileApp() ) {
			var subject = 'Sharing list: ' + listTitle;		
			var msg = 'I am sharing "Share 10" list name: "' + listTitle + '" with you!. Click link below:\n';
			var link = SA.server.getMyHostName() + '/?id=' + listId;			
			window.plugins.socialsharing.share ( msg, subject, null, link );
		}
		else {
			var form = { shareHtml:shareContent(listId, listTitle) };
			showDlg ( 'sharelist-dlg', form );			
		}
	}
	
	/*
	 * General show dialog function 
	 */
	function showDlg ( newDlgName, newForm )
	{
		currentDlgName = newDlgName;
		currentDlg = SA.lookupComponent ( currentDlgName );
		if ( currentDlg ) {
			if ( newForm ) {
				currentDlg.updateForm (newForm );
			}
			currentDlg.showDialog (true);
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdCancelShare' ) {
			currentDlg.showDialog (false);
		}
	}
	
	/*
	 * Gets share content string
	 */
	function shareContent ( listId, listTitle )
	{
		var html = 
		'I am sharing "Share 10" list name: "' + listTitle + '" \n' +
		'To access click link: ' + SA.server.getMyHostName() + '/?id=' + listId;
		return html;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
	}
}

;
/**
 * Text Area component
 */
App.TextArea = function ()
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { 
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * rows: number of rows
	 * cols: number of columns 
	 */
	this.createUI = function ( atomObj, config )
	{
		this.atomObj = atomObj;
		
		var divId = this.compId;
		
		var rows = SA.getConfig ( atomObj, 'rows', 3);
		var cols = SA.getConfig ( atomObj, 'cols', -1 );
		var style = SA.getConfig ( atomObj, 'style', '' );
		
		var placeHolder = '';
		
		if ( atomObj.info ) {
			var reqtext = '';
			//if ( atomObj.required ) 
				//reqtext = ' (required)';
			placeHolder = ' placeholder="' + atomObj.info + reqtext + '"'; 
		}

		// get label
		var labelStr = '';
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		fieldValue = atomObj.value;
		var valStr = '';		
		if ( fieldValue && fieldValue != '' ) {
			valStr = fieldValue;
		}		
		else {
			fieldValue = '';
		}
		
		var html =
		'<div class="form-group" >'+ labelStr +   
			'<div class="col-md-12">' +
		  		'<textarea style="font-size:110%;' + style + '" class="form-control" rows="' + rows + '" id="' + 
		  			divId + '" ' + placeHolder +' >' + fieldValue + '</textarea>' +
		  	'</div>' +
		'</div>';
		
		/*
		var html =
		'<div class="form-group">'+
			//'<label class="col-md-3 control-label" for="name">'+ 'Enter text:' +'</label>' +
			'<div class="col-md-12">' +
				'<textarea class="" ' + 
				'id="' + divId + '" rows="' + rows + '"' +colsStr + placeHolder +'>' + 
				fieldValue + '</textarea>' + 
			//'</div>' + 
		'</div>';
		*/
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	this.getValue = function ()
	{
		fieldValue = $("#" + this.compId).val();
		return fieldValue;
	}
	
	this.getName = function()
	{
		return this.atomObj.name;
	}
}
;
/**
 * Text Area component
 */
App.TextField = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = {
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: 'password', 'text'
	 * 
	 * child list: atom fields:
	 * info: info inside field
	 * label: label outside field
	 */
	this.createUI = function ( atomObj, config )
	{
		this.atomObj = atomObj;		
		var divId = this.compId;
		
		var placeHolder = '';
		
		var type = SA.getConfigValue (atomObj, 'type', 'text');
		var typeStr = 'type="' + type + '"';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			var reqtext = '';
			//if ( atomObj.required ) 
				//reqtext = ' *';
			placeHolder = 'placeholder="' + atomObj.info + reqtext + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		fieldValue = atomObj.value;
		var valStr = '';		
		if ( fieldValue && fieldValue != '' ) {
			valStr = 'value="' + fieldValue + '" ';
		}
		
		// form created here
		var html =
		'<div class="form-group">'+ labelStr + 
			'<div class="col-md-12">' +
		  		'<input '+ typeStr + ' style="font-size:110%;" class="form-control" id="' + 
		  			divId + '" ' + valStr + placeHolder +' />' +
		  	'</div>' +
		'</div>';
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		fieldValue = $("#" + this.compId).val();
		return fieldValue;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return this.atomObj.name;
	}	
}
;//var App = {};

/**
 * BannertHandler Object  
 */
App.TopTB = function ()
{
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.title1', 
				value:'float:left;font-size:120%;width:100%;text-align:left;background-color:#FFF5E6;'}
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.title1', 
				value:'float:left;font-size:100%;width:100%;text-align:left;background-color:#FFF5E6;'},
			]
		}
		]
	};
	
	var myId = undefined;
	var listener = undefined;
	var myInst = undefined;
	
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
		myId = this.compId;
		myInst = this;
		var title1Css = SA.localCss ( this, 'title1');
		
		listener = SA.getConfig (parentList, 'listener' );
		
		var tileMode = SA.getConfig (parentList, 'tileMode' );
		var retHtml = '';
		
		if ( tileMode == true ) {
			var title1 = 'Follow this list?';
			
			retHtml = 
			'<div id="' + myId + '" >' +
				'<div>'+
					'<div style="" >' +
						'<div id="left-'+myId + '" class="' + title1Css + '">' +
							'<div style="padding:5px;background-color:#E6EBF0">' + title1 + 
							getButtonsHtml () +  
						'</div></div>' + 
					'</div>'+
				'</div>'+
			'</div>' ;
		}
		else {
			var title1 = '<b>Welcome to "Share 10" . .</b> Your friend is sharing this list with you! &nbsp;&nbsp;Please "Sign In" to follow it.';
			
			retHtml = 
			'<div id="' + myId + '" class="container" style="margin-top:0px" >' +
				'<div class="row" >'+
					'<div class="col-md-8 col-md-offset-2" style="padding-left:6px" >' +
						'<div id="left-'+myId + '" class="' + title1Css + '">' +
							'<div style="padding:3px">' + title1 + '</div>' +
						'</div>' +
					'</div>'+
				'</div>'+
			'</div>' ;			
		}
			
		return retHtml;
	}
	
	function getButtonsHtml ()
	{
		var buttons = { html:'span', items:
			[
			{name:'shareRem', ac:'App.Button', label:'No', 
				style:'margin-left:10px;font-size:80%;background-color:#E6EBF0;',
				config:{theme:'blank', listener:myInst} },
			{name:'shareAdd', ac:'App.Button', label:'Yes', 
				style:'margin-left:6px;font-size:80%;background-color:#E6EBF0;',
				config:{theme:'blank', listener:myInst} }			 
			]
		};
		var html = SA.createUI ( myId, buttons );
		return html;
	}
	
	/**
	 * Action performed by button clicks
	 */
	this.performAction = function ( shareActionName )
	{
		//console.debug ( 'action perf: ' + event );
		if ( listener && listener.actionPerformed ) {
			listener.actionPerformed ( {cmd:shareActionName})
		}
	}
	
	/**
	 * Select tab by index (starts with 0)
	 */
	this.selectTab = function ( index )
	{
	
	}
	
	/**
	 * Notify listener with new index
	 */
	function notifyListener ( curIndex )
	{
		//if ( curIndex == selIdx) 
			//return;
		//selIdx = curIndex;
		
		if  ( listener && listener.actionPerformed ) {
			listener.actionPerformed ( {cmd:'showIntro', selIdx:curIndex} );
		}
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created)
	 */ 
	this.postLoad = function ()
	{
		/*
		var $left =  $('#left-'+myId );
		var $right = $('#right-'+myId );
		var myComp = this;
		
		// NOTE: Fastclick causes multiple events to be fired
		
		$left.click ( function (event) {
			myComp.selectTab (0);
		});
		
		$right.click ( function (event) {
			myComp.selectTab (1);			
		});
		*/				
	}
};
;
/**
 * Text Area component
 */
App.UploadBrowser = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;

	// remember value entered
	var atomObj = undefined;
	var imgFile = undefined;
	var ytubeUrl = undefined;
	var myId = undefined;
	
	// what to show as default picture
	var defaultPicUrl = 'app/res/img/your-picture.png';
	
	/**
	 * YouTube share URL
	 */
	this.flow = { items: 
		[		
		{name:'youtube-dlg', lc:'App.Dialog', items:
			[
			{name:'youtube-form', lc:'App.FormHandler', 
				config:{title:'Embed YouTube Video', listener:this}, items: 
				[
				{html:'p', style:'font-size:100%', 
					 value:"YouTube video URL (copy and paste video link here)" },				
				{name:'youtubeUrl', ac:'App.TextField', info:'YouTue video URL', required:true, pattern:'text' },
				{html:'div', style:'height:6px;'},
				
			    {cmd:'cmdUTubeUrl', ac:'App.Button', label:'OK', config:{theme:'color'}},
			    {cmd:'cmdUTubeCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				{html:'div', style:'height:6px;'}			    
				]
			}
			]
		}
		]
	};	
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.card', value:'margin-bottom:3px; border: 1px solid #dddddd;padding:0px;background-color:#f9f8f7' },			 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.card', value:'margin-bottom:1px; border: 1px solid #dddddd;padding:0px;background-color:#f9f8f7' },			 
			]
		}
		]
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: 'password', 'text'
	 * 
	 * child list: atom fields:
	 * info: info inside field
	 * label: label outside field
	 */
	this.createUI = function ( obj, config )
	{
		myId = this.compId;
		atomObj = obj;
		
		// allow dialog to get created
		SA.listCreateUI ( myId, this.flow );
		
		var placeHolder = '';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			placeHolder = 'placeholder="' + atomObj.info + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		// EDIT OP: assume the picture URL is in value 
		if ( atomObj.value && atomObj.value.length>0 ) {
			defaultPicUrl = atomObj.value;
			// reset values
			atomObj.value = undefined;	
			imgFle = undefined;
		}
		else {
			defaultPicUrl = 'app/res/img/your-picture.jpg'
		}
		
		var setPT = {name:'set-photo-'+myId, ac:'App.Button', style:'font-size:90%;margin-right:5px;', 
				label:'Set photo', config:{theme:'blank'} };
		var setUT = {name:'set-utube-'+myId, ac:'App.Button', style:'font-size:90%;margin-right:5px;', 
				label:'YouTube', config:{theme:'blank'} };
		
		var remObj = {name:'rem-photo-'+myId, cmd:myId, ac:'App.Button', style:'font-size:90%;', 
				label:'Remove', config:{theme:'blank'} };
		
		var setPTHtml = SA.listCreateUI ( myId, setPT, null, true );
		setPTHtml = SA.injectClass ( setPTHtml, 'needsclick');
		
		var setUTHtml = SA.listCreateUI ( myId, setUT, null, true );
		setUTHtml = SA.injectClass ( setUTHtml, 'needsclick');
		
		//var remHtml = SA.listCreateUI ( myId, remObj, null, true );
		//remHtml = SA.injectClass ( remHtml, 'needsclick');		
		 
		// get local css name (i.e. css name defined in this object)
		var cssCard = SA.localCss(this, 'card');
		
		var mediaHtml = '';
		if ( isEmbedVideoUrl ( defaultPicUrl ) ) {
			mediaHtml = App.util.getYouTubeHtml ( defaultPicUrl );
		}
		else {
			mediaHtml = '<img  class="img-responsive" src="' + defaultPicUrl + '">' ;
		}
		
		var html =
		'<div id="' + myId + '" class="form-group">'+ labelStr + 
			'<div class="col-md-12">' +
				'<div id="preview-div" class="' + cssCard + '">' +
					mediaHtml + 
				'</div>' +
				'<div>' + setPTHtml + 
					'<input type="file" id="file-' + myId + '" style="display:none" />' +
					setUTHtml +
					//remHtml + 
				'</div>'+
			'</div>' +
		'</div>';
		
		return html;
	}

	/*
	 * True for embedded video URL
	 */
	function isEmbedVideoUrl ( url )
	{
		return url.indexOf ('youtu') > 0 ;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		if ( ytubeUrl )
			return ytubeUrl;
		return imgFile;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return atomObj.name
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog (  dialogName )
	{
		var dlg = SA.lookupComponent ( dialogName );
		if ( dlg ) {
			dlg.showDialog (true, '', 'appBanner' );
		}
		return dlg;
	}
	
	function hideDialog ()
	{
		var dlg = SA.lookupComponent ( 'youtube-dlg' );
		dlg.showDialog (false, '', 'appBanner');
	}	
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			return false;
		}
		return true;
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdUTubeUrl' ) {
			if ( validate ( 'commMsg', atomList, dataObj ) ) {
				ytubeUrl =  dataObj.youtubeUrl;
				var embedHtml = App.util.getYouTubeHtml ( ytubeUrl );
				setPreviewHtml ( embedHtml );
			}
		}
		// hide dialog
		hideDialog ();
	}
	
	/**
	 * Page just loaded this component
	 */
	this.postLoad = function ()
	{
		var $setPhoto = $( '#set-photo-'+myId);
		//var $remPhoto = $( '#rem-photo-'+myId);
		var $upload = $( '#file-'+myId );
		var $setUTube = $( '#set-utube-'+myId);
		
		//disableRemButton ( true );
		
		// set photo click event 
		$setPhoto.click ( function (event) {
			//alert ( 'click :' + event );
			ytubeUrl = undefined;
			$upload.trigger('click');
		});
		
		// set youtube click event 
		$setUTube.click ( function (event) {
			showDialog ( 'youtube-dlg' );
		});
		
		// click on remove
		/*
		$remPhoto.click (function (event) {
			clearImage ();
		});
		*/
		
		// upload photo changed event (when file is opened)
		$upload.change ( function (e) {
			e.preventDefault();

			imgFile = this.files[0],
			reader = new FileReader();
			reader.onload = function (event) {
				setPreviewImg ( event.target.result );
			};
			
			reader.readAsDataURL(imgFile);
			//disableRemButton (false);
			return false;
		});
	}
	
	function clearImage ()
	{
		imgFile = undefined;
		//disableRemButton ( true );
		setPreviewImg ( undefined );
		$( '#file-'+myId ).val ( '' );
	}
	
	/**
	 * Enable / disable rem button
	 */
	function disableRemButton ( enable ) {
		$('#rem-photo-'+myId).prop ('disabled', enable);
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewImg ( newImageSrc ) 
	{
		var html = '';
		
		if ( !newImageSrc ) {
			html = '<img class="img-responsive" src="' + defaultPicUrl + '">';
		}
		else {
			html = '<img class="img-responsive" src="' + newImageSrc + '">';			
		}
		setPreviewHtml ( html );
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewHtml ( newHtml ) {
		$('#preview-div').html ( newHtml );
	}	
}
;
/**
 * Variable component
 */
App.Variable = function ()
{	
	var atom = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		atom = atomObj;
		return '';
	}
	
	this.getName = function ()
	{
		return atom.name;
	}
	
	this.getValue = function ()
	{
		return atom.value;
	}
	
	this.setValue = function (val)
	{
		atom.value = val;
	}
}
