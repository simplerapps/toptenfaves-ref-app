
/**
 * Text Area component
 */
App.EnumField = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	var divId = undefined;
	var idsArray = new Array ();
	var clickCls = undefined;
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
		/* Everything else 
		{name: '@media (min-width: 481px)', items: 
			[
			]
		},
		 
		// Mobile sizes 
		{name: '@media (max-width: 480px)', items: 
			[
			]
		},
		*/
		]
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: 'password', 'text'
	 * 
	 * child list: atom fields:
	 * info: info inside field
	 * label: label outside field
	 */
	this.createUI = function ( atomObj, config )
	{
		this.atomObj = atomObj;		
		divId = this.compId;
		
		var placeHolder = '';
		
		var type = SA.getConfigValue (atomObj, 'type', 'text');
		var typeStr = 'type="' + type + '"';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			placeHolder = 'placeholder="' + atomObj.info + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		var values = atomObj.values;
		if ( !values || values.length == 0 ) {
			alert ( "Invalid State: expected 'values' array with name value objects");
		}
		
		fieldValue = atomObj.value;
		if ( !fieldValue ) {
			fieldValue = '';
		}
		// class to handle click event
		clickCls = makeId ( 'clkgrp');
		
		// UI created here (Remember! use id will allow the postLoad notification)
		var html =
		'<div id="'+ divId + '" class="form-group" >'+
		  '<div class="col-md-12">' + 
			'<div class="btn-group">';
			
		for ( i=0; i<values.length; i++ ) {
			var valObj = values [i];
			var cls = (valObj.name==fieldValue || valObj.value==fieldValue)? 'active' : '';
			cls += ' ' +clickCls;
			
			var id = makeId(valObj.name);
			idsArray.push ( id )
			html += '<button type="button" class="btn btn-default ' + cls + '" id="' + id + '">' + 
				valObj.value + '</button>';
		}
		html += '</div></div></div>';  
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	/**
	 * Make id from divId + idVal
	 */
	function makeId ( idVal )
	{
		return idVal + '-' + divId ;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		return fieldValue;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return this.atomObj.name;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		// handler to the click group class
		$('.' + clickCls).click ( function() {
			fieldValue = $(this).attr ( "id" ); 
		    $(this).addClass ( 'active' );
		    deSelectIds ( fieldValue );
		});
	}
	
	/**
	 * Go through list and make one id active
	 */
	function deSelectIds ( butId )
	{
		for ( i=0; i<idsArray.length; i++ ) {
			if ( idsArray[i] != butId ) {
				var $id = $( '#'+ idsArray[i] );
				if ( $id.hasClass ('active'))
					$id.removeClass ( 'active' );				
			}
		}
	}
}

