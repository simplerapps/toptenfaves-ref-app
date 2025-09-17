/**
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
