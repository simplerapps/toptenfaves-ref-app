
/**
 * Lists template and memeory manager
 */
App.ListsManager = function ()
{
	var htmlCache = {};
	var compId = 20000;
	
	/**
	 * Gets cached html for full list object
	 */
	this.getListHtml = function ( listener, listObj, editMode, addTile ) 
	{
		var html = htmlCache [ listObj.id ];
		if ( !html ) {
			if ( editMode == undefined )
				editMode = true;
			if ( addTile == undefined ) {
				addTile = listObj.fId == undefined;
				if ( listObj.nshare == true )
					addTile = false;
			}
			var view = getListView ( listener, listObj, editMode, addTile );
			html = SA.createUI ( compId, view );			
			htmlCache [ listObj.id ] = html;  
		}
		return html;
	}
	
	/**
	 * Gets cached html for full list object
	 */
	this.getItemHtml = function ( listener, itemObj ) 
	{
		var html = htmlCache [ itemObj.id ];
		if ( !html ) {
			var view = getItemView ( listener, itemObj, true, true );
			html = SA.createUI ( compId, view );			
			htmlCache [ itemObj.id ] = html;  
		}
		return html;
	}

	
	/**
	 * Notify that the list or item has changed to delete cache asso with it 
	 */
	this.notifyChanged = function ( listId, itemId )
	{
		if ( listId && htmlCache[listId]!=undefined ) {
			delete htmlCache[listId];
		}
		if ( itemId && htmlCache[itemId]!=undefined ) {
			delete htmlCache[itemId];
		}
	}
	
	/**
	 * Gets list model 
	 */
	function getListView ( listener, listObj, editMode, addTile  ) 
	{
		var cards = {lc:'App.CardPanel', user:listObj.user, config: {title:listObj.title, 
			desc:listObj.description, id:listObj.id, editMode:editMode, addTile:addTile, 
			maxComm:listObj.maxComm }, 
			items: [] };
		
		if ( listObj.items ) {
			for ( i=0; i<listObj.items.length; i++ ) {
				var item =  listObj.items [ i ];
				var card = getItemView ( listener, item, false, false );
				cards.items.push ( card );
			}
		}
		return cards;
	}
	
	/**
	 * Gets item model 
	 */
	function getItemView ( listener, item, zoom, edit ) 
	{
		var imageUrl = undefined;
		if ( item.mediaId ) {
			imageUrl = SA.server.getMediaUrl( item.mediaId);
		}		
		var card = {lc:'App.Card', config:{id:item.id, listId: item.listId, ttitle: item.title, stitle: item.stitle, 
			imageUrl:imageUrl, mediaUrl:item.mediaUrl, info: item.info, lname: item.lname, link: item.link, editMode: edit, zoomMode: zoom,
			listener:listener, nshare:item.nshare, maxComm:item.maxComm, timeMs:item.timeMs}  };

		if ( zoom == true) {
			var cards = {lc:'App.CardPanel', config: {editMode:edit, addTile:false, height:'1000px' }, items: [] };		
			cards.items.push ( card );
			return cards;
		}
		return card;
	}
}

