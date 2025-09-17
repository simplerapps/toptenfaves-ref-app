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

public class ShareServlet extends HttpServlet 
{
	private static final Logger log = Logger.getLogger(ShareServlet.class.getName());
	
	@Override
	public void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws IOException 
	{
		resp.setContentType("text/plain");
		String responseJson = null;
		try {
			// get the message
			log.info("path: " + req.getPathInfo());
			
			log.info("RESPONSE: " + responseJson );
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
}
