package com.hqapps.server;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.hqapps.pres.Method;
import com.hqapps.pres.MsgFactory;
import com.hqapps.pres.MsgHandler;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.util.ReqUtils;

import java.io.IOException;
import java.util.Date;
import java.util.logging.Logger;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ResourceServlet extends HttpServlet 
{
	private static final Logger log = Logger.getLogger(ResourceServlet.class.getName());
	
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException 
	{
		resp.setContentType("text/plain");
		String responseJson = null;
		try {
			// get the message
			ReqMsg msg = MsgFactory.getInstance().getRequestMsg(Method.GET, req);
			
			// process it and get response msg result
			RespMsg respMsg = MsgHandler.getInstance().process ( Method.GET, msg, req );
			
			responseJson = respMsg.toJson();
			
			log.info("GET RESP: " + responseJson );
			log.info("---" );
		}
		catch ( Exception ex ) {
			log.warning("Error processing request: " + ex.getLocalizedMessage() );
			ex.printStackTrace();
			
			responseJson = new RespMsg (Status.ERROR, "Internal Error Encountered" ).toJson();
		}
		
		// send result back
		resp.getWriter().println( responseJson );
	}
	
	@Override
	public void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws IOException 
	{
		String responseJson = null;
		try {
			// get the message
			ReqMsg msg = MsgFactory.getInstance().getRequestMsg(Method.POST, req);
			
			// process it and get response msg result
			RespMsg respMsg = MsgHandler.getInstance().process ( Method.POST, msg, req );
			
			responseJson = respMsg.toJson();

			log.info("POST RESP: " + responseJson );
		}
		catch ( Exception ex ) {
			log.warning("Error processing request: " + ex.getLocalizedMessage() );
			ex.printStackTrace();
			
			responseJson = new RespMsg (Status.ERROR, "Internal Error Encountered" ).toJson();
		}
		
		// send result back
		resp.getOutputStream().write( responseJson.getBytes() );
	}
	
	@Override
	public void doPut(HttpServletRequest req, HttpServletResponse resp)
			throws IOException 
	{
		String responseJson = null;
		try {
			// get the message
			ReqMsg msg = MsgFactory.getInstance().getRequestMsg(Method.PUT, req);
			
			// process it and get response msg result
			RespMsg respMsg = MsgHandler.getInstance().process ( Method.PUT, msg, req );
			
			responseJson = respMsg.toJson();

			log.info("resp: " + responseJson );
		}
		catch ( Exception ex ) {
			log.warning("Error processing request: " + ex.getLocalizedMessage() );
			ex.printStackTrace();
			
			responseJson = new RespMsg (Status.ERROR, "Internal Error Encountered" ).toJson();
		}
		
		// send result back
		resp.getOutputStream().write( responseJson.getBytes() );
	}
	
	@Override
	public void doDelete(HttpServletRequest req, HttpServletResponse resp)
			throws IOException 
	{
		String responseJson = null;
		try {
			// get the message
			ReqMsg msg = MsgFactory.getInstance().getRequestMsg(Method.DELETE, req);
			
			// process it and get response msg result
			RespMsg respMsg = MsgHandler.getInstance().process ( Method.DELETE, msg, req );
			
			responseJson = respMsg.toJson();

			log.info("resp: " + responseJson );
		}
		catch ( Exception ex ) {
			log.warning("Error processing request: " + ex.getLocalizedMessage() );
			ex.printStackTrace();
			
			responseJson = new RespMsg (Status.ERROR, "Internal Error Encountered" ).toJson();
		}
		
		// send result back
		resp.getOutputStream().write( responseJson.getBytes() );
	}
	
}
