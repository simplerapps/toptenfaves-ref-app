package com.hqapps.pres.msg;

import java.util.HashMap;
import java.util.Map;

import com.google.appengine.api.datastore.Blob;
import com.hqapps.pres.ReqMsg;
import com.hqapps.util.*;

public class Media extends ReqMsg
{	
	public static final String KIND = "Media";
	
	private String name;
	private Blob data;
	private String contentType;
	private Integer size;

	public Media()  {
		super(KIND);
	}

	@Override
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put("id", id);
		props.put("name", name);
		props.put("data", data);
		props.put("size", size);		
		props.put("contentType", contentType);		
		return props;
	}	
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		id = tm.getLong("id");
		name = tm.getStr("name");
		contentType = tm.getStr("contentType");
		size = tm.getInt("size");
		data = (Blob)props.get("data");
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Blob getData() {
		return data;
	}

	public void setData(Blob data) {
		this.data = data;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public Integer getSize() {
		return size;
	}

	public void setSize(Integer size) {
		this.size = size;
	}

}

