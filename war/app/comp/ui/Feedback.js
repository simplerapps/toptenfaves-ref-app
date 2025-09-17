/**
 * BannertHandler Object  
 */
App.Feedback = function ()
{
	this.css = { items: 
		[
		]
	};
	
	/**
	 * Login flow list
	 */
	var flowList = { items: 
		[
		{name:'feedback-dlg', lc:'App.Dialog', items:
			 [
			 {name:'feedback-form', lc:'App.FormHandler', 
				 	config:{title:'Complain About List Content', listener:this}, items:   
				 [
				 {name:'relItemId', ac:'App.Variable'},
				 
				 {name:'feedMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},  
				 
				 {name:'feedText', ac:'App.TextArea', info:'Tell us your complaint message', 
					 required:true, pattern:'text', config:{rows:3} },
				 
				 {html:'div', style:'height:10px;'},

				 {cmd:'cmdPostFeed', ac:'App.Button', label:'Send Complaint', config:{theme:'color',defButton:true}},
				 {cmd:'cmdCancelFeed', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:15px;'},
				 ]
			 }
			 ]
		},
		{name:'password-reset-dlg', lc:'App.Dialog', items:
			 [
			 {name:'password-reset-form', lc:'App.FormHandler', 
				 	config:{title:'Reset Your Password', listener:this}, items: 
				 [
				 {name:'lgrMsg', ac:'App.Message' },
				 {html:'div', style:'height:12px;'},
				 
				 {name:'passToken', ac:'App.Variable'},
				 
				 //{html:'div', style:'height:4px;'},
				 {name:'lgrPassword1', ac:'App.TextField', info:'New Password', required:true, pattern:'text',
					 config:{type:'password'}},
					 
				 {name:'lgrPassword2', ac:'App.TextField', info:'Re-type New Password', required:true, pattern:'text',
					 config:{type:'password'}},

				 {html:'div', style:'height:10px;'},
				  
				 {cmd:'cmdResetLogin', ac:'App.Button', label:'Save Password', config:{theme:'color'} },
				 {cmd:'cmdResetCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },				 

				 {html:'div', style:'height:25px;'},
			 	 ]}
			]
		}		
		]
	};
	
	var myId, myInst;
	var curListId;
	var currentDlg;
	var initialized = false;
	
	/**
	 * This method creates the UI based on the lists provided
	 */  
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
	}
	
	/**
	 * Show feedback dialog
	 */
	this.showFeedbackDlg = function ( listId )
	{
		if ( !initialized ) {
			SA.createUI (myId, flowList);
			initialized = true;
		}
		curListId = listId;
		showDialog ( 'feedback-dlg', {} );
	}
	
	/**
	 * Shows display dialog
	 */
	this.showResetDialog = function ( passToken)
	{
		if ( !initialized ) {
			SA.createUI (myId, flowList);
			initialized = true;
		}
		showDialog ('password-reset-dlg', {passToken: passToken} );
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
	 * Sent by SA.fireEvent
	 */
	this.handleEvent = function (event )
	{
		// Called from other components to show reset dialog
		if ( event.cmd == 'passwordReset' ) {
			myInst.showResetDialog ( event.data );
			App.util.stopWorking();
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( action, atomList, dataObj )
	{
		if ( action.cmd == 'cmdPostFeed' ) {
			if ( validate ( 'feedMsg', atomList, dataObj ) ) {
				var form = new FormData();
				form.append ( 'msg', App.util.safeHtml(dataObj.feedText) );
				form.append ( 'relItemId', curListId );
				currentDlg.setWaiting (true);
				SA.server.postForm ("/rs/feedback", form, postFBSuccess);
			}
		}
		else if ( action.cmd == 'cmdResetLogin' ) {
			if ( validatePass ( 'lgrMsg', atomList, dataObj ) ) {
				var data = {};
				data.email = dataObj.passToken;
				data.authToken = dataObj.lgrPassword1;
				data.resetPassword = "true";
				currentDlg.setWaiting (true);
				SA.server.set ("/rs/user", data, postResetSuccess);
			}
		}
		else if ( action.cmd == 'cmdCancelFeed' ) {
			// hide dialog
			hideDialogFeedback ();
		}
		else if ( action.cmd == 'cmdResetCancel' ) {
			hideDialogReset ();
		}
	}
	
	/**
	 * Post success
	 */
	function postFBSuccess (respStr)
	{
		// hide dialog
		hideDialogFeedback ();
	}
	
	/**
	 * Post success
	 */
	function postResetSuccess (respStr)
	{
		var respObj = jQuery.parseJSON( respStr );
		
		if ( respObj.status == 'OK') {
			// hide dialog
			hideDialogReset ();
			SA.deleteUserAuth();
			SA.setAppData ( 'userName', '' );			
			window.location.href = "/";
		}
		else {
			showMessage ( 'lgrMsg', "Reset failed, can be caused by invalid or expired reset URL!", false);
		}
		currentDlg.setWaiting (false);
	}
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, 'Message cannot be empty!', false );
			return false;
		}
		return true;
	}
	
	/**
	 * validatePass
	 */
	function validatePass ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			showMessage ( divId, msg, false );
			return false;
		}
		else if ( data.lgrPassword1 != data.lgrPassword2 ) {
			showMessage ( divId, "Passwords do not match!", false );	
			return false;
		}
		else if ( data.lgrPassword1.length < 6 ) {
			showMessage ( divId, "Password too short, minimum 6 characters!", false );	
			return false;
		}
		return true;
	}

	/*
	 * Shows a messaage 
	 */
	function showMessage ( name, msg, success )
	{
		var msgComp = SA.lookupComponent ( name );
		msgComp.showMessage ( msg, success );
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog ( dialogName, newForm )
	{
		currentDlg = SA.lookupComponent ( dialogName );
		if ( currentDlg ) {
			if ( newForm )
				currentDlg.updateForm ( newForm );
			currentDlg.showDialog (true );
		}
		return currentDlg;
	}
	
	function hideDialogFeedback ()
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false );
	}
	
	function hideDialogReset ()
	{
		currentDlg.setWaiting (false);
		currentDlg.showDialog (false );
	}	
};
