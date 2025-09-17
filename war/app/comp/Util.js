
/**
 * Display card of information
 */
App.util = function ()
{
	/**
	 * Open url in new window
	 */
	this.openUrlInWindow = function ( url )
	{
		window.open(url,'_system');
	}
	
	/**
	 * Return true if URL is TTF image URL
	 */
	this.isImageUrl = function ( url )
	{
		return url.indexOf ( '/media/' ) > 0;
	}
	
	/**
	 * Choose suitable media list cover, return object {mediaId, imageUrl, mediaUrl);
	 */
	this.pickListCover = function ( ttlist )
	{
		var obj = {};
		// get from children
		if ( ttlist.items && ttlist.items.length>0 ) {
			for (i=0; i<ttlist.items.length; i++ ) {
				if ( ttlist.items[i].mediaUrl ) {
					obj.mediaUrl = ttlist.items[i].mediaUrl;
					break; 
				}
			}
			for (i=0; i<ttlist.items.length; i++ ) {
				if ( ttlist.items[i].mediaId ) {
					obj.mediaId = ttlist.items[i].mediaId;
					break; 
				}
			}
		}
		// or from the parent
		else {
			obj.mediaId = ttlist.mediaId;
			obj.mediaUrl = ttlist.mediaUrl;
		}
		if ( obj.mediaId ) { 
			obj.imageUrl = SA.server.getMediaUrl (obj.mediaId);
		}
		return obj;
	}

	/**
	 * Gets YouTube embed-able html 
	 */
	this.getYouTubeHtml = function  ( videoUrl )
	{
		var idx = videoUrl.lastIndexOf ( '=' );
		if ( idx < 0 ) {
			idx = videoUrl.lastIndexOf ( '/' );
		}
		var vidId = videoUrl.substring ( idx+1 );
		
		var height = '350';
		if ( $( window ).width() < 500 ) {
			height = '250';
		}
		var embedHtml = '<iframe width="100%" height="' + height + '" src="https://www.youtube.com/embed/' + 
			vidId + '" frameborder="0" allowfullscreen></iframe>';
		return embedHtml;
	}
	
	/**
	 * Get friendly time
	 */
	this.getFriendlyTime = function ( timeMs )
	{
		var timeNowMs = new Date().getTime();
		var diffSec = (timeNowMs - timeMs) / 1000;
		if ( diffSec < 60 ) {
			return Math.round(diffSec) + ' seconds ago';
		}
		else if ( diffSec < 3600 ) {
			return Math.round(diffSec/60) + ' minutes ago';
		}
		else if ( diffSec < 86400 ) {
			return Math.round(diffSec/3600) + ' hours ago';
		}
		else if ( diffSec < 604800 ) {
			return Math.round(diffSec/86400) + ' days ago';
		}
		else {
			return Math.round(diffSec/604800) + ' weeks ago';
		}
	}
	
	/**
	 * Gets user name info for logged in user
	 */
	this.getMyNameInfo = function ()
	{
		var auth = SA.getUserAuth ();
		var name = '';
		
		if (auth ) {
			auth = auth.respData;
			if (auth.firstName) {
				name += auth.firstName;
				if ( auth.lastName ) {
					name += ' ' + auth.lastName;
				}
			}
			if ( name.length < 3 ) {
				var idx = auth.email.indexOf ('@');
				if (idx > 0 ) {
					name = auth.email.stubstring (0, idx);
				}
			}
		}
		return name;
	}
	
	/**
	 * Return true if running as mobile app
	 */
	this.isMobileApp = function ()
	{
		var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
		if ( app ) {
			return true;
		} else {
		    return false;
		}  
	}	
	
	/**
	 * Strip tags from input string
	 */
	this.safeHtml = function (input) 
	{
		var strippedText = undefined;
		if ( input ) {
			strippedText = input.replace(/<\/?[^>]+(>|$)/g, "");
		}
		return strippedText;
	}
	
	/**
	 * Start loading 
	 */
	this.startWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.start();
	}
	
	/**
	 * Start loading 
	 */
	this.stopWorking = function ()
	{
		var load = SA.lookupComponent ('loading');
		load.stop();
	}	
}
App.util = new App.util();
