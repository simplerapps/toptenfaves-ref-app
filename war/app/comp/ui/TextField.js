
/**
 * Text Area component
 */
App.TextField = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.actionListener = undefined;
	this.atomObj = undefined;
	
	// remember value entered
	var fieldValue = '';
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = {
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
		var divId = this.compId;
		
		var placeHolder = '';
		
		var type = SA.getConfigValue (atomObj, 'type', 'text');
		var typeStr = 'type="' + type + '"';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			var reqtext = '';
			//if ( atomObj.required ) 
				//reqtext = ' *';
			placeHolder = 'placeholder="' + atomObj.info + reqtext + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		fieldValue = atomObj.value;
		var valStr = '';		
		if ( fieldValue && fieldValue != '' ) {
			valStr = 'value="' + fieldValue + '" ';
		}
		
		// form created here
		var html =
		'<div class="form-group">'+ labelStr + 
			'<div class="col-md-12">' +
		  		'<input '+ typeStr + ' style="font-size:110%;" class="form-control" id="' + 
		  			divId + '" ' + valStr + placeHolder +' />' +
		  	'</div>' +
		'</div>';
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		fieldValue = $("#" + this.compId).val();
		return fieldValue;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return this.atomObj.name;
	}	
}
