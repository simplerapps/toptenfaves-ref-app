package com.hqapps.pres;

import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;

import com.google.gson.Gson;
import com.hqapps.pres.msg.Follow;
import com.hqapps.pres.msg.TTItem;
import com.hqapps.pres.msg.TTList;
import com.hqapps.pres.msg.Unknown;
import com.hqapps.pres.msg.User;
import com.hqapps.pres.msg.Comment;
import com.hqapps.pres.msg.Feedback;
import com.hqapps.server.ResourceServlet;
import com.hqapps.util.ReqUtils;

public abstract class MsgFactory 
{
	private static class MsgfactoryImpl extends MsgFactory
	{}
	
	private static MsgFactory instance = new MsgfactoryImpl();
	
	public static MsgFactory getInstance ()
	{
		return instance;
	}
	
	private static final String RES_NONE = "none";
	
	private static final Logger log = Logger.getLogger(ResourceServlet.class.getName());

	// all message listed here
	public static final String RS_USER = "user";
	public static final String RS_TTLIST = "ttlist";
	public static final String RS_TTITEM = "ttitem";
	public static final String RS_FOLLOW = "follow";
	public static final String RS_COMMENT = "comment";
	public static final String RS_FEEDBACK = "feedback";
	
	private static final String MPART_MSG_STRING = "{\"isMultipart\":\"true\"}";
	
	
	public ReqMsg getRequestMsg ( Method method, HttpServletRequest req )
	{
		String resource = null;
		try {
			boolean multipart = false;
			String jsonMsg = null;
			
			if ( method == Method.POST ) {
				String type = req.getContentType();
				multipart = type.startsWith("multipart");
				if ( !multipart )
					jsonMsg = ReqUtils.dataFromStream ( req.getInputStream() );
				else 
					jsonMsg = MPART_MSG_STRING;	// parse msg manually
			}
			else if ( method == Method.PUT ) {
				String type = req.getContentType();
				multipart = type.startsWith("multipart");
				if ( !multipart )
					jsonMsg = ReqUtils.dataFromStream ( req.getInputStream() );
				else 
					jsonMsg = MPART_MSG_STRING;	// parse msg manually
			}
			else if ( method == Method.GET ) {
				jsonMsg = ReqUtils.dataFromParams ( req.getParameterMap() );
			}
			else if ( method == Method.DELETE ) {
				jsonMsg = ReqUtils.dataFromParams ( req.getParameterMap() );				
			}

			resource = getResource ( req);
			if ( !resource.equals( RS_USER ) ) 
				log.info("REQ: resource: /" + resource + ", msg: " + jsonMsg );
			else 
				log.info("REQ: resource: /" + resource + ", msg: xxxxxxxxx ");
			
			Gson gson = new Gson();
			
			if ( resource.equals( RS_USER ) ) {
			    User msg = gson.fromJson(jsonMsg, User.class);
			    msg.setResource (resource);
			    return msg;
			}
			else if ( resource.equals( RS_TTLIST ) ) {
				TTList msg = gson.fromJson(jsonMsg, TTList.class);
				msg.setResource (resource);
				return msg;
			}
			else if ( resource.equals( RS_TTITEM ) ) {
				TTItem msg = gson.fromJson(jsonMsg, TTItem.class);
				msg.setResource (resource);
				return msg;
			}
			else if ( resource.equals( RS_FOLLOW) ) {
				Follow msg = gson.fromJson(jsonMsg, Follow.class);
				msg.setResource (resource);
				return msg;
			}
			else if ( resource.equals( RS_COMMENT) ) {
				Comment msg = gson.fromJson(jsonMsg, Comment.class);
				msg.setResource (resource);
				return msg;
			}
			else if ( resource.equals( RS_FEEDBACK) ) {
				Feedback msg = gson.fromJson(jsonMsg, Feedback.class);
				msg.setResource (resource);
				return msg;
			}									
		}
		catch ( Exception ex ) {
			log.warning("Error encountered processing data: " + ex.getMessage() );
		}

		// not known message / resource
		ReqMsg unkownMsg = new Unknown ();
		unkownMsg.setResource(resource);
		return unkownMsg;
	} 
	
	private String getResource (HttpServletRequest req ) 
	{
		String path = req.getPathInfo();
		if ( path != null ) {
			return path.substring(1);
		}
		return RES_NONE;
	}
	
}

