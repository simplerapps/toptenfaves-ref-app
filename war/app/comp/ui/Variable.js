
/**
 * Variable component
 */
App.Variable = function ()
{	
	var atom = undefined;
	
	/**
	 * This method creates the UI based on the lists provided
	 */
	this.createUI = function ( atomObj, allConfig )
	{
		atom = atomObj;
		return '';
	}
	
	this.getName = function ()
	{
		return atom.name;
	}
	
	this.getValue = function ()
	{
		return atom.value;
	}
	
	this.setValue = function (val)
	{
		atom.value = val;
	}
}
