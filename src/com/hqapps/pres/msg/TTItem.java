package com.hqapps.pres.msg;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.hqapps.pres.ReqMsg;
import com.hqapps.util.*;

public class TTItem extends ReqMsg
{	
	public static final String KIND = "TTItem";
	
	// parent list id
	private Long listId = null;
	
	// media id
	private Long mediaId;
	// media external link
	private String mediaUrl;
	
	private String title;
	private String stitle;
	private String info;
	private String link;
	private String lname;
	private Integer index;
	private Integer maxComm;
	
	// transient 
	private Long timeMs;
	
	public TTItem () {
		super (KIND);
	}
	
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getSubtitle() {
		return stitle;
	}

	public void setSubtitle(String stitle) {
		this.stitle = stitle;
	}

	public String getInfo() {
		return info;
	}

	public void setInfo(String info) {
		this.info = info;
	}

	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}
	
	public String getLName() {
		return lname;
	}

	public void setLName(String lname) {
		this.lname = lname;
	}

	public Integer getIndex() {
		return index;
	}

	public void setIndex(Integer index) {
		this.index = index;
	}
	
	// Transient properties (not stored)
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
		props.put("id", id);
		props.put("title", title);
		props.put("stitle", stitle);		
		props.put("info", info );
		props.put("link", link );
		props.put("lname", lname );		
		props.put("index", index );	
		props.put("listId", listId);
		props.put("maxComm", maxComm);
		props.put("mediaId", mediaId);
		props.put("mediaUrl", mediaUrl);
		props.put("modified", modified );		
		return props;
	}	
	
	@Override
	public void fromDataMap (Map<String,Object> props) 
	{
		TypesMap tm = new TypesMap (props);
		
		id = tm.getLong("id");
		title = tm.getStr("title");
		stitle = tm.getStr("stitle");		
		info = tm.getStr("info" );
		link = tm.getStr("link" );
		lname = tm.getStr("lname" );		
		index = tm.getInt("index" );
		listId = tm.getLong ("listId");
		maxComm = tm.getInt("maxComm");
		mediaId = tm.getLong("mediaId");
		mediaUrl = tm.getStr("mediaUrl");
		Date mod = (Date)props.get("modified");
		if ( mod != null ) {
			setTimeMs ( mod.getTime() );
		}
	}

	public Long getMediaId() {
		return mediaId;
	}

	public void setMediaId(Long mediaId) {
		this.mediaId = mediaId;
	}

	public Long getListId() {
		return listId;
	}

	public void setListId(Long listId) {
		this.listId = listId;
	}

	public Integer getMaxComm() {
		return maxComm;
	}

	public void setMaxComm(Integer maxComm) {
		this.maxComm = maxComm;
	}

	public String getMediaLink() {
		return mediaUrl;
	}

	public void setMediaLink(String mediaLink) {
		this.mediaUrl = mediaLink;
	}
}

