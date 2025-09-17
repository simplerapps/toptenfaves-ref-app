/**
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


