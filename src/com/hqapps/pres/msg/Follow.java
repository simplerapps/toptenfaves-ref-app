package com.hqapps.pres.msg;

import java.util.HashMap;
import java.util.Map;

import com.hqapps.pres.ReqMsg;

////// NOT USED //////

public class Follow extends ReqMsg
{	
	public static final String KIND = "Follow";

	// follower id
	private String userId;	

	// followed list
	private Long listId = null;
	
	// follow list, user 
	private TTList list = null;
	private User user = null;
	
	public Follow () {
		super (KIND);
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
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
		props.put("listId", listId);
		return props;
	}	
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		setUserId((String)props.get("userId"));
		setListId((Long) props.get("listId") );
		setId ( (Long)props.get("id") );
	}
	
	//// Non entity methods to set / get list or user
	
	public TTList getList() {
		return list;
	}
	
	public void setList(TTList list) {
		this.list = list;
	}
	
	public User getUser() {
		return user;
	}
	
	public void setUser(User user) {
		this.user = user;
	}

}

