
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

