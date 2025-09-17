package com.hqapps.pres.handler;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import com.hqapps.entity.EntityManager;
import com.hqapps.pres.Method;
import com.hqapps.pres.ReqMsg;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.RespMsg.Error;
import com.hqapps.pres.RespMsg.Status;
import com.hqapps.pres.msg.User;
import com.hqapps.security.PassReset;
import com.hqapps.security.PasswordHandler;
import com.hqapps.server.ResourceServlet;
import com.google.appengine.api.datastore.Entity;

public class UserProc extends MsgProcessor 
{
	private static final Logger log = Logger.getLogger(MsgProcessor.class.getName());
	
	/**
	 * handle User resource messages
	 * @param method
	 * @param user
	 * @return
	 */
	@Override
	public RespMsg process ( Method method, ReqMsg msg ) 
			throws Exception
	{
		User user = (User)msg;
		EntityManager em = EntityManager.getInstance();
		
		// Read user object (need username and password)
		if ( method == Method.GET ) {
			User authUser = em.auth(user.getEmail(), user.getAuthToken());
			if ( authUser != null ) 
				return new RespMsg ( authUser );
			else 
				return new RespMsg (Status.ERROR, Error.AUTH_FAILURE, "Auth Failure");
		}
		
		// Save user object
		else if ( method == Method.POST ) {
			if ( em.load(user.getEmail(), User.KIND) != null ) {
				return new RespMsg (Status.ERROR, Error.USERNAME_EXISTS, 
						"Username already exists" );
			}
			else if ( user.getResetPassword()!=null && user.getResetPassword()==true ) {
				return resetPassword ( em, user );
			}
			else {
				// // CREATE USER HERE: crypto magic
				String salt = PasswordHandler.getSalt();
				String passwordEnc = PasswordHandler.getSecurePassword(user.getAuthToken(), salt);

				// make sure email (id) is always lower case
				user.setEmail(user.getEmail().toLowerCase());

				Map<String,Object> values = user.toDataMap();
				values.put("authToken", passwordEnc);
				values.put("salt",  salt );
				
				// store the user info
				em.store(user.getEmail(), User.KIND, values);
				
				User authUser = new User();
				authUser.fromDataMap(values);
				return new RespMsg ( authUser );
			}
		}
		
		// method not supported
		return new RespMsg (Status.ERROR, "Error method not supported"  );
	}
	
	/**
	 * Reset password logic
	 * @param em
	 * @param user
	 */
	private RespMsg resetPassword ( EntityManager em, User user )
	{
		try {
			String resetTok = user.getEmail();
			String newPassword = user.getAuthToken();
			
			String decResetTok = PassReset.decodeRecoverToken ( resetTok );
			String email = PassReset.getEmailFromTok ( decResetTok );
			
			 Entity entity = em.load(email, User.KIND);
			 if ( entity == null ) {
				 throw new IllegalArgumentException ( "Not found email address: " + email);
			 }
			 
			 String userSalt = (String)entity.getProperties().get("salt");
			 if ( PassReset.validateRecoverToken(decResetTok, userSalt) != true ) {
				 throw new IllegalArgumentException ( "Invalid recover token " );				 
			 }
			 
			 // UPDATE USER HERE: with new password 
			 String newSalt = PasswordHandler.getSalt();
			 String passwordEnc = PasswordHandler.getSecurePassword(newPassword, newSalt);
			 entity.setProperty("authToken", passwordEnc);
			 entity.setProperty("salt", newSalt);
			 
			 // store the user info
			 em.store(email, User.KIND, entity.getProperties());
			
			 User authUser = new User();
			 authUser.fromDataMap(entity.getProperties());
			 return new RespMsg ( authUser );
		}
		catch ( Exception ex ) {
			log.warning("ERROR: " + ex.getMessage() );
			return new RespMsg (Status.ERROR, "Bad message format"  );
		}
	}
}
