/**

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
