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
