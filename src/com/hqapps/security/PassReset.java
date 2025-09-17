package com.hqapps.security;

import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.NoSuchProviderException;
import java.security.SecureRandom;

import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.http.HttpServletRequest;

import com.hqapps.entity.EntityManager;
import com.hqapps.pres.RespMsg;
import com.hqapps.pres.msg.User;
import com.hqapps.server.ResourceServlet;
import com.hqapps.util.Base64Coder;
import com.hqapps.util.ReqUtils;

public class PassReset 
{
	private static final Logger log = Logger.getLogger(PassReset.class.getName());
	
	public static void sendResetEmail ( HttpServletRequest req, User uinfo )
	{
		Properties props = new Properties();
		Session session = Session.getInstance(props);
	
		try {
			String sirName = EntityManager.getInstance().getUserNames(uinfo);
			String fname = uinfo.getFirstName()==null? "user" : uinfo.getFirstName();
			
		    Message msg = new MimeMessage(session);
			msg.setFrom(new InternetAddress( "hqapps.support@gmail.com", "HQAPPS Consulting"));
		    msg.addRecipient(Message.RecipientType.TO,
		    		new InternetAddress(uinfo.getEmail(), sirName));
		    msg.setSubject("Resetting your 'Share 10' password");
		    
		    String resetLink = ReqUtils.getCompleteHost(req) + "/?reset=" + createRecoverToken(
		    		uinfo.getEmail(), uinfo.getAuthToken() );
		    log.warning ("SENT TO name:" + sirName + ", address:"  + uinfo.getEmail() );
		    
		    String body = "Dear " + fname + "\n\nWe are resetting your password based on your request. Here is the reset link: " + resetLink + 
		    		"\n\nIMPORTANT NOTE: If you did not request a password reset link, please do not click on the link and send us an email to: services@hqapps.com" + 
		    		"\n\nBest,\nThe HQAPPS Consulting team";
		    
		    log.warning ("MAIL BODY: " + body );
		    
		    msg.setText( body );
		    Transport.send(msg);
		} 
		catch (UnsupportedEncodingException e) {
			log.log(Level.SEVERE, "Error sending email1", e);
		} 
		catch (AddressException e) {
			log.log(Level.SEVERE, "Error sending email2", e);
		} 
		catch (MessagingException e) {
			log.log(Level.SEVERE, "Error sending email3", e);
		}
		catch ( Exception e ) {
			log.log(Level.SEVERE, "Error sending email4", e);			
		}
	}
	
	public static String decodeRecoverToken ( String token )
	{
		String decoded = Base64Coder.decodeString (token );
		return decoded;
	}
	
	public static String getEmailFromTok ( String decToken )
	{
		int i0 = decToken.indexOf(':');
		int i1 = decToken.indexOf('-', i0+5);
		if ( i0>0 && i1>0 ) {
			return decToken.substring(i0+1, i1 );
		}
		return null;
	}
	
	public static String createRecoverToken ( String email, String userSalt)
	{
		long time = System.currentTimeMillis();
		String timeStr = Long.toHexString(time);
		
		String token = timeStr + ":" + email + "-" + userSalt + timeStr.substring(timeStr.length()-6);
		String tokenEncoded = Base64Coder.encodeString ( token );
		
		System.out.println( "encoded tok=" + tokenEncoded );
		return tokenEncoded;
	}
	
	public static boolean validateRecoverToken ( String decToken, String userSalt )
	{
		int idx = decToken.indexOf('-');
		if ( idx > 0 ) {
			String salt = decToken.substring(idx+1);
			salt = salt.substring(0, salt.length()-6);

			//System.out.println( "decoded tok=" + decoded + ", salt=" + salt );
			return salt.equals(userSalt );
		}
		return false;
	}
	
	public static void main ( String [] args )
	{
		String userSalt = "[B@5ebb55e1"; 
		
		String recoverToken1 = createRecoverToken ( "sami@yahoo.com", userSalt );
		System.out.println( "recoverToken1=" + recoverToken1 );
		
		for ( int i=0; i<100000L; i++ );
		recoverToken1 = createRecoverToken ( "sami@yahoo.com", userSalt );
		System.out.println( "recoverToken1=" + recoverToken1 );
		
		String recoverToken2 = createRecoverToken ( "sami@yahoo.com", userSalt+"1" );
		System.out.println( "recoverToken2=" + recoverToken2 );

		boolean isValid = validateRecoverToken (recoverToken1, userSalt );
		System.out.println( "isValid = " + isValid );
		
		isValid = validateRecoverToken (recoverToken2, userSalt );
		System.out.println( "not isValid = " + isValid );
	}
}
