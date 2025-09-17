/**
 * BannertHandler Object  
 */
App.Comments = function ()
{
	this.css = { items: 
		[
		// Everything else 
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.title', 
				value:'font-size:100%;width:100%;background-color:#F8F8F8;padding-top:5px;padding-bottom:5px;'}
			]
		},
		 
		// Mobile sizes 
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.title', 
				value:'font-size:95%;width:100%;background-color:#F8F8F8;'}
			]
		}
		]
	};
	
	/**
	 * Login flow list
	 */
	this.flow = { items: 
		[
		{name:'newcomm-dlg', lc:'App.Dialog', items:
			 [
			 {name:'newcomm-form', lc:'App.FormHandler', 
				 	config:{title:'Comments', listener:this}, items:   
				 [
				 {name:'itemId', ac:'App.Variable'},
				 {name:'listId', ac:'App.Variable'},
				 {name:'card', ac:'App.Variable'},
				 
				 {name:'maxComm', ac:'App.Variable'},
				 
				 {name:'prevComments', html:'p', style:'font-size:95%', value:''},
				 
				 //{html:'div', style:'height:20px;'},  
				 
				 {name:'commText', ac:'App.TextArea', info:'Your comment', 
					 required:true, pattern:'text', config:{rows:2} },
				 
				 {html:'div', style:'height:2px;'},

				 {cmd:'cmdPostComm', ac:'App.Button', label:'Post', config:{theme:'color',defButton:true}},
				 {cmd:'cmdCancelComm', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },

				 {html:'div', style:'height:8px;'},
				 ]
			 }
			 ]
		}
		]
	};
	
	var myId, myInst;
	var addId, comRepId, cardCompId;
	var listener, configObj ;
	var ltoolBar;
	var clTitle;
	
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * parentList:
	 * 
	 * config:
	 * name: 'imageUrl' is the URL for image for that banner
	 * 
	 * items: 
	 * list of action Atom objects
	 *  
	 */  
	this.createUI = function ( list, allConfig )
	{
		myId = this.compId;
		myInst = this;
		
		addId = 'add-' + myId;
		comRepId = 'rep-' + myId;
		
		configObj = list.config;
		ltoolBar = SA.lookupComponent ( 'ltoolBar' );
		
		// get class for title
		clTitle = SA.localCss (myInst, 'title' );

		var zoomMode = SA.getConfig (list, 'zoomMode');
		var maxComm = SA.getConfig (list, 'maxComm', 0 );
		cardCompId = SA.getConfig ( list, 'cardCompId' );
		
		var commentsHtml = '';
		// get detail 
		if ( zoomMode == true ) {
			commentsHtml = getCommentsHtml (); 
		} 
		// get summary
		else {
			SA.listCreateUI ( myId, this.flow );
			
			// allow dialog to get created
			commentsHtml = getSummaryHtml ( maxComm, list.data );			
		}
		//console.debug ( 'data: ' + data );

		var html = '<div id="' + myId + '">' + commentsHtml + '</div>';
		return html;
	}
	
	/*
	 * get comments summary html
	 */
	function getSummaryHtml  ( count, data ) 
	{
		var maxComm = count;
		if ( data && data.length> 0 ) {
			maxComm = data.length;
		}
		var numCommStr = '';
		if ( maxComm && maxComm>0 ) {
			numCommStr = maxComm + ' Comments' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		}
		
		var addDivId = 'add-' + myId;
		var sumDivId = 'sum-' + myId;
		var html = 
			'<div id="' + addDivId + '" class="' + clTitle + '"><div id="' + sumDivId + '" >' + 
				summaryHtml ( count, data ) + 
			'</div></div>';
		
		var retHtml = '<div id="' + myId + '">' + html + '</div>';
		return retHtml;
	}
	
	/**
	 * Gets comments detail
	 */
	function getCommentsHtml ()
	{
		// load comments and async. add to comRepId
		var html = '<div id="' + comRepId + '"  ></div>';
		loadComments ( false, comRepId, true );
		return html;
	}
	
	/**
	 * Just return the summary line
	 */
	function summaryHtml ( count, data )
	{
		var maxComm = count;
		if ( data && data.length> 0 ) {
			maxComm = data.length;
		}
		var numCommStr = '';
		if ( maxComm && maxComm>0 ) {
			numCommStr = maxComm + ' Comments' + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
		}
		var html = numCommStr + 'Add Comment';
		return html;
	}

	/**
	 * Redraw summary 
	 */
	function redrawSummary (comDivId, count, data )
	{
		var html = getSummaryHtml ( count, data );
		var sumDivId = '#sum-' + comDivId;
		$ (sumDivId).html ( html );
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
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdPostComm' ) {
			if ( validate ( 'commMsg', atomList, dataObj ) ) {
				var form = new FormData();
				var card = dataObj.card;
				var nameInfo = App.util.getMyNameInfo();
				form.append ( 'comment', App.util.safeHtml(dataObj.commText) );
				form.append ( 'listId', card.listId );
				form.append ( 'itemId', card.id );
				form.append ( 'commentor', nameInfo );

				if ( dataObj.id ) { // edit
					SA.server.putForm ("/rs/ttitem", form, postSuccess);
				}
				else { // add new comment
					// set max comments
					var maxComm = 1;
					//var card = ltoolBar.findCard(dataObj.listId, dataObj.itemId);
					if ( card.maxComm ) {
						maxComm = card.maxComm + 1;
					}
					card.maxComm = maxComm;
					form.append ('maxComm', maxComm);

					if ( !card.comments ) {
						card.comments = [];
					}
					var timeMs = new Date().getTime();
					var commObj = {comment:dataObj.commText, commentor:nameInfo, timeMs:timeMs}; 
					card.comments.push ( commObj );
					// redraw comments summary 
					redrawSummary ( card.comDivId, maxComm, undefined );
					
					SA.server.postForm ("/rs/comment", form, postSuccess);
				}
			}
		}
		// hide dialog
		hideDialog ();
	}
	
	/**
	 * Post success
	 */
	function postSuccess (respStr)
	{
	}
	
	/**
	 * validation 
	 */
	function validate ( divId, atomList, data )
	{
		var msg = SA.validate.evalObj(atomList, data);
		if ( msg != '' ) {
			return false;
		}
		return true;
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog ( title, dialogName )
	{
		var dlg = SA.lookupComponent ( dialogName );
		if ( dlg ) {
			dlg.showDialog (true, title, 'appBanner' );
		}
		return dlg;
	}
	
	function hideDialog ()
	{
		var dlg = SA.lookupComponent ( 'newcomm-dlg' );
		dlg.showDialog (false, 'Comments', 'appBanner');
	}
	
	/**
	 * Gets comments html
	 */
	function getCommListHtml ( commentsArray )
	{
		var html = '<div>';
		for ( i=0; i<commentsArray.length; i++ ) {
			var comm = commentsArray [i];
			var commStr = 
			'<div style="float:left;font-size:95%;width:100%;margin-bottom:10px;background-color:#f8f8f8;" >' + 
				'<div style="float:left;width:14%;padding-right:8px;"><img class="img-responsive" src="app/res/img/unknown.png" /></div>'+
				'<div style="float:left;width:80%;"><b>' + comm.commentor + '</b> .. ' + comm.comment +
				'<br><div style="color:#66A3C2">' + App.util.getFriendlyTime(comm.timeMs) + '</div></div>' + 
			'</div>';
			
			html += commStr;
		}
		html += '</div>';
		return html;
	}
	
	function loadComments ( showDlg, setDivId, forceLoad )
	{
		var itemId = configObj.itemId;
		var listId = configObj.listId;
		var card = ltoolBar.findCard( listId, itemId );
		var comDivId = myId;
		
		// Tap on comments
		var commListHtml = '';
		card.comDivId = comDivId;
		// if comments already there show them
		if ( card.comments && card.comments.length>0 ) {
			commListHtml = getCommListHtml ( card.comments )
		}
		// if there are comments load them
		else if ( card.maxComm && card.maxComm > 0) {	
			commListHtml = "Loading comments .."
			SA.server.get("/rs/comment", {listId:listId, itemId:itemId}, commentsLoaded );
		}
		var data = {itemId:itemId, listId:listId, card:card,
				prevComments:commListHtml };
		var form = SA.lookupComponent ('newcomm-form');
		form.updateForm (data);
		
		if ( showDlg == true ) {
			showDialog ( '', "newcomm-dlg" );
		}
		
		/**
		 * Comments loaded and set in form
		 */
		function commentsLoaded (respStr )
	    {
	    	var respObj = jQuery.parseJSON( respStr );
	    	card.comments = respObj.respData;
	    	
	    	var html = getCommListHtml ( card.comments );
	    	$ ('#'+setDivId ).html ( html );
		}
	}
	
	this.postLoad = function ()
	{
		// Tap on comments
		$('#' + addId ).on ( 'tap', function() {
			loadComments ( true, 'prevComments', false );
		});
	}
};
