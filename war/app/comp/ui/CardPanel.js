
/**
 * Panel to contain multiple display Cards
 */
App.CardPanel = function ()
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;
	
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.title', value:'color:#606060;margin-top:10px;margin-bottom:0px;font-size:250%' }			 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.title', value:'color:#606060;margin-top:5px;margin-bottom:0px;font-size:180%' }	 
			]
		},
		{name:'.share-bt', value:'float:right;color:#A0A0A0;background-color:#F8F8F8;font-size:80%;padding:8px;'}
		]
	};
	
	var myListId = undefined;
	var myTitle = undefined;
	var rmShareId = undefined;
	var flShareId = undefined;
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * items:
	 * All children are expected to be Card atom components
	 */
	this.createUI = function ( listObj, config )
	{
		var divId = this.compId;
		rmShareId = divId + 'rmShare';
		flShareId = divId + 'flShare';
		
		var addTile = SA.getConfig (listObj, 'addTile' );
		var heightpx = SA.getConfig (listObj, 'height' );
		var titleStyle = SA.getConfig (listObj, 'titleStyle', '' );		
		var height = '';
		
		if ( heightpx ) {
			height = 'height:' + heightpx;
		}
		myListId = config.id;
		
		if ( !listObj.items )
			return undefined;
		
		var cardsList = listObj.items;
		
		// Add 'Add Tile' button at the end
		if ( addTile==true && listObj.items.length < 10 ) {
			listObj.items.push ( {lc:'App.Card', 
				config:{
					dummy: true,
					listId: myListId 
				} } 
			);
		}
		
		var cssTitle = SA.localCss (this, 'title');
		var cssShareBt = SA.localCss (this, 'share-bt' );

		myTitle = SA.getConfigValue ( listObj, 'title', '');
		
		var desc = SA.getConfigValue ( listObj, 'desc', ' ');
		var editMode = SA.getConfigValue ( listObj, 'editMode', true);
		
		var shareLink = getShareMailTo();
		var ownerName = '';
		
		// if user passed, add user as owner
		if ( listObj.user ) {
			var isauth = SA.getUserAuth (); 
			ownerName = '<div oid="' + divId + '" style="padding-top:5px;padding-bottom:5px;">' + 
				'<div style="float:left;color:gray;padding-bottom:5px;">By: ' + listObj.user + '</div>';
				if (isauth) {
					ownerName += 
					'<div id="' +rmShareId +'" class="' + cssShareBt + '">Delete</div>' +
					'<div id="' +flShareId +'" class="' + cssShareBt + '">Complain</div>';					
				}
			ownerName += '</div>';			
		}
		
		var retHtml = 
		'<div class="container-fluid" style="padding-top:5px;padding-right:6px;padding-left:6px;background-color:#F0F0F0;'+height+'" >' + 
			shareLink + 
			'<div class="row" >'+
				'<div class="container col-md-8 col-md-offset-2" >'+
					'<div style="margin-bottom:20px">'+
						'<p  class="'+ cssTitle + '" style="' + titleStyle + '" >' + myTitle + '</p>'+
						'<p style="margin-bottom:5px">' + desc + '</p>'+
						ownerName + 
					'</div>'+
				'</div>'+  
			'</div>'+
			'<div class="row">'+
      	  		'<div class="container col-md-8 col-md-offset-2" >'+
      	  			'<div >';
		
		var i = 0;
		for ( i=0; i<cardsList.length; i++ ) {
			
			var lobj = cardsList [i];
			
			// if not atom component (i.e. html, lc, etc; just render and continue)
			if ( !lobj.ac ) {
				lobj.config.editMode = editMode;
				retHtml += SA.listCreateUI ( lobj.compId, lobj, undefined, true );  
				continue;
			}
			
			// get atom comp
			var atomComp = SA.getAtomComponent ( lobj.name, lobj.ac );
			
			// get html
			var html = atomComp.createUI ( lobj, null );
			
			retHtml += html;
		}
		
		retHtml += '</div></div></div></div>';	
		
		// test sharing
		/*
		retHtml += '<button onclick="window.plugins.socialsharing.share(\'Message only\')">message only</button>';
		retHtml += '<br><br><br>';
		*/
		
		return retHtml;
	}
	
	/**
	 * Share link for this list
	 */
	function getShareMailTo () 
	{
		/*
		var id = 'share-' + myListId;
		var subject = 'I am sharing my Share10 list name: ' + myTitle;
		var body = 'To access my list %20%22' +myTitle+ '%20%22 simply click the link: ' + window.location.origin + '/list/' + myListId + 
			'%0D%0ANote: you can also copy the above link into a text message and send it to your friends.' + 
			'%0D%0A%0D%0ASent from Top10Faves!';
		
		var html = '<a style="display:none" target="_blank" id="' + id + '" href="mailto:?subject=' +
			subject + '&body=' + body + '"></a>';
		return html;
		*/
		return '';
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		// Tap on comment
		$('#' + rmShareId ).on ( 'tap', function(event) {
			var ldlg = SA.lookupComponent ( 'listDialogs' );
			ldlg.deleteSharedList ( myListId );
		});
		
		$('#' + flShareId ).on ( 'tap', function(event) {
			var ldlg = SA.lookupComponent ( 'feedbackDialogs' );
			ldlg.showFeedbackDlg ( myListId );
		});
	}	
}
