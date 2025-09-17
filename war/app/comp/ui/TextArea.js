
/**
 * Text Area component
 */
App.TextArea = function ()
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
	 * rows: number of rows
	 * cols: number of columns 
	 */
	this.createUI = function ( atomObj, config )
	{
		this.atomObj = atomObj;
		
		var divId = this.compId;
		
		var rows = SA.getConfig ( atomObj, 'rows', 3);
		var cols = SA.getConfig ( atomObj, 'cols', -1 );
		var style = SA.getConfig ( atomObj, 'style', '' );
		
		var placeHolder = '';
		
		if ( atomObj.info ) {
			var reqtext = '';
			//if ( atomObj.required ) 
				//reqtext = ' (required)';
			placeHolder = ' placeholder="' + atomObj.info + reqtext + '"'; 
		}

		// get label
		var labelStr = '';
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		fieldValue = atomObj.value;
		var valStr = '';		
		if ( fieldValue && fieldValue != '' ) {
			valStr = fieldValue;
		}		
		else {
			fieldValue = '';
		}
		
		var html =
		'<div class="form-group" >'+ labelStr +   
			'<div class="col-md-12">' +
		  		'<textarea style="font-size:110%;' + style + '" class="form-control" rows="' + rows + '" id="' + 
		  			divId + '" ' + placeHolder +' >' + fieldValue + '</textarea>' +
		  	'</div>' +
		'</div>';
		
		/*
		var html =
		'<div class="form-group">'+
			//'<label class="col-md-3 control-label" for="name">'+ 'Enter text:' +'</label>' +
			'<div class="col-md-12">' +
				'<textarea class="" ' + 
				'id="' + divId + '" rows="' + rows + '"' +colsStr + placeHolder +'>' + 
				fieldValue + '</textarea>' + 
			//'</div>' + 
		'</div>';
		*/
		
		// get local css name (i.e. css name defined in this object)
		//var cssName = SA.localCss(this, 'round-clear');
		
		return html;
	}
	
	this.getValue = function ()
	{
		fieldValue = $("#" + this.compId).val();
		return fieldValue;
	}
	
	this.getName = function()
	{
		return this.atomObj.name;
	}
}
