package com.hqapps.pres.msg;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.hqapps.pres.ReqMsg;
import com.hqapps.util.TypesMap;

public class Feedback extends ReqMsg
{	
	public static final String KIND = "Feedback";
	
	// userId that commented 
	private String userId;
	
	// actual comment
	private String msg = null;
	
	// related item id (if == null then it is general message)
	private Long relItemId = null;
	
	public Feedback () {
		super (KIND);
	}

	@Override
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put( "id", id );
		props.put( "modified", modified );
		props.put( "msg", msg );
		props.put( "relItemId", relItemId );
		// commentor info 
		props.put("userId", userId);
		return props;
	}
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setUserId(tm.getStr("userId"));
		setId ( tm.getLong("id") );
		setMsg ( tm.getStr("msg") );
		setRelItemId ( tm.getLong("relItemId") );
		modified = (Date)props.get("modified");
	}
	public String getMsg() {
		return msg;
	}
	public void setMsg(String msg) {
		this.msg = msg;
	}
	public Long getRelItemId() {
		return relItemId;
	}
	public void setRelItemId(Long relItemId) {
		this.relItemId = relItemId;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}		
}
