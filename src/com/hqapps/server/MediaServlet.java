package com.hqapps.server;

import java.io.IOException;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.*;

import com.google.appengine.api.datastore.Entity;
import com.hqapps.entity.EntityManager;
import com.hqapps.pres.msg.Media;

@SuppressWarnings("serial")
public class MediaServlet extends HttpServlet 
{
	private static final Logger log = Logger.getLogger(MediaServlet.class.getName());
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) 
			throws IOException 
	{
		// expect only the media ID
		String path = req.getPathInfo();
		String mediaId = null;
		if ( path != null && path.length() > 1) {
			mediaId = path.substring(1);
		}
		
		EntityManager em = EntityManager.getInstance();
		try {
			Entity entity = em.load ( Long.valueOf(mediaId), Media.KIND );
			Map<String,Object> props = entity.getProperties();
			Media media = new Media ();
			media.fromDataMap(props);
			if ( media.getData() != null ) {
				resp.setContentType(media.getContentType());
				resp.addHeader("Cache-Control", "max-age=3600, must-revalidate");
				resp.getOutputStream().write(media.getData().getBytes());
				resp.getOutputStream().flush();
			}
		}
		catch (Exception e) {
			log.warning("Cannot load Media for id: " + mediaId + ", cause: " + e.getMessage());
		}
	}
}
