// Create an instance of the application
App = {};

/**
 * Object for main application
 */
App.PageFlipper = function ()
{
	var myId = this.compId;
	var pageNum = 0;
	var maxPages = 0;
	
    // Application Global Styles
    this.css =  { items:
    	[
		{name:'.slider', value:'height:400px;width:100%;'}			 
    	]
    };
    
    /**
     * Flow section of the main app  (very similar to the HTML div tags of main app structure). 
     * 
     * The flow list definition defines the Model of the application. The List and Atom components define the view (UI) of the application
	 */
    this.flow = { items: 
    	[
  		{name:'p0', style:'background-color:silver;', class:'slider' },
   		{name:'p1', style:'background-color:orange;display:none;', class:'slider'},   		 
   		{name:'p2', style:'background-color:green;display:none;', class:'slider'}
   		]
    };
    
	/**
	 * This method creates the UI based on parent atomObj
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myId = this.compId;
		maxPages = this.flow.items.length;
		var cHtml = SA.createUI ( this.compId, this.flow );
		
		return '<div id="' + myId + '">' + cHtml + '</div>';
	}
	
	/**
	 * Adds a new next page and go to it 
	 */
	this.nextPage = function ( pageHtml )
	{
		if ( pageNum < maxPages ) {
			$ ('#' + pageNum).html ( pageHtml );
			slideLeft ();
		}
	}
	
	/**
	 * Go to previous page
	 */
	this.prevPage = function ()
	{
		slideRight ();
	}
	
	/**
	 * Slide left command
	 */
	function slideLeft ()
	{
		if ( pageNum > 1 ) return;
		
		var $p0 = $('#p'+pageNum);
		var $p1 = $('#p'+(pageNum+1));
		
		_slideLeft ( $p0, $p1 );
		pageNum++;
	}
	
	/**
	 * Slide right command
	 */	
	function slideRight ()
	{
		if ( pageNum < 1 ) return;
		pageNum--;
		
		var $p0 = $('#p'+pageNum);
		var $p1 = $('#p'+(pageNum+1));

		_slideRight ( $p0, $p1 );
	}
	
	/**
	 * Peel away last layer
	 */
	function _slideRight ( $prev, $next )
	{
		var winWidth = $(window).width();		
		if ( !allowSlide(winWidth) ) {
			$next.fadeIn (500);
			return;
		}		
		//$next.show();
		$next.css( {position: 'absolute'} );
		//$next.css('left', winWidth+'px'); 
		var nleft =  winWidth+'px';
		$next.css('width', winWidth+'px' );		
		//$next.css('width', winWidth+'px' );
 		//var left = $next.offset().left;
 		$next.animate({"left":nleft}, "fast");
		//$next.css( {position: 'relative'} );
	}
	
	/**
	 * Add new layer
	 */
	function _slideLeft ( $prev, $next )
	{
		var winWidth = $(window).width();
		if ( !allowSlide(winWidth) ) {
			$next.fadeIn (500);
			return;
		}
		$next.css( {position: 'absolute'} );
		//$next.css( {'float': 'left'} );
		$next.css( {"z-index": "100"} );
		var top = $prev.offset().top;
		$next.css( 'top', top+'px' );			
		$next.show();

		var nleft = winWidth; 
		$next.css('left', nleft+'px');
		$next.css('width', winWidth+'px' );

		left = $next.offset().left;
		$next.animate({"left":"0px"}, "fast");
		//$next.css( {position: 'relative'} ); 		
	}
	
	/**
	 * return true is allowed slide affect
	 */
	function allowSlide ( winWidth )
	{
		//return winWidth < 500 && SA.utils.isMobileDevice();
		return true;
	}
	
	var pageNum = 0;
	
	/////// Events to control the slider //// 
	
	this.postLoad = function ()
	{
		// Next page
		$('#' + myId ).on( "swipeleft", function( event ) {
			if ( !accept (event) ) return;
			console.log ( '<-- swipe ts: ' + event.timeStamp );
			_slideLeft ();
		});
		
		// Prev page
		$('#' + myId ).on( "swiperight", function( event ) {
			if ( !accept (event) ) return;			
			console.log ( 'swipe --> ts: ' + event.timeStamp );
			_slideRight ();
		});	
		
		$('#' + myId ).on ( 'tap', function(event) {
			if ( !accept (event) ) return;
			console.log ( 'tap ts: ' + event.timeStamp);			
		});
		
	}
	
	// accept event
	var lastTime = 0;
	function accept (event ){
		var ret = event.timeStamp > lastTime;
		lastTime = event.timeStamp;
		return ret;
	}
}


