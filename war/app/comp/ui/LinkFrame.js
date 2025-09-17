
/**
 * Shows a link in a frame
 */
App.LinkFrame = function ()
{	
	var myId ;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObject, config )
	{
		var html = '';
		
		var srcUrl = config.srcUrl;
		if (!srcUrl) srcUrl = '';
		
		myId = this.compId;
		
		// header
		html += '<iframe style="width:100%; height:700px; border:0px;margin-top:-10px;" src="' +srcUrl + 
		'" id="' + myId + '"></iframe>';
		
		return html;
	}
	
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{

	}
}

