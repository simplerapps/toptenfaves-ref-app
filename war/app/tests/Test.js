if (!App) App = {};

/**
 * Object for main application
 */
App.Test = function ()
{
	this.css = { items:
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.pan', value:'width:90%; margin-left:auto;margin-right:auto;'}
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.pan', value:'width:100%; margin-left:auto;margin-right:auto;'}
			]
		},
		{name:'.theme', value:'height:400px;width:100%;'}			 
		]
	};
	
    var flow = { items: 
    	[
  		{name:'flipper', lc:'App.PageFlipper'}
   		//{name:'p1', style:'background-color:orange;display:none;', class:'slider'},   		 
   		//{name:'p2', style:'background-color:green;display:none;', class:'slider'}
   		]
    };	
	
	/**
	 * This method creates the UI based  
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myId = this.compId;
		
		var cHtml = SA.createUI ( myId, flow );
		
		return '<div id="' + myId + '">' + cHtml + '</div>';
	}
	

	/////// Events to control the slider //// 
	
	this.postLoad = function ()
	{
	
	}
}


