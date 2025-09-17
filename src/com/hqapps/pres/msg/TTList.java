package com.hqapps.pres.msg;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.hqapps.pres.ReqMsg;
import com.hqapps.util.TypesMap;

public class TTList extends ReqMsg
{	
	public static final String KIND = "TTList";
	
	// User key 
	private String userId;
	
	private String title;
	private String description;
	private String style;
	
	// Followed list id, userId 
	private Long fId;
	private String fUserId;
	
	//// Transient 
	private List<TTItem> items;
	private String user;
	
	public TTList () {
		super (KIND);
	}
	
	public void setItems ( List<TTItem> items ) 
	{
		this.items = items;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getStyle() {
		return style;
	}

	public void setStyle(String style) {
		this.style = style;
	}
	
	public void setModified ( Date modified) {
		this.modified = modified;
	}
	
	public Date getModified () {
		return modified;
	}
	
	public Long getFId() {
		return fId;
	}

	public void setFId(Long fId) {
		this.fId = fId;
	}

	public String getfUserId() {
		return fUserId;
	}

	public void setfUserId(String fUserId) {
		this.fUserId = fUserId;
	}

	/**
	 * This is what is saved into the DB
	 */
	@Override
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put("userId", userId);
		props.put("title", title);
		props.put("description", description );
		props.put("style", style );
		props.put("id", id );
		props.put("modified", modified );
		props.put("fId", fId );
		props.put("fUserId", fUserId );
		return props;
	}	
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		
		setUserId(tm.getStr("userId"));
		setTitle(tm.getStr("title"));
		setDescription(tm.getStr("description"));
		setId ( tm.getLong("id") );
		setModified ( (Date)props.get("modified"));
		
		// user password hash as auth token for now
		setStyle((String)props.get("style"));
		
		setFId (tm.getLong("fId") );
		setfUserId ( tm.getStr("fUserId") );
	}

	// Transient: user names info
	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}
}

