/**
 * Main entry point Object 
 */
function SimplerApps ()
{
	var COOKIE_NAME = "simplerapps";
	var COOKIE_NAME_AUTH = COOKIE_NAME + '-auth';
	var applicationConfig = { appName:'sa', hostName:'localhost:8888' };
	
	// Do not include in HTML markup
	this.htmlExclusionMap = {html:'', items:'', config:''};
	
	// UI package
	this.ui = {};  

	// String: adding some general handy prototype functions 
	String.prototype.insert = function( idx, s ) 
	{
		 var p0 = this.slice(0,idx);
		 var p1 = this.slice(idx);
		
	    return ( p0 + s + p1 );
	};

	// add string function to encodeHTML
	if (!String.prototype.encodeHtml) {
		String.prototype.encodeHtml = function () {
			return this.replace(/&/g, '&amp;')
		               .replace(/</g, '&lt;')
		               .replace(/>/g, '&gt;')
		               .replace(/"/g, '&quot;')
		               .replace(/'/g, '&apos;');
		};
	}
	
	// add string function to decodeHTML
	if (!String.prototype.decodeHtml) {
		String.prototype.decodeHtml = function () {
		    return this.replace(/&apos;/g, "'")
		               .replace(/&quot;/g, '"')
		               .replace(/&gt;/g, '>')
		               .replace(/&lt;/g, '<')
		               .replace(/&amp;/g, '&');
		};
	}
	
	/**
	 * Override the jquery .html() method to fire events when DOM changes
	 */ 
	(function( $, oldHtmlMethod ){
	    // Override the core html method in the jQuery object.
	    $.fn.html = function() {
	        // Execute the original HTML method using the
	        // augmented arguments collection.

	        var results = oldHtmlMethod.apply( this, arguments );

	        // get components part of this html (by dev ids). Assume arguments[0] == html string
	        var html = arguments [0];
	        
	        // call all child components of rendered HTML
	        callChildComponents ( html );
	        
	        return results;
	    };
	})( jQuery, jQuery.fn.html );
	
	/**
	 * Override the jquery.append() method to fire events when DOM changes
	 */ 
	(function( $, oldAppendMethod ){
	    // Override the core html method in the jQuery object.
	    $.fn.append = function() {
	        // Execute the original HTML method using the
	        // augmented arguments collection.

	        var results = oldAppendMethod.apply( this, arguments );

	        if ( typeof arguments[0] == 'string' ) {
	        	// call all child components of rendered HTML
	        	callChildComponents ( arguments [0] );
	        }
	        else if ( typeof arguments[0] == 'object' ) {
	        	// causing issues with JQM
	        	//callChildComponents ( arguments [0].html() );
	        }

	        return results;
	    };
	})( jQuery, jQuery.fn.append );
		
	/**
	 * Call all child components of rendered HTML
	 */
	function callChildComponents ( html )
	{
        var comps = SA.comps.getCompsByIdsFromHtml ( html );
		
		 // Action components first, call page loaded (after inserting into dom)
        for ( i=0; i<comps.length; i++ ) {
        	var c = comps[i];
        	if ( c.postLoad  && c.setActionListener ) {
        		c.postLoad();        		
        	}
        }
        
        // List components next, call page loaded (after inserting into dom)
        for ( i=0; i<comps.length; i++ ) {
        	var c = comps[i];
        	if ( c.postLoad  && !c.setActionListener ) {
        		c.postLoad();
        	}
        }		
	}
	
	/**
	 * PUBLIC
	 * 
	 * Entry Level that loads the user application 
	 */
	this.loadComponent = function ( divName, compObjName, configObj )
	{
		// create main obj instance
		var compObj = SA.loader.getComponent ( '_main', compObjName, true ); 

		// load all global includes files from main app into DOM
		//SA.loadInclues ( compObj.includes );
		
		// load the global css list into the DOM
		SA.loadCssIntoDom ( '', compObj.css );
		
		if ( !compObj.flow ) {
			compObj.flow = {};
		}
		
		// if passed configObj add to comp object
		if ( configObj ) {
			compObj.config = configObj;
		}
		
		// gen code
		//var html = SA.loader._callAllCreateUI ( 0, compObj.flow );
		if ( !compObj.createUI ) {
			alert ( "Invalid State: component should define createUI method" );
			return;
		}
		var html = compObj.createUI ( compObj, {});
		
		// Assume a div with the name passed on the page. Get the ui html into the page 
		$('#' + divName).html ( html );
		
		// See if there is a landing page (only if dispatch component is set)
		if ( dispatchComponent ) {
			var compIds = compIdsFromUrl ( window.location.href );
			if ( compIds && compIds.length>0 ) {
				SA.events.fireEvent (dispatchComponent.compId, {id:'navigate', compIdArray:compIds} )
			}
		}
	}
	
	/**
	 * Window hash changed event, route to correct component
	window.onhashchange = function( event ) 
	{
	};
	*/
	
	/**
	 * History changed event
	 */
	window.onpopstate = function(event) 
	{
	    //console.log ("popstate, location: " + document.location + ", state: " + event.state);
	    //console.log ("   hash: " + window.location.hash );
	    
		if ( dispatchComponent ) {
			var compIds = compIdsFromUrl ( window.location.hash );
			if ( compIds && compIds.length>0 ) {
				SA.events.fireEvent (dispatchComponent.compId, {id:'navigate', compIdArray:compIds} )
			}
			else {
				// go home == root == HOME
				SA.events.fireEvent (dispatchComponent.compId, {id:'navigate',  compIdArray:['HOME']} )
			}
		}
	};
	
	/**
	 * Sets dispatch component in the SA. This component should be able to handleEvent (click) to show
	 * different components  
	 */
	var dispatchComponent = undefined;
	this.setDispatchComponent = function ( dc )
	{
		dispatchComponent = dc;
	}
	
	/**
	 * Parse url and return comp path
	 */
	function compIdsFromUrl ( url ) 
	{
		var idx = url.indexOf ('#!/');
		if ( idx >= 0  ) {
			var path = url.substring (idx + 3);
			return path.split ('/');
		}
	}
	
	/**
	 * PUBLIC
	 * 
	 * Fire an event to component name or Id
	 */
	this.fireEvent = function ( compNameOrId, event )
	{
		SA.events.fireEvent ( compNameOrId, event );
	}
	
	/**
	 * Load a JS file in the DOM by passing a URL (relative or absolute)
	 */
	this.loadInclues = function ( incList )
	{
		/*
		if ( !incList || !incList.items) 
			return;
		
		for ( i=0; i<incList.items.length; i++ ) {
			var inc = incList.items [i];
			
			var fileref = document.createElement ('script');
			fileref.setAttribute ("type","text/javascript");
			fileref.setAttribute ("src", inc.value );
		}
		*/
	}
	
	/**
	 * General method for dynamically executing functions
	 */
	this.execFunction = function (packageName, functionName /*, args */)
	{
		//var extraArgsArray = Array.prototype.slice.call(arguments, 3);
		var context = window;
		var namespaces = packageName.split(".");
		for(var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		try {
			return context[functionName].apply(this);
		}
		catch ( err ) {
			alert ( 'Invalid State: Error in: "' + packageName + '.' + functionName + '". Reason: ' + err );
		}
	}
	
	/**
	 * This method will be used to create UI for child list buy calling all the createUI on the components in 
	 * the list after it consolidate its parent's configurations  
	 * 
	 * Optionally pass associated component id with childList
	 * 
	 * Optionally you can pass showAll == true to ignore all hidden attributes and force process and show all lists
	 * default == false
	 */
	this.listCreateUI = function ( listCompId, list, parentConfig, showAll )
	{
		if ( showAll == undefined ) {
			showAll = true;
		}
		return SA.loader._callAllCreateUI ( listCompId, list, parentConfig, showAll );
	}

	/**
	 * PUBLIC
	 * 
	 * Same as listCreateUI:
     * This method will be used to create UI for child list buy calling all the createUI on the components in 
	 * the list after it consolidate its parent's configurations  
	 * 
	 * Optionally pass associated component id with childList
	 * 
	 * Optionally you can pass showAll == true to ignore all hidden attributes and force process and show all lists
	 * default == false
	 */ 
	this.createUI = function ( listCompId, atomObj, parentConfig, showAll )
	{
		if ( showAll == undefined ) {
			showAll = true;
		}
		return SA.loader._callAllCreateUI ( listCompId, atomObj, parentConfig, showAll );
	}
	
	/**
	 * Inject style inside the div tag before adding it to the DOM. Note if the style attribute already exists 
	 * then it will append the style to it, otherwise it will create a new style attribute
	 */
	this.injectStyle = function ( divHtml, style )
	{
		if ( divHtml ) { 
			var i0 = divHtml.indexOf ( 'style="' );
			if ( i0 >= 0 ) {
				var i1 = divHtml.indexOf ( '"', i0+7);
				
				if ( i1 > 0 ) {
					divHtml = divHtml.insert (i1, ';'+style); 
				}
			}
			else {
				i0 = divHtml.indexOf ( '<div' );
				if ( i0 >= 0 ) {
					var styleDesc = ' style="' + style + '"';
					divHtml = divHtml.insert (4, styleDesc);
				}
			}
		}
		return divHtml;
	}
	
	/**
	 * Inject class inside the div tag before adding it to the DOM. Note if the class attribute already exists 
	 * then it will append the class to it, otherwise it will create a new class attribute
	 */
	this.injectClass = function ( divHtml, cls )
	{
		if ( divHtml ) { 
			var i0 = divHtml.indexOf ( 'class="' );
			if ( i0 >= 0 ) {
				var i1 = divHtml.indexOf ( '"', i0+7);
				
				if ( i1 > 0 ) {
					divHtml = divHtml.insert (i1, ' '+cls); 
				}
			}
			else {
				i0 = divHtml.indexOf ( '<div' );
				if ( i0 >= 0 ) {
					var classDesc = ' class="' + cls + '"';
					divHtml = divHtml.insert (4, classDesc);
				}
			}
		}
		return divHtml;
	}

	/**
	 * Merge and return config into newConfig objects
	 */
	this.mergeConfig = function ( newConfig, config )
	{
		if ( !newConfig ) newConfig = {};
		
		// merge config into newConfig object (if config exist)
		if ( config ) {
			newConfig = $.extend(newConfig, config);
		}
		return newConfig;
	}
	
	/**
	 * Returns the Atom Component object associated with object class name
	 * 
	 * NOTE: If defined this.stateful == true in component, then a new instance is returned for every call,  
	 * otherwise the same instance will be returned 
	 */
	this.getAtomComponent = function ( userCompName, compClassName )
	{
		return SA.loader.getComponent ( userCompName, compClassName, false );
	}

	/**
	 * Returns the List Component object associated with object class name. Note the following:
	 * 
	 * 1- If list name already has a component, the same instance is returned
	 * 2- If list name does not a new component will be created and returned
	 * 3- If defined this.stateful == true in component, then a new instance is returned in (2) above, 
	 * otherwise the same instance will be returned in (1) and (2) 
	 * 
	 */
	this.getListComponent = function ( listName, compClassName )
	{
		return SA.loader.getComponent ( listName, compClassName, true );
	}
	
	/**
	 * PUBLIC
	 * 
	 * If the userGivenName exists then the same already created component is returned, 
	 * otherwise, it will create a new component instance and return it. 
	 * Creates a component object and return
	 */
	this.createComponent = function ( userGivenName, compObjectName )
	{
		return SA.loader.getComponent ( userGivenName, compObjectName, true );
	}
	
	/**
	 * PUBLIC
	 * 
	 * Simply looks up a component by component id (compId) or unique userGivenName if exists it will
	 * return it. 
	 */
	this.lookupComponent = function ( compIdOrName )
	{
		return SA.comps.getCompByIdOrName ( compIdOrName );
	}
	
	/**
	 * getCompByIdOrName Method that routs to component registry 
	 */
	this.getCompByIdOrName = function ( compIdOrName )
	{
		return SA.comps.getCompByIdOrName ( compIdOrName );
	}
	
	/**
	 * getList Method that routs to component registry 
	 */
	this.getList = function ( listName )
	{
		return SA.comps.getList ( listName );
	}
	
	/**
	 * Find list item's array object by name 
	 */
	this.getListItemByName = function ( list, itemsName )
	{
		var items = list.items;
		if ( items ) {
			for ( var i=0; i<items.length; i++ ) {
				var ob = items [i];
				if ( ob && ob.name==itemsName )
					return ob;
			}
		}
		return undefined;
	}

	/**
	 * Same as getConfigValue
	 */
	this.getConfig = function ( atomObj, name, defValue )
	{
		return SA.getConfigValue (atomObj, name, defValue);
	}

	/**
	 * Gets passed parameter val in flowList (params object). 
	 * If not there and there is a default value it is returned
	 */
	this.getConfigValue = function ( flowList, name, defValue )
	{
		var ret = defValue;
		var config = flowList.config;
		if ( config ) {
			var val = config [ name ];
			if ( val != undefined ) {
				ret = val;
			}
		}
		return ret;
	}
	
	/**
	 * Add flow list B as sublist to flow list A
	 */
	this.addSublist = function ( flowListA, subListB )
	{
		if ( !flowListA.items )
			flowListA.items = new Array();
		
		flowListA.items.push ( subListB );
		return flowListA;
	}
	
	/**
	 * Creates a HTML tag from flowObj. Keep in mind:
	 * 
	 * 1- The html css class name will be set to local name automatically (if global == false or undefined). 
	 *    Local class name = cls + '-' + compTypeId
	 * 2- The html id is set == compObj.compId of passed component
	 * 3- If flowObj.config.hidden==true then the div will not have any attributes
	 */
	this.createHtmlBegin = function ( flowObj, forceShow )
	{
		// default is div if no html is specified 
		if ( !flowObj.html )
			flowObj.html = 'div';
		
		var ret = '<' + flowObj.html;
		
		// Get id, and if not there make name == id
		if ( !flowObj.id ) {
			if ( flowObj.name ) {
				flowObj.id = flowObj.name;
			}
		}
		
		var hidden = this._listHidden(flowObj, forceShow);
		
		// if not hidden add other attributes 
		if ( !hidden ) {
			/*
			if ( cssName )
				ret += ' ' + 'class="' + cssName + '"';
			
			if ( flowObj.style )
				ret += ' ' + 'style="' + flowObj.style + '"';
			*/
			// carry all properties forward in the html element
			for ( var key in flowObj ) {
				var val =  flowObj [key];
					
				var kin = this.htmlExclusionMap [key]
				if ( kin != undefined )
					continue;
				
				if ( key.indexOf ('data_') == 0 ) {
					key = 'data-' + key.substring (5);
				}

				ret += " " + key + "='" + val + "'";
			}
			
		}
		ret += '>';
		return ret;
	}

	/**
	 * Return true if list supposed to be hidden
	 */
	this._listHidden = function ( flowObj, forceShow)
	{
		var hidden = flowObj.config && flowObj.config.hidden==true && forceShow!=true;
		return hidden;
	}
	
	/**
	 * Creates the end of HTML Element tag (such as </div>, </p>, etc.)
	 */
	this.createHtmlEnd = function ( flowObj )
	{
		if ( flowObj.value ) {
			return flowObj.value + '</' + flowObj.html + '>';
		}
		else if (flowObj.html) {
			return '</' + flowObj.html + '>';
		}
		return ''; 
	}
	
	/**
	 * Convert class name to local css class name (i.e. css class name locally defined inside the object), 
	 * otherwise it will be considered global
	 */
	this.localCss = function ( compObj, clsName )
	{
		var id = compObj.compTypeId;
		if ( id ) {
			clsName = (id > 1 )? clsName + '-' + id : clsName;
		}
		else {
			alert ("Invalid State: cannot find local css class name '" + 
					clsName + "' in component.");
		}
		return clsName;
	}
	
	/**
	 * Loads the defined cssList into the DOM 
	 */
	this.loadCssIntoDom = function ( compId, cssList )
	{
		if ( !cssList || !cssList.items) 
			return;

		var cssClasses = '';
		var cssNamesObj = {};

		cssClasses = this._loadCssList(compId, cssClasses, cssNamesObj, cssList);
		
		//console.log ( cssClasses );
		
		// set all locally defined CSS classes
		SA.comps.setComponentCssNames(compId, cssNamesObj);
		
		this.addCssToDOM ( cssClasses );		
	}
	
	/**
	 * Loads the css list declaration into the DOM ( which translates to div id )
	 */
	this._loadCssList = function ( compId, cssClasses, cssNamesObj, cssList )
	{
		var cssItems = cssList.items;
		// if a list of items
		if ( cssItems != undefined  ) {
			if ( cssItems.length > 0 ) {
				var subcssClasses = '';
				var i = 0;
				for ( i=0; i<cssItems.length; i++ ) {

					// call a child css node
					subcssClasses = this._loadCssList(compId, subcssClasses, cssNamesObj, cssItems [i] )
				}
				if ( cssList.name )
					cssClasses += cssList.name + '{' + subcssClasses + '} ';
				else 
					cssClasses += subcssClasses;
			}
		}
		// if a leaf 
		else {
			var nameSuffix = '';
			if ( compId && compId > 0 ) {
				nameSuffix = '-' + compId;
			}
			var j = 0;
			var names = '';
			var namesArr = cssList.name.split (' ');
			for ( j=0; j<namesArr.length; j++ ) {
				if ( namesArr[j].length > 0 ) {
					// if real class names (starts with '.' then convert to local names), otherwise leave alone
					clname = namesArr[j][0]=='.'? namesArr[j]+nameSuffix+' ' : namesArr[j] + ' ';
					names += clname;
					
					// add all names to obj 
					cssNamesObj [clname.trim()] = '';
				}
			}
			cssClasses += names + '{ ' + cssList.value + ' } ';
		}
		return cssClasses;
	}

	/**
	 * Adds CSS classes string to the dom
	 */
	this.addCssToDOM = function ( css )
	{
	    var styleTag = document.getElementsByTagName('style')[0];
	    var originalStyles = '';
	    if (! styleTag){
	        styleTag = document.createElement('style');
	        styleTag.type = 'text/css';
	        document.getElementsByTagName('head')[0].appendChild(styleTag);
	    } else {
	        originalStyles = styleTag.innerHTML;
	    }
	    styleTag.innerHTML = originalStyles + css;
	}
	
	// keep cached auth object arround
	var cachedAuthObj = undefined;
	
	/**
	 * PUBLIC:
	 * Sets the data stored for this app 
	 */
	this.setAppData = function ( name, value )
	{
		var key = COOKIE_NAME + '-' + applicationConfig.appName + '-' + name;
		SA.utils.setStorage( key, value);
	}
	
	/**
	 * PUBLIC:
	 * Gets the data stored for this app
	 */
	this.getAppData = function ( name )
	{
		var key = COOKIE_NAME + '-' + applicationConfig.appName + '-' + name;
		return SA.utils.getStorage( key);
	}
	
	/**
	 * Delete app data entry 
	 */
	this.deleteAppData = function ( name )
	{
		var key = COOKIE_NAME + '-' + applicationConfig.appName + '-' + name;
		SA.utils.removeStorage( key );
	}
	
	/**
	 * PUBLIC
	 * 
	 * Sets a user auth object in application
	 */
	this.setUserAuth = function ( authObj )
	{
		if ( authObj.status != 'OK')
			return;
		
		// note: jsessionid comes back with response object 
		// DO NO RELY ON COOKIES

		// keep auth object arround
		cachedAuthObj = authObj;
		
		// stringify session info
		var strSession = JSON.stringify ( authObj );
		
		//alert ( 'set storage 3: ' + strSession );

		// store in storage (not cookie)
		SA.utils.setStorage( COOKIE_NAME_AUTH, strSession);
	}
	
	/**
	 * PUBLIC
	 * 
	 * Gets user auth object if any exists
	 */
	this.getUserAuth = function ()
	{
		if ( cachedAuthObj ) {
			return cachedAuthObj;
		}
		
		var value = SA.utils.getStorage( COOKIE_NAME_AUTH );
		//alert ( 'get storage value: ' + value );
		
		if ( value && value.length>0 ) {
			cachedAuthObj = jQuery.parseJSON( value );
			return cachedAuthObj;
		} 
		return undefined;
	}
	
	/**
	 * PUBLIC
	 * 
	 * Delete user auth cookie
	 */
	this.deleteUserAuth = function ()
	{
		if ( cachedAuthObj ) {
			cachedAuthObj = undefined;  
		}
		SA.utils.removeStorage( COOKIE_NAME_AUTH );
		SA.utils.deleteCookie ( "JSESSIONID" );
	}
	
	/**
	 * Sets config object of the application 
	 */
	this.setAppConfig = function ( appConf )
	{
		if ( appConf ) {
			if ( appConf.appName && appConf.appName.length>0 ) {
				applicationConfig.appName = appConf.appName;
				COOKIE_NAME_AUTH = COOKIE_NAME + '-' + applicationConfig.appName + '-auth';
			}
			if ( appConf.hostName && appConf.hostName.length> 0  ) {
				applicationConfig.hostName = appConf.hostName;
				SA.server.setMyHostName ( applicationConfig.hostName );
			}
		}
	}
	
	/**
	 * Trick to reload the browser with local Hash URL (does not go to the server)
	 */
	this.localUrl = function ( event )
	{
		SA.utils.localUrl (event);
	}
	
}

// Create an instance of the SA main object
var SA = new SimplerApps();
;
/**
 * HQAPPS components manager
 */
function Comps ()
{
	// All components map (by comp id)
	this._componentRegistry = {};
	
	// All lists registry (by list name)
	this._listRegistry = {};
	
	// comp lookup by compObjName
	this._compKeyByObjName = {};

	// comp lookup by comp name
	this._compKeyByCompName = {};

	// max comp id
	this._maxComponentId = 0;
	
	/**
	 * Put list in registry
	 */
	this.putList = function ( listObj )
	{
		if ( listObj.name ) 
			this._listRegistry [listObj.name] = listObj;
	}
	
	/**
	 * Get list from registry
	 */
	this.getList = function ( name )
	{
		return this._listRegistry [ name ];
	}
		
	/**
	 * Return component array after extracting the ids from html and looking up the components
	 */
	this.getCompsByIdsFromHtml = function ( html )
	{
		var compArray = Array ();
		var i = 0;
		var j = 0;
		var ownerId = undefined;
		var id = '';
		
		if ( html ) { 
			// convert html to use '"' as standard no single "'" strings 
			html = html.replace(/'/g , '"');
			
			// now get all other ids
			while ( true ) {
				j = html.indexOf ( 'id="', i );
				if ( j < 0 ) {
					break;
				}
				j += 4;
				i = html.indexOf ( '"', j );
				id = html.substring (j, i);
	
				// lookup component by id (or name) and add to array
				var comp = this.getCompByIdOrName ( id );
				if ( comp != undefined ) {
					compArray.push (comp);
				}
				i++;
			}
		}
		return compArray;
	}
	
	/**
	 * Gets all components map
	 */
	this.getComponentMap = function ()
	{
		return this._componentRegistry;
	}
	
	/**
	 * Set list of css class names for the component
	 */
	this.setComponentCssNames = function ( compTypeId, cssNamesObj )
	{
		var obj = this._componentRegistry [compTypeId];
		if ( obj && obj.flow ) {
			//obj.cssNames = cssNamesObj;
			// fix all local refs.
			fixLocalNames(compTypeId, obj.flow, cssNamesObj);
		}
	}
	
	/**
	 * Local function to fix all local ref to css classes
	 */
	function fixLocalNames ( compTypeId, flowObj, cssNamesObj)
	{
		var nameSuffix = '-' + compTypeId; 
		
		var clname = '';
		var clnameLocal = '';
		var clnameList = '';
		var j, i;
		
		if ( flowObj.class ) {
			var namesArr = flowObj.class.split (' ');
			for ( j=0; j<namesArr.length; j++ ) {
				if ( namesArr[j].length > 0 ) {
					clname = namesArr[j];
					clnameLocal = clname + nameSuffix;
					
					// if declared locally (assume local)
					if ( cssNamesObj ['.'+clnameLocal] != undefined )
						clnameList += clnameLocal + ' ';
					else 
						clnameList += clname + ' ';
				}
			}
			flowObj.class = clnameList.trim();
		}
		
		// now recurse to fix children
		if ( flowObj.items ) {
			for (i=0; i<flowObj.items.length; i++ ) {
				fixLocalNames (compTypeId, flowObj.items[i], cssNamesObj );
			}
		}
	}
	
	/**
	 * Adds a component by object name and object instance
	 * 
	 * compObjName:  name of comp object (such as App.Home)
	 * compObj:      the actual object
	 * userCompName: optional user component name  (home)
	 * 
	 */
	this.addComponent = function (compObjName, compObj, userCompName)
	{
		var id = this._genNewId();
		var typeId = id;
		
		var typeId = this._compKeyByObjName [ compObjName ];
		if ( !typeId ) {
			typeId = id;
		}
		compObj.compObjName = compObjName;
		compObj.compTypeId = typeId;
		compObj.compId = id;
		
		// set component object id
		if ( userCompName )
			compObj.id = userCompName;
		else 
			compObj.id = id;
		
		// add comp by id
		this._componentRegistry [id] = compObj;
		
		// add comp idx by obj name
		if ( typeId == id ) {
			this._compKeyByObjName [ compObjName ] = typeId;
		}
		
		// add comp idx by comp name
		if ( userCompName ) {
			this._compKeyByCompName [ userCompName ] = id;
		}
	}

	/**
	 * Lookup component by id
	 */
	this.getCompByIdOrName = function ( compId )
	{
		if ( isNaN( compId) )
			return this.getCompByName ( compId );
		else
			return this._componentRegistry [ compId ];
	}
	
	/**
	 * Lookup component by id
	 */
	this.getCompById = function ( compId )
	{
		return this._componentRegistry [ compId ];
	}
	
	/**
	 * Get component by compObjName only one per object name (i.e. object class name)
	 */
	this.getCompByObjName = function ( compObjName )
	{
		var idx = this._compKeyByObjName [ compObjName ];
		if ( idx )
			return this._componentRegistry [idx];
		return undefined;
	}
	
	/**
	 * Gets component by user-defined component name
	 */
	this.getCompByName = function ( userCompName )
	{
		var idx = this._compKeyByCompName [ userCompName ];
		if ( idx )
			return this._componentRegistry [idx];
		return undefined;
	}
	
	// gen new ID
	this._genNewId = function ()
	{
		return ++this._maxComponentId;
	}
}

// Create an instance of components manager
SA.comps = new Comps();
;/**
 * Connection handler object
 */
function Connector ( connectUrl, wsListener )
{
	this.ws = undefined; 
	this.connectUrl = connectUrl;
	this.wsListener = wsListener;
	
	this.connect = function ()
	{
		if ("WebSocket" in window) {

			// Let us open a web socket
			this.ws = new WebSocket( this.connectUrl );
			this.ws.onopen = function()
			{
				wsListener.onOpen ();
			};
			this.ws.onmessage = function (evt) 
			{ 
				var receivedMsg = evt.data;
				wsListener.onMessage ( receivedMsg);
			};
			this.ws.onclose = function()
			{ 
				wsListener.onClose ();
			};
		}
		else {
		     // The browser doesn't support WebSocket
		     alert ( "WebSocket NOT supported by your Browser!");
		}
	}
	
	this.setConnectionListener = function ( listener )
	{
		this.wsListener.listener = listener;
	}

	this.sendString = function ( someString )
	{
		if ( this.ws ) {
			this.ws.send ( someString );
			return true;
		}
		else {
			alert ("Not connected yet!");
			return false;
		}
	}

	this.sendJsonObj = function ( jsonMsgObject )
	{
		if ( this.ws ) {
			this.ws.send ( JSON.stringify (jsonMsgObject) );
			return true;
		}
		else {
			alert ("Not connected yet!");
			return false;
		}
	};
};

/**
 * Connection handler
 */
function ConnectListener ()
{
	this.listener = undefined;
	
	this.onOpen = function ()
	{
		console.log ( 'connection open');
	}
	this.onMessage = function ( jsonString )
	{
		if ( this.listener ) {
			var msgObj = JSON.parse(jsonString);
			this.listener.onMessage (msgObj);
		}
	}
	this.onClose = function ()
	{
		console.log ( 'connection closed');
	}
}

// create server connector
SA.connector = new Connector( "ws://localhost:8080/simplq/search", new ConnectListener());

;/**
 * Create events handler object for HQ APPS framework
 */
function Events () 
{
	var eventsQueue = new Array();
	var timerRunning = false;
	
	/**
	 * post an event on a component selector. This method will only fire the event if the component 
	 * exists and then removes the event
	 */
	this.fireEvent = function ( compNameOrId, event )
	{
		//console.debug ( 'req fire event to compId: ' + compNameOrId  );
		
		// add event
		var eventObj = {};
		eventObj.selector = compNameOrId;
		eventObj.event = event;
		eventObj.fc = 0; 
		eventsQueue.push ( eventObj );
		
		// start timer
		startTimer ( timerHandler );
		
		function timerHandler ()
		{
			//console.log ( 'timer queueSize: ' + eventsQueue.length );
			
			//alert ( 'fire all events');
			fireAllEvents ();
			
			if ( eventsQueue.length > 0 ) {
				stopTimer ();
				startTimer ( timerHandler );
			}
			else { 
				stopTimer ();
			}
		}
	}
	
	// internal functions
	function startTimer (handler)
	{
		if ( timerRunning == false ) {
			//alert ( 'start timer');
			setTimeout(handler, 10);
			timerRunning = true;
		}
	}
	
	function stopTimer ()
	{
		timerRunning = false;
	}
	
	function fireAllEvents ()
	{
		for (i=0; i<eventsQueue.length; i++ ) {
			var evt = eventsQueue [i];
			fireEvent ( evt );
		}
		var i = eventsQueue.length;
		while ( i-- ) {
			evt = eventsQueue [i];
			if ( evt.done == true ) {
				eventsQueue.splice (i);
			}
		}
	}
	
	function fireEvent ( evt )
	{
		//alert ( 'fire event');
		
		// if hQA component has handleEvent function, call it
		var comp = SA.comps.getCompByIdOrName ( evt.selector );
		
		//alert ( 'get comp for selector: ' + evt.selector);
		
		if ( comp && comp.handleEvent ) {
			comp.handleEvent ( evt.event );
			evt.done = true;
			return;
		}
		
		// call trigger on js component
		var sel = $('#' + evt.selector);
		if ( sel.length ) {
			sel.trigger( evt.event );
			evt.done = true;
		}
		else {
			evt.fc++;
			if ( evt.fc == 5 ) {
				//console.log ('Warn: cannot fire event for selector name: ' + evt.selector + ', event: ' + evt.event );
				evt.done = true;
			}
		}
	}
}
// create on instance of the events handler object
SA.events = new Events();
;
/**
 * HQAPPS Loader that bootstraps the application 
 */
function Loader ()
{
	/**
	 * This method creates the UI based on the lists provided
	 * 
	 * Note: The config passed in the parentList at this point. If childList is passed, the it is processed
	 * after merged with parent list
	 */
	this._callAllCreateUI = function ( ownerId, list, parentConfig, showAll )
	{
		var result = '';
		if ( parentConfig ) {
			list.config = SA.mergeConfig ( list.config, parentConfig);
		}
		// Attach scope component id to list (if not there)
		if ( list.oid == undefined ) {
			list.oid = ownerId;
		}
		return this.processCreateUI(list, list.config, result, showAll);
	}
	
	/**
	 * Internal method for processing the list UI
	 */ 
	this.processCreateUI = function ( flowList, config, result, showAll )
	{
		// I18N: Resolve string value resources (for now label)
		if ( flowList.label ) {
			flowList.label = SA.res.getValue (flowList.label);
		}
		if ( flowList.value ) {
			flowList.value = SA.res.getValue ( flowList.value );
		}
		
		// a LIST: if there is no 'ac' type then it is a LIST
		if ( !flowList.ac ) {
			
			var forceShow = showAll && showAll==true;
			
			// add list to registry
			SA.comps.putList ( flowList );
			
			// If there is a custom handler, call it
			if ( this.flowHasCustomHandler (flowList) ) {
				var handlerHtml = this.callHandler( flowList, config, forceShow );
				return handlerHtml;
			}
			// If there are members
			else if ( flowList.items )  {
				var html = SA.createHtmlBegin ( flowList, forceShow );

				var itemsOutput = '';
				itemsOutput += html;
				
				// check if list should be hidden
				var hidden = SA._listHidden (flowList, forceShow) ;
				
				// process items list
				var i = 0;
				for ( i = 0; !hidden && i<flowList.items.length; i++ ) {
					
					var obj = flowList.items [ i ];
					
					// attach owner comp id
					obj.oid = flowList.oid;
					
					// process member flow Object
					var handlerUI = this.processCreateUI ( obj, config, result );
					if ( handlerUI ) {
						itemsOutput += handlerUI;
					}
				}
				itemsOutput += SA.createHtmlEnd ( flowList );
				
				// add all items output to result;
				result += itemsOutput;

				return itemsOutput;
			}
			else {
				return SA.createHtmlBegin (flowList, undefined, undefined) + 
					SA.createHtmlEnd (flowList);
			}
		}
		// an ATOM: create UI with object with 'ac' property (atom component)
		else { 
			var compHtml = this.callAtomComp ( flowList, flowList.ac, config )
			return compHtml;
		}
		return result;
	}
	
	/**
	 * getComponentClass (i.e. function) definition based on passed full object class name
	 * @param compClassName
	 * @returns
	 */
	this.getComponentClass = function (compClassName) 
	{
	    var nameParts = compClassName.split('.');
	    var nameLength = nameParts.length;
	    var scope = window;

	    for (var i=0; i<nameLength; ++i) {
	        scope = scope[nameParts[i]];
	    }
	    if ( scope == undefined ) {
	    	alert ("Invalid State: Undefined object: " + compClassName );
	    }
	    // compClassName to define component signature compClassName and id
	    //scope.prototype.compClassName = compClassName;
	    //scope.prototype.compClassId = SA.getComponentId ( compClassName );
	    return scope;
	}
	
	
	this.flowHasCustomHandler = function ( listObj )
	{
		var handler = listObj.lc; 
		return handler && handler.length>0 && handler != 'SA.loader';
	}
	
	this.callAtomComp = function ( atomObj, compName, config )
	{
		// create comp
		var atomComp = this.getComponent ( atomObj.name, atomObj.ac, false );
		
		// get new config merged
		var newConfig = SA.mergeConfig (atomObj.config, config)
		
		// create UI and return it
		return atomComp.createUI ( atomObj, newConfig );
	}
	
	this.callHandler = function ( flowList, config, forceShow )
	{
		// the component is looked up and / or registered here
		var listComp = this.getComponent ( flowList.name, flowList.lc, true );
		
		// merge config??
		
		// if hidden, do not call createUI (however, still create component and register the list by name)
		if ( flowList.config && flowList.config.hidden && forceShow!=true ) {
			//return SA.createHtmlBegin (flowList, undefined, undefined) +  SA.createHtmlEnd (flowList);
			return '';
		}
		else {
			return listComp.createUI ( flowList, config );
		}
	}
	
	this._getHiddenListPanel = function ( flowList, hidden )
	{
		var div = '';
		if ( flowList.name ) {
			return '<div id="' + flowList.name + '" />';
		}
		else {
			return '';
		}
	}
	
	/**
	 * Gets the list handler component or atom component. Not that component name is optional
	 */
	this.getComponent = function ( compName, compObjectName, isList )  
	{
		// get object in lists map
		var handlerObj = SA.comps.getCompByName( compName );
		
		// if comp is not already mapped by list name
		if ( !handlerObj ) {
			
			handlerObj = SA.comps.getCompByObjName [ compObjectName ];
			// if seen component before
			if ( handlerObj ) {
				
				// create new object (if stateful)
				if ( handlerObj.stateful ) {
					var handlerObjClass = this.getComponentClass ( compObjectName );
					handlerObj = new handlerObjClass();
					
					// only add list comp by name to registry
					SA.comps.addComponent ( compObjectName, handlerObj, compName);
				}
			}
			else { // new component  
				// instantiate object
				var handlerObjClass = this.getComponentClass ( compObjectName );
				handlerObj = new handlerObjClass();
			
				// only add list comp by name to registry
				SA.comps.addComponent ( compObjectName, handlerObj, compName);
				
				// load comp specific css list into the DOM (based on component id)
				// _main component will have global CSS defined
				if ( compName != '_main' )
					SA.loadCssIntoDom ( handlerObj.compTypeId, handlerObj.css );			
				
				// if there is a model definition (array of models), add to registry
				if ( handlerObj.model && handlerObj.model.items ) {
					for ( i=0; i<handlerObj.model.items.length; i++ ) {
						var modList = handlerObj.model.items[i];
						SA.comps.putList( modList );	
					}
				}
			}
		}
		return handlerObj;
	}
	
	/**
	 * Handles action
	 */
	this.handleAction = function ( action )
	{
		
	}
}

// Create an instance of the DefaultHandler (or loader)
SA.loader = new Loader();

;
/**
 * HQAPPS resources manager
 */
function Res()
{
	var stringValues = {};
	
	/**
	 * Resolve a resource expression name. 
	 * 
	 * Expression format: TYPE:resName.key  (only supported types are STR)
	 * 
	 * Examples:
	 * STR:faq.title1
	 * STR:faq.title3
	 * STR:faq.desc1
	 */
	this.getValue = function ( resExp )
	{
		if ( resExp.indexOf ('STR:') < 0 ) {
			return resExp;
		}
		var i0 = resExp.indexOf ('.', 4);
		if ( i0 > 0 ) {
			return this.getStrValue ( resExp.substring (4, i0), resExp.substring (i0+1) );
		}
		return resExp;
	}
	
	/**
	 * Gets a resource value from resName and key. 
	 * Note that the resource name if just the resource file name that resides in res/str/resName. The file is assumed 
	 * to have the 'html' extension.  
	 */
	this.getStrValue = function ( resFileName, key, lang)  
	{
		var val = stringValues [ resFileName + '.' + key];  
		if ( val == undefined ) {
			loadResources ( resFileName );
		}
		return stringValues [ resFileName + '.' + key]; 
	}
	
	// Internal functions
	
	/**
	 * Load string resources from file name (only name without path) 
	 */
	function loadResources ( resFileName )
	{
		var content = loadFile ( 'res/str/'+ resFileName + '.html' );
		if ( !content || content.length==0 ) {
			console.log ( "Invalid State: cannot load resource from file: " + resFileName );
		}

		var i0 = content.indexOf ( '<!--KEY:');
		var i1=0;

		while ( true ) {
			if ( i0 >= 0 ) {
				i0 += 8;	// skip <!--KEY:
				i1 = content.indexOf ('-->', i0);
				if ( i1 > 0 ) {
					var key = content.substring ( i0, i1 );
					
					i0 = i1 + 3;
					i1 = content.indexOf ( '<!--KEY:', i0 );
					if ( i1 > 0 ) {
						var val = content.substring (i0, i1);
						
						// add a new string resource
						stringValues [ resFileName + '.' + key.trim() ] = val.trim();
						
						i0 = i1;
						continue;
					}
					else {
						var val = content.substring (i0);
						
						// add a new string resource
						stringValues [ resFileName + '.' + key.trim() ] = val.trim();						
					}
				}
			}
			break;
		}
	}
	
	/**
	 * Loads a file from local repository  
	 */
	function loadFile  ( filePathUrl )
	{
		var content = '';
		$.ajax({
            url : filePathUrl,
            type: 'GET',
            dataType: 'text',  
			async: false,
            success : function (data) {
                content = data;
            },
            error: function (xhr,status,error) {
            	alert ( "Cannot load resource file: " + filePathUrl + ", cause: " +  error);
            }
        });		
		return content;
	}
	
}

// Create an instance of resources manager
SA.res = new Res();
;/**
 * Create events handler object for HQ APPS framework
 */
function Server () 
{
	var hostname = "http://localhost:8888";
	
	/**
	 * set my app urls
	 */
	this.setMyHostName = function ( myHostName ) 
	{
		hostname = myHostName;
	}
	
	/**
	 * Return my host name
	 */
	this.getMyHostName = function ()
	{
		return hostname;
	}
	 
	/**
	 * Helper AJAX post method
	 */
	this.set = function ( rsUrl, obj, successFn )
	{
		rsUrl = hostname + rsUrl;
		
		var jsonStr = JSON.stringify(obj);

		// append session to url
		rsUrl = addSession ( rsUrl );
		
		$.ajax({
			type: getSaveOper(obj),
			url: rsUrl,	
			data: jsonStr,
			success: successFn
		});
	}
	
	/**
	 * Helper AJAX post form method 
	 */
	this.postForm = function ( rsUrl, formData, successFn )
	{
		rsUrl = hostname + rsUrl;
		
		// append session to url
		rsUrl = addSession ( rsUrl );
		
		$.ajax({
			type: "post",
			url: rsUrl,	
			data: formData,
			success: successFn,
			cache: false,
	        contentType: false,
	        processData: false
		});
	}
	
	/**
	 * Helper AJAX post form method 
	 */
	this.putForm = function ( rsUrl, formData, successFn )
	{
		rsUrl = hostname + rsUrl;
		
		// append session to url
		rsUrl = addSession ( rsUrl );
		
		$.ajax({
			type: "put",
			url: rsUrl,	
			data: formData,
			success: successFn,
			cache: false,
	        contentType: false,
	        processData: false
		});
	}

	
	/**
	 * Helper AJAX get method
	 */
	this.get = function ( rsUrl, obj, successFn )
	{
		rsUrl = hostname + rsUrl;
		
		// append session to url
		rsUrl = addSession ( rsUrl );

		// create all name + values on url line
		rsUrl += '?';
		for(var key in obj) {
			rsUrl += ( key + '=' + obj[key] + '&' );
		}
		rsUtl = rsUrl.substring (0, rsUrl.length-1);
		
		// issue get call
		$.ajax({
			type: "get",
			url: rsUrl,	
			success: successFn
		});
	}
	
	/**
	 * Helper AJAX delete method
	 */
	this.del = function ( rsUrl, obj, successFn )
	{
		rsUrl = hostname + rsUrl;
		
		// append session to url
		rsUrl = addSession ( rsUrl );

		// create all name + values on url line
		rsUrl += '?';
		for(var key in obj) {
			rsUrl += ( key + '=' + obj[key] + '&' );
		}
		rsUtl = rsUrl.substring (0, rsUrl.length-1);
		
		// issue get call
		$.ajax({
			type: "delete",
			url: rsUrl,	
			success: successFn
		});
	}
	
	/**
	 * Create media URL
	 */
	this.getMediaUrl = function ( mediaId )
	{
		return hostname + '/media/' + mediaId;
	}

	/**
	 * Gets opers if POST or PUT based on id
	 */
	function getSaveOper ( obj )
	{
		if ( obj.id && obj.id>0 ) {
			return "put";
		}
		return "post";
	}
	
	// Add session to URL 
	function addSession ( url )
	{
		var authObj = SA.getUserAuth();
		if ( authObj ) {
			var session = authObj.jsessionid;

			if ( session && session.length>0 ) {
				url += ';jsessionid=' + session;
			}
		}
		return url;
	}

}

// create on instance of the Server resource handler object
SA.server = new Server();
;
/**
 * HQAPPS misc utils
 */
function Utils()
{
	this.setStorage = function ( name, value ) {
		window.localStorage.setItem(name, value);
	}
	
	this.getStorage = function ( name ) {
		return window.localStorage.getItem ( name );
	}
	
	this.removeStorage = function ( name ) {
		window.localStorage.removeItem( name );
	}

	// COOKIES Should not be used for PhoneGap / Mobile 
	this.setCookie = function (cname, cvalue, exdays) {
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = cname + "=" + cvalue + "; " + expires;
	}
	
	this.getCookie = function (cname) {
	    var name = cname + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0; i<ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1);
	        if (c.indexOf(name) != -1) return c.substring(name.length,c.length);
	    }
	    return "";
	}
	
	this.deleteCookie = function ( cname ) {
		var expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC";
	    document.cookie = cname + "=" + "; " + expires;
	}
	
	/// DEVICE TYPE
	
    var deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : 
    	(navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : 
    		(navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : 
    			(navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "Browser";
    
    var mobileDevice = ! (deviceType == 'Browser');

    this.getDeviceType = function ()
    {
    	return deviceType;
    }
    
    this.isMobileDevice = function ()
    {
    	return mobileDevice;
    }
	
	/// PHOTO STUFF
    
    /**
     * Get photo based on device type
     */
    this.getPhoto = function () 
    {
    	if ( deviceType == 'Browser' ) {
    		
    	}
    	else {
    		this.phoneUseExistingPhoto();
    	}
    }
	
	/**
	 * PHONE: Get photo from source
	 */
	this.phoneUseExistingPhoto = function ( e ) 
	{
		capturePhonePhoto (Camera.PictureSourceType.SAVEDPHOTOALBUM);
	}
	this.phoneTakePhoto = function ( e ) {
		capturePhonePhoto(Camera.PictureSourceType.CAMERA);
	}	
	function capturePhonePhoto (sourceType) 
	{
		navigator.camera.getPicture(this.onCaptureSuccess, this.onCaptureFail, {
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: sourceType,
		    correctOrientation: true
		  });
	}
	
	
	/// List manipulation stuff
	
	this.mergeList = function ( listObj, dataObj ) 
	{
		var items = listObj.items;
		if ( items && items.length > 0 ) {
			
			var j = 0;
			for ( j=0; j<items.length; j++ ) {
				var obj = items [j];
				
				// if atom
				if ( obj.name ) {
					var val = dataObj [ obj.name ];
					if ( val ) {
						obj.value = val;
					}
					else {
						obj.value = '';
					}
				}
			}
		}
		
		// merge config objects
		if ( !listObj.config ) listObj.config = {};
		if ( !dataObj.config ) dataObj.config = {};
		jQuery.extend( listObj.config, dataObj.config );
	}
	
	///
	/// BASE 64 encode
	///
	
	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	this.encode64 = function (input) 
	{
	    var output = "";
	    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
	    var i = 0;

	    input = encodeUtf8(input);

	    while (i < input.length) {

	        chr1 = input.charCodeAt(i++);
	        chr2 = input.charCodeAt(i++);
	        chr3 = input.charCodeAt(i++);

	        enc1 = chr1 >> 2;
	        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	        enc4 = chr3 & 63;

	        if (isNaN(chr2)) {
	            enc3 = enc4 = 64;
	        } else if (isNaN(chr3)) {
	            enc4 = 64;
	        }

	        output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + 
	        	_keyStr.charAt(enc3) + _keyStr.charAt(enc4);

	    }
	    return output;
	}
	
	function encodeUtf8 (string) 
	{
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
	}

	// Trick to reload the browser with local Hash URL (does not go to the server)
	this.localUrl = function (e)
	{
		window.location = e.href;
		window.location.reload (true);
	}
}

// Create an instance of resources manager
SA.utils = new Utils();
;
/**
 * HQAPPS Validation manager
 */
function Validate ()
{
	// possible return values
	var RET_OK = 0;
	var RET_EMPTY = 1;
	var RET_INVALID = 2;
	
	// pattern to define valid email address
	var patEmail = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ ;

	// used if no validator defined  
	var defaultVaidtor = {
		maxWidth: 60,
		validate: function ( value ) 
		{ 
			var ret = RET_EMPTY;
			if ( value ) {
				if ( value != '' && value.length > 0 ) {
					ret = RET_OK;
				}
			}
			return ret;
		}
	}
	
	/**
	 * pattern table validation registry
	 */
	var patternTable = {
			
		email : {
			maxWidth: 150,
			validate: function ( value ) 
			{
				var ret = RET_EMPTY;
				if ( value ) {
					if ( value != '' && value.length > 0 ) {
						ret = patEmail.test (value)? RET_OK : RET_INVALID;
					}
				}
				return ret;
			}
		}	
	};
	
	/**
	 * Eval data object against a flowList
	 */
	this.evalObj = function ( atomList, dataObj )
	{
		for ( i=0; i<atomList.length; i++ ) {
			var atom = atomList [i];
			if ( atom.name ) {
				var val = dataObj [ atom.name ];
				
				var ret = this.eval ( atom.pattern, val );
				if ( ret != RET_OK ) { 
					var label = getLabel (atom);
					
					if ( ret == RET_EMPTY ) {
						if ( atom.required ) {
							// if word required there, remove
							var idx = label.indexOf (' (required)' );
							if ( idx>0 ) {
								label = label.substring (0, idx) + label.substring(idx+11);
							}
							return 'Field "' + label + '" cannot be empty!';
						}
					}
					else {
						return "'" + label + "' is invalid!";
					}
				} 
			}
		}
		return '';
	}
	
	/**
	 * Validate function that works against registered validators
	 * return true if the value is valid 
	 */
	this.eval = function ( pname, value  )
	{
		var vobj = this.getPattern ( pname );
		return vobj.validate ( value );
	}
	
	/**
	 * Get validation pattern for pattern name (such as 'email' )
	 */
	this.getPattern = function ( pname )
	{
		if ( !pname ) pname = '';
		var vobj = patternTable [ pname ];
		if ( vobj )
			return vobj;
		else 
			return defaultVaidtor;
	}
	
	/**
	 * Get label from atom
	 */
	function getLabel ( atom )
	{
		if ( atom.label )
			return atom.label;
		if ( atom.info )
			return atom.info;
		return atom.name;
	}
	
}

// Create an instance of components manager
SA.validate = new Validate();
