
/**
 * Message component for displaying messages in the UI 
 */
App.Message = function ()
{
	// local css classes
	this.css = { items: 
		[
		{name: '.errmsg', value: 'padding:0px;font-weight:normal;color:#FF9900;font-size:120%;' },
		{name: '.okmsg', value: 'padding:0px;font-weight:normal;color:#00CC00;font-size:120%;' }		
		]
	};
	
    var cssErrMsg = undefined;
    var cssOkMsg = undefined;
    var myId = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		myId = atomObj.name;
		
		cssErrMsg = SA.localCss (this, 'errmsg');
		cssOkMsg = SA.localCss (this, 'okmsg');
		
		return '<div class="' + cssErrMsg + '" id="' + myId + '" ></div>'; 
	}	
	
	/**
	 * show message method called from ouside object
	 */
	this.showMessage = function ( msg, success )
	{
		var $div = $( '#'+myId );
		
		if ( !success ) {
			$( $div ).removeClass ( cssOkMsg );
			$( $div ).addClass ( cssErrMsg );			
			$( $div ).html (  msg );
		}
		else {
			$( $div ).removeClass ( cssErrMsg );
			$( $div ).addClass ( cssOkMsg );			
			$( $div ).html (  msg );			
		}
	}
}
