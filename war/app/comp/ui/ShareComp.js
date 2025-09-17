
/**
 * Text Area component
 */
App.ShareComp = function () 
{		
	// remember value entered
	var fieldValue = '';
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
        /* Everything else */
        {name: '@media (min-width: 481px)', items: 
            [
            {name:'.im-style', value:'width:65px;' },
            {name:'.im-div', value:'float:left;padding-right:20px;'}
            ]
        },

        /* Mobile sizes */
        {name: '@media (max-width: 480px)', items: 
            [
            {name:'.im-style', value:'width:50px;' },
            {name:'.im-div', value:'float:left;padding-right:15px;'}
            ]
        }
		]
	};
	
	var imgCls, imgdCls;
	var myId;
	var fbId, mailId, twId;
	var urlsMap = {};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 */
	this.createUI = function ( atomObj, config )
	{
		if ( !atomObj.value  ) {
			return;
		}
		imgCls = SA.localCss (this, 'im-style');
		imgdCls = SA.localCss (this, 'im-div' );
		myId = this.compId;
		fbId = 'fb-' + myId;
		mailId = 'mail-' + myId;
		twId = 'tw-' + myId;
		
		html = makeListShareText ( atomObj.value  );
		return html;
	}
	
	/**
	 * Make share list text
	 */
	function makeListShareText ( content )
	{
		var html = 
		'<div id="' + myId + '" >' +
			getImgLink ( mailId, 'icon_mail.jpg', 'Email', "mailto:?subject=Check%20out%20how%20ridiculously%20responsive%20these%20social%20buttons%20are&amp;body=http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%2Findex.html" ) + 
			getImgLink ( fbId, 'icon_fb.jpg', 'Facebook', 'http://www.facebook.com' ) + 
			getImgLink ( twId, 'icon_twitter.jpg', 'Twitter', 'http://www.google.com' ) + 
		'</div>';
		
		/*
		var html =  
		'<div><ul>'+
		  '<li>'+
		    '<a href="mailto:?subject=Check%20out%20how%20ridiculously%20responsive%20these%20social%20buttons%20are&amp;body=http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%2Findex.html" target="share-email">'+
		    'Email</a></li>'+
		  '<li>'+
		    '<a href="https://www.facebook.com/sharer/sharer.php?u=http://kurtnoble.com/labs/rrssb/index.html" target="_blank">'+
		    'Facebook</a></li>'+  
		  '<li class="rrssb-twitter">'+
		    '<a href="https://twitter.com/intent/tweet?text=Ridiculously%20Responsive%20Social%20Sharing%20Buttons%20by%20%40dbox%20and%20%40joshuatuscan%3A%20http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%20%7C%20http%3A%2F%2Fkurtnoble.com%2Flabs%2Frrssb%2Fmedia%2Frrssb-preview.png" target="_blank">'+
		    'Twitter</a></li></ul></div>';
		*/
		return html;
	}
	
	function getImgLink ( divId, imgName, linkName, url )
	{
		urlsMap [divId] = url;
		
		var html = 
		'<div id="' + divId + '" class="' + imgdCls + '" >'+
			'<img class="' + imgCls + '" src="res/img/'+ imgName +'" />' +
			'<div style="font-size:90%;text-align:center;padding:3px;">' + linkName + '</div>'+
		'</div>';
		return html;
	}
	
	/**
	 * If defined it will be called after page is loaded (to give chance to initialize after the DOM
	 * is created) 
	 */
	this.postLoad = function ()
	{
		$('#'+fbId).on ( 'tap', function (event) {
			//window.open( urlsMap[fbId], '_system');
			console.debug ( 'fb click: ' + urlsMap[fbId]);
			App.util.openUrlInWindow ( urlsMap[fbId] );
		});
		
		$('#'+twId).on ( 'tap', function (event) {
			console.debug ( 'tw click: ' + urlsMap[twId]);
			App.util.openUrlInWindow ( urlsMap[twId] );
		});

		$('#'+mailId).on ( 'tap', function (event) {
			console.debug ( 'mail click: ' + urlsMap[mailId]);
			App.util.openUrlInWindow ( urlsMap[mailId] );			
		});
	}
}

