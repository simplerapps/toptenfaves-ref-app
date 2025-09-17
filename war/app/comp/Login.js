/**
 * The App.Home list component. This component represents the "controller" for the home page. It has a 
 * reference to:
 * 
 *  1- Its "css" to define local css classes
 *  2- Its "flow" to define the view declaratively    
 *  3- Other Imperative code to control the behavior and action of the page
 *  
 */
App.Login = function ()
{
	/**
	 * The CSS class names are unique to this class. For example if another class has the name 'rounded'
	 * it would be a different name because the names are distinguished based on unique class component type id
	 * that are assigned automatically at object creation time. 
	 * CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	 * 
	 */
	this.css = { items: 
		[
		]
	};
	
    var compId = undefined;
    var currentDlgName = 'login-dlg';
    var currentDlg = undefined;
    var lastErrDivId = undefined;

	/**
	 * Login flow list
	 */
	this.flow = { items: 
		[
		 {name:'login-dlg', lc:'App.Dialog', items:
			 [
			 {name:'login-form', lc:'App.FormHandler', 
				 	config:{title:'Please Sign In', listener:this}, items: 
				 [
				 {name:'lgMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},
				 {name:'lgEmail', ac:'App.TextField', info:'Email address', required:true, pattern:'email' },
				 //{html:'div', style:'height:4px;'},
				 {name:'lgPassword', ac:'App.TextField', info:'Password', required:true, pattern:'text',
					 config:{type:'password'}},

				 {html:'div', style:'height:10px;'},
				  
				 {cmd:'cmdLogin', ac:'App.Button', label:'Sign In', config:{theme:'color'} },
				 {cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:25px;'},

				 {cmd:'cmdShowCreate', ac:'App.Button', label:'Create new account', 
					 config:{type:'link'}, style:'float:left;font-size:110%;margin-bottom:10px;' },
				 {cmd:'cmdShowForgot', ac:'App.Button', label:'Forgot password?', 
				     config:{type:'link'}, style:'float:right;font-size:110%;margin-bottom:10px;' },
				     
			 	 ]}
			]
		},
		{name:'forgot-pass-dlg', label:'Forgot My Password', lc:'App.Dialog', items:
			 [
			 {name:'forgot-pass-form', lc:'App.FormHandler', 
				 	config:{title:'I Forgot my Password', listener:this}, items: 
				 [
				 {name:'fgMsg', ac:'App.Message' },
				 {html:'div', style:'height:15px;'},
				  
				 {html:'p', value:'Enter your registered email address, and we will email you a reset password link:'},
				 {name:'fgEmail', ac:'App.TextField', info:'Email address',
					 required:true, pattern:'email'},				 
					 {html:'div', style:'height:10px;'},
					 
				 {cmd:'cmdEmailPass', ac:'App.Button', label:'Send'},
				 {cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				 {html:'div', style:'height:25px;'}
				 ]
			 }
			 ]
		},
		{name:'create-acct-dlg', label:'Create New Account', lc:'App.Dialog', items:
			 [
			 {name:'create-acct-form', lc:'App.FormHandler', 
				 	config:{title:'Create New Account', listener:this}, items: 
				 [
				 {name:'crMsg', ac:'App.Message' },				  
				 {name:'crMsg', html:'span', class:'errmsg', value:'' },
				 {html:'div', style:'height:12px;'},
				  
				 {name:'crName', ac:'App.TextField', info:'Name: First Last ', 
					 required:true, pattern:'text' },
				/*
				 {name:'crLastName', ac:'App.TextField', info:'Last Name',
					 required:false, pattern:'text' },
				*/

				 {name:'crEmail', ac:'App.TextField', info:'Email address',
					 required:true, pattern:'email' },
				 
				 {name:'crPassword', ac:'App.TextField', info:'Password', config:{type:'password'},
						 required:true, pattern:'text' },
				/*
				 {name:'crPassword2', ac:'App.TextField', info:'Re-type Password', config:{type:'password'},
					 required:true, pattern:'text' },
				*/
					 
				 {html:'div', style:'height:10px;'},
				 {html:'div', style:'font-size:90%;', value:'By clicking "Create Account" below, you agree to ' + 
					 '<a href="app/res/text/EULA.html" target="_blank">HQ APPS Consulting User Agreement</a>'},
				 {html:'div', style:'height:10px;'},

				 {cmd:'cmdCreateAcct', ac:'App.Button', label:'Create Account'},
				 {cmd:'cmdCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				 {html:'div', style:'height:12px;'},
				 
				 {cmd:'cmdShowLogin', ac:'App.Button', label:'I already have an account', 
					 style:'font-size:120%', config:{type:'link'} },
				 {html:'div', style:'height:12px;'}
				 ]
			 }
			 ]
		}
		]
	};

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		// if logged in, log out
		if ( SA.getUserAuth () ) {
			// log out
			SA.deleteUserAuth();
			
			// fire login event to app banner
			SA.events.fireEvent("appBanner", {cmd:'postLogin'} );
			
			return '';
		}
		else { 
			// Show login dialog (i.e. dialogs, etc)
			compId = this.compId;
			
			// init state
		    currentDlgName = 'login-dlg';
		    currentDlg = undefined;
		    
			var html =  _createUI ( compId, this.flow, config );

			// show login dialog 
			var userName = SA.getAppData ( 'userName' );
			showDialog ( currentDlgName, userName );
			
			return html;
		}
	}	
	
	/**
	 * Create actual UI
	 */
	function _createUI ( compId, flowlist, config )
	{
		var html = '';
		html += SA.listCreateUI ( this.compId, flowlist, config, true );
		return html;
	}
	
	/**
	 * If dialogs are open close them
	 */
	this.closeDialogs = function ()
	{
		if (currentDlg) {
			currentDlg.showDialog (false);
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdShowCreate' ) {
			showDialog ( 'create-acct-dlg' );			
		}
		else if ( actionAtom.cmd == 'cmdShowForgot' ) {
			var userName = SA.getAppData ( 'userName' );
			showDialog ( 'forgot-pass-dlg', userName );	
		}
		else if ( actionAtom.cmd == 'cmdShowLogin' ) {
			showDialog ( 'login-dlg' );			
		}
		else if ( actionAtom.cmd == 'cmdCancel' ) {
			currentDlg.showDialog (false);
		}
		else { 
			// Login command
			if ( actionAtom.cmd == 'cmdLogin' ) {
				lastErrDivId = 'lgMsg';
				if ( validate ( 'lgMsg', atomList, dataObj )  ) {
					var data = {};
					data.email = dataObj.lgEmail;
					data.authToken = dataObj.lgPassword;
					currentDlg.setWaiting (true);
					SA.server.get("/rs/user", data, postSuccess);
				}
			}
			// Create Account command			
			else if ( actionAtom.cmd == 'cmdCreateAcct' ) {
				lastErrDivId = 'crMsg';				
				if ( validate ( 'crMsg', atomList, dataObj ) ) {
					var data = {};
					data.firstName = getName (dataObj.crName, true);
					data.lastName = getName (dataObj.crName, false);
					data.email = dataObj.crEmail;
					data.authToken = dataObj.crPassword;
					currentDlg.setWaiting (true);
					SA.server.set ("/rs/user", data, postSuccess);
				}		
			}
			// Change password command						
			else if ( actionAtom.cmd == 'cmdEmailPass' ) {
				lastErrDivId = 'fgMsg';
				if ( validate ( 'fgMsg', atomList, dataObj ) ) {
					var data = {};
					data.msg = "EMAIL-ME-RESET-PASSWORD";
					data.userId = dataObj.fgEmail;
					currentDlg.setWaiting (true);
					SA.server.set ("/rs/feedback", data, resetResult);					
				}
			}
		}
	}
	
	/**
	 * Parse name from First Last name string (cap first letter of name)
	 */
	function getName ( name, getFirst )
	{
		var idx = name.indexOf ( ' ' );
		var ret = name;
		if ( getFirst == true ) {
			if (idx > 0 )  {
				ret = name.substring (0, idx);
			}
		}
		else {
			ret = '';
			if ( idx > 0 ) { 
				ret = name.substring (idx);
			}
		}
		ret = ret.trim ();
		if ( ret.length > 0 ) {
			return ret[0].toUpperCase() + ret.substr(1);
		}
		return ret;
	}
	
	/**
	 * Validate login form
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if (data.crPassword && data.crPassword.length<6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );			
			return false;
		}
		else {
			$( '#'+divId ).html ( "" );
			ret = true;
		}
		return true;
	}
	
	function showDialog ( newDlgName, newEmail )
	{
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			currentDlg.showDialog (false);
		}
		currentDlgName = newDlgName;
		currentDlg = SA.getCompByIdOrName ( currentDlgName );
		if ( currentDlg ) {
			if ( !newEmail || newEmail.length==0 )
				newEmail = '';
			currentDlg.updateForm ({lgMsg:'', lgEmail:newEmail, fgEmail:newEmail, lgPassword:''});
			currentDlg.showDialog (true);
		}
	}
	
	function resetResult ( respStr )
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false);
	}
	
	/**
	 * Called from outside process to handle login success
	 */
	this.successLogin = function ( respStr )
	{
		postSuccess ( respStr )
	}
	
	/*
	 * postSuccess
	 */
	function postSuccess ( respStr )
	{
		//alert(xhr.getResponseHeader("Set-Cookie"));
		
		var respObj = jQuery.parseJSON( respStr );
		
		// login success
		if ( respObj.status == 'OK') {
			showMessage ( lastErrDivId, "Successful", true);
			
			// set auth to user info
			SA.setUserAuth ( respObj );
			
			// set username in app data
			SA.setAppData ( 'userName', respObj.respData.email );
			
			// fire login event to appBanner and ltoolBar (post login will allow loading content)
			SA.fireEvent('appBanner', {cmd:'postLogin'} );
			
			// fire load all lists message after login
			//SA.fireEvent ('ltoolBar', {cmd:'loadAllDB'} );

			// close current dialog
			if ( currentDlg)
				currentDlg.showDialog (false);
		}
		else {
			if ( respObj.error == 'USERNAME_EXISTS' ) {
				showMessage ( lastErrDivId, "Username already exists!", false);
			}
			else {
				showMessage ( lastErrDivId, "Authentication failure!", false);
			}
			currentDlg.setWaiting (false);
				
		}
	}
	
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.comps.getCompByName ( name );
		msgComp.showMessage ( msg, success );
		
		if ( !success ) {
			shakeWindow ();
		}
	}
	
	/**
	 * Shake window because of error
	 */
	function shakeWindow ()
	{
		var id = currentDlg.compId;
		
		var div = $( '#'+ id );		  
		var l = 25;  
		for( var i = 0; i < 4; i++ ) {  
		   
			$( div ).animate( { 'margin-left': "+=" + ( l = -l ) + 'px' }, 50);
		}
	}
}

