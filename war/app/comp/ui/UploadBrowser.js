
/**
 * Text Area component
 */
App.UploadBrowser = function () 
{	
	// specify if the component contains state or not
	// TODO: This does not work for scope
	this.stateful = true;

	// remember value entered
	var atomObj = undefined;
	var imgFile = undefined;
	var ytubeUrl = undefined;
	var myId = undefined;
	
	// what to show as default picture
	var defaultPicUrl = 'app/res/img/your-picture.png';
	
	/**
	 * YouTube share URL
	 */
	this.flow = { items: 
		[		
		{name:'youtube-dlg', lc:'App.Dialog', items:
			[
			{name:'youtube-form', lc:'App.FormHandler', 
				config:{title:'Embed YouTube Video', listener:this}, items: 
				[
				{html:'p', style:'font-size:100%', 
					 value:"YouTube video URL (copy and paste video link here)" },				
				{name:'youtubeUrl', ac:'App.TextField', info:'YouTue video URL', required:true, pattern:'text' },
				{html:'div', style:'height:6px;'},
				
			    {cmd:'cmdUTubeUrl', ac:'App.Button', label:'OK', config:{theme:'color'}},
			    {cmd:'cmdUTubeCancel', ac:'App.Button', label:'Cancel', config:{theme:'blank'} },
				{html:'div', style:'height:6px;'}			    
				]
			}
			]
		}
		]
	};	
	
	// CSS defined here exactly the same as css syntax but as javascript array of objects. Also
	// these css class names are unique to this class. For example if another class has the name 'round-clear'
	// it would be a different name because the names are distinguished based on unique class component type ids
	this.css = { items: 
		[
		/* Everything else */
		{name: '@media (min-width: 481px)', items: 
			[
			{name:'.card', value:'margin-bottom:3px; border: 1px solid #dddddd;padding:0px;background-color:#f9f8f7' },			 
			]
		},
		 
		/* Mobile sizes */
		{name: '@media (max-width: 480px)', items: 
			[
			{name:'.card', value:'margin-bottom:1px; border: 1px solid #dddddd;padding:0px;background-color:#f9f8f7' },			 
			]
		}
		]
	};
	
	/**
	 * If defined it will allow this component to create UI based on the lists provided
	 * 
	 * config: 
	 * type: 'password', 'text'
	 * 
	 * child list: atom fields:
	 * info: info inside field
	 * label: label outside field
	 */
	this.createUI = function ( obj, config )
	{
		myId = this.compId;
		atomObj = obj;
		
		// allow dialog to get created
		SA.listCreateUI ( myId, this.flow );
		
		var placeHolder = '';
		var labelStr = '';

		// get info
		if ( atomObj.info ) {
			placeHolder = 'placeholder="' + atomObj.info + '"'; 
		}
		
		// get label
		if ( atomObj.label ) {
			labelStr = '<label class="col-md-3 control-label" for="email">'+ atomObj.label +'</label>';
		}
		
		// EDIT OP: assume the picture URL is in value 
		if ( atomObj.value && atomObj.value.length>0 ) {
			defaultPicUrl = atomObj.value;
			// reset values
			atomObj.value = undefined;	
			imgFle = undefined;
		}
		else {
			defaultPicUrl = 'app/res/img/your-picture.jpg'
		}
		
		var setPT = {name:'set-photo-'+myId, ac:'App.Button', style:'font-size:90%;margin-right:5px;', 
				label:'Set photo', config:{theme:'blank'} };
		var setUT = {name:'set-utube-'+myId, ac:'App.Button', style:'font-size:90%;margin-right:5px;', 
				label:'YouTube', config:{theme:'blank'} };
		
		var remObj = {name:'rem-photo-'+myId, cmd:myId, ac:'App.Button', style:'font-size:90%;', 
				label:'Remove', config:{theme:'blank'} };
		
		var setPTHtml = SA.listCreateUI ( myId, setPT, null, true );
		setPTHtml = SA.injectClass ( setPTHtml, 'needsclick');
		
		var setUTHtml = SA.listCreateUI ( myId, setUT, null, true );
		setUTHtml = SA.injectClass ( setUTHtml, 'needsclick');
		
		//var remHtml = SA.listCreateUI ( myId, remObj, null, true );
		//remHtml = SA.injectClass ( remHtml, 'needsclick');		
		 
		// get local css name (i.e. css name defined in this object)
		var cssCard = SA.localCss(this, 'card');
		
		var mediaHtml = '';
		if ( isEmbedVideoUrl ( defaultPicUrl ) ) {
			mediaHtml = App.util.getYouTubeHtml ( defaultPicUrl );
		}
		else {
			mediaHtml = '<img  class="img-responsive" src="' + defaultPicUrl + '">' ;
		}
		
		var html =
		'<div id="' + myId + '" class="form-group">'+ labelStr + 
			'<div class="col-md-12">' +
				'<div id="preview-div" class="' + cssCard + '">' +
					mediaHtml + 
				'</div>' +
				'<div>' + setPTHtml + 
					'<input type="file" id="file-' + myId + '" style="display:none" />' +
					setUTHtml +
					//remHtml + 
				'</div>'+
			'</div>' +
		'</div>';
		
		return html;
	}

	/*
	 * True for embedded video URL
	 */
	function isEmbedVideoUrl ( url )
	{
		return url.indexOf ('youtu') > 0 ;
	}
	
	/**
	 * getValue() needed for FORM atom component (work with FormHandler)
	 */
	this.getValue = function ()
	{
		if ( ytubeUrl )
			return ytubeUrl;
		return imgFile;
	}
	
	/**
	 * getName() needed for FORM atom component  (work with FormHandler)
	 */
	this.getName = function()
	{
		return atomObj.name
	}
	
	/**
	 * Show a dialog with name
	 */
	function showDialog (  dialogName )
	{
		var dlg = SA.lookupComponent ( dialogName );
		if ( dlg ) {
			dlg.showDialog (true, '', 'appBanner' );
		}
		return dlg;
	}
	
	function hideDialog ()
	{
		var dlg = SA.lookupComponent ( 'youtube-dlg' );
		dlg.showDialog (false, '', 'appBanner');
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
	 * Notify when form is submitted
	 */
	this.notifySubmit = function ( actionAtom, atomList, dataObj )
	{
		if ( actionAtom.cmd == 'cmdUTubeUrl' ) {
			if ( validate ( 'commMsg', atomList, dataObj ) ) {
				ytubeUrl =  dataObj.youtubeUrl;
				var embedHtml = App.util.getYouTubeHtml ( ytubeUrl );
				setPreviewHtml ( embedHtml );
			}
		}
		// hide dialog
		hideDialog ();
	}
	
	/**
	 * Page just loaded this component
	 */
	this.postLoad = function ()
	{
		var $setPhoto = $( '#set-photo-'+myId);
		//var $remPhoto = $( '#rem-photo-'+myId);
		var $upload = $( '#file-'+myId );
		var $setUTube = $( '#set-utube-'+myId);
		
		//disableRemButton ( true );
		
		// set photo click event 
		$setPhoto.click ( function (event) {
			//alert ( 'click :' + event );
			ytubeUrl = undefined;
			$upload.trigger('click');
		});
		
		// set youtube click event 
		$setUTube.click ( function (event) {
			showDialog ( 'youtube-dlg' );
		});
		
		// click on remove
		/*
		$remPhoto.click (function (event) {
			clearImage ();
		});
		*/
		
		// upload photo changed event (when file is opened)
		$upload.change ( function (e) {
			e.preventDefault();

			imgFile = this.files[0],
			reader = new FileReader();
			reader.onload = function (event) {
				setPreviewImg ( event.target.result );
			};
			
			reader.readAsDataURL(imgFile);
			//disableRemButton (false);
			return false;
		});
	}
	
	function clearImage ()
	{
		imgFile = undefined;
		//disableRemButton ( true );
		setPreviewImg ( undefined );
		$( '#file-'+myId ).val ( '' );
	}
	
	/**
	 * Enable / disable rem button
	 */
	function disableRemButton ( enable ) {
		$('#rem-photo-'+myId).prop ('disabled', enable);
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewImg ( newImageSrc ) 
	{
		var html = '';
		
		if ( !newImageSrc ) {
			html = '<img class="img-responsive" src="' + defaultPicUrl + '">';
		}
		else {
			html = '<img class="img-responsive" src="' + newImageSrc + '">';			
		}
		setPreviewHtml ( html );
	}
	
	/**
	 * Set img source to new image
	 */
	function setPreviewHtml ( newHtml ) {
		$('#preview-div').html ( newHtml );
	}	
}
