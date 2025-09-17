package com.hqapps.pres.msg;

import java.util.HashMap;
import java.util.Map;

import com.hqapps.pres.ReqMsg;

public class User extends ReqMsg
{	
	public static final String KIND = "User";
	
	// key 
	private String email;  // key is email
	
	private String firstName;
	private String lastName;	
	private String authToken;
	
	// Transient flag
	private Boolean resetPassword;
	
	public User () {
		super (KIND);
	}
	
	public String getEmail() {
		return email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	public String getFirstName() {
		return this.firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	
	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}	

	public String getAuthToken() {
		return authToken;
	}

	public void setAuthToken(String authToken) {
		this.authToken = authToken;
	}
	
	public void fromDataMap ( Map<String,Object> props )
	{
		// IMPORTANT: do no propagate salt
		String emailStr = (String)props.get("email");
		
		email = emailStr.toLowerCase();
		firstName = (String)props.get("firstName");
		lastName = (String)props.get("lastName");
				
		// user password hash as auth token for now
		//authToken = (String)props.get("authToken");
	}

	public Map<String,Object> toDataMap () 
	{
		HashMap<String,Object> props = new HashMap<String,Object>();

		// IMPORTANT: do no propagate password or salt
		props.put("email", email.toLowerCase());
		props.put("authToken", authToken);
		props.put("firstName", firstName );
		props.put("lastName", lastName );
		
		return props;
	}

	public Boolean getResetPassword() {
		return resetPassword;
	}

	public void setResetPassword(Boolean resetPassword) {
		this.resetPassword = resetPassword;
	}
}
