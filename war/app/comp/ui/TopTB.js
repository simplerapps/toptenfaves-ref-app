//var App = {};

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
