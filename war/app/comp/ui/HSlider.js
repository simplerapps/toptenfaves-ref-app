
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
