
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
