/**
 * ItemsDialogs 
 */
App.ShareDialogs = function ()
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
		{name:'sharelist-dlg', lc:'App.Dialog', items:
			 [
			 {name:'sharelist-form', lc:'App.FormHandler', 
				 	config:{title:'Share Your List', listener:this}, items: 
				 [
				 {html:'div', style:'height:8px;'},

				 {html:'p', style:'font-size:110%', 
					 value:"Copy message below and paste into a Text Message or Email and send it to your friends!" },
				 
				 {name:'shareHtml', ac:'App.TextArea', info:'', 
					 required:true, pattern:'text', config:{rows:5, style:'background-color:#F0F0F0'} }, 
					 
				 {html:'div', style:'height:12px;'},

				 {cmd:'cmdCancelShare', ac:'App.Button', label:'Done', config:{theme:'clear'} },
				 {html:'div', style:'height:10px;'}		
				 ]
			 }
			 ]
		}]
	};

	// other state
    var compId;
    var currentDlgName;

	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * param name: imageUrl
	 * param name: ilists
	 */
	this.createUI = function ( parentList, config )
	{
		compId = this.compId;
		var html =  SA.listCreateUI ( compId, flowList, config, true );
		return html;
	}
	
	/**
	 * Show a dialog with name
	 */
	this.showDialog = function ( listId, listTitle )
	{
		if ( App.util.isMobileApp() ) {
			var subject = 'Sharing list: ' + listTitle;		
			var msg = 'I am sharing "Share 10" list name: "' + listTitle + '" with you!. Click link below:\n';
			var link = SA.server.getMyHostName() + '/?id=' + listId;			
			window.plugins.socialsharing.share ( msg, subject, null, link );
		}
		else {
			var form = { shareHtml:shareContent(listId, listTitle) };
			showDlg ( 'sharelist-dlg', form );			
		}
	}
	
	/*
	 * General show dialog function 
	 */
	function showDlg ( newDlgName, newForm )
	{
		currentDlgName = newDlgName;
		currentDlg = SA.lookupComponent ( currentDlgName );
		if ( currentDlg ) {
			if ( newForm ) {
				currentDlg.updateForm (newForm );
			}
			currentDlg.showDialog (true);
		}
	}
	
	/**
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdCancelShare' ) {
			currentDlg.showDialog (false);
		}
	}
	
	/*
	 * Gets share content string
	 */
	function shareContent ( listId, listTitle )
	{
		var html = 
		'I am sharing "Share 10" list name: "' + listTitle + '" \n' +
		'To access click link: ' + SA.server.getMyHostName() + '/?id=' + listId;
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

