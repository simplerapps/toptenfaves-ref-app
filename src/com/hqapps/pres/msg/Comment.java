package com.hqapps.pres.msg;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.hqapps.pres.ReqMsg;
import com.hqapps.util.TypesMap;

public class Comment extends ReqMsg
{	
	public static final String KIND = "Comment";
	
	// Transient max number of comments
	private Integer maxComm;
	private Long timeMs;

	// userId that commented 
	private String userId;
	
	// user name that commented
	private String commentor;

	// commented on item
	private Long itemId = null;
	
	// liked list
	private Long listId = null;		
	
	// actual comment
	private String comment = null;
	
	public Comment () {
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
	public void setItemId(Long itemId) {
		this.itemId = itemId;
	}	
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public Long getListId() {
		return listId;
	}
	public void setListId(Long listId) {
		this.listId = listId;
	}	
	public Date getModified() {
		return modified;
	}
	public void setModified(Date modified) {
		this.modified = modified;
	}
	public String getUserName() {
		return commentor;
	}
	public void setUserName(String userName) {
		this.commentor = userName;
	}	
	
	// Transient max comments (only read from props but not written to props)
	public Integer getMaxComm() {
		return maxComm;
	}
	public void setMaxComm(Integer maxComm) {
		this.maxComm = maxComm;
	}	
	public Long getTimeMs() {
		return timeMs;
	}
	public void setTimeMs(Long timeMs) {
		this.timeMs = timeMs;
	}
	
	@Override
	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();
		props.put("id", id );
		props.put("itemId", itemId);
		props.put("listId", listId);				
		props.put("comment", comment);		
		props.put("modified", modified );
		// commentor info 
		props.put("userId", userId);
		props.put("commentor", commentor );
		return props;
	}
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		setUserId(tm.getStr("userId"));
		setUserName(tm.getStr("commentor"));		
		setListId(tm.getLong("listId") );		
		setItemId(tm.getLong("itemId") );
		setId ( tm.getLong("id") );
		setComment ( tm.getStr("comment") );
		modified = (Date)props.get("modified");

		// transient 
		if ( modified != null )
			setTimeMs(modified.getTime());
		setMaxComm ( tm.getInt("maxComm") );
	}
}
