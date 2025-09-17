package com.hqapps.util;

import java.util.HashMap;
import java.util.Map;

public class TypesMap 
{
	private Map<String,Object> map = null;
	
	public TypesMap ( Map<String,Object> map) 
	{
		this.map = map;
	}  
	
	public String getStr ( String name ) 
	{
		Object val = map.get (name);
		if ( val != null ) {
			return val.toString();
		}
		return null;
	}
	
	public Integer getInt ( String name ) 
	{
		Object val = map.get (name);
		if ( val != null ) {
			if ( val instanceof Integer) {
				return (Integer)val;
			}
			else {
				return Integer.valueOf(val.toString());
			}
		}
		return null;
	}
	
	public Long getLong ( String name ) 
	{
		Object val = map.get (name);
		if ( val != null ) {
			if ( val instanceof Long) {
				return (Long)val;
			}
			else {
				return Long.valueOf(val.toString());
			}
		}
		return null;
	}
	

	public static void main ( String [] args )
	{
		Map<String,Object> map = new HashMap <String,Object>();
		map.put("intval", "200");
		map.put("strval", "200s");
		TypesMap tm = new TypesMap( map );
		
		System.out.println ( "intval: " + tm.getInt("intval") + 
				", strval: " + tm.getStr("strval"));
	}
}

