package com.hqapps.pres.msg;

import java.util.HashMap;
import java.util.Map;

import com.hqapps.pres.ReqMsg;


///////// NOT USED /////////

public class Like extends ReqMsg
{	
	public static final String KIND = "Like";

	// userId that liked 
	private String userId;	

	// liked list
	private Long listId = null;	
	
	// liked item
	private Long itemId = null;
	
	// number of times
	private Integer times = 0;
	
	public Like () {
		super (KIND);
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public Long getItemId() {
		return itemId;
	}
	public Integer getTimes() {
		return times;
	}
	public void setTimes(Integer times) {
		this.times = times;
	}	
	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}
	public Long getListId() {
		return listId;
	}
	public void setListId(Long listId) {
		this.listId = listId;
	}	

	@Override
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put("userId", userId);
		props.put("id", id );
		props.put("itemId", itemId);
		props.put("listId", listId);		
		props.put("times", times);		
		return props;
	}	
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		setUserId((String)props.get( "userId") );
		setItemId((Long) props.get( "itemId") );
		setListId((Long) props.get( "listId") );		
		setId ( (Long)props.get("id") );
		setTimes ( (Integer)props.get("times") );
	}

}

