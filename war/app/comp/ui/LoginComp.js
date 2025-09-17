
/**
 * Login component 
 */
App.LoginComp = function ()
{	
	var defLoginLabel = 'Sign In';
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		var loginLabel = SA.getConfigValue ( atomObj, 'label', defLoginLabel);
		
		if ( isLoggedIn() ) {
			return 'Sign out';			
		}
		else {
			return loginLabel;
		}
	}	
	
	function isLoggedIn ()
	{
		var auth = SA.getUserAuth ();
		if ( auth && auth.status == 'OK' )
			return true;
		return false;
	}
}
